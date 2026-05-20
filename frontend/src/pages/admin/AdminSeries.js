import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import { cache } from '../../utils/cache';
import './Admin.css';

const LEGACY_TAGS = ['top-picks', 'recommended', 'new-releases', 'upcoming'];

const emptyForm = {
  title: '',
  description: '',
  genres: [],          // array of selected genres
  director: '',
  releaseYear: new Date().getFullYear(),
  rating: '',
  categories: [],      // legacy tags
  browseCategories: [], // homepage rows
  status: 'upcoming',
  isPremium: false,
};

/* ── Small reusable file-pick button ── */
const FilePickButton = ({ id, label, accept, file, preview, onChange, previewAspect = '16/9' }) => (
  <div className="file-pick-group">
    <input id={id} type="file" accept={accept} style={{ display: 'none' }} onChange={onChange} />
    <label htmlFor={id} className="file-pick-btn">
      <span className="file-pick-icon">↑</span>
      {file ? file.name : label}
    </label>
    {preview && (
      <img
        src={preview}
        alt="preview"
        className="file-pick-preview"
        style={{ aspectRatio: previewAspect }}
      />
    )}
  </div>
);

/* ── Multi-select genre picker — flat chip grid, no dropdown ── */
const GenrePicker = ({ selected, onChange, extraOptions }) => {
  const [search, setSearch] = useState('');

  // Only use categories from DB — no hardcoded suggestions
  const allOptions = [...new Set(extraOptions)].sort();
  const filtered = search.trim()
    ? allOptions.filter(g => g.toLowerCase().includes(search.toLowerCase()))
    : allOptions;

  const toggle = (genre) => {
    onChange(selected.includes(genre)
      ? selected.filter(g => g !== genre)
      : [...selected, genre]);
  };

  const addCustom = () => {
    const val = search.trim();
    if (!val) return;
    // capitalise first letter
    const formatted = val.charAt(0).toUpperCase() + val.slice(1);
    if (!selected.includes(formatted)) onChange([...selected, formatted]);
    setSearch('');
  };

  return (
    <div className="genre-flat-picker">
      {/* Selected summary */}
      {selected.length > 0 && (
        <div className="genre-selected-row">
          {selected.map(g => (
            <span key={g} className="genre-pill-tag">
              {g}
              <button type="button" onClick={() => toggle(g)}>×</button>
            </span>
          ))}
          <button type="button" className="genre-clear-all" onClick={() => onChange([])}>
            Clear all
          </button>
        </div>
      )}

      {/* Search */}
      <div className="genre-search-row">
        <input
          type="text"
          className="genre-search-input"
          placeholder="Search genres or type to add custom..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); addCustom(); }
          }}
        />
        {search.trim() && !allOptions.map(o => o.toLowerCase()).includes(search.trim().toLowerCase()) && (
          <button type="button" className="genre-add-btn" onClick={addCustom}>
            + Add
          </button>
        )}
      </div>

      {/* Chip grid */}
      <div className="genre-chip-grid">
        {filtered.map(g => (
          <button
            key={g}
            type="button"
            className={`genre-chip ${selected.includes(g) ? 'selected' : ''}`}
            onClick={() => toggle(g)}
          >
            {selected.includes(g) && <span className="genre-chip-check">✓</span>}
            {g}
          </button>
        ))}
        {filtered.length === 0 && !search && (
          <span className="genre-no-match">
            No categories yet — create some under Admin → Categories first.
          </span>
        )}
        {filtered.length === 0 && search && (
          <span className="genre-no-match">No match — press Enter to add "{search}"</span>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════ */
const AdminSeries = () => {
  const [tab, setTab] = useState('library');
  const [series, setSeries] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  useEffect(() => { fetchSeries(); fetchCategories(); }, []);

  const fetchSeries = async () => {
    try { const r = await axios.get('/api/admin/series'); setSeries(r.data.data || []); }
    catch (e) { console.error(e); }
  };

  const fetchCategories = async () => {
    try { const r = await axios.get('/api/admin/categories'); setAllCategories(r.data.data || []); }
    catch (e) { console.error(e); }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'thumbnail') { setThumbnailFile(file); setThumbnailPreview(url); }
    else { setBannerFile(file); setBannerPreview(url); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('genre', JSON.stringify(formData.genres));
      data.append('director', formData.director);
      data.append('releaseYear', formData.releaseYear);
      if (formData.rating) data.append('rating', formData.rating);
      data.append('categories', JSON.stringify(formData.categories));
      data.append('browseCategories', JSON.stringify(formData.browseCategories));
      data.append('status', formData.status);
      data.append('isPremium', formData.isPremium);
      if (thumbnailFile) data.append('thumbnail', thumbnailFile);
      if (bannerFile) data.append('banner', bannerFile);

      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editingId) await axios.put(`/api/admin/series/${editingId}`, data, cfg);
      else await axios.post('/api/admin/series', data, cfg);

      resetForm(); cache.invalidateAll(); fetchSeries(); setTab('library');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally { setLoading(false); }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      title: item.title,
      description: item.description || '',
      genres: item.genre || [],
      director: item.director || '',
      releaseYear: item.releaseYear,
      rating: item.rating || '',
      categories: item.categories || [],
      browseCategories: (item.browseCategories || []).map(c => typeof c === 'object' ? c._id : c),
      status: item.status || 'upcoming',
      isPremium: item.isPremium || false,
    });
    setThumbnailPreview(item.thumbnail || null);
    setBannerPreview(item.banner || null);
    setTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setThumbnailFile(null); setBannerFile(null);
    setThumbnailPreview(null); setBannerPreview(null);
  };

  const togglePublish = async (id) => {
    try { await axios.patch(`/api/admin/series/${id}/publish`); fetchSeries(); }
    catch { alert('Error updating series'); }
  };

  const deleteSeries = async (id) => {
    if (!window.confirm('Delete this series and all its episodes?')) return;
    try { await axios.delete(`/api/admin/series/${id}`); fetchSeries(); }
    catch { alert('Error deleting series'); }
  };

  const toggleBrowseCategory = (id) => {
    setFormData(prev => ({
      ...prev,
      browseCategories: prev.browseCategories.includes(id)
        ? prev.browseCategories.filter(v => v !== id)
        : [...prev.browseCategories, id],
    }));
  };

  const toggleLegacyTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(tag)
        ? prev.categories.filter(v => v !== tag)
        : [...prev.categories, tag],
    }));
  };

  const filteredSeries = series.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all'
      || (statusFilter === 'published' && item.isPublished)
      || (statusFilter === 'draft' && !item.isPublished);
    return matchSearch && matchStatus;
  });

  // Category names for genre suggestions
  const categoryNames = allCategories.map(c => c.name);

  return (
    <div className="admin-page">
      <AdminSidebar />
      <div className="admin-container">

        {/* Header */}
        <div className="admin-header">
          <div className="admin-header-left">
            <h1>Series</h1>
            <p>Manage your TV series and movies</p>
          </div>
          <button
            className="btn btn-primary"
            style={{ width: 'auto', flexShrink: 0 }}
            onClick={() => { resetForm(); setTab(tab === 'add' ? 'library' : 'add'); }}
          >
            {tab === 'add' ? '✕ Cancel' : '+ Add Series'}
          </button>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button className={`admin-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
          <button className={`admin-tab ${tab === 'add' ? 'active' : ''}`} onClick={() => { resetForm(); setTab('add'); }}>Add Content</button>
          <button className={`admin-tab ${tab === 'library' ? 'active' : ''}`} onClick={() => setTab('library')}>Content Library</button>
        </div>

        {/* ══ ADD / EDIT FORM ══ */}
        {tab === 'add' && (
          <>
            <div className="admin-only-notice">Admin only</div>
            <h2 className="admin-form-heading">
              {editingId ? 'EDIT SERIES' : 'ADD NEW SERIES'}
            </h2>

            <form onSubmit={handleSubmit} className="admin-form">

              {/* Series Information */}
              <div className="form-section">
                <div className="form-section-title">Series Information</div>
                <div className="form-section-body">

                  <div className="form-row">
                    <div className="form-group">
                      <label>Series Title *</label>
                      <input type="text" placeholder="Enter title..." value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Year *</label>
                      <input type="number" placeholder={new Date().getFullYear()} value={formData.releaseYear}
                        onChange={e => setFormData({ ...formData, releaseYear: e.target.value })} required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea placeholder="Series description..." value={formData.description} rows={4}
                      onChange={e => setFormData({ ...formData, description: e.target.value })} />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Status</label>
                      <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Rating (0–10)</label>
                      <input type="number" step="0.1" min="0" max="10" placeholder="8.5"
                        value={formData.rating} onChange={e => setFormData({ ...formData, rating: e.target.value })} />
                    </div>
                  </div>

                  {/* Genre multi-select */}
                  <div className="form-group">
                    <label>Genre <span style={{ color: 'var(--admin-muted)', fontWeight: 400 }}>(select multiple or type custom)</span></label>
                    <GenrePicker
                      selected={formData.genres}
                      onChange={genres => setFormData({ ...formData, genres })}
                      extraOptions={categoryNames}
                    />
                  </div>

                  <div className="form-group">
                    <label>Director</label>
                    <input type="text" placeholder="Director name" value={formData.director}
                      onChange={e => setFormData({ ...formData, director: e.target.value })} />
                  </div>

                  <label className="checkbox-label">
                    <input type="checkbox" checked={formData.isPremium}
                      onChange={e => setFormData({ ...formData, isPremium: e.target.checked })} />
                    Premium content (requires subscription)
                  </label>
                </div>
              </div>

              {/* Media */}
              <div className="form-section">
                <div className="form-section-title">Media</div>
                <div className="form-section-body">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Poster / Thumbnail URL</label>
                      <input type="text" placeholder="https://..." onChange={e => setThumbnailPreview(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Banner Image URL</label>
                      <input type="text" placeholder="https://..." onChange={e => setBannerPreview(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Poster / Thumbnail File {!editingId && '*'}</label>
                      <FilePickButton
                        id="thumb-upload"
                        label="Choose thumbnail..."
                        accept="image/*"
                        file={thumbnailFile}
                        preview={thumbnailPreview}
                        onChange={e => handleFileChange(e, 'thumbnail')}
                        previewAspect="2/3"
                      />
                    </div>
                    <div className="form-group">
                      <label>Banner Image File</label>
                      <FilePickButton
                        id="banner-upload"
                        label="Choose banner..."
                        accept="image/*"
                        file={bannerFile}
                        preview={bannerPreview}
                        onChange={e => handleFileChange(e, 'banner')}
                        previewAspect="16/9"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Homepage Rows */}
              <div className="form-section">
                <div className="form-section-title">Homepage Visibility</div>
                <div className="form-section-body">
                  <p style={{ fontSize: 12, color: 'var(--admin-muted)', marginBottom: 14 }}>
                    Tag this series to appear in built-in homepage sections:
                  </p>
                  <div className="legacy-tag-group">
                    {LEGACY_TAGS.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        className={`legacy-tag-btn ${formData.categories.includes(tag) ? 'selected' : ''}`}
                        onClick={() => toggleLegacyTag(tag)}
                      >
                        {formData.categories.includes(tag) && <span className="legacy-tag-check">✓</span>}
                        {tag.replace(/-/g, ' ')}
                      </button>
                    ))}
                  </div>

                  {allCategories.length > 0 && (
                    <>
                      <div className="form-section-divider" />
                      <p style={{ fontSize: 12, color: 'var(--admin-muted)', marginBottom: 14 }}>
                        Also appear in these custom homepage rows:
                      </p>
                      <div className="legacy-tag-group">
                        {allCategories.map(cat => (
                          <button
                            key={cat._id}
                            type="button"
                            className={`legacy-tag-btn ${formData.browseCategories.includes(cat._id) ? 'selected' : ''}`}
                            onClick={() => toggleBrowseCategory(cat._id)}
                          >
                            {formData.browseCategories.includes(cat._id) && <span className="legacy-tag-check">✓</span>}
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Form actions — NOT stretched */}
              <div className="form-actions-row">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Series' : 'Create Series')}
                </button>
                <button type="button" className="btn btn-secondary"
                  onClick={() => { resetForm(); setTab('library'); }}>
                  Cancel
                </button>
              </div>

            </form>
          </>
        )}

        {/* ══ OVERVIEW ══ */}
        {tab === 'overview' && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header"><h3>Total Series</h3></div>
              <p className="stat-number">{series.length}</p>
              <span className="stat-detail">{series.filter(s => s.isPublished).length} published</span>
            </div>
            <div className="stat-card">
              <div className="stat-card-header"><h3>Draft</h3></div>
              <p className="stat-number">{series.filter(s => !s.isPublished).length}</p>
              <span className="stat-detail stat-detail--muted">unpublished</span>
            </div>
            <div className="stat-card">
              <div className="stat-card-header"><h3>Categories</h3></div>
              <p className="stat-number">{allCategories.length}</p>
              <span className="stat-detail stat-detail--muted">homepage rows</span>
            </div>
          </div>
        )}

        {/* ══ CONTENT LIBRARY ══ */}
        {tab === 'library' && (
          <>
            <div className="admin-search-bar">
              <input type="text" className="admin-search-input" placeholder="Search series..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              <select className="admin-filter-select" value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="series-grid">
              {filteredSeries.map(item => (
                <div key={item._id} className="series-grid-card">
                  <img src={item.thumbnail || 'https://via.placeholder.com/300x170?text=No+Image'}
                    alt={item.title} className="series-grid-card-image" />
                  <div className="series-grid-card-content">
                    <h3 className="series-grid-card-title">{item.title}</h3>
                    <div className="series-grid-card-meta">
                      <span>{item.releaseYear}</span>
                      <span>{item.totalEpisodes} ep</span>
                      <span>{item.views} views</span>
                    </div>
                    <div className="series-grid-card-meta">
                      {(item.genre || []).slice(0, 2).map((g, i) => (
                        <span key={i} style={{ background: 'rgba(255,255,255,0.07)', padding: '3px 8px', borderRadius: 4, fontSize: 11 }}>{g}</span>
                      ))}
                    </div>
                    <span className={`status-badge ${item.isPublished ? 'active' : 'draft'}`}>
                      {item.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <div className="series-grid-card-actions">
                      <button className="btn-small btn-secondary" onClick={() => handleEdit(item)}>Edit</button>
                      <button className="btn-small btn-secondary" onClick={() => togglePublish(item._id)}>
                        {item.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button className="btn-small btn-danger" onClick={() => deleteSeries(item._id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredSeries.length === 0 && (
                <p className="admin-empty" style={{ gridColumn: '1/-1' }}>No series found.</p>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default AdminSeries;

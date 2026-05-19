import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import './Admin.css';

const AdminSeries = () => {
  const [series, setSeries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    director: '',
    releaseYear: new Date().getFullYear(),
    categories: [],
    browseCategories: [],
    status: 'upcoming'
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  useEffect(() => {
    fetchSeries();
    fetchBrowseCategories();
  }, []);

  const fetchBrowseCategories = async () => {
    try {
      const res = await axios.get('/api/admin/categories');
      setAllCategories(res.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSeries = async () => {
    try {
      const res = await axios.get('/api/admin/series');
      setSeries(res.data.data);
    } catch (error) {
      console.error('Error fetching series:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('genre', JSON.stringify(formData.genre.split(',').map(g => g.trim())));
      data.append('director', formData.director);
      data.append('releaseYear', formData.releaseYear);
      data.append('categories', JSON.stringify(formData.categories));
      data.append('browseCategories', JSON.stringify(formData.browseCategories));
      data.append('status', formData.status);
      
      if (thumbnailFile) data.append('thumbnail', thumbnailFile);
      if (bannerFile) data.append('banner', bannerFile);

      if (editingId) {
        await axios.put(`/api/admin/series/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Series updated successfully!');
      } else {
        await axios.post('/api/admin/series', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Series created successfully!');
      }

      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchSeries();
    } catch (error) {
      alert('Error saving series: ' + error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      title: item.title,
      description: item.description,
      genre: item.genre.join(', '),
      director: item.director || '',
      releaseYear: item.releaseYear,
      categories: item.categories,
      browseCategories: (item.browseCategories || []).map((c) =>
        typeof c === 'object' ? c._id : c
      ),
      status: item.status
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  const togglePublish = async (id) => {
    try {
      await axios.patch(`/api/admin/series/${id}/publish`);
      fetchSeries();
    } catch (error) {
      alert('Error updating series');
    }
  };

  const deleteSeries = async (id) => {
    if (!window.confirm('Delete this series and all its episodes?')) return;
    
    try {
      await axios.delete(`/api/admin/series/${id}`);
      fetchSeries();
    } catch (error) {
      alert('Error deleting series');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      genre: '',
      director: '',
      releaseYear: new Date().getFullYear(),
      categories: [],
      browseCategories: [],
      status: 'upcoming'
    });
    setThumbnailFile(null);
    setBannerFile(null);
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleBrowseCategoryChange = (categoryId) => {
    setFormData((prev) => ({
      ...prev,
      browseCategories: prev.browseCategories.includes(categoryId)
        ? prev.browseCategories.filter((id) => id !== categoryId)
        : [...prev.browseCategories, categoryId],
    }));
  };

  const filteredSeries = series.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'published' && item.isPublished) ||
      (statusFilter === 'draft' && !item.isPublished);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-page">
      <AdminSidebar />
      <div className="admin-container">
        <div className="admin-header">
          <div className="admin-header-left">
            <h1>Series Management</h1>
            <p>Manage your TV series and movies</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ ADD SERIES'}
          </button>
        </div>

        {!showForm && (
          <div className="admin-search-bar">
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search series..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="admin-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="admin-form">
            <h3>{editingId ? 'Edit Series' : 'Add New Series'}</h3>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="4"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Genre (comma separated) *</label>
                <input
                  type="text"
                  placeholder="Drama, Romance, Thriller"
                  value={formData.genre}
                  onChange={(e) => setFormData({...formData, genre: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Director</label>
                <input
                  type="text"
                  value={formData.director}
                  onChange={(e) => setFormData({...formData, director: e.target.value})}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Release Year</label>
                <input
                  type="number"
                  value={formData.releaseYear}
                  onChange={(e) => setFormData({...formData, releaseYear: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Browse categories (homepage rows)</label>
              <div className="checkbox-group">
                {allCategories.length === 0 ? (
                  <p className="admin-hint">Create categories under Admin → Categories first.</p>
                ) : (
                  allCategories.map((cat) => (
                    <label key={cat._id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.browseCategories.includes(cat._id)}
                        onChange={() => handleBrowseCategoryChange(cat._id)}
                      />
                      {cat.name}
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Legacy homepage tags (optional)</label>
              <div className="checkbox-group">
                {['top-picks', 'recommended', 'new-releases', 'upcoming'].map((cat) => (
                  <label key={cat} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(cat)}
                      onChange={() => handleCategoryChange(cat)}
                    />
                    {cat.replace('-', ' ')}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Thumbnail Image {!editingId && '*'}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files[0])}
                  required={!editingId}
                />
              </div>

              <div className="form-group">
                <label>Banner Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBannerFile(e.target.files[0])}
                />
              </div>
            </div>

            <div className="form-row form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Series' : 'Create Series')}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        )}

        {!showForm && (
          <div className="series-grid">
            {filteredSeries.map((item) => (
              <div key={item._id} className="series-grid-card">
                <img 
                  src={item.thumbnail || 'https://via.placeholder.com/300x180?text=No+Image'} 
                  alt={item.title} 
                  className="series-grid-card-image"
                />
                <div className="series-grid-card-content">
                  <h3 className="series-grid-card-title">{item.title}</h3>
                  <div className="series-grid-card-meta">
                    <span>👁 {item.views}</span>
                    <span>📺 {item.totalEpisodes} episodes</span>
                  </div>
                  <div className="series-grid-card-meta">
                    {item.genre.slice(0, 3).map((g, i) => (
                      <span key={i} style={{
                        background: 'rgba(255,255,255,0.1)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}>{g}</span>
                    ))}
                  </div>
                  <span className={`status-badge ${item.isPublished ? 'active' : 'draft'}`}>
                    {item.isPublished ? 'ACTIVE' : 'DRAFT'}
                  </span>
                  <div className="series-grid-card-actions">
                    <button 
                      className="btn-small btn-secondary"
                      onClick={() => handleEdit(item)}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="btn-small btn-secondary"
                      onClick={() => togglePublish(item._id)}
                    >
                      {item.isPublished ? '👁 Unpublish' : '📤 Publish'}
                    </button>
                    <button 
                      className="btn-small btn-danger"
                      onClick={() => deleteSeries(item._id)}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSeries;

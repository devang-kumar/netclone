import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import { uploadToCloudinary } from '../../utils/chunkUpload';
import { cache } from '../../utils/cache';
import './Admin.css';

const emptyForm = { seriesId: '', episodeNumber: 1, title: '', description: '' };

/* ── Reusable custom file-pick button (same as AdminSeries) ── */
const FilePickButton = ({ id, label, accept, file, preview, onChange, icon = '↑', hint }) => (
  <div className="file-pick-group">
    <input id={id} type="file" accept={accept} style={{ display: 'none' }} onChange={onChange} />
    <label htmlFor={id} className={`file-pick-btn ${file ? 'has-file' : ''}`}>
      <span className="file-pick-icon">{icon}</span>
      <span className="file-pick-label">{file ? file.name : label}</span>
    </label>
    {hint && !file && <span className="file-pick-hint">{hint}</span>}
    {preview && (
      <img src={preview} alt="preview" className="file-pick-preview" style={{ aspectRatio: '16/9' }} />
    )}
  </div>
);

/* ── Video pick button — shows file size too ── */
const VideoPickButton = ({ id, file, onChange, hint }) => (
  <div className="file-pick-group">
    <input id={id} type="file" accept="video/*" style={{ display: 'none' }} onChange={onChange} />
    <label htmlFor={id} className={`file-pick-btn video-pick-btn ${file ? 'has-file' : ''}`}>
      <span className="file-pick-icon">▶</span>
      <div className="file-pick-label-group">
        <span className="file-pick-label">{file ? file.name : 'Choose video file...'}</span>
        {file && (
          <span className="file-pick-size">{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
        )}
      </div>
    </label>
    {hint && !file && <span className="file-pick-hint">{hint}</span>}
  </div>
);

const AdminEpisodes = () => {
  const [tab, setTab] = useState('library');
  const [episodes, setEpisodes] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  useEffect(() => { fetchEpisodes(); fetchSeries(); }, []);

  const fetchEpisodes = async () => {
    try { const r = await axios.get('/api/admin/episodes'); setEpisodes(r.data.data || []); }
    catch (e) { console.error(e); }
  };

  const fetchSeries = async () => {
    try { const r = await axios.get('/api/admin/series'); setSeries(r.data.data || []); }
    catch (e) { console.error(e); }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId && !videoFile) { alert('Please select a video file'); return; }
    setLoading(true);
    setUploadProgress(0);

    try {
      let thumbnailUrl = null;
      let videoUrl = null;
      let videoDuration = 0;

      if (thumbnailFile) {
        setUploadStage('Uploading thumbnail...');
        setUploadProgress(5);
        const r = await uploadToCloudinary(
          thumbnailFile, 'ott-platform/thumbnails',
          p => setUploadProgress(Math.round(5 + p * 0.2))
        );
        thumbnailUrl = r.data.url;
      }

      if (videoFile) {
        setUploadStage('Uploading video...');
        setUploadProgress(25);
        const r = await uploadToCloudinary(
          videoFile, 'ott-platform/videos',
          p => setUploadProgress(Math.round(25 + p * 0.7))
        );
        videoUrl = r.data.url;
        videoDuration = r.data.duration || 0;
      }

      setUploadStage('Saving...');
      setUploadProgress(97);

      const payload = {
        seriesId: formData.seriesId,
        episodeNumber: formData.episodeNumber,
        title: formData.title,
        description: formData.description,
        ...(thumbnailUrl && { thumbnail: thumbnailUrl }),
        ...(videoUrl && { videoUrl, duration: videoDuration }),
      };

      if (editingId) await axios.put(`/api/admin/episodes/${editingId}`, payload);
      else await axios.post('/api/admin/episodes', payload);

      setUploadProgress(100);
      setUploadStage('Done!');
      cache.invalidateAll();
      setTimeout(() => { resetForm(); fetchEpisodes(); setTab('library'); }, 600);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setUploadProgress(0);
      setUploadStage('');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      seriesId: item.series?._id || '',
      episodeNumber: item.episodeNumber,
      title: item.title,
      description: item.description || '',
    });
    setThumbnailPreview(item.thumbnail || null);
    setTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setVideoFile(null);
  };

  const togglePublish = async (id) => {
    try { await axios.patch(`/api/admin/episodes/${id}/publish`); fetchEpisodes(); }
    catch { alert('Error updating episode'); }
  };

  const deleteEpisode = async (id) => {
    if (!window.confirm('Delete this episode?')) return;
    try { await axios.delete(`/api/admin/episodes/${id}`); fetchEpisodes(); }
    catch { alert('Error deleting episode'); }
  };

  return (
    <div className="admin-page">
      <AdminSidebar />
      <div className="admin-container">

        {/* Header */}
        <div className="admin-header">
          <div className="admin-header-left">
            <h1>Episodes</h1>
            <p>Upload and manage episodes for your series</p>
          </div>
          <button
            className="btn btn-primary"
            style={{ width: 'auto', flexShrink: 0 }}
            onClick={() => { resetForm(); setTab(tab === 'add' ? 'library' : 'add'); }}
          >
            {tab === 'add' ? '✕ Cancel' : '+ Add Episode'}
          </button>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button className={`admin-tab ${tab === 'add' ? 'active' : ''}`}
            onClick={() => { resetForm(); setTab('add'); }}>
            Add Episode
          </button>
          <button className={`admin-tab ${tab === 'library' ? 'active' : ''}`}
            onClick={() => setTab('library')}>
            All Episodes
          </button>
        </div>

        {/* ══ ADD / EDIT FORM ══ */}
        {tab === 'add' && (
          <>
            <div className="admin-only-notice">Admin only</div>
            <h2 className="admin-form-heading">
              {editingId ? 'EDIT EPISODE' : 'ADD NEW EPISODE'}
            </h2>

            <form onSubmit={handleSubmit} className="admin-form">

              {/* Episode Information */}
              <div className="form-section">
                <div className="form-section-title">Episode Information</div>
                <div className="form-section-body">

                  <div className="form-group">
                    <label>Series *</label>
                    <select
                      value={formData.seriesId}
                      onChange={e => setFormData({ ...formData, seriesId: e.target.value })}
                      required
                    >
                      <option value="">Select a series...</option>
                      {series.map(s => (
                        <option key={s._id} value={s._id}>{s.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Episode Number *</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={formData.episodeNumber}
                        onChange={e => setFormData({ ...formData, episodeNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Episode Title *</label>
                      <input
                        type="text"
                        placeholder="Enter episode title..."
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      placeholder="Brief episode description..."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                </div>
              </div>

              {/* Media */}
              <div className="form-section">
                <div className="form-section-title">Media</div>
                <div className="form-section-body">

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        Thumbnail
                        {editingId
                          ? <span className="label-hint"> — leave empty to keep current</span>
                          : ' *'}
                      </label>
                      <FilePickButton
                        id="ep-thumb-upload"
                        label="Choose thumbnail image..."
                        accept="image/*"
                        file={thumbnailFile}
                        preview={thumbnailPreview}
                        onChange={handleThumbnailChange}
                        hint="JPG, PNG, WEBP · Recommended 16:9"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Video File
                        {editingId
                          ? <span className="label-hint"> — leave empty to keep current</span>
                          : ' *'}
                      </label>
                      <VideoPickButton
                        id="ep-video-upload"
                        file={videoFile}
                        onChange={e => setVideoFile(e.target.files[0])}
                        hint="MP4, MOV, MKV · Any size (chunked upload)"
                      />
                      {editingId && (
                        <span className="file-pick-hint">Uploading a new video will replace the existing one</span>
                      )}
                    </div>
                  </div>

                  {/* Upload progress */}
                  {loading && (
                    <div className="upload-progress-block">
                      <div className="upload-progress-header">
                        <span className="upload-stage-label">{uploadStage}</span>
                        <span className="upload-pct">{uploadProgress}%</span>
                      </div>
                      <div className="upload-progress-bar">
                        <div
                          className="upload-progress-fill"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Actions — not stretched */}
              <div className="form-actions-row">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Uploading...' : editingId ? 'Update Episode' : 'Create Episode'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { resetForm(); setTab('library'); }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>

            </form>
          </>
        )}

        {/* ══ LIBRARY TABLE ══ */}
        {tab === 'library' && (
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Series</th>
                  <th>Ep #</th>
                  <th>Title</th>
                  <th>Views</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {episodes.map(ep => (
                  <tr key={ep._id}>
                    <td>{ep.series?.title || '—'}</td>
                    <td style={{ color: 'var(--admin-muted)' }}>E{ep.episodeNumber}</td>
                    <td>{ep.title}</td>
                    <td style={{ color: 'var(--admin-muted)' }}>{ep.views}</td>
                    <td>
                      <span className={`status-badge ${ep.isPublished ? 'published' : 'draft'}`}>
                        {ep.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button className="btn-small btn-secondary" onClick={() => handleEdit(ep)}>Edit</button>
                        <button className="btn-small btn-secondary" onClick={() => togglePublish(ep._id)}>
                          {ep.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                        <button className="btn-small btn-danger" onClick={() => deleteEpisode(ep._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {episodes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="admin-empty">No episodes yet. Add one above.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminEpisodes;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import { uploadToCloudinary } from '../../utils/chunkUpload';
import './Admin.css';

const AdminEpisodes = () => {
  const [episodes, setEpisodes] = useState([]);
  const [series, setSeries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    seriesId: '',
    episodeNumber: 1,
    title: '',
    description: ''
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  useEffect(() => {
    fetchEpisodes();
    fetchSeries();
  }, []);

  const fetchEpisodes = async () => {
    try {
      const res = await axios.get('/api/admin/episodes');
      setEpisodes(res.data.data);
    } catch (error) {
      console.error('Error fetching episodes:', error);
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
    
    if (!editingId && !videoFile) {
      alert('Please select a video file');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      let thumbnailUrl = null;
      let videoUrl = null;
      let videoDuration = 0;

      // Upload thumbnail if provided
      if (thumbnailFile) {
        setUploadProgress(10);
        const thumbnailResult = await uploadToCloudinary(
          thumbnailFile, 
          'ott-platform/thumbnails',
          (progress) => {
            setUploadProgress(Math.round(10 + (progress * 0.2))); // 10-30%
          }
        );
        thumbnailUrl = thumbnailResult.data.url;
      }

      // Upload video if provided
      if (videoFile) {
        setUploadProgress(30);
        const videoResult = await uploadToCloudinary(
          videoFile,
          'ott-platform/videos',
          (progress) => {
            setUploadProgress(Math.round(30 + (progress * 0.65))); // 30-95%
          }
        );
        videoUrl = videoResult.data.url;
        videoDuration = videoResult.data.duration || 0;
      }

      setUploadProgress(95);

      // Create episode data
      const episodeData = {
        seriesId: formData.seriesId,
        episodeNumber: formData.episodeNumber,
        title: formData.title,
        description: formData.description
      };

      if (thumbnailUrl) episodeData.thumbnail = thumbnailUrl;
      if (videoUrl) {
        episodeData.videoUrl = videoUrl;
        episodeData.duration = videoDuration;
      }

      // Save episode to database
      if (editingId) {
        await axios.put(`/api/admin/episodes/${editingId}`, episodeData);
        alert('Episode updated successfully!');
      } else {
        await axios.post('/api/admin/episodes', episodeData);
        alert('Episode created successfully!');
      }

      setUploadProgress(100);
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchEpisodes();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error saving episode: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      seriesId: item.series?._id || '',
      episodeNumber: item.episodeNumber,
      title: item.title,
      description: item.description
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
      await axios.patch(`/api/admin/episodes/${id}/publish`);
      fetchEpisodes();
    } catch (error) {
      alert('Error updating episode');
    }
  };

  const deleteEpisode = async (id) => {
    if (!window.confirm('Delete this episode?')) return;
    
    try {
      await axios.delete(`/api/admin/episodes/${id}`);
      fetchEpisodes();
    } catch (error) {
      alert('Error deleting episode');
    }
  };

  const resetForm = () => {
    setFormData({
      seriesId: '',
      episodeNumber: 1,
      title: '',
      description: ''
    });
    setThumbnailFile(null);
    setVideoFile(null);
  };

  return (
    <div className="admin-page">
      <AdminSidebar />
      <div className="admin-container">
        <div className="admin-header">
          <div className="admin-header-left">
            <h1>Episode Management</h1>
            <p>Upload and organize episodes</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ ADD EPISODE'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="admin-form">
            <h3>{editingId ? 'Edit Episode' : 'Add New Episode'}</h3>
            
            <div className="form-group">
              <label>Select Series *</label>
              <select
                value={formData.seriesId}
                onChange={(e) => setFormData({...formData, seriesId: e.target.value})}
                required
              >
                <option value="">Choose a series...</option>
                {series.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Episode Number *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.episodeNumber}
                  onChange={(e) => setFormData({...formData, episodeNumber: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Episode Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Thumbnail Image {editingId ? '(Leave empty to keep current)' : '*'}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files[0])}
                  required={!editingId}
                />
              </div>

              <div className="form-group">
                <label>Video File {editingId ? '(Leave empty to keep current video)' : '*'}</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  required={!editingId}
                />
                {editingId && <small style={{color: '#888'}}>Note: Uploading a new video may take time</small>}
              </div>
            </div>

            {loading && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p>
                  {uploadProgress < 30
                    ? `Uploading thumbnail... ${uploadProgress}%`
                    : uploadProgress < 96
                    ? `Uploading video chunks... ${uploadProgress}%`
                    : uploadProgress < 100
                    ? '⏳ Processing & uploading to Cloudinary... please wait'
                    : '✅ Done!'
                  }
                </p>
              </div>
            )}

            <div className="form-row form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Uploading...' : (editingId ? 'Update Episode' : 'Create Episode')}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        )}

        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>SERIES</th>
                <th>EPISODE #</th>
                <th>TITLE</th>
                <th>VIEWS</th>
                <th>PUBLISHED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {episodes.map((episode) => (
                <tr key={episode._id}>
                  <td>{episode.series?.title || 'N/A'}</td>
                  <td>{episode.episodeNumber}</td>
                  <td>{episode.title}</td>
                  <td>{episode.views}</td>
                  <td>
                    <span className={`status-badge ${episode.isPublished ? 'published' : 'draft'}`}>
                      {episode.isPublished ? 'PUBLISHED' : 'DRAFT'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-small btn-secondary"
                      onClick={() => handleEdit(episode)}
                    >
                      ✏️ EDIT
                    </button>
                    <button 
                      className="btn-small btn-secondary"
                      onClick={() => togglePublish(episode._id)}
                    >
                      {episode.isPublished ? 'UNPUBLISH' : 'PUBLISH'}
                    </button>
                    <button 
                      className="btn-small btn-danger"
                      onClick={() => deleteEpisode(episode._id)}
                    >
                      DELETE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminEpisodes;

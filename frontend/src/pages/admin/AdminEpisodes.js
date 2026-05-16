import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const AdminEpisodes = () => {
  const [episodes, setEpisodes] = useState([]);
  const [series, setSeries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
    
    if (!videoFile) {
      alert('Please select a video file');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // 1. Get Signatures for Direct Upload
      const sigRes = await axios.get('/api/admin/upload-signature?folder=ott-platform/episodes');
      const { timestamp, signature, cloudName, apiKey } = sigRes.data;

      const cloudinaryAxios = axios.create(); 
      cloudinaryAxios.defaults.headers.common = {};
      
      let finalThumbnailUrl = '';

      // 2. Upload Thumbnail Directly (if exists)
      if (thumbnailFile) {
        setUploadProgress(10); // Start progress
        const thumbData = new FormData();
        thumbData.append('file', thumbnailFile);
        thumbData.append('api_key', apiKey);
        thumbData.append('timestamp', timestamp);
        thumbData.append('signature', signature);
        thumbData.append('folder', 'ott-platform/episodes');

        const thumbRes = await cloudinaryAxios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          thumbData
        );
        finalThumbnailUrl = thumbRes.data.secure_url;
      }

      // 3. Upload Video Directly
      const videoData = new FormData();
      videoData.append('file', videoFile);
      videoData.append('api_key', apiKey);
      videoData.append('timestamp', timestamp);
      videoData.append('signature', signature);
      videoData.append('folder', 'ott-platform/episodes');

      const videoRes = await cloudinaryAxios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        videoData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 90) / progressEvent.total) + 10;
            setUploadProgress(percentCompleted);
          }
        }
      );

      const uploadedVideo = videoRes.data;

      // 4. Create Episode on our Backend (JSON request now, much faster)
      await axios.post('/api/admin/episodes', {
        seriesId: formData.seriesId,
        episodeNumber: formData.episodeNumber,
        title: formData.title,
        description: formData.description,
        thumbnailUrl: finalThumbnailUrl,
        videoUrl: uploadedVideo.secure_url,
        videoPublicId: uploadedVideo.public_id,
        videoDuration: uploadedVideo.duration
      });

      setUploadProgress(100);
      alert('Episode created successfully!');
      setShowForm(false);
      resetForm();
      fetchEpisodes();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error creating episode: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
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
      <div className="admin-container">
        <div className="admin-header">
          <h1>Manage Episodes</h1>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add New Episode'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="admin-form">
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
                <label>Thumbnail Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files[0])}
                  required
                />
              </div>

              <div className="form-group">
                <label>Video File * (This may take a while)</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  required
                />
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
                <p>Uploading... {uploadProgress}%</p>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Uploading...' : 'Create Episode'}
            </button>
          </form>
        )}

        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Series</th>
                <th>Episode #</th>
                <th>Title</th>
                <th>Views</th>
                <th>Published</th>
                <th>Actions</th>
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
                      {episode.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-small btn-secondary"
                      onClick={() => togglePublish(episode._id)}
                    >
                      {episode.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button 
                      className="btn-small btn-danger"
                      onClick={() => deleteEpisode(episode._id)}
                    >
                      Delete
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

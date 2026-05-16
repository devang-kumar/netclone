import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const AdminSeries = () => {
  const [series, setSeries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    director: '',
    releaseYear: new Date().getFullYear(),
    categories: [],
    status: 'upcoming'
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  useEffect(() => {
    fetchSeries();
  }, []);

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
      data.append('status', formData.status);
      
      if (thumbnailFile) data.append('thumbnail', thumbnailFile);
      if (bannerFile) data.append('banner', bannerFile);

      await axios.post('/api/admin/series', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Series created successfully!');
      setShowForm(false);
      resetForm();
      fetchSeries();
    } catch (error) {
      alert('Error creating series: ' + error.response?.data?.message);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Manage Series</h1>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add New Series'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="admin-form">
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
              <label>Categories</label>
              <div className="checkbox-group">
                {['top-picks', 'recommended', 'new-releases', 'upcoming'].map(cat => (
                  <label key={cat} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(cat)}
                      onChange={() => handleCategoryChange(cat)}
                    />
                    {cat.replace('-', ' ').toUpperCase()}
                  </label>
                ))}
              </div>
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
                <label>Banner Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBannerFile(e.target.files[0])}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Series'}
            </button>
          </form>
        )}

        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Episodes</th>
                <th>Status</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {series.map((item) => (
                <tr key={item._id}>
                  <td>{item.title}</td>
                  <td>{item.totalEpisodes}</td>
                  <td>{item.status}</td>
                  <td>
                    <span className={`status-badge ${item.isPublished ? 'published' : 'draft'}`}>
                      {item.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-small btn-secondary"
                      onClick={() => togglePublish(item._id)}
                    >
                      {item.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button 
                      className="btn-small btn-danger"
                      onClick={() => deleteSeries(item._id)}
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

export default AdminSeries;

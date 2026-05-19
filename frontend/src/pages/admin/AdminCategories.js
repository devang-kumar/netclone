import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import './Admin.css';

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  displayOrder: 0,
  isActive: true,
  showOnHome: true,
  sortBy: 'views',
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/admin/categories');
      setCategories(res.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`/api/admin/categories/${editingId}`, formData);
      } else {
        await axios.post('/api/admin/categories', formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData(emptyForm);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving category');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      displayOrder: cat.displayOrder || 0,
      isActive: cat.isActive,
      showOnHome: cat.showOnHome,
      sortBy: cat.sortBy || 'views',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Series will be unlinked.')) return;
    try {
      await axios.delete(`/api/admin/categories/${id}`);
      fetchCategories();
    } catch (error) {
      alert('Error deleting category');
    }
  };

  return (
    <div className="admin-page">
      <AdminSidebar />
      <div className="admin-container">
        <div className="admin-header">
          <div className="admin-header-left">
            <h1>Categories</h1>
            <p>Create browse categories for the homepage (Netflix-style rows)</p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData(emptyForm);
            }}
          >
            {showForm ? 'Cancel' : '+ Add Category'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="admin-form">
            <h3>{editingId ? 'Edit Category' : 'New Category'}</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Action, K-Drama, Top Picks"
                  required
                />
              </div>
              <div className="form-group">
                <label>Slug (optional)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="auto-generated from name"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="2"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Display order</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, displayOrder: Number(e.target.value) })
                  }
                />
              </div>
              <div className="form-group">
                <label>Sort series by</label>
                <select
                  value={formData.sortBy}
                  onChange={(e) => setFormData({ ...formData, sortBy: e.target.value })}
                >
                  <option value="views">Most viewed</option>
                  <option value="rating">Highest rated</option>
                  <option value="createdAt">Newest</option>
                  <option value="releaseYear">Release year</option>
                </select>
              </div>
            </div>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                Active (visible on site)
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.showOnHome}
                  onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                />
                Show as row on homepage
              </label>
            </div>
            <div className="form-row form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData(emptyForm);
                  }}
                >
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
                <th>Order</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Home row</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id}>
                  <td>{cat.displayOrder}</td>
                  <td>{cat.name}</td>
                  <td><code>{cat.slug}</code></td>
                  <td>{cat.showOnHome ? 'Yes' : 'No'}</td>
                  <td>
                    <span className={`status-badge ${cat.isActive ? 'active' : 'draft'}`}>
                      {cat.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="btn-small btn-secondary" onClick={() => handleEdit(cat)}>
                      Edit
                    </button>
                    <button type="button" className="btn-small btn-danger" onClick={() => handleDelete(cat._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && (
            <p className="admin-empty">No categories yet. Create one to organize your homepage.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;

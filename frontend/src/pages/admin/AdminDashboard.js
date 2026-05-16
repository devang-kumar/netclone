import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalSeries: 0,
    totalEpisodes: 0,
    publishedSeries: 0,
    publishedEpisodes: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [seriesRes, episodesRes] = await Promise.all([
        axios.get('/api/admin/series'),
        axios.get('/api/admin/episodes')
      ]);

      const series = seriesRes.data.data;
      const episodes = episodesRes.data.data;

      setStats({
        totalSeries: series.length,
        totalEpisodes: episodes.length,
        publishedSeries: series.filter(s => s.isPublished).length,
        publishedEpisodes: episodes.filter(e => e.isPublished).length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1>Admin Dashboard</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Series</h3>
            <p className="stat-number">{stats.totalSeries}</p>
            <span className="stat-detail">{stats.publishedSeries} Published</span>
          </div>

          <div className="stat-card">
            <h3>Total Episodes</h3>
            <p className="stat-number">{stats.totalEpisodes}</p>
            <span className="stat-detail">{stats.publishedEpisodes} Published</span>
          </div>
        </div>

        <div className="admin-actions">
          <Link to="/admin/series" className="admin-action-card">
            <h3>📺 Manage Series</h3>
            <p>Create, edit, and manage series</p>
          </Link>

          <Link to="/admin/episodes" className="admin-action-card">
            <h3>🎬 Manage Episodes</h3>
            <p>Upload and manage episodes</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

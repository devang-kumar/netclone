import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiTv, FiFilm, FiTag } from 'react-icons/fi';
import AdminSidebar from '../../components/AdminSidebar';
import './Admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalSeries: 0,
    totalEpisodes: 0,
    publishedSeries: 0,
    publishedEpisodes: 0,
    totalCategories: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [seriesRes, episodesRes, categoriesRes] = await Promise.all([
        axios.get('/api/admin/series'),
        axios.get('/api/admin/episodes'),
        axios.get('/api/admin/categories').catch(() => ({ data: { data: [] } })),
      ]);

      const series = seriesRes.data.data || [];
      const episodes = episodesRes.data.data || [];
      const categories = categoriesRes.data.data || [];

      setStats({
        totalSeries: series.length,
        totalEpisodes: episodes.length,
        publishedSeries: series.filter((s) => s.isPublished).length,
        publishedEpisodes: episodes.filter((e) => e.isPublished).length,
        totalCategories: categories.length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [
    {
      label: 'Total Series',
      value: stats.totalSeries,
      detail: `${stats.publishedSeries} published`,
      icon: FiTv,
    },
    {
      label: 'Total Episodes',
      value: stats.totalEpisodes,
      detail: `${stats.publishedEpisodes} published`,
      icon: FiFilm,
    },
    {
      label: 'Categories',
      value: stats.totalCategories,
      detail: 'Homepage browse rows',
      icon: FiTag,
      muted: true,
    },
  ];

  const actions = [
    {
      to: '/admin/categories',
      icon: FiTag,
      title: 'Manage Categories',
      desc: 'Create homepage rows and filters (Action, Drama, etc.)',
    },
    {
      to: '/admin/series',
      icon: FiTv,
      title: 'Manage Series',
      desc: 'Add shows, thumbnails, and assign categories',
    },
    {
      to: '/admin/episodes',
      icon: FiFilm,
      title: 'Manage Episodes',
      desc: 'Upload videos and publish episodes',
    },
  ];

  return (
    <div className="admin-page">
      <AdminSidebar />
      <div className="admin-container">
        <header className="admin-header">
          <div className="admin-header-left">
            <h1>Dashboard</h1>
            <p>Overview of your streaming catalog. Manage categories, series, and episodes.</p>
          </div>
        </header>

        <section className="stats-grid" aria-label="Statistics">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.label} className="stat-card">
                <div className="stat-card-header">
                  <h3>{card.label}</h3>
                  <div className="stat-icon-wrap">
                    <Icon size={20} />
                  </div>
                </div>
                <p className="stat-number">{card.value}</p>
                <span className={`stat-detail ${card.muted ? 'stat-detail--muted' : ''}`}>
                  {card.detail}
                </span>
              </article>
            );
          })}
        </section>

        <section className="admin-actions" aria-label="Quick actions">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.to} to={action.to} className="admin-action-card">
                <div className="admin-action-icon-wrap">
                  <Icon size={22} />
                </div>
                <h3>{action.title}</h3>
                <p>{action.desc}</p>
              </Link>
            );
          })}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;

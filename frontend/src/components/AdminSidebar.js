import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiTag,
  FiTv,
  FiFilm,
  FiLogOut,
  FiExternalLink,
} from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/admin', icon: FiGrid, label: 'Dashboard', exact: true },
    { path: '/admin/categories', icon: FiTag, label: 'Categories' },
    { path: '/admin/series', icon: FiTv, label: 'Series' },
    { path: '/admin/episodes', icon: FiFilm, label: 'Episodes' },
  ];

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-logo">
        <Link to="/admin">
          <span className="logo-stream">STREAM</span>
          <span className="logo-vault">VAULT</span>
        </Link>
        <span className="admin-badge">Admin Panel</span>
      </div>

      <nav className="admin-nav" aria-label="Admin navigation">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${isActive(item) ? 'active' : ''}`}
            >
              <Icon className="admin-nav-icon" size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-user-profile">
          <div className="admin-user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="admin-user-details">
            <div className="admin-user-name">{user?.name || 'Admin'}</div>
            <div className="admin-user-role">Administrator</div>
          </div>
        </div>
        <Link to="/" className="admin-home-btn">
          <FiExternalLink size={16} />
          View Site
        </Link>
        <button type="button" onClick={handleLogout} className="admin-logout-btn">
          <FiLogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;

import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { cachedGet } from '../utils/cache';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showBrowse, setShowBrowse] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [browseTimeout, setBrowseTimeout] = useState(null);
  const [profileTimeout, setProfileTimeout] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (browseTimeout) clearTimeout(browseTimeout);
      if (profileTimeout) clearTimeout(profileTimeout);
    };
  }, [browseTimeout, profileTimeout]);

  useEffect(() => {
    cachedGet(axios, '/api/categories', 'categories', 5 * 60 * 1000)
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const goCategory = (slug) => {
    setShowBrowse(false);
    if (browseTimeout) clearTimeout(browseTimeout);
    if (slug === 'all') navigate('/');
    else navigate(`/?category=${slug}`);
  };

  const handleBrowseEnter = () => {
    if (browseTimeout) clearTimeout(browseTimeout);
    setShowBrowse(true);
  };

  const handleBrowseLeave = () => {
    const t = setTimeout(() => setShowBrowse(false), 300);
    setBrowseTimeout(t);
  };

  const handleProfileEnter = () => {
    if (profileTimeout) clearTimeout(profileTimeout);
    setShowProfile(true);
  };

  const handleProfileLeave = () => {
    const t = setTimeout(() => setShowProfile(false), 300);
    setProfileTimeout(t);
  };

  const activeCategory = searchParams.get('category');

  return (
    <nav className={`navbar ${scrolled ? 'navbar--solid' : ''}`}>
      <div className="navbar-container">

        {/* LEFT: Logo + nav links */}
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <span className="logo-stream">STREAM</span>
            <span className="logo-vault">VAULT</span>
          </Link>

          <ul className="navbar-menu">
            <li>
              <Link to="/" className="navbar-link">Home</Link>
            </li>
            <li>
              <Link to="/my-list" className="navbar-link">My List</Link>
            </li>
            <li
              className="navbar-dropdown"
              onMouseEnter={handleBrowseEnter}
              onMouseLeave={handleBrowseLeave}
            >
              <button
                type="button"
                className="navbar-link dropdown-btn"
                aria-expanded={showBrowse}
              >
                Browse ▾
              </button>
              {showBrowse && (
                <ul className="dropdown-menu categories-menu">
                  <li>
                    <button type="button" onClick={() => goCategory('all')}>
                      All
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat._id}>
                      <button
                        type="button"
                        className={activeCategory === cat.slug ? 'active' : ''}
                        onClick={() => goCategory(cat.slug)}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </div>

        {/* RIGHT: search + user */}
        <div className="navbar-right">
          {/* Search icon */}
          <button className="navbar-search-btn" aria-label="Search">
            <svg viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>

          {user ? (
            <div className="navbar-user-section">
              <Link to="/subscription" className="subscribe-btn">
                Subscribe
              </Link>

              {/* Profile dropdown */}
              <div
                className="navbar-dropdown"
                onMouseEnter={handleProfileEnter}
                onMouseLeave={handleProfileLeave}
              >
                <button
                  type="button"
                  className="profile-btn"
                  aria-expanded={showProfile}
                >
                  <div className="profile-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="profile-name">{user.name}</span>
                  <span className="dropdown-arrow">▾</span>
                </button>

                {showProfile && (
                  <ul className="dropdown-menu profile-menu">
                    <li>
                      <Link to="/my-list" onClick={() => setShowProfile(false)}>
                        My List
                      </Link>
                    </li>
                    <li>
                      <Link to="/subscription" onClick={() => setShowProfile(false)}>
                        Subscription
                      </Link>
                    </li>
                    {user.role === 'admin' && (
                      <li>
                        <a
                          href="/admin"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShowProfile(false)}
                          className="admin-panel-link"
                        >
                          Admin Panel ↗
                        </a>
                      </li>
                    )}
                    <li className="menu-divider" />
                    <li>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="logout-btn"
                      >
                        Sign out of StreamVault
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-signin">Sign In</Link>
              <Link to="/subscription" className="btn btn-getstarted">Get Started</Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;

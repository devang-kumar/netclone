import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showBrowse, setShowBrowse] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    axios.get('/api/categories')
      .then((res) => setCategories(res.data?.data || []))
      .catch(() => setCategories([]));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const goCategory = (slug) => {
    setShowBrowse(false);
    if (slug === 'all') navigate('/');
    else navigate(`/?category=${slug}`);
  };

  const activeCategory = searchParams.get('category');

  return (
    <nav className={`navbar ${scrolled ? 'navbar--solid' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <span className="logo-stream">STREAM</span>
            <span className="logo-vault">VAULT</span>
          </Link>

          <ul className="navbar-menu">
            <li><Link to="/" className="navbar-link">Home</Link></li>
            <li className="navbar-browse-wrap">
              <button
                type="button"
                className="navbar-link navbar-browse-btn"
                onClick={() => setShowBrowse(!showBrowse)}
                aria-expanded={showBrowse}
              >
                Browse ▾
              </button>
              {showBrowse && categories.length > 0 && (
                <ul className="navbar-browse-menu">
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
            {user?.role === 'admin' && (
              <li><Link to="/admin" className="navbar-link">Admin</Link></li>
            )}
          </ul>
        </div>

        <div className="navbar-right">
          {user ? (
            <>
              <span className="navbar-username">{user.name}</span>
              <button type="button" onClick={handleLogout} className="btn btn-signout">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-signin">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-getstarted">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

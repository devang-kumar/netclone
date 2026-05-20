import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import SeriesCard from '../components/SeriesCard';
import './MyList.css';

const MyList = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchWatchlist = async () => {
      try {
        const res = await axios.get('/api/users/watchlist');
        setWatchlist(res.data.data);
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading your list...</p>
      </div>
    );
  }

  return (
    <div className="my-list-page">
      <div className="my-list-header">
        <div className="header-content">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
          <h1 className="page-title">My List</h1>
          <p className="page-subtitle">
            {watchlist.length} {watchlist.length === 1 ? 'series' : 'series'} in your list
          </p>
        </div>
      </div>

      <div className="my-list-content">
        {watchlist.length > 0 ? (
          <div className="watchlist-grid">
            {watchlist.map((series) => (
              <SeriesCard 
                key={series._id} 
                series={series} 
                showBadge={null}
              />
            ))}
          </div>
        ) : (
          <div className="empty-watchlist">
            <div className="empty-icon">My List</div>
            <h2>Your list is empty</h2>
            <p>Add series to your list to watch them later</p>
            <Link to="/" className="browse-btn">
              Browse Series
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyList;
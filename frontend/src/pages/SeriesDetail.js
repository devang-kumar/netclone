import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './SeriesDetail.css';

const SeriesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [series, setSeries] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  useEffect(() => {
    const fetchSeriesDetails = async () => {
      try {
        const res = await axios.get(`/api/series/${id}`);
        setSeries(res.data.data.series);
        setEpisodes(res.data.data.episodes);
        
        // Check if series is in user's watchlist
        if (user) {
          try {
            const watchlistRes = await axios.get('/api/users/watchlist');
            const isInWatchlist = watchlistRes.data.data.some(item => item._id === id);
            setInWatchlist(isInWatchlist);
          } catch (error) {
            console.error('Error checking watchlist:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching series:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeriesDetails();
  }, [id, user]);

  const handleWatchlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setWatchlistLoading(true);
    try {
      if (inWatchlist) {
        await axios.delete(`/api/users/watchlist/${id}`);
        setInWatchlist(false);
      } else {
        await axios.post(`/api/users/watchlist/${id}`);
        setInWatchlist(true);
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
      // Show error message to user
      alert(error.response?.data?.message || 'Error updating watchlist');
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handlePlayEpisode = (episodeId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/watch/${episodeId}`);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!series) {
    return <div className="loading">Series not found</div>;
  }

  return (
    <div className="series-detail">
      {/* Hero Section */}
      <div className="series-hero">
        <div className="series-hero-overlay" aria-hidden="true" />
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <div className="series-hero-content">
          <h1 className="series-hero-title">{series.title}</h1>
          
          <div className="series-hero-meta">
            <span className="series-year">{series.releaseYear}</span>
            <span className="series-seasons">{series.totalEpisodes} Episodes</span>
            {(series.genre || []).slice(0, 2).map((g, i) => (
              <span key={i} className="series-genre-badge">{g}</span>
            ))}
          </div>

          <p className="series-hero-description">{series.description}</p>

          <div className="series-hero-actions">
            {episodes.length > 0 && (
              <button 
                className="btn-watch"
                onClick={() => handlePlayEpisode(episodes[0]._id)}
              >
                <span className="play-icon">▶</span> Watch Now
              </button>
            )}
            <button 
              className={`btn-list ${inWatchlist ? 'in-watchlist' : ''}`}
              onClick={handleWatchlist}
              disabled={watchlistLoading}
            >
              <span className="list-icon">
                {watchlistLoading ? '...' : inWatchlist ? '✓' : '+'}
              </span> 
              {inWatchlist ? 'In My List' : 'My List'}
            </button>
          </div>
        </div>
      </div>

      {/* Episodes Section */}
      <div className="episodes-section">
        <h2 className="episodes-title">EPISODES</h2>
        
        <div className="episodes-list">
          {episodes.map((episode, index) => (
            <div 
              key={episode._id} 
              className="episode-item"
              onClick={() => handlePlayEpisode(episode._id)}
            >
              <div className="episode-number">{index + 1}</div>
              
              <div className="episode-thumbnail">
                <img src={episode.thumbnail} alt={episode.title} />
                <div className="episode-play-overlay">
                  <div className="play-icon-small">▶</div>
                </div>
              </div>

              <div className="episode-info">
                <h3 className="episode-title">{episode.title}</h3>
                <p className="episode-description">{episode.description}</p>
              </div>

              <div className="episode-duration">
                {Math.floor(episode.video.duration / 60)}m
              </div>

              <div className="episode-arrow">›</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeriesDetail;

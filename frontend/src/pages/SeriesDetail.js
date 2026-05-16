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

  useEffect(() => {
    fetchSeriesDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchSeriesDetails = async () => {
    try {
      const res = await axios.get(`/api/series/${id}`);
      setSeries(res.data.data.series);
      setEpisodes(res.data.data.episodes);
    } catch (error) {
      console.error('Error fetching series:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

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
      <div 
        className="series-banner" 
        style={{ backgroundImage: `url(${series.banner || series.thumbnail})` }}
      >
        <div className="series-banner-overlay">
          <div className="series-info">
            <h1>{series.title}</h1>
            <div className="series-meta">
              <span>{series.releaseYear}</span>
              <span>{series.totalEpisodes} Episodes</span>
              <span>Rating: {series.rating}/10</span>
            </div>
            <p className="series-description">{series.description}</p>
            <div className="series-genres">
              {series.genre.map((g, index) => (
                <span key={index} className="genre-tag">{g}</span>
              ))}
            </div>
            <div className="series-actions">
              {episodes.length > 0 && (
                <button 
                  className="btn btn-primary"
                  onClick={() => handlePlayEpisode(episodes[0]._id)}
                >
                  ▶ Play Episode 1
                </button>
              )}
              <button 
                className="btn btn-secondary"
                onClick={handleWatchlist}
              >
                {inWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="episodes-section">
        <h2>Episodes</h2>
        <div className="episodes-grid">
          {episodes.map((episode) => (
            <div 
              key={episode._id} 
              className="episode-card"
              onClick={() => handlePlayEpisode(episode._id)}
            >
              <img src={episode.thumbnail} alt={episode.title} />
              <div className="episode-info">
                <h3>Episode {episode.episodeNumber}</h3>
                <p className="episode-title">{episode.title}</p>
                <p className="episode-description">{episode.description}</p>
                <p className="episode-duration">
                  {Math.floor(episode.video.duration / 60)} min
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeriesDetail;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SeriesCard.css';

const SeriesCard = ({ series, showBadge }) => {
  const navigate = useNavigate();

  const getBadgeClass = (badge) => {
    switch(badge) {
      case 'Top Pick': return 'badge-top-pick';
      case 'New': return 'badge-new';
      case 'Upcoming': return 'badge-upcoming';
      case 'Recommended': return 'badge-recommended';
      default: return 'badge-top-pick';
    }
  };

  return (
    <div className="series-card" onClick={() => navigate(`/series/${series._id}`)}>
      <img 
        src={series.thumbnail} 
        alt={series.title} 
        className="series-card-image" 
      />
      
      <div className="series-card-badges">
        {showBadge && (
          <span className={`badge ${getBadgeClass(showBadge)}`}>
            {showBadge}
          </span>
        )}
        {series.isPremium && (
          <span className="badge badge-premium">
            <span>👑</span> Premium
          </span>
        )}
      </div>

      <div className="series-card-play">
        <div className="play-triangle"></div>
      </div>

      <div className="series-card-overlay">
        <h3 className="series-card-title">{series.title}</h3>
        <div className="series-card-meta">
          <span>{series.releaseYear}</span>
          <span>•</span>
          <span>S{series.totalEpisodes || 1}</span>
          {series.rating && (
            <>
              <span>•</span>
              <span className="series-card-rating">
                <span>⭐</span> {series.rating}
              </span>
            </>
          )}
        </div>
        <div className="series-card-genres">
          {(series.genre || []).slice(0, 2).map((g, i) => (
            <span key={i} className="genre-tag">{g}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeriesCard;

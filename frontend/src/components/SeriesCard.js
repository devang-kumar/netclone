import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SeriesCard.css';

const SeriesCard = ({ series, showBadge }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => navigate(`/series/${series?._id}`);
  const seasonLabel = series?.season ? `S${series.season}` : 'S1';
  const hasImage = series?.thumbnail && 
    !imageError && 
    series.thumbnail.startsWith('http');

  return (
    <div className="series-card" onClick={handleClick}>

      {/* Image wrapper — always 2:3 */}
      <div className="series-card-image-wrapper">

        {/* Placeholder: shown while loading or if no image */}
        {(!imageLoaded || !hasImage) && (
          <div className="series-card-placeholder">
            {hasImage ? (
              <div className="placeholder-shimmer" />
            ) : (
              <span className="placeholder-title">
                {series?.title?.charAt(0)?.toUpperCase() || '?'}
              </span>
            )}
          </div>
        )}

        {/* Actual image */}
        {hasImage && (
          <img
            src={series.thumbnail}
            alt={series?.title}
            className="series-card-image"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            style={{ opacity: imageLoaded ? 1 : 0 }}
            loading="lazy"
          />
        )}

        {/* Badge */}
        {showBadge && (
          <span className="series-card-badge">{showBadge}</span>
        )}
      </div>

      {/* Info panel */}
      <div className="series-card-info">
        <h3 className="series-card-title">{series?.title}</h3>

        <div className="series-card-meta">
          <span className="series-card-year">
            {series?.releaseYear || '2024'} · {seasonLabel}
          </span>
          {series?.rating ? (
            <span className="series-card-rating">
              <span className="star">★</span>
              {series.rating}
            </span>
          ) : null}
        </div>

        {series?.genre?.length > 0 && (
          <div className="series-card-genres">
            {series.genre.slice(0, 2).map((g, i) => (
              <span key={i} className="series-card-genre-pill">{g}</span>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default SeriesCard;

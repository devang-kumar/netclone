import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SeriesCard.css';

const SeriesCard = ({ series }) => {
  const navigate = useNavigate();

  return (
    <div className="series-card" onClick={() => navigate(`/series/${series?._id}`)}>
      <img src={series?.thumbnail} alt={series?.title} className="series-card-image" />
      <div className="series-card-overlay">
        <h3>{series?.title}</h3>
        <p className="series-card-info">
          {series?.releaseYear} • {series?.totalEpisodes} Episodes
        </p>
        <p className="series-card-genre">
          {series?.genre?.join(', ')}
        </p>
      </div>
    </div>
  );
};

export default SeriesCard;

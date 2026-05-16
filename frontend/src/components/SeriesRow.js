import React from 'react';
import SeriesCard from './SeriesCard';
import './SeriesRow.css';

const SeriesRow = ({ title, series }) => {
  return (
    <div className="series-row">
      <h2 className="series-row-title">{title}</h2>
      <div className="series-row-container">
        {series && series.length > 0 ? (
          series.map((item) => (
            <SeriesCard key={item._id} series={item} />
          ))
        ) : (
          <div className="no-content-container">
            <p className="no-content">New episodes arriving soon. Stay tuned!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeriesRow;

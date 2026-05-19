import React from 'react';
import SeriesCard from './SeriesCard';
import './SeriesRow.css';

const SeriesRow = ({ title, series, showBadge }) => {
  return (
    <div className="series-row">
      <h2 className="series-row-title">{title}</h2>
      <div className="series-row-container">
        {series.length > 0 ? (
          series.map((item) => (
            <SeriesCard key={item._id} series={item} showBadge={showBadge} />
          ))
        ) : (
          <p className="no-content">No content available</p>
        )}
      </div>
    </div>
  );
};

export default SeriesRow;

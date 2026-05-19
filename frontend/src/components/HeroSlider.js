import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSlider.css';

const HeroSlider = ({ series }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentIndex(0);
  }, [series]);

  useEffect(() => {
    if (!series || series.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % series.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [series]);

  const goToSlide = (index) => {
    if (!series || series.length === 0) return;
    setCurrentIndex(index % series.length);
  };

  const nextSlide = () => {
    if (!series || series.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % series.length);
  };

  const prevSlide = () => {
    if (!series || series.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + series.length) % series.length);
  };

  if (!series || series.length === 0) {
    return null;
  }

  const currentSeries = series[currentIndex] || series[0];
  if (!currentSeries) {
    return null;
  }

  return (
    <div className="hero-slider">
      <div 
        className="hero-slide"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8) 40%, transparent), 
                           linear-gradient(to top, rgba(0,0,0,0.8), transparent),
                           url(${currentSeries.banner || currentSeries.thumbnail})`
        }}
      >
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-top-pick">Top Pick</span>
            <span className="hero-rating">
              <span className="star">⭐</span> {currentSeries.rating || '8.3'}
            </span>
          </div>

          <h1 className="hero-title">{currentSeries.title}</h1>

          <div className="hero-meta">
            <span>{currentSeries.releaseYear || '2024'}</span>
            <span>•</span>
            <span>{currentSeries.totalEpisodes} Episodes</span>
            <span>•</span>
            <span>{(currentSeries.genre || []).slice(0, 2).join(', ')}</span>
          </div>

          <p className="hero-description">
            {currentSeries.description}
          </p>

          <div className="hero-actions">
            <button 
              className="btn-hero btn-play"
              onClick={() => navigate(`/series/${currentSeries._id}`)}
            >
              <span className="play-icon">▶</span> Play Now
            </button>
            <button 
              className="btn-hero btn-info"
              onClick={() => navigate(`/series/${currentSeries._id}`)}
            >
              <span className="info-icon">ⓘ</span> More Info
            </button>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button className="hero-arrow hero-arrow-left" onClick={prevSlide}>
          ‹
        </button>
        <button className="hero-arrow hero-arrow-right" onClick={nextSlide}>
          ›
        </button>

        {/* Slide Indicators */}
        <div className="hero-indicators">
          {series.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;

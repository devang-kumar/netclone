import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSlider.css';

const HeroSlider = ({ series }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [muted, setMuted] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  const handleSlideChange = useCallback((newIndexOrFunction) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    const newIndex = typeof newIndexOrFunction === 'function' 
      ? newIndexOrFunction(currentIndex) 
      : newIndexOrFunction;
    
    // Start slide transition
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsTransitioning(false);
    }, 500); // Half of the transition duration
  }, [currentIndex, isTransitioning]);

  useEffect(() => {
    setCurrentIndex(0);
    setIsLoaded(false);
    setTimeout(() => setIsLoaded(true), 100);
  }, [series]);

  useEffect(() => {
    if (!series || series.length === 0) return;

    const interval = setInterval(() => {
      handleSlideChange((prev) => (prev + 1) % series.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [series, handleSlideChange]);

  const goToSlide = (index) => {
    if (!series || series.length === 0 || index === currentIndex) return;
    handleSlideChange(index % series.length);
  };

  const nextSlide = () => {
    if (!series || series.length === 0) return;
    handleSlideChange((prev) => (prev + 1) % series.length);
  };

  const prevSlide = () => {
    if (!series || series.length === 0) return;
    handleSlideChange((prev) => (prev - 1 + series.length) % series.length);
  };

  if (!series || series.length === 0) {
    return null;
  }

  const currentSeries = series[currentIndex] || series[0];
  if (!currentSeries) {
    return null;
  }

  return (
    <div className={`hero-slider ${isLoaded ? 'loaded' : ''}`}>
      <div className="hero-background-container">
        {/* Background Image with Smooth Slide Effect */}
        <div 
          className={`hero-background ${isTransitioning ? 'slide-out' : 'slide-in'}`}
          style={{
            backgroundImage: `url(${currentSeries.banner || currentSeries.thumbnail})`
          }}
        />
        
        {/* Multiple Gradient Overlays for Netflix Effect */}
        <div className="hero-overlay-primary"></div>
        <div className="hero-overlay-secondary"></div>
        <div className="hero-overlay-vignette"></div>
        <div className="hero-overlay-bottom"></div>
      </div>

      <div className="hero-slide">
        <div className="hero-content">
          {/* Netflix-style Badge */}
          <div className="hero-badges">
            <div className="netflix-badge">
              <span className="badge-n">N</span>
              <span className="badge-text">SERIES</span>
            </div>
            <div className="content-badges">
              <span className="badge top-pick">#1 in TV Shows Today</span>
              <div className="rating-badge">
                <span className="rating-number">{currentSeries.rating || '98'}</span>
                <span className="rating-text">% Match</span>
              </div>
            </div>
          </div>

          {/* Title with Animation */}
          <h1 className="hero-title">
            <span className="title-main">{currentSeries.title}</span>
          </h1>

          {/* Meta Information */}
          <div className="hero-meta">
            <span className="year">{currentSeries.releaseYear || '2024'}</span>
            <span className="age-rating">16+</span>
            <span className="episodes">{currentSeries.totalEpisodes} Episodes</span>
            <span className="quality">4K Ultra HD</span>
            <div className="genre-tags">
              {(currentSeries.genre || []).slice(0, 3).map((genre, index) => (
                <span key={index} className="genre-tag">{genre}</span>
              ))}
            </div>
          </div>

          {/* Description */}
          <p className="hero-description">
            {currentSeries.description}
          </p>

          {/* Action Buttons */}
          <div className="hero-actions">
            <button 
              className="btn-hero btn-play"
              onClick={() => navigate(`/series/${currentSeries._id}`)}
            >
              <svg className="play-icon" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Play
            </button>
            <button 
              className="btn-hero btn-info"
              onClick={() => navigate(`/series/${currentSeries._id}`)}
            >
              <svg className="info-icon" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              More Info
            </button>
            <button 
              className="btn-hero btn-sound"
              onClick={() => setMuted(!muted)}
            >
              <svg className="sound-icon" viewBox="0 0 24 24">
                {muted ? (
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                ) : (
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Arrows */}
        {series.length > 1 && (
          <>
            <button className="hero-arrow hero-arrow-left" onClick={prevSlide}>
              <svg viewBox="0 0 24 24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <button className="hero-arrow hero-arrow-right" onClick={nextSlide}>
              <svg viewBox="0 0 24 24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>
          </>
        )}

        {/* Slide Indicators */}
        {series.length > 1 && (
          <div className="hero-indicators">
            {series.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        )}

        {/* Age Rating Overlay */}
        <div className="age-rating-overlay">
          <span>16+</span>
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
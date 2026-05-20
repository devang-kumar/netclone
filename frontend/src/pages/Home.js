import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSearchParams, Link } from 'react-router-dom';
import HeroSlider from '../components/HeroSlider';
import SeriesRow from '../components/SeriesRow';
import { cachedGet } from '../utils/cache';
import './Home.css';

const Home = () => {
  const [homeRows, setHomeRows] = useState([]);
  const [browseCategories, setBrowseCategories] = useState([]);
  const [filteredSeries, setFilteredSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const activeSlug = searchParams.get('category') || 'all';

  const loadHomeData = useCallback(async () => {
    try {
      const [homeData, catsData] = await Promise.all([
        cachedGet(axios, '/api/categories/home', 'home-rows', 3 * 60 * 1000),
        cachedGet(axios, '/api/categories', 'categories', 5 * 60 * 1000),
      ]);
      setHomeRows(Array.isArray(homeData) ? homeData : []);
      setBrowseCategories(Array.isArray(catsData) ? catsData : []);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  useEffect(() => {
    if (activeSlug === 'all') {
      setFilteredSeries([]);
      return;
    }

    const fetchFiltered = async () => {
      setFilterLoading(true);
      try {
        const data = await cachedGet(
          axios,
          `/api/categories/${activeSlug}/series`,
          `cat-series:${activeSlug}`,
          2 * 60 * 1000
        );
        setFilteredSeries(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error filtering category:', error);
        setFilteredSeries([]);
      } finally {
        setFilterLoading(false);
      }
    };

    fetchFiltered();
  }, [activeSlug]);

  const getFeaturedSeries = () => {
    if (activeSlug !== 'all') {
      return filteredSeries.slice(0, 4);
    }
    for (const row of homeRows) {
      if (row.series?.length > 0) return row.series.slice(0, 4);
    }
    return [];
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading Stream Vault...</p>
      </div>
    );
  }

  const featuredSeries = getFeaturedSeries();
  const activeCategory = browseCategories.find((c) => c.slug === activeSlug);

  return (
    <div className="home">
      {featuredSeries.length > 0 ? (
        <HeroSlider series={featuredSeries} />
      ) : (
        <div className="hero-placeholder">
          <div className="hero-placeholder-content">
            <div className="hero-logo">
              <span className="logo-stream">STREAM</span>{' '}
              <span className="logo-vault">VAULT</span>
            </div>
            <h2 className="hero-tagline">Your Premium Streaming Experience</h2>
            <p className="hero-description">
              Discover thousands of hours of premium content. Start your journey today.
            </p>
            <div className="hero-actions">
              <Link to="/subscription" className="cta-button primary">
                <span>🚀</span> Get Started
              </Link>
              <Link to="/admin" className="cta-button secondary">
                <span>⚙️</span> Admin Panel
              </Link>
            </div>
          </div>
          <div className="hero-gradient"></div>
        </div>
      )}



      <div className="home-content">
        <div className="content-sections">
          {filterLoading && (
            <div className="filter-loading">
              <div className="loading-spinner small"></div>
              <p>Loading content...</p>
            </div>
          )}

          {activeSlug !== 'all' && !filterLoading && (
            <>
              {filteredSeries.length > 0 ? (
                <SeriesRow
                  title={activeCategory?.name || activeSlug}
                  series={filteredSeries}
                />
              ) : (
                <div className="no-content-message">
                  <div className="no-content-icon">No Content</div>
                  <h2>No Series Available</h2>
                  <p>This category is currently empty. Check back later for new content!</p>
                </div>
              )}
            </>
          )}

          {activeSlug === 'all' &&
            homeRows.map((row) => (
              <SeriesRow
                key={row.category._id}
                title={row.category.name}
                series={row.series}
              />
            ))}

          {activeSlug === 'all' && homeRows.length === 0 && (
            <div className="no-content-message">
              <div className="no-content-icon">Welcome</div>
              <h2>Welcome to Stream Vault</h2>
              <p>Start by adding categories and series from the admin panel to build your streaming library.</p>
              <Link to="/admin" className="admin-link">
                Go to Admin Panel →
              </Link>
            </div>
          )}

          {/* Netflix-Style Interactive Sections */}
          {activeSlug === 'all' && homeRows.length > 0 && (
            <>
              {/* Interactive Banner */}
              <div className="interactive-banner">
                <div className="banner-content">
                  <h2 className="banner-title">Unlimited Entertainment</h2>
                  <p className="banner-subtitle">
                    Stream thousands of hours of premium content. New releases added weekly.
                  </p>
                  <Link to="/subscription" className="banner-cta">
                    Explore Plans
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SeriesRow from '../components/SeriesRow';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [topPicks, setTopPicks] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const [topPicksRes, recommendedRes, newReleasesRes, upcomingRes] = await Promise.all([
        axios.get('/api/categories/top-picks'),
        axios.get('/api/categories/recommended'),
        axios.get('/api/categories/new-releases'),
        axios.get('/api/categories/upcoming')
      ]);

      const topPicksData = topPicksRes.data?.data || [];
      setTopPicks(topPicksData);
      setRecommended(recommendedRes.data?.data || []);
      setNewReleases(newReleasesRes.data?.data || []);
      setUpcoming(upcomingRes.data?.data || []);

      if (topPicksData.length > 0) {
        setFeatured(topPicksData[Math.floor(Math.random() * topPicksData.length)]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="home loading-skeleton">
        <div className="skeleton-hero"></div>
        <div className="skeleton-row">
          <div className="skeleton-title"></div>
          <div className="skeleton-cards">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton-card"></div>)}
          </div>
        </div>
        <div className="skeleton-row">
          <div className="skeleton-title"></div>
          <div className="skeleton-cards">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton-card"></div>)}
          </div>
        </div>
      </div>
    );
  }

  const handlePlay = () => {
    if (featured) {
      navigate(`/series/${featured._id}`);
    }
  };

  return (
    <div className="home">
      <div 
        className="hero-banner"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.8) 10%, rgba(0, 0, 0, 0) 70%), url(${featured?.thumbnail || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop'})`,
        }}
      >
        <div className="hero-content">
          <h1 className="hero-title">{featured?.title || "Unlimited Short Dramas"}</h1>
          <p className="hero-description">
            {featured?.description?.substring(0, 150) || "Explore our collection of the most engaging short series. Watch anywhere, anytime."}
            {featured?.description?.length > 150 ? '...' : ''}
          </p>
          <div className="hero-buttons">
            <button className="hero-btn play" onClick={handlePlay}>
              <span>▶</span> Play
            </button>
            <button className="hero-btn info" onClick={() => featured && navigate(`/series/${featured._id}`)}>
              <span>ⓘ</span> More Info
            </button>
          </div>
        </div>
      </div>

      <div className="home-content">
        <SeriesRow title="Top Picks" series={topPicks} />
        <SeriesRow title="Recommended" series={recommended} />
        <SeriesRow title="New Releases" series={newReleases} />
        <SeriesRow title="Upcoming" series={upcoming} />
      </div>
    </div>
  );
};

export default Home;

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import HeroSlider from '../components/HeroSlider';
import SeriesRow from '../components/SeriesRow';
import CategoryBar from '../components/CategoryBar';
import './Home.css';

const Home = () => {
  const [homeRows, setHomeRows] = useState([]);
  const [browseCategories, setBrowseCategories] = useState([]);
  const [filteredSeries, setFilteredSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSlug = searchParams.get('category') || 'all';

  const loadHomeData = useCallback(async () => {
    try {
      const [homeRes, catsRes] = await Promise.all([
        axios.get('/api/categories/home'),
        axios.get('/api/categories'),
      ]);
      setHomeRows(homeRes.data?.data || []);
      setBrowseCategories(catsRes.data?.data || []);
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
        const res = await axios.get(`/api/categories/${activeSlug}/series`);
        setFilteredSeries(res.data?.data || []);
      } catch (error) {
        console.error('Error filtering category:', error);
        setFilteredSeries([]);
      } finally {
        setFilterLoading(false);
      }
    };

    fetchFiltered();
  }, [activeSlug]);

  const handleCategorySelect = (slug) => {
    if (slug === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: slug });
    }
  };

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
    return <div className="loading">Loading...</div>;
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
            <h1>
              <span className="logo-stream">STREAM</span>{' '}
              <span className="logo-vault">VAULT</span>
            </h1>
            <p>Add categories and series from the admin panel</p>
          </div>
        </div>
      )}

      {browseCategories.length > 0 && (
        <CategoryBar
          categories={browseCategories}
          activeSlug={activeSlug}
          onSelect={handleCategorySelect}
        />
      )}

      <div className="home-content">
        {filterLoading && <p className="home-filter-loading">Loading...</p>}

        {activeSlug !== 'all' && !filterLoading && (
          <>
            {filteredSeries.length > 0 ? (
              <SeriesRow
                title={activeCategory?.name || activeSlug}
                series={filteredSeries}
              />
            ) : (
              <div className="no-content-message">
                <h2>No series currently</h2>
                <p>Please check back later or explore other categories.</p>
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
            <h2>No Content Yet</h2>
            <p>Create categories in Admin → Categories, then assign series to them.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

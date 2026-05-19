import React, { useRef } from 'react';
import './CategoryBar.css';

const CategoryBar = ({ categories, activeSlug, onSelect }) => {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  return (
    <div className="category-bar">
      <div className="category-bar-inner">
        <button type="button" className="category-scroll-btn" onClick={() => scroll('left')} aria-label="Scroll left">
          ‹
        </button>
        <div className="category-bar-scroll" ref={scrollRef}>
          <button
            type="button"
            className={`category-pill ${activeSlug === 'all' ? 'active' : ''}`}
            onClick={() => onSelect('all')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              className={`category-pill ${activeSlug === cat.slug ? 'active' : ''}`}
              onClick={() => onSelect(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <button type="button" className="category-scroll-btn" onClick={() => scroll('right')} aria-label="Scroll right">
          ›
        </button>
      </div>
    </div>
  );
};

export default CategoryBar;

import React from 'react';
import { Link } from 'react-router-dom';
import './Logo.css';

const Logo = ({ className = '' }) => (
  <Link to="/" className={`logo ${className}`} aria-label="DramaFlix Home">
    <svg className="logo-icon" viewBox="0 0 111 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M105.062 14.28L111 30l-19.062 53.25L72.937 30l5.938-15.72h26.125zM90.938 30L75 68.25 59.062 30h31.876zM30 0L0 200h15.938L45.938 60 75.938 200h15.938L60 0H30z"
        fill="currentColor"
      />
    </svg>
    <span className="logo-text">DRAMAFLIX</span>
  </Link>
);

export default Logo;

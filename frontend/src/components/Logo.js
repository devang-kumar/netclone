import React from 'react';
import { Link } from 'react-router-dom';
import './Logo.css';

const Logo = ({ className = '' }) => (
  <Link to="/" className={`logo ${className}`} aria-label="StreamVault Home">
    <span className="logo-stream">STREAM</span>
    <span className="logo-vault">VAULT</span>
  </Link>
);

export default Logo;

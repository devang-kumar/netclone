import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Logo from '../components/Logo';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <header className="auth-header">
        <Logo className="logo--large" />
        <Link to="/register" className="auth-header-link">
          Sign Up
        </Link>
      </header>

      <div className="auth-container">
        <h1>Sign In</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email or phone number"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-options">
          <label className="auth-remember">
            <input type="checkbox" />
            Remember me
          </label>
          <a href="/">Need help?</a>
        </div>

        <p className="auth-footer">
          New to DramaFlix? <Link to="/register">Sign up now</Link>.
        </p>
        <p className="auth-recaptcha">
          This page is protected by Google reCAPTCHA to ensure you are not a bot.
        </p>
      </div>
    </div>
  );
};

export default Login;

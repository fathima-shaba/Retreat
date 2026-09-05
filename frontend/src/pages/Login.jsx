import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Building } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Cannot connect to server. Please ensure backend is running.');
    }
  };

  return (
    <div className="login-container">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      
      <div className="glass-panel login-card animate-fade-in">
        <div className="login-header">
          <div className="sidebar-logo" style={{ margin: '0 auto 1.5rem', width: '3rem', height: '3rem' }}>
            <Building color="white" size={24} />
          </div>
          <h1>Welcome Back</h1>
          <p>Enter your credentials to access the portal</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          {error && <div style={{ color: '#ef4444', fontSize: '0.875rem', textAlign: 'center', background: 'rgba(239,68,68,0.1)', padding: '0.5rem', borderRadius: '8px' }}>{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                type="text"
                id="username"
                className="input-field"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type="password"
                id="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
            Sign In
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

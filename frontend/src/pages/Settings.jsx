import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Sun, Moon, Check, Key } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL, authFetch } from '../apiConfig';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) {
        setOldPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setMessage("Error changing password.");
    }
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Settings</h1>
              <p className="page-subtitle">Manage system preferences and security</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '600px' }}>
            {/* Theme Preference Section */}
            <div className="glass-panel section-card">
              <h2 className="section-title">Theme Preference</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                Select your preferred visual theme for the portal.
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div 
                  className={`theme-card ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sun size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Light Mode</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Clean slate white theme</div>
                  </div>
                  {theme === 'light' && <Check size={18} color="var(--accent-primary)" />}
                </div>

                <div 
                  className={`theme-card ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Moon size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Dark Mode</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Sleek dark emerald theme</div>
                  </div>
                  {theme === 'dark' && <Check size={18} color="var(--accent-primary)" />}
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="glass-panel section-card">
              <h2 className="section-title">Security & Password</h2>
              {message && <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '8px', fontSize: '0.875rem' }}>{message}</div>}
              
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required 
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                  <Key size={18} /> Update Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

import React, { useState } from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import SearchInput from './SearchInput';

const Header = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const { theme, toggleTheme } = useTheme();
  const [globalSearch, setGlobalSearch] = useState('');
  
  const toggleMobileMenu = () => {
    window.dispatchEvent(new Event('toggle-mobile-sidebar'));
  };

  return (
    <div className="header">
      <button 
        className="mobile-toggle-btn" 
        onClick={toggleMobileMenu} 
        aria-label="Toggle navigation menu"
      >
        <Menu size={22} />
      </button>

      <div className="header-search" style={{ maxWidth: '320px', width: '100%' }}>
        <SearchInput 
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          placeholder="Global search..."
        />
      </div>
      
      <div className="header-actions">
        <button 
          className="icon-btn" 
          onClick={toggleTheme} 
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle light or dark theme"
        >
          {theme === 'dark' ? <Sun size={20} color="#f59e0b" /> : <Moon size={20} color="#6366f1" />}
        </button>

        <div className="user-profile" style={{ marginLeft: '0.5rem' }}>
          <div className="user-info" style={{ textAlign: 'right' }}>
            <span className="user-name">{user?.username || 'User'}</span>
            <span className="user-role" style={{ textTransform: 'capitalize' }}>{user?.role || 'Guest'}</span>
          </div>
          <div className="avatar">{user?.username ? user.username.charAt(0).toUpperCase() : 'U'}</div>
        </div>
      </div>
    </div>
  );
};

export default Header;


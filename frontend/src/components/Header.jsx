import React from 'react';
import { Search, Bell, MessageSquare } from 'lucide-react';

const Header = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  return (
    <div className="header">
      <div className="header-search">
        <Search size={18} color="var(--text-secondary)" />
        <input type="text" placeholder="Search members, rooms..." />
      </div>
      
      <div className="header-actions">
        <div className="user-profile" style={{ marginLeft: '1rem' }}>
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

import React from 'react';
import { Search, Bell, MessageSquare } from 'lucide-react';

const Header = () => {
  return (
    <div className="header">
      <div className="header-search">
        <Search size={18} color="var(--text-secondary)" />
        <input type="text" placeholder="Search members, rooms..." />
      </div>
      
      <div className="header-actions">
        <div className="user-profile" style={{ marginLeft: '1rem' }}>
          <div className="user-info" style={{ textAlign: 'right' }}>
            <span className="user-name">Admin User</span>
            <span className="user-role">Super Admin</span>
          </div>
          <div className="avatar">A</div>
        </div>
      </div>
    </div>
  );
};

export default Header;

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BedDouble, 
  Receipt,
  Settings 
} from 'lucide-react';

const MobileBottomNav = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Residents', path: '/members', icon: <Users size={20} /> },
    { name: 'Rooms', path: '/rooms', icon: <BedDouble size={20} /> },
    { name: 'Expenses', path: '/expenses', icon: <Receipt size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="mobile-bottom-nav">
      {navItems.map((item) => (
        <NavLink 
          key={item.name} 
          to={item.path} 
          className={({ isActive }) => isActive ? "mobile-nav-item active" : "mobile-nav-item"}
        >
          {item.icon}
          <span>{item.name}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default MobileBottomNav;

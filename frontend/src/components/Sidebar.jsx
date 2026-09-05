import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import MobileBottomNav from './MobileBottomNav';
import Logo from './Logo';
import { 
  LayoutDashboard, 
  Users, 
  BedDouble, 
  CreditCard,
  Receipt,
  FileText,
  Settings,
  LogOut,
  X,
  MessageSquare,
  UserCheck,
  Megaphone
} from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    const handleClose = () => setIsOpen(false);

    window.addEventListener('toggle-mobile-sidebar', handleToggle);
    window.addEventListener('close-mobile-sidebar', handleClose);

    return () => {
      window.removeEventListener('toggle-mobile-sidebar', handleToggle);
      window.removeEventListener('close-mobile-sidebar', handleClose);
    };
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Residents', path: '/members', icon: <Users size={20} /> },
    { name: 'Rooms & Beds', path: '/rooms', icon: <BedDouble size={20} /> },
    { name: 'Attendance', path: '/attendance', icon: <UserCheck size={20} /> },
    { name: 'Fees & Payments', path: '/payments', icon: <CreditCard size={20} /> },
    { name: 'Expense Tracker', path: '/expenses', icon: <Receipt size={20} /> },
    { name: 'Complaints', path: '/complaints', icon: <MessageSquare size={20} /> },
    { name: 'Announcements', path: '/announcements', icon: <Megaphone size={20} /> },
    { name: 'Reports', path: '/reports', icon: <FileText size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsOpen(false);
    navigate('/login');
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(false)} 
      />
      
      <div className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="sidebar-logo">
              <Logo size={20} color="white" />
            </div>
            <span className="sidebar-title">Hostel <span style={{ color: 'var(--accent-primary)' }}>FT</span></span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="mobile-close-btn"
            style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '0.25rem', cursor: 'pointer', border: 'none' }}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.name} 
              to={item.path} 
              onClick={handleNavClick}
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          <div onClick={handleLogout} className="nav-item" style={{ color: '#ef4444', cursor: 'pointer' }}>
            <LogOut size={20} />
            <span>Log Out</span>
          </div>
        </div>
      </div>

      {/* Render Mobile Bottom Navigation Bar on Mobile Viewports */}
      <MobileBottomNav />
    </>
  );
};

export default Sidebar;



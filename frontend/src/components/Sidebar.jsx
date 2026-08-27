import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BedDouble, 
  Clock,
  CreditCard,
  CalendarDays,
  BellRing,
  UserCheck,
  Briefcase,
  Megaphone,
  FileText,
  Settings, 
  LogOut,
  Building
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Residents', path: '/members', icon: <Users size={20} /> },
    { name: 'Rooms & Beds', path: '/rooms', icon: <BedDouble size={20} /> },
    { name: 'Attendance', path: '/attendance', icon: <Clock size={20} /> },
    { name: 'Fees & Payments', path: '/payments', icon: <CreditCard size={20} /> },
    { name: 'Leave Management', path: '/leave', icon: <CalendarDays size={20} /> },
    { name: 'Complaints', path: '/complaints', icon: <BellRing size={20} /> },
    { name: 'Visitors', path: '/visitors', icon: <UserCheck size={20} /> },
    { name: 'Staff & Warden', path: '/staff', icon: <Briefcase size={20} /> },
    { name: 'Announcements', path: '/announcements', icon: <Megaphone size={20} /> },
    { name: 'Reports', path: '/reports', icon: <FileText size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Building color="white" size={18} />
        </div>
        <span className="sidebar-title">Hostel <span style={{ color: 'var(--accent-primary)' }}>FT</span></span>
      </div>
      
      <div className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
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
  );
};

export default Sidebar;

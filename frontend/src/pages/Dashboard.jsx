import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Users, BedDouble, AlertCircle, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    vacantRooms: 0,
    totalPayments: 0,
    pendingPayments: 0
  });
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }

        const resStudents = await fetch('http://localhost:5000/api/students', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resStudents.ok) {
          const dataStudents = await resStudents.json();
          setStudents(dataStudents);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Dashboard Overview</h1>
              <p className="page-subtitle">Welcome back, here's what's happening today.</p>
            </div>
          </div>
          
          <div className="dashboard-grid">
            <div className="glass-panel stat-card">
              <div className="stat-header">
                <span>Total Students</span>
                <div className="stat-icon"><Users size={20} /></div>
              </div>
              <div className="stat-value">{stats.totalStudents || 0}</div>
            </div>
            
            <div className="glass-panel stat-card">
              <div className="stat-header">
                <span>Available Rooms</span>
                <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <BedDouble size={20} />
                </div>
              </div>
              <div className="stat-value">{stats.vacantRooms || 0}</div>
              <div className="stat-footer">
                <span style={{ color: 'var(--text-secondary)' }}>Out of {stats.totalRooms || 0} total rooms</span>
              </div>
            </div>
            
            <div className="glass-panel stat-card">
              <div className="stat-header">
                <span>Payments Collected</span>
                <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)' }}>
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="stat-value">₹{stats.totalPayments || 0}</div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-header">
                <span>Pending Payments</span>
                <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  <AlertCircle size={20} />
                </div>
              </div>
              <div className="stat-value">₹{stats.pendingPayments || 0}</div>
            </div>
          </div>

          <div style={{ marginTop: '3rem' }}>
            <h2 className="section-title">Rent Reminders (Due Soon or Overdue)</h2>
            <div className="glass-panel section-card" style={{ marginTop: '1rem' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem' }}>Student Name</th>
                    <th style={{ padding: '1rem' }}>Room #</th>
                    <th style={{ padding: '1rem' }}>Monthly Rent</th>
                    <th style={{ padding: '1rem' }}>Due Date</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.filter(s => s.next_due_date).map(student => {
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    const due = new Date(student.next_due_date);
                    
                    const diffTime = due - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    // Show if overdue (<0) or due within 5 days
                    if (diffDays <= 5) {
                      return (
                        <tr key={student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '1rem', fontWeight: '500' }}>{student.name}</td>
                          <td style={{ padding: '1rem' }}>{student.room_number || 'N/A'}</td>
                          <td style={{ padding: '1rem' }}>₹{student.rent_fee}</td>
                          <td style={{ padding: '1rem' }}>{due.toLocaleDateString()}</td>
                          <td style={{ padding: '1rem' }}>
                            {diffDays < 0 ? (
                              <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Overdue by {Math.abs(diffDays)} days</span>
                            ) : diffDays === 0 ? (
                              <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>Due Today</span>
                            ) : (
                              <span style={{ color: '#f59e0b' }}>Due in {diffDays} days</span>
                            )}
                          </td>
                        </tr>
                      );
                    }
                    return null;
                  }).filter(Boolean).length === 0 && (
                    <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>All caught up! No rent reminders right now.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

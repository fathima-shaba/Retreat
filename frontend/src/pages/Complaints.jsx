import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { AlertCircle, Wrench, CheckCircle2 } from 'lucide-react';

const Complaints = () => {
  const [complaints, setComplaints] = useState([
    { id: 1, issue: 'Wi-Fi not working', room: 'A-101', reportedBy: 'Akhil N', date: 'Today, 10:30 AM', status: 'Open' },
    { id: 2, issue: 'Water supply issue', room: 'B-203', reportedBy: 'Fahad K', date: 'Yesterday, 02:15 PM', status: 'In Progress' },
    { id: 3, issue: 'Light not working', room: 'C-305', reportedBy: 'Rafid M', date: '10 May, 09:00 AM', status: 'Resolved' },
    { id: 4, issue: 'Fan making noise', room: 'D-104', reportedBy: 'Nihal V', date: '08 May, 04:20 PM', status: 'Open' }
  ]);

  const handleLogIssue = () => {
    const issue = window.prompt("Enter issue description:");
    if (!issue) return;
    const room = window.prompt("Enter room number:");
    if (!room) return;
    
    setComplaints([
      {
        id: Date.now(),
        issue,
        room,
        reportedBy: 'Admin User',
        date: 'Just now',
        status: 'Open'
      },
      ...complaints
    ]);
  };

  const handleToggleStatus = (id) => {
    const statuses = ['Open', 'In Progress', 'Resolved'];
    setComplaints(complaints.map(item => {
      if (item.id === id) {
        const nextStatus = statuses[(statuses.indexOf(item.status) + 1) % statuses.length];
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  const openCount = complaints.filter(c => c.status === 'Open').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="page-content" style={{ paddingBottom: '6rem' }}>
          <div className="page-header">
            <div>
              <h1 className="page-title">Complaints & Maintenance</h1>
              <p className="page-subtitle">Track and resolve resident issues</p>
            </div>
            <button className="btn-primary" onClick={handleLogIssue} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>+ Log Issue</button>
          </div>
          
          <div className="dashboard-grid-3">
            <div className="glass-panel stat-card">
              <div className="stat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                    <AlertCircle size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Open</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem' }}>{openCount}</div>
            </div>
            
            <div className="glass-panel stat-card">
              <div className="stat-header">
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                    <Wrench size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>In Progress</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem' }}>{inProgressCount}</div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-header">
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Resolved (This Week)</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem' }}>{resolvedCount}</div>
            </div>
          </div>

          <div className="glass-panel section-card table-responsive-container" style={{ marginTop: '2rem' }}>
            <h2 className="section-title">Active Tickets</h2>
            <table style={{ width: '100%', minWidth: '600px', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem' }}>Issue Description</th>
                  <th style={{ padding: '1rem' }}>Room #</th>
                  <th style={{ padding: '1rem' }}>Reported By</th>
                  <th style={{ padding: '1rem' }}>Date</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{item.issue}</td>
                    <td style={{ padding: '1rem' }}>{item.room}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{item.reportedBy}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{item.date}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${
                        item.status === 'Resolved' ? 'badge-resolved' : 
                        item.status === 'In Progress' ? 'badge-inprogress' : 
                        'badge-open'
                      }`}>{item.status}</span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button onClick={() => handleToggleStatus(item.id)} style={{ background: 'transparent', color: 'var(--accent-primary)', padding: '0.25rem 0.5rem', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer' }}>Update Status</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Complaints;

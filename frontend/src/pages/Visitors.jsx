import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { UserCheck, Users, LogIn } from 'lucide-react';

const Visitors = () => {
  const [visitors, setVisitors] = useState([
    { id: 1, visitorName: 'Ramesh N', residentName: 'Akhil N', relation: 'Father', timeIn: '10:30 AM', timeOut: '-', status: 'Inside' },
    { id: 2, visitorName: 'Sunil K', residentName: 'Fahad K', relation: 'Brother', timeIn: '09:15 AM', timeOut: '11:00 AM', status: 'Left' },
    { id: 3, visitorName: 'Mohammed R', residentName: 'Rafid M', relation: 'Uncle', timeIn: '08:00 AM', timeOut: '09:30 AM', status: 'Left' }
  ]);

  const handleNewEntry = () => {
    const visitorName = window.prompt("Enter Visitor Name:");
    if (!visitorName) return;
    const residentName = window.prompt("Enter Resident Name they are visiting:");
    if (!residentName) return;
    const relation = window.prompt("Enter relation to resident (e.g., Father, Friend):") || 'Guest';
    
    setVisitors([
      {
        id: Date.now(),
        visitorName,
        residentName,
        relation,
        timeIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timeOut: '-',
        status: 'Inside'
      },
      ...visitors
    ]);
  };

  const handleCheckOut = (id) => {
    setVisitors(visitors.map(item => {
      if (item.id === id) {
        return {
          ...item,
          timeOut: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Left'
        };
      }
      return item;
    }));
  };

  const totalVisitors = visitors.length;
  const insideCount = visitors.filter(v => v.status === 'Inside').length;

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="page-content" style={{ paddingBottom: '6rem' }}>
          <div className="page-header">
            <div>
              <h1 className="page-title">Visitor Log</h1>
              <p className="page-subtitle">Track guests and visitors securely</p>
            </div>
            <button className="btn-primary" onClick={handleNewEntry} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>+ New Entry</button>
          </div>
          
          <div className="dashboard-grid-2">
            <div className="glass-panel stat-card">
              <div className="stat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                    <Users size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Total Visitors Today</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem' }}>{totalVisitors}</div>
            </div>
            
            <div className="glass-panel stat-card">
              <div className="stat-header">
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <LogIn size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Currently Inside</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem' }}>{insideCount}</div>
            </div>
          </div>

          <div className="glass-panel section-card table-responsive-container" style={{ marginTop: '2rem' }}>
            <h2 className="section-title">Today's Log</h2>
            <table style={{ width: '100%', minWidth: '600px', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem' }}>Visitor Name</th>
                  <th style={{ padding: '1rem' }}>Visiting (Resident)</th>
                  <th style={{ padding: '1rem' }}>Relation</th>
                  <th style={{ padding: '1rem' }}>Time In</th>
                  <th style={{ padding: '1rem' }}>Time Out</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{item.visitorName}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{item.residentName}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{item.relation}</td>
                    <td style={{ padding: '1rem' }}>{item.timeIn}</td>
                    <td style={{ padding: '1rem' }}>{item.timeOut}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${
                        item.status === 'Inside' ? 'badge-inprogress' : 
                        'badge-approved'
                      }`}>{item.status}</span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {item.status === 'Inside' && (
                        <button onClick={() => handleCheckOut(item.id)} style={{ background: 'transparent', color: 'var(--accent-primary)', padding: '0.25rem 0.5rem', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer' }}>Check Out</button>
                      )}
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

export default Visitors;

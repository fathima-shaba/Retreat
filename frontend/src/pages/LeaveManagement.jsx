import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { CalendarDays, CheckCircle2, Clock } from 'lucide-react';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([
    { id: 1, name: 'Sreejith P', room: 'B-210', reason: 'Family function', dates: '12 May - 15 May', status: 'Pending' },
    { id: 2, name: 'Arjun R', room: 'A-203', reason: 'Medical', dates: '11 May - 13 May', status: 'Pending' },
    { id: 3, name: 'Jaseem K', room: 'C-107', reason: 'Going home', dates: '10 May - 12 May', status: 'Approved' },
    { id: 4, name: 'Alan K', room: 'D-205', reason: 'Trip', dates: '09 May - 10 May', status: 'Rejected' }
  ]);

  const handleUpdateStatus = (id, newStatus) => {
    setLeaves(leaves.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const handleViewHistory = () => {
    alert("Leave history viewer will be available in the next release!");
  };

  const pendingCount = leaves.filter(l => l.status === 'Pending').length;
  const approvedCount = leaves.filter(l => l.status === 'Approved').length;

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="page-content" style={{ paddingBottom: '6rem' }}>
          <div className="page-header">
            <div>
              <h1 className="page-title">Leave Management</h1>
              <p className="page-subtitle">Review and approve resident leave requests</p>
            </div>
            <button className="btn-primary" onClick={handleViewHistory} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>View History</button>
          </div>
          
          <div className="dashboard-grid-2">
            <div className="glass-panel stat-card">
              <div className="stat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                    <Clock size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Pending Requests</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem' }}>{pendingCount}</div>
            </div>
            
            <div className="glass-panel stat-card">
              <div className="stat-header">
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Approved Leaves</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem' }}>{approvedCount}</div>
            </div>
          </div>

          <div className="glass-panel section-card" style={{ marginTop: '2rem' }}>
            <h2 className="section-title">Recent Requests</h2>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem' }}>Resident</th>
                  <th style={{ padding: '1rem' }}>Room #</th>
                  <th style={{ padding: '1rem' }}>Reason</th>
                  <th style={{ padding: '1rem' }}>Dates</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{item.name}</td>
                    <td style={{ padding: '1rem' }}>{item.room}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{item.reason}</td>
                    <td style={{ padding: '1rem' }}>{item.dates}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${
                        item.status === 'Approved' ? 'badge-approved' : 
                        item.status === 'Rejected' ? 'badge-rejected' : 
                        'badge-pending'
                      }`}>{item.status}</span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      {item.status === 'Pending' && (
                        <>
                          <button onClick={() => handleUpdateStatus(item.id, 'Approved')} style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '500', cursor: 'pointer' }}>Approve</button>
                          <button onClick={() => handleUpdateStatus(item.id, 'Rejected')} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '500', cursor: 'pointer' }}>Reject</button>
                        </>
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

export default LeaveManagement;

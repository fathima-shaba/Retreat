import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { UserCheck, UserX, Clock } from 'lucide-react';

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([
    { id: 1, name: 'Akhil N', room: 'A-101', status: 'Present', time: '08:30 AM' },
    { id: 2, name: 'Fahad K', room: 'B-203', status: 'Absent', time: '-' },
    { id: 3, name: 'Rafid M', room: 'C-305', status: 'Present', time: '08:15 AM' },
    { id: 4, name: 'Nihal V', room: 'D-104', status: 'Late', time: '09:45 AM' },
    { id: 5, name: 'Sreejith P', room: 'B-210', status: 'On Leave', time: '-' }
  ]);

  const handleMarkAllPresent = () => {
    setAttendanceData(attendanceData.map(item => ({
      ...item,
      status: 'Present',
      time: item.time === '-' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : item.time
    })));
  };

  const handleToggleStatus = (id) => {
    const statuses = ['Present', 'Absent', 'Late', 'On Leave'];
    setAttendanceData(attendanceData.map(item => {
      if (item.id === id) {
        const nextStatus = statuses[(statuses.indexOf(item.status) + 1) % statuses.length];
        return {
          ...item,
          status: nextStatus,
          time: (nextStatus === 'Present' || nextStatus === 'Late') && item.time === '-' 
                ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                : (nextStatus === 'Absent' || nextStatus === 'On Leave' ? '-' : item.time)
        };
      }
      return item;
    }));
  };

  const presentCount = attendanceData.filter(i => i.status === 'Present' || i.status === 'Late').length;
  const absentCount = attendanceData.filter(i => i.status === 'Absent').length;
  const leaveCount = attendanceData.filter(i => i.status === 'On Leave').length;

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="page-content" style={{ paddingBottom: '6rem' }}>
          <div className="page-header">
            <div>
              <h1 className="page-title">Attendance</h1>
              <p className="page-subtitle">Manage daily resident attendance</p>
            </div>
            <button className="btn-primary" onClick={handleMarkAllPresent} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Mark All Present</button>
          </div>
          
          <div className="dashboard-grid-3">
            <div className="glass-panel stat-card">
              <div className="stat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <UserCheck size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Present Today</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem' }}>{presentCount}</div>
            </div>
            
            <div className="glass-panel stat-card">
              <div className="stat-header">
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                    <UserX size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Absent Today</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem' }}>{absentCount}</div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-header">
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                    <Clock size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>On Leave</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem' }}>{leaveCount}</div>
            </div>
          </div>

          <div className="glass-panel section-card table-responsive-container" style={{ marginTop: '2rem' }}>
            <h2 className="section-title">Today's Roster</h2>
            <table style={{ width: '100%', minWidth: '600px', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem' }}>Resident Name</th>
                  <th style={{ padding: '1rem' }}>Room #</th>
                  <th style={{ padding: '1rem' }}>Punch Time</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{item.name}</td>
                    <td style={{ padding: '1rem' }}>{item.room}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{item.time}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${
                        item.status === 'Present' ? 'badge-approved' : 
                        item.status === 'Absent' ? 'badge-rejected' : 
                        'badge-pending'
                      }`}>{item.status}</span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button onClick={() => handleToggleStatus(item.id)} style={{ background: 'transparent', color: 'var(--accent-primary)', padding: '0.25rem 0.5rem', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer' }}>Toggle</button>
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

export default Attendance;

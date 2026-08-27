import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Users, BedDouble, Wallet, Megaphone, AlertCircle } from 'lucide-react';

const DonutChart = ({ occupied, available, maintenance }) => {
  const total = occupied + available + maintenance;
  const occupiedPct = total === 0 ? 0 : (occupied / total) * 100;
  const availablePct = total === 0 ? 0 : (available / total) * 100;
  const maintenancePct = total === 0 ? 0 : (maintenance / total) * 100;

  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  const strokeDasharrayOccupied = `${(occupiedPct / 100) * circumference} ${circumference}`;
  const strokeDasharrayAvailable = `${(availablePct / 100) * circumference} ${circumference}`;
  const strokeDasharrayMaintenance = `${(maintenancePct / 100) * circumference} ${circumference}`;

  const offsetOccupied = 25; 
  const offsetAvailable = offsetOccupied - (occupiedPct / 100) * circumference;
  const offsetMaintenance = offsetAvailable - (availablePct / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0' }}>
      <svg width="100%" height="100%" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r={radius} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
        
        {occupiedPct > 0 && (
          <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray={strokeDasharrayOccupied} strokeDashoffset={0} />
        )}
        {availablePct > 0 && (
           <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#3b82f6" strokeWidth="12" strokeDasharray={strokeDasharrayAvailable} strokeDashoffset={-(occupiedPct / 100) * circumference} />
        )}
        {maintenancePct > 0 && (
           <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#f59e0b" strokeWidth="12" strokeDasharray={strokeDasharrayMaintenance} strokeDashoffset={-((occupiedPct + availablePct) / 100) * circumference} />
        )}
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{occupiedPct.toFixed(1)}%</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Occupied</div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    vacantRooms: 0,
    totalPayments: 0,
    pendingPayments: 0
  });
  
  const [showToast, setShowToast] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(import.meta.env.VITE_API_URL + '/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchStats();
  }, []);

  // Use real backend data for charts if available, else fallback
  const occupiedBeds = stats.occupiedRooms || 392;
  const availableBeds = stats.vacantRooms || 36;
  const maintenanceBeds = 4; // Mock maintenance

  // Mock Data arrays
  const roomStatus = [
    { block: 'Block A', percent: 92, occupied: 110, total: 120 },
    { block: 'Block B', percent: 88, occupied: 105, total: 120 },
    { block: 'Block C', percent: 95, occupied: 114, total: 120 },
    { block: 'Block D', percent: 89, occupied: 63, total: 70 }
  ];

  const recentCheckins = [
    { name: 'Akhil N', room: 'Room A-101', time: '10 May, 10:30 AM', initials: 'AN' },
    { name: 'Fahad K', room: 'Room B-203', time: '09 May, 09:45 AM', initials: 'FK' },
    { name: 'Rafid M', room: 'Room C-305', time: '09 May, 06:15 PM', initials: 'RM' },
    { name: 'Nihal V', room: 'Room D-104', time: '08 May, 04:20 PM', initials: 'NV' }
  ];

  const leaveRequests = [
    { name: 'Sreejith P', room: 'Room B-210', date: '12 May - 15 May', status: 'Pending', initials: 'SP' },
    { name: 'Arjun R', room: 'Room A-203', date: '11 May - 13 May', status: 'Pending', initials: 'AR' },
    { name: 'Jaseem K', room: 'Room C-107', date: '10 May - 12 May', status: 'Approved', initials: 'JK' },
    { name: 'Alan K', room: 'Room D-205', date: '09 May - 10 May', status: 'Rejected', initials: 'AK' }
  ];

  const recentComplaints = [
    { issue: 'Wi-Fi not working', room: 'Room A-101', status: 'Open' },
    { issue: 'Water supply issue', room: 'Room B-203', status: 'In Progress' },
    { issue: 'Light not working', room: 'Room C-305', status: 'Resolved' },
    { issue: 'Fan problem', room: 'Room D-104', status: 'Open' }
  ];

  const getBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'badge-pending';
      case 'Approved': return 'badge-approved';
      case 'Rejected': return 'badge-rejected';
      case 'Open': return 'badge-open';
      case 'In Progress': return 'badge-inprogress';
      case 'Resolved': return 'badge-resolved';
      default: return '';
    }
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="page-content" style={{ paddingBottom: '6rem' }}>
          <div className="page-header">
            <div>
              <h1 className="page-title">Dashboard</h1>
              <p className="page-subtitle">Overview of your hostel</p>
            </div>
          </div>
          
          {/* Top Stat Cards */}
          <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="glass-panel stat-card">
              <div className="stat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <Users size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Total Residents</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem' }}>{stats.totalStudents || 428}</div>
              <div className="stat-footer" style={{ marginTop: '0.5rem' }}>
                <span className="trend-up">+12</span> <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>this month</span>
              </div>
            </div>
            
            <div className="glass-panel stat-card">
              <div className="stat-header">
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                    <BedDouble size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Occupied Beds</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem' }}>{occupiedBeds}</div>
              <div className="stat-footer" style={{ marginTop: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{((occupiedBeds/(occupiedBeds+availableBeds))*100).toFixed(1)}% Occupancy</span>
              </div>
            </div>
            
            <div className="glass-panel stat-card">
              <div className="stat-header">
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                    <BedDouble size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Available Beds</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem' }}>{availableBeds}</div>
              <div className="stat-footer" style={{ marginTop: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{((availableBeds/(occupiedBeds+availableBeds))*100).toFixed(1)}% Available</span>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-header">
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                    <Wallet size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Pending Fees</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem' }}>₹{stats.pendingPayments || '1,24,500'}</div>
              <div className="stat-footer" style={{ marginTop: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>21 Pending Payments</span>
              </div>
            </div>
          </div>

          {/* Middle Row */}
          <div className="dashboard-grid-2">
            <div className="glass-panel section-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: '600' }}>Occupancy Overview</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>This Month ▾</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <DonutChart occupied={occupiedBeds} available={availableBeds} maintenance={maintenanceBeds} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span> Occupied</div>
                    <span style={{ fontWeight: '500' }}>{occupiedBeds}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span> Available</div>
                    <span style={{ fontWeight: '500' }}>{availableBeds}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></span> Maintenance</div>
                    <span style={{ fontWeight: '500' }}>{maintenanceBeds}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel section-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: '600' }}>Room Status</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>All Blocks ▾</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {roomStatus.map((block) => (
                  <div key={block.block}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                      <span style={{ fontWeight: '500' }}>{block.block}</span>
                      <span><span style={{ fontWeight: '600' }}>{block.percent}%</span> <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>({block.occupied}/{block.total})</span></span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${block.percent}%`, height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="dashboard-grid-3">
            <div className="glass-panel section-card">
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: '600' }}>Recent Check-ins</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>View all</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentCheckins.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar-mini">{item.initials}</div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.room}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel section-card">
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: '600' }}>Leave Requests</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>View all</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {leaveRequests.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar-mini">{item.initials}</div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.room} • {item.date}</div>
                      </div>
                    </div>
                    <div>
                      <span className={`badge ${getBadgeClass(item.status)}`}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel section-card">
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: '600' }}>Recent Complaints</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>View all</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentComplaints.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '2rem', height: '2rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <AlertCircle size={14} color="var(--text-secondary)" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{item.issue}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.room}</div>
                      </div>
                    </div>
                    <div>
                      <span className={`badge ${getBadgeClass(item.status)}`}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Floating Announcement */}
      {showToast && (
        <div className="announcement-toast">
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.5rem', borderRadius: '8px', color: '#10b981' }}>
            <Megaphone size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#10b981', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
              Announcement
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '400' }}>2h ago</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Hostel annual maintenance on 20 May 2025. Please cooperate.
            </p>
          </div>
          <button onClick={() => setShowToast(false)} style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '0.25rem' }}>×</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

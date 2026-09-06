import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Users, BedDouble, Wallet } from 'lucide-react';
import { API_BASE_URL, authFetch } from '../apiConfig';

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
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    vacantRooms: 0,
    maintenanceRooms: 0,
    totalPayments: 0,
    pendingPayments: 0,
    pendingCount: 0,
    roomStatus: [],
    recentCheckins: [],
    recentExpenses: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await authFetch(`${API_BASE_URL}/dashboard/stats`);
        if (response && response.ok) {
          const data = await response.json();
          if (data && typeof data === 'object') {
            setStats(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchStats();
  }, []);

  const occupiedBeds = stats.occupiedRooms || 0;
  const availableBeds = stats.vacantRooms || 0;
  const maintenanceBeds = stats.maintenanceRooms || 0;
  const totalBeds = occupiedBeds + availableBeds;
  const occupancyPercent = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : '0';
  const availabilityPercent = totalBeds > 0 ? ((availableBeds / totalBeds) * 100).toFixed(1) : '0';

  const roomStatus = Array.isArray(stats.roomStatus) && stats.roomStatus.length > 0 ? stats.roomStatus : [];
  const recentCheckins = Array.isArray(stats.recentCheckins) ? stats.recentCheckins : [];
  const recentExpenses = Array.isArray(stats.recentExpenses) ? stats.recentExpenses : [];

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Dashboard</h1>
              <p className="page-subtitle">Overview of your hostel</p>
            </div>
          </div>
          
          {/* Top Stat Cards */}
          <div className="stat-grid-4">
            <div className="glass-panel stat-card">
              <div className="stat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <Users size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Total Residents</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem' }}>{stats.totalStudents}</div>
              <div className="stat-footer" style={{ marginTop: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Active Registered Residents</span>
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
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{occupancyPercent}% Occupancy</span>
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
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{availabilityPercent}% Available</span>
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
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem' }}>₹{Number(stats.pendingPayments || 0).toLocaleString('en-IN')}</div>
              <div className="stat-footer" style={{ marginTop: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{stats.pendingCount || 0} Pending Payments</span>
              </div>
            </div>
          </div>

          {/* Middle Row */}
          <div className="dashboard-grid-2">
            <div className="glass-panel section-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: '600' }}>Occupancy Overview</h2>
              </div>
              <div className="occupancy-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <DonutChart occupied={occupiedBeds} available={availableBeds} maintenance={maintenanceBeds} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span> Occupied Beds</div>
                    <span style={{ fontWeight: '500' }}>{occupiedBeds}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span> Available Beds</div>
                    <span style={{ fontWeight: '500' }}>{availableBeds}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></span> Maintenance Rooms</div>
                    <span style={{ fontWeight: '500' }}>{maintenanceBeds}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel section-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: '600' }}>Room Status by Floor</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {roomStatus.length > 0 ? roomStatus.map((block) => (
                  <div key={block.block}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                      <span style={{ fontWeight: '500' }}>{block.block}</span>
                      <span><span style={{ fontWeight: '600' }}>{block.percent}%</span> <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>({block.occupied}/{block.total} Occupied)</span></span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${block.percent}%`, height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
                    </div>
                  </div>
                )) : (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>No rooms configured.</div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="dashboard-grid-3">
            <div className="glass-panel section-card">
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: '600' }}>Recent Check-ins</h2>
                <span onClick={() => navigate('/members')} style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', cursor: 'pointer' }}>View all &rarr;</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentCheckins.length > 0 ? recentCheckins.map((item, i) => (
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
                )) : (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>No recent check-ins.</div>
                )}
              </div>
            </div>

            <div className="glass-panel section-card">
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: '600' }}>Total Revenue (Paid)</h2>
                <span onClick={() => navigate('/payments')} style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', cursor: 'pointer' }}>View all &rarr;</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', height: '100%', minHeight: '120px' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Fee Revenue Collected</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>₹{Number(stats.totalPayments || 0).toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div className="glass-panel section-card">
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: '600' }}>Recent Expenses</h2>
                <span onClick={() => navigate('/expenses')} style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', cursor: 'pointer' }}>View all &rarr;</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentExpenses.length > 0 ? recentExpenses.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '2rem', height: '2rem', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Wallet size={14} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{item.item}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.category} • {item.date}</div>
                      </div>
                    </div>
                    <div>
                      <span style={{ fontWeight: '600', fontSize: '0.85rem', color: '#ef4444' }}>{item.amount}</span>
                    </div>
                  </div>
                )) : (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>No recent expenses.</div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

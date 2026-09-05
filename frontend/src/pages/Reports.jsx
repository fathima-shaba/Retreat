import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Download, FileText, PieChart, TrendingUp, Users, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';

const Reports = () => {
  const [occupancyData, setOccupancyData] = useState({
    total_rooms: 0,
    total_beds: 0,
    occupied_beds: 0,
    available_beds: 0,
    occupancy_rate: 0
  });

  const [financialData, setFinancialData] = useState({
    total_revenue: 0,
    total_pending: 0,
    total_expenses: 0,
    net_income: 0
  });

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [occRes, finRes] = await Promise.all([
        fetch(`${API_BASE_URL}/reports/occupancy`, { headers }),
        fetch(`${API_BASE_URL}/reports/financials`, { headers })
      ]);

      if (occRes.ok) setOccupancyData(await occRes.json());
      if (finRes.ok) setFinancialData(await finRes.json());
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDownloadCSV = async (type) => {
    setDownloading(type);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/reports/export/${type}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to export CSV");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${type}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("Error downloading CSV report.");
    } finally {
      setDownloading('');
    }
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Reports & Analytics</h1>
              <p className="page-subtitle">Operational summaries, financial metrics, and CSV exports</p>
            </div>
            <button className="btn-secondary" onClick={fetchReports} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh Data
            </button>
          </div>

          {/* Stat Overview Cards */}
          <div className="stat-grid-4" style={{ marginBottom: '1.5rem' }}>
            <div className="glass-panel stat-card">
              <div className="stat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                    <PieChart size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Occupancy Rate</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem', color: '#3b82f6' }}>
                {occupancyData.occupancy_rate}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {occupancyData.occupied_beds} / {occupancyData.total_beds} beds occupied
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <TrendingUp size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Total Revenue</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem', color: '#10b981' }}>
                ₹{financialData.total_revenue.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Paid resident fees
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                    <DollarSign size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Total Expenses</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem', color: '#ef4444' }}>
                ₹{financialData.total_expenses.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Mess, maintenance & bills
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                    <FileText size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Net Operating Profit</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem', color: financialData.net_income >= 0 ? '#10b981' : '#ef4444' }}>
                ₹{financialData.net_income.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Revenue minus expenses
              </div>
            </div>
          </div>

          {/* Export Center Cards */}
          <div className="dashboard-grid-2">
            <div className="glass-panel section-card">
              <h3 className="section-title" style={{ marginBottom: '0.5rem' }}>Operational Reports</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Export comprehensive system spreadsheets for audit, accounting, and occupancy verification.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>Resident & Occupancy Roster</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Full resident roster, contact details, assigned rooms, and monthly rent fees.</p>
                  </div>
                  <button 
                    className="btn-primary" 
                    disabled={downloading === 'members'}
                    onClick={() => handleDownloadCSV('members')}
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                  >
                    <Download size={14} /> {downloading === 'members' ? 'Exporting...' : 'Export CSV'}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>Fee & Payment Ledger</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Complete financial transaction log, receipt numbers, status, and payment modes.</p>
                  </div>
                  <button 
                    className="btn-primary" 
                    disabled={downloading === 'payments'}
                    onClick={() => handleDownloadCSV('payments')}
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                  >
                    <Download size={14} /> {downloading === 'payments' ? 'Exporting...' : 'Export CSV'}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>Operational Expenses Log</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Detailed record of mess, maintenance, labor salaries, and utility bills.</p>
                  </div>
                  <button 
                    className="btn-primary" 
                    disabled={downloading === 'expenses'}
                    onClick={() => handleDownloadCSV('expenses')}
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                  >
                    <Download size={14} /> {downloading === 'expenses' ? 'Exporting...' : 'Export CSV'}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Breakdown Summary */}
            <div className="glass-panel section-card">
              <h3 className="section-title" style={{ marginBottom: '1rem' }}>Room Occupancy Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    <span>Occupied Capacity</span>
                    <span style={{ fontWeight: '600', color: '#10b981' }}>{occupancyData.occupied_beds} Beds</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${occupancyData.occupancy_rate}%`, height: '100%', background: '#10b981', borderRadius: '4px' }} />
                  </div>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    <span>Vacant Beds Available</span>
                    <span style={{ fontWeight: '600', color: '#3b82f6' }}>{occupancyData.available_beds} Beds</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${100 - occupancyData.occupancy_rate}%`, height: '100%', background: '#3b82f6', borderRadius: '4px' }} />
                  </div>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(245,158,11,0.05)', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.2)', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: '600', color: '#f59e0b', marginBottom: '0.25rem' }}>Pending Dues Alert</div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    ₹{financialData.total_pending.toLocaleString('en-IN')} in unpaid resident dues requires collection follow-up.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

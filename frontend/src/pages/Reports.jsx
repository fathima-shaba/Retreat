import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { FileText, Download, TrendingUp, Users, Wallet } from 'lucide-react';

const Reports = () => {
  const handleExport = (type) => {
    alert(`Exporting ${type} report... (Simulated Download)`);
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="page-content" style={{ paddingBottom: '6rem' }}>
          <div className="page-header">
            <div>
              <h1 className="page-title">Reports & Analytics</h1>
              <p className="page-subtitle">Export data and view hostel insights</p>
            </div>
          </div>
          
          <div className="dashboard-grid-3">
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', width: '3rem', height: '3rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>Occupancy Report</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Monthly breakdown of room allocation and vacancy.</p>
              </div>
              <button className="btn-primary" onClick={() => handleExport('CSV')} style={{ padding: '0.5rem', fontSize: '0.875rem', marginTop: 'auto', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                <Download size={16} style={{ marginRight: '0.5rem' }} /> Export CSV
              </button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: '3rem', height: '3rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>Financial Summary</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Revenue collected and pending dues overview.</p>
              </div>
              <button className="btn-primary" onClick={() => handleExport('PDF')} style={{ padding: '0.5rem', fontSize: '0.875rem', marginTop: 'auto', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                <Download size={16} style={{ marginRight: '0.5rem' }} /> Export PDF
              </button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', width: '3rem', height: '3rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>Maintenance Log</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>History of all complaints and resolution times.</p>
              </div>
              <button className="btn-primary" onClick={() => handleExport('Excel')} style={{ padding: '0.5rem', fontSize: '0.875rem', marginTop: 'auto', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                <Download size={16} style={{ marginRight: '0.5rem' }} /> Export Excel
              </button>
            </div>
          </div>

          <div className="glass-panel section-card" style={{ marginTop: '2rem' }}>
             <h2 className="section-title">Quick Stats</h2>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                <div style={{ textAlign: 'center' }}>
                   <TrendingUp size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                   <p>Detailed charts will appear here when connected to the data pipeline.</p>
                </div>
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Reports;

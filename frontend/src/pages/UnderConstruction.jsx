import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Wrench } from 'lucide-react';

const UnderConstruction = ({ title }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '2rem', borderRadius: '50%', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
            <Wrench size={64} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{title || 'Under Construction'}</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
            This module is currently in development and will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnderConstruction;

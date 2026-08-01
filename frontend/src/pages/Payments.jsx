import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Payments = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = user.role === 'admin';
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/payments', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setPayments(data))
    .catch(err => console.error(err));
  }, []);

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Payments</h1>
              <p className="page-subtitle">Track payment history</p>
            </div>
            {isAdmin && (
              <button className="btn-primary">
                <Plus size={18} /> Record Payment
              </button>
            )}
          </div>
          <div className="glass-panel section-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem' }}>Member Name</th>
                  <th style={{ padding: '1rem' }}>Amount</th>
                  <th style={{ padding: '1rem' }}>Date</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  {isAdmin && <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {payments.length > 0 ? payments.map(payment => (
                  <tr key={payment.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem' }}>{payment.member_name}</td>
                    <td style={{ padding: '1rem' }}>₹{payment.amount}</td>
                    <td style={{ padding: '1rem' }}>{new Date(payment.payment_date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                        background: payment.status === 'Paid' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        color: payment.status === 'Paid' ? '#10b981' : '#f59e0b'
                      }}>{payment.status}</span>
                    </td>
                    {isAdmin && (
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button className="icon-btn" style={{ background: 'rgba(255,255,255,0.05)', marginRight: '0.5rem' }}>
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-btn" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                )) : (
                  <tr><td colSpan={isAdmin ? "5" : "4"} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No payments found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Payments;

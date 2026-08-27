import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Plus, X, Edit2, Trash2, Wallet, TrendingDown, Calendar, Receipt } from 'lucide-react';

const Expenses = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = user.role === 'admin';
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({ daily: 0, monthly: 0, yearly: 0, allTime: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [expenseData, setExpenseData] = useState({
    category: 'Food',
    amount: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0]
  });

  const fetchExpenses = () => {
    fetch(import.meta.env.VITE_API_URL + '/expenses', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setExpenses(Array.isArray(data) ? data : []))
    .catch(err => console.error(err));
  };

  const fetchStats = () => {
    fetch(import.meta.env.VITE_API_URL + '/expenses/stats', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data && !data.error) setStats(data);
    })
    .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchExpenses();
    fetchStats();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setExpenseData({ category: 'Food', amount: '', description: '', expense_date: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const openEditModal = (expense) => {
    setEditingId(expense.id);
    setExpenseData({
      category: expense.category,
      amount: expense.amount,
      description: expense.description || '',
      expense_date: new Date(expense.expense_date).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if(res.ok) {
        fetchExpenses();
        fetchStats();
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId ? `${import.meta.env.VITE_API_URL}/expenses/${editingId}` : import.meta.env.VITE_API_URL + '/expenses';
    const method = editingId ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(expenseData)
      });

      if (res.ok) {
        setShowModal(false);
        fetchExpenses();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
      alert("Error saving expense");
    }
  };

  const categories = ['Food', 'Salary', 'Maintenance', 'Utilities', 'Supplies', 'Other'];

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Expense Tracker</h1>
              <p className="page-subtitle">Monitor hostel outflows, daily, monthly, and yearly</p>
            </div>
            {isAdmin && (
              <button className="btn-primary" onClick={openAddModal}>
                <Plus size={18} /> Log Expense
              </button>
            )}
          </div>

          <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
            <div className="glass-panel stat-card">
              <div className="stat-header">
                <span>Today's Expenses</span>
                <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><TrendingDown size={20} /></div>
              </div>
              <div className="stat-value">₹{stats.daily || 0}</div>
            </div>
            <div className="glass-panel stat-card">
              <div className="stat-header">
                <span>This Month</span>
                <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}><Calendar size={20} /></div>
              </div>
              <div className="stat-value">₹{stats.monthly || 0}</div>
            </div>
            <div className="glass-panel stat-card">
              <div className="stat-header">
                <span>This Year</span>
                <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-primary)' }}><Wallet size={20} /></div>
              </div>
              <div className="stat-value">₹{stats.yearly || 0}</div>
            </div>
            <div className="glass-panel stat-card">
              <div className="stat-header">
                <span>All Time Total</span>
                <div className="stat-icon" style={{ background: 'rgba(255, 255, 255, 0.1)' }}><Receipt size={20} /></div>
              </div>
              <div className="stat-value">₹{stats.allTime || 0}</div>
            </div>
          </div>
          
          <div className="glass-panel section-card" style={{ overflowX: 'auto' }}>
            <h2 className="section-title" style={{ padding: '0 0 1rem 0' }}>Expense Logs</h2>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem' }}>Date</th>
                  <th style={{ padding: '1rem' }}>Category</th>
                  <th style={{ padding: '1rem' }}>Description</th>
                  <th style={{ padding: '1rem' }}>Amount</th>
                  {isAdmin && <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {expenses.length > 0 ? expenses.map(expense => (
                  <tr key={expense.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem' }}>{new Date(expense.expense_date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                        background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)'
                      }}>{expense.category}</span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{expense.description || '-'}</td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: '#ef4444' }}>₹{expense.amount}</td>
                    {isAdmin && (
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button onClick={() => openEditModal(expense)} className="icon-btn" style={{ background: 'rgba(255,255,255,0.05)', marginRight: '0.5rem' }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(expense.id)} className="icon-btn" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                )) : (
                  <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No expenses recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel section-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative' }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', color: 'var(--text-secondary)' }}
            >
              <X size={20} />
            </button>
            <h2 className="section-title">{editingId ? 'Edit Expense' : 'Log Expense'}</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label>Category</label>
                <select 
                  className="input-field" 
                  value={expenseData.category}
                  onChange={(e) => setExpenseData({...expenseData, category: e.target.value})}
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Amount (₹)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="0.00"
                  value={expenseData.amount}
                  onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea 
                  className="input-field" 
                  placeholder="e.g. Rice and vegetables"
                  value={expenseData.description}
                  onChange={(e) => setExpenseData({...expenseData, description: e.target.value})}
                  style={{ resize: 'vertical', minHeight: '60px' }}
                />
              </div>

              <div className="form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={expenseData.expense_date}
                  onChange={(e) => setExpenseData({...expenseData, expense_date: e.target.value})}
                  required 
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                {editingId ? 'Update Expense' : 'Save Expense'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;

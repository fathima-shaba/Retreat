import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import CustomSelect from '../components/CustomSelect';
import { Plus, X, Edit2, Trash2, Calendar, Filter, DollarSign, PieChart, TrendingUp, Tag, FileText, CheckCircle2, ChevronRight, RefreshCw, FolderPlus } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';

const Expenses = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = user.role === 'admin';

  // Core States
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    today: 0, todayCount: 0,
    yesterday: 0, yesterdayCount: 0,
    thisWeek: 0, thisWeekCount: 0,
    thisMonth: 0, thisMonthCount: 0,
    thisYear: 0, thisYearCount: 0,
    allTime: 0, allTimeCount: 0,
    categoryBreakdown: []
  });

  // Filter States
  const [activePeriod, setActivePeriod] = useState('all'); // 'all', 'today', 'yesterday', 'week', 'month', 'year', 'custom'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal States
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState('');
  
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [expenseData, setExpenseData] = useState({
    category: 'Mess',
    amount: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: 'Cash',
    notes: ''
  });

  // Fetch Categories from DB
  const fetchCategories = () => {
    fetch(`${API_BASE_URL}/expenses/categories`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setCategories(data);
    })
    .catch(err => console.error("Error fetching categories:", err));
  };

  // Fetch Expenses with Filter params
  const fetchExpenses = () => {
    let queryParams = new URLSearchParams();
    if (activePeriod !== 'all') queryParams.append('period', activePeriod);
    if (selectedCategory && selectedCategory !== 'All') queryParams.append('category', selectedCategory);
    if (activePeriod === 'custom' && startDate && endDate) {
      queryParams.append('startDate', startDate);
      queryParams.append('endDate', endDate);
    }

    fetch(`${API_BASE_URL}/expenses?${queryParams.toString()}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setExpenses(Array.isArray(data) ? data : []))
    .catch(err => console.error("Error fetching expenses:", err));
  };

  // Fetch Real-time SQL Aggregate Stats
  const fetchStats = () => {
    let queryParams = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'All') queryParams.append('category', selectedCategory);
    if (startDate && endDate) {
      queryParams.append('startDate', startDate);
      queryParams.append('endDate', endDate);
    }

    fetch(`${API_BASE_URL}/expenses/stats?${queryParams.toString()}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data && !data.error) setStats(data);
    })
    .catch(err => console.error("Error fetching expense stats:", err));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchExpenses();
    fetchStats();
  }, [activePeriod, selectedCategory, startDate, endDate]);

  // Modal Triggers
  const openAddModal = () => {
    setEditingId(null);
    setValidationError('');
    const defaultCat = categories.length > 0 ? categories[0].name : 'Mess';
    setExpenseData({ 
      category: defaultCat, 
      amount: '', 
      description: '', 
      expense_date: new Date().toISOString().split('T')[0],
      payment_method: 'Cash',
      notes: ''
    });
    setShowExpenseModal(true);
  };

  const openEditModal = (expense) => {
    setEditingId(expense.id);
    setValidationError('');
    setExpenseData({
      category: expense.category,
      amount: String(expense.amount),
      description: expense.description || '',
      expense_date: expense.expense_date ? expense.expense_date.split('T')[0] : new Date().toISOString().split('T')[0],
      payment_method: expense.payment_method || 'Cash',
      notes: expense.notes || ''
    });
    setShowExpenseModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense record?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setSuccessMessage('Expense record deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchExpenses();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Form Validation & Submission
  const validateForm = () => {
    if (!expenseData.amount || isNaN(parseFloat(expenseData.amount)) || parseFloat(expenseData.amount) <= 0) {
      setValidationError('Please enter a valid positive monetary amount.');
      return false;
    }
    if (!expenseData.category) {
      setValidationError('Please select an expense category.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const url = editingId ? `${API_BASE_URL}/expenses/${editingId}` : `${API_BASE_URL}/expenses`;
    const method = editingId ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          category: expenseData.category,
          amount: parseFloat(expenseData.amount),
          description: expenseData.description.trim(),
          expense_date: expenseData.expense_date,
          payment_method: expenseData.payment_method,
          notes: expenseData.notes.trim()
        })
      });

      if (res.ok) {
        setShowExpenseModal(false);
        setSuccessMessage(editingId ? 'Expense updated & totals recalculated!' : 'Expense logged & totals updated!');
        setTimeout(() => setSuccessMessage(''), 3500);
        fetchExpenses();
        fetchStats();
      } else {
        const errorData = await res.json();
        setValidationError(errorData.error || "Failed to save expense.");
      }
    } catch (err) {
      console.error(err);
      setValidationError("Error saving expense.");
    }
  };

  // Category Management Handlers
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/expenses/categories`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });

      if (res.ok) {
        setNewCategoryName('');
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCategory = async (id) => {
    if (!editingCatName.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/expenses/categories/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ name: editingCatName.trim() })
      });

      if (res.ok) {
        setEditingCatId(null);
        setEditingCatName('');
        fetchCategories();
        fetchExpenses();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this expense category?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/expenses/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    if (expenses.length === 0) return alert("No expenses to export.");
    const headers = ["Date", "Category", "Description", "Payment Method", "Amount (INR)", "Notes"];
    const rows = expenses.map(e => [
      new Date(e.expense_date).toLocaleDateString(),
      `"${e.category}"`,
      `"${e.description || ''}"`,
      `"${e.payment_method || 'Cash'}"`,
      e.amount,
      `"${e.notes || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Hostel_Expenses_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const periodTabStyle = (periodKey) => ({
    background: activePeriod === periodKey ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
    color: activePeriod === periodKey ? '#ffffff' : 'var(--text-secondary)',
    padding: '0.45rem 0.9rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: activePeriod === periodKey ? '600' : '500',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease'
  });

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="page-content">
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h1 className="page-title">Expense Tracker & Analytics</h1>
              <p className="page-subtitle">Track, categorize, and auto-recalculate all hostel expenditures</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                className="btn-secondary" 
                onClick={() => setShowCategoryModal(true)}
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              >
                <Settings size={16} style={{ marginRight: '0.4rem' }} /> Manage Categories
              </button>
              <button className="btn-secondary" onClick={handleExportCSV} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                <Download size={16} style={{ marginRight: '0.4rem' }} /> Export CSV
              </button>
              {isAdmin && (
                <button className="btn-primary" onClick={openAddModal}>
                  <Plus size={18} /> Log Expense
                </button>
              )}
            </div>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.9rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle2 size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Top Summary Stat Dashboard Cards */}
          <div className="stat-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="glass-panel stat-card">
              <div className="stat-header">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Today's Expense</span>
              </div>
              <div className="stat-value" style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '1.5rem' }}>
                ₹{stats.today.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {stats.todayCount} entry{stats.todayCount !== 1 ? 'ies' : ''}
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-header">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Yesterday's Expense</span>
              </div>
              <div className="stat-value" style={{ marginTop: '0.25rem', fontSize: '1.5rem' }}>
                ₹{stats.yesterday.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {stats.yesterdayCount} entry{stats.yesterdayCount !== 1 ? 'ies' : ''}
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-header">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>This Week</span>
              </div>
              <div className="stat-value" style={{ marginTop: '0.25rem', fontSize: '1.5rem' }}>
                ₹{stats.thisWeek.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {stats.thisWeekCount} entry{stats.thisWeekCount !== 1 ? 'ies' : ''}
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-header">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>This Month</span>
              </div>
              <div className="stat-value" style={{ color: '#f59e0b', marginTop: '0.25rem', fontSize: '1.5rem' }}>
                ₹{stats.thisMonth.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {stats.thisMonthCount} entry{stats.thisMonthCount !== 1 ? 'ies' : ''}
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-header">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>This Year</span>
              </div>
              <div className="stat-value" style={{ marginTop: '0.25rem', fontSize: '1.5rem' }}>
                ₹{stats.thisYear.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {stats.thisYearCount} entry{stats.thisYearCount !== 1 ? 'ies' : ''}
              </div>
            </div>
          </div>

          {/* Period Filter Toolbar */}
          <div className="glass-panel" style={{ padding: '1rem', borderRadius: '14px', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginRight: '0.25rem' }}>Period:</span>
              <button style={periodTabStyle('all')} onClick={() => setActivePeriod('all')}>All Time</button>
              <button style={periodTabStyle('today')} onClick={() => setActivePeriod('today')}>Today</button>
              <button style={periodTabStyle('yesterday')} onClick={() => setActivePeriod('yesterday')}>Yesterday</button>
              <button style={periodTabStyle('week')} onClick={() => setActivePeriod('week')}>This Week</button>
              <button style={periodTabStyle('month')} onClick={() => setActivePeriod('month')}>This Month</button>
              <button style={periodTabStyle('year')} onClick={() => setActivePeriod('year')}>This Year</button>
              <button style={periodTabStyle('custom')} onClick={() => setActivePeriod('custom')}>Custom Range</button>
            </div>

            {activePeriod === 'custom' && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input 
                  type="date" 
                  className="input-field" 
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.85rem' }} 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                />
                <span style={{ color: 'var(--text-secondary)' }}>to</span>
                <input 
                  type="date" 
                  className="input-field" 
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.85rem' }} 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', minWidth: '200px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Category:</span>
              <CustomSelect 
                options={['All', ...categories.map(c => c.name)]}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              />
            </div>
          </div>

          {/* Main Grid: Category Breakdown Progress & Expense Table */}
          <div className="dashboard-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
            
            {/* Category Breakdown Card */}
            <div className="glass-panel section-card">
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tag size={18} color="var(--accent-primary)" /> Category Breakdown
              </h3>

              {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {stats.categoryBreakdown.map((cat, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: '500' }}>{cat.category}</span>
                        <span>
                          <strong>₹{cat.total_amount.toLocaleString()}</strong> ({cat.percentage}%)
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${cat.percentage}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '3px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>
                  No expense records found for selected period.
                </p>
              )}
            </div>

            {/* Expenses Table */}
            <div className="glass-panel section-card table-responsive-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>
                  Expense Records ({expenses.length})
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                  Total: ₹{expenses.reduce((sum, e) => sum + Number(e.amount), 0).toLocaleString()}
                </span>
              </div>

              <table style={{ width: '100%', minWidth: '650px', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Title / Description</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Payment</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                    {isAdmin && <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {expenses.length > 0 ? expenses.map((expense) => (
                    <tr key={expense.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {new Date(expense.expense_date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: 'var(--accent-primary)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          fontWeight: '500'
                        }}>
                          {expense.category}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{expense.description || expense.category}</div>
                        {expense.notes && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{expense.notes}</div>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {expense.payment_method || 'Cash'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#ef4444' }}>
                        ₹{Number(expense.amount).toLocaleString()}
                      </td>
                      {isAdmin && (
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button 
                              title="Edit Expense"
                              onClick={() => openEditModal(expense)} 
                              className="icon-btn" 
                              style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent-primary)' }}
                            >
                              <Edit2 size={15} />
                            </button>
                            <button 
                              title="Delete Expense"
                              onClick={() => handleDelete(expense.id)} 
                              className="icon-btn" 
                              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No expense records match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {showExpenseModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel section-card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '2rem', position: 'relative' }}>
            <button 
              onClick={() => setShowExpenseModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', color: 'var(--text-secondary)' }}
            >
              <X size={20} />
            </button>
            <h2 className="section-title" style={{ marginBottom: '1.25rem' }}>{editingId ? 'Edit Expense Record' : 'Log New Expense'}</h2>
            
            {validationError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} flexShrink={0} />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Expense Date *</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={expenseData.expense_date} 
                    onChange={(e) => setExpenseData({...expenseData, expense_date: e.target.value})} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <CustomSelect 
                    options={categories.map(c => c.name)}
                    value={expenseData.category}
                    onChange={(e) => setExpenseData({...expenseData, category: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Title / Description *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Monthly Electricity Bill / Food Provisions"
                  value={expenseData.description}
                  onChange={(e) => { setValidationError(''); setExpenseData({...expenseData, description: e.target.value}); }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Amount (₹) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    className="input-field" 
                    placeholder="0.00"
                    value={expenseData.amount}
                    onChange={(e) => { setValidationError(''); setExpenseData({...expenseData, amount: e.target.value}); }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Payment Method</label>
                  <CustomSelect 
                    options={['Cash', 'UPI / GPay', 'Bank Transfer', 'Credit Card', 'Cheque', 'Other']}
                    value={expenseData.payment_method}
                    onChange={(e) => setExpenseData({...expenseData, payment_method: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes / Remarks</label>
                <textarea 
                  className="input-field" 
                  rows="2"
                  placeholder="Additional expense notes..."
                  value={expenseData.notes}
                  onChange={(e) => setExpenseData({...expenseData, notes: e.target.value})}
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowExpenseModal(false)}
                  className="btn-secondary"
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ padding: '0.65rem 1.5rem', borderRadius: '10px' }}
                >
                  {editingId ? 'Save & Recalculate' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Categories Modal */}
      {showCategoryModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel section-card animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '2rem', position: 'relative', maxHeight: '85vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setShowCategoryModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', color: 'var(--text-secondary)' }}
            >
              <X size={20} />
            </button>
            <h2 className="section-title" style={{ marginBottom: '1.25rem' }}>Expense Categories</h2>
            
            {/* Add New Category Input */}
            <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="New Category (e.g. Laundry)"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                + Add
              </button>
            </form>

            {/* List of Existing Categories */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {categories.map((cat) => (
                <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  {editingCatId === cat.id ? (
                    <div style={{ display: 'flex', gap: '0.5rem', flex: 1, marginRight: '0.5rem' }}>
                      <input 
                        type="text" 
                        className="input-field" 
                        value={editingCatName}
                        onChange={(e) => setEditingCatName(e.target.value)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                      />
                      <button type="button" onClick={() => handleUpdateCategory(cat.id)} className="btn-primary" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
                        Save
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{cat.name}</span>
                  )}

                  {editingCatId !== cat.id && (
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button 
                        onClick={() => { setEditingCatId(cat.id); setEditingCatName(cat.name); }} 
                        className="icon-btn" 
                        style={{ padding: '4px', background: 'none', color: 'var(--text-secondary)' }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(cat.id)} 
                        className="icon-btn" 
                        style={{ padding: '4px', background: 'none', color: '#ef4444' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;

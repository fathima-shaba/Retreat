import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SearchInput from '../components/SearchInput';
import SelectDropdown from '../components/SelectDropdown';
import { Plus, X, Edit2, Trash2, Filter, Wallet, CheckCircle2, Clock, AlertCircle, Calendar } from 'lucide-react';
import { API_BASE_URL, authFetch } from '../apiConfig';

const Payments = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = user.role === 'admin';

  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  
  // Filtering & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Paid');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [receiptNo, setReceiptNo] = useState('');
  const [remarks, setRemarks] = useState('');

  // Fetch Payments from Backend
  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authFetch(`${API_BASE_URL}/payments`);
      if (!res || !res.ok) throw new Error("Failed to fetch payments.");
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Members List for Modal Dropdown
  const fetchMembers = async () => {
    try {
      const res = await authFetch(`${API_BASE_URL}/members`);
      if (res && res.ok) {
        const data = await res.json();
        setMembers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch residents list", err);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchMembers();
  }, []);

  // Open Modal for Creating or Editing
  const openModal = (payment = null) => {
    setSubmitError('');
    if (payment) {
      setEditingId(payment.id);
      setMemberId(payment.member_id || '');
      setAmount(payment.amount || '');
      setPaymentDate(payment.payment_date ? payment.payment_date.split('T')[0] : new Date().toISOString().split('T')[0]);
      setStatus(payment.status || 'Paid');
      setPaymentMode(payment.payment_mode || 'Cash');
      setReceiptNo(payment.receipt_no || '');
      setRemarks(payment.remarks || '');
    } else {
      setEditingId(null);
      setMemberId(members.length > 0 ? members[0].id : '');
      setAmount('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setStatus('Paid');
      setPaymentMode('Cash');
      setReceiptNo(`REC-${new Date().toISOString().slice(0,7).replace('-','')}-${Math.floor(1000 + Math.random() * 9000)}`);
      setRemarks('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setSubmitError('');
  };

  // Handle Form Submit (POST / PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!memberId) {
      setSubmitError("Please select a resident.");
      return;
    }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setSubmitError("Please enter a valid positive amount.");
      return;
    }

    const payload = {
      member_id: parseInt(memberId),
      amount: parseFloat(amount),
      payment_date: paymentDate,
      status: status,
      payment_mode: paymentMode,
      receipt_no: receiptNo,
      remarks: remarks
    };

    const token = localStorage.getItem('token');
    const url = editingId ? `${API_BASE_URL}/payments/${editingId}` : `${API_BASE_URL}/payments`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await authFetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        closeModal();
        fetchPayments();
      } else {
        setSubmitError(data.error || data.message || "Failed to record payment.");
      }
    } catch (err) {
      setSubmitError("Error connecting to server.");
    }
  };

  // Handle Delete Payment
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment record?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await authFetch(`${API_BASE_URL}/payments/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchPayments();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete payment.");
      }
    } catch (err) {
      alert("Error connecting to server.");
    }
  };

  // Calculate Summary Statistics
  const totalPaidRevenue = payments
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const totalPendingFees = payments
    .filter(p => p.status === 'Pending' || p.status === 'Overdue')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  // Filtered Payments List
  const filteredPayments = payments.filter(p => {
    const matchesName = (p.member_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (p.receipt_no || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesName && matchesStatus;
  });

  const getStatusBadgeStyle = (pStatus) => {
    switch (pStatus) {
      case 'Paid':
        return { background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' };
      case 'Pending':
        return { background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' };
      case 'Overdue':
        return { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' };
      default:
        return { background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' };
    }
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="page-content">
          {/* Page Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Fees & Payments</h1>
              <p className="page-subtitle">Record transactions, manage receipts, and track resident fee ledgers</p>
            </div>
            {isAdmin && (
              <button className="btn-primary" onClick={() => openModal()}>
                <Plus size={18} /> Record New Payment
              </button>
            )}
          </div>

          {/* Summary Stat Cards */}
          <div className="stat-grid-4" style={{ marginBottom: '1.5rem' }}>
            <div className="glass-panel stat-card">
              <div className="stat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Total Paid Revenue</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem', color: '#10b981' }}>
                ₹{Number(totalPaidRevenue || 0).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                    <Clock size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Pending & Overdue Fees</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem', color: '#f59e0b' }}>
                ₹{Number(totalPendingFees || 0).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                    <Wallet size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Total Transactions</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem' }}>
                {payments.length}
              </div>
            </div>
          </div>

          {/* Filters & Search Controls */}
          <div className="glass-panel section-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ maxWidth: '320px', flex: 1 }}>
                <SearchInput 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by resident name or receipt #..."
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Filter size={16} style={{ color: 'var(--text-secondary)', marginRight: '0.25rem' }} />
                {['All', 'Paid', 'Pending', 'Overdue'].map(statusOpt => (
                  <button
                    key={statusOpt}
                    onClick={() => setStatusFilter(statusOpt)}
                    className={`pill-btn ${statusFilter === statusOpt ? 'active' : ''}`}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      border: 'none',
                      cursor: 'pointer',
                      background: statusFilter === statusOpt ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                      color: statusFilter === statusOpt ? '#ffffff' : 'var(--text-secondary)'
                    }}
                  >
                    {statusOpt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error Alert Banner */}
          {error && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '8px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {/* Table Container */}
          <div className="glass-panel section-card table-responsive-container">
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Loading fee & payment records...
              </div>
            ) : (
              <table style={{ width: '100%', minWidth: '700px', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '1rem' }}>Receipt #</th>
                    <th style={{ padding: '1rem' }}>Resident Name</th>
                    <th style={{ padding: '1rem' }}>Amount</th>
                    <th style={{ padding: '1rem' }}>Mode</th>
                    <th style={{ padding: '1rem' }}>Payment Date</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    {isAdmin && <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map(payment => (
                      <tr key={payment.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--accent-primary)' }}>
                          {payment.receipt_no || `REC-${payment.id}`}
                        </td>
                        <td style={{ padding: '1rem', fontWeight: '500' }}>
                          {payment.member_name || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Unknown Resident</span>}
                        </td>
                        <td style={{ padding: '1rem', fontWeight: '600' }}>
                          ₹{Number(payment?.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                          <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                            {payment.payment_mode || 'Cash'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: '12px', 
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            ...getStatusBadgeStyle(payment.status)
                          }}>
                            {payment.status}
                          </span>
                        </td>
                        {isAdmin && (
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <button 
                              onClick={() => openModal(payment)}
                              className="icon-btn" 
                              style={{ background: 'rgba(255,255,255,0.05)', marginRight: '0.5rem' }}
                              title="Edit Payment"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(payment.id)}
                              className="icon-btn" 
                              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                              title="Delete Payment"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isAdmin ? "7" : "6"} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No payment records found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Record / Edit Payment Modal */}
      {isModalOpen && (
        <div className="modal-overlay animate-fade-in" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            background: 'var(--bg-secondary, #18181b)',
            border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
            borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                {editingId ? 'Edit Payment Record' : 'Record New Payment'}
              </h2>
              <button onClick={closeModal} className="icon-btn" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {submitError && (
              <div style={{ marginBottom: '1rem', padding: '0.65rem 0.85rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '8px', fontSize: '0.85rem' }}>
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '500' }}>Receipt Number</label>
                <input
                  type="text"
                  className="input-field"
                  value={receiptNo}
                  onChange={(e) => setReceiptNo(e.target.value)}
                  placeholder="Auto-generated if left empty"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'inherit', border: '1px solid var(--border-color)', fontFamily: 'monospace' }}
                />
              </div>

              <div className="form-group">
                <SelectDropdown
                  label="Resident / Member"
                  required
                  placeholder="-- Select Resident --"
                  options={members.map(m => ({ value: m.id, label: `${m.name} (${m.email})` }))}
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '500' }}>Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    placeholder="e.g. 6000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <SelectDropdown
                    label="Payment Mode"
                    options={[
                      { value: 'Cash', label: 'Cash' },
                      { value: 'UPI', label: 'UPI / GPay / PhonePe' },
                      { value: 'Bank Transfer', label: 'Bank Transfer (NEFT/IMPS)' },
                      { value: 'Card', label: 'Credit/Debit Card' }
                    ]}
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '500' }}>Payment Date *</label>
                  <input
                    type="date"
                    className="input-field"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <SelectDropdown
                    label="Status"
                    required
                    options={[
                      { value: 'Paid', label: 'Paid' },
                      { value: 'Pending', label: 'Pending' },
                      { value: 'Overdue', label: 'Overdue' }
                    ]}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '500' }}>Remarks / Reference</label>
                <textarea
                  className="input-field"
                  rows="2"
                  placeholder="Optional payment notes, transaction ID..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'inherit', border: '1px solid var(--border-color)', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={closeModal} className="btn-secondary" style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'inherit', border: 'none', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.2rem', borderRadius: '8px' }}>
                  {editingId ? 'Update Payment' : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;

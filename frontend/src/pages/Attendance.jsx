import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SearchInput from '../components/SearchInput';
import { UserCheck, UserX, Clock, Calendar, Save, Filter, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { API_BASE_URL, authFetch } from '../apiConfig';

const Attendance = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = user.role === 'admin';

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Fetch Attendance for the selected date
  const fetchAttendance = async (dateStr) => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await authFetch(`${API_BASE_URL}/attendance?date=${dateStr}`);

      if (!res || !res.ok) throw new Error("Failed to fetch attendance data.");
      const data = await res.json();
      setRoster(Array.isArray(data.roster) ? data.roster : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate]);

  // Toggle status for single resident
  const handleStatusChange = (residentId, newStatus) => {
    setRoster(prev => prev.map(r => 
      r.resident_id === residentId ? { ...r, status: newStatus } : r
    ));
  };

  // Bulk mark all
  const handleMarkAll = (status) => {
    setRoster(prev => prev.map(r => ({ ...r, status })));
  };

  const handleRemarksChange = (residentId, text) => {
    setRoster(prev => prev.map(r => 
      r.resident_id === residentId ? { ...r, remarks: text } : r
    ));
  };

  // Save Attendance to Backend
  const handleSaveAttendance = async () => {
    setIsSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      const payload = {
        date: selectedDate,
        records: roster.map(r => ({
          resident_id: r.resident_id,
          date: selectedDate,
          status: r.status,
          remarks: r.remarks
        }))
      };

      const res = await authFetch(`${API_BASE_URL}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Attendance for ${selectedDate} saved successfully!`);
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchAttendance(selectedDate);
      } else {
        setError(data.error || "Failed to save attendance.");
      }
    } catch (err) {
      setError("Error connecting to server.");
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate Summary Statistics
  const totalCount = roster.length;
  const presentCount = roster.filter(r => r.status === 'Present').length;
  const absentCount = roster.filter(r => r.status === 'Absent').length;
  const lateCount = roster.filter(r => r.status === 'Late').length;

  const presentPct = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : '0';

  // Filtered Roster
  const filteredRoster = roster.filter(r => {
    const matchesName = (r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (r.room_number || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesName && matchesStatus;
  });

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="page-content" style={{ paddingBottom: '6rem' }}>
          {/* Page Header */}
          <div className="page-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="page-title">Attendance Roster</h1>
              <p className="page-subtitle">Track daily resident presence, absences, and late arrivals</p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <Calendar size={16} style={{ color: 'var(--accent-primary)' }} />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'inherit', fontSize: '0.875rem', outline: 'none', cursor: 'pointer' }}
                />
              </div>

              {isAdmin && (
                <button
                  onClick={handleSaveAttendance}
                  disabled={isSaving || loading}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Save size={18} />
                  {isSaving ? 'Saving...' : 'Save Attendance'}
                </button>
              )}
            </div>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '8px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} /> {successMsg}
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '8px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {/* Summary Stat Cards */}
          <div className="stat-grid-4" style={{ marginBottom: '1.5rem' }}>
            <div className="glass-panel stat-card">
              <div className="stat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <UserCheck size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Present ({presentPct}%)</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem', color: '#10b981' }}>{presentCount}</div>
            </div>
            
            <div className="glass-panel stat-card">
              <div className="stat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                    <UserX size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Absent</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem', color: '#ef4444' }}>{absentCount}</div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                    <Clock size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Late</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem', color: '#f59e0b' }}>{lateCount}</div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Roster</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem' }}>{totalCount}</div>
            </div>
          </div>

          {/* Controls Bar: Search, Status Filter & Bulk Actions */}
          <div className="glass-panel section-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ maxWidth: '300px', flex: 1 }}>
                <SearchInput 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search resident or room..."
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <Filter size={16} style={{ color: 'var(--text-secondary)', marginRight: '0.25rem' }} />
                {['All', 'Present', 'Absent', 'Late'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      border: 'none',
                      cursor: 'pointer',
                      background: statusFilter === st ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                      color: statusFilter === st ? '#ffffff' : 'var(--text-secondary)'
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {isAdmin && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleMarkAll('Present')}
                    style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', cursor: 'pointer', fontWeight: '500' }}
                  >
                    Mark All Present
                  </button>
                  <button
                    onClick={() => handleMarkAll('Absent')}
                    style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', fontWeight: '500' }}
                  >
                    Mark All Absent
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Roster Table */}
          <div className="glass-panel section-card table-responsive-container">
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Loading attendance roster for {selectedDate}...
              </div>
            ) : (
              <table style={{ width: '100%', minWidth: '650px', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '1rem' }}>Resident Name</th>
                    <th style={{ padding: '1rem' }}>Room #</th>
                    <th style={{ padding: '1rem' }}>Attendance Status</th>
                    <th style={{ padding: '1rem' }}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoster.length > 0 ? (
                    filteredRoster.map(item => (
                      <tr key={item.resident_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem', fontWeight: '500' }}>
                          {item.name}
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                          {item.room_number}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            {['Present', 'Absent', 'Late'].map(stOpt => {
                              const isSelected = item.status === stOpt;
                              let bg = 'rgba(255,255,255,0.05)';
                              let color = 'var(--text-secondary)';
                              let border = '1px solid transparent';

                              if (isSelected) {
                                if (stOpt === 'Present') {
                                  bg = 'rgba(16,185,129,0.2)';
                                  color = '#10b981';
                                  border = '1px solid #10b981';
                                } else if (stOpt === 'Absent') {
                                  bg = 'rgba(239,68,68,0.2)';
                                  color = '#ef4444';
                                  border = '1px solid #ef4444';
                                } else if (stOpt === 'Late') {
                                  bg = 'rgba(245,158,11,0.2)';
                                  color = '#f59e0b';
                                  border = '1px solid #f59e0b';
                                }
                              }

                              return (
                                <button
                                  key={stOpt}
                                  disabled={!isAdmin}
                                  onClick={() => setResidentStatus(item.resident_id, stOpt)}
                                  style={{
                                    padding: '0.3rem 0.7rem',
                                    borderRadius: '6px',
                                    fontSize: '0.78rem',
                                    fontWeight: isSelected ? '600' : '400',
                                    background: bg,
                                    color: color,
                                    border: border,
                                    cursor: isAdmin ? 'pointer' : 'default',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  {stOpt}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <input
                            type="text"
                            placeholder="Add remark (optional)..."
                            value={item.remarks || ''}
                            disabled={!isAdmin}
                            onChange={(e) => handleRemarkChange(item.resident_id, e.target.value)}
                            style={{
                              width: '100%',
                              maxWidth: '240px',
                              padding: '0.35rem 0.6rem',
                              borderRadius: '6px',
                              background: 'rgba(255,255,255,0.03)',
                              color: 'inherit',
                              border: '1px solid var(--border-color)',
                              fontSize: '0.8rem'
                            }}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No resident records found for attendance.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;

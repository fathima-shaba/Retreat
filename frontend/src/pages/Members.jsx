import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import CustomSelect from '../components/CustomSelect';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, X, Edit2, Trash2, Calendar, UserPlus, Tag, AlertCircle, CheckCircle2, Shield, Phone, User } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';

const Members = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = user.role === 'admin';
  const [members, setMembers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const roomFilter = queryParams.get('room');

  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    aadhar_number: '',
    guardian_name: '',
    guardian_phone: '',
    room_id: '',
    sharing_type: '',
    address: '',
    joined_date: new Date().toISOString().split('T')[0],
    admission_fee: 0,
    deposit_fee: 0,
    rent_fee: 0,
    next_due_date: '',
    member_type: 'Student',
    institution_details: ''
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const resStudents = await fetch(`${API_BASE_URL}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resStudents.ok) {
        const dataStudents = await resStudents.json();
        setMembers(Array.isArray(dataStudents) ? dataStudents : []);
      }

      const resRooms = await fetch(`${API_BASE_URL}/rooms`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resRooms.ok) {
        const dataRooms = await resRooms.json();
        setRooms(Array.isArray(dataRooms) ? dataRooms : []);
      }
      
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setValidationError('');
    setStudentData({ 
      name: '', email: '', phone: '', dob: '', aadhar_number: '', guardian_name: '', guardian_phone: '',
      room_id: '', sharing_type: '', address: '', 
      joined_date: new Date().toISOString().split('T')[0],
      admission_fee: 0, deposit_fee: 0, rent_fee: 0, next_due_date: '',
      member_type: 'Student', institution_details: ''
    });
    setShowModal(true);
  };

  const openEditModal = (member) => {
    setEditingId(member.id);
    setValidationError('');
    setStudentData({ 
      name: member.name || '', 
      email: member.email || '', 
      phone: member.phone || '', 
      dob: member.dob ? member.dob.split('T')[0] : '',
      aadhar_number: member.aadhar_number || '',
      guardian_name: member.guardian_name || '',
      guardian_phone: member.guardian_phone || '',
      room_id: member.room_id ? String(member.room_id) : '',
      sharing_type: member.sharing_type ? String(member.sharing_type) : '',
      address: member.address || '',
      joined_date: member.joined_date ? member.joined_date.split('T')[0] : '',
      admission_fee: member.admission_fee || 0,
      deposit_fee: member.deposit_fee || 0,
      rent_fee: member.rent_fee || 0,
      next_due_date: member.next_due_date ? member.next_due_date.split('T')[0] : '',
      member_type: member.member_type || 'Student',
      institution_details: member.institution_details || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this resident record?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/members/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setSuccessMessage('Resident deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to handle room selection and auto-populate rent based on sharing rates
  const handleRoomChange = (selectedRoomId) => {
    setValidationError('');
    if (!selectedRoomId) {
      setStudentData({
        ...studentData,
        room_id: '',
        sharing_type: '',
        rent_fee: 0
      });
      return;
    }

    const selectedRoom = rooms.find(r => String(r.id) === String(selectedRoomId));
    
    if (selectedRoom) {
      // Check room availability
      const currentOccupants = members.filter(m => String(m.room_id) === String(selectedRoom.id) && m.id !== editingId).length;
      if (currentOccupants >= selectedRoom.capacity) {
        setValidationError(`Warning: Room ${selectedRoom.room_number} is fully occupied (${currentOccupants}/${selectedRoom.capacity} beds assigned).`);
      }

      if (selectedRoom.sharing_rates && selectedRoom.sharing_rates.length > 0) {
        const defaultRate = selectedRoom.sharing_rates.find(sr => sr.sharing_type === selectedRoom.capacity) || selectedRoom.sharing_rates[0];
        setStudentData({
          ...studentData,
          room_id: String(selectedRoomId),
          sharing_type: String(defaultRate.sharing_type),
          rent_fee: Number(defaultRate.monthly_rent)
        });
      } else {
        setStudentData({
          ...studentData,
          room_id: String(selectedRoomId),
          sharing_type: ''
        });
      }
    }
  };

  // Helper to handle sharing arrangement selection and auto-set monthly rent
  const handleSharingChange = (selectedSharingType) => {
    setValidationError('');
    const selectedRoom = rooms.find(r => String(r.id) === String(studentData.room_id));
    
    if (selectedRoom && selectedRoom.sharing_rates) {
      const matchedRate = selectedRoom.sharing_rates.find(sr => String(sr.sharing_type) === String(selectedSharingType));
      if (matchedRate) {
        setStudentData({
          ...studentData,
          sharing_type: String(selectedSharingType),
          rent_fee: Number(matchedRate.monthly_rent)
        });
        return;
      }
    }

    setStudentData({
      ...studentData,
      sharing_type: String(selectedSharingType)
    });
  };

  const validateForm = () => {
    if (!studentData.name.trim()) {
      setValidationError('Resident full name is required.');
      return false;
    }
    if (!studentData.email.trim()) {
      setValidationError('Email address is required.');
      return false;
    }
    if (parseFloat(studentData.rent_fee) < 0 || parseFloat(studentData.admission_fee) < 0 || parseFloat(studentData.deposit_fee) < 0) {
      setValidationError('Fee amounts cannot be negative.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const url = editingId ? `${API_BASE_URL}/members/${editingId}` : `${API_BASE_URL}/members`;
    const method = editingId ? 'PUT' : 'POST';
    
    try {
      const payload = {
        name: studentData.name.trim(),
        email: studentData.email.trim(),
        phone: studentData.phone.trim(),
        dob: studentData.dob || null,
        aadhar_number: studentData.aadhar_number.trim(),
        guardian_name: studentData.guardian_name.trim(),
        guardian_phone: studentData.guardian_phone.trim(),
        room_id: studentData.room_id === '' ? null : parseInt(studentData.room_id),
        sharing_type: studentData.sharing_type === '' ? null : parseInt(studentData.sharing_type),
        address: studentData.address.trim(),
        joined_date: studentData.joined_date || null,
        admission_fee: parseFloat(studentData.admission_fee) || 0,
        deposit_fee: parseFloat(studentData.deposit_fee) || 0,
        rent_fee: parseFloat(studentData.rent_fee) || 0,
        next_due_date: studentData.next_due_date || null,
        member_type: studentData.member_type,
        institution_details: studentData.institution_details.trim()
      };

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        setSuccessMessage(editingId ? 'Resident updated successfully!' : 'Resident added successfully!');
        setTimeout(() => setSuccessMessage(''), 3500);
        fetchData();
      } else {
        const errorData = await res.json();
        setValidationError(errorData.error || errorData.message || "Failed to save resident record.");
      }
    } catch (err) {
      console.error(err);
      setValidationError("Error connecting to server to save resident.");
    }
  };

  // Get selected room rates for modal dropdown
  const currentRoomObj = rooms.find(r => String(r.id) === String(studentData.room_id));
  const currentRoomRates = currentRoomObj ? (currentRoomObj.sharing_rates || []) : [];

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Residents {roomFilter ? `- Room ${roomFilter}` : ''}</h1>
              <p className="page-subtitle">Manage resident details, room transfers, and parent/financial records</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {roomFilter && (
                <button className="icon-btn" onClick={() => navigate('/members')} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                  Clear Filter
                </button>
              )}
              {isAdmin && (
                <button className="btn-primary" onClick={openAddModal}>
                  <UserPlus size={18} /> Add Resident
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
          
          <div className="glass-panel section-card table-responsive-container">
            <table style={{ width: '100%', minWidth: '750px', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem' }}>Resident</th>
                  <th style={{ padding: '1rem' }}>Contact & Guardian</th>
                  <th style={{ padding: '1rem' }}>Room & Plan</th>
                  <th style={{ padding: '1rem' }}>Financials (Rent & Deposit)</th>
                  <th style={{ padding: '1rem' }}>Next Due</th>
                  <th style={{ padding: '1rem' }}>Joined Date</th>
                  {isAdmin && <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {members.filter(s => roomFilter ? s.room_number === roomFilter : true).length > 0 ? members.filter(s => roomFilter ? s.room_number === roomFilter : true).map(member => {
                  let isOverdue = false;
                  if (member.next_due_date) {
                      const today = new Date();
                      const dueDate = new Date(member.next_due_date);
                      if (dueDate < today) isOverdue = true;
                  }

                  return (
                    <tr key={member.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{member.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          <span style={{ 
                            background: member.member_type === 'Student' ? 'rgba(59,130,246,0.2)' : (member.member_type === 'Employee' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)'),
                            color: member.member_type === 'Student' ? '#60a5fa' : (member.member_type === 'Employee' ? '#34d399' : '#94a3b8'),
                            padding: '2px 6px', borderRadius: '4px', marginRight: '6px'
                          }}>
                            {member.member_type || 'Other'}
                          </span>
                          {member.institution_details ? member.institution_details : 'No info'}
                        </div>
                        {member.dob && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            DOB: {new Date(member.dob).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div>{member.phone || 'N/A'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{member.email}</div>
                        {member.guardian_name && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Shield size={11} /> Guardian: {member.guardian_name} {member.guardian_phone ? `(${member.guardian_phone})` : ''}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {member.room_number ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', width: 'fit-content', fontWeight: '500' }}>
                              Room {member.room_number}
                            </span>
                            {member.sharing_type && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <Tag size={12} /> {member.sharing_type} Share Plan
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600' }}>Rent: ₹{Number(member.rent_fee || 0).toLocaleString()}/mo</div>
                        {member.deposit_fee > 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#10b981' }}>
                            Deposit: ₹{Number(member.deposit_fee).toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {member.next_due_date ? (
                           <span style={{ 
                             display: 'flex', alignItems: 'center', gap: '0.3rem',
                             color: isOverdue ? '#ef4444' : 'var(--text-primary)',
                             fontWeight: isOverdue ? '600' : 'normal'
                           }}>
                             {isOverdue && <Calendar size={14} />}
                             {new Date(member.next_due_date).toLocaleDateString()}
                           </span>
                        ) : 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {member.joined_date ? new Date(member.joined_date).toLocaleDateString() : '-'}
                      </td>
                      {isAdmin && (
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button 
                              title="Edit Resident Details"
                              onClick={() => openEditModal(member)} 
                              className="icon-btn" 
                              style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent-primary)' }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              title="Delete Resident"
                              onClick={() => handleDelete(member.id)} 
                              className="icon-btn" 
                              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                }) : (
                  <tr><td colSpan={isAdmin ? 7 : 6} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No residents found. Click "Add Resident" to create one.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Resident Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel section-card animate-fade-in" style={{ width: '100%', maxWidth: '680px', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', color: 'var(--text-secondary)' }}
            >
              <X size={20} />
            </button>
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>{editingId ? 'Edit Resident Details' : 'Add New Resident'}</h2>
            
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Section 1: Personal Info */}
              <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={16} color="var(--accent-primary)" /> Resident Personal Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input type="text" className="input-field" value={studentData.name} onChange={(e) => { setValidationError(''); setStudentData({...studentData, name: e.target.value}); }} required />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input type="date" className="input-field" value={studentData.dob} onChange={(e) => setStudentData({...studentData, dob: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input type="email" className="input-field" value={studentData.email} onChange={(e) => { setValidationError(''); setStudentData({...studentData, email: e.target.value}); }} required />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="text" className="input-field" value={studentData.phone} onChange={(e) => setStudentData({...studentData, phone: e.target.value})} placeholder="e.g. 9876543210" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Aadhar / Govt ID Number</label>
                    <input type="text" className="input-field" value={studentData.aadhar_number} onChange={(e) => setStudentData({...studentData, aadhar_number: e.target.value})} placeholder="e.g. 1234-5678-9012" />
                  </div>
                </div>
              </div>

              {/* Section 2: Guardian Info */}
              <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Shield size={16} color="var(--accent-primary)" /> Guardian / Parent Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Guardian Name</label>
                    <input type="text" className="input-field" placeholder="Parent or Guardian name" value={studentData.guardian_name} onChange={(e) => setStudentData({...studentData, guardian_name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Guardian Phone Number</label>
                    <input type="text" className="input-field" placeholder="Emergency contact number" value={studentData.guardian_phone} onChange={(e) => setStudentData({...studentData, guardian_phone: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Section 3: Occupation / Resident Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Resident Type</label>
                  <CustomSelect 
                    options={[
                      { value: 'Student', label: 'Student (College / School)' },
                      { value: 'Employee', label: 'Employee / Job' },
                      { value: 'Other', label: 'Other' }
                    ]}
                    value={studentData.member_type} 
                    onChange={(e) => setStudentData({...studentData, member_type: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>{studentData.member_type === 'Student' ? 'College / School Name' : (studentData.member_type === 'Employee' ? 'Company / Workplace' : 'Additional Details')}</label>
                  <input type="text" className="input-field" value={studentData.institution_details} onChange={(e) => setStudentData({...studentData, institution_details: e.target.value})} />
                </div>
              </div>

              {/* Section 4: Room Assignment & Sharing Arrangement */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Assign Room</label>
                  <CustomSelect 
                    options={[
                      { value: '', label: '-- Unassigned --' },
                      ...rooms.map(r => ({
                        value: String(r.id),
                        label: `${r.room_number} (${r.type}) - ${r.status}`
                      }))
                    ]}
                    value={studentData.room_id}
                    onChange={(e) => handleRoomChange(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Sharing Arrangement</label>
                  {studentData.room_id && currentRoomRates.length > 0 ? (
                    <CustomSelect 
                      options={currentRoomRates.map(rate => ({
                        value: String(rate.sharing_type),
                        label: `${rate.sharing_type} Share (₹${rate.monthly_rent.toLocaleString()}/mo)`
                      }))}
                      value={studentData.sharing_type}
                      onChange={(e) => handleSharingChange(e.target.value)}
                    />
                  ) : (
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder={studentData.room_id ? 'Standard Room Rate' : 'Select room first'} 
                      disabled 
                    />
                  )}
                </div>
              </div>

              {/* Section 5: Financials */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Monthly Rent (₹)</label>
                  <input type="number" step="100" className="input-field" value={studentData.rent_fee} onChange={(e) => setStudentData({...studentData, rent_fee: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Admission Fee (₹)</label>
                  <input type="number" step="100" className="input-field" value={studentData.admission_fee} onChange={(e) => setStudentData({...studentData, admission_fee: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Deposit Fee (₹)</label>
                  <input type="number" step="100" className="input-field" value={studentData.deposit_fee} onChange={(e) => setStudentData({...studentData, deposit_fee: e.target.value})} />
                </div>
              </div>

              {/* Section 6: Dates & Address */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Joined / Move-in Date</label>
                  <input type="date" className="input-field" value={studentData.joined_date} onChange={(e) => setStudentData({...studentData, joined_date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Next Rent Due Date</label>
                  <input type="date" className="input-field" value={studentData.next_due_date} onChange={(e) => setStudentData({...studentData, next_due_date: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label>Permanent Address</label>
                <textarea 
                  className="input-field" 
                  rows="2"
                  value={studentData.address}
                  onChange={(e) => setStudentData({...studentData, address: e.target.value})}
                  style={{ resize: 'none' }}
                  placeholder="Street, City, State, Pincode"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                  style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ padding: '0.75rem 1.75rem', borderRadius: '12px' }}
                >
                  {editingId ? 'Save Changes' : 'Save Resident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;

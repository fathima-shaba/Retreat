import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import CustomSelect from '../components/CustomSelect';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, X, Edit2, Trash2, Calendar, UserPlus } from 'lucide-react';

const Members = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = user.role === 'admin';
  const [members, setMembers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const roomFilter = queryParams.get('room');

  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
    phone: '',
    aadhar_number: '',
    room_id: '',
    address: '',
    joined_date: new Date().toISOString().split('T')[0],
    admission_fee: 0,
    rent_fee: 0,
    next_due_date: '',
    member_type: 'Other',
    institution_details: ''
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const resStudents = await fetch(import.meta.env.VITE_API_URL + '/members', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resStudents.ok) {
        const dataStudents = await resStudents.json();
        setMembers(Array.isArray(dataStudents) ? dataStudents : []);
      }

      const resRooms = await fetch(import.meta.env.VITE_API_URL + '/rooms', {
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
    setStudentData({ 
      name: '', email: '', phone: '', aadhar_number: '', room_id: '', address: '', 
      joined_date: new Date().toISOString().split('T')[0],
      admission_fee: 0, rent_fee: 0, next_due_date: '',
      member_type: 'Other', institution_details: ''
    });
    setShowModal(true);
  };

  const openEditModal = (member) => {
    setEditingId(member.id);
    setStudentData({ 
      name: member.name, 
      email: member.email, 
      phone: member.phone || '', 
      aadhar_number: member.aadhar_number || '',
      room_id: member.room_id || '',
      address: member.address || '',
      joined_date: member.joined_date ? member.joined_date.split('T')[0] : '',
      admission_fee: member.admission_fee || 0,
      rent_fee: member.rent_fee || 0,
      next_due_date: member.next_due_date ? member.next_due_date.split('T')[0] : '',
      member_type: member.member_type || 'Other',
      institution_details: member.institution_details || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this member?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/members/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId ? `${import.meta.env.VITE_API_URL}/members/${editingId}` : import.meta.env.VITE_API_URL + '/members';
    const method = editingId ? 'PUT' : 'POST';
    
    try {
      const payload = {
        ...studentData,
        room_id: studentData.room_id === '' ? null : parseInt(studentData.room_id),
        admission_fee: parseFloat(studentData.admission_fee),
        rent_fee: parseFloat(studentData.rent_fee),
        next_due_date: studentData.next_due_date || null,
        member_type: studentData.member_type,
        institution_details: studentData.institution_details
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
        fetchData();
      } else {
        const errorData = await res.json();
        alert("Failed to save member: " + (errorData.message || errorData.error));
      }
    } catch (err) {
      console.error(err);
      alert("Error saving member");
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
              <h1 className="page-title">Members {roomFilter ? `- Room ${roomFilter}` : ''}</h1>
              <p className="page-subtitle">Manage member records and room assignments</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {roomFilter && (
                <button className="icon-btn" onClick={() => navigate('/members')} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                  Clear Filter
                </button>
              )}
              {isAdmin && (
                <button className="btn-primary" onClick={openAddModal}>
                  <UserPlus size={18} /> Add Member
                </button>
              )}
            </div>
          </div>
          
          <div className="glass-panel section-card table-responsive-container">
            <table style={{ width: '100%', minWidth: '650px', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem' }}>Contact</th>
                  <th style={{ padding: '1rem' }}>Room</th>
                  <th style={{ padding: '1rem' }}>Monthly Rent</th>
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
                        <div style={{ fontWeight: '500' }}>{member.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <span style={{ 
                            background: member.member_type === 'Student' ? 'rgba(59,130,246,0.2)' : (member.member_type === 'Employee' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)'),
                            color: member.member_type === 'Student' ? '#60a5fa' : (member.member_type === 'Employee' ? '#34d399' : '#94a3b8'),
                            padding: '2px 6px', borderRadius: '4px', marginRight: '6px'
                          }}>
                            {member.member_type || 'Other'}
                          </span>
                          {member.institution_details ? member.institution_details : 'No details'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div>{member.phone || 'N/A'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{member.email}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {member.room_number ? (
                          <span style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                            Room {member.room_number}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '600' }}>
                        ₹{member.rent_fee}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {member.next_due_date ? (
                           <span style={{ 
                             display: 'flex', alignItems: 'center', gap: '0.3rem',
                             color: isOverdue ? '#ef4444' : 'var(--text-primary)'
                           }}>
                             {isOverdue && <Calendar size={14} />}
                             {new Date(member.next_due_date).toLocaleDateString()}
                           </span>
                        ) : 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{member.joined_date ? new Date(member.joined_date).toLocaleDateString() : '-'}</td>
                      {isAdmin && (
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => openEditModal(member)} className="icon-btn" style={{ background: 'rgba(255,255,255,0.05)' }}>
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(member.id)} className="icon-btn" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                }) : (
                  <tr><td colSpan={isAdmin ? 7 : 6} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No members found. Add one to get started!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Member Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel section-card" style={{ width: '100%', maxWidth: '600px', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', color: 'var(--text-secondary)' }}
            >
              <X size={20} />
            </button>
            <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>{editingId ? 'Edit Member' : 'Add New Member'}</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" className="input-field" value={studentData.name} onChange={(e) => setStudentData({...studentData, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Aadhar Number</label>
                  <input type="text" className="input-field" value={studentData.aadhar_number} onChange={(e) => setStudentData({...studentData, aadhar_number: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" className="input-field" value={studentData.email} onChange={(e) => setStudentData({...studentData, email: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" className="input-field" value={studentData.phone} onChange={(e) => setStudentData({...studentData, phone: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Member Type</label>
                  <CustomSelect 
                    options={['Student', 'Employee', 'Other']}
                    value={studentData.member_type} 
                    onChange={(e) => setStudentData({...studentData, member_type: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>{studentData.member_type === 'Student' ? 'College / School Name' : (studentData.member_type === 'Employee' ? 'Company / Workplace' : 'Additional Details')}</label>
                  <input type="text" className="input-field" value={studentData.institution_details} onChange={(e) => setStudentData({...studentData, institution_details: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Admission Fee</label>
                  <input type="number" step="0.01" className="input-field" value={studentData.admission_fee} onChange={(e) => setStudentData({...studentData, admission_fee: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Monthly Rent</label>
                  <input type="number" step="0.01" className="input-field" value={studentData.rent_fee} onChange={(e) => setStudentData({...studentData, rent_fee: e.target.value})} />
                </div>
              </div>

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
                    onChange={(e) => setStudentData({...studentData, room_id: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Next Due Date</label>
                  <input type="date" className="input-field" value={studentData.next_due_date} onChange={(e) => setStudentData({...studentData, next_due_date: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea 
                  className="input-field" 
                  rows="2"
                  value={studentData.address}
                  onChange={(e) => setStudentData({...studentData, address: e.target.value})}
                  style={{ resize: 'none' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                {editingId ? 'Update Member' : 'Save Member'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;

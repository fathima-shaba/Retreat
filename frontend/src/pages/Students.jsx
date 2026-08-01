import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, X, Edit2, Trash2, Calendar } from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState([]);
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
    next_due_date: ''
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const resStudents = await fetch(import.meta.env.VITE_API_URL + '/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resStudents.ok) {
        const dataStudents = await resStudents.json();
        setStudents(Array.isArray(dataStudents) ? dataStudents : []);
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
      admission_fee: 0, rent_fee: 0, next_due_date: ''
    });
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setEditingId(student.id);
    setStudentData({ 
      name: student.name, 
      email: student.email, 
      phone: student.phone || '', 
      aadhar_number: student.aadhar_number || '',
      room_id: student.room_id || '',
      address: student.address || '',
      joined_date: student.joined_date ? student.joined_date.split('T')[0] : '',
      admission_fee: student.admission_fee || 0,
      rent_fee: student.rent_fee || 0,
      next_due_date: student.next_due_date ? student.next_due_date.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/students/${id}`, {
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
    const url = editingId ? `${import.meta.env.VITE_API_URL}/students/${editingId}` : import.meta.env.VITE_API_URL + '/students';
    const method = editingId ? 'PUT' : 'POST';
    
    try {
      const payload = {
        ...studentData,
        room_id: studentData.room_id === '' ? null : parseInt(studentData.room_id),
        admission_fee: parseFloat(studentData.admission_fee),
        rent_fee: parseFloat(studentData.rent_fee),
        next_due_date: studentData.next_due_date || null
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
        alert("Failed to save student: " + (errorData.message || errorData.error));
      }
    } catch (err) {
      console.error(err);
      alert("Error saving student");
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
              <h1 className="page-title">Students {roomFilter ? `- Room ${roomFilter}` : ''}</h1>
              <p className="page-subtitle">Manage student records and room assignments</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {roomFilter && (
                <button className="icon-btn" onClick={() => navigate('/students')} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                  Clear Filter
                </button>
              )}
              <button className="btn-primary" onClick={openAddModal}>
                <Plus size={18} /> Add Student
              </button>
            </div>
          </div>
          
          <div className="glass-panel section-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem' }}>Contact</th>
                  <th style={{ padding: '1rem' }}>Room</th>
                  <th style={{ padding: '1rem' }}>Monthly Rent</th>
                  <th style={{ padding: '1rem' }}>Next Due</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.filter(s => roomFilter ? s.room_number === roomFilter : true).length > 0 ? students.filter(s => roomFilter ? s.room_number === roomFilter : true).map(student => {
                  let isOverdue = false;
                  if (student.next_due_date) {
                      const today = new Date();
                      const dueDate = new Date(student.next_due_date);
                      if (dueDate < today) isOverdue = true;
                  }

                  return (
                    <tr key={student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '500' }}>{student.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Aadhar: {student.aadhar_number || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div>{student.phone || 'N/A'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{student.email}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {student.room_number ? (
                          <span style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                            Room {student.room_number}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '600' }}>
                        ₹{student.rent_fee}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {student.next_due_date ? (
                           <span style={{ 
                             display: 'flex', alignItems: 'center', gap: '0.3rem',
                             color: isOverdue ? '#ef4444' : 'var(--text-primary)'
                           }}>
                             {isOverdue && <Calendar size={14} />}
                             {new Date(student.next_due_date).toLocaleDateString()}
                           </span>
                        ) : 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => openEditModal(student)} className="icon-btn" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(student.id)} className="icon-btn" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr><td colSpan="6" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No students found. Add one to get started!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
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
            <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>{editingId ? 'Edit Student' : 'Add New Student'}</h2>
            
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
                  <select 
                    className="input-field"
                    value={studentData.room_id}
                    onChange={(e) => setStudentData({...studentData, room_id: e.target.value})}
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    <option value="">-- Unassigned --</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.room_number} ({r.type}) - {r.status}
                      </option>
                    ))}
                  </select>
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
                {editingId ? 'Update Student' : 'Save Student'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;

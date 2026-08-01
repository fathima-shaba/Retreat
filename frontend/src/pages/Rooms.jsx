import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Edit2, LayoutDashboard, List, Layers } from 'lucide-react';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  
  const [roomData, setRoomData] = useState({
    room_number: '',
    type: '2 Share',
    floor: 'A',
    status: 'Available'
  });

  const fetchRooms = () => {
    fetch('http://localhost:5000/api/rooms', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setRooms(data))
    .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setRoomData({ room_number: '', type: '2 Share', floor: 'A', status: 'Available' });
    setShowModal(true);
  };

  const openEditModal = (room) => {
    setEditingId(room.id);
    setRoomData({ 
      room_number: room.room_number, 
      type: room.type, 
      floor: room.floor || 'A',
      status: room.status
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const capacity = parseInt(roomData.type.split(' ')[0]);
    const url = editingId ? `http://localhost:5000/api/rooms/${editingId}` : 'http://localhost:5000/api/rooms';
    const method = editingId ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          room_number: roomData.room_number,
          capacity: capacity,
          type: roomData.type,
          floor: roomData.floor,
          status: roomData.status
        })
      });

      if (res.ok) {
        setShowModal(false);
        fetchRooms();
      } else {
        const errorData = await res.json();
        alert("Failed to save room: " + (errorData.message || errorData.error));
      }
    } catch (err) {
      console.error(err);
      alert("Error saving room");
    }
  };

  const tabStyle = (isActive) => ({
    background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontWeight: isActive ? '600' : '500',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  });

  const renderOverview = () => {
    const total = rooms.length;
    const vacant = rooms.filter(r => r.status === 'Available').length;
    const twoShare = rooms.filter(r => r.type === '2 Share').length;
    const fourShare = rooms.filter(r => r.type === '4 Share').length;
    
    // Quick calculations for floors
    const getFloorStats = (floor) => {
       const floorRooms = rooms.filter(r => r.floor === floor);
       return {
         total: floorRooms.length,
         vacant: floorRooms.filter(r => r.status === 'Available').length
       }
    };

    const floors = ['A', 'B', 'C'];

    return (
      <div className="animate-fade-in">
        <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Overall Analytics</h2>
        <div className="dashboard-grid">
          <div className="glass-panel stat-card">
            <div className="stat-header">
              <span>Total Rooms</span>
            </div>
            <div className="stat-value">{total}</div>
          </div>
          <div className="glass-panel stat-card">
            <div className="stat-header">
              <span>Vacant Rooms</span>
            </div>
            <div className="stat-value" style={{color: '#10b981'}}>{vacant}</div>
          </div>
          <div className="glass-panel stat-card">
            <div className="stat-header">
              <span>2 Share Rooms</span>
            </div>
            <div className="stat-value">{twoShare}</div>
          </div>
          <div className="glass-panel stat-card">
            <div className="stat-header">
              <span>4 Share Rooms</span>
            </div>
            <div className="stat-value">{fourShare}</div>
          </div>
        </div>

        <h2 className="section-title" style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>Floor Breakdown</h2>
        <div className="dashboard-grid">
          {floors.map(f => {
            const stats = getFloorStats(f);
            return (
              <div key={f} className="glass-panel stat-card" onClick={() => setActiveTab(f)} style={{ cursor: 'pointer' }}>
                <div className="stat-header">
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Floor {f}</span>
                  <Layers size={18} />
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total: <strong>{stats.total}</strong></span>
                  <span style={{ color: '#10b981' }}>Vacant: <strong>{stats.vacant}</strong></span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginTop: '0.5rem', textAlign: 'right' }}>
                  Click to view details &rarr;
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  };

  const renderTable = (filterFloor) => {
    const displayedRooms = filterFloor ? rooms.filter(r => r.floor === filterFloor) : rooms;
    
    return (
      <div className="glass-panel section-card animate-fade-in" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>Room #</th>
              <th style={{ padding: '1rem' }}>Floor</th>
              <th style={{ padding: '1rem' }}>Type</th>
              <th style={{ padding: '1rem' }}>Capacity</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedRooms.length > 0 ? displayedRooms.map(room => (
              <tr 
                key={room.id} 
                onClick={() => navigate(`/students?room=${room.room_number}`)}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '1rem', fontWeight: '600' }}>{room.room_number}</td>
                <td style={{ padding: '1rem' }}>Floor {room.floor}</td>
                <td style={{ padding: '1rem' }}>{room.type}</td>
                <td style={{ padding: '1rem' }}>{room.capacity} Beds</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                    background: room.status === 'Available' ? 'rgba(16,185,129,0.1)' : (room.status === 'Occupied' ? 'rgba(99,102,241,0.1)' : 'rgba(239,68,68,0.1)'),
                    color: room.status === 'Available' ? '#10b981' : (room.status === 'Occupied' ? 'var(--accent-primary)' : '#ef4444')
                  }}>{room.status}</span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={(e) => { e.stopPropagation(); openEditModal(room); }} className="icon-btn" style={{ background: 'rgba(255,255,255,0.05)', marginLeft: 'auto' }}>
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No rooms found for this view.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    )
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="page-content">
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h1 className="page-title">Rooms Management</h1>
              <p className="page-subtitle">Track, manage, and analyze your hostel layout</p>
            </div>
            <button className="btn-primary" onClick={openAddModal}>
              <Plus size={18} /> Add Room
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', overflowX: 'auto' }}>
            <button onClick={() => setActiveTab('overview')} style={tabStyle(activeTab === 'overview')}>
              <LayoutDashboard size={18} /> Overview Analytics
            </button>
            <button onClick={() => setActiveTab('all')} style={tabStyle(activeTab === 'all')}>
              <List size={18} /> All Rooms
            </button>
            <button onClick={() => setActiveTab('A')} style={tabStyle(activeTab === 'A')}>
              Floor A
            </button>
            <button onClick={() => setActiveTab('B')} style={tabStyle(activeTab === 'B')}>
              Floor B
            </button>
            <button onClick={() => setActiveTab('C')} style={tabStyle(activeTab === 'C')}>
              Floor C
            </button>
          </div>

          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'all' && renderTable(null)}
          {activeTab === 'A' && renderTable('A')}
          {activeTab === 'B' && renderTable('B')}
          {activeTab === 'C' && renderTable('C')}

        </div>
      </div>

      {/* Add / Edit Room Modal */}
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
            <h2 className="section-title">{editingId ? 'Edit Room' : 'Add New Room'}</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label>Room Number</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. 101-A"
                  value={roomData.room_number}
                  onChange={(e) => setRoomData({...roomData, room_number: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Floor</label>
                <select 
                  className="input-field"
                  value={roomData.floor}
                  onChange={(e) => setRoomData({...roomData, floor: e.target.value})}
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  <option value="A">Floor A</option>
                  <option value="B">Floor B</option>
                  <option value="C">Floor C</option>
                </select>
              </div>

              <div className="form-group">
                <label>Room Type</label>
                <select 
                  className="input-field"
                  value={roomData.type}
                  onChange={(e) => setRoomData({...roomData, type: e.target.value})}
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  <option value="2 Share">2 Share</option>
                  <option value="3 Share">3 Share</option>
                  <option value="4 Share">4 Share</option>
                  <option value="5 Share">5 Share</option>
                </select>
              </div>

              {editingId && (
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    className="input-field"
                    value={roomData.status}
                    onChange={(e) => setRoomData({...roomData, status: e.target.value})}
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                {editingId ? 'Update Room' : 'Save Room'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;

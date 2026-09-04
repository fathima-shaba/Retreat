import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import CustomSelect from '../components/CustomSelect';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Edit2, LayoutDashboard, List, Layers, Trash2, Tag, AlertCircle } from 'lucide-react';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = user.role === 'admin';
  const navigate = useNavigate();
  
  const [roomData, setRoomData] = useState({
    room_number: '',
    capacity: 2,
    type: '2 Share',
    floor: 'A',
    status: 'Available',
    sharing_rates: [
      { sharing_type: 1, monthly_rent: 8000 },
      { sharing_type: 2, monthly_rent: 6000 }
    ]
  });

  const [validationError, setValidationError] = useState('');

  const fetchRooms = () => {
    fetch(import.meta.env.VITE_API_URL + '/rooms', {
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
    setValidationError('');
    setRoomData({ 
      room_number: '', 
      capacity: 2, 
      type: '2 Share', 
      floor: 'A', 
      status: 'Available',
      sharing_rates: [
        { sharing_type: 1, monthly_rent: 8000 },
        { sharing_type: 2, monthly_rent: 6000 }
      ]
    });
    setShowModal(true);
  };

  const openEditModal = (room) => {
    setEditingId(room.id);
    setValidationError('');
    
    // Default rates if room doesn't have any configured yet
    const existingRates = room.sharing_rates && room.sharing_rates.length > 0 
      ? room.sharing_rates.map(sr => ({ sharing_type: Number(sr.sharing_type), monthly_rent: Number(sr.monthly_rent) }))
      : [
          { sharing_type: 1, monthly_rent: 8000 },
          { sharing_type: 2, monthly_rent: 6000 }
        ];

    setRoomData({ 
      room_number: room.room_number, 
      capacity: room.capacity || 2,
      type: room.type || `${room.capacity || 2} Share`, 
      floor: room.floor || 'A',
      status: room.status || 'Available',
      sharing_rates: existingRates
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/rooms/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) fetchRooms();
    } catch (err) {
      console.error(err);
    }
  };

  // Synchronize bed capacity changes with type and rates validation
  const handleCapacityChange = (newCap) => {
    const capInt = Math.max(1, parseInt(newCap) || 1);
    const updatedRates = roomData.sharing_rates.filter(sr => sr.sharing_type <= capInt);
    
    // Ensure at least one rate matches capInt if empty
    if (updatedRates.length === 0) {
      updatedRates.push({ sharing_type: capInt, monthly_rent: 5000 });
    }

    setRoomData({
      ...roomData,
      capacity: capInt,
      type: `${capInt} Share`,
      sharing_rates: updatedRates
    });
  };

  const handleAddSharingRate = () => {
    // Find first unused sharing capacity <= room capacity
    const usedTypes = new Set(roomData.sharing_rates.map(sr => sr.sharing_type));
    let nextType = 1;
    while (usedTypes.has(nextType) && nextType <= roomData.capacity) {
      nextType++;
    }

    if (nextType > roomData.capacity) {
      setValidationError(`Cannot add more sharing rates. Maximum room capacity is ${roomData.capacity} beds.`);
      return;
    }

    setValidationError('');
    let defaultRent = 6000;
    if (nextType === 1) defaultRent = 8000;
    else if (nextType === 3) defaultRent = 5000;
    else if (nextType === 4) defaultRent = 4500;

    setRoomData({
      ...roomData,
      sharing_rates: [...roomData.sharing_rates, { sharing_type: nextType, monthly_rent: defaultRent }]
    });
  };

  const handleUpdateSharingRate = (index, field, value) => {
    setValidationError('');
    const updated = [...roomData.sharing_rates];
    updated[index] = { ...updated[index], [field]: value };
    setRoomData({ ...roomData, sharing_rates: updated });
  };

  const handleRemoveSharingRate = (index) => {
    setValidationError('');
    const updated = roomData.sharing_rates.filter((_, idx) => idx !== index);
    setRoomData({ ...roomData, sharing_rates: updated });
  };

  // Form Validation
  const validateForm = () => {
    if (!roomData.room_number.trim()) {
      setValidationError('Room Number is required.');
      return false;
    }

    if (roomData.capacity < 1) {
      setValidationError('Room bed capacity must be at least 1.');
      return false;
    }

    if (!roomData.sharing_rates || roomData.sharing_rates.length === 0) {
      setValidationError('Please configure at least one sharing rent option.');
      return false;
    }

    const seenTypes = new Set();
    for (const sr of roomData.sharing_rates) {
      const typeNum = parseInt(sr.sharing_type);
      const rentNum = parseFloat(sr.monthly_rent);

      if (isNaN(typeNum) || typeNum < 1) {
        setValidationError('Sharing capacity must be a positive number.');
        return false;
      }

      if (typeNum > roomData.capacity) {
        setValidationError(`Sharing capacity (${typeNum} Share) cannot exceed room capacity (${roomData.capacity} beds).`);
        return false;
      }

      if (isNaN(rentNum) || rentNum < 0) {
        setValidationError('Monthly rent must be a valid non-negative amount.');
        return false;
      }

      if (seenTypes.has(typeNum)) {
        setValidationError(`Duplicate sharing option (${typeNum} Share) detected.`);
        return false;
      }
      seenTypes.add(typeNum);
    }

    setValidationError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const url = editingId ? `${import.meta.env.VITE_API_URL}/rooms/${editingId}` : import.meta.env.VITE_API_URL + '/rooms';
    const method = editingId ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          room_number: roomData.room_number.trim(),
          capacity: parseInt(roomData.capacity),
          type: roomData.type,
          floor: roomData.floor,
          status: roomData.status,
          sharing_rates: roomData.sharing_rates.map(sr => ({
            sharing_type: parseInt(sr.sharing_type),
            monthly_rent: parseFloat(sr.monthly_rent)
          }))
        })
      });

      if (res.ok) {
        setShowModal(false);
        fetchRooms();
      } else {
        const errorData = await res.json();
        setValidationError("Failed to save room: " + (errorData.message || errorData.error));
      }
    } catch (err) {
      console.error(err);
      setValidationError("Error saving room");
    }
  };

  const tabStyle = (isActive) => ({
    background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
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
    const twoShare = rooms.filter(r => r.capacity === 2).length;
    const fourShare = rooms.filter(r => r.capacity === 4).length;
    
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
      <div className="glass-panel section-card animate-fade-in table-responsive-container">
        <table style={{ width: '100%', minWidth: '650px', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>Room #</th>
              <th style={{ padding: '1rem' }}>Floor</th>
              <th style={{ padding: '1rem' }}>Beds & Occupancy</th>
              <th style={{ padding: '1rem' }}>Rent by Sharing</th>
              <th style={{ padding: '1rem' }}>Status</th>
              {isAdmin && <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {displayedRooms.length > 0 ? displayedRooms.map(room => (
              <tr 
                key={room.id} 
                onClick={() => navigate(`/members?room=${room.room_number}`)}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '1rem', fontWeight: '600' }}>{room.room_number}</td>
                <td style={{ padding: '1rem' }}>Floor {room.floor}</td>
                <td style={{ padding: '1rem' }}>
                  <div><strong>{room.capacity} Beds</strong> ({room.type})</div>
                  {room.capacity - (room.occupied_count || 0) > 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#10b981' }}>
                      {room.capacity - (room.occupied_count || 0)} bed{room.capacity - (room.occupied_count || 0) > 1 ? 's' : ''} available
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>Fully Occupied</div>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {room.sharing_rates && room.sharing_rates.length > 0 ? (
                      room.sharing_rates.map(sr => (
                        <span key={sr.sharing_type} style={{
                          fontSize: '0.75rem',
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: 'var(--accent-primary)',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <Tag size={10} /> {sr.sharing_type} Share: ₹{sr.monthly_rent.toLocaleString()}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Standard Rent</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                    background: room.status === 'Available' ? 'rgba(16,185,129,0.1)' : (room.status === 'Occupied' ? 'rgba(99,102,241,0.1)' : 'rgba(239,68,68,0.1)'),
                    color: room.status === 'Available' ? '#10b981' : (room.status === 'Occupied' ? 'var(--accent-primary)' : '#ef4444')
                  }}>{room.status}</span>
                </td>
                {isAdmin && (
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        title="Edit Room & Sharing Rates"
                        onClick={(e) => { e.stopPropagation(); openEditModal(room); }} 
                        className="icon-btn" 
                        style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent-primary)' }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        title="Delete Room"
                        onClick={(e) => { e.stopPropagation(); handleDelete(room.id); }} 
                        className="icon-btn" 
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            )) : (
              <tr><td colSpan={isAdmin ? "6" : "5"} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No rooms found for this view.</td></tr>
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
              <h1 className="page-title">Rooms & Beds Management</h1>
              <p className="page-subtitle">Configure room details, bed capacity, and sharing-based rent rates</p>
            </div>
            {isAdmin && (
              <button className="btn-primary" onClick={openAddModal}>
                <Plus size={18} /> Add Room
              </button>
            )}
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
          <div className="glass-panel section-card animate-fade-in" style={{ width: '100%', maxWidth: '520px', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', color: 'var(--text-secondary)' }}
            >
              <X size={20} />
            </button>
            <h2 className="section-title">{editingId ? 'Edit Room Details' : 'Add New Room'}</h2>
            
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Room Number / Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. 101-A"
                    value={roomData.room_number}
                    onChange={(e) => { setValidationError(''); setRoomData({...roomData, room_number: e.target.value}); }}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Floor</label>
                  <CustomSelect
                    options={[
                      { value: 'A', label: 'Floor A' },
                      { value: 'B', label: 'Floor B' },
                      { value: 'C', label: 'Floor C' }
                    ]}
                    value={roomData.floor}
                    onChange={(e) => setRoomData({ ...roomData, floor: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Total Beds / Capacity</label>
                  <input 
                    type="number" 
                    min="1"
                    max="10"
                    className="input-field" 
                    value={roomData.capacity}
                    onChange={(e) => handleCapacityChange(e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <CustomSelect
                    options={['Available', 'Occupied', 'Maintenance']}
                    value={roomData.status}
                    onChange={(e) => setRoomData({ ...roomData, status: e.target.value })}
                  />
                </div>
              </div>

              {/* Rent by Sharing Configuration Section */}
              <div style={{ 
                background: 'var(--input-bg)', 
                padding: '1rem', 
                borderRadius: '12px', 
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)' }}>Rent by Sharing</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Configure rent per sharing capacity</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleAddSharingRate} 
                    className="btn-primary" 
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                  >
                    + Add Sharing Rate
                  </button>
                </div>

                {roomData.sharing_rates.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '0.5rem' }}>
                    No sharing rates added. Click "+ Add Sharing Rate" to configure.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 36px', gap: '0.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', paddingBottom: '4px', borderBottom: '1px solid var(--border-color)' }}>
                      <span>Sharing Type</span>
                      <span>Monthly Rent (₹)</span>
                      <span></span>
                    </div>

                    {roomData.sharing_rates.map((sr, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 36px', gap: '0.5rem', alignItems: 'center' }}>
                        <CustomSelect
                          options={Array.from({ length: roomData.capacity }, (_, i) => i + 1).map(n => ({
                            value: String(n),
                            label: `${n} Share`
                          }))}
                          value={String(sr.sharing_type)}
                          onChange={(e) => handleUpdateSharingRate(idx, 'sharing_type', parseInt(e.target.value))}
                        />
                        <input
                          type="number"
                          min="0"
                          step="100"
                          className="input-field"
                          placeholder="₹ Rent"
                          value={sr.monthly_rent}
                          onChange={(e) => handleUpdateSharingRate(idx, 'monthly_rent', e.target.value)}
                        />
                        <button 
                          type="button" 
                          onClick={() => handleRemoveSharingRate(idx)} 
                          className="icon-btn" 
                          title="Remove sharing option"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', height: '38px', width: '36px' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                {editingId ? 'Update Room Configuration' : 'Save New Room'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;

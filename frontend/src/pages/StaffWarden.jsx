import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Phone, Mail, ShieldAlert } from 'lucide-react';

const StaffWarden = () => {
  const [staff, setStaff] = useState([
    { id: 1, name: 'Ravi Kumar', role: 'Chief Warden', phone: '+91 9876543210', email: 'ravi@hostelft.com', initials: 'RK' },
    { id: 2, name: 'Priya Sharma', role: 'Asst. Warden (Block A)', phone: '+91 9876543211', email: 'priya@hostelft.com', initials: 'PS' },
    { id: 3, name: 'Manoj Das', role: 'Head Security', phone: '+91 9876543212', email: 'manoj@hostelft.com', initials: 'MD' },
    { id: 4, name: 'Suresh V', role: 'Maintenance Lead', phone: '+91 9876543213', email: 'suresh@hostelft.com', initials: 'SV' }
  ]);

  const handleAddStaff = () => {
    const name = window.prompt("Enter Staff Name:");
    if (!name) return;
    const role = window.prompt("Enter Staff Role (e.g., Warden, Security):");
    if (!role) return;
    const phone = window.prompt("Enter Phone Number:") || '-';
    
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    setStaff([
      ...staff,
      {
        id: Date.now(),
        name,
        role,
        phone,
        email: `${name.split(' ')[0].toLowerCase()}@hostelft.com`,
        initials
      }
    ]);
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="page-content" style={{ paddingBottom: '6rem' }}>
          <div className="page-header">
            <div>
              <h1 className="page-title">Staff & Warden</h1>
              <p className="page-subtitle">Directory of hostel administration and staff</p>
            </div>
            <button className="btn-primary" onClick={handleAddStaff} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Add Staff</button>
          </div>
          
          <div className="dashboard-grid-3">
            {staff.map(person => (
              <div key={person.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {person.initials}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{person.name}</h3>
                  <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>{person.role}</span>
                </div>
                <div style={{ width: '100%', height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }}></div>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <Phone size={14} /> {person.phone}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <Mail size={14} /> {person.email}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-panel section-card" style={{ marginTop: '2rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '50%', color: '#ef4444' }}>
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', color: '#ef4444', marginBottom: '0.25rem' }}>Emergency Contacts</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Police: 100 | Ambulance: 108 | Fire: 101 | Campus Security: +91 9999988888</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default StaffWarden;

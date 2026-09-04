import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import CustomSelect from '../components/CustomSelect';
import { Megaphone, Send } from 'lucide-react';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: 'Hostel annual maintenance', date: '2 hours ago', content: 'Hostel annual maintenance on 20 May 2025. Please cooperate.', author: 'Chief Warden' },
    { id: 2, title: 'Mess Timings Update', date: '1 Day ago', content: 'Dinner timings have been extended to 10:00 PM during exam weeks.', author: 'Admin' },
    { id: 3, title: 'Wi-Fi Outage Notice', date: '3 Days ago', content: 'Scheduled network upgrade this Sunday from 2 AM to 5 AM. Expect brief interruptions.', author: 'IT Support' }
  ]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handlePublish = () => {
    if (!title || !content) {
      alert("Please enter both title and message.");
      return;
    }
    setAnnouncements([
      {
        id: Date.now(),
        title,
        content,
        date: 'Just now',
        author: 'Admin User'
      },
      ...announcements
    ]);
    setTitle('');
    setContent('');
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="page-content" style={{ paddingBottom: '6rem' }}>
          <div className="page-header">
            <div>
              <h1 className="page-title">Announcements</h1>
              <p className="page-subtitle">Broadcast messages to all residents</p>
            </div>
          </div>
          
          <div className="dashboard-grid-2">
            
            <div className="glass-panel section-card" style={{ height: 'fit-content' }}>
              <h2 className="section-title">New Announcement</h2>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" className="input-field" placeholder="E.g., Holiday Notice" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea className="input-field" rows="5" placeholder="Write your announcement here..." value={content} onChange={(e) => setContent(e.target.value)}></textarea>
                </div>
                <div className="form-group">
                  <label>Audience</label>
                  <CustomSelect
                    options={[
                      { value: 'all', label: 'All Residents' },
                      { value: 'blockA', label: 'Block A Only' },
                      { value: 'staff', label: 'Staff Only' }
                    ]}
                    value="all"
                    onChange={() => {}}
                  />
                </div>
                <button type="button" className="btn-primary" onClick={handlePublish} style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
                  <Send size={18} /> Publish Announcement
                </button>
              </form>
            </div>

            <div className="glass-panel section-card">
              <h2 className="section-title">Recent Broadcasts</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {announcements.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: '2.5rem', height: '2.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Megaphone size={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>{item.title}</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.date}</span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '0.5rem' }}>
                        {item.content}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '500' }}>Posted by {item.author}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Announcements;

import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../AppContext';

const Header = () => {
  const { toggleSidebar, toggleDarkMode } = useAppContext();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setIsNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className="header">
      {/* Search */}
      <div className="search-bar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <input type="text" placeholder="Search leads, counselors, courses…" />
      </div>

      {/* Right side */}
      <div className="header-right">

        {/* Notification */}
        <div className="dropdown" ref={notifRef}>
          <button className="icon-btn" onClick={() => { setIsNotifOpen(p => !p); setIsProfileOpen(false); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <span className="notif-dot"></span>
          </button>

          {isNotifOpen && (
            <div className="dropdown-menu open" style={{ minWidth: '300px' }}>
              <div className="dropdown-header">
                Notifications
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>5 new</span>
              </div>
              <div className="dropdown-item">
                <div className="notif-dot2"></div>
                <div>
                  <div className="notif-text">Priya Sharma registered for Full Stack Dev</div>
                  <div className="notif-time">2 min ago · Rahul Singh</div>
                </div>
              </div>
              <div className="dropdown-item">
                <div className="notif-dot2"></div>
                <div>
                  <div className="notif-text">3 follow-ups are overdue today</div>
                  <div className="notif-time">15 min ago</div>
                </div>
              </div>
              <div className="dropdown-item">
                <div className="notif-dot2" style={{ background: '#F59E0B' }}></div>
                <div>
                  <div className="notif-text">Amit Verma marked as Hot Lead</div>
                  <div className="notif-time">1 hour ago · Neha Joshi</div>
                </div>
              </div>
              <div className="dropdown-item">
                <div style={{ width: '8px', flexShrink: 0 }}></div>
                <div>
                  <div className="notif-text">New lead assigned: Kiran Patel</div>
                  <div className="notif-time">2 hours ago</div>
                </div>
              </div>
              <div className="dropdown-item">
                <div style={{ width: '8px', flexShrink: 0 }}></div>
                <div>
                  <div className="notif-text">Monthly report for May is ready</div>
                  <div className="notif-time">Yesterday</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dark mode */}
        <button className="icon-btn" onClick={toggleDarkMode} title="Toggle dark mode">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
          </svg>
        </button>

        {/* Profile */}
        <div className="dropdown" ref={profileRef}>
          <div className="avatar" style={{ cursor: 'pointer' }} onClick={() => { setIsProfileOpen(p => !p); setIsNotifOpen(false); }}>
            AK
          </div>

          {isProfileOpen && (
            <div className="dropdown-menu open" style={{ minWidth: '200px' }}>
              <div className="dropdown-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-900)' }}>Arjun Kumar</span>
                <span style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 400 }}>Admin</span>
              </div>
              <div className="dropdown-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <div className="notif-text">My Profile</div>
              </div>
              <div className="dropdown-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33"/>
                </svg>
                <div className="notif-text">Settings</div>
              </div>
              <div className="dropdown-item" onClick={() => console.log('Sign out')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
                <div className="notif-text" style={{ color: '#EF4444' }}>Sign out</div>
              </div>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Header;

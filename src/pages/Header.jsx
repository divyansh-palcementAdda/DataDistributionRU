import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../AppContext';
import { logoutUser } from '../axiosInstance/axios';
import NotificationBell from '../component/reusable/NotificationBell';

const Header = () => {
  const { toggleSidebar, isSidebarOpen } = useAppContext();

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const userRole = localStorage.getItem('userRole') || 'User';
  const userName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
  const initials = `${userData.firstName?.[0] || ''}${userData.lastName?.[0] || ''}`.toUpperCase() || 'U';

  const handleLogout = async () => {
    await logoutUser('MANUAL_LOGOUT');
  };

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className="header">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden flex items-center justify-center p-2 rounded-lg border"
        >
          {isSidebarOpen ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        <h1 className="font-bold text-gray-900">
          <span className="lg:hidden text-lg">
            DDS
          </span>

          <span className="hidden lg:inline text-2xl">
            Data Distribution System
          </span>
        </h1>
      </div>

      {/* Right side */}
      <div className="header-right flex items-center gap-3">
        {/* Reusable In-App Notification Bell & Dropdown */}
        <NotificationBell />

        {/* Profile */}
        <div className="dropdown" ref={profileRef}>
          <div
            className="avatar"
            style={{ cursor: 'pointer' }}
            onClick={() => setIsProfileOpen((p) => !p)}
          >
            {initials}
          </div>

          {isProfileOpen && (
            <div className="dropdown-menu open" style={{ minWidth: '200px' }}>
              <div
                className="dropdown-header"
                style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}
              >
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-900)' }}>
                  {userName}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 400 }}>
                  {userRole}
                </span>
              </div>

              <div className="dropdown-item" onClick={handleLogout}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                <div className="notif-text" style={{ color: '#EF4444' }}>
                  Sign out
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;

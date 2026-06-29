import React from 'react';
import { useAppContext } from '../AppContext';

const BRAND_LOGO = 'https://ru-website-bucket.s3.ap-south-1.amazonaws.com/images/svg/logoblack.svg';
const BRAND_NAME = 'Data Distribute System';
const BRAND_SUBTITLE = 'Education Lead Management';

const Sidebar = () => {
  const { currentPage, navTo, isSidebarOpen, toggleSidebar } = useAppContext();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>' },
    { id: 'leads', label: 'Leads', icon: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>', badge: '2.8k' },
    { id: 'lead-source', label: 'Lead Source', icon: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v20M2 12h20"/></svg>' },
    { id: 'pipeline', label: 'Pipeline', icon: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8V6a2 2 0 00-2-2H4a2 2 0 00-2 2v7a2 2 0 002 2h8"/><path d="M10 19l-2-2 2-2"/><rect x="13" y="13" width="9" height="9" rx="1"/></svg>' },
    { id: 'followups', label: 'Follow Ups', icon: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01"/></svg>', badge: '12' },
    { id: 'counselors', label: 'Counselors', icon: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 3h.01M8 3h.01"/></svg>' },
    { id: 'reports', label: 'Reports', icon: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' },
  ];

  const configNavItems = [
    { id: 'courses', label: 'Courses', icon: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>' },
    { id: 'courses-types', label: 'Courses Types', icon: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>' },
    { id: 'settings', label: 'Settings', icon: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>' },
  ];

  return (
    <>
   
       {isSidebarOpen && (
      <div
        className="fixed inset-0 bg-black/40 z-40 md:hidden"
        onClick={toggleSidebar}
      />
    )}
    <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <img
          src={BRAND_LOGO}
          alt={`${BRAND_NAME} logo`}
          className="sidebar-logo-img"
        />
        {/* <div>
          <div className="logo-text">{BRAND_NAME}</div>
          <div className="logo-sub">{BRAND_SUBTITLE}</div>
        </div> */}
      </div>
      <div className="sidebar-section">
        <div className="sidebar-label">Main</div>
        {navItems.map(item => (
          <div
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => navTo(item.id)}
            dangerouslySetInnerHTML={{ __html: item.icon + item.label + (item.badge ? `<span class="nav-badge">${item.badge}</span>` : '') }}
          >
          </div>
        ))}
      </div>
      <div className="sidebar-section">
        <div className="sidebar-label">Config</div>
        {configNavItems.map(item => (
          <div
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => navTo(item.id)}
            dangerouslySetInnerHTML={{ __html: item.icon + item.label }}
          >
          </div>
        ))}
      </div>
      <div className="sidebar-bottom">
        <div className="user-card">
          <div className="avatar">AK</div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis">Arjun Kumar</div>
            <div className="text-xs text-gray-400">Admin</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
        </div>
      </div>
    </nav>
     </>
  );
};

export default Sidebar;

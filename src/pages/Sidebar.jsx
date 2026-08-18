import React from 'react';
import { useAppContext } from '../AppContext';

const BRAND_LOGO = 'https://ru-website-bucket.s3.ap-south-1.amazonaws.com/images/svg/logoblack.svg';
const BRAND_NAME = 'Data Distribute System';
const BRAND_SUBTITLE = 'Education Lead Management';

const Sidebar = () => {
  const { currentPage, navTo, isSidebarOpen, toggleSidebar, isSettingsExpanded, toggleSettingsExpanded } = useAppContext();

  // Get user role to determine which dashboard to show in sidebar
  const userRole = localStorage.getItem('userRole');
  
  // Update dashboard navigation based on user role
  const getDashboardId = () => {
    if (userRole === 'COUNSELOR' || userRole === 'HEAD') {
      return 'callers-dashboard';
    }
    return 'dashboard';
  };

  const dashboardId = getDashboardId();

  const navItems = [
    { id: dashboardId, label: 'Dashboard', icon: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>' },
    { id: 'leads', label: 'Leads', icon: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>' },
    { id: 'followups', label: 'Follow-up', icon: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01"/></svg>' },
    { id: 'course-types', label: 'Category', icon: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>' },
    { id: 'lead-source', label: 'Source Data', icon: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v20M2 12h20"/></svg>' },
    { id: 'boards', label: 'Specialization', icon: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>' },
    { id: 'grades', label: 'Grads Data', icon: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' },
    { id: 'counselors', label: 'Counselors', icon: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 3h.01M8 3h.01"/></svg>' },
    { id: 'department', label: 'Department', icon: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/></svg>' },
  ];

  const configNavItems = [
    { id: 'courses', label: 'Course', icon: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>' },
    { id: 'lead-status', label: 'Lead Status', icon: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>' },
    { id: 'reports', label: 'Reports', icon: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' },
  ];

  const settingsItem = {
    id: 'settings',
    label: 'Settings',
    icon: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
    hasSubmenu: true
  };

  const settingsSubmenuItems = [
    { id: 'settings/user-management', label: 'User Management' },
    { id: 'settings/notifications', label: 'Notifications' },
    { id: 'settings/crm-config', label: 'CRM Config' },
    { id: 'settings/roles-permissions', label: 'Roles & Permissions' }
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

        {/* Settings with submenu */}
        <div
          className={`nav-item ${currentPage === 'settings' || currentPage.startsWith('settings/') ? 'active' : ''}`}
          aria-expanded={isSettingsExpanded}
          onClick={() => {
            toggleSettingsExpanded();
            if (!isSettingsExpanded) {
              navTo('settings/user-management');
            }
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: settingsItem.icon }} />
          <span>{settingsItem.label}</span>
          <svg className="submenu-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>

        {/* Settings Submenu */}
        {isSettingsExpanded && (
          <div className="submenu">
            {settingsSubmenuItems.map(subItem => (
              <div
                key={subItem.id}
                className={`submenu-item ${currentPage === subItem.id ? 'active' : ''}`}
                onClick={() => navTo(subItem.id)}
              >
                {subItem.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
     </>
  );
};

export default Sidebar;

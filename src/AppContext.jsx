import { createContext, useContext, useState,useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { usePermissions } from './PermissionContext';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [editLeadData, setEditLeadData] = useState(null);
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(() => {
    // Initialize currentPage based on current URL path
    const path = location.pathname;
    if (path === '/callers-dashboard') return 'callers-dashboard';
    if (path === '/head-dashboard') return 'head-dashboard';
    if (path.startsWith('/settings/')) return path;
    return path.replace('/', '') || 'dashboard';
  });
  const [isAccessDeniedModalOpen, setIsAccessDeniedModalOpen] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);

  const navigate = useNavigate();
  const { clearPermissions } = usePermissions();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
  const toggleSettingsExpanded = () => setIsSettingsExpanded((prev) => !prev);

useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(false);
    }
  };

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);

// Update currentPage when location changes
useEffect(() => {
  const path = location.pathname;
  let newPage = 'dashboard';
  
  if (path === '/callers-dashboard') {
    newPage = 'callers-dashboard';
  } else if (path === '/head-dashboard') {
    newPage = 'head-dashboard';
  } else if (path.startsWith('/settings/')) {
    newPage = path;
  } else if (path.startsWith('/')) {
    newPage = path.replace('/', '') || 'dashboard';
  }
  
  setCurrentPage(newPage);
}, [location.pathname]);

  
  const openAddLeadModal = (leadData = null) => {
    setEditLeadData(leadData);
    setIsAddLeadModalOpen(true);
  };
  
  const closeAddLeadModal = () => {
    setIsAddLeadModalOpen(false);
    setEditLeadData(null);
  };

  const openAccessDeniedModal = () => {
    setIsAccessDeniedModalOpen(true);
  };

  const closeAccessDeniedModal = () => {
    setIsAccessDeniedModalOpen(false);
  };

  const handleAccessDeniedBackToDashboard = () => {
    setIsAccessDeniedModalOpen(false);
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'COUNSELOR' || userRole === 'HEAD') {
      navTo('callers-dashboard');
    } else {
      navTo('dashboard');
    }
  };

  const navTo = (page) => {
    setCurrentPage(page);
    setIsSidebarOpen(false);
    // Navigate to the route path. Assumes page names match routes.
    if (page.startsWith('settings/')) {
      navigate(`/settings/${page.replace('settings/', '')}`);
    } else if (page === 'callers-dashboard') {
      navigate('/callers-dashboard');
    } else if (page === 'head-dashboard') {
      navigate('/head-dashboard');
    } else {
      navigate(`/${page}`);
    }
  };

  const logout = () => {
    localStorage.clear();
    clearPermissions();
    navigate('/');
  };

  const showToast = (msg, type = 'success') => {
    if (type === 'success') {
      toast.success(msg);
    } else if (type === 'error') {
      toast.error(msg);
    } else if (type === 'info') {
      toast.info(msg);
    } else if (type === 'warning') {
      toast.warning(msg);
    } else {
      toast(msg);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        isSidebarOpen,
        toggleSidebar,
        isAddLeadModalOpen,
        openAddLeadModal,
        closeAddLeadModal,
        editLeadData,
        currentPage,
        navTo,
        showToast,
        logout,
        isAccessDeniedModalOpen,
        openAccessDeniedModal,
        closeAccessDeniedModal,
        handleAccessDeniedBackToDashboard,
        isSettingsExpanded,
        toggleSettingsExpanded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

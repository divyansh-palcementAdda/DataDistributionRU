import { createContext, useContext, useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { usePermissions } from './PermissionContext';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [editLeadData, setEditLeadData] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isAccessDeniedModalOpen, setIsAccessDeniedModalOpen] = useState(false);

  const navigate = useNavigate();
  const { clearPermissions } = usePermissions();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

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
    navTo('dashboard');
  };

  const navTo = (page) => {
    setCurrentPage(page);
    setIsSidebarOpen(false);
    // Navigate to the route path. Assumes page names match routes.
    navigate(`/${page}`);
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

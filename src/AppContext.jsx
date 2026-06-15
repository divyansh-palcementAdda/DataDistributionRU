import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
  const openAddLeadModal = () => setIsAddLeadModalOpen(true);
  const closeAddLeadModal = () => setIsAddLeadModalOpen(false);
  const navTo = (page) => { 
    setCurrentPage(page); 
    setIsSidebarOpen(false); 
    // Navigate to the route path. Assumes page names match routes.
    navigate(`/${page}`);
  };
  const showToast = (msg) => console.log('Toast:', msg); // placeholder

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
        currentPage,
        navTo,
        showToast,
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

import { BrowserRouter } from "react-router-dom";
import Allroutes from "./Allroutes";
import { AppProvider, useAppContext } from "./AppContext";
import { PermissionProvider } from "./PermissionContext";
import { NotificationProvider } from "./context/NotificationContext";
import NotificationToastContainer from "./component/reusable/NotificationToastContainer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AccessDeniedModal from "./component/reusable/AccessDeniedModal";
import { useEffect } from "react";

function AppContent() {
  const { isAccessDeniedModalOpen, openAccessDeniedModal, closeAccessDeniedModal, handleAccessDeniedBackToDashboard } = useAppContext();

  useEffect(() => {
    const handleAccessDenied = () => {
      openAccessDeniedModal();
    };

    window.addEventListener('accessDenied', handleAccessDenied);

    return () => {
      window.removeEventListener('accessDenied', handleAccessDenied);
    };
  }, [openAccessDeniedModal]);

  return (
    <>
      <Allroutes />
      <AccessDeniedModal
        isOpen={isAccessDeniedModalOpen}
        onClose={closeAccessDeniedModal}
        onBackToDashboard={handleAccessDeniedBackToDashboard}
      />
      <NotificationToastContainer />
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        className="toast-container-custom"
      />
    </>
  );
}

function App() {
  return (
    <PermissionProvider>
      <BrowserRouter>
        <AppProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </AppProvider>
      </BrowserRouter>
    </PermissionProvider>
  );
}

export default App;

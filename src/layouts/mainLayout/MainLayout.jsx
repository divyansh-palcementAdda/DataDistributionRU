import { Outlet } from "react-router-dom";
import { useAppContext } from "../../AppContext";
import Sidebar from "../../pages/Sidebar";
import Header from "../../pages/Header";
import AddLeadModal from "../../pages/AddLeadModal";

const MainLayout = () => {
  const { isDarkMode, isAddLeadModalOpen } = useAppContext();

  return (
    <div className={`app-shell ${isDarkMode ? "dark" : ""}`}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="main-content">
        {/* Top Header */}
        <Header />

        {/* Page content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Global Add Lead Modal */}
      {isAddLeadModalOpen && <AddLeadModal />}
    </div>
  );
};

export default MainLayout;

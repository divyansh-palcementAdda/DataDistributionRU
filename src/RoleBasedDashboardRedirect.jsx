import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboards/adminDashboard";

const RoleBasedDashboardRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Get user role from localStorage
    const userRole = localStorage.getItem('userRole');

    // Redirect based on role
    if (userRole === 'COUNSELOR') {
      navigate('/callers-dashboard', { replace: true });
    } else if (userRole === 'HEAD' || userRole === 'HOD') {
      navigate('/head-dashboard', { replace: true });
    } else if (!userRole) {
      // Invalid or missing role - redirect to login
      navigate('/', { replace: true });
    }
    // For SUPER_ADMIN and ADMIN, no redirect - they stay on /dashboard
  }, [navigate]);

  // Show admin dashboard for admin users
  const userRole = localStorage.getItem('userRole');
  if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
    return <Dashboard />;
  }

  // Return null for other roles (they will be redirected by useEffect)
  return null;
};

export default RoleBasedDashboardRedirect;

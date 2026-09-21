import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const AuthRoute = ({ children }) => {
  const token = Cookies.get("accessToken");
  const userRole = localStorage.getItem('userRole');

  if (token) {
    // Role-based redirection
    if (userRole === 'COUNSELOR') {
      return <Navigate to="/callers-dashboard" replace />;
    } else if (userRole === 'HEAD' || userRole === 'HOD') {
      return <Navigate to="/head-dashboard" replace />;
    } else {
      // SUPER_ADMIN, ADMIN, or default
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default AuthRoute;

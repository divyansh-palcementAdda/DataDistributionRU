import { Navigate } from "react-router-dom";

/**
 * Protects a route by role.
 * allowedRoles: array of role strings that are permitted to access this route.
 * All other logged-in users are redirected to their own dashboard.
 */
const RoleRoute = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem("userRole");

  if (allowedRoles.includes(userRole)) {
    return children;
  }

  // Redirect to the role's correct dashboard
  if (userRole === "COUNSELOR") {
    return <Navigate to="/callers-dashboard" replace />;
  }
  if (userRole === "HEAD" || userRole === "HOD") {
    return <Navigate to="/head-dashboard" replace />;
  }
  // SUPER_ADMIN / ADMIN / anything else → admin dashboard
  return <Navigate to="/dashboard" replace />;
};

export default RoleRoute;

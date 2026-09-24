import { Navigate } from "react-router-dom";
import { usePermissions } from "./PermissionContext";

const PermissionRoute = ({ children, requiredPermission, anyOfPermissions }) => {
  const { hasPermission, permissionsLoading } = usePermissions();

  // Wait until permissions have been fetched before making any access decision.
  // Rendering null prevents the protected page from flashing and prevents any
  // redirect from firing before the async fetch completes.
  if (permissionsLoading) {
    return null;
  }

  // If no permission is required, allow access
  if (!requiredPermission && !anyOfPermissions) {
    return children;
  }

  // Check if user has the required permission
  if (requiredPermission && hasPermission(requiredPermission)) {
    return children;
  }

  // Check if user has any of the specified permissions (for parent routes)
  if (anyOfPermissions && anyOfPermissions.some(permission => hasPermission(permission))) {
    return children;
  }

  // Redirect to role-based dashboard if user doesn't have permission
  const userRole = localStorage.getItem('userRole');
  let redirectPath = '/dashboard';

  if (userRole === 'COUNSELOR') {
    redirectPath = '/callers-dashboard';
  } else if (userRole === 'HEAD' || userRole === 'HOD') {
    redirectPath = '/head-dashboard';
  }

  return <Navigate to={redirectPath} replace />;
};

export default PermissionRoute;

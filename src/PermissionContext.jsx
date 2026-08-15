import { createContext, useContext, useState, useEffect } from 'react';
import { getRolePermissions } from './Services/role/roleService';

const PermissionContext = createContext(null);

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);

  // Fetch permissions on page load
  useEffect(() => {
    const fetchPermissionsOnLoad = async () => {
      try {
        // Check if user is logged in by checking for user role
        const userRole = localStorage.getItem('userRole');
        if (userRole) {
          // Try to get role ID from localStorage or user info
          const userInfo = localStorage.getItem('userInfo');
          if (userInfo) {
            const parsedUserInfo = JSON.parse(userInfo);
            const roleId = parsedUserInfo.role?.id;
            
            if (roleId) {
              console.log('Fetching permissions on page load for role:', roleId);
              const permissionsResponse = await getRolePermissions(roleId);
              console.log('Permissions API Response on load:', permissionsResponse);
              
              if (permissionsResponse && permissionsResponse.status === 200) {
                const permissionsData = permissionsResponse.data.data || permissionsResponse.data;
                console.log('Permissions Data on load:', permissionsData);
                if (Array.isArray(permissionsData)) {
                  const permissionNames = permissionsData.map(perm => perm.name);
                  console.log('Setting permissions on page load:', permissionNames);
                  setPermissions(permissionNames);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch permissions on page load:", err);
      }
    };

    fetchPermissionsOnLoad();
  }, []);

  // Set permissions (called after login)
  const setPermissionsData = (permissionsData) => {
    const permissionNames = permissionsData.map(perm => perm.name);
    console.log('Setting permissions:', permissionNames);
    setPermissions(permissionNames);
  };

  // Clear permissions (called after logout)
  const clearPermissions = () => {
    setPermissions([]);
  };

  // Check if user has a specific permission
  const hasPermission = (permissionName) => {
    return permissions.includes(permissionName);
  };

  // Check read access for a resource
  const canRead = (resource) => {
    const readPermission = `${resource}_READ`;
    return hasPermission(readPermission);
  };

  // Check create access for a resource
  const canCreate = (resource) => {
    const createPermission = `${resource}_CREATE`;
    return hasPermission(createPermission);
  };

  // Check update access for a resource
  const canUpdate = (resource) => {
    const updatePermission = `${resource}_UPDATE`;
    return hasPermission(updatePermission);
  };

  // Check delete access for a resource
  const canDelete = (resource) => {
    const deletePermission = `${resource}_DELETE`;
    return hasPermission(deletePermission);
  };

  const value = {
    permissions,
    setPermissionsData,
    clearPermissions,
    hasPermission,
    canRead,
    canCreate,
    canUpdate,
    canDelete,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionProvider');
  }
  return context;
};

export default PermissionContext;
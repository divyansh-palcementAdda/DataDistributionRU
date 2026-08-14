import { createContext, useContext, useState } from 'react';

const PermissionContext = createContext(null);

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);

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
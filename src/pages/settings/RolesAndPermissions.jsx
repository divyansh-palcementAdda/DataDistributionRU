import { useState, useCallback, useEffect } from 'react';
import { useAppContext } from '../../AppContext';
import CustomButton from '../../component/reusable/CustomButton';
import Toggle from '../../component/reusable/custumToggle';
import { getAllRoles, deleteRole, toggleRoleStatus, getRolePermissions, allotPermissionsToRole } from '../../Services/role/roleService';
import { getAllPermissions, deletePermission } from '../../Services/permissions/permissions';
import AddEditRoleModal from '../../component/reusable/role/addandeditRolemodel';
import AddEditPermissionModal from '../../component/reusable/permissions/addandeditPermissionModel';
import DeleteModal from '../../component/reusable/deleteModel';
import RoleViewModal from '../../component/reusable/role/roleViewModel';
import PermissionViewModal from '../../component/reusable/permissions/permissionViewModel';

const RolesAndPermissions = () => {
  const { showToast } = useAppContext();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isRoleViewModalOpen, setIsRoleViewModalOpen] = useState(false);
  const [selectedRoleViewId, setSelectedRoleViewId] = useState(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [isPermissionViewModalOpen, setIsPermissionViewModalOpen] = useState(false);
  const [selectedPermissionViewId, setSelectedPermissionViewId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [isDeletingRole, setIsDeletingRole] = useState(false);
  const [isDeletePermissionModalOpen, setIsDeletePermissionModalOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState(null);
  const [isDeletingPermission, setIsDeletingPermission] = useState(false);
  const [togglingRoleId, setTogglingRoleId] = useState(null);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loadingRolePermissions, setLoadingRolePermissions] = useState(false);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  const fetchRoles = useCallback(async () => {
    try {
      setLoadingRoles(true);
      const res = await getAllRoles();
      console.log('API Response for getAllRoles:', res?.data);

      let rolesArray = [];
      const responseData = res?.data;

      if (responseData?.data?.content && Array.isArray(responseData.data.content)) {
        rolesArray = responseData.data.content;
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        rolesArray = responseData.data;
      } else if (responseData?.content && Array.isArray(responseData.content)) {
        rolesArray = responseData.content;
      } else if (Array.isArray(responseData)) {
        rolesArray = responseData;
      }

      setRoles(rolesArray);
    } catch (error) {
      console.error('Failed to fetch roles', error);
      showToast('Failed to fetch roles', 'error');
      setRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  }, [showToast]);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoadingPermissions(true);
      const res = await getAllPermissions();
      console.log('API Response for getAllPermissions:', res?.data);

      let permissionsArray = [];
      const responseData = res?.data;

      if (responseData?.data?.content && Array.isArray(responseData.data.content)) {
        permissionsArray = responseData.data.content;
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        permissionsArray = responseData.data;
      } else if (responseData?.content && Array.isArray(responseData.content)) {
        permissionsArray = responseData.content;
      } else if (Array.isArray(responseData)) {
        permissionsArray = responseData;
      }

      setPermissions(permissionsArray);
    } catch (error) {
      console.error('Failed to fetch permissions', error);
      showToast('Failed to fetch permissions', 'error');
      setPermissions([]);
    } finally {
      setLoadingPermissions(false);
    }
  }, [showToast]);

  const fetchRolePermissions = useCallback(async (roleId) => {
    if (!roleId) {
      setRolePermissions([]);
      setSelectedPermissionIds([]);
      return;
    }

    try {
      setLoadingRolePermissions(true);
      const res = await getRolePermissions(roleId);
      console.log('API Response for getRolePermissions:', res?.data);

      let permissionsArray = [];
      const responseData = res?.data;

      if (responseData?.data?.content && Array.isArray(responseData.data.content)) {
        permissionsArray = responseData.data.content;
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        permissionsArray = responseData.data;
      } else if (responseData?.content && Array.isArray(responseData.content)) {
        permissionsArray = responseData.content;
      } else if (Array.isArray(responseData)) {
        permissionsArray = responseData;
      }

      setRolePermissions(permissionsArray);

      const ids = permissionsArray.map(p => p?.id ?? p?._id ?? p?.permissionId).filter(Boolean);
      setSelectedPermissionIds(ids);
    } catch (error) {
      console.error('Failed to fetch role permissions', error);
      showToast('Failed to fetch role permissions', 'error');
      setRolePermissions([]);
      setSelectedPermissionIds([]);
    } finally {
      setLoadingRolePermissions(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedRoleForPermissions) {
      const roleId = selectedRoleForPermissions?.id ?? selectedRoleForPermissions?._id ?? selectedRoleForPermissions?.roleId;
      fetchRolePermissions(roleId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoleForPermissions]);

  const handleOpenAddRoleModal = () => {
    setSelectedRole(null);
    setIsRoleModalOpen(true);
  };

  const handleOpenEditRoleModal = (role) => {
    setSelectedRole(role);
    setIsRoleModalOpen(true);
  };

  const handleOpenViewRoleModal = (role) => {
    const roleId = role?.id ?? role?._id ?? role?.roleId;
    setSelectedRoleViewId(roleId || null);
    setIsRoleViewModalOpen(true);
  };

  const handleCloseViewRoleModal = () => {
    setIsRoleViewModalOpen(false);
    setSelectedRoleViewId(null);
  };

  const handleCloseRoleModal = () => {
    setIsRoleModalOpen(false);
    setSelectedRole(null);
  };

  const handleOpenDeleteRoleModal = (role) => {
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteRoleModal = () => {
    setIsDeleteModalOpen(false);
    setRoleToDelete(null);
  };

  const handleConfirmDeleteRole = async () => {
    const roleId = roleToDelete?.id ?? roleToDelete?._id ?? roleToDelete?.roleId;

    if (!roleId) {
      showToast('Role id not found', 'error');
      return;
    }

    try {
      setIsDeletingRole(true);
      const response = await deleteRole(roleId);
      const isSuccess = response?.status >= 200 && response?.status < 300;

      if (!isSuccess) {
        const message =
          response?.response?.data?.message ||
          response?.response?.data?.error ||
          response?.message ||
          'Failed to delete role.';
        showToast(message, 'error');
        return;
      }

      await fetchRoles();
      showToast('Role deleted successfully!', 'success');
      handleCloseDeleteRoleModal();
    } finally {
      setIsDeletingRole(false);
    }
  };

  const handleToggleRoleStatus = async (role, nextChecked) => {
    const roleId = role?.id ?? role?._id ?? role?.roleId;

    if (!roleId) {
      showToast('Role id not found', 'error');
      return;
    }

    try {
      setTogglingRoleId(roleId);
      const response = await toggleRoleStatus(roleId, nextChecked);
      const isSuccess = response?.status >= 200 && response?.status < 300;

      if (!isSuccess) {
        const message =
          response?.response?.data?.message ||
          response?.response?.data?.error ||
          response?.message ||
          'Failed to update role status.';
        showToast(message, 'error');
        return;
      }

      await fetchRoles();
      showToast(`Role ${nextChecked ? 'activated' : 'deactivated'} successfully!`, 'success');
    } finally {
      setTogglingRoleId(null);
    }
  };

  const handleSubmitRole = async () => {
    await fetchRoles();
    showToast(selectedRole ? 'Role updated successfully!' : 'Role added successfully!', 'success');
  };

  const handleOpenAddPermissionModal = () => {
    setSelectedPermission(null);
    setIsPermissionModalOpen(true);
  };

  const handleOpenEditPermissionModal = (permission) => {
    setSelectedPermission(permission);
    setIsPermissionModalOpen(true);
  };

  const handleOpenViewPermissionModal = (permission) => {
    const permissionId = permission?.id ?? permission?._id ?? permission?.permissionId;
    setSelectedPermissionViewId(permissionId || null);
    setIsPermissionViewModalOpen(true);
  };

  const handleCloseViewPermissionModal = () => {
    setIsPermissionViewModalOpen(false);
    setSelectedPermissionViewId(null);
  };

  const handleClosePermissionModal = () => {
    setIsPermissionModalOpen(false);
    setSelectedPermission(null);
  };

  const handleOpenDeletePermissionModal = (permission) => {
    setPermissionToDelete(permission);
    setIsDeletePermissionModalOpen(true);
  };

  const handleCloseDeletePermissionModal = () => {
    setIsDeletePermissionModalOpen(false);
    setPermissionToDelete(null);
  };

  const handleConfirmDeletePermission = async () => {
    const permissionId = permissionToDelete?.id ?? permissionToDelete?._id ?? permissionToDelete?.permissionId;

    if (!permissionId) {
      showToast('Permission id not found', 'error');
      return;
    }

    try {
      setIsDeletingPermission(true);
      const response = await deletePermission(permissionId);
      const isSuccess = response?.status >= 200 && response?.status < 300;

      if (!isSuccess) {
        const message =
          response?.response?.data?.message ||
          response?.response?.data?.error ||
          response?.message ||
          'Failed to delete permission.';
        showToast(message, 'error');
        return;
      }

      await fetchPermissions();
      showToast('Permission deleted successfully!', 'success');
      handleCloseDeletePermissionModal();
    } finally {
      setIsDeletingPermission(false);
    }
  };

  const handleSubmitPermission = async () => {
    await fetchPermissions();
    showToast(selectedPermission ? 'Permission updated successfully!' : 'Permission added successfully!', 'success');
  };

  const handleSaveRolePermissions = async () => {
    if (!selectedRoleForPermissions) {
      showToast('Please select a role first', 'error');
      return;
    }

    const roleId = selectedRoleForPermissions?.id ?? selectedRoleForPermissions?._id ?? selectedRoleForPermissions?.roleId;

    if (!roleId) {
      showToast('Role id not found', 'error');
      return;
    }

    try {
      setIsSavingPermissions(true);
      const response = await allotPermissionsToRole(roleId, selectedPermissionIds);
      const isSuccess = response?.status >= 200 && response?.status < 300;

      if (!isSuccess) {
        const message =
          response?.response?.data?.message ||
          response?.response?.data?.error ||
          response?.message ||
          'Failed to allot permissions.';
        showToast(message, 'error');
        return;
      }

      await fetchRolePermissions(roleId);
      showToast('Permissions allotted successfully!', 'success');
    } catch (error) {
      console.error('Failed to allot permissions', error);
      showToast('Failed to allot permissions', 'error');
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const handleTogglePermission = (permissionId) => {
    setSelectedPermissionIds(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const categorizePermissions = (permissions) => {
    const categories = {
      COURSE: { label: 'Course Management', permissions: [] },
      COURSE_TYPE: { label: 'Course Type Management', permissions: [] },
      LEAD: { label: 'Lead Management', permissions: [] },
      LEADSOURCE: { label: 'Lead Source Management', permissions: [] },
      USER: { label: 'User Management', permissions: [] },
      ROLE: { label: 'Role Management', permissions: [] },
      AUTH: { label: 'Authentication Management', permissions: [] },
      PERMISSION: { label: 'Permission Management', permissions: [] },
      FOLLOWUP: { label: 'Follow-up Management', permissions: [] },
      FEEDBACK: { label: 'Feedback Management', permissions: [] },
      OTHER: { label: 'Other Permissions', permissions: [] }
    };

    permissions.forEach(permission => {
      const name = permission.name || permission?.permissionName || '';
      let categorized = false;

      for (const [key, category] of Object.entries(categories)) {
        if (key !== 'OTHER' && name.startsWith(key)) {
          category.permissions.push(permission);
          categorized = true;
          break;
        }
      }

      if (!categorized) {
        categories.OTHER.permissions.push(permission);
      }
    });

    return Object.entries(categories)
      .filter(([_, category]) => category.permissions.length > 0)
      .map(([key, category]) => ({
        key,
        label: category.label,
        permissions: category.permissions
      }));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-fadeIn">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">Roles & Permissions</h2>
        {selectedRoleForPermissions && (
          <CustomButton
            variant="primary"
            onClick={handleSaveRolePermissions}
            disabled={isSavingPermissions}
            className="text-xs py-1.5 px-3"
          >
            {isSavingPermissions ? 'Saving...' : 'Save Permissions'}
          </CustomButton>
        )}
      </div>
      <div className="flex h-[500px]">
        {/* Left Side - All Roles */}
        <div className="w-1/2 border-r border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-700">All Roles</h3>
            <CustomButton
              variant="primary"
              onClick={handleOpenAddRoleModal}
              className="text-xs py-1 px-2"
            >
              + Add
            </CustomButton>
          </div>
          {loadingRoles ? (
            <div className="py-8 text-center text-sm text-gray-500">Loading roles...</div>
          ) : (
            <div className="p-4 overflow-y-auto max-h-[450px]">
              {Array.isArray(roles) && roles.length > 0 ? (
                <div className="space-y-2">
                  {roles.map((role) => {
                    const roleId = role?.id ?? role?._id ?? role?.roleId;
                    const isSelected = selectedRoleForPermissions?.id === roleId ||
                                     selectedRoleForPermissions?._id === roleId ||
                                     selectedRoleForPermissions?.roleId === roleId;
                    return (
                      <div
                        key={roleId}
                        className={`p-3 rounded-lg transition-all border ${
                          isSelected
                            ? 'bg-blue-50 border-blue-200 shadow-sm'
                            : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className="flex items-center gap-2 flex-1 cursor-pointer"
                            onClick={() => setSelectedRoleForPermissions(role)}
                          >
                            <div className={`w-2.5 h-2.5 rounded-full ${role.active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="font-medium text-gray-900 text-sm">{role.name || 'Unnamed role'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditRoleModal(role);
                              }}
                              className="p-1.5 rounded hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition-colors"
                              title="Edit Role"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDeleteRoleModal(role);
                              }}
                              className="p-1.5 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
                              title="Delete Role"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {role.description && (
                          <p className="text-xs text-gray-500 mt-1 ml-4">{role.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-sm text-gray-500 py-8">No roles found</div>
              )}
            </div>
          )}
        </div>

        {/* Right Side - All Permissions with Checkboxes */}
        <div className="w-1/2">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-xs font-semibold text-gray-700">
              {selectedRoleForPermissions ? `Allot Permissions to: ${selectedRoleForPermissions.name}` : 'Select a role to allot permissions'}
            </h3>
          </div>
          {!selectedRoleForPermissions ? (
            <div className="py-8 text-center text-sm text-gray-500">
              Please select a role from the left side to allot permissions
            </div>
          ) : loadingPermissions ? (
            <div className="py-8 text-center text-sm text-gray-500">Loading permissions...</div>
          ) : (
            <div className="p-4 overflow-y-auto max-h-[450px]">
              {Array.isArray(permissions) && permissions.length > 0 ? (
                <div className="space-y-4">
                  {categorizePermissions(permissions).map((category) => (
                    <div key={category.key} className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide bg-gray-100 px-3 py-2 rounded-md">
                        {category.label}
                      </h4>
                      <div className="space-y-2">
                        {category.permissions.map((permission) => {
                          const permissionId = permission?.id ?? permission?._id ?? permission?.permissionId;
                          const isSelected = selectedPermissionIds.includes(permissionId);
                          return (
                            <div
                              key={permissionId}
                              onClick={() => handleTogglePermission(permissionId)}
                              className={`p-3 rounded-lg cursor-pointer transition-all border ${
                                isSelected
                                  ? 'bg-blue-50 border-blue-200 shadow-sm'
                                  : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'border-gray-300'
                                }`}>
                                  {isSelected && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                    <span className="font-medium text-gray-900 text-sm">
                                      {permission.name || permission?.permissionName || 'Unnamed permission'}
                                    </span>
                                  </div>
                                  {permission.description && (
                                    <p className="text-xs text-gray-500 mt-1 ml-4">{permission.description}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-gray-500 py-8">No permissions found</div>
              )}
            </div>
          )}
        </div>
      </div>

      <AddEditRoleModal
        isOpen={isRoleModalOpen}
        onClose={handleCloseRoleModal}
        onSubmit={handleSubmitRole}
        initialData={selectedRole}
      />

      <AddEditPermissionModal
        isOpen={isPermissionModalOpen}
        onClose={handleClosePermissionModal}
        onSubmit={handleSubmitPermission}
        initialData={selectedPermission}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteRoleModal}
        onConfirm={handleConfirmDeleteRole}
        title="Delete Role"
        message={`Are you sure you want to delete "${roleToDelete?.name || 'this role'}"? This action cannot be undone.`}
        isLoading={isDeletingRole}
      />

      <DeleteModal
        isOpen={isDeletePermissionModalOpen}
        onClose={handleCloseDeletePermissionModal}
        onConfirm={handleConfirmDeletePermission}
        title="Delete Permission"
        message={`Are you sure you want to delete "${permissionToDelete?.name || permissionToDelete?.permissionName || 'this permission'}"? This action cannot be undone.`}
        isLoading={isDeletingPermission}
      />

      <RoleViewModal
        isOpen={isRoleViewModalOpen}
        onClose={handleCloseViewRoleModal}
        roleId={selectedRoleViewId}
      />

      <PermissionViewModal
        isOpen={isPermissionViewModalOpen}
        onClose={handleCloseViewPermissionModal}
        permissionId={selectedPermissionViewId}
      />
    </div>
  );
};

export default RolesAndPermissions;
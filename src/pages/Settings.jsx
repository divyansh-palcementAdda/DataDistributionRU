import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../AppContext';
import CustomButton from '../component/reusable/CustomButton';
import CustomInput from '../component/reusable/CustomInput';
import ReusableTable from '../component/reusable/table';
import Toggle from '../component/reusable/custumToggle';
import { getAllUser } from '../Services/user/user';
import { getAllRoles, deleteRole, toggleRoleStatus, getRolePermissions, allotPermissionsToRole } from '../Services/role/roleService';
import { getAllPermissions, deletePermission } from '../Services/permissions/permissions';
import AddUserModal from '../component/reusable/user/addUser';
import AddEditRoleModal from '../component/reusable/role/addandeditRolemodel';
import AddEditPermissionModal from '../component/reusable/permissions/addandeditPermissionModel';
import DeleteModal from '../component/reusable/deleteModel';
import RoleViewModal from '../component/reusable/role/roleViewModel';
import PermissionViewModal from '../component/reusable/permissions/permissionViewModel';

const Settings = () => {
  const { showToast } = useAppContext();
  const [activeTab, setActiveTab] = useState('st-users');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
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

  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const res = await getAllUser();
      console.log('API Response for getAllUser:', res.data);

      let usersArray = [];
      const responseData = res.data;

      if (responseData?.data?.content && Array.isArray(responseData.data.content)) {
        usersArray = responseData.data.content;
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        usersArray = responseData.data;
      } else if (responseData?.content && Array.isArray(responseData.content)) {
        usersArray = responseData.content;
      } else if (Array.isArray(responseData)) {
        usersArray = responseData;
      }

      setUsers(usersArray);
    } catch (error) {
      console.error('Failed to fetch users', error);
      showToast('Failed to fetch users', 'error');
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, [showToast]);

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

      // Extract permission IDs from the response
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
    let cancelled = false;

    Promise.resolve().then(() => {
      if (cancelled) return;

      if (activeTab === 'st-users') {
        fetchUsers();
      }

      if (activeTab === 'st-roles-permissions') {
        fetchRoles();
        fetchPermissions();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [activeTab, fetchUsers, fetchRoles, fetchPermissions]);

  useEffect(() => {
    if (activeTab === 'st-roles-permissions' && selectedRoleForPermissions) {
      const roleId = selectedRoleForPermissions?.id ?? selectedRoleForPermissions?._id ?? selectedRoleForPermissions?.roleId;
      fetchRolePermissions(roleId);
    }
  }, [selectedRoleForPermissions, activeTab, fetchRolePermissions]);

  const notifs = [
    { label: 'New lead allotted', on: true },
    { label: 'Follow-up due reminder', on: true },
    { label: 'Lead status changes', on: true },
    { label: 'Registration completed', on: true },
    { label: 'Missed follow-ups', on: false },
    { label: 'Daily summary report', on: false },
  ];

  const menuItems = [
    { id: 'st-users', label: 'User Management' },
    { id: 'st-notif', label: 'Notifications' },
    { id: 'st-crm', label: 'CRM Config' },
    {id: 'st-roles-permissions', label:"Roles & Permissions"}
  ];

  const userColumns = [
    {
      header: 'Name',
      key: 'name',
      render: (_, u) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">
            {u.name ? u.name.split(' ').map(n => n[0]).join('') : (u.firstName ? u.firstName[0] : 'U')}
          </div>
          <span className="font-medium text-gray-900">{u.name || (u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.firstName) || 'Unknown'}</span>
        </div>
      )
    },
    { header: 'Email', key: 'email', render: (val) => <span className="text-gray-500">{val}</span> },
    {
      header: 'Role',
      key: 'roles',
      render: (roles) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${roles && (roles.includes('SUPER_ADMIN') || roles.includes('ADMIN')) ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
          {roles ? roles.join(', ').replace(/_/g, ' ') : 'User'}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'active',
      render: (active) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
          {active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Last Active',
      key: 'lastLogin',
      render: (_, u) => (
        <span className="text-gray-400">
          {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : (u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A')}
        </span>
      )
    }
  ];

  const roleColumns = [
    {
      header: 'Role Name',
      key: 'name',
      render: (value, role) => (
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${role.active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span className="font-medium text-gray-900">{value || 'Unnamed role'}</span>
        </div>
      )
    },
    {
      header: 'Description',
      key: 'description',
      render: (value) => (
        <span className="text-gray-500">{value || 'No description'}</span>
      )
    },
    {
      header: 'Users',
      key: 'userCount',
      render: (value) => (
        <span className="text-gray-700 font-medium">{value ?? 0}</span>
      )
    },
    {
      header: 'Status',
      key: 'active',
      render: (value, role) => (
        <div className="flex items-center gap-3">
          <Toggle
            checked={value === true}
            onChange={(checked) => handleToggleRoleStatus(role, checked)}
            disabled={togglingRoleId === (role?.id ?? role?._id ?? role?.roleId)}
          />
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${value ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {value ? 'Active' : 'Inactive'}
          </span>
        </div>
      )
    }
  ];

  const permissionColumns = [
    {
      header: 'Permission Name',
      key: 'name',
      render: (value, permission) => (
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
          <span className="font-medium text-gray-900">
            {value || permission?.permissionName || 'Unnamed permission'}
          </span>
        </div>
      )
    },
    {
      header: 'Description',
      key: 'description',
      render: (value) => (
        <span className="text-gray-500">{value || 'No description'}</span>
      )
    },
    {
      header: 'Status',
      key: 'active',
      render: (value, permission) => {
        const statusValue = value ?? permission?.enabled;

        if (typeof statusValue !== 'boolean') {
          return <span className="text-gray-400">N/A</span>;
        }

        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusValue ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {statusValue ? 'Active' : 'Inactive'}
          </span>
        );
      }
    }
  ];

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

      // Refresh the permissions for this role
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

  // Function to categorize permissions based on their name prefix
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

      // Check each category prefix
      for (const [key, category] of Object.entries(categories)) {
        if (key !== 'OTHER' && name.startsWith(key)) {
          category.permissions.push(permission);
          categorized = true;
          break;
        }
      }

      // If not categorized, add to OTHER
      if (!categorized) {
        categories.OTHER.permissions.push(permission);
      }
    });

    // Filter out empty categories
    return Object.entries(categories)
      .filter(([_, category]) => category.permissions.length > 0)
      .map(([key, category]) => ({
        key,
        label: category.label,
        permissions: category.permissions
      }));
  };

  return (
    <div className="block" id="page-settings">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage users, roles, and CRM configuration</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Settings Tabs */}
        <div className="flex flex-row gap-2 border-b border-gray-100 pb-4 overflow-x-auto">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all whitespace-nowrap ${activeTab === item.id
                ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </div>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'st-users' && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-fadeIn">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">User Management</h2>
                <CustomButton variant="primary" onClick={() => setIsAddUserModalOpen(true)} className="text-xs py-1.5 px-3">
                  + Add User
                </CustomButton>
              </div>
              {loadingUsers ? (
                <div className="py-8 text-center text-sm text-gray-500">Loading users...</div>
              ) : (
                <div className="p-4">
                  <ReusableTable
                    columns={userColumns}
                    data={Array.isArray(users) ? users : []}
                    onEdit={() => console.log('Edit User')}
                    onDelete={() => showToast('User removed')}
                  />
                </div>
              )}
            </div>
          )}
          {activeTab === 'st-notif' && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm animate-fadeIn">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Notification Settings</h2>
              <div className="divide-y divide-gray-100">
                {notifs.map((n, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <span className="text-xs text-gray-700 font-medium">{n.label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={n.on} onChange={() => showToast('Preference saved')} />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'st-roles-permissions' && (
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
            </div>
          )}


          {activeTab === 'st-crm' && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm animate-fadeIn">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">CRM Configuration</h2>
              <div className="flex flex-col gap-4">
                <CustomInput label="Organization Name" defaultValue="TechOnly Education Pvt. Ltd." />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Default Lead Allotment</label>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Round Robin</option>
                    <option>Manual</option>
                    <option>Load Balanced</option>
                  </select>
                </div>
                <CustomInput label="Follow-up Reminder (hours before)" type="number" defaultValue={2} />
                <CustomInput label="Auto Bad Lead After (days unreachable)" type="number" defaultValue={14} />
                <CustomButton variant="primary" onClick={() => showToast('Settings saved!')} className="mt-2">
                  Save Configuration
                </CustomButton>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSuccess={fetchUsers}
      />

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

export default Settings;

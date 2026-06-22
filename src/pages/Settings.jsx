import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../AppContext';
import CustomButton from '../component/reusable/CustomButton';
import CustomInput from '../component/reusable/CustomInput';
import ReusableTable from '../component/reusable/table';
import Toggle from '../component/reusable/custumToggle';
import { getAllUser } from '../Services/user/user';
import { getAllRoles, deleteRole, toggleRoleStatus } from '../Services/role/roleService';
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

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (cancelled) return;

      if (activeTab === 'st-users') {
        fetchUsers();
      }

      if (activeTab === 'st-roles') {
        fetchRoles();
      }

      if (activeTab === 'st-permissions') {
        fetchPermissions();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [activeTab, fetchUsers, fetchRoles, fetchPermissions]);

  const notifs = [
    { label: 'New lead assigned', on: true },
    { label: 'Follow-up due reminder', on: true },
    { label: 'Lead status changes', on: true },
    { label: 'Registration completed', on: true },
    { label: 'Missed follow-ups', on: false },
    { label: 'Daily summary report', on: false },
  ];

  const menuItems = [
    { id: 'st-users', label: 'User Management' },
    { id: 'st-roles', label: 'Roles' },
    { id: 'st-permissions', label: 'Permissions' },
    { id: 'st-notif', label: 'Notifications' },
    { id: 'st-crm', label: 'CRM Config' },
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
                  + Invite User
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
          {activeTab === 'st-roles' && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-fadeIn">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">Roles</h2>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{roles.length} total</span>
                  <CustomButton
                    variant="primary"
                    onClick={handleOpenAddRoleModal}
                    className="text-xs py-1.5 px-3"
                  >
                    + Add Role
                  </CustomButton>
                </div>
              </div>
              {loadingRoles ? (
                <div className="py-8 text-center text-sm text-gray-500">Loading roles...</div>
              ) : (
                <div className="p-4">
                  <ReusableTable
                    columns={roleColumns}
                    data={Array.isArray(roles) ? roles : []}
                    emptyMessage="No roles found."
                    onView={handleOpenViewRoleModal}
                    onEdit={handleOpenEditRoleModal}
                    onDelete={handleOpenDeleteRoleModal}
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

          {activeTab === 'st-permissions' && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-fadeIn">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">Permissions</h2>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{permissions.length} total</span>
                  <CustomButton
                    variant="primary"
                    onClick={handleOpenAddPermissionModal}
                    className="text-xs py-1.5 px-3"
                  >
                    + Add Permission
                  </CustomButton>
                </div>
              </div>
              {loadingPermissions ? (
                <div className="py-8 text-center text-sm text-gray-500">Loading permissions...</div>
              ) : (
                <div className="p-4">
                  <ReusableTable
                    columns={permissionColumns}
                    data={Array.isArray(permissions) ? permissions : []}
                    emptyMessage="No permissions found."
                    onView={handleOpenViewPermissionModal}
                    onEdit={handleOpenEditPermissionModal}
                    onDelete={handleOpenDeletePermissionModal}
                  />
                </div>
              )}
            </div>
          )}


          {activeTab === 'st-crm' && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm animate-fadeIn">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">CRM Configuration</h2>
              <div className="flex flex-col gap-4">
                <CustomInput label="Organization Name" defaultValue="TechOnly Education Pvt. Ltd." />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Default Lead Assignment</label>
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

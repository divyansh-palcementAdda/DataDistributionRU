import { useState, useCallback, useEffect } from 'react';
import { useAppContext } from '../../AppContext';
import CustomButton from '../../component/reusable/CustomButton';
import ReusableTable from '../../component/reusable/table';
import { getAllUser, deleteUser } from '../../Services/user/user';
import AddUserModal from '../../component/reusable/user/addUser';
import DeleteModal from '../../component/reusable/deleteModel';

const UserManagement = () => {
  const { showToast } = useAppContext();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

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

  const handleOpenAddUserModal = () => {
    setSelectedUser(null);
    setIsAddUserModalOpen(true);
  };

  const handleOpenEditUserModal = (user) => {
    setSelectedUser(user);
    setIsAddUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setIsAddUserModalOpen(false);
    setSelectedUser(null);
  };

  const handleOpenDeleteUserModal = (user) => {
    setUserToDelete(user);
    setIsDeleteUserModalOpen(true);
  };

  const handleCloseDeleteUserModal = () => {
    setIsDeleteUserModalOpen(false);
    setUserToDelete(null);
  };

  const handleConfirmDeleteUser = async () => {
    const userId = userToDelete?.id ?? userToDelete?._id ?? userToDelete?.userId;

    if (!userId) {
      showToast('User id not found', 'error');
      return;
    }

    try {
      setIsDeletingUser(true);
      const response = await deleteUser(userId);
      const isSuccess = response?.status >= 200 && response?.status < 300;

      if (!isSuccess) {
        const message =
          response?.response?.data?.message ||
          response?.response?.data?.error ||
          response?.message ||
          'Failed to delete user.';
        showToast(message, 'error');
        return;
      }

      await fetchUsers();
      showToast('User deleted successfully!', 'success');
      handleCloseDeleteUserModal();
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-fadeIn">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">User Management</h2>
        <CustomButton variant="primary" onClick={handleOpenAddUserModal} className="text-xs py-1.5 px-3">
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
            onEdit={handleOpenEditUserModal}
            onDelete={handleOpenDeleteUserModal}
          />
        </div>
      )}

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={handleCloseUserModal}
        onSuccess={fetchUsers}
        initialData={selectedUser}
      />

      <DeleteModal
        isOpen={isDeleteUserModalOpen}
        onClose={handleCloseDeleteUserModal}
        onConfirm={handleConfirmDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete "${userToDelete?.name || userToDelete?.firstName || 'this user'}"? This action cannot be undone.`}
        isLoading={isDeletingUser}
      />
    </div>
  );
};

export default UserManagement;
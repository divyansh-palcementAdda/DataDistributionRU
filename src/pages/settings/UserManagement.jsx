import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../AppContext';
import CustomButton from '../../component/reusable/CustomButton';
import ReusableTable from '../../component/reusable/table';
import { getAllUser, deleteUser } from '../../Services/user/user';
import AddUserModal from '../../component/reusable/user/addUser';
import ViewUserModal from '../../component/reusable/user/viewUser';
import DeleteModal from '../../component/reusable/deleteModel';
import UserBulkUploadModal from '../../component/reusable/user/UserBulkUploadModal';
import * as XLSX from 'xlsx';
import { usePermissions } from '../../PermissionContext';
import { 
  FiUsers, 
  FiUserCheck, 
  FiShield, 
  FiLayers, 
  FiSearch, 
  FiRefreshCw, 
  FiPlus, 
  FiX, 
  FiPhone
} from 'react-icons/fi';

/* ── Dynamic Avatar Color Helper ── */
const getColor = (str = '') => {
  const colors = [
    '#6366F1', // Indigo
    '#0EA5E9', // Sky
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#8B5CF6', // Purple
    '#3B82F6', // Blue
    '#14B8A6', // Teal
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

/* ── Two-letter Initials Helper ── */
const getInitials = (name = '') => {
  if (!name || typeof name !== 'string') return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

/* ── Role Priority Rank for Proper Hierarchy Sorting ── */
const getRoleRank = (roles) => {
  const r = Array.isArray(roles) ? roles : (roles ? [roles] : []);
  if (r.includes('SUPER_ADMIN')) return 1;
  if (r.includes('ADMIN')) return 2;
  if (r.includes('HOD')) return 3;
  if (r.includes('COUNSELOR')) return 4;
  return 5;
};

const UserManagement = () => {
  const navigate = useNavigate();
  const { showToast } = useAppContext();
  const { hasPermission } = usePermissions();

  // Helper function to check both USER_READ and USER_VIEW permissions
  const canReadUser = () => {
    return hasPermission('USER_READ') || hasPermission('USER_VIEW');
  };

  // User list and loading states
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Sorting state - default sort by roles in ascending hierarchy (Super Admin -> Admin -> HOD -> Counselor)
  const [sortBy, setSortBy] = useState('roles');
  const [sortDirection, setSortDirection] = useState('asc');

  // Modal States
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewUserModalOpen, setIsViewUserModalOpen] = useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);

  // Download Excel function for Users
  const downloadExcel = () => {
    try {
      const excelData = sortedAndFilteredUsers.map((u, index) => {
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name || 'N/A';
        const userRoles = Array.isArray(u.roles) ? u.roles.join(', ') : (u.roles || 'N/A');
        const deptName = u.departments?.map(d => d.name).join(', ') || u.department || 'N/A';
        return {
          'S.No': index + 1,
          'Name': name,
          'Email': u.email || 'N/A',
          'Phone': u.phone || 'N/A',
          'Username': u.username || 'N/A',
          'Roles': userRoles,
          'Department': deptName,
          'Status': u.active ? 'Active' : 'Inactive',
          'Created Date': u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      XLSX.writeFile(workbook, `users_${timestamp}.xlsx`);
      showToast('Users exported successfully', 'success');
    } catch (err) {
      console.error('Failed to export users:', err);
      showToast('Failed to export users', 'error');
    }
  };

  // Fetch Users from API
  const fetchUsers = useCallback(async (search = '') => {
    try {
      setLoadingUsers(true);
      const res = await getAllUser({
        page: 0,
        size: 200, // Fetch comprehensive list so proper client-side sorting & hierarchy works across all users
        sortBy: 'createdAt',
        sortDirection: 'DESC',
        search: search.trim()
      });

      const responseData = res?.data;
      let usersArray = [];

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

  // Navigate directly to User Details Page with User ID
  const handleViewUser = (user) => {
    const userId = user?.id ?? user?._id ?? user?.userId;
    if (userId) {
      navigate(`/counselor-details/${userId}`);
    } else {
      showToast('User ID not found for redirection', 'error');
    }
  };

  // Sorting and Filtering Logic for a Proper User List
  const sortedAndFilteredUsers = useMemo(() => {
    let result = Array.isArray(users) ? [...users] : [];

    // Role filter
    if (roleFilter !== 'ALL') {
      result = result.filter((u) => {
        const userRoles = Array.isArray(u.roles) ? u.roles : (u.roles ? [u.roles] : []);
        return userRoles.includes(roleFilter);
      });
    }

    // Status filter
    if (statusFilter === 'ACTIVE') {
      result = result.filter((u) => u.active);
    } else if (statusFilter === 'INACTIVE') {
      result = result.filter((u) => !u.active);
    }

    // Client-side quick search filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((u) => {
        const name = (u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const username = (u.username || '').toLowerCase();
        const phone = (u.phone || u.mobileNo || '').toLowerCase();
        const dept = (u.department || (u.departments || []).map(d => d.name).join(' ') || '').toLowerCase();
        const roles = (Array.isArray(u.roles) ? u.roles.join(' ') : (u.roles || '')).toLowerCase();

        return name.includes(q) || email.includes(q) || username.includes(q) || phone.includes(q) || dept.includes(q) || roles.includes(q);
      });
    }

    // Sorting implementation
    result.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'roles' || sortBy === 'role') {
        const rankA = getRoleRank(a.roles);
        const rankB = getRoleRank(b.roles);
        if (rankA !== rankB) {
          comparison = rankA - rankB;
        } else {
          // Secondary sort alphabetically by name
          const nameA = (a.name || `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.username || '').toLowerCase();
          const nameB = (b.name || `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.username || '').toLowerCase();
          comparison = nameA.localeCompare(nameB);
        }
      } else if (sortBy === 'name') {
        const nameA = (a.name || `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.username || '').toLowerCase();
        const nameB = (b.name || `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.username || '').toLowerCase();
        comparison = nameA.localeCompare(nameB);
      } else if (sortBy === 'email') {
        const emailA = (a.email || '').toLowerCase();
        const emailB = (b.email || '').toLowerCase();
        comparison = emailA.localeCompare(emailB);
      } else if (sortBy === 'department') {
        const deptA = (a.department || (a.departments || []).map(d => d.name).join(', ') || '').toLowerCase();
        const deptB = (b.department || (b.departments || []).map(d => d.name).join(', ') || '').toLowerCase();
        comparison = deptA.localeCompare(deptB);
      } else if (sortBy === 'active' || sortBy === 'status') {
        comparison = (a.active === b.active) ? 0 : a.active ? -1 : 1;
      } else if (sortBy === 'lastLogin' || sortBy === 'lastActive') {
        const dateA = a.lastLogin ? new Date(a.lastLogin).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const dateB = b.lastLogin ? new Date(b.lastLogin).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        comparison = dateA - dateB;
      } else {
        const rankA = getRoleRank(a.roles);
        const rankB = getRoleRank(b.roles);
        comparison = rankA - rankB;
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [users, roleFilter, statusFilter, searchQuery, sortBy, sortDirection]);

  // Handle Table Sorting Trigger
  const handleSort = (columnKey, newDirection) => {
    setSortBy(columnKey);
    setSortDirection(newDirection);
  };

  // Overview Metrics Calculation
  const stats = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    const total = list.length;
    const active = list.filter((u) => u.active).length;
    const admins = list.filter((u) => {
      const roles = Array.isArray(u.roles) ? u.roles : [];
      return roles.includes('ADMIN') || roles.includes('SUPER_ADMIN');
    }).length;
    const staff = list.filter((u) => {
      const roles = Array.isArray(u.roles) ? u.roles : [];
      return roles.includes('COUNSELOR') || roles.includes('HOD');
    }).length;

    return { total, active, admins, staff };
  }, [users]);

  // Clean, Balanced Table Columns
  const userColumns = useMemo(() => [
    {
      header: 'Name',
      key: 'name',
      sortable: true,
      render: (_, u) => {
        const fullName = u.name || (u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.firstName) || u.username || 'Unknown User';
        const color = getColor(fullName);
        const initials = getInitials(fullName);

        return (
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-xs flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
              style={{ backgroundColor: color }}
              onClick={() => handleViewUser(u)}
              title={`View ${fullName}`}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => handleViewUser(u)}
                className="font-medium text-gray-900 hover:text-indigo-600 text-sm text-left block truncate transition-colors cursor-pointer border-none bg-transparent p-0"
                title={`View ${fullName}`}
              >
                {fullName}
              </button>
              {u.username && (
                <span className="text-[11px] text-gray-400">
                  @{u.username}
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Email',
      key: 'email',
      sortable: true,
      render: (val, u) => (
        <div className="min-w-0">
          <div className="text-gray-600 text-xs font-medium truncate" title={val}>
            {val || '—'}
          </div>
          {(u.phone || u.mobileNo) && (
            <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
              <FiPhone className="text-[10px]" />
              <span>{u.phone || u.mobileNo}</span>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Role',
      key: 'roles',
      sortable: true,
      render: (roles) => {
        const roleList = Array.isArray(roles) ? roles : (roles ? [roles] : []);
        if (roleList.length === 0) {
          return <span className="text-xs text-gray-400 italic">User</span>;
        }

        return (
          <div className="flex flex-wrap gap-1.5">
            {roleList.map((r, i) => {
              const roleUpper = String(r).toUpperCase();
              let badgeClass = 'bg-gray-100 text-gray-600';

              if (roleUpper === 'SUPER_ADMIN') {
                badgeClass = 'bg-purple-50 text-purple-700 border border-purple-200';
              } else if (roleUpper === 'ADMIN') {
                badgeClass = 'bg-blue-50 text-blue-700 border border-blue-200';
              } else if (roleUpper === 'HOD') {
                badgeClass = 'bg-amber-50 text-amber-800 border border-amber-200';
              } else if (roleUpper === 'COUNSELOR') {
                badgeClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
              }

              return (
                <span
                  key={i}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase inline-flex items-center gap-1 ${badgeClass}`}
                >
                  {roleUpper.replace(/_/g, ' ')}
                </span>
              );
            })}
          </div>
        );
      }
    },
    {
      header: 'Department',
      key: 'department',
      sortable: true,
      render: (_, u) => {
        const isPrivileged = Array.isArray(u.roles) && (u.roles.includes('ADMIN') || u.roles.includes('SUPER_ADMIN'));

        if (isPrivileged) {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
              <FiShield className="text-[10px]" />
              System-Wide Access
            </span>
          );
        }

        if (Array.isArray(u.departments) && u.departments.length > 0) {
          return (
            <div className="flex flex-wrap gap-1">
              {u.departments.map((d, idx) => (
                <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                  {d.name || d.code || 'Dept'}
                </span>
              ))}
            </div>
          );
        }

        if (u.department) {
          return <span className="text-xs text-gray-700 font-medium">{u.department}</span>;
        }

        return <span className="text-xs text-gray-400 italic">None</span>;
      }
    },
    {
      header: 'Status',
      key: 'active',
      sortable: true,
      render: (active) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            active
              ? 'bg-green-50 text-green-600 border border-green-200'
              : 'bg-gray-100 text-gray-500 border border-gray-200'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-gray-400'}`} />
          {active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Last Active',
      key: 'lastLogin',
      sortable: true,
      render: (_, u) => {
        const dateVal = u.lastLogin || u.createdAt;
        if (!dateVal) return <span className="text-xs text-gray-400">N/A</span>;
        try {
          const d = new Date(dateVal);
          return (
            <span className="text-xs text-gray-500">
              {d.toLocaleDateString()}
            </span>
          );
        } catch {
          return <span className="text-xs text-gray-400">N/A</span>;
        }
      }
    }
  ], []);

  // Modal Handlers
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
      showToast('User ID not found', 'error');
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

      await fetchUsers(searchQuery);
      showToast('User deleted successfully!', 'success');
      handleCloseDeleteUserModal();
    } catch (err) {
      showToast(err?.message || 'Error deleting user', 'error');
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers(searchQuery);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchUsers]);

  // Initial load
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* ── Top Overview Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl flex-shrink-0 border border-blue-100">
            <FiUsers />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Users</div>
            <div className="text-2xl font-bold text-gray-800 mt-0.5">{stats.total}</div>
          </div>
        </div>

        {/* Active Accounts */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl flex-shrink-0 border border-green-100">
            <FiUserCheck />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Users</div>
            <div className="text-2xl font-bold text-gray-800 mt-0.5">{stats.active}</div>
          </div>
        </div>

        {/* Administrators */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl flex-shrink-0 border border-purple-100">
            <FiShield />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admins / Super</div>
            <div className="text-2xl font-bold text-gray-800 mt-0.5">{stats.admins}</div>
          </div>
        </div>

        {/* Staff & Counselors */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl flex-shrink-0 border border-amber-100">
            <FiLayers />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">HODs & Counselors</div>
            <div className="text-2xl font-bold text-gray-800 mt-0.5">{stats.staff}</div>
          </div>
        </div>
      </div>

      {/* ── Main User Management Card ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Card Header & Controls */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 tracking-tight">User Management</h2>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                {sortedAndFilteredUsers.length} shown
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Manage system access, role assignments, department scopes, and view counselor performance.
            </p>
          </div>

          {/* Action Bar (Search, Role Filter, Status Filter, Refresh, Add Button) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search by name, email, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-700"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer border-none bg-transparent"
                >
                  <FiX className="text-xs" />
                </button>
              )}
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs py-2 px-3 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-700 cursor-pointer font-medium"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="HOD">HOD</option>
              <option value="COUNSELOR">Counselor</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-2 px-3 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-700 cursor-pointer font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => fetchUsers(searchQuery)}
              disabled={loadingUsers}
              className="p-2 border border-gray-200 text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh users list"
            >
              <FiRefreshCw className={`text-sm ${loadingUsers ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            {/* Export Excel Button */}
            <button
              type="button"
              onClick={downloadExcel}
              disabled={sortedAndFilteredUsers.length === 0}
              className="text-xs py-2 px-3 border border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 font-semibold disabled:opacity-50"
              title="Export all filtered users to Excel"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export Excel
            </button>

            {/* Bulk Upload Button */}
            {(hasPermission('USER_BULK_UPLOAD') || hasPermission('USER_CREATE')) && (
              <button
                type="button"
                onClick={() => setIsBulkUploadModalOpen(true)}
                className="text-xs py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                title="Bulk upload users from Excel"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                Bulk Upload
              </button>
            )}

            {/* Add User Button */}
            {hasPermission('USER_CREATE') && (
              <CustomButton
                variant="primary"
                onClick={handleOpenAddUserModal}
                className="text-xs py-2 px-3.5 rounded-xl font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <FiPlus className="text-sm" />
                Add User
              </CustomButton>
            )}
          </div>
        </div>

        {/* Table Content with Project Theme Header Gradient */}
        {loadingUsers ? (
          <div className="py-16 text-center">
            <FiRefreshCw className="animate-spin text-2xl text-indigo-600 mx-auto mb-3" />
            <div className="text-sm font-semibold text-gray-700">Loading user accounts...</div>
            <div className="text-xs text-gray-400 mt-1">Please wait while user records are being fetched.</div>
          </div>
        ) : (
          <div className="p-4">
            <ReusableTable
              columns={userColumns}
              data={sortedAndFilteredUsers}
              emptyMessage="No users found matching your search or filters."
              onView={canReadUser() ? handleViewUser : undefined}
              onEdit={hasPermission('USER_UPDATE') ? handleOpenEditUserModal : undefined}
              onDelete={hasPermission('USER_DELETE') ? handleOpenDeleteUserModal : undefined}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={handleSort}
              headerClassName="bg-gradient-to-r from-[#435fff] via-[#6366f1] to-[#a571ff] text-white shadow-xs border-b border-indigo-700"
            />
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={handleCloseUserModal}
        onSuccess={() => fetchUsers(searchQuery)}
        initialData={selectedUser}
      />

      <ViewUserModal
        isOpen={isViewUserModalOpen}
        onClose={() => setIsViewUserModalOpen(false)}
        userData={selectedUser}
      />

      <DeleteModal
        isOpen={isDeleteUserModalOpen}
        onClose={handleCloseDeleteUserModal}
        onConfirm={handleConfirmDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete user "${userToDelete?.name || userToDelete?.firstName || userToDelete?.username || 'this user'}"? This action cannot be undone.`}
        isLoading={isDeletingUser}
      />

      <UserBulkUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
        onSuccess={() => {
          fetchUsers(searchQuery);
          showToast('Users imported successfully', 'success');
        }}
      />
    </div>
  );
};

export default UserManagement;
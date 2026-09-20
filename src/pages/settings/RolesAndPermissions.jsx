import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAppContext } from '../../AppContext';
import CustomButton from '../../component/reusable/CustomButton';
import Toggle from '../../component/reusable/custumToggle';
import { getAllRoles, deleteRole, toggleRoleStatus, getRolePermissions, allotPermissionsToRole } from '../../Services/role/roleService';
import { getAllPermissions, deletePermission, getUnmappedPermissions } from '../../Services/permissions/permissions';
import AddEditRoleModal from '../../component/reusable/role/addandeditRolemodel';
import AddEditPermissionModal from '../../component/reusable/permissions/addandeditPermissionModel';
import DeleteModal from '../../component/reusable/deleteModel';
import RoleViewModal from '../../component/reusable/role/roleViewModel';
import PermissionViewModal from '../../component/reusable/permissions/permissionViewModel';
import { usePermissions } from '../../PermissionContext';

// Entity label formatting mapping for clean UI presentation
const ENTITY_LABELS = {
  LEAD: 'Lead Management',
  USER: 'User Management',
  ROLE: 'Role Management',
  PERMISSION: 'Permission Management',
  DEPARTMENT: 'Department Management',
  LEAD_STATUS: 'Lead Statuses & Stages',
  LEADSOURCE: 'Lead Sources',
  COURSE: 'Course Management',
  PROGRAM: 'Academic Programs',
  COURSE_TYPE: 'Course Types & Categories',
  COURSE_TEMPLATE: 'Course Outreach Templates',
  COURSE_IMAGE: 'Course Marketing Images',
  COURSE_USP: 'Course Unique Selling Points',
  FOLLOW_UP: 'Follow-up Management',
  FEEDBACK: 'Feedback Management',
  BOARD: 'Education Boards',
  GRADE: 'Academic Grades',
  DASHBOARD: 'Dashboard & Analytics',
  DROPDOWN: 'Dropdown Data Access',
  DATA_SEGREGATION: 'Data Segregation Pipeline',
  USER_ACTIVITY: 'User Activity & Audit Logs',
  EMAIL: 'Email & Notification Services',
  AUTH: 'Authentication & Session Access',
  SYSTEM: 'System Operations',
};

const formatEntityName = (entity) => {
  if (!entity) return 'Other System Operations';
  return ENTITY_LABELS[entity] || entity.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

const GROUP_CONFIG = {
  LEAD_FIELD: { label: 'Lead Field Permissions', icon: '🎯' },
  GENERAL_SYSTEM: { label: 'General System Permissions', icon: '⚙️' },
  SYSTEM_CONFIG: { label: 'System Configuration', icon: '🔧' },
};

const RolesAndPermissions = () => {
  const { showToast } = useAppContext();
  const { canCreate, canUpdate, canDelete, canRead, hasPermission, refreshPermissions } = usePermissions();

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // Modals state
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

  // Active Role and Permissions State
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loadingRolePermissions, setLoadingRolePermissions] = useState(false);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  // Dynamic Tabs and Search
  const [activePermissionTab, setActivePermissionTab] = useState('LEAD_FIELD');
  const [permissionSearchQuery, setPermissionSearchQuery] = useState('');
  const [unmappedStatus, setUnmappedStatus] = useState(null);
  const [isValidatingMetadata, setIsValidatingMetadata] = useState(false);

  const fetchRoles = useCallback(async () => {
    try {
      setLoadingRoles(true);
      const res = await getAllRoles();
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

  const checkMetadataIntegrity = useCallback(async () => {
    try {
      setIsValidatingMetadata(true);
      const res = await getUnmappedPermissions();
      const count = res?.data?.data?.count ?? 0;
      setUnmappedStatus(count);
      if (count === 0) {
        showToast('All permissions mapped to backend metadata!', 'success');
      } else {
        showToast(`${count} unmapped permissions detected. Check backend mappings.`, 'warning');
      }
    } catch {
      // Quiet fail if endpoint is unauthenticated or loading
    } finally {
      setIsValidatingMetadata(false);
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

  // Dynamically extract and order permission groups from backend metadata
  const availableGroups = useMemo(() => {
    const groupsSet = new Set();
    if (Array.isArray(permissions)) {
      permissions.forEach(p => {
        if (p.permissionGroup) {
          groupsSet.add(p.permissionGroup);
        }
      });
    }

    const preferredOrder = ['LEAD_FIELD', 'GENERAL_SYSTEM', 'SYSTEM_CONFIG'];
    const ordered = [];

    preferredOrder.forEach(g => {
      if (groupsSet.has(g)) {
        ordered.push({
          id: g,
          label: GROUP_CONFIG[g]?.label || g.replace(/_/g, ' '),
          icon: GROUP_CONFIG[g]?.icon || '📁',
        });
        groupsSet.delete(g);
      }
    });

    Array.from(groupsSet).sort().forEach(g => {
      ordered.push({
        id: g,
        label: g.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        icon: '📁',
      });
    });

    return ordered.length > 0 ? ordered : [
      { id: 'LEAD_FIELD', label: 'Lead Field Permissions', icon: '🎯' },
      { id: 'GENERAL_SYSTEM', label: 'General System Permissions', icon: '⚙️' },
      { id: 'SYSTEM_CONFIG', label: 'System Configuration', icon: '🔧' }
    ];
  }, [permissions]);

  // Ensure active tab stays valid
  useEffect(() => {
    if (availableGroups.length > 0 && !availableGroups.some(g => g.id === activePermissionTab)) {
      setActivePermissionTab(availableGroups[0].id);
    }
  }, [availableGroups, activePermissionTab]);

  // Lead field grouping derived purely from backend metadata
  const leadFieldsByGroup = useMemo(() => {
    const leadFieldPerms = (permissions || []).filter(
      p => p.permissionGroup === 'LEAD_FIELD' || (p.name && p.name.startsWith('LEAD_FIELD_'))
    );

    const fieldsByKey = {};
    leadFieldPerms.forEach(p => {
      const key = p.fieldKey || (p.name ? p.name.replace(/^LEAD_FIELD_/, '').replace(/_(READ|WRITE)$/, '').toLowerCase() : 'unknown');
      if (!fieldsByKey[key]) {
        fieldsByKey[key] = {
          fieldKey: key,
          fieldLabel: p.fieldLabel || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          fieldGroup: p.fieldGroup || 'Personal & Contact Information',
          displayOrder: p.displayOrder || 999,
          viewPermission: null,
          editPermission: null,
        };
      }
      const permType = p.permissionType || (p.name?.endsWith('_WRITE') ? 'EDIT' : 'VIEW');
      if (permType === 'VIEW') {
        fieldsByKey[key].viewPermission = p;
        if (p.fieldLabel) fieldsByKey[key].fieldLabel = p.fieldLabel;
        if (p.fieldGroup) fieldsByKey[key].fieldGroup = p.fieldGroup;
        if (p.displayOrder != null) fieldsByKey[key].displayOrder = p.displayOrder;
      } else if (permType === 'EDIT') {
        fieldsByKey[key].editPermission = p;
        if (!fieldsByKey[key].fieldLabel && p.fieldLabel) fieldsByKey[key].fieldLabel = p.fieldLabel;
        if (!fieldsByKey[key].fieldGroup && p.fieldGroup) fieldsByKey[key].fieldGroup = p.fieldGroup;
      }
    });

    const q = permissionSearchQuery.trim().toLowerCase();
    const grouped = {};

    Object.values(fieldsByKey)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .forEach(field => {
        if (q) {
          const matches =
            field.fieldLabel.toLowerCase().includes(q) ||
            field.fieldKey.toLowerCase().includes(q) ||
            field.fieldGroup.toLowerCase().includes(q) ||
            (field.viewPermission?.description && field.viewPermission.description.toLowerCase().includes(q)) ||
            (field.editPermission?.description && field.editPermission.description.toLowerCase().includes(q));
          if (!matches) return;
        }

        if (!grouped[field.fieldGroup]) {
          grouped[field.fieldGroup] = [];
        }
        grouped[field.fieldGroup].push(field);
      });

    return grouped;
  }, [permissions, permissionSearchQuery]);

  // General & System Configuration permissions grouped dynamically by backend entity
  const permissionsByEntity = useMemo(() => {
    const currentGroup = activePermissionTab;
    const filtered = (permissions || []).filter(p => {
      if (p.permissionGroup) {
        return p.permissionGroup === currentGroup;
      }
      if (currentGroup === 'GENERAL_SYSTEM') {
        return !p.name?.startsWith('LEAD_FIELD_');
      }
      return false;
    });

    const q = permissionSearchQuery.trim().toLowerCase();
    const byEntity = {};

    filtered.forEach(p => {
      if (q) {
        const matches =
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.code && p.code.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.entity && p.entity.toLowerCase().includes(q));
        if (!matches) return;
      }

      const entityKey = p.entity || 'OTHER';
      if (!byEntity[entityKey]) {
        byEntity[entityKey] = [];
      }
      byEntity[entityKey].push(p);
    });

    return byEntity;
  }, [permissions, activePermissionTab, permissionSearchQuery]);

  // Permission toggles
  const handleTogglePermission = (permissionId) => {
    if (!hasPermission('PERMISSION_UPDATE')) {
      showToast('You do not have permission to modify permissions', 'error');
      return;
    }
    setSelectedPermissionIds(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  // Lead field global actions
  const handleSelectAllLeadFieldViews = () => {
    if (!hasPermission('PERMISSION_UPDATE')) {
      showToast('You do not have permission to modify permissions', 'error');
      return;
    }
    const viewIds = (permissions || [])
      .filter(p => (p.permissionGroup === 'LEAD_FIELD' || p.name?.startsWith('LEAD_FIELD_')) && (p.permissionType === 'VIEW' || p.name?.endsWith('_READ')))
      .map(p => p.id ?? p._id ?? p.permissionId)
      .filter(Boolean);
    setSelectedPermissionIds(prev => Array.from(new Set([...prev, ...viewIds])));
  };

  const handleClearAllLeadFieldViews = () => {
    if (!hasPermission('PERMISSION_UPDATE')) {
      showToast('You do not have permission to modify permissions', 'error');
      return;
    }
    const viewIds = new Set(
      (permissions || [])
        .filter(p => (p.permissionGroup === 'LEAD_FIELD' || p.name?.startsWith('LEAD_FIELD_')) && (p.permissionType === 'VIEW' || p.name?.endsWith('_READ')))
        .map(p => p.id ?? p._id ?? p.permissionId)
        .filter(Boolean)
    );
    setSelectedPermissionIds(prev => prev.filter(id => !viewIds.has(id)));
  };

  const handleSelectAllLeadFieldEdits = () => {
    if (!hasPermission('PERMISSION_UPDATE')) {
      showToast('You do not have permission to modify permissions', 'error');
      return;
    }
    const editIds = (permissions || [])
      .filter(p => (p.permissionGroup === 'LEAD_FIELD' || p.name?.startsWith('LEAD_FIELD_')) && (p.permissionType === 'EDIT' || p.name?.endsWith('_WRITE')))
      .map(p => p.id ?? p._id ?? p.permissionId)
      .filter(Boolean);
    setSelectedPermissionIds(prev => Array.from(new Set([...prev, ...editIds])));
  };

  const handleClearAllLeadFieldEdits = () => {
    if (!hasPermission('PERMISSION_UPDATE')) {
      showToast('You do not have permission to modify permissions', 'error');
      return;
    }
    const editIds = new Set(
      (permissions || [])
        .filter(p => (p.permissionGroup === 'LEAD_FIELD' || p.name?.startsWith('LEAD_FIELD_')) && (p.permissionType === 'EDIT' || p.name?.endsWith('_WRITE')))
        .map(p => p.id ?? p._id ?? p.permissionId)
        .filter(Boolean)
    );
    setSelectedPermissionIds(prev => prev.filter(id => !editIds.has(id)));
  };

  const handleCategoryLeadFieldToggle = (categoryFields, type, enable) => {
    if (!hasPermission('PERMISSION_UPDATE')) {
      showToast('You do not have permission to modify permissions', 'error');
      return;
    }
    const targetIds = new Set(
      categoryFields
        .map(f => {
          const perm = type === 'view' ? f.viewPermission : f.editPermission;
          return perm ? (perm.id ?? perm._id ?? perm.permissionId) : null;
        })
        .filter(Boolean)
    );

    setSelectedPermissionIds(prev => {
      if (enable) {
        return Array.from(new Set([...prev, ...targetIds]));
      } else {
        return prev.filter(id => !targetIds.has(id));
      }
    });
  };

  // Entity group bulk actions
  const handleEntityToggleAll = (entityPermissions, enable) => {
    if (!hasPermission('PERMISSION_UPDATE')) {
      showToast('You do not have permission to modify permissions', 'error');
      return;
    }
    const targetIds = new Set(entityPermissions.map(p => p.id ?? p._id ?? p.permissionId).filter(Boolean));
    setSelectedPermissionIds(prev => {
      if (enable) {
        return Array.from(new Set([...prev, ...targetIds]));
      } else {
        return prev.filter(id => !targetIds.has(id));
      }
    });
  };

  // Save role permissions
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
      if (typeof refreshPermissions === 'function') {
        await refreshPermissions();
      }
      showToast('Permissions allotted successfully!', 'success');
    } catch (error) {
      console.error('Failed to allot permissions', error);
      showToast('Failed to allot permissions', 'error');
    } finally {
      setIsSavingPermissions(false);
    }
  };

  // Role CRUD Actions
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

  // Permission CRUD Actions
  const handleOpenAddPermissionModal = () => {
    setSelectedPermission(null);
    setIsPermissionModalOpen(true);
  };

  const handleOpenEditPermissionModal = (permission) => {
    setSelectedPermission(permission);
    setIsPermissionModalOpen(true);
  };

  const handleClosePermissionModal = () => {
    setIsPermissionModalOpen(false);
    setSelectedPermission(null);
  };

  const handleOpenViewPermissionModal = (permission) => {
    const permId = permission?.id ?? permission?._id ?? permission?.permissionId;
    setSelectedPermissionViewId(permId || null);
    setIsPermissionViewModalOpen(true);
  };

  const handleCloseViewPermissionModal = () => {
    setIsPermissionViewModalOpen(false);
    setSelectedPermissionViewId(null);
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
    const permId = permissionToDelete?.id ?? permissionToDelete?._id ?? permissionToDelete?.permissionId;
    if (!permId) {
      showToast('Permission id not found', 'error');
      return;
    }

    try {
      setIsDeletingPermission(true);
      const response = await deletePermission(permId);
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
    } catch (error) {
      console.error('Error deleting permission', error);
      showToast(error?.response?.data?.message || 'Failed to delete permission.', 'error');
    } finally {
      setIsDeletingPermission(false);
    }
  };

  // Operation badge renderer
  const renderOperationBadge = (opType) => {
    switch (opType) {
      case 'VIEW':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">VIEW</span>;
      case 'CREATE':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">CREATE</span>;
      case 'EDIT':
      case 'UPDATE':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">UPDATE</span>;
      case 'DELETE':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">DELETE</span>;
      case 'ASSIGN':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">ASSIGN</span>;
      case 'EXECUTE':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">EXECUTE</span>;
      case 'UPLOAD':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">UPLOAD</span>;
      case 'EXPORT':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200">EXPORT</span>;
      case 'MANAGE':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">MANAGE</span>;
      default:
        return opType ? (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">{opType}</span>
        ) : null;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-fadeIn">
      {/* Page Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-gray-800">Roles & Permissions Management</h2>
          <button
            type="button"
            onClick={checkMetadataIntegrity}
            disabled={isValidatingMetadata}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            title="Click to verify dynamic backend metadata mapping integrity"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {isValidatingMetadata ? 'Checking...' : unmappedStatus === 0 ? 'Metadata Synced (0 Unmapped)' : unmappedStatus > 0 ? `${unmappedStatus} Unmapped` : 'Verify Metadata'}
          </button>
        </div>
        {selectedRoleForPermissions && hasPermission('PERMISSION_UPDATE') && (
          <CustomButton
            variant="primary"
            onClick={handleSaveRolePermissions}
            disabled={isSavingPermissions}
            className="text-xs py-1.5 px-3.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            {isSavingPermissions ? 'Saving...' : 'Save Permissions'}
          </CustomButton>
        )}
      </div>

      <div className="flex h-[640px]">
        {/* Left Side - Roles List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between flex-shrink-0">
            <h3 className="text-xs font-semibold text-gray-700">All Roles</h3>
            {hasPermission('ROLE_CREATE') && (
              <CustomButton
                variant="primary"
                onClick={handleOpenAddRoleModal}
                className="text-xs py-1 px-2.5"
              >
                + Add Role
              </CustomButton>
            )}
          </div>
          {loadingRoles ? (
            <div className="py-8 text-center text-sm text-gray-500">Loading roles...</div>
          ) : (
            <div className="p-3 overflow-y-auto flex-1">
              {Array.isArray(roles) && roles.length > 0 ? (
                <div className="space-y-1.5">
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
                            ? 'bg-blue-50/80 border-blue-300 shadow-xs'
                            : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className="flex items-center gap-2 flex-1 cursor-pointer"
                            onClick={() => setSelectedRoleForPermissions(role)}
                          >
                            <div className={`w-2.5 h-2.5 rounded-full ${role.active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="font-semibold text-gray-900 text-sm">{role.name || 'Unnamed role'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {hasPermission('ROLE_UPDATE') && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditRoleModal(role);
                                }}
                                className="p-1 rounded hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Edit Role"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}
                            {hasPermission('ROLE_DELETE') && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDeleteRoleModal(role);
                                }}
                                className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete Role"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                        {role.description && (
                          <p className="text-[11px] text-gray-500 mt-1 ml-4 line-clamp-1">{role.description}</p>
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

        {/* Right Side - Dynamic Backend-driven Permissions Matrix */}
        <div className="w-2/3 flex flex-col">
          {/* Header with Dynamic Tab Switcher */}
          <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
            <div className="flex items-center gap-3">
              <h3 className="text-xs font-bold text-gray-800">
                {selectedRoleForPermissions ? `Permissions: ${selectedRoleForPermissions.name}` : 'Select a role to configure permissions'}
              </h3>
              {selectedRoleForPermissions && (
                <div className="flex items-center bg-gray-200/80 p-0.5 rounded-lg text-xs">
                  {availableGroups.map(grp => (
                    <button
                      key={grp.id}
                      onClick={() => setActivePermissionTab(grp.id)}
                      className={`px-3 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                        activePermissionTab === grp.id
                          ? 'bg-white text-blue-700 shadow-2xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span>{grp.icon}</span>
                      <span>{grp.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedRoleForPermissions && (
              <div>
                <input
                  type="text"
                  placeholder="Search permissions..."
                  value={permissionSearchQuery}
                  onChange={(e) => setPermissionSearchQuery(e.target.value)}
                  className="text-xs px-2.5 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-7 w-48"
                />
              </div>
            )}
          </div>

          {!selectedRoleForPermissions ? (
            <div className="py-16 text-center text-sm text-gray-400 flex flex-col items-center justify-center">
              <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Please select a role from the left list to view and configure permissions
            </div>
          ) : loadingPermissions || loadingRolePermissions ? (
            <div className="py-16 text-center text-sm text-gray-500">Loading permissions...</div>
          ) : activePermissionTab === 'LEAD_FIELD' ? (
            /* ==============================================================
               TAB: LEAD FIELD PERMISSIONS (Grouped by Backend fieldGroup)
               ============================================================== */
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Global Field Controls */}
              <div className="px-4 py-2 bg-blue-50/50 border-b border-blue-100 flex flex-wrap items-center justify-between gap-2 text-xs flex-shrink-0">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                  Global Lead Field Controls
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSelectAllLeadFieldViews();
                    }}
                    className="px-2 py-0.5 rounded bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold transition-colors"
                    title="Grant View to all lead fields"
                  >
                    ✓ View All
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleClearAllLeadFieldViews();
                    }}
                    className="px-2 py-0.5 rounded bg-white hover:bg-gray-100 text-gray-600 border border-gray-300 font-semibold transition-colors"
                    title="Revoke View from all lead fields"
                  >
                    ✕ Clear View
                  </button>
                  <span className="text-gray-300 mx-0.5">|</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSelectAllLeadFieldEdits();
                    }}
                    className="px-2 py-0.5 rounded bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 font-semibold transition-colors"
                    title="Grant Edit to all lead fields"
                  >
                    ✓ Edit All
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleClearAllLeadFieldEdits();
                    }}
                    className="px-2 py-0.5 rounded bg-white hover:bg-gray-100 text-gray-600 border border-gray-300 font-semibold transition-colors"
                    title="Revoke Edit from all lead fields"
                  >
                    ✕ Clear Edit
                  </button>
                </div>
              </div>

              {/* Dynamic Field Categories */}
              <div className="p-4 overflow-y-auto flex-1 space-y-5">
                {Object.entries(leadFieldsByGroup).map(([groupName, fields]) => (
                  <div key={groupName} className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                    {/* Category Header with Group Bulk Actions */}
                    <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">{groupName}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-gray-200 text-gray-600 rounded-full">
                          {fields.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCategoryLeadFieldToggle(fields, 'view', true);
                          }}
                          className="px-1.5 py-0.5 rounded bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium transition-colors"
                        >
                          + View All
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCategoryLeadFieldToggle(fields, 'view', false);
                          }}
                          className="px-1.5 py-0.5 rounded bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 font-medium transition-colors"
                        >
                          - Clear View
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCategoryLeadFieldToggle(fields, 'edit', true);
                          }}
                          className="px-1.5 py-0.5 rounded bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 font-medium transition-colors"
                        >
                          + Edit All
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCategoryLeadFieldToggle(fields, 'edit', false);
                          }}
                          className="px-1.5 py-0.5 rounded bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 font-medium transition-colors"
                        >
                          - Clear Edit
                        </button>
                      </div>
                    </div>

                    {/* Category Fields Table */}
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                          <th className="py-2 px-4">Field Name</th>
                          <th className="py-2 px-4 text-center w-28">View (Read)</th>
                          <th className="py-2 px-4 text-center w-28">Edit (Write)</th>
                          <th className="py-2 px-4 text-right w-36">Effective Access</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {fields.map((field) => {
                          const readPermId = field.viewPermission ? (field.viewPermission.id ?? field.viewPermission._id ?? field.viewPermission.permissionId) : null;
                          const writePermId = field.editPermission ? (field.editPermission.id ?? field.editPermission._id ?? field.editPermission.permissionId) : null;

                          const isViewAllowed = readPermId && selectedPermissionIds.includes(readPermId);
                          const isEditAllowed = writePermId && selectedPermissionIds.includes(writePermId);

                          return (
                            <tr key={field.fieldKey} className="hover:bg-blue-50/30 transition-colors">
                              <td className="py-2.5 px-4">
                                <div className="font-semibold text-gray-800 text-xs">{field.fieldLabel}</div>
                                <div className="text-[10px] text-gray-400 mt-0.5 font-mono">{field.fieldKey}</div>
                              </td>

                              {/* View Toggle */}
                              <td className="py-2.5 px-4 text-center">
                                {readPermId ? (
                                  <button
                                    type="button"
                                    role="switch"
                                    aria-checked={Boolean(isViewAllowed)}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleTogglePermission(readPermId);
                                    }}
                                    disabled={!hasPermission('PERMISSION_UPDATE')}
                                    className={`w-8 h-4 rounded-full transition-colors relative inline-flex items-center cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                                      isViewAllowed ? 'bg-emerald-600' : 'bg-gray-200'
                                    }`}
                                    title={isViewAllowed ? 'View Allowed (click to revoke)' : 'View Disallowed (click to grant)'}
                                  >
                                    <span
                                      className={`w-3 h-3 bg-white rounded-full transition-transform transform shadow-xs pointer-events-none inline-block ${
                                        isViewAllowed ? 'translate-x-4' : 'translate-x-0.5'
                                      }`}
                                    />
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-gray-400 italic">N/A</span>
                                )}
                              </td>

                              {/* Edit Toggle */}
                              <td className="py-2.5 px-4 text-center">
                                {writePermId ? (
                                  <button
                                    type="button"
                                    role="switch"
                                    aria-checked={Boolean(isEditAllowed)}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleTogglePermission(writePermId);
                                    }}
                                    disabled={!hasPermission('PERMISSION_UPDATE')}
                                    className={`w-8 h-4 rounded-full transition-colors relative inline-flex items-center cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                                      isEditAllowed ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                                    title={isEditAllowed ? 'Edit Allowed (click to revoke)' : 'Edit Disallowed (click to grant)'}
                                  >
                                    <span
                                      className={`w-3 h-3 bg-white rounded-full transition-transform transform shadow-xs pointer-events-none inline-block ${
                                        isEditAllowed ? 'translate-x-4' : 'translate-x-0.5'
                                      }`}
                                    />
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-gray-400 italic" title="System Managed Field">Auto</span>
                                )}
                              </td>

                              {/* Effective Status Badge */}
                              <td className="py-2.5 px-4 text-right">
                                {!isViewAllowed ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                                    Hidden
                                  </span>
                                ) : isEditAllowed ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    ● View & Edit
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                    Read-Only
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ==============================================================
               TAB: GENERAL SYSTEM / CONFIG PERMISSIONS (Grouped by Backend Entity)
               ============================================================== */
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {Object.keys(permissionsByEntity).length > 0 ? (
                Object.entries(permissionsByEntity).map(([entityName, entityPerms]) => (
                  <div key={entityName} className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                    {/* Entity Header */}
                    <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                          {formatEntityName(entityName)}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-gray-200 text-gray-600 rounded-full">
                          {entityPerms.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <button
                          type="button"
                          onClick={() => handleEntityToggleAll(entityPerms, true)}
                          className="px-2 py-0.5 rounded bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 font-medium transition-colors"
                        >
                          + Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEntityToggleAll(entityPerms, false)}
                          className="px-2 py-0.5 rounded bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 font-medium transition-colors"
                        >
                          - Clear All
                        </button>
                      </div>
                    </div>

                    {/* Entity Permissions Grid */}
                    <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {entityPerms.map((permission) => {
                        const permissionId = permission?.id ?? permission?._id ?? permission?.permissionId;
                        const isSelected = selectedPermissionIds.includes(permissionId);
                        return (
                          <div
                            key={permissionId}
                            onClick={hasPermission('PERMISSION_UPDATE') ? () => handleTogglePermission(permissionId) : undefined}
                            className={`p-2.5 rounded-lg transition-all border flex items-start gap-2.5 ${
                              isSelected
                                ? 'bg-blue-50/70 border-blue-200 shadow-2xs'
                                : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                            } ${!hasPermission('PERMISSION_UPDATE') ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                          >
                            <div className={`w-4 h-4 rounded border mt-0.5 flex-shrink-0 flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-gray-300 bg-white'
                            }`}>
                              {isSelected && (
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="font-semibold text-gray-900 text-xs truncate">
                                  {permission.code || permission.name}
                                </span>
                                {renderOperationBadge(permission.permissionType)}
                              </div>
                              {permission.description && (
                                <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{permission.description}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-gray-500 py-12">No permissions found matching query</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CRUD Modals */}
      <AddEditRoleModal
        isOpen={isRoleModalOpen}
        onClose={handleCloseRoleModal}
        onSubmit={handleSubmitRole}
        initialData={selectedRole}
      />

      <AddEditPermissionModal
        isOpen={isPermissionModalOpen}
        onClose={handleClosePermissionModal}
        onSubmit={() => fetchPermissions()}
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
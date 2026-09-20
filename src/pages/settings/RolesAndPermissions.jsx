import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAppContext } from '../../AppContext';
import CustomButton from '../../component/reusable/CustomButton';
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
  LEAD_FIELD: { label: 'Lead Fields', icon: '🎯' },
  GENERAL_SYSTEM: { label: 'System Permissions', icon: '⚙️' },
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
  const [roleSearchQuery, setRoleSearchQuery] = useState('');
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
        showToast(`${count} unmapped permissions detected in database.`, 'warning');
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

  // Auto-select first role if none is selected
  useEffect(() => {
    if (!selectedRoleForPermissions && Array.isArray(roles) && roles.length > 0) {
      setSelectedRoleForPermissions(roles[0]);
    }
  }, [roles, selectedRoleForPermissions]);

  useEffect(() => {
    if (selectedRoleForPermissions) {
      const roleId = selectedRoleForPermissions?.id ?? selectedRoleForPermissions?._id ?? selectedRoleForPermissions?.roleId;
      fetchRolePermissions(roleId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoleForPermissions]);

  // Track unsaved modifications
  const hasUnsavedChanges = useMemo(() => {
    const savedSet = new Set((rolePermissions || []).map(p => p?.id ?? p?._id ?? p?.permissionId).filter(Boolean));
    const currentSet = new Set(selectedPermissionIds || []);
    if (savedSet.size !== currentSet.size) return true;
    for (const id of currentSet) {
      if (!savedSet.has(id)) return true;
    }
    return false;
  }, [rolePermissions, selectedPermissionIds]);

  const handleResetPermissions = () => {
    const ids = (rolePermissions || []).map(p => p?.id ?? p?._id ?? p?.permissionId).filter(Boolean);
    setSelectedPermissionIds(ids);
    showToast('Unsaved changes discarded', 'info');
  };

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
      { id: 'LEAD_FIELD', label: 'Lead Fields', icon: '🎯' },
      { id: 'GENERAL_SYSTEM', label: 'System Permissions', icon: '⚙️' },
      { id: 'SYSTEM_CONFIG', label: 'System Configuration', icon: '🔧' }
    ];
  }, [permissions]);

  // Ensure active tab stays valid
  useEffect(() => {
    if (availableGroups.length > 0 && !availableGroups.some(g => g.id === activePermissionTab)) {
      setActivePermissionTab(availableGroups[0].id);
    }
  }, [availableGroups, activePermissionTab]);

  // Tab counts for quick metrics
  const tabCounts = useMemo(() => {
    const counts = {};
    const selectedSet = new Set(selectedPermissionIds || []);
    (permissions || []).forEach(p => {
      const g = p.permissionGroup || (p.name?.startsWith('LEAD_FIELD_') ? 'LEAD_FIELD' : 'GENERAL_SYSTEM');
      if (!counts[g]) counts[g] = { total: 0, selected: 0 };
      counts[g].total += 1;
      const pid = p?.id ?? p?._id ?? p?.permissionId;
      if (selectedSet.has(pid)) {
        counts[g].selected += 1;
      }
    });
    return counts;
  }, [permissions, selectedPermissionIds]);

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

  // Permission toggles with smart paired access rules (Edit implies View)
  const handleToggleLeadFieldPermission = (permId, complementaryPermId, isEditToggle) => {
    if (!hasPermission('PERMISSION_UPDATE')) {
      showToast('You do not have permission to modify permissions', 'error');
      return;
    }
    setSelectedPermissionIds(prev => {
      const isCurrentlySelected = prev.includes(permId);
      if (isCurrentlySelected) {
        // Toggling OFF
        // If turning off View, also revoke Edit
        if (!isEditToggle && complementaryPermId) {
          return prev.filter(id => id !== permId && id !== complementaryPermId);
        }
        return prev.filter(id => id !== permId);
      } else {
        // Toggling ON
        // If turning on Edit, also auto-grant View
        if (isEditToggle && complementaryPermId) {
          return Array.from(new Set([...prev, permId, complementaryPermId]));
        }
        return [...prev, permId];
      }
    });
  };

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

  const handleSelectAllLeadFieldEdits = () => {
    if (!hasPermission('PERMISSION_UPDATE')) {
      showToast('You do not have permission to modify permissions', 'error');
      return;
    }
    // Granting all edits also grants all views
    const allLeadFieldIds = (permissions || [])
      .filter(p => p.permissionGroup === 'LEAD_FIELD' || p.name?.startsWith('LEAD_FIELD_'))
      .map(p => p.id ?? p._id ?? p.permissionId)
      .filter(Boolean);
    setSelectedPermissionIds(prev => Array.from(new Set([...prev, ...allLeadFieldIds])));
  };

  const handleClearAllLeadFields = () => {
    if (!hasPermission('PERMISSION_UPDATE')) {
      showToast('You do not have permission to modify permissions', 'error');
      return;
    }
    const leadFieldIds = new Set(
      (permissions || [])
        .filter(p => p.permissionGroup === 'LEAD_FIELD' || p.name?.startsWith('LEAD_FIELD_'))
        .map(p => p.id ?? p._id ?? p.permissionId)
        .filter(Boolean)
    );
    setSelectedPermissionIds(prev => prev.filter(id => !leadFieldIds.has(id)));
  };

  const handleCategoryLeadFieldToggle = (categoryFields, type, enable) => {
    if (!hasPermission('PERMISSION_UPDATE')) {
      showToast('You do not have permission to modify permissions', 'error');
      return;
    }
    const targetIds = new Set();
    categoryFields.forEach(f => {
      const vp = f.viewPermission ? (f.viewPermission.id ?? f.viewPermission._id ?? f.viewPermission.permissionId) : null;
      const ep = f.editPermission ? (f.editPermission.id ?? f.editPermission._id ?? f.editPermission.permissionId) : null;

      if (type === 'view') {
        if (vp) targetIds.add(vp);
        // If revoking view, also revoke edit
        if (!enable && ep) targetIds.add(ep);
      } else if (type === 'edit') {
        if (ep) targetIds.add(ep);
        // If enabling edit, also grant view
        if (enable && vp) targetIds.add(vp);
      } else if (type === 'both') {
        if (vp) targetIds.add(vp);
        if (ep) targetIds.add(ep);
      }
    });

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
      showToast('Permissions updated and saved successfully!', 'success');
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

  // Operation badge renderer with refined micro-tags
  const renderOperationBadge = (opType) => {
    switch (opType) {
      case 'VIEW':
        return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/80">VIEW</span>;
      case 'CREATE':
        return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80">CREATE</span>;
      case 'EDIT':
      case 'UPDATE':
        return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/80">UPDATE</span>;
      case 'DELETE':
        return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200/80">DELETE</span>;
      case 'ASSIGN':
        return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/80">ASSIGN</span>;
      case 'EXECUTE':
        return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/80">EXECUTE</span>;
      case 'UPLOAD':
        return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200/80">UPLOAD</span>;
      case 'EXPORT':
        return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200/80">EXPORT</span>;
      case 'MANAGE':
        return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200/80">MANAGE</span>;
      default:
        return opType ? (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">{opType}</span>
        ) : null;
    }
  };

  const filteredRoles = useMemo(() => {
    if (!roleSearchQuery.trim()) return roles || [];
    const q = roleSearchQuery.toLowerCase();
    return (roles || []).filter(r => 
      (r.name && r.name.toLowerCase().includes(q)) || 
      (r.description && r.description.toLowerCase().includes(q))
    );
  }, [roles, roleSearchQuery]);

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[720px] max-h-[85vh]">
      {/* 1. Header Toolbar */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-gray-900 tracking-tight">Roles & Permissions</h2>
              <button
                type="button"
                onClick={checkMetadataIntegrity}
                disabled={isValidatingMetadata}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
                title="Click to check dynamic permission metadata status"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {isValidatingMetadata ? 'Checking...' : unmappedStatus === 0 ? 'Metadata Synced' : unmappedStatus > 0 ? `${unmappedStatus} Unmapped` : 'Verify Mapping'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Configure role-based access control, security policies, and field-level visibility</p>
          </div>
        </div>

        {/* Global Save / Discard Actions */}
        {selectedRoleForPermissions && hasPermission('PERMISSION_UPDATE') && (
          <div className="flex items-center gap-2.5">
            {hasUnsavedChanges && (
              <>
                <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 font-medium animate-fadeIn">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  Unsaved changes
                </span>
                <button
                  type="button"
                  onClick={handleResetPermissions}
                  className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 font-medium transition-colors"
                >
                  Discard
                </button>
              </>
            )}
            <CustomButton
              variant="primary"
              onClick={handleSaveRolePermissions}
              disabled={isSavingPermissions || !hasUnsavedChanges}
              className={`text-xs py-1.5 px-4 font-semibold shadow-xs transition-all ${
                hasUnsavedChanges
                  ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-500/20'
                  : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
              }`}
            >
              {isSavingPermissions ? 'Saving Changes...' : 'Save Permissions'}
            </CustomButton>
          </div>
        )}
      </div>

      {/* 2. Main Master-Detail View */}
      <div className="flex flex-1 overflow-hidden">
        {/* ==============================================================
            LEFT PANEL: Roles Sidebar
            ============================================================== */}
        <div className="w-80 border-r border-gray-100 flex flex-col bg-slate-50/40 flex-shrink-0">
          {/* Roles Header */}
          <div className="p-3.5 border-b border-gray-100 flex items-center justify-between gap-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Roles</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                {roles.length}
              </span>
            </div>
            {hasPermission('ROLE_CREATE') && (
              <button
                type="button"
                onClick={handleOpenAddRoleModal}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 shadow-2xs transition-all"
              >
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Add Role
              </button>
            )}
          </div>

          {/* Quick Search Roles */}
          {roles.length > 4 && (
            <div className="px-3 pt-2 pb-1 flex-shrink-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter roles..."
                  value={roleSearchQuery}
                  onChange={(e) => setRoleSearchQuery(e.target.value)}
                  className="w-full text-xs pl-7 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder:text-gray-400"
                />
                <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          )}

          {/* Role Items List */}
          {loadingRoles ? (
            <div className="p-8 text-center text-xs text-gray-400 flex flex-col items-center justify-center">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              Loading roles...
            </div>
          ) : (
            <div className="p-2.5 overflow-y-auto flex-1 space-y-1">
              {filteredRoles.length > 0 ? (
                filteredRoles.map((role) => {
                  const roleId = role?.id ?? role?._id ?? role?.roleId;
                  const isSelected = selectedRoleForPermissions?.id === roleId ||
                                   selectedRoleForPermissions?._id === roleId ||
                                   selectedRoleForPermissions?.roleId === roleId;
                  return (
                    <div
                      key={roleId}
                      onClick={() => setSelectedRoleForPermissions(role)}
                      className={`group relative p-3 rounded-xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-white border-blue-500/80 shadow-xs ring-1 ring-blue-500/20'
                          : 'bg-transparent border-transparent hover:bg-white hover:border-gray-200/80 text-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${role.active ? 'bg-emerald-500 ring-2 ring-emerald-100' : 'bg-gray-300'}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className={`font-semibold text-xs tracking-tight truncate ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
                                {role.name || 'Unnamed role'}
                              </span>
                              {isSelected && (
                                <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 text-[9px] font-bold rounded uppercase">
                                  Selected
                                </span>
                              )}
                            </div>
                            {role.description && (
                              <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{role.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons on hover */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {hasPermission('ROLE_UPDATE') && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditRoleModal(role);
                              }}
                              className="p-1 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit Role"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                          {hasPermission('ROLE_DELETE') && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDeleteRoleModal(role);
                              }}
                              className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Role"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-xs text-gray-400 py-8">No roles match your search</div>
              )}
            </div>
          )}
        </div>

        {/* ==============================================================
            RIGHT PANEL: Permissions Matrix
            ============================================================== */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {!selectedRoleForPermissions ? (
            <div className="py-24 text-center text-sm text-gray-400 flex flex-col items-center justify-center h-full">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mb-3">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="font-semibold text-gray-700 text-sm">No Role Selected</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">Select a role from the left sidebar to configure its permissions and access rules.</p>
            </div>
          ) : (
            <>
              {/* Role Context Bar & Segment Tabs */}
              <div className="px-6 py-3 border-b border-gray-100 bg-white flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
                {/* Dynamic Group Tabs with live counts */}
                <div className="flex items-center bg-gray-100/80 p-1 rounded-xl gap-1">
                  {availableGroups.map(grp => {
                    const stats = tabCounts[grp.id];
                    const isTabActive = activePermissionTab === grp.id;
                    return (
                      <button
                        key={grp.id}
                        type="button"
                        onClick={() => setActivePermissionTab(grp.id)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                          isTabActive
                            ? 'bg-white text-blue-700 shadow-xs ring-1 ring-black/5'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                        }`}
                      >
                        <span>{grp.icon}</span>
                        <span>{grp.label}</span>
                        {stats && stats.total > 0 && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isTabActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {stats.selected} / {stats.total}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Search Bar & Global Quick Toggles */}
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search permissions..."
                      value={permissionSearchQuery}
                      onChange={(e) => setPermissionSearchQuery(e.target.value)}
                      className="text-xs pl-8 pr-7 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-52 placeholder:text-gray-400"
                    />
                    <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {permissionSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setPermissionSearchQuery('')}
                        className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600 text-xs w-4 h-4 rounded-full flex items-center justify-center hover:bg-gray-200"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Lead field global batch shortcuts */}
                  {activePermissionTab === 'LEAD_FIELD' && (
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-0.5 text-xs">
                      <button
                        type="button"
                        onClick={handleSelectAllLeadFieldViews}
                        className="px-2 py-1 rounded text-[11px] font-medium text-emerald-700 hover:bg-white transition-colors"
                        title="Grant View access to all lead fields"
                      >
                        All View
                      </button>
                      <span className="text-gray-200">|</span>
                      <button
                        type="button"
                        onClick={handleSelectAllLeadFieldEdits}
                        className="px-2 py-1 rounded text-[11px] font-medium text-blue-700 hover:bg-white transition-colors"
                        title="Grant Edit access to all lead fields"
                      >
                        All Edit
                      </button>
                      <span className="text-gray-200">|</span>
                      <button
                        type="button"
                        onClick={handleClearAllLeadFields}
                        className="px-2 py-1 rounded text-[11px] font-medium text-gray-500 hover:bg-white hover:text-red-600 transition-colors"
                        title="Revoke all lead field access"
                      >
                        Reset
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Body Content */}
              {loadingPermissions || loadingRolePermissions ? (
                <div className="py-24 text-center text-xs text-gray-400 flex flex-col items-center justify-center">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  Loading permissions for {selectedRoleForPermissions.name}...
                </div>
              ) : activePermissionTab === 'LEAD_FIELD' ? (
                /* ==============================================================
                   TAB: LEAD FIELD PERMISSIONS (Grouped by Backend fieldGroup)
                   ============================================================== */
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                  {Object.keys(leadFieldsByGroup).length > 0 ? (
                    Object.entries(leadFieldsByGroup).map(([groupName, fields]) => (
                      <div key={groupName} className="border border-gray-200/90 rounded-xl overflow-hidden shadow-2xs bg-white">
                        {/* Category Header with Clean Inline Actions */}
                        <div className="px-4 py-2.5 bg-slate-50/70 border-b border-gray-100 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-800 tracking-tight">{groupName}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.2 bg-gray-200/80 text-gray-600 rounded-full">
                              {fields.length} {fields.length === 1 ? 'field' : 'fields'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px]">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleCategoryLeadFieldToggle(fields, 'view', true);
                              }}
                              className="font-medium text-emerald-700 hover:text-emerald-800 hover:underline px-1 py-0.5 rounded transition-colors"
                            >
                              View All
                            </button>
                            <span className="text-gray-300">·</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleCategoryLeadFieldToggle(fields, 'edit', true);
                              }}
                              className="font-medium text-blue-700 hover:text-blue-800 hover:underline px-1 py-0.5 rounded transition-colors"
                            >
                              Edit All
                            </button>
                            <span className="text-gray-300">·</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleCategoryLeadFieldToggle(fields, 'both', false);
                              }}
                              className="font-medium text-gray-500 hover:text-red-600 hover:underline px-1 py-0.5 rounded transition-colors"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        {/* Category Fields Table */}
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-white text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                              <th className="py-2 px-4 font-semibold">Field</th>
                              <th className="py-2 px-4 text-center w-28 font-semibold">View Access</th>
                              <th className="py-2 px-4 text-center w-28 font-semibold">Edit Access</th>
                              <th className="py-2 px-4 text-right w-36 font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {fields.map((field) => {
                              const readPermId = field.viewPermission ? (field.viewPermission.id ?? field.viewPermission._id ?? field.viewPermission.permissionId) : null;
                              const writePermId = field.editPermission ? (field.editPermission.id ?? field.editPermission._id ?? field.editPermission.permissionId) : null;

                              const isViewAllowed = readPermId && selectedPermissionIds.includes(readPermId);
                              const isEditAllowed = writePermId && selectedPermissionIds.includes(writePermId);

                              return (
                                <tr key={field.fieldKey} className="hover:bg-slate-50/60 transition-colors">
                                  <td className="py-2.5 px-4">
                                    <span className="font-medium text-gray-900 text-xs">{field.fieldLabel}</span>
                                    <span className="text-[10px] text-gray-400 font-mono ml-2">({field.fieldKey})</span>
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
                                          handleToggleLeadFieldPermission(readPermId, writePermId, false);
                                        }}
                                        disabled={!hasPermission('PERMISSION_UPDATE')}
                                        className={`w-8 h-4 rounded-full transition-colors relative inline-flex items-center cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                                          isViewAllowed ? 'bg-emerald-500' : 'bg-gray-200'
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
                                      <span className="text-[10px] text-gray-300 italic">None</span>
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
                                          handleToggleLeadFieldPermission(writePermId, readPermId, true);
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
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-50 text-gray-400 border border-gray-200/80">
                                        Hidden
                                      </span>
                                    ) : isEditAllowed ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                                        ● View & Edit
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                                        ● Read Only
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-xs text-gray-400 py-16">
                      No lead fields found matching &quot;{permissionSearchQuery}&quot;
                    </div>
                  )}
                </div>
              ) : (
                /* ==============================================================
                   TAB: GENERAL SYSTEM / CONFIG PERMISSIONS (Grouped by Backend Entity)
                   ============================================================== */
                <div className="p-6 overflow-y-auto flex-1 space-y-5">
                  {Object.keys(permissionsByEntity).length > 0 ? (
                    Object.entries(permissionsByEntity).map(([entityName, entityPerms]) => (
                      <div key={entityName} className="border border-gray-200/90 rounded-xl overflow-hidden shadow-2xs bg-white">
                        {/* Entity Header */}
                        <div className="px-4 py-2.5 bg-slate-50/70 border-b border-gray-100 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-800 tracking-tight">
                              {formatEntityName(entityName)}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.2 bg-gray-200/80 text-gray-600 rounded-full">
                              {entityPerms.length}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px]">
                            <button
                              type="button"
                              onClick={() => handleEntityToggleAll(entityPerms, true)}
                              className="font-medium text-blue-600 hover:text-blue-800 hover:underline px-1 py-0.5 transition-colors"
                            >
                              Select All
                            </button>
                            <span className="text-gray-300">·</span>
                            <button
                              type="button"
                              onClick={() => handleEntityToggleAll(entityPerms, false)}
                              className="font-medium text-gray-500 hover:text-gray-700 hover:underline px-1 py-0.5 transition-colors"
                            >
                              Clear
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
                                    ? 'bg-blue-50/60 border-blue-300 text-blue-900 shadow-2xs'
                                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-slate-50/50 text-gray-700'
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
                                    <span className="font-semibold text-xs truncate">
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
                    <div className="text-center text-xs text-gray-400 py-16">
                      No permissions found matching &quot;{permissionSearchQuery}&quot;
                    </div>
                  )}
                </div>
              )}
            </>
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
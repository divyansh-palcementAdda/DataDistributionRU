import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { usePermissions } from '../PermissionContext';
import ReusableTable from '../component/reusable/table';
import { getUserPerformance } from '../Services/Counselors/counselors';
import { getLowDataUsers, getUsersNotLoggedIn, getFollowupUsersNotLoggedIn11am } from '../Services/Dashboard/Dashboard';
import AddUserModal from '../component/reusable/user/addUser';

/* ── Sort direction toggle helper ── */
const nextDir = (cur) => (cur === 'ASC' ? 'DESC' : 'ASC');

/* ── Sort icon ── */
const SortIcon = ({ active, direction }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? 'var(--primary, #2563EB)' : 'var(--gray-400, #9CA3AF)'}
    strokeWidth="2.5"
    style={{ marginLeft: '4px', flexShrink: 0, transition: 'transform 0.2s', transform: active && direction === 'DESC' ? 'rotate(180deg)' : 'none' }}
  >
    <path d="M12 5l7 7H5z" fill={active ? 'var(--primary, #2563EB)' : 'var(--gray-400, #9CA3AF)'} stroke="none" />
  </svg>
);

const Counselors = () => {
  const { showToast } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission, canCreate, canRead } = usePermissions();

  // Special modes — navigated from dashboard cards
  const lowDataMode = location.state?.lowDataMode === true;
  const usersNotLoggedInMode = location.state?.usersNotLoggedInMode === true;
  const followupNotLoggedIn11amMode = location.state?.followupNotLoggedIn11amMode === true;

  /* ── API state ── */
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  /* ── Pagination ── */
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  /* ── Sort ── */
  const [sortBy, setSortBy] = useState('userName');
  const [sortDirection, setSortDirection] = useState('ASC');

  /* ── Search (debounced) ── */
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const debounceRef = useRef(null);

  /* ── Additional Filters ── */
  const [statusFilter, setStatusFilter] = useState('');
  const [workingFilter, setWorkingFilter] = useState('');

  /* ── Modal state ── */
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(val);
      setPage(0);
    }, 300);
  };

  /* ── Fetch ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (lowDataMode) {
        const res = await getLowDataUsers({ page, size, sortBy, sortDirection, search });
        const payload = res?.data || {};
        const content = Array.isArray(payload.content) ? payload.content : [];
        setData(content);
        setTotalElements(payload.totalElements ?? content.length ?? 0);
        setTotalPages(payload.totalPages ?? 0);
      } else if (usersNotLoggedInMode) {
        const res = await getUsersNotLoggedIn({ page, size, sortBy, sortDirection, search });
        const payload = res?.data || {};
        const content = Array.isArray(payload.content) ? payload.content : [];
        setData(content);
        setTotalElements(payload.totalElements ?? content.length ?? 0);
        setTotalPages(payload.totalPages ?? 0);
      } else if (followupNotLoggedIn11amMode) {
        const res = await getFollowupUsersNotLoggedIn11am({ page, size, sortBy, sortDirection, search });
        const payload = res?.data || {};
        const content = Array.isArray(payload.content) ? payload.content : [];
        setData(content);
        setTotalElements(payload.totalElements ?? content.length ?? 0);
        setTotalPages(payload.totalPages ?? 0);
      } else {
        const res = await getUserPerformance({
          page,
          size,
          sortBy,
          sortDirection,
          search,
          status: statusFilter,
          currentlyWorking: workingFilter !== '' ? workingFilter === 'true' : undefined,
        });
        const payload = res?.data?.data || res?.data || {};
        const content = Array.isArray(payload.content) ? payload.content : (Array.isArray(payload) ? payload : []);
        setData(content);
        setTotalElements(payload.totalElements ?? content.length ?? 0);
        setTotalPages(payload.totalPages ?? 0);
      }
    } catch (err) {
      showToast('Error fetching user performance data', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, size, sortBy, sortDirection, search, statusFilter, workingFilter, showToast, lowDataMode, usersNotLoggedInMode, followupNotLoggedIn11amMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Handlers ── */
  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDirection(nextDir(sortDirection));
    } else {
      setSortBy(col);
      setSortDirection('ASC');
    }
    setPage(0);
  };

  const handleOpenAddUserModal = () => setIsAddUserModalOpen(true);
  const handleCloseAddUserModal = () => setIsAddUserModalOpen(false);
  const handleUserAdded = () => fetchData();

  /* ── Column header renderer ── */
  const SortHeader = ({ col, label }) => (
    <div
      onClick={() => handleSort(col)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        color: sortBy === col ? 'var(--primary, #2563EB)' : 'inherit',
      }}
    >
      {label}
      <SortIcon active={sortBy === col} direction={sortDirection} />
    </div>
  );

  /* ── Helpers ── */
  const getColor = (str) => {
    const colors = ['#7C3AED', '#0891B2', '#16A34A', '#EA580C', '#DB2777', '#0369A1', '#2563EB'];
    let hash = 0;
    for (let i = 0; i < (str || '').length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  /* ── Shared badge styles ── */
  const badge = (bg, color) => ({
    padding: '2px 8px', borderRadius: '12px',
    fontSize: '11px', fontWeight: 600, background: bg, color,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
  });

  /* ── Table columns ── */
  let columns;

  if (lowDataMode) {
    columns = [
      {
        key: 'sno',
        header: 'S.No',
        render: (_, __, index) => (
          <span className="text-gray-600 text-sm font-medium">{index + 1 + page * size}</span>
        ),
      },
      {
        key: 'user',
        header: 'Counselor Name',
        render: (_, row) => {
          const name = row.name || row.username || 'Unknown User';
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: getColor(name) }}>
                {name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{name}</div>
                <div className="text-xs text-gray-400">{row.email || '—'}</div>
              </div>
            </div>
          );
        },
      },
      {
        key: 'roleNames',
        header: 'Role',
        render: (_, row) => (
          <span className="text-gray-600 text-sm">
            {Array.isArray(row.roleNames) ? row.roleNames.join(', ') : row.roleNames || '—'}
          </span>
        ),
      },
      {
        key: 'departmentNames',
        header: 'Department',
        render: (_, row) => (
          <span className="text-gray-600 text-sm">
            {Array.isArray(row.departmentNames) ? row.departmentNames.join(', ') : row.departmentNames || '—'}
          </span>
        ),
      },
      {
        key: 'allottedDataCount',
        header: 'Allotted',
        render: (_, row) => <span style={badge('#dbeafe', '#1d4ed8')}>{row.allottedDataCount ?? '—'}</span>,
      },
      {
        key: 'availedDataCount',
        header: 'Availed',
        render: (_, row) => <span style={badge('#dcfce7', '#15803d')}>{row.availedDataCount ?? '—'}</span>,
      },
      {
        key: 'remainingDataCount',
        header: 'Remaining',
        render: (_, row) => <span style={badge('#fef3c7', '#b45309')}>{row.remainingDataCount ?? '—'}</span>,
      },
      {
        key: 'lowDataUser',
        header: 'Low Data',
        render: (_, row) => (
          <span style={badge(row.lowDataUser ? '#fee2e2' : '#dcfce7', row.lowDataUser ? '#b91c1c' : '#15803d')}>
            {row.lowDataUser ? 'Yes' : 'No'}
          </span>
        ),
      },
    ];
  } else if (usersNotLoggedInMode) {
    columns = [
      {
        key: 'sno',
        header: 'S.No',
        render: (_, __, index) => (
          <span className="text-gray-600 text-sm font-medium">{index + 1 + page * size}</span>
        ),
      },
      {
        key: 'user',
        header: 'User Name',
        render: (_, row) => {
          const name = row.name || row.username || 'Unknown User';
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: getColor(name) }}>
                {name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{name}</div>
                <div className="text-xs text-gray-400">{row.email || '—'}</div>
              </div>
            </div>
          );
        },
      },
      {
        key: 'username',
        header: 'Username',
        render: (_, row) => <span className="text-gray-600 text-sm">{row.username || '—'}</span>,
      },
      {
        key: 'roleNames',
        header: 'Role',
        render: (_, row) => (
          <span className="text-gray-600 text-sm">
            {Array.isArray(row.roleNames) ? row.roleNames.join(', ') : row.roleNames || '—'}
          </span>
        ),
      },
      {
        key: 'departmentNames',
        header: 'Department',
        render: (_, row) => (
          <span className="text-gray-600 text-sm">
            {Array.isArray(row.departmentNames) ? row.departmentNames.join(', ') : row.departmentNames || '—'}
          </span>
        ),
      },
      {
        key: 'allottedDataCount',
        header: 'Allotted',
        render: (_, row) => <span style={badge('#dbeafe', '#1d4ed8')}>{row.allottedDataCount ?? '—'}</span>,
      },
      {
        key: 'availedDataCount',
        header: 'Availed',
        render: (_, row) => <span style={badge('#dcfce7', '#15803d')}>{row.availedDataCount ?? '—'}</span>,
      },
      {
        key: 'remainingDataCount',
        header: 'Remaining',
        render: (_, row) => <span style={badge('#fef3c7', '#b45309')}>{row.remainingDataCount ?? '—'}</span>,
      },
      {
        key: 'loggedInToday',
        header: 'Logged In Today',
        render: () => <span style={badge('#fee2e2', '#b91c1c')}>No</span>,
      },
    ];
  } else if (followupNotLoggedIn11amMode) {
    columns = [
      {
        key: 'sno',
        header: 'S.No',
        render: (_, __, index) => (
          <span className="text-gray-600 text-sm font-medium">{index + 1 + page * size}</span>
        ),
      },
      {
        key: 'user',
        header: 'User Name',
        render: (_, row) => {
          const name = row.name || row.username || 'Unknown User';
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: getColor(name) }}>
                {name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{name}</div>
                <div className="text-xs text-gray-400">{row.email || '—'}</div>
              </div>
            </div>
          );
        },
      },
      {
        key: 'username',
        header: 'Username',
        render: (_, row) => <span className="text-gray-600 text-sm">{row.username || '—'}</span>,
      },
      {
        key: 'roleNames',
        header: 'Role',
        render: (_, row) => (
          <span className="text-gray-600 text-sm">
            {Array.isArray(row.roleNames) ? row.roleNames.join(', ') : row.roleNames || '—'}
          </span>
        ),
      },
      {
        key: 'departmentNames',
        header: 'Department',
        render: (_, row) => (
          <span className="text-gray-600 text-sm">
            {Array.isArray(row.departmentNames) ? row.departmentNames.join(', ') : row.departmentNames || '—'}
          </span>
        ),
      },
      {
        key: 'allottedDataCount',
        header: 'Allotted',
        render: (_, row) => <span style={badge('#dbeafe', '#1d4ed8')}>{row.allottedDataCount ?? '—'}</span>,
      },
      {
        key: 'availedDataCount',
        header: 'Availed',
        render: (_, row) => <span style={badge('#dcfce7', '#15803d')}>{row.availedDataCount ?? '—'}</span>,
      },
      {
        key: 'remainingDataCount',
        header: 'Remaining',
        render: (_, row) => <span style={badge('#fef3c7', '#b45309')}>{row.remainingDataCount ?? '—'}</span>,
      },
      {
        key: 'loggedIn11am',
        header: 'Logged In by 11 AM',
        render: () => <span style={badge('#fee2e2', '#b91c1c')}>No</span>,
      },
    ];
  } else {
    // Consolidated User Performance & Operational Analytics View
    columns = [
      {
        key: 'sno',
        header: 'S.No',
        render: (_, __, index) => (
          <span className="text-gray-600 text-sm font-medium">{index + 1 + page * size}</span>
        ),
      },
      {
        key: 'user',
        header: <SortHeader col="userName" label="User" />,
        render: (_, row) => {
          const name = row.userName || row.name || row.username || 'Unknown User';
          const color = getColor(name);
          const initials = getInitials(name);
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                style={{ backgroundColor: color }}>
                {initials}
              </div>
              <div style={{ minWidth: '120px' }}>
                <div className="font-semibold text-gray-900 text-sm">{name}</div>
                <div className="text-xs text-gray-400">{row.email || '—'}</div>
              </div>
            </div>
          );
        },
      },
      {
        key: 'role',
        header: <SortHeader col="role" label="Role" />,
        render: (_, row) => (
          <span className="text-gray-700 text-xs font-medium">
            {Array.isArray(row.roles) ? row.roles.join(', ') : (row.role || '—')}
          </span>
        ),
      },
      {
        key: 'department',
        header: <SortHeader col="department" label="Department" />,
        render: (_, row) => (
          <span className="text-gray-700 text-xs">
            {row.department || '—'}
          </span>
        ),
      },
      {
        key: 'totalAllottedData',
        header: <SortHeader col="totalAllottedData" label="Total Allotted" />,
        render: (val) => <span style={badge('#dbeafe', '#1d4ed8')}>{val ?? 0}</span>,
      },
      {
        key: 'totalAvailedData',
        header: <SortHeader col="totalAvailedData" label="Total Availed" />,
        render: (val) => <span style={badge('#dcfce7', '#15803d')}>{val ?? 0}</span>,
      },
      {
        key: 'rawDataCount',
        header: <SortHeader col="rawDataCount" label="RAW" />,
        render: (val) => <span style={badge('#f3e8ff', '#7e22ce')}>{val ?? 0}</span>,
      },
      {
        key: 'registeredDataCount',
        header: <SortHeader col="registeredDataCount" label="Registered" />,
        render: (val) => <span style={badge('#ccfbf1', '#0f766e')}>{val ?? 0}</span>,
      },
      {
        key: 'todayFollowupsCount',
        header: <SortHeader col="todayFollowupsCount" label="Today's Followups" />,
        render: (val) => <span style={badge('#fef3c7', '#b45309')}>{val ?? 0}</span>,
      },
      {
        key: 'todayFollowupsScheduled',
        header: <SortHeader col="todayFollowupsScheduled" label="Scheduled" />,
        render: (val) => <span className="text-xs font-semibold text-gray-700">{val ?? 0}</span>,
      },
      {
        key: 'todayMissedFollowups',
        header: <SortHeader col="todayMissedFollowups" label="Missed" />,
        render: (val) => (
          <span style={badge(val > 0 ? '#fee2e2' : '#f3f4f6', val > 0 ? '#b91c1c' : '#6b7280')}>
            {val ?? 0}
          </span>
        ),
      },
      {
        key: 'todayUpcomingFollowups',
        header: <SortHeader col="todayUpcomingFollowups" label="Upcoming" />,
        render: (val) => <span className="text-xs font-semibold text-blue-600">{val ?? 0}</span>,
      },
      {
        key: 'todayPendingFollowups',
        header: <SortHeader col="todayPendingFollowups" label="Pending" />,
        render: (val) => <span className="text-xs font-semibold text-amber-600">{val ?? 0}</span>,
      },
      {
        key: 'todayConnectedCalls',
        header: <SortHeader col="todayConnectedCalls" label="Connected Calls" />,
        render: (val) => <span style={badge('#e0e7ff', '#4338ca')}>{val ?? 0}</span>,
      },
      {
        key: 'todayLoginCount',
        header: <SortHeader col="todayLoginCount" label="Login Count" />,
        render: (val) => <span className="text-xs font-medium text-gray-800">{val ?? 0}</span>,
      },
      {
        key: 'todayLogoutCount',
        header: <SortHeader col="todayLogoutCount" label="Logout Count" />,
        render: (val) => <span className="text-xs font-medium text-gray-500">{val ?? 0}</span>,
      },
      {
        key: 'todayWorkingHours',
        header: <SortHeader col="todayWorkingHours" label="Working Hours" />,
        render: (val) => <span style={badge('#f1f5f9', '#334155')}>{val ? `${val}h` : '0h'}</span>,
      },
      {
        key: 'currentlyWorking',
        header: <SortHeader col="currentlyWorking" label="Currently Working" />,
        render: (val) => (
          <span style={badge(val ? '#dcfce7' : '#f3f4f6', val ? '#15803d' : '#6b7280')}>
            {val ? '● Working' : '○ Offline'}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (_, row) => (
          <button
            className="btn btn-sm"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '11px', padding: '4px 8px',
              border: '1px solid var(--primary, #2563EB)',
              color: 'var(--primary, #2563EB)',
              background: 'transparent', borderRadius: '6px', cursor: 'pointer',
            }}
            onClick={() => navigate(`/counselor-details/${row.userId || row.id}`)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            View
          </button>
        ),
      },
    ];
  }

  /* ── Page title helper ── */
  const pageTitle = lowDataMode
    ? 'Low Data Users'
    : usersNotLoggedInMode
      ? 'Users Not Logged In Today'
      : followupNotLoggedIn11amMode
        ? 'Follow-up Users Not Logged In by 11 AM'
        : 'Counselors & Operational Performance';

  const alertBadge = lowDataMode
    ? { bg: '#fef3c7', color: '#b45309', border: '#fde68a' }
    : usersNotLoggedInMode
      ? { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' }
      : followupNotLoggedIn11amMode
        ? { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' }
        : null;

  const emptyMessage = search
    ? `No ${lowDataMode ? 'low data users' : usersNotLoggedInMode ? 'users' : followupNotLoggedIn11amMode ? 'users' : 'counselors'} match "${search}".`
    : lowDataMode
      ? 'No low data users found.'
      : usersNotLoggedInMode
        ? 'No users found.'
        : followupNotLoggedIn11amMode
          ? 'No users found.'
          : 'No operational users found.';

  return (
    <div id="page-counselors">
      {/* ── Page Header ── */}
      <div
        className="page-header"
        style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', marginBottom: '20px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {pageTitle}
            {alertBadge && (
              <span style={{
                fontSize: '12px', fontWeight: 600,
                background: alertBadge.bg, color: alertBadge.color,
                padding: '2px 10px', borderRadius: '20px',
                border: `1px solid ${alertBadge.border}`,
              }}>
                Alert View
              </span>
            )}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '4px' }}>
            {(lowDataMode || usersNotLoggedInMode || followupNotLoggedIn11amMode) ? (
              <button
                onClick={() => {
                  // Check if user came from dashboard
                  if (location.state?.fromDashboard) {
                    // Get user role to determine which dashboard to navigate to
                    const userRole = localStorage.getItem('userRole');
                    if (userRole === 'HOD') {
                      navigate('/head-dashboard');
                    } else if (userRole === 'ADMIN') {
                      navigate('/admin-dashboard');
                    } else {
                      navigate('/dashboard');
                    }
                  } else {
                    // Otherwise use browser history
                    navigate(-1);
                  }
                }}
                style={{ background: 'none', border: 'none', color: 'var(--primary, #2563EB)', cursor: 'pointer', fontSize: '13px', padding: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                Back
              </button>
            ) : (
              'Monitor team productivity, working hours, lead conversions, and daily operational metrics'
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {hasPermission('USER_CREATE') && (
            <button
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={handleOpenAddUserModal}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Counselor
            </button>
          )}
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div
        className="filter-bar"
        style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}
      >
        <div style={{ position: 'relative' }}>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="var(--gray-400)" strokeWidth="2"
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, email…"
            style={{ maxWidth: '240px', paddingLeft: '32px' }}
            value={searchInput}
            onChange={handleSearchInput}
          />
        </div>

        {!lowDataMode && !usersNotLoggedInMode && !followupNotLoggedIn11amMode && (
          <>
            <select
              className="form-control"
              style={{ maxWidth: '160px', fontSize: '13px' }}
              value={workingFilter}
              onChange={(e) => { setWorkingFilter(e.target.value); setPage(0); }}
            >
              <option value="">Working State: All</option>
              <option value="true">● Currently Working</option>
              <option value="false">○ Offline</option>
            </select>

            <select
              className="form-control"
              style={{ maxWidth: '140px', fontSize: '13px' }}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            >
              <option value="">Status: All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </>
        )}
      </div>

      {/* ── Table Card ── */}
      <div className="card" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--gray-400)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 12px' }}>
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            Loading operational performance metrics…
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <ReusableTable
            columns={columns}
            data={data}
            emptyMessage={emptyMessage}
            isServerSide={true}
            totalElements={totalElements}
            totalPages={totalPages}
            currentPage={page + 1}
            rowsPerPage={size}
            onPageChange={(newPage) => setPage(newPage - 1)}
            onRowsPerPageChange={(newSize) => { setSize(newSize); setPage(0); }}
          />
        )}
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={handleCloseAddUserModal}
        onSuccess={handleUserAdded}
        defaultRole="COUNSELOR"
      />
    </div>
  );
};

export default Counselors;

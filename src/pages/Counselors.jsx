import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import ReusableTable from '../component/reusable/table';
import { getAllCounselors } from '../Services/Counselors/counselors';
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
    stroke={active ? 'var(--primary)' : 'var(--gray-400)'}
    strokeWidth="2.5"
    style={{ marginLeft: '4px', flexShrink: 0, transition: 'transform 0.2s', transform: active && direction === 'DESC' ? 'rotate(180deg)' : 'none' }}
  >
    <path d="M12 5l7 7H5z" fill={active ? 'var(--primary)' : 'var(--gray-400)'} stroke="none" />
  </svg>
);

const SORTABLE_COLS = [
  { key: 'firstName', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' }
];

const Counselors = () => {
  const { showToast } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

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
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState('ASC');

  /* ── Search (debounced) ── */
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const debounceRef = useRef(null);

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
        const res = await getAllCounselors({
          roleName: 'COUNSELOR',
          roleNames: 'COUNSELOR',
          page,
          size,
          sortBy,
          sortDirection,
          search,
        });
        const payload = res?.data?.data || res?.data || {};
        const content = Array.isArray(payload)
          ? payload
          : payload.content || payload.users || payload.data || [];
        setData(Array.isArray(content) ? content : []);
        setTotalElements(payload.totalElements ?? content.length ?? 0);
        setTotalPages(payload.totalPages ?? 0);
      }
    } catch (err) {
      showToast('Error fetching users', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, size, sortBy, sortDirection, search, showToast, lowDataMode, usersNotLoggedInMode, followupNotLoggedIn11amMode]);

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
  const SortHeader = ({ col }) => (
    <div
      onClick={() => handleSort(col.key)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        color: sortBy === col.key ? 'var(--primary, #2563EB)' : 'inherit',
      }}
    >
      {col.label}
      <SortIcon active={sortBy === col.key} direction={sortDirection} />
    </div>
  );

  /* ── Helpers ── */
  const getColor = (str) => {
    const colors = ['#7C3AED', '#0891B2', '#16A34A', '#EA580C', '#DB2777', '#0369A1', '#2563EB'];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (first, last) => {
    if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    if (first) return first.slice(0, 2).toUpperCase();
    return 'U';
  };

  /* ── Shared badge styles ── */
  const badge = (bg, color) => ({
    padding: '2px 10px', borderRadius: '12px',
    fontSize: '12px', fontWeight: 600, background: bg, color,
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
        header: <SortHeader col={{ key: 'firstName', label: 'Counselor Name' }} />,
        render: (_, row) => {
          const name = row.name || `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'Unknown User';
          const color = getColor(name);
          const initials = getInitials(row.firstName || name, row.lastName || '');
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: color }}>
                {initials}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{name}</div>
                <div className="text-xs text-gray-400">{row.role?.name || row.role || 'Counselor'}</div>
              </div>
            </div>
          );
        },
      },
      {
        key: 'email',
        header: <SortHeader col={{ key: 'email', label: 'Email Address' }} />,
        render: (value, row) => (
          <span className="text-gray-600 text-sm">{value || row.email || '—'}</span>
        ),
      },
      {
        key: 'contact',
        header: 'Contact',
        render: (_, row) => (
          <span className="text-gray-600 text-sm">{row.mobileNo || row.phone || '—'}</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (_, row) => {
          const isActive = row.isActive !== false;
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          );
        },
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (_, row) => (
          <button
            className="btn btn-sm"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '12px', padding: '4px 10px',
              border: '1px solid var(--primary, #2563EB)',
              color: 'var(--primary, #2563EB)',
              background: 'transparent', borderRadius: '6px', cursor: 'pointer',
            }}
            onClick={() => navigate(`/counselor-details/${row.id}`)}
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
    : 'Counselors';

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
    : 'No counselors found.';

  return (
    <div>
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
          {(lowDataMode || usersNotLoggedInMode || followupNotLoggedIn11amMode) && (
            <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '4px' }}>
              <button
                onClick={() => navigate('/counselors', { replace: true, state: {} })}
                style={{ background: 'none', border: 'none', color: 'var(--primary, #2563EB)', cursor: 'pointer', fontSize: '13px', padding: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                Back to All Counselors
              </button>
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
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
        </div>
      </div>

      {/* ── Search & Sort Bar ── */}
      <div
        className="filter-bar"
        style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}
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
            placeholder="Search by name…"
            style={{ maxWidth: '240px', paddingLeft: '32px' }}
            value={searchInput}
            onChange={handleSearchInput}
          />
        </div>
        <select
          className="form-control"
          style={{ maxWidth: '150px', fontSize: '13px' }}
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
        >
          {SORTABLE_COLS.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* ── Table Card ── */}
      <div className="card">
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--gray-400)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 12px' }}>
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            Loading…
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

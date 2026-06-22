import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../AppContext';
import ReusableTable from '../component/reusable/table';
import { getAllCounselors } from '../Services/Counselors/counselors';

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
  const { openAddLeadModal, showToast } = useAppContext();

  /* ── API state ── */
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  /* ── Pagination ── */
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  /* ── Sort ── */
  const [sortBy, setSortBy] = useState('firstName');
  const [sortDirection, setSortDirection] = useState('ASC');

  /* ── Search (debounced) ── */
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const debounceRef = useRef(null);

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
      const res = await getAllCounselors({
        roleName: 'Conseller',
        roleNames: "Conseller",
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
    } catch (err) {
      showToast('Error fetching users', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, size, sortBy, sortDirection, search, showToast]);

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

  /* ── Helper to generate colors and initials ── */
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

  /* ── Table columns ── */
  const columns = [
    {
      key: 'user',
      header: <SortHeader col={{ key: 'firstName', label: 'Counselor Name' }} />,
      render: (_, row) => {
        const name = row.name || `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'Unknown User';
        const color = getColor(name);
        const initials = getInitials(row.firstName || name, row.lastName || '');
        return (
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: color }}
            >
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
    }
  ];

  return (
    <div>
      {/* ── Page Header ── */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--gray-900)' }}>
            Counselors / Users
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={openAddLeadModal}
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
        {/* Debounced search input */}
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

        {/* Sort By dropdown */}
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
            Loading counselors…
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <ReusableTable
            columns={columns}
            data={data}
            emptyMessage={
              search
                ? `No counselors match "${search}".`
                : 'No counselors found.'
            }
            isServerSide={true}
            totalElements={totalElements}
            totalPages={totalPages}
            currentPage={page + 1}
            rowsPerPage={size}
            onPageChange={(newPage) => setPage(newPage - 1)}
            onRowsPerPageChange={(newSize) => {
              setSize(newSize);
              setPage(0);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Counselors;

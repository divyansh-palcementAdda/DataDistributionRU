import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../AppContext';
import ReusableTable from '../component/reusable/table';
import { getAllCounselors } from '../Services/Counselors/counselors';
import AddCounselorModal from '../component/reusable/user/addCounselorModal';

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
    className={`ml-1 flex-shrink-0 transition-transform duration-200 ${active && direction === 'DESC' ? 'rotate-180' : ''}`}
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

  /* ── Modal state ── */
  const [isAddCounselorModalOpen, setIsAddCounselorModalOpen] = useState(false);
  const [isTempModalOpen, setIsTempModalOpen] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState(null);

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
      // Static data for counselors (4-5 users)
      const staticCounselors = [
        {
          id: 1,
          firstName: 'Rahul',
          lastName: 'Sharma',
          email: 'rahul.sharma@example.com',
          phone: '+91 98765 43210',
          mobileNo: '+91 98765 43210',
          role: { name: 'Counselor' },
          isActive: true,
          assignedCourse: 'MBA'
        },
        {
          id: 2,
          firstName: 'Priya',
          lastName: 'Patel',
          email: 'priya.patel@example.com',
          phone: '+91 98765 43211',
          mobileNo: '+91 98765 43211',
          role: { name: 'Counselor' },
          isActive: true,
          assignedCourse: 'B.Tech'
        },
        {
          id: 3,
          firstName: 'Amit',
          lastName: 'Kumar',
          email: 'amit.kumar@example.com',
          phone: '+91 98765 43212',
          mobileNo: '+91 98765 43212',
          role: { name: 'Counselor' },
          isActive: true,
          assignedCourse: ''
        },
        {
          id: 4,
          firstName: 'Sneha',
          lastName: 'Reddy',
          email: 'sneha.reddy@example.com',
          phone: '+91 98765 43213',
          mobileNo: '+91 98765 43213',
          role: { name: 'Counselor' },
          isActive: false,
          assignedCourse: 'B.Com'
        },
        {
          id: 5,
          firstName: 'Vikram',
          lastName: 'Singh',
          email: 'vikram.singh@example.com',
          phone: '+91 98765 43214',
          mobileNo: '+91 98765 43214',
          role: { name: 'Counselor' },
          isActive: true,
          assignedCourse: ''
        }
      ];

      // Apply search filter if search is provided
      let filteredData = staticCounselors;
      if (search) {
        filteredData = staticCounselors.filter(counselor => 
          counselor.firstName.toLowerCase().includes(search.toLowerCase()) ||
          counselor.lastName.toLowerCase().includes(search.toLowerCase()) ||
          counselor.email.toLowerCase().includes(search.toLowerCase())
        );
      }

      setData(filteredData);
      setTotalElements(filteredData.length);
      setTotalPages(1);
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
      className={`inline-flex items-center cursor-pointer select-none ${sortBy === col.key ? 'text-blue-600' : 'text-gray-900'}`}
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
      key: 'assigned',
      header: 'Assign',
      render: (_, row) => {
        const isAssigned = row.assignedCourse && row.assignedCourse !== '';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${isAssigned ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
            {isAssigned ? row.assignedCourse : 'Not Assigned'}
          </span>
        );
      },
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
        <div className="flex gap-2">
          <button
            className="btn btn-sm p-1.5 bg-blue-600 text-white border-none rounded cursor-pointer flex items-center justify-center hover:bg-blue-700"
            onClick={() => {
              setSelectedCounselor(row);
              setIsAddCounselorModalOpen(true);
            }}
            title="Edit Counselor"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            className="btn btn-sm px-3 py-1.5 bg-green-600 text-white border-none rounded cursor-pointer flex items-center justify-center hover:bg-green-700 text-xs font-medium"
            onClick={() => {
              setSelectedCounselor(row);
              setIsTempModalOpen(true);
            }}
            title="Temp Assign"
          >
            Temp
          </button>
        </div>
      ),
    }
  ];

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Counselors
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-primary btn-sm flex items-center gap-1.5"
            onClick={() => setIsAddCounselorModalOpen(true)}
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
      <div className="filter-bar flex gap-2 flex-wrap mb-4 items-center">
        {/* Debounced search input */}
        <div className="relative">
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="var(--gray-400)" strokeWidth="2"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="form-control pl-8 max-w-[240px]"
            placeholder="Search by name…"
            value={searchInput}
            onChange={handleSearchInput}
          />
        </div>

        {/* Sort By dropdown */}
        <select
          className="form-control max-w-[150px] text-xs"
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
          <div className="py-12 text-center text-gray-400">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="block mx-auto mb-3 animate-spin">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            Loading counselors…
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

      {/* Add Counselor Modal */}
      <AddCounselorModal
        isOpen={isAddCounselorModalOpen}
        onClose={() => {
          setIsAddCounselorModalOpen(false);
          setSelectedCounselor(null);
        }}
        onSuccess={() => fetchData()}
        counselorData={selectedCounselor}
      />

      {/* Temp Assignment Modal */}
      {isTempModalOpen && selectedCounselor && (
        <div className="modal-overlay open">
          <div className="modal max-w-[500px]">
            <div className="modal-header border-b border-gray-100 pb-3 mb-4">
              <h2 className="text-xl font-bold text-gray-800">Temp Assignment</h2>
              <button
                className="btn-icon bg-transparent border-none cursor-pointer"
                onClick={() => {
                  setIsTempModalOpen(false);
                  setSelectedCounselor(null);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="mb-4">
                <p className="text-gray-500 text-sm">
                  Temporarily assign for <strong>{selectedCounselor.firstName} {selectedCounselor.lastName}</strong>
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  From
                </label>
                <input
                  type="text"
                  className="form-control w-full p-2 border border-gray-300 rounded bg-gray-50"
                  value={`${selectedCounselor.firstName} ${selectedCounselor.lastName}`}
                  readOnly
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assign
                </label>
                <select
                  className="form-control w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">Select counselor to assign...</option>
                  <option value="2">Priya Patel</option>
                  <option value="3">Amit Kumar</option>
                  <option value="4">Sneha Reddy</option>
                  <option value="5">Vikram Singh</option>
                </select>
              </div>
            </div>
            <div className="modal-footer pt-4 mt-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                className="btn btn-secondary px-4 py-2 border border-gray-300 rounded cursor-pointer"
                onClick={() => {
                  setIsTempModalOpen(false);
                  setSelectedCounselor(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary px-4 py-2 bg-blue-600 text-white border-none rounded cursor-pointer hover:bg-blue-700"
                onClick={() => {
                  showToast('Temp assignment created successfully!', 'success');
                  setIsTempModalOpen(false);
                  setSelectedCounselor(null);
                }}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Temp Assignment Modal */}
      {isTempModalOpen && selectedCounselor && (
        <div className="modal-overlay open">
          <div className="modal max-w-[500px]">
            <div className="modal-header border-b border-gray-100 pb-3 mb-4">
              <h2 className="text-xl font-bold text-gray-800">Temp Assignment</h2>
              <button
                className="btn-icon bg-transparent border-none cursor-pointer"
                onClick={() => setIsTempModalOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="mb-4">
                <p className="text-gray-500 text-sm">
                  Temporarily assign for <strong>{selectedCounselor.firstName} {selectedCounselor.lastName}</strong>
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  From
                </label>
                <input
                  type="date"
                  className="form-control w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assign
                </label>
                <select
                  className="form-control w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">Select counselor to assign...</option>
                  <option value="2">Priya Patel</option>
                  <option value="3">Amit Kumar</option>
                  <option value="4">Sneha Reddy</option>
                  <option value="5">Vikram Singh</option>
                </select>
              </div>
            </div>
            <div className="modal-footer pt-4 mt-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                className="btn btn-secondary px-4 py-2 border border-gray-300 rounded cursor-pointer"
                onClick={() => setIsTempModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary px-4 py-2 bg-blue-600 text-white border-none rounded cursor-pointer hover:bg-blue-700"
                onClick={() => {
                  showToast('Temp assignment created successfully!', 'success');
                  setIsTempModalOpen(false);
                }}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Counselors;

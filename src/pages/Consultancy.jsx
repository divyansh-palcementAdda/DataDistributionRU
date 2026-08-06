import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import ReusableTable from '../component/reusable/table';

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
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'location', label: 'Location' }
];

const Consultancy = () => {
  const { showToast } = useAppContext();
  const navigate = useNavigate();

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
      // Static data for consultancies
      const staticConsultancies = [
        {
          id: 1,
          name: 'Global Education Consultants',
          email: 'global.edu@example.com',
          phone: '+91 98765 43210',
          location: 'Delhi',
          address: '123, Connaught Place, New Delhi',
          totalStudents: 45,
          activeStudents: 38,
          isActive: true
        },
        {
          id: 2,
          name: 'Study Abroad Experts',
          email: 'study.abroad@example.com',
          phone: '+91 98765 43211',
          location: 'Mumbai',
          address: '456, Andheri West, Mumbai',
          totalStudents: 32,
          activeStudents: 28,
          isActive: true
        },
        {
          id: 3,
          name: 'Career Guidance Hub',
          email: 'career.hub@example.com',
          phone: '+91 98765 43212',
          location: 'Bangalore',
          address: '789, Indiranagar, Bangalore',
          totalStudents: 56,
          activeStudents: 50,
          isActive: true
        },
        {
          id: 4,
          name: 'EduConnect Services',
          email: 'educonnect@example.com',
          phone: '+91 98765 43213',
          location: 'Pune',
          address: '321, Koregaon Park, Pune',
          totalStudents: 23,
          activeStudents: 20,
          isActive: false
        },
        {
          id: 5,
          name: 'Future Path Advisors',
          email: 'future.path@example.com',
          phone: '+91 98765 43214',
          location: 'Chennai',
          address: '654, T. Nagar, Chennai',
          totalStudents: 41,
          activeStudents: 35,
          isActive: true
        }
      ];

      // Apply search filter if search is provided
      let filteredData = staticConsultancies;
      if (search) {
        filteredData = staticConsultancies.filter(consultancy => 
          consultancy.name.toLowerCase().includes(search.toLowerCase()) ||
          consultancy.email.toLowerCase().includes(search.toLowerCase()) ||
          consultancy.location.toLowerCase().includes(search.toLowerCase())
        );
      }

      setData(filteredData);
      setTotalElements(filteredData.length);
      setTotalPages(1);
    } catch (err) {
      showToast('Error fetching consultancies', 'error');
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

  const handleView = (consultancy) => {
    navigate(`/consultancy/${consultancy.id}`);
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

  const getInitials = (name) => {
    if (!name) return 'C';
    const words = name.split(' ');
    if (words.length >= 2) {
      return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  /* ── Table columns ── */
  const columns = [
    {
      key: 'name',
      header: <SortHeader col={{ key: 'name', label: 'Consultancy Name' }} />,
      render: (_, row) => {
        const name = row.name || 'Unknown Consultancy';
        const color = getColor(name);
        const initials = getInitials(name);
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
              <div className="text-xs text-gray-400">{row.location || '—'}</div>
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
      key: 'phone',
      header: 'Contact',
      render: (_, row) => (
        <span className="text-gray-600 text-sm">{row.phone || '—'}</span>
      ),
    },
    {
      key: 'students',
      header: 'Students',
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="text-gray-900 font-medium">{row.totalStudents || 0} Total</span>
          <span className="text-xs text-gray-400">{row.activeStudents || 0} Active</span>
        </div>
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
          onClick={() => handleView(row)}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Consultancies</h1>
        <p className="text-gray-600">Manage and view all consultancy partners</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="relative">
              <input
                type="text"
                placeholder="Search consultancies..."
                value={searchInput}
                onChange={handleSearchInput}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <ReusableTable
          columns={columns}
          data={data}
          loading={loading}
          page={page}
          size={size}
          totalElements={totalElements}
          totalPages={totalPages}
          onPageChange={setPage}
          onSizeChange={setSize}
        />
      </div>
    </div>
  );
};

export default Consultancy;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  { key: 'course', label: 'Course' }
];

const ConsultancyDetails = () => {
  const { id } = useParams();
  const { showToast } = useAppContext();
  const navigate = useNavigate();

  /* ── Consultancy Info ── */
  const [consultancy, setConsultancy] = useState(null);

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
      // Static consultancy data
      const consultancyData = {
        1: {
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
        2: {
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
        3: {
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
        4: {
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
        5: {
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
      };

      const currentConsultancy = consultancyData[id] || consultancyData[1];
      setConsultancy(currentConsultancy);

      // Static student data for the consultancy
      const staticStudents = [
        {
          id: 1,
          firstName: 'Rahul',
          lastName: 'Verma',
          email: 'rahul.verma@example.com',
          phone: '+91 98765 11111',
          course: 'MBA',
          status: 'Active',
          enrollmentDate: '2024-01-15',
          assignedCounselor: 'Rahul Sharma'
        },
        {
          id: 2,
          firstName: 'Priya',
          lastName: 'Gupta',
          email: 'priya.gupta@example.com',
          phone: '+91 98765 22222',
          course: 'B.Tech',
          status: 'Active',
          enrollmentDate: '2024-02-20',
          assignedCounselor: 'Priya Patel'
        },
        {
          id: 3,
          firstName: 'Amit',
          lastName: 'Singh',
          email: 'amit.singh@example.com',
          phone: '+91 98765 33333',
          course: 'B.Com',
          status: 'Inactive',
          enrollmentDate: '2023-11-10',
          assignedCounselor: 'Amit Kumar'
        },
        {
          id: 4,
          firstName: 'Sneha',
          lastName: 'Kapoor',
          email: 'sneha.kapoor@example.com',
          phone: '+91 98765 44444',
          course: 'MBA',
          status: 'Active',
          enrollmentDate: '2024-03-05',
          assignedCounselor: 'Sneha Reddy'
        },
        {
          id: 5,
          firstName: 'Vikram',
          lastName: 'Malhotra',
          email: 'vikram.malhotra@example.com',
          phone: '+91 98765 55555',
          course: 'MCA',
          status: 'Active',
          enrollmentDate: '2024-01-28',
          assignedCounselor: 'Vikram Singh'
        },
        {
          id: 6,
          firstName: 'Neha',
          lastName: 'Sharma',
          email: 'neha.sharma@example.com',
          phone: '+91 98765 66666',
          course: 'B.Tech',
          status: 'Active',
          enrollmentDate: '2024-02-12',
          assignedCounselor: 'Rahul Sharma'
        },
        {
          id: 7,
          firstName: 'Rajesh',
          lastName: 'Kumar',
          email: 'rajesh.kumar@example.com',
          phone: '+91 98765 77777',
          course: 'MBA',
          status: 'Inactive',
          enrollmentDate: '2023-12-01',
          assignedCounselor: 'Amit Kumar'
        },
        {
          id: 8,
          firstName: 'Anjali',
          lastName: 'Verma',
          email: 'anjali.verma@example.com',
          phone: '+91 98765 88888',
          course: 'B.Com',
          status: 'Active',
          enrollmentDate: '2024-03-18',
          assignedCounselor: 'Priya Patel'
        }
      ];

      // Apply search filter if search is provided
      let filteredData = staticStudents;
      if (search) {
        filteredData = staticStudents.filter(student => 
          student.firstName.toLowerCase().includes(search.toLowerCase()) ||
          student.lastName.toLowerCase().includes(search.toLowerCase()) ||
          student.email.toLowerCase().includes(search.toLowerCase()) ||
          student.course.toLowerCase().includes(search.toLowerCase())
        );
      }

      setData(filteredData);
      setTotalElements(filteredData.length);
      setTotalPages(1);
    } catch (err) {
      showToast('Error fetching consultancy details', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, page, size, sortBy, sortDirection, search, showToast]);

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

  const handleBack = () => {
    navigate('/consultancy');
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
    return 'S';
  };

  /* ── Table columns ── */
  const columns = [
    {
      key: 'name',
      header: <SortHeader col={{ key: 'name', label: 'Student Name' }} />,
      render: (_, row) => {
        const name = `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'Unknown Student';
        const color = getColor(name);
        const initials = getInitials(row.firstName, row.lastName);
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
              <div className="text-xs text-gray-400">{row.email || '—'}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'phone',
      header: 'Contact',
      render: (_, row) => (
        <span className="text-gray-600 text-sm">{row.phone || '—'}</span>
      ),
    },
    {
      key: 'course',
      header: <SortHeader col={{ key: 'course', label: 'Course' }} />,
      render: (_, row) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {row.course || '—'}
        </span>
      ),
    },
    {
      key: 'counselor',
      header: 'Counselor',
      render: (_, row) => (
        <span className="text-gray-600 text-sm">{row.assignedCounselor || '—'}</span>
      ),
    },
    {
      key: 'enrollmentDate',
      header: 'Enrolled',
      render: (_, row) => (
        <span className="text-gray-600 text-sm">{row.enrollmentDate || '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_, row) => {
        const isActive = row.status === 'Active';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
  ];

  if (!consultancy) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Consultancies
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{consultancy.name}</h1>
        <p className="text-gray-600">View all students enrolled through this consultancy</p>
      </div>

      {/* Consultancy Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">Email</div>
            <div className="font-medium text-gray-900">{consultancy.email}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Phone</div>
            <div className="font-medium text-gray-900">{consultancy.phone}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Location</div>
            <div className="font-medium text-gray-900">{consultancy.location}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Address</div>
            <div className="font-medium text-gray-900">{consultancy.address}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Total Students</div>
            <div className="font-medium text-gray-900">{consultancy.totalStudents}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Active Students</div>
            <div className="font-medium text-gray-900">{consultancy.activeStudents}</div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Students</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
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

export default ConsultancyDetails;

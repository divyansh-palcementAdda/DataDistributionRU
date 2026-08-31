import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { leads, statusConfig } from '../../mockData';
import { getAllLeads } from '../../Services/lead/leadService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAppContext } from '../../AppContext';
import { Doughnut } from 'react-chartjs-2';
import ReusableTable from '../../component/reusable/table';
import LeadCards from '../../component/reusable/DashBoards/leadCards';
import LeadSource from '../../component/reusable/DashBoards/leadSource';
import SystemCards from '../../component/reusable/DashBoards/SystemCards';
import CategorywiseCard from '../../component/reusable/DashBoards/categorywiseCard';
import BoardWiseCard from '../../component/reusable/DashBoards/BoardWiseCard';
import GradWiseCard from '../../component/reusable/DashBoards/gradWiseCard';
import AllottedCard from '../../component/reusable/DashBoards/allottedCard';
import AvailedCard from '../../component/reusable/DashBoards/availedCard';
import { getLeadSourceBreakdown, getGradeBreakdown, getBoardBreakdown } from '../../Services/cards/cardService';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

/* ── Stat Cards data ── */
const statCards = [
  {
    color: 'blue',
    label: 'Allotted to Me',
    value: '0',
    iconBg: 'var(--primary-light)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    color: 'green',
    label: 'Connected',
    value: '0',
    iconBg: 'var(--success-light)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.9" />
      </svg>
    ),
  },
  {
    color: 'green',
    label: 'Registered',
    value: '0',
    iconBg: 'var(--success-light)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    color: 'orange',
    label: 'Pending Follow-ups',
    value: '0',
    iconBg: '#FFF7ED',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <path d="M8 14h.01M12 14h.01M16 14h.01" />
      </svg>
    ),
  },
];

const CallersDashboard = () => {
  const { navTo } = useAppContext();
  
  // Mock: Get current caller name (in real app, this would come from auth/context)
  const currentCaller = 'Rahul Singh'; // Simulating logged-in caller

  // State for API data
  const [leadSourceData, setLeadSourceData] = useState([]);
  const [gradWiseData, setGradWiseData] = useState([]);
  const [boardWiseData, setBoardWiseData] = useState([]);
  
  // API State for leads table
  const [leadsData, setLeadsData] = useState([]);
  const [allLeadsData, setAllLeadsData] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);
  const [filterRequest, setFilterRequest] = useState({});
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Ref for table section
  const tableSectionRef = useRef(null);

  // Fetch lead source data from API
  useEffect(() => {
    const fetchLeadSourceData = async () => {
      try {
        const filterRequest = {};
        const response = await getLeadSourceBreakdown({ filterRequest: JSON.stringify(filterRequest) });

        if (response.data && response.data.data) {
          const apiData = response.data.data;
          setLeadSourceData(Array.isArray(apiData) ? apiData : []);
        }
      } catch (error) {
        console.error('Error fetching lead source data:', error);
        setLeadSourceData([]);
      }
    };

    fetchLeadSourceData();
  }, []);

  // Fetch grade wise data from API
  useEffect(() => {
    const fetchGradeWiseData = async () => {
      try {
        const filterRequest = {};
        const response = await getGradeBreakdown({ filterRequest: JSON.stringify(filterRequest) });
        console.log('Grade Wise API Response:', response);
        
        if (response.data && response.data.data) {
          const apiData = response.data.data;
          setGradWiseData(Array.isArray(apiData) ? apiData : []);
        }
      } catch (error) {
        console.error('Error fetching grade wise data:', error);
        setGradWiseData([]);
      }
    };

    fetchGradeWiseData();
  }, []);

  // Fetch board wise data from API
  useEffect(() => {
    const fetchBoardWiseData = async () => {
      try {
        const filterRequest = {};
        const response = await getBoardBreakdown({ filterRequest: JSON.stringify(filterRequest) });
        console.log('Board Wise API Response:', response);

        if (response.data && response.data.data) {
          const apiData = response.data.data;
          if (Array.isArray(apiData)) {
            setBoardWiseData(apiData);
          } else {
            setBoardWiseData([]);
          }
        }
      } catch (error) {
        console.error('Error fetching board wise data:', error);
        setBoardWiseData([]);
      }
    };

    fetchBoardWiseData();
  }, []);

  // Fetch all leads for stats
  const fetchAllLeads = useCallback(async () => {
    try {
      const params = {
        page: 0,
        size: 1000,
      };
      const res = await getAllLeads(params);
      if (res?.data?.success) {
        const content = res.data.data.content;
        setAllLeadsData(content);
      }
    } catch (error) {
      console.error("Failed to fetch all leads", error);
    }
  }, []);

  // Fetch leads from API for table (caller's leads with filtering)
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page,
        size: size,
        sortBy: sortBy || undefined,
        sortDirection: sortDirection || undefined,
        // Filter for leads allotted to current caller
        assignedTo: currentCaller,
      };
      
      // Add filters based on activeFilters array
      activeFilters.forEach(filter => {
        switch (filter.type) {
          case 'leadStatus':
            params.statusId = filter.value;
            break;
          case 'board':
            params.boardId = filter.value;
            break;
          case 'grade':
            params.gradeId = filter.value;
            break;
          case 'courseType':
            params.courseTypeId = filter.value;
            break;
          case 'leadSource':
            params.leadSourceId = filter.value;
            break;
          default:
            break;
        }
      });
      
      const res = await getAllLeads(params);
      if (res?.data?.success) {
        const content = res.data.data.content;
        setLeadsData(content);
        setTotalElements(res.data.data.totalElements);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch leads", error);
    } finally {
      setLoading(false);
    }
  }, [page, size, sortBy, sortDirection, activeFilters, currentCaller]);

  useEffect(() => {
    fetchAllLeads();
    fetchLeads();
  }, [fetchAllLeads, fetchLeads]);

  // Filter leads allotted to this caller (from API data)
  const myLeads = leadsData;

  // Data for reusable cards
  const systemCardsData = useMemo(() => {
    return {
      totalDataInSystem: allLeadsData.length,
      totalSourceOfData: [...new Set(allLeadsData.map(l => l.source?.name))].length,
    };
  }, [allLeadsData]);

  const calculatedStatCards = useMemo(() => {
    const allotted = myLeads.length;
    const connected = myLeads.filter(l => l.currentStatus === 'connected' || l.currentStatus === 'CONNECTED').length;
    const registered = myLeads.filter(l => l.currentStatus === 'registered' || l.currentStatus === 'REGISTERED').length;
    const pendingFollowups = 0; // Placeholder since follow-ups removed

    return statCards.map(card => {
      switch (card.label) {
        case 'Allotted to Me': return { ...card, value: allotted.toLocaleString() };
        case 'Connected': return { ...card, value: connected.toLocaleString() };
        case 'Registered': return { ...card, value: registered.toLocaleString() };
        case 'Pending Follow-ups': return { ...card, value: pendingFollowups.toLocaleString() };
        default: return card;
      }
    });
  }, [myLeads]);

  // Status distribution chart for caller's leads
  const statusChartData = useMemo(() => {
    const statusCounts = {};
    myLeads.forEach(lead => {
      const status = lead.currentStatus || 'raw';
      // Handle both string and object status
      const statusKey = typeof status === 'object' ? status?.code || status?.name || 'raw' : status;
      statusCounts[statusKey] = (statusCounts[statusKey] || 0) + 1;
    });

    const labels = Object.keys(statusCounts).map(s => statusConfig[s]?.label || s);
    const data = Object.values(statusCounts);
    const colors = Object.keys(statusCounts).map(s => statusConfig[s]?.color || '#64748B');

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 6,
      }],
    };
  }, [myLeads]);

  const statusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 10 }, padding: 8, boxWidth: 10 },
      },
    },
  };

  // Table columns for caller's leads
  const leadColumns = [
    { 
      key: 'name', 
      header: 'Lead Name', 
      render: (value, row) => {
        const nameValue = value || row.fullName;
        if (typeof nameValue === 'object' && nameValue !== null) {
          return nameValue?.name || nameValue?.fullName || nameValue?.firstName || '—';
        }
        return nameValue || '—';
      }
    },
    { 
      key: 'phone', 
      header: 'Phone', 
      render: (value, row) => {
        const phoneValue = value || row.phoneNumber;
        if (typeof phoneValue === 'object' && phoneValue !== null) {
          return phoneValue?.phone || phoneValue?.mobileNo || '—';
        }
        return phoneValue || '—';
      }
    },
    { 
      key: 'course', 
      header: 'Course',
      render: (value, row) => {
        const courseValue = value || row.courseInterested;
        if (typeof courseValue === 'object' && courseValue !== null) {
          return courseValue?.courseName || courseValue?.name || '—';
        }
        return courseValue || '—';
      }
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (value, row) => {
        const statusValue = value || row.currentStatus;
        let displayStatus = '—';
        
        if (typeof statusValue === 'object' && statusValue !== null) {
          displayStatus = statusValue?.name || statusValue?.code || '—';
        } else if (typeof statusValue === 'string') {
          displayStatus = statusValue;
        }
        
        const config = statusConfig[displayStatus] || { label: displayStatus, color: '#64748B' };
        return (
          <span className="badge" style={{
            background: `${config.color}15`,
            color: config.color,
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600',
          }}>
            {config.label}
          </span>
        );
      }
    },
    { 
      key: 'source', 
      header: 'Source',
      render: (value, row) => {
        const sourceValue = value || row.source;
        if (typeof sourceValue === 'object' && sourceValue !== null) {
          return sourceValue?.name || '—';
        }
        return sourceValue || '—';
      }
    },
    { 
      key: 'followup', 
      header: 'Follow-up',
      render: (value, row) => row.nextFollowUpDate || '—'
    },
  ];

  const handleCardClick = (cardInfo) => {
    // Toggle: same card click kare toh filter clear ho jaye
    const existingFilterIndex = activeFilters.findIndex(
      f => f.type === cardInfo.type && f.value === cardInfo.value
    );
    
    if (existingFilterIndex !== -1) {
      // Remove filter if already exists
      setActiveFilters(activeFilters.filter((_, index) => index !== existingFilterIndex));
    } else {
      // Remove existing filter of same type (single filter per type)
      setActiveFilters(
        activeFilters.filter(f => f.type !== cardInfo.type).concat(cardInfo)
      );
    }
    
    setPage(0); // filter change hone par page reset
    
    // Scroll to table section smoothly
    if (tableSectionRef.current) {
      tableSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Update filterRequest when activeFilters changes
  useEffect(() => {
    const newFilterRequest = {};
    activeFilters.forEach(filter => {
      switch (filter.type) {
        case 'availed':
          newFilterRequest.availed = true;
          break;
        case 'allotted':
          newFilterRequest.allotted = true;
          break;
        case 'leadStatus':
          if (!newFilterRequest.leadStatusIds) newFilterRequest.leadStatusIds = [];
          newFilterRequest.leadStatusIds.push(filter.value);
          break;
        case 'board':
          if (!newFilterRequest.boardIds) newFilterRequest.boardIds = [];
          newFilterRequest.boardIds.push(filter.value);
          break;
        case 'grade':
          if (!newFilterRequest.gradeIds) newFilterRequest.gradeIds = [];
          newFilterRequest.gradeIds.push(filter.value);
          break;
        case 'courseType':
          if (!newFilterRequest.courseTypeIds) newFilterRequest.courseTypeIds = [];
          newFilterRequest.courseTypeIds.push(filter.value);
          break;
        case 'leadSource':
          if (!newFilterRequest.leadSourceIds) newFilterRequest.leadSourceIds = [];
          newFilterRequest.leadSourceIds.push(filter.value);
          break;
        default:
          break;
      }
    });
    setFilterRequest(newFilterRequest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters]);

  const handleSort = (columnKey, direction) => {
    // Map frontend column keys to backend field names (using camelCase from API response)
    const fieldMapping = {
      'name': 'fullName',
      'phone': 'phoneNumber',
      'course': 'courseInterested',
      'status': 'currentStatus',
      'source': 'source.name',
      'followup': 'nextFollowUpDate',
    };
    
    const backendField = fieldMapping[columnKey] || columnKey;
    setSortBy(backendField);
    setSortDirection(direction);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', background: 'linear-gradient(135deg, #435fff, #a571ff)', padding: '20px', borderRadius: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff' }}>Caller Dashboard</h1>
          <p style={{ fontSize: '13px', color: '#e0e7ff', marginTop: '4px' }}>
            Welcome back,  Here&apos;s your allotment overview.
          </p>
        </div>
        {/* <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Today
          </button>
        </div> */}
      </div>

      {/* ── Stat Cards ── */}
      {/* <div className="stat-grid">
        {calculatedStatCards.map((card) => (
          <div key={card.label} className={`stat-card ${card.color}`}>
            <div className="stat-label">{card.label}</div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-icon" style={{ background: card.iconBg }}>
              {card.icon}
            </div>
          </div>
        ))}
      </div> */}

      {/* ── Reusable Dashboard Cards ── */}
      <LeadCards 
        onCardClick={handleCardClick}
        activeFilters={activeFilters}
      />
      <LeadSource 
        data={leadSourceData}
        onCardClick={handleCardClick}
        activeFilters={activeFilters}
      />
      {/* <SystemCards data={systemCardsData} /> */}
      <CategorywiseCard 
        onCardClick={handleCardClick}
        activeFilters={activeFilters}
      />
      <BoardWiseCard 
        data={boardWiseData}
        onCardClick={handleCardClick}
        activeFilters={activeFilters}
      />
      <GradWiseCard 
        data={gradWiseData}
        onCardClick={handleCardClick}
        activeFilters={activeFilters}
      />
      <AllottedCard 
        onCardClick={handleCardClick}
        activeFilters={activeFilters}
        filterRequest={filterRequest}
      />
      <AvailedCard 
        onCardClick={handleCardClick}
        activeFilters={activeFilters}
        filterRequest={filterRequest}
      />

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '20px' }}>
        {/* Status Distribution Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">My Leads Status</div>
              <div className="card-sub">Distribution of your allotted leads</div>
            </div>
          </div>
          <div style={{ height: '220px' }}>
            <Doughnut data={statusChartData} options={statusChartOptions} />
          </div>
        </div>
      </div>

      {/* ── My Allotted Leads Table ── */}
      <div className="card" ref={tableSectionRef}>
        <div className="card-header">
          <div className="card-title">My Allotted Leads</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Active card filter badges */}
            {activeFilters.map((filter, index) => (
              <div 
                key={`${filter.type}-${filter.value}-${index}`}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-md text-sm text-indigo-700 font-medium"
              >
                <span>{filter.label}</span>
                <button
                  onClick={() => {
                    setActiveFilters(activeFilters.filter((_, i) => i !== index));
                    setPage(0);
                  }}
                  className="ml-1 text-indigo-400 hover:text-indigo-700 bg-transparent border-none cursor-pointer leading-none"
                  title="Clear filter"
                >
                  ✕
                </button>
              </div>
            ))}
            {/* Clear all filters button */}
            {activeFilters.length > 0 && (
              <button
                onClick={() => {
                  setActiveFilters([]);
                  setPage(0);
                }}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded border border-gray-300 cursor-pointer"
                title="Clear all filters"
              >
                Clear All
              </button>
            )}
            <span className="badge badge-primary">{myLeads.length} leads</span>
          </div>
        </div>
        <ReusableTable
          columns={leadColumns}
          data={myLeads}
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
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          onView={(lead) => {
            const leadId = lead.id || lead.leadId;
            navTo('lead-detail', { id: leadId });
          }}
          emptyMessage={loading ? "Loading..." : "No leads match your filters."}
        />
      </div>
    </div>
  );
};

export default CallersDashboard;
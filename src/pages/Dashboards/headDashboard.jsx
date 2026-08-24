import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { leads, statusConfig } from '../../mockData';
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
import BoardWiseCard from '../../component/reusable/DashBoards/BoardWiseCard';
import SystemCards from '../../component/reusable/DashBoards/SystemCards';
import CategorywiseCard from '../../component/reusable/DashBoards/categorywiseCard';
import GradWiseCard from '../../component/reusable/DashBoards/gradWiseCard';
import LeadCards from '../../component/reusable/DashBoards/leadCards';
import LeadSource from '../../component/reusable/DashBoards/leadSource';
import { getAllLeads } from '../../Services/lead/leadService';

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
    label: 'Allotted to Callers',
    value: '0',
    iconBg: 'var(--success-light)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    color: 'orange',
    label: 'Not Allotted',
    value: '0',
    iconBg: '#FFF7ED',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
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
];

/* ── Arrow icons ── */
const ArrowUp = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const HeadDashboard = () => {
  const { navTo } = useAppContext();
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [allotModalOpen, setAllotModalOpen] = useState(false);
  const [selectedCaller, setSelectedCaller] = useState('');
  
  // API State
  const [leadsData, setLeadsData] = useState([]);
  const [allLeadsData, setAllLeadsData] = useState([]); // For stats and other components
  const [activeFilters, setActiveFilters] = useState([]); // Array of active filters
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Ref for table section
  const tableSectionRef = useRef(null);

  // Fetch all leads for stats and other components
  const fetchAllLeads = useCallback(async () => {
    try {
      const params = {
        page: 0,
        size: 1000, // Fetch all leads for stats
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

  // Fetch leads from API for table (unallotted leads with card filtering)
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page,
        size: size,
        sortBy: sortBy || undefined,
        sortDirection: sortDirection || undefined,
        // Filter for leads not allotted (allotted to Head)
        assignedTo: null,
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
  }, [page, size, sortBy, sortDirection, activeFilters]);

  useEffect(() => {
    fetchAllLeads();
    fetchLeads();
  }, [fetchAllLeads, fetchLeads]);

  // Since we're filtering at API level with assignedTo: null, leadsData already contains only unallotted leads
  const headAllottedLeads = leadsData;

  const calculatedStatCards = useMemo(() => {
    const allottedToMe = headAllottedLeads.length;
    const allottedToCallers = allLeadsData.filter(lead => lead.assignedTo && lead.assignedTo !== '').length;
    const notAllotted = allLeadsData.filter(l => !l.assignedTo || l.assignedTo === '').length;
    const registered = allLeadsData.filter(l => l.currentStatus === 'registered' || l.currentStatus === 'REGISTERED').length;

    return statCards.map(card => {
      switch (card.label) {
        case 'Allotted to Me': return { ...card, value: allottedToMe.toLocaleString() };
        case 'Allotted to Callers': return { ...card, value: allottedToCallers.toLocaleString() };
        case 'Not Allotted': return { ...card, value: notAllotted.toLocaleString() };
        case 'Registered': return { ...card, value: registered.toLocaleString() };
        default: return card;
      }
    });
  }, [headAllottedLeads, allLeadsData]);

  // Data for reusable cards
  const systemData = useMemo(() => ({
    totalDataInSystem: allLeadsData.length,
    totalSourceOfData: [...new Set(allLeadsData.map(l => l.source?.name))].length,
  }), [allLeadsData]);

  // Status distribution chart for Head's leads
  const statusChartData = useMemo(() => {
    const statusCounts = {};
    headAllottedLeads.forEach(lead => {
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
  }, [headAllottedLeads]);

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

  // Table columns for Head's allotted leads
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
      key: 'city', 
      header: 'City', 
      render: (value, row) => {
        const cityValue = value || row.city;
        if (typeof cityValue === 'object' && cityValue !== null) {
          return cityValue?.name || cityValue?.city || '—';
        }
        return cityValue || '—';
      }
    },
  ];



  const handleAllotToCaller = () => {
    if (selectedLeads.length === 0 || !selectedCaller) {
      alert('Please select leads and a caller');
      return;
    }
    // Here you would make an API call to allot leads
    console.log('Alloting leads', selectedLeads, 'to caller', selectedCaller);
    alert(`Allotted ${selectedLeads.length} leads to ${selectedCaller}`);
    setSelectedLeads([]);
    setSelectedCaller('');
    setAllotModalOpen(false);
  };

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

  const handleSort = (columnKey, direction) => {
    // Map frontend column keys to backend field names (using camelCase from API response)
    const fieldMapping = {
      'name': 'fullName',
      'phone': 'phoneNumber',
      'course': 'courseInterested',
      'status': 'currentStatus',
      'source': 'source.name',
      'city': 'city.name',
    };
    
    const backendField = fieldMapping[columnKey] || columnKey;
    setSortBy(backendField);
    setSortDirection(direction);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--gray-900)' }}>Head Dashboard</h1>
          <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '4px' }}>
            Manage your allotted leads and distribute to callers
          </p>
        </div>
        
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
      <SystemCards data={systemData} />
      <BoardWiseCard 
        onCardClick={handleCardClick}
        activeFilters={activeFilters}
      />
      <CategorywiseCard 
        onCardClick={handleCardClick}
        activeFilters={activeFilters}
      />
      <GradWiseCard 
        onCardClick={handleCardClick}
        activeFilters={activeFilters}
      />
      <LeadSource 
        onCardClick={handleCardClick}
        activeFilters={activeFilters}
      />
     

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '20px' }}>
        {/* Status Distribution Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Your Leads Status</div>
              <div className="card-sub">Distribution of your allotted leads</div>
            </div>
          </div>
          <div style={{ height: '220px' }}>
            <Doughnut data={statusChartData} options={statusChartOptions} />
          </div>
        </div>
      </div>

      {/* ── Leads Allotted to Head Table ── */}
      <div className="card" style={{ marginBottom: '20px' }} ref={tableSectionRef}>
        <div className="card-header">
          <div className="card-title">Leads Allotted to You</div>
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
            <span className="badge badge-primary">{headAllottedLeads.length} leads</span>
          </div>
        </div>
        <ReusableTable
          columns={leadColumns}
          data={headAllottedLeads}
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

      {/* ── Allotment Modal ── */}
      {allotModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="card" style={{ width: '400px', maxWidth: '90%' }}>
            <div className="card-header">
              <div className="card-title">Allot Leads to Caller</div>
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setAllotModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '16px' }}>
                Allotting {selectedLeads.length} lead(s) to a caller
              </p>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: '6px' }}>
                  Select Caller
                </label>
                <select
                  value={selectedCaller}
                  onChange={(e) => setSelectedCaller(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '6px',
                    fontSize: '13px',
                  }}
                >
                  <option value="">Choose a caller...</option>
                  {/* TODO: Add real counselor data from API */}
                  <option value="Caller 1">Caller 1</option>
                  <option value="Caller 2">Caller 2</option>
                  <option value="Caller 3">Caller 3</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setAllotModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleAllotToCaller}
                  disabled={!selectedCaller}
                >
                  Allot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeadDashboard;
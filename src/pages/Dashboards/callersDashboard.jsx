import React, { useMemo, useState, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
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
  const navigate = useNavigate();
  
  // Mock: Get current caller name (in real app, this would come from auth/context)
  const currentCaller = 'Rahul Singh'; // Simulating logged-in caller

  // State for API data
  const [leadSourceData, setLeadSourceData] = useState([]);
  const [gradWiseData, setGradWiseData] = useState([]);
  const [boardWiseData, setBoardWiseData] = useState([]);
  
  // API State for leads table
  const [allLeadsData, setAllLeadsData] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);
  const [filterRequest, setFilterRequest] = useState({});

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
  const fetchAllLeads = async () => {
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
  };

  useEffect(() => {
    fetchAllLeads();
  }, []);

  // Data for reusable cards
  const systemCardsData = useMemo(() => {
    return {
      totalDataInSystem: allLeadsData.length,
      totalSourceOfData: [...new Set(allLeadsData.map(l => l.source?.name))].length,
    };
  }, [allLeadsData]);

  const calculatedStatCards = useMemo(() => {
    const allotted = allLeadsData.filter(l => l.assignedTo === currentCaller).length;
    const connected = allLeadsData.filter(l => l.assignedTo === currentCaller && (l.currentStatus === 'connected' || l.currentStatus === 'CONNECTED')).length;
    const registered = allLeadsData.filter(l => l.assignedTo === currentCaller && (l.currentStatus === 'registered' || l.currentStatus === 'REGISTERED')).length;
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
  }, [allLeadsData, currentCaller]);

  const handleCardClick = (cardInfo) => {
    // Toggle: same card click kare toh filter clear ho jaye
    const existingFilterIndex = activeFilters.findIndex(
      f => f.type === cardInfo.type && f.value === cardInfo.value
    );
    
    let newFilters;
    if (existingFilterIndex !== -1) {
      newFilters = activeFilters.filter((_, index) => index !== existingFilterIndex);
    } else {
      newFilters = activeFilters.filter(f => f.type !== cardInfo.type).concat(cardInfo);
    }
    
    setActiveFilters(newFilters);
    
    // Navigate to Leads page with filter (Leads.jsx will handle smart conversion)
    setTimeout(() => {
      navigate('/leads', { state: { activeFilters: newFilters } });
    }, 100);
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

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', background: 'linear-gradient(135deg, #435fff, #a571ff)', padding: '20px', borderRadius: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff' }}>Counselor Dashboard</h1>
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
      {/* Availed and Allotted Cards in Flex Row */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
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
      </div>
      
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

      {/* ── Charts Row ── */}
      {/* <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '20px' }}>
      
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
      </div> */}
    </div>
  );
};

export default CallersDashboard;

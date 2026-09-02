import React, { useMemo, useState, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import BoardWiseCard from '../../component/reusable/DashBoards/BoardWiseCard';
import SystemCards from '../../component/reusable/DashBoards/SystemCards';
import CategorywiseCard from '../../component/reusable/DashBoards/categorywiseCard';
import GradWiseCard from '../../component/reusable/DashBoards/gradWiseCard';
import LeadCards from '../../component/reusable/DashBoards/leadCards';
import LeadSource from '../../component/reusable/DashBoards/leadSource';
import UnallottedCard from '../../component/reusable/DashBoards/UnallottedCard';
import AvailedCard from '../../component/reusable/DashBoards/availedCard';
import AllottedCard from '../../component/reusable/DashBoards/allottedCard';
import { getAllLeads } from '../../Services/lead/leadService';
import { getDashboardSummary } from '../../Services/Dashboard/Dashboard';

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
  const navigate = useNavigate();
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [allotModalOpen, setAllotModalOpen] = useState(false);
  const [selectedCaller, setSelectedCaller] = useState('');
  
  // API State
  const [allLeadsData, setAllLeadsData] = useState([]); // For stats and other components
  const [activeFilters, setActiveFilters] = useState([]); // Array of active filters
  const [filterRequest, setFilterRequest] = useState({});
  const [dashboardSummaryData, setDashboardSummaryData] = useState(null);

  // Fetch all leads for stats and other components
  const fetchAllLeads = async () => {
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
  };

  useEffect(() => {
    fetchAllLeads();
  }, []);

  // Fetch dashboard summary data from API
  useEffect(() => {
    const fetchDashboardSummary = async () => {
      try {
        const response = await getDashboardSummary();
        console.log('Dashboard Summary API Response:', response);

        if (response && response.data) {
          setDashboardSummaryData(response.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard summary data:', error);
        setDashboardSummaryData(null);
      }
    };

    fetchDashboardSummary();
  }, []);

  const calculatedStatCards = useMemo(() => {
    const allottedToMe = allLeadsData.filter(l => !l.assignedTo || l.assignedTo === '').length;
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
  }, [allLeadsData]);

  // Data for reusable cards
  const systemData = useMemo(() => ({
    totalDataInSystem: allLeadsData.length,
    totalSourceOfData: [...new Set(allLeadsData.map(l => l.source?.name))].length,
  }), [allLeadsData]);

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
        case 'unallotted':
          newFilterRequest.allotted = false;
          break;
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
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff' }}>Head Dashboard</h1>
          <p style={{ fontSize: '13px', color: '#e0e7ff', marginTop: '4px' }}>
            Manage your allotted leads and distribute to callers
          </p>
        </div>
        
        {/* Glassy Navigation Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            onClick={() => navigate('/callers-dashboard')}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              padding: '10px 20px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.25)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.15)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Self Dashboard
          </button>
          <button
            onClick={() => navigate('/head-dashboard')}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              padding: '10px 20px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.25)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.15)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            HOD Dashboard
          </button>
        </div>
      </div>

      {/* ── Full Width Metrics Card ── */}
      <div style={{
        background: 'linear-gradient(135deg, #ff2c47, #ff7a0b)',
        borderRadius: '16px',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        boxShadow: '0 8px 18px #f603',
        border: '1px solid rgba(255, 255, 255, .1)',
        transition: '.3s ease',
        width: '100%',
        maxWidth: '100%',
        minWidth: '0',
        boxSizing: 'border-box',
        overflow: 'hidden',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          width: '100%',
        }}>
          {/* Card 1: Total Counsellors Logged Today */}
          <div style={{
            background: '#ffffff2e',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '10px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: '.3s ease',
            boxSizing: 'border-box',
            flexDirection: 'column'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" style={{ marginBottom: '4px' }}>
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            <div style={{ fontSize: '11px', color: '#ffffff', fontWeight: 500, textAlign: 'center' }}>
              Total Counsellors Logged Today
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>
              {dashboardSummaryData?.counsellorsLoggedToday || 0}
            </div>
          </div>

          {/* Card 2: Total Follow-up Scheduled Today */}
          <div style={{
            background: '#ffffff2e',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '10px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: '.3s ease',
            boxSizing: 'border-box',
            flexDirection: 'column'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" style={{ marginBottom: '4px' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
              <path d="M8 14h.01M12 14h.01M16 14h.01" />
            </svg>
            <div style={{ fontSize: '11px', color: '#ffffff', fontWeight: 500, textAlign: 'center' }}>
              Total Follow-up Scheduled Today
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>
              {dashboardSummaryData?.totalFollowUpsToday || 0}
            </div>
          </div>

          {/* Card 3: Total Counsellors Currently Working */}
          <div style={{
            background: '#ffffff2e',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '10px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: '.3s ease',
            boxSizing: 'border-box',
            flexDirection: 'column'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" style={{ marginBottom: '4px' }}>
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
            </svg>
            <div style={{ fontSize: '11px', color: '#ffffff', fontWeight: 500, textAlign: 'center' }}>
              Total Counsellors Currently Working
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>
              {dashboardSummaryData?.counsellorsCurrentlyWorking || 0}
            </div>
          </div>

          {/* Card 4: Conversation Ratio */}
          <div style={{
            background: '#ffffff2e',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '10px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: '.3s ease',
            boxSizing: 'border-box',
            flexDirection: 'column'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" style={{ marginBottom: '4px' }}>
              <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
            </svg>
            <div style={{ fontSize: '11px', color: '#ffffff', fontWeight: 500, textAlign: 'center' }}>
              Conversation Ratio
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>
              {dashboardSummaryData?.conversationRatio
                ? Math.round(dashboardSummaryData.conversationRatio * 100) + '%'
                : '0%'}
            </div>
          </div>

          {/* Card 5: Total Data in System */}
          <div style={{
            background: '#ffffff2e',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '10px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: '.3s ease',
            boxSizing: 'border-box',
            flexDirection: 'column'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" style={{ marginBottom: '4px' }}>
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <div style={{ fontSize: '11px', color: '#ffffff', fontWeight: 500, textAlign: 'center' }}>
              Total Data in System
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>
              {dashboardSummaryData?.totalLeads || 0}
            </div>
          </div>

          {/* Card 6: Low Data Users Alert */}
          <div
            onClick={() => navigate('/counselors', { state: { lowDataMode: true, fromDashboard: true } })}
            style={{
            background: '#ffffff2e',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '10px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: '.3s ease',
            boxSizing: 'border-box',
            flexDirection: 'column',
            cursor: 'pointer',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" style={{ marginBottom: '4px' }}>
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="6" y1="22" x2="12" y2="22" />
            </svg>
            <div style={{ fontSize: '11px', color: '#ffffff', fontWeight: 500, textAlign: 'center' }}>
              Low Data Users Alert
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>
              {dashboardSummaryData?.sections
                ?.find(s => s.code === 'OPERATIONS')
                ?.cards?.find(c => c.code === 'LOW_DATA_USERS')
                ?.value ?? 0}
            </div>
          </div>

          {/* Card 7: Users Not Logged In Today */}
          <div
            onClick={() => navigate('/counselors', { state: { usersNotLoggedInMode: true, fromDashboard: true } })}
            style={{
            background: '#ffffff2e',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '10px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: '.3s ease',
            boxSizing: 'border-box',
            flexDirection: 'column',
            cursor: 'pointer',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" style={{ marginBottom: '4px' }}>
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="17" y1="11" x2="23" y2="17" />
              <line x1="23" y1="11" x2="17" y2="17" />
            </svg>
            <div style={{ fontSize: '11px', color: '#ffffff', fontWeight: 500, textAlign: 'center' }}>
              Users Not Logged In Today
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>
              {dashboardSummaryData?.sections
                ?.find(s => s.code === 'OPERATIONS')
                ?.cards?.find(c => c.code === 'USERS_NOT_LOGGED_IN')
                ?.value ?? 0}
            </div>
          </div>

          {/* Card 8: Follow-up Users Not Logged In by 11 AM */}
          <div
            onClick={() => navigate('/counselors', { state: { followupNotLoggedIn11amMode: true, fromDashboard: true } })}
            style={{
            background: '#ffffff2e',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '10px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: '.3s ease',
            boxSizing: 'border-box',
            flexDirection: 'column',
            cursor: 'pointer',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" style={{ marginBottom: '4px' }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
              <line x1="12" y1="2" x2="12" y2="2" />
              <path d="M9 1l3 3-3 3" />
            </svg>
            <div style={{ fontSize: '11px', color: '#ffffff', fontWeight: 500, textAlign: 'center' }}>
              Follow-up Users Not Logged In by 11 AM
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>
              {dashboardSummaryData?.sections
                ?.find(s => s.code === 'OPERATIONS')
                ?.cards?.find(c => c.code === 'FOLLOWUP_USERS_NOT_LOGGED_IN_11AM')
                ?.value ?? 0}
            </div>
          </div>
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
      {/* Availed and Allotted Cards in Flex Row */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <AvailedCard 
          onCardClick={handleCardClick}
          activeFilters={activeFilters}
          filterRequest={filterRequest}
        />
        <AllottedCard 
          onCardClick={handleCardClick}
          activeFilters={activeFilters}
          filterRequest={filterRequest}
        />
      </div>
      
      <LeadCards 
        onCardClick={handleCardClick}
        activeFilters={activeFilters}
      />
      {/* <SystemCards data={systemData} /> */}
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
      <UnallottedCard 
        onCardClick={handleCardClick}
        activeFilters={activeFilters}
        filterRequest={filterRequest}
      />
     

      {/* ── Charts Row ── */}
      {/* <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '20px' }}>
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
      </div> */}

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

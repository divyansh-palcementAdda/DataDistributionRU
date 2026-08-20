import React, { useMemo, useState, useEffect } from 'react';
import { leads, followups, statusConfig } from '../../mockData';
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

  // Filter leads allotted to this caller
  const myLeads = useMemo(() => {
    return leads.filter(lead => lead.counselor === currentCaller);
  }, [leads, currentCaller]);

  // Filter follow-ups for this caller
  const myFollowups = useMemo(() => {
    return followups.filter(f => f.counselor === currentCaller);
  }, [followups, currentCaller]);

  // Data for reusable cards
  const systemCardsData = useMemo(() => {
    return {
      totalDataInSystem: myLeads.length,
      totalSourceOfData: [...new Set(myLeads.map(l => l.source?.name))].length,
    };
  }, [myLeads]);

  const calculatedStatCards = useMemo(() => {
    const allotted = myLeads.length;
    const connected = myLeads.filter(l => l.status === 'connected').length;
    const registered = myLeads.filter(l => l.status === 'registered').length;
    const pendingFollowups = myFollowups.filter(f => f.status === 'today').length;

    return statCards.map(card => {
      switch (card.label) {
        case 'Allotted to Me': return { ...card, value: allotted.toLocaleString() };
        case 'Connected': return { ...card, value: connected.toLocaleString() };
        case 'Registered': return { ...card, value: registered.toLocaleString() };
        case 'Pending Follow-ups': return { ...card, value: pendingFollowups.toLocaleString() };
        default: return card;
      }
    });
  }, [myLeads, myFollowups]);

  // Status distribution chart for caller's leads
  const statusChartData = useMemo(() => {
    const statusCounts = {};
    myLeads.forEach(lead => {
      const status = lead.status || 'raw';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
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
    { key: 'name', header: 'Lead Name', render: (value) => (typeof value === "object" && value !== null ? value?.name || value?.fullName || "—" : value || "—") },
    { key: 'phone', header: 'Phone', render: (value) => (typeof value === "object" && value !== null ? value?.phone || value?.mobileNo || "—" : value || "—") },
    { 
      key: 'course', 
      header: 'Course',
      render: (value) => value?.courseName || value || '—'
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => {
        const config = statusConfig[value] || { label: value, color: '#64748B' };
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
      render: (value) => value?.name || '—'
    },
    { 
      key: 'followup', 
      header: 'Follow-up',
      render: (value) => value || '—'
    },
  ];

  // Table columns for follow-ups
  const followupColumns = [
    { key: 'name', header: 'Lead Name', render: (value) => (typeof value === "object" && value !== null ? value?.name || value?.fullName || "—" : value || "—") },
    { 
      key: 'course', 
      header: 'Course',
      render: (value) => value?.courseName || value || '—'
    },
    { key: 'time', header: 'Scheduled Time', render: (value) => (typeof value === "object" && value !== null ? value?.time || "—" : value || "—") },
    { key: 'type', header: 'Type', render: (value) => (typeof value === "object" && value !== null ? value?.type || value?.name || "—" : value || "—") },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => {
        const isToday = value === 'today';
        const isMissed = value === 'missed';
        return (
          <span className="badge" style={{
            background: isToday ? 'var(--success-light)' : 'var(--danger-light)',
            color: isToday ? 'var(--success)' : 'var(--danger)',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600',
          }}>
            {isToday ? 'Today' : 'Missed'}
          </span>
        );
      }
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--gray-900)' }}>Caller Dashboard</h1>
          <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '4px' }}>
            Welcome back,  Here&apos;s your allotment overview.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Today
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stat-grid">
        {calculatedStatCards.map((card) => (
          <div key={card.label} className={`stat-card ${card.color}`}>
            <div className="stat-label">{card.label}</div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-icon" style={{ background: card.iconBg }}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── Reusable Dashboard Cards ── */}
      <LeadCards />
      <LeadSource data={leadSourceData} />
      <SystemCards data={systemCardsData} />
      <CategorywiseCard />
      <BoardWiseCard data={boardWiseData} />
      <GradWiseCard data={gradWiseData} />

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
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

        {/* Performance Summary */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Performance Summary</div>
          </div>
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ textAlign: 'center', padding: '16px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>
                  {myLeads.length > 0 ? Math.round((myLeads.filter(l => l.status === 'connected').length / myLeads.length) * 100) : 0}%
                </div>
                <div style={{ fontSize: '12px', color: 'var(--gray-600)', marginTop: '4px' }}>Connection Rate</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--success)' }}>
                  {myLeads.length > 0 ? Math.round((myLeads.filter(l => l.status === 'registered').length / myLeads.length) * 100) : 0}%
                </div>
                <div style={{ fontSize: '12px', color: 'var(--gray-600)', marginTop: '4px' }}>Conversion Rate</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--warning)' }}>
                  {myFollowups.filter(f => f.status === 'today').length}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--gray-600)', marginTop: '4px' }}>Today's Follow-ups</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--danger)' }}>
                  {myFollowups.filter(f => f.status === 'missed').length}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--gray-600)', marginTop: '4px' }}>Missed Follow-ups</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Today's Follow-ups Table ── */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <div className="card-title">Today's Follow-ups</div>
          <span className="badge badge-warning">{myFollowups.filter(f => f.status === 'today').length} pending</span>
        </div>
        <ReusableTable
          columns={followupColumns}
          data={myFollowups.filter(f => f.status === 'today')}
          emptyMessage="No follow-ups scheduled for today"
        />
      </div>

      {/* ── My Allotted Leads Table ── */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">My Allotted Leads</div>
          <span className="badge badge-primary">{myLeads.length} leads</span>
        </div>
        <ReusableTable
          columns={leadColumns}
          data={myLeads}
          onView={(lead) => navTo('lead-detail', { id: lead.id })}
        />
      </div>
    </div>
  );
};

export default CallersDashboard;
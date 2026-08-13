import React, { useMemo, useState } from 'react';
import { leads, counselors, statusConfig } from '../../mockData';
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

  // Mock: Leads allotted to Head (simulated by filtering leads without caller allotment)
  const headAllottedLeads = useMemo(() => {
    return leads.filter(lead => !lead.counselor || lead.counselor === 'Head');
  }, [leads]);

  // Mock: Leads allotted to callers
  const callerAllottedLeads = useMemo(() => {
    return leads.filter(lead => lead.counselor && lead.counselor !== 'Head');
  }, [leads]);

  const calculatedStatCards = useMemo(() => {
    const allottedToMe = headAllottedLeads.length;
    const allottedToCallers = callerAllottedLeads.length;
    const notAllotted = leads.filter(l => !l.counselor).length;
    const registered = leads.filter(l => l.status === 'registered').length;

    return statCards.map(card => {
      switch (card.label) {
        case 'Allotted to Me': return { ...card, value: allottedToMe.toLocaleString() };
        case 'Allotted to Callers': return { ...card, value: allottedToCallers.toLocaleString() };
        case 'Not Allotted': return { ...card, value: notAllotted.toLocaleString() };
        case 'Registered': return { ...card, value: registered.toLocaleString() };
        default: return card;
      }
    });
  }, [headAllottedLeads, callerAllottedLeads, leads]);

  // Status distribution chart for Head's leads
  const statusChartData = useMemo(() => {
    const statusCounts = {};
    headAllottedLeads.forEach(lead => {
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
    { key: 'name', header: 'Lead Name' },
    { key: 'phone', header: 'Phone' },
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
    { key: 'city', header: 'City' },
  ];

  // Table columns for caller performance
  const callerColumns = [
    { key: 'name', header: 'Caller Name' },
    { 
      key: 'allotted', 
      header: 'Allotted',
      render: (value) => value.toLocaleString()
    },
    { 
      key: 'connected', 
      header: 'Connected',
      render: (value) => value.toLocaleString()
    },
    { 
      key: 'registered', 
      header: 'Registered',
      render: (value) => value.toLocaleString()
    },
    { 
      key: 'pending', 
      header: 'Pending',
      render: (value) => value.toLocaleString()
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
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setAllotModalOpen(true)}
            disabled={selectedLeads.length === 0}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            Allot to Caller ({selectedLeads.length})
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

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
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

        {/* Caller Overview */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Caller Overview</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navTo('counselors')}>View All</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {counselors.slice(0, 5).map((c) => {
              const convPct = Math.round((c.registered / c.allotted) * 100);
              return (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    className="avatar"
                    style={{ background: c.color, flexShrink: 0 }}
                  >
                    {c.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-800)' }}>{c.name}</span>
                      <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{c.registered} reg · {convPct}%</span>
                    </div>
                    <div style={{ height: '5px', background: 'var(--gray-100)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${convPct}%`, background: c.color, borderRadius: '99px', transition: 'width .4s' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Leads Allotted to Head Table ── */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <div className="card-title">Leads Allotted to You</div>
          <span className="badge badge-primary">{headAllottedLeads.length} leads</span>
        </div>
        <ReusableTable
          columns={leadColumns}
          data={headAllottedLeads}
          onView={(lead) => navTo('lead-detail', { id: lead.id })}
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
                  {counselors.map(c => (
                    <option key={c.name} value={c.name}>{c.name} ({c.pending} pending)</option>
                  ))}
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
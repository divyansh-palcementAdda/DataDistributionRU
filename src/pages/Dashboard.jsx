import { useAppContext } from '../AppContext';
import { leads, counselors, followups, funnelData, statusConfig } from '../mockData';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

/* ── Stat Cards data ── */
const statCards = [
  {
    color: 'blue',
    label: 'Total Leads',
    value: '2,847',
    change: '+12.5% this month',
    changeColor: 'var(--success)',
    up: true,
    iconBg: 'var(--primary-light)',
    iconStroke: 'var(--primary)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    color: 'green',
    label: 'Connected',
    value: '1,624',
    change: '+8.2% this month',
    changeColor: 'var(--success)',
    up: true,
    iconBg: 'var(--success-light)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.9"/>
      </svg>
    ),
  },
  {
    color: 'orange',
    label: 'Hot Leads',
    value: '387',
    change: '+24.1% this month',
    changeColor: 'var(--warning)',
    up: true,
    iconBg: '#FFF7ED',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
        <path d="M12 8v4l3 3"/>
      </svg>
    ),
  },
  {
    color: 'gray',
    label: 'Cold Leads',
    value: '512',
    change: '-3.8% this month',
    changeColor: 'var(--danger)',
    up: false,
    iconBg: 'var(--gray-100)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-500)" strokeWidth="2">
        <path d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      </svg>
    ),
  },
  {
    color: 'green',
    label: 'Registrations',
    value: '342',
    change: '+18.6% this month',
    changeColor: 'var(--success)',
    up: true,
    iconBg: 'var(--success-light)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
  },
  {
    color: 'red',
    label: 'Bad Leads',
    value: '147',
    change: '+2.1% this month',
    changeColor: 'var(--danger)',
    up: false,
    iconBg: 'var(--danger-light)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
  },
];

/* ── Arrow icons ── */
const ArrowUp = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);
const ArrowDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

/* ── Monthly Bar Chart data ── */
const monthlyChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Registrations',
      data: [28, 35, 42, 38, 55, 62, 0, 0, 0, 0, 0, 0],
      backgroundColor: '#2563EB',
      borderRadius: 6,
      borderSkipped: false,
    },
  ],
};

const monthlyChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 11 } } },
  },
};

/* ── Status Doughnut Chart data ── */
const statusChartData = {
  labels: ['Raw', 'Connected', 'Interested', 'Hot', 'Registered', 'Cold', 'Not Interested', 'Bad'],
  datasets: [
    {
      data: [425, 1624, 876, 387, 342, 512, 134, 147],
      backgroundColor: [
        '#64748B', '#2563EB', '#0891B2', '#EA580C',
        '#22C55E', '#0369A1', '#BE123C', '#991B1B',
      ],
      borderWidth: 0,
      hoverOffset: 6,
    },
  ],
};

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

/* ── Recent leads (last 20 from mockData) ── */
const recentLeads = leads.slice(0, 20);

/* ── Today's followups ── */
const todayFollowups = followups.filter((f) => f.status === 'today');

const Dashboard = () => {
  const { openAddLeadModal, navTo } = useAppContext();

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--gray-900)' }}>Dashboard</h1>
          <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '4px' }}>
            Good morning, Arjun! Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            Jun 2025
          </button>
          <button
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={openAddLeadModal}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Lead
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stat-grid">
        {statCards.map((card) => (
          <div key={card.label} className={`stat-card ${card.color}`}>
            <div className="stat-label">{card.label}</div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-change" style={{ color: card.changeColor }}>
              {card.up ? <ArrowUp /> : <ArrowDown />}
              {card.change}
            </div>
            <div className="stat-icon" style={{ background: card.iconBg }}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        {/* Monthly Bar Chart — spans 2 cols */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Monthly Registrations</div>
              <div className="card-sub">Registrations per month in 2025</div>
            </div>
            <button className="btn btn-ghost btn-sm">Export</button>
          </div>
          <div style={{ height: '220px' }}>
            <Bar data={monthlyChartData} options={monthlyChartOptions} />
          </div>
        </div>

        {/* Status Doughnut Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Lead Status</div>
              <div className="card-sub">Current distribution</div>
            </div>
          </div>
          <div style={{ height: '220px' }}>
            <Doughnut data={statusChartData} options={statusChartOptions} />
          </div>
        </div>
      </div>

      {/* ── Counselor Performance + Follow-Ups Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        {/* Counselor Performance */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Counselor Performance</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navTo('counselors')}>View All</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {counselors.slice(0, 5).map((c) => {
              const convPct = Math.round((c.registered / c.assigned) * 100);
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

        {/* Upcoming Follow-Ups */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Upcoming Follow-Ups</div>
            <span className="badge badge-pending">{todayFollowups.length} Today</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {todayFollowups.map((f, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: f.urgent ? 'var(--warning-light)' : 'var(--gray-50)',
                  border: `1px solid ${f.urgent ? '#FDE68A' : 'var(--gray-200)'}`,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-800)' }}>{f.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '2px' }}>
                    {f.course} · {f.type} · {f.time}
                  </div>
                </div>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '20px',
                  background: f.urgent ? '#FEF3C7' : 'var(--gray-100)',
                  color: f.urgent ? '#B45309' : 'var(--gray-600)',
                }}>
                  {f.urgent ? 'Urgent' : f.counselor.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Lead Activity Table ── */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Recent Lead Activity</div>
            <div className="card-sub">Last 20 updates across all counselors</div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navTo('leads')}
          >
            View All Leads
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Lead Name</th>
                <th>Status</th>
                <th>Course</th>
                <th>Counselor</th>
                <th>Last Activity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((lead) => {
                const sc = statusConfig[lead.status];
                return (
                  <tr key={lead.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{lead.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{lead.phone}</div>
                    </td>
                    <td>
                      <span className={`badge ${sc?.cls}`}>{sc?.label}</span>
                    </td>
                    <td style={{ color: 'var(--gray-700)' }}>{lead.course}</td>
                    <td style={{ color: 'var(--gray-700)' }}>{lead.counselor}</td>
                    <td style={{ color: 'var(--gray-500)', fontSize: '12px' }}>
                      Follow-up: {lead.followup}
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: '12px' }}
                        onClick={() => navTo('lead-detail')}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

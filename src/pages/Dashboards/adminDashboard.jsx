import React, { useMemo } from 'react';
import { leads, counselors, followups, funnelData, statusConfig } from '../../mockData';
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
import { Bar, Doughnut } from 'react-chartjs-2';
import ReusableTable from '../../component/reusable/table';
import LeadCards from '../../component/reusable/DashBoards/leadCards';
import LeadSource from '../../component/reusable/DashBoards/leadSource';
import SystemCards from '../../component/reusable/DashBoards/SystemCards';
import CategorywiseCard from '../../component/reusable/DashBoards/categorywiseCard';
import BoardWiseCard from '../../component/reusable/DashBoards/BoardWiseCard';
import GradWiseCard from '../../component/reusable/DashBoards/gradWiseCard';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

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
  labels: ['Raw', 'Connected', 'Interested', 'Registered', 'Not Interested', 'Bad'],
  datasets: [
    {
      data: [425, 1624, 876, 342, 134, 147],
      backgroundColor: [
        '#64748B', '#2563EB', '#0891B2',
        '#22C55E', '#BE123C', '#991B1B',
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

  // Calculate data for LeadCards
  const leadCardsData = useMemo(() => {
    return {
      rowData: leads.length,
      totalAllotted: leads.filter(l => l.assignedTo && l.assignedTo !== '').length,
      totalUnallotted: leads.filter(l => !l.assignedTo || l.assignedTo === '').length,
      totalAvailed: leads.filter(l => l.status === 'registered').length,
      connected: leads.filter(l => l.status === 'connected').length,
      interested: leads.filter(l => l.status === 'interested').length,
      notInterested: leads.filter(l => l.status === 'notinterested').length,
      formFollowUp: leads.filter(l => l.status === 'formfollowup' || l.status === 'FORMFOLLOWUP').length,
      counselingFollowUp: leads.filter(l => l.status === 'counselingfollowup').length,
      registered: leads.filter(l => l.status === 'registered').length,
      formNotInterested: leads.filter(l => l.status === 'formnotinterested').length,
      continueFormFollowUp: leads.filter(l => l.status === 'continueformfollowup').length,
      counselingFollowUp2: leads.filter(l => l.status === 'counselingfollowup2').length,
      continuesCounselingFollowUp: leads.filter(l => l.status === 'continuescounselingfollowup').length,
      interestedFollowUp: leads.filter(l => l.status === 'interestedfollowup').length,
      counselingToFormFollowUp: leads.filter(l => l.status === 'counselingtoformfollowup').length,
      notInterestedAfterCounseling: leads.filter(l => l.status === 'notinterestedaftercounseling').length,
      goesToFormFollowUpAfterCounseling: leads.filter(l => l.status === 'goestoformfollowupaftercounseling').length,
      badData: leads.filter(l => l.status === 'bad' || l.status === 'baddata').length,
      notConnected: leads.filter(l => l.status === 'notconnected').length,
      firstNotConnected: leads.filter(l => l.status === 'firstcall' || l.status === 'FIRSTCALL').length,
      secondNotConnected: leads.filter(l => l.status === 'secondcall' || l.status === 'SECONDCALL').length,
      thirdNotConnected: leads.filter(l => l.status === 'thirdcall' || l.status === 'THIRDCALL').length,
      fourthNotConnected: leads.filter(l => l.status === 'fourthcall' || l.status === 'FOURTHCALL').length,
      finallyNotConnected: leads.filter(l => l.status === 'finallynotconnected').length,
    };
  }, [leads]);

  // Calculate data for LeadSource
  const leadSourceData = useMemo(() => {
    return {
      totalConsultantData: leads.filter(l => l.source === 'consultant').length,
      totalInboundData: leads.filter(l => l.source === 'inbound').length,
      totalOutboundData: leads.filter(l => l.source === 'outbound').length,
    };
  }, [leads]);

  // Calculate data for SystemCards
  const systemCardsData = useMemo(() => {
    return {
      totalDataInSystem: leads.length,
      totalSourceOfData: 3, // consultant, inbound, outbound
    };
  }, [leads]);

  // Calculate data for CategorywiseCard
  const categorywiseData = useMemo(() => {
    return {
      ugData: leads.filter(l => l.category === 'UG').length,
      pgData: leads.filter(l => l.category === 'PG').length,
      unMappedByDate: leads.filter(l => !l.category || l.category === '').length,
    };
  }, [leads]);

  // Calculate data for BoardWiseCard
  const boardWiseData = useMemo(() => {
    return {
      cbseData: leads.filter(l => l.board === 'CBSE').length,
      mpBoardData: leads.filter(l => l.board === 'MP Board').length,
      otherBoard: leads.filter(l => l.board !== 'CBSE' && l.board !== 'MP Board').length,
    };
  }, [leads]);

  // Calculate data for GradWiseCard
  const gradWiseData = useMemo(() => {
    return {
      aGradData: leads.filter(l => l.grade === 'A').length,
      bGradData: leads.filter(l => l.grade === 'B').length,
      cGradData: leads.filter(l => l.grade === 'C').length,
    };
  }, [leads]);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', background: 'linear-gradient(135deg, #435fff, #a571ff)', padding: '20px', borderRadius: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff' }}>   Welcome to Dashboard </h1>
          <p style={{ fontSize: '13px', color: '#e0e7ff', marginTop: '4px' }}>
            Good morning, Arjun! Here&apos;s what&apos;s happening today.
          </p>
        </div>
     
      </div>

      {/* ── Main Content Layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px', marginBottom: '20px' }}>
        {/* Left Column: Metrics and Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            flex: '1 1 auto'
          }}>
            <div style={{ 
              display: 'flex', 
              gap: '16px',
              width: '100%',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {/* Card 1: Total Counsellors Logged Today */}
              <div style={{ 
                background: '#ffffff2e',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '10px',
                padding: '10px 12px',
                minWidth: '140px',
                flex: '1',
                maxWidth: '180px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: '.3s ease',
                minWidth: '0',
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
                  {counselors.filter(c => c.pending > 0).length}
                </div>
              </div>

              {/* Card 2: Total Follow-up Scheduled Today */}
              <div style={{ 
                background: '#ffffff2e',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '10px',
                padding: '10px 12px',
                minWidth: '140px',
                flex: '1',
                maxWidth: '180px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: '.3s ease',
                minWidth: '0',
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
                  {todayFollowups.length}
                </div>
              </div>

              {/* Card 3: Total Counsellors Currently Working */}
              <div style={{ 
                background: '#ffffff2e',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '10px',
                padding: '10px 12px',
                minWidth: '140px',
                flex: '1',
                maxWidth: '180px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: '.3s ease',
                minWidth: '0',
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
                  {counselors.filter(c => c.followupsDone > 0).length}
                </div>
              </div>

              {/* Card 4: Conversation Ratio */}
              <div style={{ 
                background: '#ffffff2e',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '10px',
                padding: '10px 12px',
                minWidth: '140px',
                flex: '1',
                maxWidth: '180px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: '.3s ease',
                minWidth: '0',
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
                  {leads.length > 0 ? Math.round((leads.filter(l => l.status === 'connected').length / leads.length) * 100) : 0}%
                </div>
              </div>

              {/* Card 5: Total Data in System */}
              <div style={{ 
                background: '#ffffff2e',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '10px',
                padding: '10px 12px',
                minWidth: '140px',
                flex: '1',
                maxWidth: '180px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: '.3s ease',
                minWidth: '0',
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
                  {leads.length}
                </div>
              </div>
            </div>
          </div>

          {/* ── Reusable Dashboard Cards ── */}
          <LeadCards data={leadCardsData} />
          <LeadSource data={leadSourceData} />
          <SystemCards data={systemCardsData} />
          <CategorywiseCard data={categorywiseData} />
          <BoardWiseCard data={boardWiseData} />
          <GradWiseCard data={gradWiseData} />
        </div>

        {/* Right Column: Recent Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* ── Recent Activity Card ── */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e2e8f0',
            height: 'fit-content'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1e293b',
                margin: 0
              }}>
                Recent Activity
              </h3>
              <button style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '12px',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'background 0.2s'
              }}>
                View All
              </button>
            </div>

            {/* Activity List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Activity Item 1 */}
              <div style={{
                display: 'flex',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                background: '#f8fafc',
                transition: 'background 0.2s'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                  }}>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      New Lead Added
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: '#64748b'
                    }}>
                      4 mins ago
                    </span>
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: '#64748b',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    New lead added: Abhay Ahirwar from Inbound source - Status: Raw
                  </p>
                </div>
              </div>

              {/* Activity Item 2 */}
              <div style={{
                display: 'flex',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                background: '#f8fafc',
                transition: 'background 0.2s'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                  }}>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      Lead Status Updated
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: '#64748b'
                    }}>
                      6 mins ago
                    </span>
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: '#64748b',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    Rahul Sharma status changed from Connected to Interested
                  </p>
                </div>
              </div>

              {/* Activity Item 3 */}
              <div style={{
                display: 'flex',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                background: '#f8fafc',
                transition: 'background 0.2s'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                  }}>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      Follow-up Scheduled
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: '#64748b'
                    }}>
                      12 mins ago
                    </span>
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: '#64748b',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    Follow-up scheduled for Priya Singh tomorrow at 10:00 AM
                  </p>
                </div>
              </div>

              {/* Activity Item 4 */}
              <div style={{
                display: 'flex',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                background: '#f8fafc',
                transition: 'background 0.2s'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                  }}>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      Lead Assigned
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: '#64748b'
                    }}>
                      18 mins ago
                    </span>
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: '#64748b',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    Vikram Patel assigned to counselor Amit Kumar
                  </p>
                </div>
              </div>

              {/* Activity Item 5 */}
              <div style={{
                display: 'flex',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                background: '#f8fafc',
                transition: 'background 0.2s'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                  }}>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      Lead Registered
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: '#64748b'
                    }}>
                      25 mins ago
                    </span>
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: '#64748b',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    Suresh Kumar successfully registered for B.Tech program
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
    </div>
  );
};

export default Dashboard;

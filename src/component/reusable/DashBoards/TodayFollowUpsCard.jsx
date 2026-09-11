import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTodayFollowUpsCount } from '../../../Services/cards/cardService';
import { usePermissions } from '../../../PermissionContext';

const CalendarClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <polyline points="12 14 12 17 14 17" />
  </svg>
);

const TodayFollowUpsCard = ({ data, onCardClick, activeFilters = [], filterRequest = {}, courseTypeId, leadSourceId, boardId, gradeId, counselorId, departmentId, statusId }) => {
  const [followUpData, setFollowUpData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    if (data !== undefined) {
      setFollowUpData(data);
      return;
    }

    const fetchTodayFollowUps = async () => {
      try {
        setLoading(true);
        const params = {};
        if (courseTypeId) params.courseTypeId = courseTypeId;
        if (leadSourceId) params.leadSourceId = leadSourceId;
        if (boardId) params.boardId = boardId;
        if (gradeId) params.gradeId = gradeId;
        if (counselorId) params.counselorId = counselorId;
        if (departmentId) params.departmentId = departmentId;
        if (statusId) params.statusId = statusId;

        const finalParams = { ...params, ...filterRequest };

        const response = await getTodayFollowUpsCount(finalParams);
        const payload = response?.data?.data ?? response?.data ?? response;
        setFollowUpData(payload);
      } catch (error) {
        console.error('Error fetching today follow-ups count:', error);
        setFollowUpData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayFollowUps();
  }, [data, filterRequest, courseTypeId, leadSourceId, boardId, gradeId, counselorId, departmentId, statusId]);

  if (!hasPermission('DASHBOARD_CARD_TOTAL_FOLLOWUPS_TODAY')) {
    return null;
  }

  const count = followUpData?.count ?? 0;
  const type = "Today's Follow-ups";
  const isSelected = activeFilters.some(f => f.type === 'todayFollowUps');

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: isSelected
      ? '0 0 0 2px #6366f1, 0 4px 16px rgba(99,102,241,0.18)'
      : '0 2px 8px rgba(0,0,0,0.08)',
    border: isSelected ? '2px solid #6366f1' : '1px solid #e5e7eb',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    height: '100px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const iconContainerStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: '1.3',
    flex: 1,
  };

  const countStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    flexShrink: 0,
    marginLeft: '12px',
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    if (!isSelected) e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    if (!isSelected) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
  };

  const handleClick = () => {
    if (onCardClick) {
      onCardClick({ type: 'todayFollowUps', value: true, label: "Today's Follow-ups" });
    } else {
      navigate('/followups', { state: { activeTab: 'TODAY' } });
    }
  };

  return (
    <>
      {loading ? (
        <div style={{
          background: '#ffffff', borderRadius: '12px', padding: '40px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#94a3b8' }}>Loading...</div>
        </div>
      ) : (
        <div
          className="today-followup-card-item"
          onClick={handleClick}
          style={cardStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          title="Scheduled follow-ups for today"
        >
          {/* Active indicator badge */}
          {isSelected && (
            <div style={{
              position: 'absolute', top: '6px', right: '6px',
              background: '#6366f1', borderRadius: '50%',
              width: '18px', height: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
            <div className="today-followup-icon-container" style={iconContainerStyle}>
              <div className="today-followup-icon" style={{ color: '#2563EB' }}>
                <CalendarClockIcon />
              </div>
            </div>
            <div className="today-followup-label" style={labelStyle}>
              {type}
            </div>
          </div>

          <div className="today-followup-count" style={countStyle}>
            {count.toLocaleString()}
          </div>
        </div>
      )}
      <style>{`
        @media (max-width: 1024px) {
          .today-followup-card-item {
            height: 95px !important;
            padding: 14px !important;
          }
        }

        @media (max-width: 768px) {
          .today-followup-card-item {
            height: 90px !important;
            padding: 12px !important;
            border-radius: 10px !important;
          }
        }

        @media (max-width: 480px) {
          .today-followup-card-item {
            height: 85px !important;
            padding: 10px !important;
            border-radius: 8px !important;
          }
        }

        @media (max-width: 360px) {
          .today-followup-card-item {
            height: 80px !important;
            padding: 8px !important;
            border-radius: 8px !important;
          }
        }

        @media (max-width: 1024px) {
          .today-followup-icon-container {
            width: 36px !important;
            height: 36px !important;
            border-radius: 8px !important;
          }
        }

        @media (max-width: 768px) {
          .today-followup-icon-container {
            width: 32px !important;
            height: 32px !important;
            border-radius: 7px !important;
          }
        }

        @media (max-width: 480px) {
          .today-followup-icon-container {
            width: 28px !important;
            height: 28px !important;
            border-radius: 6px !important;
          }
        }

        @media (max-width: 360px) {
          .today-followup-icon-container {
            width: 24px !important;
            height: 24px !important;
            border-radius: 5px !important;
          }
        }
      `}</style>
    </>
  );
};

export default TodayFollowUpsCard;

import React, { useEffect, useState } from 'react';
import { getRegistrationRejectedCount } from '../../../Services/cards/cardService';
import { usePermissions } from '../../../PermissionContext';

const RejectedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const RegistrationRejectedCard = ({
  data,
  onCardClick,
  activeFilters = [],
  filterRequest = {},
  courseTypeId,
  leadSourceId,
  boardId,
  gradeId,
  assignedUserIds,
  departmentId,
  statusId,
  courseId
}) => {
  const [rejectedData, setRejectedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { hasPermission } = usePermissions();

  const filterRequestKey = JSON.stringify(filterRequest);

  useEffect(() => {
    if (data !== undefined) {
      setRejectedData(data);
      return;
    }

    let isCancelled = false;
    const fetchRejectedCount = async () => {
      try {
        setLoading(true);
        const params = {};
        if (courseTypeId) params.courseTypeId = courseTypeId;
        if (leadSourceId) params.leadSourceId = leadSourceId;
        if (boardId) params.boardId = boardId;
        if (gradeId) params.gradeId = gradeId;
        if (assignedUserIds) params.assignedUserIds = assignedUserIds;
        if (departmentId) params.departmentId = departmentId;
        if (statusId) params.statusId = statusId;
        if (courseId) params.courseId = courseId;

        const finalParams = { ...params, ...filterRequest };

        const response = await getRegistrationRejectedCount(finalParams);
        if (!isCancelled) {
          const payload = response?.data?.data ?? response?.data ?? response;
          setRejectedData(payload);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching registration rejected count:', error);
          setRejectedData(null);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchRejectedCount();
    return () => {
      isCancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, filterRequestKey, courseTypeId, leadSourceId, boardId, gradeId, assignedUserIds, departmentId, statusId, courseId]);

  const count = rejectedData?.count ?? 0;
  const isSelected = activeFilters.some(
    f => f.type === 'registrationRejected' || (f.type === 'registrationStatus' && f.value === 'CHECK_REJECTED')
  );

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: isSelected
      ? '0 0 0 2px #e11d48, 0 4px 16px rgba(225,29,72,0.18)'
      : '0 2px 8px rgba(0,0,0,0.08)',
    border: isSelected ? '2px solid #e11d48' : '1px solid #e5e7eb',
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
    background: '#fff1f2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: '#e11d48',
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
    color: '#e11d48',
    flexShrink: 0,
    marginLeft: '12px',
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    if (!isSelected) e.currentTarget.style.boxShadow = '0 8px 24px rgba(225,29,72,0.14)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    if (!isSelected) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
  };

  return (
    <>
      {loading ? (
        <div style={{
          background: '#ffffff', borderRadius: '12px', padding: '40px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
          height: '100px'
        }}>
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-rose-500" />
          <span style={{ fontSize: '14px', color: '#64748b' }}>Loading...</span>
        </div>
      ) : (
        <div
          className="registration-rejected-card-item"
          onClick={() => onCardClick && onCardClick({ type: 'registrationRejected', value: 'CHECK_REJECTED', label: 'Reg Check Rejected' })}
          style={cardStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          title="Click to filter leads with Registration Check Rejected"
        >
          {isSelected && (
            <div style={{
              position: 'absolute', top: '6px', right: '6px',
              background: '#e11d48', borderRadius: '50%',
              width: '18px', height: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
            <div style={iconContainerStyle}>
              <RejectedIcon />
            </div>
            <div style={labelStyle}>
              Reg Check Rejected
            </div>
          </div>

          <div style={countStyle}>
            {count.toLocaleString()}
          </div>
        </div>
      )}
      <style>{`
        @media (max-width: 1024px) {
          .registration-rejected-card-item {
            height: 95px !important;
            padding: 14px !important;
          }
        }
        @media (max-width: 768px) {
          .registration-rejected-card-item {
            height: 90px !important;
            padding: 12px !important;
            border-radius: 10px !important;
          }
        }
        @media (max-width: 480px) {
          .registration-rejected-card-item {
            height: 85px !important;
            padding: 10px !important;
            border-radius: 8px !important;
          }
        }
      `}</style>
    </>
  );
};

export default RegistrationRejectedCard;

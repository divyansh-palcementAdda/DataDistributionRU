import React, { useEffect, useState } from 'react';
import { getUnallottedCount } from '../../../Services/cards/cardService';

const UnallottedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
);

const UnallottedCard = ({ data, onCardClick, activeFilters = [], filterRequest = {}, courseTypeId, leadSourceId, boardId, gradeId, assignedUserIds, departmentId, statusId }) => {
  const [unallottedData, setUnallottedData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check if user is Super Admin or Admin
  const userRole = localStorage.getItem('userRole');
  const isAdminOrSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

  // Don't render the card if user is not Super Admin or Admin
  if (!isAdminOrSuperAdmin) {
    return null;
  }

  useEffect(() => {
    if (data !== undefined) {
      setUnallottedData(data);
      return;
    }

    const fetchUnallottedCount = async () => {
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
        
        // Merge with filterRequest if provided
        const finalParams = { ...params, ...filterRequest };
        
        const response = await getUnallottedCount(finalParams);
        const payload = response?.data?.data ?? response?.data ?? response;
        setUnallottedData(payload);
      } catch (error) {
        console.error('Error fetching unallotted count:', error);
        setUnallottedData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUnallottedCount();
  }, [data, filterRequest, courseTypeId, leadSourceId, boardId, gradeId, assignedUserIds, departmentId, statusId]);

  const count = unallottedData?.count ?? 0;
  const type = unallottedData?.type ?? 'Unallotted';
  const isSelected = activeFilters.some(f => f.type === 'unallotted');

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
    background: 'var(--primary-light)',
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
          className="unallotted-card-item"
          onClick={() => onCardClick && onCardClick({ type: 'unallotted', value: true, label: 'Unallotted' })}
          style={cardStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
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
            <div className="unallotted-icon-container" style={iconContainerStyle}>
              <div className="unallotted-icon" style={{ color: 'var(--primary)' }}><UnallottedIcon /></div>
            </div>
            <div className="unallotted-label" style={labelStyle}>
              {type}
            </div>
          </div>

          <div className="unallotted-count" style={countStyle}>
            {count.toLocaleString()}
          </div>
        </div>
      )}
      <style>{`
        /* Unallotted Card Item Responsive */
        @media (max-width: 1024px) {
          .unallotted-card-item {
            height: 95px !important;
            padding: 14px !important;
          }
        }

        @media (max-width: 768px) {
          .unallotted-card-item {
            height: 90px !important;
            padding: 12px !important;
            border-radius: 10px !important;
          }
        }

        @media (max-width: 480px) {
          .unallotted-card-item {
            height: 85px !important;
            padding: 10px !important;
            border-radius: 8px !important;
          }
        }

        @media (max-width: 360px) {
          .unallotted-card-item {
            height: 80px !important;
            padding: 8px !important;
            border-radius: 8px !important;
          }
        }

        /* Unallotted Icon Container Responsive */
        @media (max-width: 1024px) {
          .unallotted-icon-container {
            width: 36px !important;
            height: 36px !important;
            border-radius: 8px !important;
          }
        }

        @media (max-width: 768px) {
          .unallotted-icon-container {
            width: 32px !important;
            height: 32px !important;
            border-radius: 7px !important;
          }
        }

        @media (max-width: 480px) {
          .unallotted-icon-container {
            width: 28px !important;
            height: 28px !important;
            border-radius: 6px !important;
          }
        }

        @media (max-width: 360px) {
          .unallotted-icon-container {
            width: 24px !important;
            height: 24px !important;
            border-radius: 5px !important;
          }
        }

        /* Unallotted Icon Responsive */
        @media (max-width: 1024px) {
          .unallotted-icon svg {
            width: 18px !important;
            height: 18px !important;
          }
        }

        @media (max-width: 768px) {
          .unallotted-icon svg {
            width: 16px !important;
            height: 16px !important;
          }
        }

        @media (max-width: 480px) {
          .unallotted-icon svg {
            width: 14px !important;
            height: 14px !important;
          }
        }

        @media (max-width: 360px) {
          .unallotted-icon svg {
            width: 12px !important;
            height: 12px !important;
          }
        }

        /* Unallotted Label Responsive */
        @media (max-width: 1024px) {
          .unallotted-label {
            font-size: 13px !important;
          }
        }

        @media (max-width: 768px) {
          .unallotted-label {
            font-size: 12px !important;
          }
        }

        @media (max-width: 480px) {
          .unallotted-label {
            font-size: 11px !important;
          }
        }

        @media (max-width: 360px) {
          .unallotted-label {
            font-size: 10px !important;
          }
        }

        /* Unallotted Count Responsive */
        @media (max-width: 1024px) {
          .unallotted-count {
            font-size: 24px !important;
            margin-left: 10px !important;
          }
        }

        @media (max-width: 768px) {
          .unallotted-count {
            font-size: 22px !important;
            margin-left: 8px !important;
          }
        }

        @media (max-width: 480px) {
          .unallotted-count {
            font-size: 20px !important;
            margin-left: 6px !important;
          }
        }

        @media (max-width: 360px) {
          .unallotted-count {
            font-size: 18px !important;
            margin-left: 4px !important;
          }
        }
      `}</style>
    </>
  );
};

export default UnallottedCard;
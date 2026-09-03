import React, { useEffect, useState } from 'react';
import { getAllottedCount } from '../../../Services/cards/cardService';

const AllottedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const AllottedCard = ({ data, onCardClick, activeFilters = [], filterRequest = {}, courseTypeId, leadSourceId, boardId, gradeId, counselorId, departmentId, statusId }) => {
  const [allottedData, setAllottedData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data !== undefined) {
      setAllottedData(data);
      return;
    }

    const fetchAllottedCount = async () => {
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
        
        // Merge with filterRequest if provided
        const finalParams = { ...params, ...filterRequest };
        
        const response = await getAllottedCount(finalParams);
        const payload = response?.data?.data ?? response?.data ?? response;
        setAllottedData(payload);
      } catch (error) {
        console.error('Error fetching allotted count:', error);
        setAllottedData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAllottedCount();
  }, [data, filterRequest, courseTypeId, leadSourceId, boardId, gradeId, counselorId, departmentId, statusId]);

  const count = allottedData?.count ?? 0;
  const type = allottedData?.type ?? 'Allotted';
  const isSelected = activeFilters.some(f => f.type === 'allotted');

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
    background: '#FFF7ED',
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
          className="allotted-card-item"
          onClick={() => onCardClick && onCardClick({ type: 'allotted', value: true, label: 'Allotted' })}
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
            <div className="allotted-icon-container" style={iconContainerStyle}>
              <div className="allotted-icon" style={{ color: '#EA580C' }}><AllottedIcon /></div>
            </div>
            <div className="allotted-label" style={labelStyle}>
              {type}
            </div>
          </div>

          <div className="allotted-count" style={countStyle}>
            {count.toLocaleString()}
          </div>
        </div>
      )}
      <style>{`
        /* Allotted Card Item Responsive */
        @media (max-width: 1024px) {
          .allotted-card-item {
            height: 95px !important;
            padding: 14px !important;
          }
        }

        @media (max-width: 768px) {
          .allotted-card-item {
            height: 90px !important;
            padding: 12px !important;
            border-radius: 10px !important;
          }
        }

        @media (max-width: 480px) {
          .allotted-card-item {
            height: 85px !important;
            padding: 10px !important;
            border-radius: 8px !important;
          }
        }

        @media (max-width: 360px) {
          .allotted-card-item {
            height: 80px !important;
            padding: 8px !important;
            border-radius: 8px !important;
          }
        }

        /* Allotted Icon Container Responsive */
        @media (max-width: 1024px) {
          .allotted-icon-container {
            width: 36px !important;
            height: 36px !important;
            border-radius: 8px !important;
          }
        }

        @media (max-width: 768px) {
          .allotted-icon-container {
            width: 32px !important;
            height: 32px !important;
            border-radius: 7px !important;
          }
        }

        @media (max-width: 480px) {
          .allotted-icon-container {
            width: 28px !important;
            height: 28px !important;
            border-radius: 6px !important;
          }
        }

        @media (max-width: 360px) {
          .allotted-icon-container {
            width: 24px !important;
            height: 24px !important;
            border-radius: 5px !important;
          }
        }

        /* Allotted Icon Responsive */
        @media (max-width: 1024px) {
          .allotted-icon svg {
            width: 18px !important;
            height: 18px !important;
          }
        }

        @media (max-width: 768px) {
          .allotted-icon svg {
            width: 16px !important;
            height: 16px !important;
          }
        }

        @media (max-width: 480px) {
          .allotted-icon svg {
            width: 14px !important;
            height: 14px !important;
          }
        }

        @media (max-width: 360px) {
          .allotted-icon svg {
            width: 12px !important;
            height: 12px !important;
          }
        }

        /* Allotted Label Responsive */
        @media (max-width: 1024px) {
          .allotted-label {
            font-size: 13px !important;
          }
        }

        @media (max-width: 768px) {
          .allotted-label {
            font-size: 12px !important;
          }
        }

        @media (max-width: 480px) {
          .allotted-label {
            font-size: 11px !important;
          }
        }

        @media (max-width: 360px) {
          .allotted-label {
            font-size: 10px !important;
          }
        }

        /* Allotted Count Responsive */
        @media (max-width: 1024px) {
          .allotted-count {
            font-size: 24px !important;
            margin-left: 10px !important;
          }
        }

        @media (max-width: 768px) {
          .allotted-count {
            font-size: 22px !important;
            margin-left: 8px !important;
          }
        }

        @media (max-width: 480px) {
          .allotted-count {
            font-size: 20px !important;
            margin-left: 6px !important;
          }
        }

        @media (max-width: 360px) {
          .allotted-count {
            font-size: 18px !important;
            margin-left: 4px !important;
          }
        }
      `}</style>
    </>
  );
};

export default AllottedCard;
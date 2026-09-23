import React, { useEffect, useState } from 'react';
import { getMultiSourceCount } from '../../../Services/cards/cardService';
import { usePermissions } from '../../../PermissionContext';

const MultiSourceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const MultiSourceCard = ({ data, onCardClick, activeFilters = [], filterRequest = {}, courseTypeId, leadSourceId, boardId, gradeId, counselorId, departmentId, statusId }) => {
  const [multiSourceData, setMultiSourceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { hasPermission } = usePermissions();

  const filterRequestKey = JSON.stringify(filterRequest);

  useEffect(() => {
    if (!hasPermission('DASHBOARD_CARD_TOTAL_MULTI_SOURCE_DATA')) {
      return;
    }

    if (data !== undefined) {
      setMultiSourceData(data);
      return;
    }

    let isCancelled = false;
    const fetchMultiSourceCount = async () => {
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

        const response = await getMultiSourceCount(finalParams);
        if (!isCancelled) {
          const payload = response?.data?.data ?? response?.data ?? response;
          setMultiSourceData(payload);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching multi-source count:', error);
          setMultiSourceData(null);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchMultiSourceCount();
    return () => {
      isCancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, filterRequestKey, courseTypeId, leadSourceId, boardId, gradeId, counselorId, departmentId, statusId]);

  const count = multiSourceData?.count ?? 0;
  const isSelected = activeFilters.some(f => f.type === 'multiSource');

  if (!hasPermission('DASHBOARD_CARD_TOTAL_MULTI_SOURCE_DATA')) {
    return null;
  }

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: isSelected
      ? '0 0 0 2px #9333EA, 0 4px 16px rgba(147,51,234,0.18)'
      : '0 2px 8px rgba(0,0,0,0.08)',
    border: isSelected ? '2px solid #9333EA' : '1px solid #e5e7eb',
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
    background: '#F3E8FF',
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
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
        }}>
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-500" />
          <span style={{ fontSize: '14px', color: '#64748b' }}>Loading...</span>
        </div>
      ) : (
        <div
          className="multi-source-card-item"
          onClick={() => onCardClick && onCardClick({ type: 'multiSource', value: true, label: 'Multi Source' })}
          style={cardStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {isSelected && (
            <div style={{
              position: 'absolute', top: '6px', right: '6px',
              background: '#9333EA', borderRadius: '50%',
              width: '18px', height: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
            <div className="multi-source-icon-container" style={iconContainerStyle}>
              <div className="multi-source-icon" style={{ color: '#9333EA' }}><MultiSourceIcon /></div>
            </div>
            <div className="multi-source-label" style={labelStyle}>
              Multi Source Data
            </div>
          </div>

          <div className="multi-source-count" style={countStyle}>
            {count.toLocaleString()}
          </div>
        </div>
      )}
      <style>{`
        @media (max-width: 1024px) {
          .multi-source-card-item {
            height: 95px !important;
            padding: 14px !important;
          }
        }

        @media (max-width: 768px) {
          .multi-source-card-item {
            height: 90px !important;
            padding: 12px !important;
            border-radius: 10px !important;
          }
        }

        @media (max-width: 480px) {
          .multi-source-card-item {
            height: 85px !important;
            padding: 10px !important;
            border-radius: 8px !important;
          }
        }

        @media (max-width: 360px) {
          .multi-source-card-item {
            height: 80px !important;
            padding: 8px !important;
            border-radius: 8px !important;
          }
        }

        @media (max-width: 1024px) {
          .multi-source-icon-container {
            width: 36px !important;
            height: 36px !important;
            border-radius: 8px !important;
          }
        }

        @media (max-width: 768px) {
          .multi-source-icon-container {
            width: 32px !important;
            height: 32px !important;
            border-radius: 7px !important;
          }
        }

        @media (max-width: 480px) {
          .multi-source-icon-container {
            width: 28px !important;
            height: 28px !important;
            border-radius: 6px !important;
          }
        }

        @media (max-width: 360px) {
          .multi-source-icon-container {
            width: 24px !important;
            height: 24px !important;
            border-radius: 5px !important;
          }
        }

        @media (max-width: 1024px) {
          .multi-source-icon svg {
            width: 18px !important;
            height: 18px !important;
          }
        }

        @media (max-width: 768px) {
          .multi-source-icon svg {
            width: 16px !important;
            height: 16px !important;
          }
        }

        @media (max-width: 480px) {
          .multi-source-icon svg {
            width: 14px !important;
            height: 14px !important;
          }
        }

        @media (max-width: 360px) {
          .multi-source-icon svg {
            width: 12px !important;
            height: 12px !important;
          }
        }

        @media (max-width: 1024px) {
          .multi-source-label {
            font-size: 13px !important;
          }
        }

        @media (max-width: 768px) {
          .multi-source-label {
            font-size: 12px !important;
          }
        }

        @media (max-width: 480px) {
          .multi-source-label {
            font-size: 11px !important;
          }
        }

        @media (max-width: 360px) {
          .multi-source-label {
            font-size: 10px !important;
          }
        }

        @media (max-width: 1024px) {
          .multi-source-count {
            font-size: 24px !important;
            margin-left: 10px !important;
          }
        }

        @media (max-width: 768px) {
          .multi-source-count {
            font-size: 22px !important;
            margin-left: 8px !important;
          }
        }

        @media (max-width: 480px) {
          .multi-source-count {
            font-size: 20px !important;
            margin-left: 6px !important;
          }
        }

        @media (max-width: 360px) {
          .multi-source-count {
            font-size: 18px !important;
            margin-left: 4px !important;
          }
        }
      `}</style>
    </>
  );
};

export default MultiSourceCard;

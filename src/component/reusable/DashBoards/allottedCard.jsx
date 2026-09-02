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
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: '#FFF7ED', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <div style={{ color: '#EA580C' }}><AllottedIcon /></div>
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', lineHeight: '1.3', flex: 1 }}>
              {type}
            </div>
          </div>

          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', flexShrink: 0, marginLeft: '12px' }}>
            {count.toLocaleString()}
          </div>
        </div>
      )}
    </>
  );
};

export default AllottedCard;
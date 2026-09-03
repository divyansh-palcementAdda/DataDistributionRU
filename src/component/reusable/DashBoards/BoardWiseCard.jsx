import React, { useEffect, useState } from 'react';
import { getBoardBreakdown } from '../../../Services/cards/cardService';

const BoardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    <path d="M8 7h6M8 11h8M8 15h6" />
  </svg>
);

const COLORS = [
  { iconBg: 'var(--primary-light)', iconStroke: 'var(--primary)' },
  { iconBg: '#E0E7FF',              iconStroke: '#4F46E5' },
  { iconBg: '#F5F5F5',              iconStroke: '#9E9E9E' },
  { iconBg: 'var(--success-light)', iconStroke: 'var(--success)' },
  { iconBg: '#FFF7ED',              iconStroke: '#EA580C' },
  { iconBg: '#E0F2FE',              iconStroke: '#0284C7' },
  { iconBg: '#F3E8FF',              iconStroke: '#9333EA' },
  { iconBg: '#FEF9C3',              iconStroke: '#CA8A04' },
];

const BoardWiseCard = ({ data, onCardClick, activeFilters = [], courseTypeId, leadSourceId, boardId, gradeId, assignedUserIds, departmentId }) => {
  // API returns an array: [{id, name, code, count, percentage}, ...]
  const [boardData, setBoardData] = useState([]);

  useEffect(() => {
    if (data !== undefined) {
      const payload = data ?? [];
      setBoardData(Array.isArray(payload) ? payload : Object.values(payload));
      return;
    }

    const fetchBoardData = async () => {
      try {
        const params = {};
        if (courseTypeId) params.courseTypeId = courseTypeId;
        if (leadSourceId) params.leadSourceId = leadSourceId;
        if (boardId) params.boardId = boardId;
        if (gradeId) params.gradeId = gradeId;
        if (assignedUserIds) params.assignedUserIds = assignedUserIds;
        if (departmentId) params.departmentId = departmentId;
        
        const response = await getBoardBreakdown(params);
        const payload = response?.data?.data ?? response?.data ?? response ?? [];
        // Normalise: always store as an array
        setBoardData(Array.isArray(payload) ? payload : Object.values(payload));
      } catch (error) {
        console.error('Error fetching board breakdown:', error);
      }
    };

    fetchBoardData();
  }, [data, courseTypeId, leadSourceId, boardId, gradeId, assignedUserIds, departmentId]);

  // Accept both array (new) and object (legacy) formats
  const items = Array.isArray(boardData)
    ? boardData
    : Object.entries(boardData)
        .filter(([, val]) => val > 0)
        .map(([key, val]) => ({ id: key, code: key, name: key, count: val, percentage: 0 }));

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <h2 className="boardwise-title" style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
        Board Wise
      </h2>

      {items.length === 0 ? (
        <div style={{
          background: '#ffffff', borderRadius: '12px', padding: '40px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#94a3b8' }}>No Data Available</div>
        </div>
      ) : (
        <div className="boardwise-responsive-grid" style={gridStyle}>
          {items.map((item, index) => {
            const clr = COLORS[index % COLORS.length];
            const isSelected = activeFilters.some(f => f.type === 'board' && f.value === item.id);
            return (
              <div
                key={item.id || item.code}
                className="boardwise-card-item"
                onClick={() => onCardClick && onCardClick({ type: 'board', value: item.id, label: item.name })}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: isSelected
                    ? '0 0 0 2px #6366f1, 0 4px 16px rgba(99,102,241,0.18)'
                    : '0 2px 8px rgba(0,0,0,0.08)',
                  border: isSelected ? '2px solid #6366f1' : '1px solid #e5e7eb',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  height: '100px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div className="boardwise-icon-container" style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: clr.iconBg, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0,
                    }}>
                      <div className="boardwise-icon" style={{ color: clr.iconStroke }}><BoardIcon /></div>
                    </div>
                    <div className="boardwise-label" style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', lineHeight: '1.3', flex: 1 }}>
                      {item.name}
                    </div>
                  </div>
                  <div className="boardwise-count" style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', flexShrink: 0, marginLeft: '12px' }}>
                    {item.count !== undefined ? item.count.toLocaleString() : '0'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        /* Boardwise Container Responsive */
        @media (max-width: 1400px) {
          .boardwise-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)) !important;
            gap: 15px !important;
          }
        }

        @media (max-width: 1200px) {
          .boardwise-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important;
            gap: 14px !important;
          }
        }

        @media (max-width: 1024px) {
          .boardwise-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)) !important;
            gap: 13px !important;
          }
        }

        @media (max-width: 768px) {
          .boardwise-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
            gap: 12px !important;
          }
        }

        @media (max-width: 480px) {
          .boardwise-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important;
            gap: 10px !important;
          }
        }

        @media (max-width: 360px) {
          .boardwise-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)) !important;
            gap: 8px !important;
          }
        }

        /* Boardwise Card Item Responsive */
        @media (max-width: 1024px) {
          .boardwise-card-item {
            height: 95px !important;
            padding: 10px !important;
          }
        }

        @media (max-width: 768px) {
          .boardwise-card-item {
            height: 90px !important;
            padding: 8px !important;
            border-radius: 10px !important;
          }
        }

        @media (max-width: 480px) {
          .boardwise-card-item {
            height: 85px !important;
            padding: 6px !important;
            border-radius: 8px !important;
          }
        }

        @media (max-width: 360px) {
          .boardwise-card-item {
            height: 80px !important;
            padding: 5px !important;
            border-radius: 8px !important;
          }
        }

        /* Boardwise Icon Container Responsive */
        @media (max-width: 1024px) {
          .boardwise-icon-container {
            width: 36px !important;
            height: 36px !important;
            border-radius: 8px !important;
          }
        }

        @media (max-width: 768px) {
          .boardwise-icon-container {
            width: 32px !important;
            height: 32px !important;
            border-radius: 7px !important;
          }
        }

        @media (max-width: 480px) {
          .boardwise-icon-container {
            width: 28px !important;
            height: 28px !important;
            border-radius: 6px !important;
          }
        }

        @media (max-width: 360px) {
          .boardwise-icon-container {
            width: 24px !important;
            height: 24px !important;
            border-radius: 5px !important;
          }
        }

        /* Boardwise Icon Responsive */
        @media (max-width: 1024px) {
          .boardwise-icon svg {
            width: 18px !important;
            height: 18px !important;
          }
        }

        @media (max-width: 768px) {
          .boardwise-icon svg {
            width: 16px !important;
            height: 16px !important;
          }
        }

        @media (max-width: 480px) {
          .boardwise-icon svg {
            width: 14px !important;
            height: 14px !important;
          }
        }

        @media (max-width: 360px) {
          .boardwise-icon svg {
            width: 12px !important;
            height: 12px !important;
          }
        }

        /* Boardwise Label Responsive */
        @media (max-width: 1024px) {
          .boardwise-label {
            font-size: 13px !important;
          }
        }

        @media (max-width: 768px) {
          .boardwise-label {
            font-size: 12px !important;
          }
        }

        @media (max-width: 480px) {
          .boardwise-label {
            font-size: 11px !important;
          }
        }

        @media (max-width: 360px) {
          .boardwise-label {
            font-size: 10px !important;
          }
        }

        /* Boardwise Count Responsive */
        @media (max-width: 1024px) {
          .boardwise-count {
            font-size: 24px !important;
            margin-left: 10px !important;
          }
        }

        @media (max-width: 768px) {
          .boardwise-count {
            font-size: 22px !important;
            margin-left: 8px !important;
          }
        }

        @media (max-width: 480px) {
          .boardwise-count {
            font-size: 20px !important;
            margin-left: 6px !important;
          }
        }

        @media (max-width: 360px) {
          .boardwise-count {
            font-size: 18px !important;
            margin-left: 4px !important;
          }
        }

        /* Title Responsive */
        @media (max-width: 768px) {
          .boardwise-title {
            font-size: 18px !important;
            margin-bottom: 14px !important;
          }
        }

        @media (max-width: 480px) {
          .boardwise-title {
            font-size: 16px !important;
            margin-bottom: 12px !important;
          }
        }

        @media (max-width: 360px) {
          .boardwise-title {
            font-size: 14px !important;
            margin-bottom: 10px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BoardWiseCard;

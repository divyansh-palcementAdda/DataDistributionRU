import React, { useEffect, useState } from 'react';
import { getLeadSourceBreakdown } from '../../../Services/cards/cardService';

// Generic icon for lead source items
const SourceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// Color palette cycling for dynamic items
const COLORS = [
  { iconBg: 'var(--primary-light)', iconStroke: 'var(--primary)' },
  { iconBg: 'var(--success-light)', iconStroke: 'var(--success)' },
  { iconBg: '#F3E8FF',              iconStroke: '#9333EA' },
  { iconBg: '#FFF7ED',              iconStroke: '#EA580C' },
  { iconBg: '#E0E7FF',              iconStroke: '#4F46E5' },
  { iconBg: '#E0F2FE',              iconStroke: '#0284C7' },
  { iconBg: '#FEF9C3',              iconStroke: '#CA8A04' },
  { iconBg: '#FCE7F3',              iconStroke: '#DB2777' },
];

const LeadSource = ({ data, onCardClick, activeFilters = [], courseTypeId, leadSourceId, boardId, gradeId, assignedUserIds, departmentId }) => {
  // API returns an array: [{id, name, code, count, percentage}, ...]
  const [sourceData, setSourceData] = useState([]);

  useEffect(() => {
    if (data !== undefined) {
      const payload = data ?? [];
      setSourceData(Array.isArray(payload) ? payload : Object.values(payload));
      return;
    }

    const fetchSourceData = async () => {
      try {
        const params = {};
        if (courseTypeId) params.courseTypeId = courseTypeId;
        if (leadSourceId) params.leadSourceId = leadSourceId;
        if (boardId) params.boardId = boardId;
        if (gradeId) params.gradeId = gradeId;
        if (assignedUserIds) params.assignedUserIds = assignedUserIds;
        if (departmentId) params.departmentId = departmentId;
        
        const response = await getLeadSourceBreakdown(params);
        const payload = response?.data?.data ?? response?.data ?? response ?? [];
        // Normalise: always store as an array
        setSourceData(Array.isArray(payload) ? payload : Object.values(payload));
      } catch (error) {
        console.error('Error fetching lead source breakdown:', error);
      }
    };

    fetchSourceData();
  }, [data, courseTypeId, leadSourceId, boardId, gradeId, assignedUserIds, departmentId]);

  // Accept both array (new) and object (legacy) formats
  const items = Array.isArray(sourceData)
    ? sourceData
    : Object.entries(sourceData)
        .filter(([, val]) => val > 0)
        .map(([key, val], i) => ({ id: key, code: key, name: key, count: val, percentage: 0 }));

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <h2 className="lead-source-title" style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
        Data Source
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
        <div className="lead-source-responsive-grid" style={gridStyle}>
          {items.map((item, index) => {
            const clr = COLORS[index % COLORS.length];
            const isSelected = activeFilters.some(f => f.type === 'leadSource' && f.value === item.id);
            return (
              <div
                key={item.id || item.code}
                className="lead-source-card-item"
                onClick={() => onCardClick && onCardClick({ type: 'leadSource', value: item.id, label: item.name })}
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
                    <div className="lead-source-icon-container" style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: clr.iconBg, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0,
                    }}>
                      <div className="lead-source-icon" style={{ color: clr.iconStroke }}><SourceIcon /></div>
                    </div>
                    <div className="lead-source-label" style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', lineHeight: '1.3', flex: 1 }}>
                      {item.name}
                    </div>
                  </div>
                  <div className="lead-source-count" style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', flexShrink: 0, marginLeft: '12px' }}>
                    {item.count !== undefined ? item.count.toLocaleString() : '0'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        /* Lead Source Container Responsive */
        @media (max-width: 1400px) {
          .lead-source-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)) !important;
            gap: 15px !important;
          }
        }

        @media (max-width: 1200px) {
          .lead-source-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important;
            gap: 14px !important;
          }
        }

        @media (max-width: 1024px) {
          .lead-source-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)) !important;
            gap: 13px !important;
          }
        }

        @media (max-width: 768px) {
          .lead-source-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
            gap: 12px !important;
          }
        }

        @media (max-width: 480px) {
          .lead-source-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important;
            gap: 10px !important;
          }
        }

        @media (max-width: 360px) {
          .lead-source-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)) !important;
            gap: 8px !important;
          }
        }

        /* Lead Source Card Item Responsive */
        @media (max-width: 1024px) {
          .lead-source-card-item {
            height: 95px !important;
            padding: 10px !important;
          }
        }

        @media (max-width: 768px) {
          .lead-source-card-item {
            height: 90px !important;
            padding: 8px !important;
            border-radius: 10px !important;
          }
        }

        @media (max-width: 480px) {
          .lead-source-card-item {
            height: 85px !important;
            padding: 6px !important;
            border-radius: 8px !important;
          }
        }

        @media (max-width: 360px) {
          .lead-source-card-item {
            height: 80px !important;
            padding: 5px !important;
            border-radius: 8px !important;
          }
        }

        /* Lead Source Icon Container Responsive */
        @media (max-width: 1024px) {
          .lead-source-icon-container {
            width: 36px !important;
            height: 36px !important;
            border-radius: 8px !important;
          }
        }

        @media (max-width: 768px) {
          .lead-source-icon-container {
            width: 32px !important;
            height: 32px !important;
            border-radius: 7px !important;
          }
        }

        @media (max-width: 480px) {
          .lead-source-icon-container {
            width: 28px !important;
            height: 28px !important;
            border-radius: 6px !important;
          }
        }

        @media (max-width: 360px) {
          .lead-source-icon-container {
            width: 24px !important;
            height: 24px !important;
            border-radius: 5px !important;
          }
        }

        /* Lead Source Icon Responsive */
        @media (max-width: 1024px) {
          .lead-source-icon svg {
            width: 18px !important;
            height: 18px !important;
          }
        }

        @media (max-width: 768px) {
          .lead-source-icon svg {
            width: 16px !important;
            height: 16px !important;
          }
        }

        @media (max-width: 480px) {
          .lead-source-icon svg {
            width: 14px !important;
            height: 14px !important;
          }
        }

        @media (max-width: 360px) {
          .lead-source-icon svg {
            width: 12px !important;
            height: 12px !important;
          }
        }

        /* Lead Source Label Responsive */
        @media (max-width: 1024px) {
          .lead-source-label {
            font-size: 13px !important;
          }
        }

        @media (max-width: 768px) {
          .lead-source-label {
            font-size: 12px !important;
          }
        }

        @media (max-width: 480px) {
          .lead-source-label {
            font-size: 11px !important;
          }
        }

        @media (max-width: 360px) {
          .lead-source-label {
            font-size: 10px !important;
          }
        }

        /* Lead Source Count Responsive */
        @media (max-width: 1024px) {
          .lead-source-count {
            font-size: 24px !important;
            margin-left: 10px !important;
          }
        }

        @media (max-width: 768px) {
          .lead-source-count {
            font-size: 22px !important;
            margin-left: 8px !important;
          }
        }

        @media (max-width: 480px) {
          .lead-source-count {
            font-size: 20px !important;
            margin-left: 6px !important;
          }
        }

        @media (max-width: 360px) {
          .lead-source-count {
            font-size: 18px !important;
            margin-left: 4px !important;
          }
        }

        /* Title Responsive */
        @media (max-width: 768px) {
          .lead-source-title {
            font-size: 18px !important;
            margin-bottom: 14px !important;
          }
        }

        @media (max-width: 480px) {
          .lead-source-title {
            font-size: 16px !important;
            margin-bottom: 12px !important;
          }
        }

        @media (max-width: 360px) {
          .lead-source-title {
            font-size: 14px !important;
            margin-bottom: 10px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LeadSource;

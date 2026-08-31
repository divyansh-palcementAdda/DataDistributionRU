import React, { useEffect, useState } from 'react';
import { getCourseTypesBreakdown } from '../../../Services/cards/cardService';

const CategorywiseCard = ({ data, onCardClick, activeFilters = [], courseTypeId, leadSourceId, boardId, gradeId, assignedUserIds, departmentId }) => {
  // API returns an array: [{id, name, code, count, percentage}, ...]
  const [courseTypesData, setCourseTypesData] = useState([]);

  useEffect(() => {
    if (data !== undefined) {
      const payload = data ?? [];
      setCourseTypesData(Array.isArray(payload) ? payload : Object.values(payload));
      return;
    }

    const fetchCourseTypes = async () => {
      try {
        const params = {};
        if (courseTypeId) params.courseTypeId = courseTypeId;
        if (leadSourceId) params.leadSourceId = leadSourceId;
        if (boardId) params.boardId = boardId;
        if (gradeId) params.gradeId = gradeId;
        if (assignedUserIds) params.assignedUserIds = assignedUserIds;
        if (departmentId) params.departmentId = departmentId;
        
        const response = await getCourseTypesBreakdown(params);
        const payload = response?.data?.data ?? response?.data ?? response ?? [];
        // Normalise: always store as an array
        setCourseTypesData(Array.isArray(payload) ? payload : Object.values(payload));
      } catch (error) {
        console.error('Error fetching course types:', error);
      }
    };

    fetchCourseTypes();
  }, [data, courseTypeId, leadSourceId, boardId, gradeId, assignedUserIds, departmentId]);

  // Responsive styles
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  };

  const colors = ['blue', 'teal', 'orange', 'purple', 'green', 'red'];

  const getIconBg = (color) => ({
    blue: 'var(--primary-light)',
    teal: '#E0F2F1',
    orange: '#FFF7ED',
    purple: '#F3E8FF',
    green: '#DCFCE7',
    red: '#FEE2E2',
  }[color] || '#F5F5F5');

  const getIconStroke = (color) => ({
    blue: 'var(--primary)',
    teal: '#009688',
    orange: '#EA580C',
    purple: '#9333EA',
    green: '#16A34A',
    red: '#DC2626',
  }[color] || '#9E9E9E');

  return (
    <div style={{ marginBottom: '24px' }}>
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: '700', 
        color: '#1e293b', 
        marginBottom: '16px' 
      }}>
        Category Wise data
      </h2>
      {courseTypesData.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#64748b',
          fontSize: '16px',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px dashed #cbd5e1'
        }}>
          No Data Available
        </div>
      ) : (
        <div className="categorywise-responsive-grid" style={gridStyle}>
          {courseTypesData.map((item, index) => {
            const color = colors[index % colors.length];
            const iconBg = getIconBg(color);
            const iconStroke = getIconStroke(color);
            const label = item.name || item.code || `Category ${index + 1}`;
            const count = typeof item.count === 'number' ? item.count.toLocaleString() : item.count ?? '0';
            const isSelected = activeFilters.some(f => f.type === 'courseType' && (f.value === item.code || f.value === item.id));

            return (
            <div
              key={item.id ?? index}
              onClick={() => onCardClick && onCardClick({ type: 'courseType', value: item.code || item.id, label })}
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '12px',
                boxShadow: isSelected
                  ? '0 0 0 1.5px #6366f1, 0 4px 12px rgba(99,102,241,0.12)'
                  : '0 2px 8px rgba(0, 0, 0, 0.08)',
                border: isSelected ? '1.5px solid #6366f1' : '1px solid #e5e7eb',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                height: '100px',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                if (!isSelected) e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                if (!isSelected) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
              }}
            >
              {/* Active indicator badge */}
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  background: '#6366f1',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '100%',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flex: 1,
                  minWidth: 0,
                }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ color: iconStroke }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18" />
                        <path d="M9 21V9" />
                      </svg>
                    </div>
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1e293b',
                    lineHeight: '1.3',
                    flex: 1,
                  }}>
                    {label}
                  </div>
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#1e293b',
                  flexShrink: 0,
                  marginLeft: '12px',
                }}>
                  {count}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
      <style>{`
        @media (max-width: 1200px) {
          .categorywise-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important;
            gap: 14px !important;
          }
        }
        
        @media (max-width: 768px) {
          .categorywise-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
            gap: 12px !important;
          }
        }
        
        @media (max-width: 480px) {
          .categorywise-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important;
            gap: 10px !important;
          }
        }
        
        @media (max-width: 360px) {
          .categorywise-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)) !important;
            gap: 8px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CategorywiseCard;
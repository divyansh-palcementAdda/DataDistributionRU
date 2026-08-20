import React from 'react';

const GradeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const COLORS = [
  { iconBg: 'var(--success-light)', iconStroke: 'var(--success)' },
  { iconBg: '#FEF9C3',              iconStroke: '#CA8A04' },
  { iconBg: '#FFF7ED',              iconStroke: '#EA580C' },
  { iconBg: 'var(--primary-light)', iconStroke: 'var(--primary)' },
  { iconBg: '#E0E7FF',              iconStroke: '#4F46E5' },
  { iconBg: '#F3E8FF',              iconStroke: '#9333EA' },
  { iconBg: '#E0F2FE',              iconStroke: '#0284C7' },
  { iconBg: '#FCE7F3',              iconStroke: '#DB2777' },
];

const GradWiseCard = ({ data = [], onCardClick, selectedCard }) => {
  // Accept both array (new) and object (legacy) formats
  const items = Array.isArray(data)
    ? data
    : Object.entries(data)
        .filter(([, val]) => val > 0)
        .map(([key, val]) => ({ id: key, code: key, name: key, count: val, percentage: 0 }));

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
        Grade Wise
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
        <div className="gradwise-responsive-grid" style={gridStyle}>
          {items.map((item, index) => {
            const clr = COLORS[index % COLORS.length];
            const isSelected = selectedCard?.type === 'grade' && selectedCard?.value === item.id;
            return (
              <div
                key={item.id || item.code}
                onClick={() => onCardClick && onCardClick({ type: 'grade', value: item.id, label: item.name })}
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
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: clr.iconBg, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0,
                    }}>
                      <div style={{ color: clr.iconStroke }}><GradeIcon /></div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', lineHeight: '1.3', flex: 1 }}>
                      {item.name}
                    </div>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', flexShrink: 0, marginLeft: '12px' }}>
                    {item.count !== undefined ? item.count.toLocaleString() : '0'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 1200px) { .gradwise-responsive-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important; gap: 14px !important; } }
        @media (max-width: 768px)  { .gradwise-responsive-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important; gap: 12px !important; } }
        @media (max-width: 480px)  { .gradwise-responsive-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important; gap: 10px !important; } }
        @media (max-width: 360px)  { .gradwise-responsive-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)) !important; gap: 8px  !important; } }
      `}</style>
    </div>
  );
};

export default GradWiseCard;

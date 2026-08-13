import React from 'react';

const BoardWiseCard = ({ data = {} }) => {
  // Responsive styles
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  };

  // Card data configuration with icons and colors
  const cardConfig = [
    {
      key: 'cbseData',
      label: 'CBSE Data',
      color: 'blue',
      iconBg: 'var(--primary-light)',
      iconStroke: 'var(--primary)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          <path d="M8 7h6" />
          <path d="M8 11h8" />
          <path d="M8 15h6" />
        </svg>
      ),
    },
    {
      key: 'mpBoardData',
      label: 'MP Board Data',
      color: 'indigo',
      iconBg: '#E0E7FF',
      iconStroke: '#4F46E5',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
          <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
        </svg>
      ),
    },
    {
      key: 'otherBoard',
      label: 'Other Board',
      color: 'gray',
      iconBg: '#F5F5F5',
      iconStroke: '#9E9E9E',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18" />
          <path d="M15 3v18" />
          <path d="M3 9h18" />
          <path d="M3 15h18" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ marginBottom: '24px' }}>
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: '700', 
        color: '#1e293b', 
        marginBottom: '16px' 
      }}>
        Board wise data
      </h2>
      <div className="boardwise-responsive-grid" style={gridStyle}>
        {cardConfig.map((card) => (
          <div
            key={card.key}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              height: '100px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px',
            }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: card.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <div style={{ color: card.iconStroke }}>
                  {card.icon}
                </div>
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e293b',
                lineHeight: '1.3',
              }}>
                {card.label}
              </div>
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1e293b',
            }}>
              {data[card.key] !== undefined ? data[card.key].toLocaleString() : '0'}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 1200px) {
          .boardwise-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important;
            gap: 14px !important;
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
      `}</style>
    </div>
  );
};

export default BoardWiseCard;
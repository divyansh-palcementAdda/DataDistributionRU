import React from 'react';

const SystemCards = ({ data = {} }) => {
  // Responsive styles
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  };

  // Card data configuration with icons and colors
  const cardConfig = [
    {
      key: 'totalDataInSystem',
      label: 'Total Data Present in System',
      color: 'blue',
      iconBg: 'var(--primary-light)',
      iconStroke: 'var(--primary)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      key: 'totalSourceOfData',
      label: 'Total Source of Data',
      color: 'teal',
      iconBg: '#E0F2F1',
      iconStroke: '#009688',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
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
        System Overview
      </h2>
      <div className="system-cards-responsive-grid" style={gridStyle}>
        {cardConfig.map((card) => (
          <div
            key={card.key}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
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
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: card.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
              }}
            >
              <div style={{ color: card.iconStroke }}>
                {card.icon}
              </div>
            </div>
            <div style={{
              fontSize: '13px',
              fontWeight: '500',
              color: '#64748b',
              marginBottom: '8px',
              lineHeight: '1.4',
            }}>
              {card.label}
            </div>
            <div style={{
              fontSize: '24px',
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
          .system-cards-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important;
            gap: 14px !important;
          }
        }
        
        @media (max-width: 768px) {
          .system-cards-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
            gap: 12px !important;
          }
        }
        
        @media (max-width: 480px) {
          .system-cards-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important;
            gap: 10px !important;
          }
        }
        
        @media (max-width: 360px) {
          .system-cards-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)) !important;
            gap: 8px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SystemCards;
import React from 'react';

const LeadSource = ({ data = {} }) => {
  // Responsive styles
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  };

  // Card data configuration with icons and colors
  const cardConfig = [
    {
      key: 'totalConsultantData',
      label: 'Total Consultant Data',
      color: 'blue',
      iconBg: 'var(--primary-light)',
      iconStroke: 'var(--primary)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
    },
    {
      key: 'totalInboundData',
      label: 'Total Inbound Data',
      color: 'green',
      iconBg: 'var(--success-light)',
      iconStroke: 'var(--success)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    {
      key: 'totalOutboundData',
      label: 'Total Outbound Data',
      color: 'purple',
      iconBg: '#F3E8FF',
      iconStroke: '#9333EA',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
        </svg>
      ),
    },
  ];

  // Filter cards to only show those with data > 0
  const cardsWithData = cardConfig.filter(card => data[card.key] !== undefined && data[card.key] > 0);

  return (
    <div style={{ marginBottom: '24px' }}>
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: '700', 
        color: '#1e293b', 
        marginBottom: '16px' 
      }}>
        Lead Source
      </h2>
      
      {cardsWithData.length === 0 ? (
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '40px 20px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#94a3b8',
          }}>
            No Data Available
          </div>
        </div>
      ) : (
        <div className="lead-source-responsive-grid" style={gridStyle}>
          {cardsWithData.map((card) => (
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
                  flex: 1,
                }}>
                  {card.label}
                </div>
              </div>
              <div style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1e293b',
                flexShrink: 0,
                marginLeft: '12px',
              }}>
                {data[card.key].toLocaleString()}
              </div>
            </div>
          </div>
        ))}
        </div>
      )}
      <style>{`
        @media (max-width: 1200px) {
          .lead-source-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important;
            gap: 14px !important;
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
      `}</style>
    </div>
  );
};

export default LeadSource;
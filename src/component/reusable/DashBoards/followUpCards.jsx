import React, { useState, useEffect } from 'react';
import { getFollowupStatusCounts } from '../../../Services/cards/cardService';

const FollowUpCards = ({ onCardClick, activeFilters = [] }) => {
  const [followUpData, setFollowUpData] = useState([]);

  useEffect(() => {
    const fetchFollowUpStatusData = async () => {
      try {
        console.log('FollowUpCards fetching data');
        const response = await getFollowupStatusCounts();
        console.log('FollowUpCards response:', response);
        setFollowUpData(response.data?.data || []);
      } catch (error) {
        console.error('Error fetching follow-up status counts:', error);
      }
    };

    fetchFollowUpStatusData();
  }, []);

  // Responsive styles
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  };

  // Function to get card styling based on status code
  const getCardStyle = (code) => {
    const statusColors = {
      'FORM_FOLLOW_UP': { color: 'orange', iconBg: '#FFF7ED', iconStroke: '#EA580C' },
      'COUNSELING_FOLLOW_UP': { color: 'indigo', iconBg: '#E0E7FF', iconStroke: '#4F46E5' },
      'CONTINUOUS_FORM_FOLLOW_UP': { color: 'amber', iconBg: '#FEF3C7', iconStroke: '#D97706' },
      'CONTINUOUS_FOLLOW_UP': { color: 'blue', iconBg: 'var(--primary-light)', iconStroke: 'var(--primary)' },
      'INTERESTED_FOLLOW_UP': { color: 'green', iconBg: 'var(--success-light)', iconStroke: 'var(--success)' },
    };
    return statusColors[code] || { color: 'gray', iconBg: '#F5F5F5', iconStroke: '#9E9E9E' };
  };

  // Function to get icon based on status code
  const getIcon = (code) => {
    const icons = {
      'FORM_FOLLOW_UP': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <path d="M8 14h.01M12 14h.01M16 14h.01" />
        </svg>
      ),
      'COUNSELING_FOLLOW_UP': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
      ),
      'CONTINUOUS_FORM_FOLLOW_UP': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <path d="M8 14h.01M12 14h.01M16 14h.01" />
          <path d="M22 12v-2l-3-1M2 12v2l3 1" />
        </svg>
      ),
      'CONTINUOUS_FOLLOW_UP': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2" />
        </svg>
      ),
      'INTERESTED_FOLLOW_UP': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 14V2H7v12l5 5 5-5z" />
          <path d="M9 18l-6 6" />
          <path d="M15 18l6 6" />
        </svg>
      ),
    };
    return icons[code] || (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    );
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: '700', 
        color: '#1e293b', 
        marginBottom: '16px' 
      }}>
        Follow-up Status
      </h2>
      <div className="followup-cards-responsive-grid" style={gridStyle}>
        {followUpData.map((item) => {
          const cardStyle = getCardStyle(item.statusCode);
          return (
            <div
              key={item.statusId}
              onClick={() => onCardClick && onCardClick({ type: 'leadStatus', value: item.statusId, label: item.statusName })}
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '12px',
                boxShadow: activeFilters.some(f => f.type === 'leadStatus' && f.value === item.statusId)
                  ? '0 0 0 2px #6366f1, 0 4px 16px rgba(99,102,241,0.18)'
                  : '0 2px 8px rgba(0, 0, 0, 0.08)',
                border: activeFilters.some(f => f.type === 'leadStatus' && f.value === item.statusId)
                  ? '2px solid #6366f1'
                  : '1px solid #e5e7eb',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                height: '100px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Active indicator badge */}
              {activeFilters.some(f => f.type === 'leadStatus' && f.value === item.statusId) && (
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
                      background: cardStyle.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ color: cardStyle.iconStroke }}>
                      {getIcon(item.statusCode)}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1e293b',
                    lineHeight: '1.3',
                    flex: 1,
                  }}>
                    {item.statusName}
                  </div>
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1e293b',
                  flexShrink: 0,
                  marginLeft: '12px',
                }}>
                  {item.count !== undefined ? item.count.toLocaleString() : '0'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <style>{`
        @media (max-width: 1200px) {
          .followup-cards-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important;
            gap: 14px !important;
          }
        }
        
        @media (max-width: 768px) {
          .followup-cards-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
            gap: 12px !important;
          }
        }
        
        @media (max-width: 480px) {
          .followup-cards-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important;
            gap: 10px !important;
          }
        }
        
        @media (max-width: 360px) {
          .followup-cards-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)) !important;
            gap: 8px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FollowUpCards;
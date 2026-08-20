import React, { useState, useEffect } from 'react';
import { getLeadStatusBreakdown } from '../../../Services/cards/cardService';

const LeadCards = ({ onCardClick, selectedCard }) => {
  const [leadData, setLeadData] = useState([]);

  useEffect(() => {
    const fetchLeadStatusData = async () => {
      try {
        const filterRequest = {};
        const response = await getLeadStatusBreakdown({ filterRequest: JSON.stringify(filterRequest) });
        setLeadData(response.data?.data || []);
      } catch (error) {
        console.error('Error fetching lead status breakdown:', error);
      }
    };

    fetchLeadStatusData();
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
      'RAW': { color: 'blue', iconBg: 'var(--primary-light)', iconStroke: 'var(--primary)' },
      'PRIORITY_BASED': { color: 'gold', iconBg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', iconStroke: '#ffffff', isHighlighted: true },
      'ALLOTTED': { color: 'teal', iconBg: '#E0F2F1', iconStroke: '#009688' },
      'UNALLOTTED': { color: 'gray', iconBg: '#F5F5F5', iconStroke: '#9E9E9E' },
      'AVAILED': { color: 'purple', iconBg: '#F3E8FF', iconStroke: '#9333EA' },
      'CONNECTED': { color: 'blue', iconBg: 'var(--primary-light)', iconStroke: 'var(--primary)' },
      'INTERESTED': { color: 'green', iconBg: 'var(--success-light)', iconStroke: 'var(--success)' },
      'NOT_INTERESTED': { color: 'red', iconBg: 'var(--danger-light)', iconStroke: 'var(--danger)' },
      'FORM_FOLLOW_UP': { color: 'orange', iconBg: '#FFF7ED', iconStroke: '#EA580C' },
      'COUNSELING_FOLLOW_UP': { color: 'indigo', iconBg: '#E0E7FF', iconStroke: '#4F46E5' },
      'REGISTERED': { color: 'green', iconBg: 'var(--success-light)', iconStroke: 'var(--success)' },
      'FORM_NOT_INTERESTED': { color: 'red', iconBg: 'var(--danger-light)', iconStroke: 'var(--danger)' },
      'CONTINUE_FORM_FOLLOW_UP': { color: 'orange', iconBg: '#FFF7ED', iconStroke: '#EA580C' },
      'COUNSELING_FOLLOW_UP_2': { color: 'indigo', iconBg: '#E0E7FF', iconStroke: '#4F46E5' },
      'CONTINUES_COUNSELING_FOLLOW_UP': { color: 'indigo', iconBg: '#E0E7FF', iconStroke: '#4F46E5' },
      'INTERESTED_FOLLOW_UP': { color: 'green', iconBg: 'var(--success-light)', iconStroke: 'var(--success)' },
      'COUNSELING_TO_FORM_FOLLOW_UP': { color: 'cyan', iconBg: '#E0F2FE', iconStroke: '#0284C7' },
      'NOT_INTERESTED_AFTER_COUNSELING': { color: 'red', iconBg: 'var(--danger-light)', iconStroke: 'var(--danger)' },
      'GOES_TO_FORM_FOLLOW_UP_AFTER_COUNSELING': { color: 'cyan', iconBg: '#E0F2FE', iconStroke: '#0284C7' },
      'BAD_DATA': { color: 'red', iconBg: 'var(--danger-light)', iconStroke: 'var(--danger)' },
      'NOT_CONNECTED': { color: 'gray', iconBg: '#F5F5F5', iconStroke: '#9E9E9E' },
      'FIRST_NOT_CONNECTED': { color: 'indigo', iconBg: '#E0E7FF', iconStroke: '#4F46E5' },
      'SECOND_NOT_CONNECTED': { color: 'indigo', iconBg: '#E0E7FF', iconStroke: '#4F46E5' },
      'THIRD_NOT_CONNECTED': { color: 'indigo', iconBg: '#E0E7FF', iconStroke: '#4F46E5' },
      'FOURTH_NOT_CONNECTED': { color: 'indigo', iconBg: '#E0E7FF', iconStroke: '#4F46E5' },
      'FINALLY_NOT_CONNECTED': { color: 'red', iconBg: 'var(--danger-light)', iconStroke: 'var(--danger)' },
    };
    return statusColors[code] || { color: 'gray', iconBg: '#F5F5F5', iconStroke: '#9E9E9E' };
  };

  // Function to get icon based on status code
  const getIcon = (code) => {
    const icons = {
      'RAW': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
      'PRIORITY_BASED': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      'ALLOTTED': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <path d="M20 8v6M23 11h-6" />
        </svg>
      ),
      'UNALLOTTED': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          <line x1="16" y1="5" x2="16" y2="5.01" />
          <line x1="18" y1="5" x2="18" y2="5.01" />
          <line x1="20" y1="5" x2="20" y2="5.01" />
        </svg>
      ),
      'AVAILED': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      'CONNECTED': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.9" />
        </svg>
      ),
      'INTERESTED': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 14V2H7v12l5 5 5-5z" />
          <path d="M9 18l-6 6" />
          <path d="M15 18l6 6" />
        </svg>
      ),
      'NOT_INTERESTED': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
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
      'REGISTERED': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      'FORM_NOT_INTERESTED': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <circle cx="12" cy="14" r="3" />
          <line x1="9" y1="14" x2="15" y2="14" />
        </svg>
      ),
      'BAD_DATA': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
      'NOT_CONNECTED': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
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
        Lead Status
      </h2>
      <div className="lead-cards-responsive-grid" style={gridStyle}>
        {leadData.map((item) => {
          const cardStyle = getCardStyle(item.code);
          return (
            <div
              key={item.id}
              onClick={() => onCardClick && onCardClick({ type: 'leadStatus', value: item.id, label: item.name })}
              style={{
                background: cardStyle.isHighlighted ? 'linear-gradient(135deg, #FFF9E6 0%, #FFFFFF 100%)' : '#ffffff',
                borderRadius: '12px',
                padding: cardStyle.isHighlighted ? '12px' : '12px',
                boxShadow: selectedCard?.type === 'leadStatus' && selectedCard?.value === item.id
                  ? '0 0 0 2px #6366f1, 0 4px 16px rgba(99,102,241,0.18)'
                  : cardStyle.isHighlighted 
                    ? '0 4px 20px rgba(255, 215, 0, 0.3), 0 0 0 2px rgba(255, 215, 0, 0.5)' 
                    : '0 2px 8px rgba(0, 0, 0, 0.08)',
                border: selectedCard?.type === 'leadStatus' && selectedCard?.value === item.id
                  ? '2px solid #6366f1'
                  : cardStyle.isHighlighted 
                    ? '2px solid #FFD700' 
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
              {selectedCard?.type === 'leadStatus' && selectedCard?.value === item.id && (
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
                      {getIcon(item.code)}
                    </div>
                  </div>
                  <div style={{
                    fontSize: cardStyle.isHighlighted ? '14px' : '14px',
                    fontWeight: cardStyle.isHighlighted ? '700' : '600',
                    color: cardStyle.isHighlighted ? '#FF8C00' : '#1e293b',
                    lineHeight: '1.3',
                    flex: 1,
                  }}>
                    {item.name}
                  </div>
                </div>
                <div style={{
                  fontSize: cardStyle.isHighlighted ? '26px' : '24px',
                  fontWeight: cardStyle.isHighlighted ? '700' : '700',
                  color: cardStyle.isHighlighted ? '#FF8C00' : '#1e293b',
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
          .lead-cards-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important;
            gap: 14px !important;
          }
        }
        
        @media (max-width: 768px) {
          .lead-cards-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
            gap: 12px !important;
          }
        }
        
        @media (max-width: 480px) {
          .lead-cards-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important;
            gap: 10px !important;
          }
        }
        
        @media (max-width: 360px) {
          .lead-cards-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)) !important;
            gap: 8px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LeadCards;
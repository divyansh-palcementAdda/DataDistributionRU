import React from 'react';

const LeadCards = ({ data = {} }) => {
  // Responsive styles
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  };

  // Card data configuration with icons and colors
  const cardConfig = [
    {
      key: 'priorityBasedData',
      label: 'Priority Based Data',
      color: 'gold',
      iconBg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      iconStroke: '#ffffff',
      isHighlighted: true,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
    {
      key: 'rowData',
      label: 'Row Data',
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
      key: 'totalAllotted',
      label: 'Total Allotted',
      color: 'teal',
      iconBg: '#E0F2F1',
      iconStroke: '#009688',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <path d="M20 8v6M23 11h-6" />
        </svg>
      ),
    },
    {
      key: 'totalUnallotted',
      label: 'Total Unallotted',
      color: 'gray',
      iconBg: '#F5F5F5',
      iconStroke: '#9E9E9E',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          <line x1="16" y1="5" x2="16" y2="5.01" />
          <line x1="18" y1="5" x2="18" y2="5.01" />
          <line x1="20" y1="5" x2="20" y2="5.01" />
        </svg>
      ),
    },
    {
      key: 'totalAvailed',
      label: 'Total Availed',
      color: 'purple',
      iconBg: '#F3E8FF',
      iconStroke: '#9333EA',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      key: 'connected',
      label: 'Connected',
      color: 'blue',
      iconBg: 'var(--primary-light)',
      iconStroke: 'var(--primary)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.9" />
        </svg>
      ),
    },
    {
      key: 'interested',
      label: 'Interested',
      color: 'green',
      iconBg: 'var(--success-light)',
      iconStroke: 'var(--success)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 14V2H7v12l5 5 5-5z" />
          <path d="M9 18l-6 6" />
          <path d="M15 18l6 6" />
        </svg>
      ),
    },
    {
      key: 'notInterested',
      label: 'Not Interested',
      color: 'red',
      iconBg: 'var(--danger-light)',
      iconStroke: 'var(--danger)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
    },
    {
      key: 'formFollowUp',
      label: 'Form Follow-up',
      color: 'orange',
      iconBg: '#FFF7ED',
      iconStroke: '#EA580C',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <path d="M8 14h.01M12 14h.01M16 14h.01" />
        </svg>
      ),
    },
    {
      key: 'counselingFollowUp',
      label: 'Counseling Follow-up',
      color: 'indigo',
      iconBg: '#E0E7FF',
      iconStroke: '#4F46E5',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
      ),
    },
    {
      key: 'registered',
      label: 'Registered',
      color: 'green',
      iconBg: 'var(--success-light)',
      iconStroke: 'var(--success)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    {
      key: 'formNotInterested',
      label: 'Form not Interested',
      color: 'red',
      iconBg: 'var(--danger-light)',
      iconStroke: 'var(--danger)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <circle cx="12" cy="14" r="3" />
          <line x1="9" y1="14" x2="15" y2="14" />
        </svg>
      ),
    },
    {
      key: 'continueFormFollowUp',
      label: 'Continue form follow-up',
      color: 'orange',
      iconBg: '#FFF7ED',
      iconStroke: '#EA580C',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <path d="M8 14h.01M12 14h.01M16 14h.01" />
          <polyline points="9 18 12 15 15 18" />
        </svg>
      ),
    },
    {
      key: 'counselingFollowUp2',
      label: 'Counseling Follow-up',
      color: 'indigo',
      iconBg: '#E0E7FF',
      iconStroke: '#4F46E5',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          <polyline points="9 18 12 15 15 18" />
        </svg>
      ),
    },
    {
      key: 'continuesCounselingFollowUp',
      label: 'Continues counseling follow-up',
      color: 'indigo',
      iconBg: '#E0E7FF',
      iconStroke: '#4F46E5',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          <polyline points="9 18 12 15 15 18" />
          <polyline points="9 12 12 9 15 12" />
        </svg>
      ),
    },
    {
      key: 'interestedFollowUp',
      label: 'Interested follow-up',
      color: 'green',
      iconBg: 'var(--success-light)',
      iconStroke: 'var(--success)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 14V2H7v12l5 5 5-5z" />
          <path d="M9 18l-6 6" />
          <path d="M15 18l6 6" />
          <polyline points="9 12 12 9 15 12" />
        </svg>
      ),
    },
    {
      key: 'counselingToFormFollowUp',
      label: 'Counseling to form follow-up',
      color: 'cyan',
      iconBg: '#E0F2FE',
      iconStroke: '#0284C7',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
    },
    {
      key: 'notInterestedAfterCounseling',
      label: 'Not Interested after counseling',
      color: 'red',
      iconBg: 'var(--danger-light)',
      iconStroke: 'var(--danger)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          <circle cx="12" cy="12" r="10" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
    },
    {
      key: 'goesToFormFollowUpAfterCounseling',
      label: 'Goes to form follow-up after Counseling',
      color: 'cyan',
      iconBg: '#E0F2FE',
      iconStroke: '#0284C7',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <polyline points="9 18 12 15 15 18" />
        </svg>
      ),
    },
    {
      key: 'badData',
      label: 'Bad Data',
      color: 'red',
      iconBg: 'var(--danger-light)',
      iconStroke: 'var(--danger)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
    },
    {
      key: 'notConnected',
      label: 'Not Connected',
      color: 'gray',
      iconBg: '#F5F5F5',
      iconStroke: '#9E9E9E',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
      ),
    },
    {
      key: 'firstNotConnected',
      label: 'First Not Connected',
      color: 'indigo',
      iconBg: '#E0E7FF',
      iconStroke: '#4F46E5',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.9" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
    },
    {
      key: 'secondNotConnected',
      label: 'Second Not Connected',
      color: 'indigo',
      iconBg: '#E0E7FF',
      iconStroke: '#4F46E5',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.9" />
          <path d="M16 3.13a4 4 0 010 7.75" />
          <path d="M20 8v6M23 11h-6" />
        </svg>
      ),
    },
    {
      key: 'thirdNotConnected',
      label: 'Third not connected',
      color: 'indigo',
      iconBg: '#E0E7FF',
      iconStroke: '#4F46E5',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.9" />
          <path d="M16 3.13a4 4 0 010 7.75" />
          <path d="M20 8v6M23 11h-6" />
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        </svg>
      ),
    },
    {
      key: 'fourthNotConnected',
      label: 'Fourth not connected',
      color: 'indigo',
      iconBg: '#E0E7FF',
      iconStroke: '#4F46E5',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.9" />
          <path d="M16 3.13a4 4 0 010 7.75" />
          <path d="M20 8v6M23 11h-6" />
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
      ),
    },
    {
      key: 'finallyNotConnected',
      label: 'Finally Not Connected',
      color: 'red',
      iconBg: 'var(--danger-light)',
      iconStroke: 'var(--danger)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
          <circle cx="12" cy="12" r="10" />
          <line x1="8" y1="12" x2="16" y2="12" />
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
        Lead Status
      </h2>
      <div className="lead-cards-responsive-grid" style={gridStyle}>
        {cardConfig.map((card) => (
          <div
            key={card.key}
            style={{
              background: card.isHighlighted ? 'linear-gradient(135deg, #FFF9E6 0%, #FFFFFF 100%)' : '#ffffff',
              borderRadius: '12px',
              padding: card.isHighlighted ? '20px' : '16px',
              boxShadow: card.isHighlighted 
                ? '0 4px 20px rgba(255, 215, 0, 0.3), 0 0 0 2px rgba(255, 215, 0, 0.5)' 
                : '0 2px 8px rgba(0, 0, 0, 0.08)',
              border: card.isHighlighted 
                ? '2px solid #FFD700' 
                : '1px solid #e5e7eb',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = card.isHighlighted 
                ? '0 8px 30px rgba(255, 215, 0, 0.4), 0 0 0 3px rgba(255, 215, 0, 0.6)' 
                : '0 8px 24px rgba(0, 0, 0, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = card.isHighlighted 
                ? '0 4px 20px rgba(255, 215, 0, 0.3), 0 0 0 2px rgba(255, 215, 0, 0.5)' 
                : '0 2px 8px rgba(0, 0, 0, 0.08)';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: card.isHighlighted ? '16px' : '12px',
              marginBottom: card.isHighlighted ? '16px' : '12px',
            }}>
              <div
                style={{
                  width: card.isHighlighted ? '48px' : '40px',
                  height: card.isHighlighted ? '48px' : '40px',
                  borderRadius: card.isHighlighted ? '12px' : '10px',
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
                fontSize: card.isHighlighted ? '16px' : '14px',
                fontWeight: card.isHighlighted ? '700' : '600',
                color: card.isHighlighted ? '#FF8C00' : '#1e293b',
                lineHeight: '1.3',
              }}>
                {card.label}
              </div>
            </div>
            <div style={{
              fontSize: card.isHighlighted ? '32px' : '28px',
              fontWeight: card.isHighlighted ? '800' : '700',
              color: card.isHighlighted ? '#FF8C00' : '#1e293b',
            }}>
              {data[card.key] !== undefined ? data[card.key].toLocaleString() : '0'}
            </div>
          </div>
        ))}
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
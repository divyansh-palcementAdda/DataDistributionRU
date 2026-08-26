import React, { useEffect, useState } from 'react';
import { getUnallottedCount } from '../../../Services/cards/cardService';

const UnallottedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
);

const UnallottedCard = ({ data, onCardClick, activeFilters = [], filterRequest = {} }) => {
  const [unallottedData, setUnallottedData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data !== undefined) {
      setUnallottedData(data);
      return;
    }

    const fetchUnallottedCount = async () => {
      try {
        setLoading(true);
        const response = await getUnallottedCount(filterRequest);
        const payload = response?.data?.data ?? response?.data ?? response;
        setUnallottedData(payload);
      } catch (error) {
        console.error('Error fetching unallotted count:', error);
        setUnallottedData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUnallottedCount();
  }, [data, filterRequest]);

  const count = unallottedData?.count ?? 0;
  const type = unallottedData?.type ?? 'Unallotted';
  const isSelected = activeFilters.some(f => f.type === 'unallotted');

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: isSelected
      ? '0 0 0 2px #6366f1, 0 4px 16px rgba(99,102,241,0.18)'
      : '0 2px 8px rgba(0,0,0,0.08)',
    border: isSelected ? '2px solid #6366f1' : '1px solid #e5e7eb',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    height: '100px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    if (!isSelected) e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    if (!isSelected) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
        Unallotted Leads
      </h2>

      {loading ? (
        <div style={{
          background: '#ffffff', borderRadius: '12px', padding: '40px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#94a3b8' }}>Loading...</div>
        </div>
      ) : (
        <div
          onClick={() => onCardClick && onCardClick({ type: 'unallotted', value: true, label: 'Unallotted' })}
          style={cardStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'var(--primary-light)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <div style={{ color: 'var(--primary)' }}><UnallottedIcon /></div>
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', lineHeight: '1.3', flex: 1 }}>
              {type}
            </div>
          </div>

          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', flexShrink: 0, marginLeft: '12px' }}>
            {count.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnallottedCard;
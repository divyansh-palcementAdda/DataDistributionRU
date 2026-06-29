import React from 'react';

const StatsCard = ({ title, value, unit, percentage, palette }) => {
    const cardStyle = {
        background: palette.bg,
        borderRadius: '14px',
        padding: '16px 18px',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(0,0,0,0.12)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'default',
    };

    const handleMouseEnter = e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.18)';
    };

    const handleMouseLeave = e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.12)';
    };

    return (
        <div style={cardStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: '-18px', right: '-18px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ position: 'absolute', bottom: '-22px', right: '18px', width: '55px', height: '55px', borderRadius: '50%', background: 'rgba(255,255,255,0.10)' }} />

            {/* Title */}
            <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', opacity: 0.85, marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {title}
            </div>

            {/* Value */}
            <div style={{ fontSize: '28px', fontWeight: '800', lineHeight: 1, marginBottom: '10px' }}>
                {value}
                {unit && <span style={{ fontSize: '12px', fontWeight: '500', opacity: 0.8, marginLeft: '4px' }}>{unit}</span>}
            </div>

            {/* Progress bar */}
            <div style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '999px', height: '5px', overflow: 'hidden' }}>
                <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: '#fff',
                    borderRadius: '999px',
                    transition: 'width 0.6s ease',
                }} />
            </div>
            <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '5px', fontWeight: '600' }}>
                {percentage}% of total
            </div>
        </div>
    );
};

export default StatsCard;
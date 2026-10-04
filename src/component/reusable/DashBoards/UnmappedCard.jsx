import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUnmappedCount } from '../../../Services/cards/cardService';

const UnmappedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const getDefaultTitle = (dimension) => {
  switch (dimension) {
    case 'CATEGORY':
      return 'Unmapped Category';
    case 'COURSE':
      return 'Unmapped Course';
    case 'PROGRAM':
      return 'Unmapped Specialization';
    case 'GRADE':
      return 'Unmapped Grade';
    default:
      return 'All Unmapped Data';
  }
};

const getDefaultNavUrl = (dimension) => {
  switch (dimension) {
    case 'CATEGORY':
      return '/leads?withoutCourseType=true';
    case 'COURSE':
      return '/leads?withoutCourse=true';
    case 'PROGRAM':
      return '/leads?withoutProgram=true';
    case 'GRADE':
      return '/leads?withoutGrade=true';
    default:
      return '/leads?unmapped=true';
  }
};

const UnmappedCard = ({
  data,
  dimension = null,
  title,
  subtitle,
  navUrl,
  onCardClick,
  activeFilters = [],
  filterRequest = {},
  courseTypeId,
  leadSourceId,
  boardId,
  gradeId,
  assignedUserIds,
  departmentId,
  statusId,
  courseId,
}) => {
  const navigate = useNavigate();
  const [unmappedData, setUnmappedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const role = (localStorage.getItem('userRole') || '').toUpperCase();
  let isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';
  if (!isAdmin) {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const roleName = (userInfo?.role?.name || userInfo?.role || '').toUpperCase();
      isAdmin = roleName === 'SUPER_ADMIN' || roleName === 'ADMIN';
    } catch (e) {
      isAdmin = false;
    }
  }

  const displayTitle = title || getDefaultTitle(dimension);
  const targetNavUrl = navUrl || getDefaultNavUrl(dimension);

  const filterRequestKey = JSON.stringify(filterRequest);

  useEffect(() => {
    if (!isAdmin) return;
    if (data !== undefined) {
      setUnmappedData(data);
      return;
    }

    let isCancelled = false;
    const fetchUnmappedCount = async () => {
      try {
        setLoading(true);
        const params = {};
        if (courseTypeId) params.courseTypeId = courseTypeId;
        if (leadSourceId) params.leadSourceId = leadSourceId;
        if (boardId) params.boardId = boardId;
        if (gradeId) params.gradeId = gradeId;
        if (assignedUserIds) params.assignedUserIds = assignedUserIds;
        if (departmentId) params.departmentId = departmentId;
        if (statusId) params.statusId = statusId;
        if (courseId) params.courseId = courseId;

        const finalParams = { ...params, ...filterRequest };

        const response = await getUnmappedCount(finalParams, dimension);
        if (!isCancelled) {
          const payload = response?.data?.data ?? response?.data ?? response;
          setUnmappedData(payload);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching unmapped count:', error);
          setUnmappedData(null);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchUnmappedCount();
    return () => {
      isCancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, filterRequestKey, dimension, courseTypeId, leadSourceId, boardId, gradeId, assignedUserIds, departmentId, statusId, courseId]);

  const count = unmappedData?.count ?? 0;
  const isSelected = activeFilters.some(
    f => f.type === 'unmapped' ||
      (dimension === 'CATEGORY' && f.type === 'withoutCourseType') ||
      (dimension === 'COURSE' && f.type === 'withoutCourse') ||
      (dimension === 'PROGRAM' && f.type === 'withoutProgram') ||
      (dimension === 'GRADE' && f.type === 'withoutGrade')
  );

  const handleClick = () => {
    if (onCardClick) {
      onCardClick({
        type: 'unmapped',
        value: true,
        label: displayTitle,
        dimension,
      });
    } else if (targetNavUrl) {
      navigate(targetNavUrl);
    }
  };

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: isSelected
      ? '0 0 0 2px #f43f5e, 0 4px 16px rgba(244,63,94,0.18)'
      : '0 2px 8px rgba(0,0,0,0.08)',
    border: isSelected ? '2px solid #f43f5e' : '1px solid #e5e7eb',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    height: '100px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const iconContainerStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: '#fff1f2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: '#e11d48',
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: '1.3',
    flex: 1,
  };

  const countStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#be123c',
    flexShrink: 0,
    marginLeft: '12px',
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    if (!isSelected) e.currentTarget.style.boxShadow = '0 8px 24px rgba(244,63,94,0.14)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    if (!isSelected) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      {loading ? (
        <div style={{
          background: '#ffffff', borderRadius: '12px', padding: '40px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
          height: '100px'
        }}>
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-rose-500" />
          <span style={{ fontSize: '14px', color: '#64748b' }}>Loading...</span>
        </div>
      ) : (
        <div
          className="unmapped-card-item"
          onClick={handleClick}
          style={cardStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          title={`Click to view ${displayTitle.toLowerCase()} in Leads`}
        >
          {isSelected && (
            <div style={{
              position: 'absolute', top: '6px', right: '6px',
              background: '#f43f5e', borderRadius: '50%',
              width: '18px', height: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
            <div style={iconContainerStyle}>
              <UnmappedIcon />
            </div>
            <div>
              <div style={labelStyle}>
                {displayTitle}
              </div>
              {subtitle && (
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          <div style={countStyle}>
            {count.toLocaleString()}
          </div>
        </div>
      )}
      <style>{`
        @media (max-width: 1024px) {
          .unmapped-card-item {
            height: 95px !important;
            padding: 14px !important;
          }
        }
        @media (max-width: 768px) {
          .unmapped-card-item {
            height: 90px !important;
            padding: 12px !important;
            border-radius: 10px !important;
          }
        }
        @media (max-width: 480px) {
          .unmapped-card-item {
            height: 85px !important;
            padding: 10px !important;
            border-radius: 8px !important;
          }
        }
      `}</style>
    </>
  );
};

export default UnmappedCard;

import React, { useEffect, useState, useMemo } from 'react';
import { getUserAllocationSummary } from '../../../Services/segregation/dataSegregationService';
import { usePermissions } from '../../../PermissionContext';
import UserAllocationTable from './UserAllocationTable';

const UsersAllottedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const UsersWorkingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const UserAllocationSummaryCards = ({
  courseId,
  courseTypeId,
  filterRequest = {},
  activeFilters = [],
  scopeTitle = '',
  onCardClick
}) => {
  const { hasPermission } = usePermissions();
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [tableWorkingOnly, setTableWorkingOnly] = useState(false);

  // Permission checks
  const canViewAllottedUsers = hasPermission('DATA_SEGREGATION_USER_ALLOCATION_VIEW')
    || hasPermission('DATA_SEGREGATION_VIEW')
    || hasPermission('DATA_SEGREGATION_FULL_FLOW_VIEW');

  const canViewWorkingUsers = hasPermission('DATA_SEGREGATION_CURRENTLY_WORKING_USERS_VIEW')
    || hasPermission('DATA_SEGREGATION_VIEW')
    || hasPermission('DATA_SEGREGATION_FULL_FLOW_VIEW');

  // Stable dependency key
  const filterKey = useMemo(() => JSON.stringify(filterRequest), [filterRequest]);

  useEffect(() => {
    let isCancelled = false;

    const fetchSummary = async () => {
      // If user lacks both permissions, don't make API call
      if (!canViewAllottedUsers && !canViewWorkingUsers) {
        return;
      }

      try {
        setLoading(true);
        const params = { ...filterRequest };
        if (courseId) {
          params.courseId = courseId;
          params.interestedCourseIds = [courseId];
        }
        if (courseTypeId) params.courseTypeId = courseTypeId;

        const response = await getUserAllocationSummary(params);
        if (!isCancelled) {
          const data = response?.data || response;
          setSummaryData(data);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching user allocation summary:', error);
          setSummaryData({ totalUsersWithAllottedData: 0, usersCurrentlyWorking: 0 });
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchSummary();

    return () => {
      isCancelled = true;
    };
  }, [courseId, courseTypeId, filterKey, canViewAllottedUsers, canViewWorkingUsers]);

  if (!canViewAllottedUsers && !canViewWorkingUsers) {
    return null;
  }

  const totalUsers = summaryData?.totalUsersWithAllottedData ?? 0;
  const workingUsers = summaryData?.usersCurrentlyWorking ?? 0;
  const notWorkingUsers = Math.max(0, totalUsers - workingUsers);

  const handleCardClick = (workingOnly) => {
    if (onCardClick) {
      onCardClick({ type: workingOnly ? 'working_users' : 'allotted_users', value: workingOnly });
    }
    if (tableOpen && tableWorkingOnly === workingOnly) {
      // Toggle off if clicking the already active card
      setTableOpen(false);
    } else {
      setTableWorkingOnly(workingOnly);
      setTableOpen(true);
    }
  };

  const cardBaseStyle = {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '16px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    height: '100px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: '260px',
    flex: '1 1 260px',
  };

  const handleMouseEnter = (e, hoverColor) => {
    e.currentTarget.style.transform = 'translateY(-3px)';
    e.currentTarget.style.boxShadow = `0 10px 24px ${hoverColor || 'rgba(0,0,0,0.12)'}`;
    e.currentTarget.style.borderColor = hoverColor ? '#93c5fd' : '#cbd5e1';
  };

  const handleMouseLeave = (e, activeBorderColor) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
    e.currentTarget.style.borderColor = activeBorderColor || '#e5e7eb';
  };

  const isCard1Active = tableOpen && !tableWorkingOnly;
  const isCard2Active = tableOpen && tableWorkingOnly;

  return (
    <>
      <div className="flex flex-wrap gap-4 mb-6">
        {/* CARD 1: Total Users With Allotted Data */}
        {canViewAllottedUsers && (
          loading ? (
            <div style={{ ...cardBaseStyle, cursor: 'default' }}>
              <div className="flex items-center gap-3 w-full animate-pulse">
                <div className="w-11 h-11 bg-gray-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded-sm w-3/4" />
                  <div className="h-6 bg-gray-200 rounded-sm w-1/3" />
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                ...cardBaseStyle,
                borderColor: isCard1Active ? '#2563EB' : '#e5e7eb',
                borderWidth: isCard1Active ? '2px' : '1px',
                boxShadow: isCard1Active ? '0 4px 16px rgba(37, 99, 235, 0.16)' : '0 2px 8px rgba(0,0,0,0.08)',
                background: isCard1Active ? '#F8FAFC' : '#ffffff',
              }}
              onClick={() => handleCardClick(false)}
              onMouseEnter={(e) => handleMouseEnter(e, 'rgba(59, 130, 246, 0.18)')}
              onMouseLeave={(e) => handleMouseLeave(e, isCard1Active ? '#2563EB' : '#e5e7eb')}
              className="group"
              title="Click to view all users with allotted data table below"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: isCard1Active ? '#2563EB' : '#EFF6FF',
                  color: isCard1Active ? '#ffffff' : '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s ease'
                }} className="group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white">
                  <UsersAllottedIcon />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: isCard1Active ? '#1d4ed8' : '#1e293b',
                      lineHeight: '1.3',
                    }}>
                      Total Users With Allotted Data
                    </span>
                    {isCard1Active && (
                      <span className="text-[9px] font-bold text-blue-600 bg-blue-100/70 px-1.5 py-0.5 rounded border border-blue-200 uppercase tracking-wide">
                        Active Table
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 font-medium mt-0.5 flex items-center gap-1">
                    <span>Unique Counselors / Users</span>
                  </div>
                </div>
              </div>

              <div style={{
                fontSize: '28px',
                fontWeight: '800',
                color: isCard1Active ? '#2563EB' : '#1e293b',
                flexShrink: 0,
                marginLeft: '12px',
              }} className="group-hover:text-blue-600 transition-colors">
                {totalUsers.toLocaleString()}
              </div>

              {/* Accent subtle bottom border */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 transition-opacity ${
                isCard1Active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`} />
            </div>
          )
        )}

        {/* CARD 2: Users Currently Working */}
        {canViewWorkingUsers && (
          loading ? (
            <div style={{ ...cardBaseStyle, cursor: 'default' }}>
              <div className="flex items-center gap-3 w-full animate-pulse">
                <div className="w-11 h-11 bg-gray-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded-sm w-3/4" />
                  <div className="h-6 bg-gray-200 rounded-sm w-1/3" />
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                ...cardBaseStyle,
                borderColor: isCard2Active ? '#059669' : '#e5e7eb',
                borderWidth: isCard2Active ? '2px' : '1px',
                boxShadow: isCard2Active ? '0 4px 16px rgba(5, 150, 105, 0.16)' : '0 2px 8px rgba(0,0,0,0.08)',
                background: isCard2Active ? '#F0FDF4' : '#ffffff',
              }}
              onClick={() => handleCardClick(true)}
              onMouseEnter={(e) => handleMouseEnter(e, 'rgba(16, 185, 129, 0.18)')}
              onMouseLeave={(e) => handleMouseLeave(e, isCard2Active ? '#059669' : '#e5e7eb')}
              className="group"
              title="Click to view users currently working table below"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: isCard2Active ? '#059669' : '#ECFDF5',
                  color: isCard2Active ? '#ffffff' : '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s ease'
                }} className="group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white">
                  <UsersWorkingIcon />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: isCard2Active ? '#047857' : '#1e293b',
                      lineHeight: '1.3',
                    }}>
                      Users Currently Working
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {isCard2Active && (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded border border-emerald-200 uppercase tracking-wide">
                        Active Table
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                    {totalUsers > 0 ? (
                      <span className="text-gray-500">
                        {notWorkingUsers} {notWorkingUsers === 1 ? 'user' : 'users'} offline / inactive
                      </span>
                    ) : (
                      'Active on matching data'
                    )}
                  </div>
                </div>
              </div>

              <div style={{
                fontSize: '28px',
                fontWeight: '800',
                color: '#059669',
                flexShrink: 0,
                marginLeft: '12px',
              }} className="group-hover:scale-105 transition-transform">
                {workingUsers.toLocaleString()}
              </div>

              {/* Accent subtle bottom border */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 transition-opacity ${
                isCard2Active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`} />
            </div>
          )
        )}
      </div>

      {/* ── Inline User Allocation & Workload Table ── */}
      {tableOpen && (
        <UserAllocationTable
          courseId={courseId}
          courseTypeId={courseTypeId}
          filterRequest={filterRequest}
          activeFilters={activeFilters}
          scopeTitle={scopeTitle}
          workingOnly={tableWorkingOnly}
          initialWorkingOnly={tableWorkingOnly}
          collapsible={true}
          isOpen={tableOpen}
          onClose={() => setTableOpen(false)}
          onTabChange={(isWorking) => setTableWorkingOnly(isWorking)}
        />
      )}
    </>
  );
};

export default UserAllocationSummaryCards;

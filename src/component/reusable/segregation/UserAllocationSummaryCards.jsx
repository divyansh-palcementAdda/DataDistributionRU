import React, { useEffect, useState, useMemo } from 'react';
import { getUserAllocationSummary } from '../../../Services/segregation/dataSegregationService';
import { usePermissions } from '../../../PermissionContext';


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
  leadSourceId,
  boardId,
  gradeId,
  leadStatusId,
  filterRequest = {},
  activeFilters = [],
  scopeTitle = '',
  onCardClick,
  activeWorkingOnly = false,
  onWorkingOnlyChange
}) => {
  const { hasPermission } = usePermissions();
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);

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
        if (leadSourceId) params.leadSourceId = leadSourceId;
        if (boardId) params.boardId = boardId;
        if (gradeId) params.gradeId = gradeId;
        if (leadStatusId) params.leadStatusId = leadStatusId;

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
  }, [courseId, courseTypeId, leadSourceId, boardId, gradeId, leadStatusId, filterKey, canViewAllottedUsers, canViewWorkingUsers]);

  if (!canViewAllottedUsers && !canViewWorkingUsers) {
    return null;
  }

  const totalUsers = summaryData?.totalUsersWithAllottedData ?? 0;
  const workingUsers = summaryData?.usersCurrentlyWorking ?? 0;
  const notWorkingUsers = Math.max(0, totalUsers - workingUsers);

  const handleCardClick = (workingOnly) => {
    if (onWorkingOnlyChange) {
      onWorkingOnlyChange(workingOnly);
    }
    if (onCardClick) {
      onCardClick({ type: 'userAllocation', workingOnly });
    }
    const tableEl = document.getElementById('user-allocation-table-section');
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isCard1Active = !activeWorkingOnly;
  const isCard2Active = activeWorkingOnly;

  return (
    <>
      <div className="flex flex-wrap gap-4 mb-6">
        {/* CARD 1: Total Users With Allotted Data */}
        {canViewAllottedUsers && (
          loading ? (
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs h-[100px] flex items-center justify-between min-w-[260px] flex-1">
              <div className="flex items-center gap-3.5 w-full animate-pulse">
                <div className="w-11 h-11 bg-slate-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 rounded-sm w-3/4" />
                  <div className="h-6 bg-slate-200 rounded-sm w-1/3" />
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => handleCardClick(false)}
              className={`group relative flex items-center justify-between rounded-xl p-4 h-[100px] min-w-[260px] flex-1 cursor-pointer overflow-hidden transition-all duration-300 ${
                isCard1Active
                  ? 'bg-slate-50/70 border-2 border-indigo-600 shadow-md shadow-indigo-100'
                  : 'bg-white border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5'
              }`}
              title="Click to view all users with allotted data table below"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isCard1Active
                      ? 'bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-xs'
                      : 'bg-indigo-50 text-indigo-600 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white'
                  }`}
                >
                  <UsersAllottedIcon />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[13px] font-semibold leading-tight transition-colors ${
                        isCard1Active ? 'text-indigo-900' : 'text-slate-800'
                      }`}
                    >
                      Total Users With Allotted Data
                    </span>
                    {isCard1Active && (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/80 shadow-2xs tracking-wide uppercase">
                        Viewing
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-1">
                    Unique Counselors / Users
                  </div>
                </div>
              </div>

              <div
                className={`text-[28px] font-bold shrink-0 ml-3 transition-colors ${
                  isCard1Active ? 'text-indigo-600' : 'text-slate-800 group-hover:text-indigo-600'
                }`}
              >
                {totalUsers.toLocaleString()}
              </div>

              {/* Accent bottom border line */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 transition-opacity duration-200 ${
                  isCard1Active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              />
            </div>
          )
        )}

        {/* CARD 2: Users Currently Working */}
        {canViewWorkingUsers && (
          loading ? (
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs h-[100px] flex items-center justify-between min-w-[260px] flex-1">
              <div className="flex items-center gap-3.5 w-full animate-pulse">
                <div className="w-11 h-11 bg-slate-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 rounded-sm w-3/4" />
                  <div className="h-6 bg-slate-200 rounded-sm w-1/3" />
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => handleCardClick(true)}
              className={`group relative flex items-center justify-between rounded-xl p-4 h-[100px] min-w-[260px] flex-1 cursor-pointer overflow-hidden transition-all duration-300 ${
                isCard2Active
                  ? 'bg-emerald-50/50 border-2 border-emerald-600 shadow-md shadow-emerald-100'
                  : 'bg-white border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5'
              }`}
              title="Click to view users currently working table below"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isCard2Active
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-600 group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white'
                  }`}
                >
                  <UsersWorkingIcon />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[13px] font-semibold leading-tight transition-colors ${
                        isCard2Active ? 'text-emerald-900' : 'text-slate-800'
                      }`}
                    >
                      Users Currently Working
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {isCard2Active && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200/80 shadow-2xs tracking-wide uppercase">
                        Viewing
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-1">
                    {totalUsers > 0 ? (
                      <span className="text-slate-500">
                        {notWorkingUsers} {notWorkingUsers === 1 ? 'user' : 'users'} offline / inactive
                      </span>
                    ) : (
                      'Active on matching data'
                    )}
                  </div>
                </div>
              </div>

              <div
                className={`text-[28px] font-bold shrink-0 ml-3 transition-colors ${
                  isCard2Active ? 'text-emerald-700' : 'text-emerald-600 group-hover:text-emerald-700'
                }`}
              >
                {workingUsers.toLocaleString()}
              </div>

              {/* Accent bottom border line */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 transition-opacity duration-200 ${
                  isCard2Active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              />
            </div>
          )
        )}
      </div>


    </>
  );
};

export default UserAllocationSummaryCards;

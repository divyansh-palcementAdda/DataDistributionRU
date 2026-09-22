import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { getUserAllocationUsers } from '../../../Services/segregation/dataSegregationService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable User Allocation & Workload Table Component.
 * Can be used standalone or linked with summary cards across Course, Category,
 * Data Segregation, and Lead management pages.
 *
 * Props:
 * - courseId: UUID (optional)
 * - courseTypeId: UUID (optional)
 * - filterRequest: Object (optional filters like source, status, date)
 * - activeFilters: Array (optional chip display)
 * - scopeTitle: String (e.g., 'BBA', 'Management')
 * - workingOnly: Boolean (true = working only, false = all users, undefined = tabbed mode)
 * - initialWorkingOnly: Boolean (default active tab if workingOnly is not fixed)
 * - title: String (optional custom header title)
 * - showTabs: Boolean (default true, show toggle between All Users & Currently Working)
 * - collapsible: Boolean (default false, shows close button if toggled from cards)
 * - isOpen: Boolean (default true)
 * - onClose: Function (callback when closed/collapsed)
 * - onTabChange: Function (callback when active tab changes, e.g., to sync card highlight)
 */
const UserAllocationTable = ({
  courseId,
  courseTypeId,
  filterRequest = {},
  activeFilters = [],
  scopeTitle = '',
  workingOnly,
  initialWorkingOnly = false,
  title,
  showTabs = true,
  collapsible = false,
  isOpen = true,
  onClose,
  onTabChange,
}) => {
  const navigate = useNavigate();

  // Tab state: if workingOnly is provided explicitly, use it; otherwise maintain internal tab state
  const isControlledMode = typeof workingOnly === 'boolean';
  const [internalWorkingTab, setInternalWorkingTab] = useState(
    isControlledMode ? workingOnly : initialWorkingOnly
  );

  const activeWorkingFilter = isControlledMode ? workingOnly : internalWorkingTab;

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [userData, setUserData] = useState({
    totalUsers: 0,
    currentlyWorkingUsers: 0,
    totalAllottedData: 0,
    users: { content: [], totalElements: 0, totalPages: 1, page: 0, size: 10 }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('totalallotteddata');
  const [sortDirection, setSortDirection] = useState('desc');

  // Synchronize when controlled workingOnly prop changes
  useEffect(() => {
    if (isControlledMode) {
      setInternalWorkingTab(workingOnly);
      setPage(0);
    }
  }, [workingOnly, isControlledMode]);

  // Synchronize when initialWorkingOnly changes
  useEffect(() => {
    if (!isControlledMode) {
      setInternalWorkingTab(initialWorkingOnly);
      setPage(0);
    }
  }, [initialWorkingOnly, isControlledMode]);

  // Stable string for active filter request
  const filterKey = useMemo(() => JSON.stringify(filterRequest), [filterRequest]);

  const fetchUsers = useCallback(async () => {
    if (!isOpen) return;

    try {
      setLoading(true);
      const params = {
        ...filterRequest,
        page,
        size,
        sortBy,
        sortDirection,
      };

      if (courseId) {
        params.courseId = courseId;
        params.interestedCourseIds = [courseId];
      }
      if (courseTypeId) params.courseTypeId = courseTypeId;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (activeWorkingFilter) params.currentlyWorking = true;

      const response = await getUserAllocationUsers(params);
      const data = response?.data || response;
      if (data) {
        setUserData({
          totalUsers: data.totalUsers ?? 0,
          currentlyWorkingUsers: data.currentlyWorkingUsers ?? 0,
          totalAllottedData: data.totalAllottedData ?? 0,
          users: data.users || { content: [], totalElements: 0, totalPages: 1, page: 0, size: 10 }
        });
      }
    } catch (err) {
      console.error('Error fetching user allocation users:', err);
      toast.error('Failed to load user allocation details');
    } finally {
      setLoading(false);
    }
  }, [isOpen, filterKey, courseId, courseTypeId, activeWorkingFilter, searchTerm, page, size, sortBy, sortDirection]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (!isOpen) return null;

  const usersList = userData?.users?.content || [];
  const totalElements = userData?.users?.totalElements || 0;
  const totalPages = userData?.users?.totalPages || 1;

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
    setPage(0);
  };

  const handleTabSwitch = (isWorking) => {
    setInternalWorkingTab(isWorking);
    setPage(0);
    if (onTabChange) {
      onTabChange(isWorking);
    }
  };

  const downloadExcel = async () => {
    try {
      setExporting(true);
      // Fetch all matching users for export (up to 1000)
      const exportParams = {
        ...filterRequest,
        page: 0,
        size: 1000,
        sortBy,
        sortDirection,
      };
      if (courseId) {
        exportParams.courseId = courseId;
        exportParams.interestedCourseIds = [courseId];
      }
      if (courseTypeId) exportParams.courseTypeId = courseTypeId;
      if (searchTerm.trim()) exportParams.search = searchTerm.trim();
      if (activeWorkingFilter) exportParams.currentlyWorking = true;

      const response = await getUserAllocationUsers(exportParams);
      const data = response?.data || response;
      const exportList = data?.users?.content || usersList;

      const excelRows = exportList.map((u, idx) => ({
        '#': idx + 1,
        'Counselor Name': u.name || 'N/A',
        'Username': u.username || 'N/A',
        'Email': u.email || 'N/A',
        'Department': u.department || 'N/A',
        'Roles': Array.isArray(u.roles) ? u.roles.join(', ') : 'N/A',
        'Working Status': u.currentlyWorking ? 'Active (Working)' : 'Offline / Inactive',
        'Total Allotted Leads': u.totalAllottedData ?? 0,
        'Availed Leads': u.availedData ?? 0,
        'Recently Updated Leads (15m)': u.currentlyWorkingData ?? 0,
        'Last Activity': u.lastActivityAt ? new Date(u.lastActivityAt).toLocaleString() : 'N/A',
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'User Workload');

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `user_workload_${activeWorkingFilter ? 'working' : 'all'}_${timestamp}.xlsx`;

      XLSX.writeFile(workbook, filename);
      toast.success('User allocation data exported successfully');
    } catch (err) {
      console.error('Export Excel failed:', err);
      toast.error('Failed to export user allocation data');
    } finally {
      setExporting(false);
    }
  };

  const navigateToUserLeads = (userId) => {
    const queryFilters = {
      assignedUserIds: [userId],
    };
    if (courseId) {
      queryFilters.courseIds = [courseId];
      queryFilters.interestedCourseIds = [courseId];
    }
    navigate('/leads', { state: { ...queryFilters } });
  };

  // Resolve display title
  const computedTitle = title || (activeWorkingFilter ? 'Users Currently Working' : 'All Users with Allotted Data');

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-8 transition-all duration-300">
      {/* ── Table Header Banner ── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
            {activeWorkingFilter ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                User Workload & Allocation
              </span>
              {scopeTitle && (
                <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/20">
                  {scopeTitle}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white leading-tight mt-0.5">
              {computedTitle}
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={downloadExcel}
            disabled={loading || exporting || usersList.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all"
            title="Download complete user allocation as Excel (.xlsx)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            {exporting ? 'Exporting…' : 'Export Excel'}
          </button>

          {collapsible && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Close Table View"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Toolbar: Tabs, Search & Filter Summary ── */}
      <div className="px-6 py-3.5 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
        {/* Tab Toggle */}
        {showTabs && (
          <div className="inline-flex bg-gray-200/70 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => handleTabSwitch(false)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all ${
                !activeWorkingFilter
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Users with Data ({userData.totalUsers})
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch(true)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                activeWorkingFilter
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Currently Working ({userData.currentlyWorkingUsers})
            </button>
          </div>
        )}

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs min-w-[220px]">
          <input
            type="text"
            placeholder="Search counselor, email, dept..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <svg
            className="absolute left-3 top-2.5 text-gray-400"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setPage(0);
              }}
              className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* ── Active Scope Filter Indicator ── */}
      {activeFilters && activeFilters.length > 0 && (
        <div className="px-6 py-2 bg-indigo-50/50 border-b border-indigo-100/60 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
            Active Scopes:
          </span>
          {activeFilters.map((f, i) => (
            <span
              key={`${f.type}-${f.value}-${i}`}
              className="text-[11px] bg-white border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full font-medium shadow-2xs"
            >
              {f.label || `${f.type}: ${f.value}`}
            </span>
          ))}
        </div>
      )}

      {/* ── Table Content ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-gray-900 transition-colors"
                onClick={() => handleSort('name')}
              >
                Counselor / User {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4 text-center">Working Status</th>
              <th
                className="py-3 px-4 text-center cursor-pointer hover:text-gray-900 transition-colors"
                onClick={() => handleSort('totalallotteddata')}
              >
                Allotted Leads {sortBy === 'totalallotteddata' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="py-3 px-4 text-center cursor-pointer hover:text-gray-900 transition-colors"
                onClick={() => handleSort('availeddata')}
              >
                Availed Leads {sortBy === 'availeddata' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="py-3 px-4 text-center cursor-pointer hover:text-gray-900 transition-colors"
                onClick={() => handleSort('currentlyworkingdata')}
              >
                Recent Updates (15m) {sortBy === 'currentlyworkingdata' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-gray-900 transition-colors"
                onClick={() => handleSort('lastactivityat')}
              >
                Last Activity {sortBy === 'lastactivityat' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {loading ? (
              [...Array(size || 5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4 text-center"><div className="h-4 bg-gray-200 rounded w-4 mx-auto" /></td>
                  <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-32 mb-1.5" /><div className="h-3 bg-gray-100 rounded w-20" /></td>
                  <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                  <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                  <td className="py-4 px-4 text-center"><div className="h-4 bg-gray-200 rounded-full w-20 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><div className="h-5 bg-gray-200 rounded-full w-10 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><div className="h-5 bg-gray-200 rounded-full w-10 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><div className="h-5 bg-gray-200 rounded-full w-10 mx-auto" /></td>
                  <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                  <td className="py-4 px-4 text-right"><div className="h-4 bg-gray-200 rounded w-12 ml-auto" /></td>
                </tr>
              ))
            ) : usersList.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-12 text-center text-gray-400">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-300">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <div className="font-semibold text-gray-600 text-sm">No counselors or users found</div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    {activeWorkingFilter
                      ? 'No users currently active and updating matching data within the last 15 minutes.'
                      : 'No users have allotted leads matching the selected scope and filters.'}
                  </div>
                </td>
              </tr>
            ) : (
              usersList.map((user, idx) => {
                const initials = (user.name || user.username || 'U')
                  .split(' ')
                  .map(part => part[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <tr
                    key={user.userId || idx}
                    className="hover:bg-indigo-50/30 transition-colors group"
                  >
                    {/* # */}
                    <td className="py-3 px-4 text-center font-bold text-gray-400 group-hover:text-gray-700">
                      {page * size + idx + 1}
                    </td>

                    {/* Counselor / User */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 shadow-2xs ${
                          user.currentlyWorking
                            ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 ring-2 ring-emerald-200'
                            : 'bg-gradient-to-tr from-indigo-500 to-purple-600'
                        }`}>
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 truncate flex items-center gap-1.5">
                            <span>{user.name || user.username || 'N/A'}</span>
                            {user.currentlyWorking && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" title="Active session & recent updates" />
                            )}
                          </div>
                          <div className="text-[11px] text-gray-400 truncate">
                            {user.email || `@${user.username || 'user'}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-700">
                        {user.department || '—'}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      {user.roles && user.roles.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((r, rIdx) => (
                            <span
                              key={rIdx}
                              className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Working Status */}
                    <td className="py-3 px-4 text-center">
                      {user.currentlyWorking ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Online & Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500 border border-gray-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          Offline
                        </span>
                      )}
                    </td>

                    {/* Allotted Leads */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                        {(user.totalAllottedData ?? 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Availed Leads */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                        {(user.availedData ?? 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Recent Updates (15m) */}
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-2xs ${
                        (user.currentlyWorkingData ?? 0) > 0
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-gray-50 text-gray-400 border-gray-200'
                      }`}>
                        {(user.currentlyWorkingData ?? 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Last Activity */}
                    <td className="py-3 px-4 text-gray-500 font-medium whitespace-nowrap">
                      {user.lastActivityAt ? (
                        <div className="flex flex-col">
                          <span>{new Date(user.lastActivityAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="text-[10px] text-gray-400">{new Date(user.lastActivityAt).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => navigateToUserLeads(user.userId)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                        title="View leads assigned to this counselor"
                      >
                        Leads →
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Table Footer & Pagination ── */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
        <div>
          Showing{' '}
          <span className="font-bold text-gray-800">
            {totalElements === 0 ? 0 : page * size + 1}
          </span>{' '}
          to{' '}
          <span className="font-bold text-gray-800">
            {Math.min((page + 1) * size, totalElements)}
          </span>{' '}
          of <span className="font-bold text-gray-800">{totalElements}</span> users
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span>Per page:</span>
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(0);
              }}
              className="bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-700 transition"
            >
              Prev
            </button>
            <span className="px-2 font-semibold text-gray-700">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
              className="px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-700 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAllocationTable;

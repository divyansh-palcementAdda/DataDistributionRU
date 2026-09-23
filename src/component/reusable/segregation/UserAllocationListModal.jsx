import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { getUserAllocationUsers } from '../../../Services/segregation/dataSegregationService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const UserAllocationListModal = ({
  isOpen,
  onClose,
  initialWorkingOnly = false,
  filterRequest = {},
  activeFilters = [],
  scopeTitle = '',
  courseId,
  courseTypeId,
  leadSourceId,
  boardId,
  gradeId,
  leadStatusId
}) => {
  const navigate = useNavigate();
  const [workingFilter, setWorkingFilter] = useState(initialWorkingOnly);
  const [loading, setLoading] = useState(false);
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

  // Reset tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setWorkingFilter(initialWorkingOnly);
      setPage(0);
      setSearchTerm('');
    }
  }, [isOpen, initialWorkingOnly]);

  // Stable string for active filters
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

      if (courseId) params.courseId = courseId;
      if (courseTypeId) params.courseTypeId = courseTypeId;
      if (leadSourceId) params.leadSourceId = leadSourceId;
      if (boardId) params.boardId = boardId;
      if (gradeId) params.gradeId = gradeId;
      if (leadStatusId) params.leadStatusId = leadStatusId;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (workingFilter) params.currentlyWorking = true;

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
  }, [isOpen, filterKey, courseId, courseTypeId, leadSourceId, boardId, gradeId, leadStatusId, workingFilter, searchTerm, page, size, sortBy, sortDirection]);

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

  const downloadExcel = () => {
    try {
      if (usersList.length === 0) {
        toast.info('No user data available to export');
        return;
      }
      const exportData = usersList.map((u, idx) => ({
        'S.No': page * size + idx + 1,
        'Full Name': u.name || 'N/A',
        'Username': u.username || 'N/A',
        'Email': u.email || 'N/A',
        'Department': u.department || 'N/A',
        'Roles': Array.isArray(u.roles) ? u.roles.join(', ') : (u.roles || 'N/A'),
        'Working Status': u.currentlyWorking ? 'Working' : 'Offline',
        'Total Allotted Leads': u.totalAllottedData || 0,
        'Availed Leads': u.currentlyWorkingData || 0,
        'Last Activity': u.lastActivityAt ? new Date(u.lastActivityAt).toLocaleString() : 'N/A'
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users Allocation');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `users_allocation_${workingFilter ? 'working_' : 'all_'}${timestamp}.xlsx`;
      XLSX.writeFile(workbook, filename);
      toast.success('User list exported successfully');
    } catch (e) {
      console.error('Failed to export Excel:', e);
      toast.error('Export failed');
    }
  };

  const handleNavigateToLeads = (userId) => {
    // Navigate to leads preserving all filter context plus assignedTo
    const params = new URLSearchParams();
    if (courseId) params.append('courseId', courseId);
    if (courseTypeId) params.append('courseTypeId', courseTypeId);
    if (leadSourceId) params.append('leadSourceId', leadSourceId);
    if (boardId) params.append('boardId', boardId);
    if (gradeId) params.append('gradeId', gradeId);
    if (leadStatusId) params.append('statusId', leadStatusId);
    if (userId) params.append('assignedToId', userId);

    if (filterRequest) {
      if (filterRequest.leadSourceId) params.append('leadSourceId', filterRequest.leadSourceId);
      if (filterRequest.boardId) params.append('boardId', filterRequest.boardId);
      if (filterRequest.gradeId) params.append('gradeId', filterRequest.gradeId);
      if (filterRequest.statusId) params.append('statusId', filterRequest.statusId);
    }

    onClose();
    navigate(`/leads?${params.toString()}`);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-6xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-5 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${
              workingFilter ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {workingFilter ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-0.5">
                <span>User Analytics</span>
                {scopeTitle && (
                  <>
                    <span>•</span>
                    <span className="text-white bg-white/15 px-2 py-0.5 rounded-md font-medium">{scopeTitle}</span>
                  </>
                )}
                {workingFilter && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Currently Working
                    </span>
                  </>
                )}
              </div>
              <h3 className="font-bold text-white text-xl flex items-center gap-2">
                {workingFilter ? 'Users Currently Working on Selected Data' : 'All Users with Allotted Data'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadExcel}
              disabled={usersList.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-white/20"
              title="Download Excel Report"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Excel
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all cursor-pointer"
              title="Close modal"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter View Selector Tabs & Quick Stats */}
        <div className="p-4 bg-slate-50 border-b border-gray-200 shrink-0 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-gray-200/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { setWorkingFilter(false); setPage(0); }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                !workingFilter
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Users with Data ({userData.totalUsers})
            </button>
            <button
              type="button"
              onClick={() => { setWorkingFilter(true); setPage(0); }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                workingFilter
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${workingFilter ? 'bg-white animate-pulse' : 'bg-emerald-500'}`} />
              Currently Working ({userData.currentlyWorkingUsers})
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <input
                type="text"
                placeholder="Search user, email, dept..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                className="pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-56 transition-all"
              />
              <svg className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(''); setPage(0); }}
                className="text-xs text-gray-500 hover:text-gray-800 underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Badges */}
        {activeFilters && activeFilters.length > 0 && (
          <div className="px-5 py-2.5 bg-white border-b border-gray-100 flex items-center gap-2 flex-wrap text-xs text-gray-600">
            <span className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Active Filters:</span>
            {activeFilters.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
                {f.label || f.name || f.type || 'Filter'}
              </span>
            ))}
          </div>
        )}

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-gray-500">Loading user workload analytics...</p>
            </div>
          ) : usersList.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <p className="text-base font-bold text-gray-700">No users found</p>
              <p className="text-xs text-gray-400 max-w-sm">
                {workingFilter
                  ? 'No users are currently working (logged in with active session and lead activity within 15m) on this filtered data.'
                  : 'No users have allotted leads matching the selected filter criteria.'}
              </p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-slate-50 text-gray-600 font-semibold border-b border-gray-200 select-none">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        Counselor / User
                        {sortBy === 'name' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Role</th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => handleSort('currentlyworking')}
                    >
                      <div className="flex items-center gap-1">
                        Working Status
                        {sortBy === 'currentlyworking' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => handleSort('totalallotteddata')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Allotted Leads
                        {sortBy === 'totalallotteddata' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => handleSort('currentlyworkingdata')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Availed Leads
                        {sortBy === 'currentlyworkingdata' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => handleSort('lastactivityat')}
                    >
                      <div className="flex items-center gap-1">
                        Last Activity
                        {sortBy === 'lastactivityat' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {usersList.map((u, index) => {
                    const initials = u.name
                      ? u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                      : (u.username || 'U').slice(0, 2).toUpperCase();

                    return (
                      <tr key={u.userId || index} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 text-center text-gray-400 font-mono text-[11px]">
                          {page * size + index + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                              {initials}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                                {u.name || u.username}
                              </div>
                              <div className="text-[11px] text-gray-400 font-normal">
                                @{u.username} • {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-700">
                          {u.department || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1 flex-wrap">
                            {u.roles && u.roles.length > 0 ? (
                              u.roles.map((r, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-semibold tracking-wide">
                                  {r}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-[11px]">User</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {u.currentlyWorking ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Working
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                              Offline
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-100">
                            {u.totalAllottedData?.toLocaleString() || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                            {u.currentlyWorkingData?.toLocaleString() || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                          {u.lastActivityAt ? new Date(u.lastActivityAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'None'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleNavigateToLeads(u.userId)}
                            className="px-2 py-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                            title="View all leads allotted to this user with active filters"
                          >
                            Leads →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer / Pagination */}
        <div className="p-4 bg-slate-50 border-t border-gray-200 shrink-0 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-gray-500">
            Showing <span className="font-bold text-gray-800">{totalElements === 0 ? 0 : page * size + 1}</span> to{' '}
            <span className="font-bold text-gray-800">{Math.min((page + 1) * size, totalElements)}</span> of{' '}
            <span className="font-bold text-gray-800">{totalElements}</span> users
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <span>Per page:</span>
              <select
                value={size}
                onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
                className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page === 0 || loading}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Prev
              </button>
              <span className="px-2.5 py-1 text-xs font-bold text-gray-700 bg-gray-100 rounded-lg">
                {page + 1} / {Math.max(1, totalPages)}
              </span>
              <button
                type="button"
                disabled={(page + 1) >= totalPages || loading}
                onClick={() => setPage(p => p + 1)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserAllocationListModal;

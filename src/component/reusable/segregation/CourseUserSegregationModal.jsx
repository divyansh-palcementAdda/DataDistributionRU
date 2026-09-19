import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';

const CourseUserSegregationModal = ({
  isOpen,
  onClose,
  onBackToCourses,
  data,
  loading,
  selectedCourse,
  scopeTitle,
  filterScope,
  onNavigateToLeads
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('total');
  const [sortDirection, setSortDirection] = useState('desc');

  const users = data?.users?.content || [];
  const unallocatedRow = data?.unallocatedRow;
  const statusColumns = data?.statusColumns || [];

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(term) ||
          u.username?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term) ||
          u.department?.toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case 'name':
          valA = a.fullName || a.username || '';
          valB = b.fullName || b.username || '';
          return sortDirection === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        case 'allotted':
          valA = a.allotted || 0;
          valB = b.allotted || 0;
          break;
        case 'availed':
          valA = a.availed || 0;
          valB = b.availed || 0;
          break;
        case 'total':
        default:
          valA = a.total || 0;
          valB = b.total || 0;
          break;
      }
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [users, searchTerm, sortBy, sortDirection]);

  if (!isOpen) return null;

  const getSentimentBadgeClass = (category) => {
    switch (category) {
      case 'POSITIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'NEGATIVE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'NEUTRAL':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const downloadExcel = () => {
    try {
      const exportData = [];

      // Add unallocated row if present
      if (unallocatedRow && unallocatedRow.total > 0) {
        const uRow = {
          'User': 'Unallocated Leads',
          'Department': 'N/A',
          'Email': 'N/A',
          'Total Leads': unallocatedRow.total || 0,
          'Allotted': 0,
          'Availed': unallocatedRow.availed || 0
        };
        statusColumns.forEach((col) => {
          uRow[col.name] = unallocatedRow.statusCounts?.[col.code] ?? unallocatedRow.statusCounts?.[col.statusId] ?? 0;
        });
        exportData.push(uRow);
      }

      // Add user rows
      filteredAndSortedUsers.forEach((u) => {
        const row = {
          'User': u.fullName || u.username || 'N/A',
          'Department': u.department || 'N/A',
          'Email': u.email || 'N/A',
          'Total Leads': u.total || 0,
          'Allotted': u.allotted || 0,
          'Availed': u.availed || 0
        };
        statusColumns.forEach((col) => {
          row[col.name] = u.statusCounts?.[col.code] ?? u.statusCounts?.[col.statusId] ?? 0;
        });
        exportData.push(row);
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'User Segregation');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      XLSX.writeFile(workbook, `user_segregation_${selectedCourse?.courseName || 'course'}_${timestamp}.xlsx`);
    } catch (e) {
      console.error('Failed to export user segregation excel:', e);
    }
  };

  const courseDisplayName = selectedCourse?.courseName || data?.courseName || 'Selected Course';
  const categoryDisplayName = selectedCourse?.courseTypeName || data?.courseTypeName || '';

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-7xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToCourses}
              className="p-1.5 hover:bg-white/15 rounded-xl transition-all cursor-pointer text-white/90 hover:text-white"
              title="Back to Course-wise segregation"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
                <span>Course</span>
                <span>•</span>
                <span className="text-white bg-white/20 px-2 py-0.5 rounded-md font-medium">{courseDisplayName}</span>
                {scopeTitle ? (
                  <>
                    <span>•</span>
                    <span className="text-blue-100">{scopeTitle}</span>
                  </>
                ) : categoryDisplayName ? (
                  <>
                    <span>•</span>
                    <span className="text-blue-100">{categoryDisplayName}</span>
                  </>
                ) : null}
              </div>
              <h3 className="font-bold text-white text-xl flex items-center gap-2.5">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {courseDisplayName} — User-wise Lead Segregation
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadExcel}
              disabled={filteredAndSortedUsers.length === 0 && (!unallocatedRow || unallocatedRow.total === 0)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-white/20"
              title="Download as Excel"
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Summary Stat Cards */}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50/80 border-b border-gray-200 shrink-0">
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Course Total Leads</div>
              <div className="text-xl font-bold text-gray-900 mt-0.5">{data.totalLeads?.toLocaleString() || 0}</div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Allotted Data</div>
              <div className="text-xl font-bold text-blue-700 mt-0.5">{data.allottedLeads?.toLocaleString() || 0}</div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs">
              <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Unallocated Data</div>
              <div className="text-xl font-bold text-amber-700 mt-0.5">{data.unallottedLeads?.toLocaleString() || 0}</div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
              <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Availed Data</div>
              <div className="text-xl font-bold text-emerald-700 mt-0.5">{data.availedLeads?.toLocaleString() || 0}</div>
            </div>
          </div>
        )}

        {/* Toolbar & Search */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search user by name, email, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
              Assigned Users: <strong>{filteredAndSortedUsers.length}</strong>
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50/50">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-gray-600">Loading user segregation for {courseDisplayName}...</p>
            </div>
          ) : filteredAndSortedUsers.length === 0 && (!unallocatedRow || unallocatedRow.total === 0) ? (
            <div className="py-16 text-center bg-white rounded-xl border border-dashed border-gray-300 p-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No Lead Data Found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'No users match your search criteria.' : 'No leads allocated for this course within your current scope.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-gray-100/90 text-gray-700 font-semibold border-b border-gray-200 sticky top-0 z-10 backdrop-blur-xs">
                    <tr>
                      <th
                        onClick={() => handleSort('name')}
                        className="py-3 px-4 min-w-[220px] cursor-pointer hover:bg-gray-200/80 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>User</span>
                          {sortBy === 'name' && (
                            <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('total')}
                        className="py-3 px-3 text-center min-w-[85px] cursor-pointer hover:bg-gray-200/80 transition-colors select-none"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Total</span>
                          {sortBy === 'total' && (
                            <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('allotted')}
                        className="py-3 px-3 text-center min-w-[85px] cursor-pointer hover:bg-gray-200/80 transition-colors select-none"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Allotted</span>
                          {sortBy === 'allotted' && (
                            <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('availed')}
                        className="py-3 px-3 text-center min-w-[85px] cursor-pointer hover:bg-gray-200/80 transition-colors select-none"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Availed</span>
                          {sortBy === 'availed' && (
                            <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      {statusColumns.map((col) => (
                        <th key={col.statusId} className="py-3 px-3 text-center min-w-[110px]">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${getSentimentBadgeClass(
                              col.sentimentCategory
                            )}`}
                            title={`Status: ${col.name} (${col.code})`}
                          >
                            {col.name}
                          </span>
                        </th>
                      ))}
                      {onNavigateToLeads && (
                        <th className="py-3 px-4 text-center min-w-[120px] sticky right-0 bg-gray-100 z-10">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    
                    {/* Unallocated Leads Row (if present and not searching, or matching search) */}
                    {unallocatedRow && unallocatedRow.total > 0 && (!searchTerm.trim() || 'unallocated'.includes(searchTerm.toLowerCase().trim())) && (
                      <tr className="bg-amber-50/50 hover:bg-amber-50/80 border-b-2 border-amber-200/80 transition-colors font-medium">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-semibold text-amber-900 flex items-center gap-2">
                                <span>Unallocated Leads</span>
                                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-amber-200/80 text-amber-800 rounded">
                                  Unallocated
                                </span>
                              </div>
                              <div className="text-xs text-amber-700">Leads not yet allotted to any user</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-amber-900 bg-amber-100/30">
                          {unallocatedRow.total}
                        </td>
                        <td className="py-3 px-3 text-center text-gray-400">0</td>
                        <td className="py-3 px-3 text-center text-gray-400">{unallocatedRow.availed || 0}</td>
                        {statusColumns.map((col) => {
                          const count =
                            unallocatedRow.statusCounts?.[col.code] ??
                            unallocatedRow.statusCounts?.[col.statusId] ??
                            0;
                          return (
                            <td
                              key={col.statusId}
                              className={`py-3 px-3 text-center text-xs font-semibold ${
                                count > 0 ? 'text-amber-900' : 'text-gray-400'
                              }`}
                            >
                              {count}
                            </td>
                          );
                        })}
                        {onNavigateToLeads && (
                          <td className="py-3 px-4 text-center sticky right-0 bg-amber-50/80 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">
                            <button
                              onClick={() =>
                                onNavigateToLeads({
                                  courseId: selectedCourse?.courseId,
                                  unallocated: true,
                                  courseName: courseDisplayName,
                                  leadSourceId: filterScope?.leadSourceId,
                                  sourceName: filterScope?.sourceName,
                                  boardId: filterScope?.boardId,
                                  boardName: filterScope?.boardName,
                                  gradeId: filterScope?.gradeId,
                                  gradeName: filterScope?.gradeName
                                })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-lg transition-all shadow-2xs cursor-pointer"
                              title="View unallocated leads in Leads page"
                            >
                              <span>View Leads</span>
                            </button>
                          </td>
                        )}
                      </tr>
                    )}

                    {/* Assigned User Rows */}
                    {filteredAndSortedUsers.map((user) => (
                      <tr key={user.userId || user.username} className="hover:bg-blue-50/40 transition-colors">
                        {/* User Profile */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                              {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="truncate max-w-[240px]">
                              <div className="font-semibold text-gray-900 truncate" title={user.fullName}>
                                {user.fullName || user.username}
                              </div>
                              <div className="text-xs text-gray-500 truncate" title={user.email}>
                                {user.email || `@${user.username}`}
                              </div>
                              {user.department && (
                                <span className="inline-block mt-0.5 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                                  {user.department}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Counts */}
                        <td className="py-3 px-3 text-center font-bold text-gray-900 bg-gray-50/30">
                          {user.total}
                        </td>
                        <td className="py-3 px-3 text-center font-medium text-blue-700">
                          {user.allotted}
                        </td>
                        <td className="py-3 px-3 text-center font-medium text-emerald-700">
                          {user.availed}
                        </td>

                        {/* Dynamic Status Counts */}
                        {statusColumns.map((col) => {
                          const count =
                            user.statusCounts?.[col.code] ??
                            user.statusCounts?.[col.statusId] ??
                            0;
                          return (
                            <td
                              key={col.statusId}
                              className={`py-3 px-3 text-center text-xs font-medium ${
                                count > 0 ? 'text-gray-900 font-semibold' : 'text-gray-400'
                              }`}
                            >
                              {count}
                            </td>
                          );
                        })}

                        {/* Actions */}
                        {onNavigateToLeads && (
                          <td className="py-3 px-4 text-center sticky right-0 bg-white group-hover:bg-blue-50/40 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">
                            <button
                              onClick={() =>
                                onNavigateToLeads({
                                  courseId: selectedCourse?.courseId,
                                  assignedUserId: user.userId,
                                  userName: user.fullName || user.username,
                                  courseName: courseDisplayName,
                                  leadSourceId: filterScope?.leadSourceId,
                                  sourceName: filterScope?.sourceName,
                                  boardId: filterScope?.boardId,
                                  boardName: filterScope?.boardName,
                                  gradeId: filterScope?.gradeId,
                                  gradeName: filterScope?.gradeName
                                })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                              title={`View leads of ${user.fullName || user.username}`}
                            >
                              <span>View Leads</span>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-gray-500">
            Course Total ({data?.totalLeads || 0}) = Sum of User Totals + Unallocated Leads ({unallocatedRow?.total || 0}).
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToCourses}
              className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl transition-all cursor-pointer"
            >
              Back to Courses
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CourseUserSegregationModal;

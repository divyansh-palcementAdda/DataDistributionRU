import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';

const CourseSegregationModal = ({
  isOpen,
  onClose,
  data,
  loading,
  courseTypeName,
  scopeTitle,
  filterScope,
  canViewCourseUser,
  onViewUsers,
  onNavigateToLeads
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('total');
  const [sortDirection, setSortDirection] = useState('desc');

  const courses = data?.courses?.content || [];
  const statusColumns = data?.statusColumns || [];

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedCourses = useMemo(() => {
    let result = [...courses];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.courseName?.toLowerCase().includes(term) ||
          c.courseCode?.toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case 'courseName':
          valA = a.courseName || '';
          valB = b.courseName || '';
          return sortDirection === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        case 'allotted':
          valA = a.allotted || 0;
          valB = b.allotted || 0;
          break;
        case 'unallotted':
          valA = a.unallotted || 0;
          valB = b.unallotted || 0;
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
  }, [courses, searchTerm, sortBy, sortDirection]);

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
      const exportData = filteredAndSortedCourses.map((c) => {
        const row = {
          'Course Name': c.courseName,
          'Course Code': c.courseCode,
          'Total Leads': c.total || 0,
          'Allotted': c.allotted || 0,
          'Unallotted': c.unallotted || 0,
          'Availed': c.availed || 0
        };
        statusColumns.forEach((col) => {
          row[col.name] = c.statusCounts?.[col.code] ?? c.statusCounts?.[col.statusId] ?? 0;
        });
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Course Segregation');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      XLSX.writeFile(workbook, `course_segregation_${courseTypeName || 'category'}_${timestamp}.xlsx`);
    } catch (e) {
      console.error('Failed to export course segregation excel:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-7xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <span>Scope</span>
              <span>•</span>
              <span className="text-white bg-white/20 px-2 py-0.5 rounded-md font-medium">
                {scopeTitle || courseTypeName || 'Selected Category'}
              </span>
            </div>
            <h3 className="font-bold text-white text-xl flex items-center gap-2.5">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Course-wise Data Segregation
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadExcel}
              disabled={filteredAndSortedCourses.length === 0}
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
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Leads</div>
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
              placeholder="Search course by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
              Total Courses: <strong>{filteredAndSortedCourses.length}</strong>
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50/50">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-gray-600">Loading course-wise segregation...</p>
            </div>
          ) : filteredAndSortedCourses.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-xl border border-dashed border-gray-300 p-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No Courses Found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'No courses match your search criteria.' : 'No active courses configured under this category.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-gray-100/90 text-gray-700 font-semibold border-b border-gray-200 sticky top-0 z-10 backdrop-blur-xs">
                    <tr>
                      <th
                        onClick={() => handleSort('courseName')}
                        className="py-3 px-4 min-w-[200px] cursor-pointer hover:bg-gray-200/80 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Course</span>
                          {sortBy === 'courseName' && (
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
                        onClick={() => handleSort('unallotted')}
                        className="py-3 px-3 text-center min-w-[95px] cursor-pointer hover:bg-gray-200/80 transition-colors select-none"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Unallotted</span>
                          {sortBy === 'unallotted' && (
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
                      {(canViewCourseUser || onNavigateToLeads) && (
                        <th className="py-3 px-4 text-center min-w-[220px] sticky right-0 bg-gray-100 z-10 whitespace-nowrap shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAndSortedCourses.map((course) => (
                      <tr key={course.courseId} className="hover:bg-blue-50/40 transition-colors">
                        {/* Course Info */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-900">{course.courseName}</div>
                          {course.courseCode && (
                            <div className="text-xs text-gray-500 font-mono mt-0.5">{course.courseCode}</div>
                          )}
                        </td>

                        {/* Overall Counts */}
                        <td className="py-3 px-3 text-center font-bold text-gray-900 bg-gray-50/30">
                          {course.total}
                        </td>
                        <td className="py-3 px-3 text-center font-medium text-blue-700">
                          {course.allotted}
                        </td>
                        <td className="py-3 px-3 text-center font-medium text-amber-700">
                          {course.unallotted}
                        </td>
                        <td className="py-3 px-3 text-center font-medium text-emerald-700">
                          {course.availed}
                        </td>

                        {/* Dynamic Status Counts */}
                        {statusColumns.map((col) => {
                          const count =
                            course.statusCounts?.[col.code] ??
                            course.statusCounts?.[col.statusId] ??
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

                        {/* Action Drill Down */}
                        {(canViewCourseUser || onNavigateToLeads) && (
                          <td className="py-3 px-4 text-center min-w-[220px] sticky right-0 bg-white group-hover:bg-blue-50/40 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              {onNavigateToLeads && (
                                <button
                                  onClick={() =>
                                    onNavigateToLeads({
                                      courseId: course.courseId,
                                      courseName: course.courseName,
                                      courseTypeId: filterScope?.courseTypeId,
                                      courseTypeName: courseTypeName,
                                      leadSourceId: filterScope?.leadSourceId,
                                      sourceName: filterScope?.sourceName,
                                      boardId: filterScope?.boardId,
                                      boardName: filterScope?.boardName,
                                      gradeId: filterScope?.gradeId,
                                      gradeName: filterScope?.gradeName
                                    })
                                  }
                                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 hover:border-blue-400 rounded-lg text-xs font-semibold shadow-2xs hover:shadow-xs transition-all whitespace-nowrap cursor-pointer shrink-0"
                                  title={`View leads for ${course.courseName}`}
                                >
                                  <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  <span>View Leads</span>
                                </button>
                              )}
                              {canViewCourseUser && (
                                <button
                                  onClick={() => onViewUsers(course, filterScope)}
                                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs hover:shadow-xs transition-all whitespace-nowrap cursor-pointer shrink-0"
                                  title={`View users for ${course.courseName}`}
                                >
                                  <svg className="w-3.5 h-3.5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                  </svg>
                                  <span>View Users</span>
                                </button>
                              )}
                            </div>
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
            Showing all courses configured for <strong>{courseTypeName || 'this category'}</strong>. All totals reconcile with the Data Segregation Matrix.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default CourseSegregationModal;

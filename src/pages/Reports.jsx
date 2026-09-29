import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCalendar,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiUser,
  FiUsers,
  FiLayers,
  FiCheckCircle,
  FiTrendingUp,
  FiPhoneCall,
  FiFileText,
  FiArrowUp,
  FiArrowDown,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiXCircle,
  FiExternalLink
} from 'react-icons/fi';
import { usePermissions } from '../PermissionContext';
import { useAppContext } from '../AppContext';
import {
  getUserPerformanceReport,
  downloadUserPerformanceExcel,
  getAcademicSessions,
} from '../Services/reports/reportService';
import {
  getDepartmentsDropdown,
  getCoursesDropdown,
  getLeadStatusesDropdown,
  getUsersDropdown,
} from '../Services/drop-down/dropDownService';
import * as XLSX from 'xlsx';

const DATE_PRESET_OPTIONS = [
  { value: 'TODAY', label: 'Today' },
  { value: 'YESTERDAY', label: 'Yesterday' },
  { value: 'THIS_WEEK', label: 'This Week' },
  { value: 'THIS_MONTH', label: 'This Month' },
  { value: 'THIS_SESSION', label: 'This Session' },
  { value: 'ALL_TIME', label: 'All Time' },
  { value: 'CUSTOM', label: 'Custom Range' },
];

const Reports = () => {
  const navigate = useNavigate();
  const { showToast } = useAppContext();
  const { hasPermission } = usePermissions();

  const userRole = (localStorage.getItem('userRole') || '').toUpperCase();

  // Role capability checks
  const canViewDeptReport = hasPermission('REPORT_DEPARTMENT_VIEW') ||
    hasPermission('REPORT_ALL_DEPARTMENTS_VIEW') ||
    userRole === 'ADMIN' ||
    userRole === 'SUPER_ADMIN' ||
    userRole === 'HOD' ||
    userRole === 'HEAD';

  const canExport = hasPermission('REPORT_EXPORT') ||
    hasPermission('REPORT_VIEW') ||
    userRole === 'ADMIN' ||
    userRole === 'SUPER_ADMIN';

  // Mode state: 'SELF' or 'DEPARTMENTAL'
  const [reportMode, setReportMode] = useState('SELF');

  // Filters state
  const [datePreset, setDatePreset] = useState('THIS_MONTH');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Sorting & Pagination
  const [sortBy, setSortBy] = useState('courseName');
  const [sortDirection, setSortDirection] = useState('ASC');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // Dropdown options
  const [sessions, setSessions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [leadStatuses, setLeadStatuses] = useState([]);

  // Data & UI states
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  // Load Dropdowns on Mount
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [sessRes, deptRes, courseRes, statusRes] = await Promise.allSettled([
          getAcademicSessions(),
          getDepartmentsDropdown(),
          getCoursesDropdown(),
          getLeadStatusesDropdown(),
        ]);

        if (sessRes.status === 'fulfilled' && Array.isArray(sessRes.value)) {
          setSessions(sessRes.value);
          const current = sessRes.value.find((s) => s.current);
          if (current) {
            setSessionId(current.sessionId);
          }
        }

        if (deptRes.status === 'fulfilled' && deptRes.value?.data) {
          setDepartments(deptRes.value.data);
        }

        if (courseRes.status === 'fulfilled' && courseRes.value?.data) {
          setCourses(courseRes.value.data);
        }

        if (statusRes.status === 'fulfilled' && statusRes.value?.data) {
          setLeadStatuses(statusRes.value.data);
        }
      } catch (err) {
        console.error('Failed loading filter dropdowns:', err);
      }
    };

    loadDropdowns();
  }, []);

  // Load Users when Department changes (in departmental mode)
  useEffect(() => {
    if (reportMode === 'DEPARTMENTAL') {
      const loadUsers = async () => {
        try {
          const res = await getUsersDropdown('', selectedDepartment || '');
          if (res?.data) {
            setUsers(res.data);
          }
        } catch (err) {
          console.error('Failed to load users for department:', err);
        }
      };
      loadUsers();
    } else {
      setUsers([]);
      setSelectedUser('');
    }
  }, [reportMode, selectedDepartment]);

  // Fetch Report Data
  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        reportMode,
        datePreset,
        page,
        size,
        sortBy,
        sortDirection,
      };

      if (datePreset === 'CUSTOM') {
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
      }

      if (sessionId) params.sessionId = sessionId;
      if (selectedCourse) params.courseId = selectedCourse;
      if (selectedStatus) params.leadStatusId = selectedStatus;

      if (reportMode === 'DEPARTMENTAL') {
        if (selectedDepartment) params.departmentId = selectedDepartment;
        if (selectedUser) params.userId = selectedUser;
      }

      const res = await getUserPerformanceReport(params);
      setReportData(res);
    } catch (err) {
      console.error('Error fetching report:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to load report data';
      setError(msg);
      if (showToast) {
        showToast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [
    reportMode,
    datePreset,
    fromDate,
    toDate,
    sessionId,
    selectedDepartment,
    selectedUser,
    selectedCourse,
    selectedStatus,
    sortBy,
    sortDirection,
    page,
    size,
    showToast,
  ]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Handle Sort Change
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(field);
      setSortDirection('ASC');
    }
    setPage(0);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setDatePreset('THIS_MONTH');
    setFromDate('');
    setToDate('');
    setSelectedCourse('');
    setSelectedStatus('');
    setSelectedDepartment('');
    setSelectedUser('');
    setSortBy('courseName');
    setSortDirection('ASC');
    setPage(0);
  };

  // Export to Excel handler
  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {
        reportMode,
        datePreset,
        sessionId,
      };
      if (datePreset === 'CUSTOM') {
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
      }
      if (selectedCourse) params.courseId = selectedCourse;
      if (selectedStatus) params.leadStatusId = selectedStatus;
      if (reportMode === 'DEPARTMENTAL') {
        if (selectedDepartment) params.departmentId = selectedDepartment;
        if (selectedUser) params.userId = selectedUser;
      }

      try {
        const blob = await downloadUserPerformanceExcel(params);
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `Performance_Report_${reportMode}_${new Date().toISOString().slice(0, 10)}.xlsx`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        if (showToast) showToast('Report exported successfully', 'success');
      } catch (backendErr) {
        // Client-side fallback using xlsx
        console.warn('Backend export failed, falling back to client-side XLSX export:', backendErr);
        if (reportData?.rows && reportData.rows.length > 0) {
          const exportRows = reportData.rows.map((r) => {
            const rowObj = {};
            if (reportMode === 'DEPARTMENTAL') {
              rowObj['Department'] = r.departmentName || '—';
            }
            rowObj['Course'] = r.courseName || 'General';
            rowObj['Lead Status'] = r.leadStatusName || '—';
            rowObj['Allotted Data'] = r.totalAllotted;
            rowObj['Availed Data'] = r.totalAvailed;
            rowObj['Unallotted Data'] = r.totalUnallotted;
            rowObj['Registered Data'] = r.totalRegistered;
            rowObj['Conversion Ratio (%)'] = `${r.conversionRate.toFixed(2)}%`;
            rowObj['Follow-ups'] = r.totalFollowUps;
            return rowObj;
          });

          const ws = XLSX.utils.json_to_sheet(exportRows);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Performance');
          XLSX.writeFile(
            wb,
            `Performance_Report_${reportMode}_${new Date().toISOString().slice(0, 10)}.xlsx`
          );
          if (showToast) showToast('Report exported successfully (client-side)', 'success');
        } else {
          throw new Error('No data available to export');
        }
      }
    } catch (err) {
      console.error('Export error:', err);
      if (showToast) showToast('Failed to export report: ' + err.message, 'error');
    } finally {
      setExporting(false);
    }
  };

  // Drill-down navigation helper
  const handleDrillDown = (type, row) => {
    const params = new URLSearchParams();
    if (row.courseId) params.set('courseId', row.courseId);
    if (row.leadStatusId) params.set('statusId', row.leadStatusId);
    if (row.departmentId) params.set('departmentId', row.departmentId);

    if (type === 'allotted') {
      params.set('allotted', 'true');
      navigate(`/leads?${params.toString()}`);
    } else if (type === 'availed') {
      params.set('availed', 'true');
      navigate(`/leads?${params.toString()}`);
    } else if (type === 'registered') {
      navigate(`/leads?${params.toString()}`);
    } else if (type === 'followups') {
      navigate(`/followups?courseId=${row.courseId || ''}&leadStatusId=${row.leadStatusId || ''}`);
    }
  };

  const summary = reportData?.summary || {
    totalAllotted: 0,
    totalAvailed: 0,
    totalUnallotted: 0,
    totalRegistered: 0,
    conversionRate: 0,
    totalFollowUps: 0,
  };

  const rows = reportData?.rows || [];
  const totalElements = reportData?.totalElements || 0;
  const totalPages = reportData?.totalPages || 0;

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 md:p-6 space-y-6 font-sans" id="page-reports">
      {/* 1. Header Bar with Mode Toggle & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FiLayers className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Reports & Performance Analytics
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1 pl-9">
            Real-time data-distribution breakdown, conversion ratios, and follow-up metrics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Self / Departmental Mode Toggle */}
          {canViewDeptReport ? (
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => {
                  setReportMode('SELF');
                  setPage(0);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${reportMode === 'SELF'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <FiUser className="w-3.5 h-3.5" />
                Self Report
              </button>
              <button
                type="button"
                onClick={() => {
                  setReportMode('DEPARTMENTAL');
                  setPage(0);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${reportMode === 'DEPARTMENTAL'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <FiUsers className="w-3.5 h-3.5" />
                Departmental Report
              </button>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-100">
              <FiUser className="w-3.5 h-3.5" /> Self Report
            </span>
          )}

          {/* Export Excel Button */}
          {canExport && (
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || loading}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs md:text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <FiDownload className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Export Excel'}
            </button>
          )}

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchReport}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-all"
            title="Refresh Report"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Reusable Multi-Dimensional Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <FiFilter className="text-indigo-600 w-4 h-4" />
            <span>Filter Dimensions</span>
            <span className="text-xs font-normal text-slate-400">
              (All filters apply simultaneously)
            </span>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
          >
            Reset All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5 text-xs">
          {/* Date Preset Filter */}
          <div>
            <label className="block font-medium text-slate-600 mb-1">Date Period</label>
            <select
              value={datePreset}
              onChange={(e) => {
                setDatePreset(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            >
              {DATE_PRESET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Session Filter */}
          <div>
            <label className="block font-medium text-slate-600 mb-1">Session</label>
            <select
              value={sessionId}
              onChange={(e) => {
                setSessionId(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            >
              {sessions.map((sess) => (
                <option key={sess.sessionId} value={sess.sessionId}>
                  {sess.sessionId} {sess.current ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter (Only for Departmental Mode) */}
          {reportMode === 'DEPARTMENTAL' && (
            <div>
              <label className="block font-medium text-slate-600 mb-1">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setSelectedUser('');
                  setPage(0);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* User / Counselor Filter (Only for Departmental Mode) */}
          {reportMode === 'DEPARTMENTAL' && (
            <div>
              <label className="block font-medium text-slate-600 mb-1">Counselor / User</label>
              <select
                value={selectedUser}
                onChange={(e) => {
                  setSelectedUser(e.target.value);
                  setPage(0);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                <option value="">All Counselors</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName || u.username} {u.lastName || ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Course Filter */}
          <div>
            <label className="block font-medium text-slate-600 mb-1">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseName || c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lead Status Filter */}
          <div>
            <label className="block font-medium text-slate-600 mb-1">Lead Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            >
              <option value="">All Statuses</option>
              {leadStatuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Date Range Inputs (when Custom Range selected) */}
        {datePreset === 'CUSTOM' && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
            <span className="font-semibold text-slate-600">Custom Date Range:</span>
            <div className="flex items-center gap-2">
              <label className="text-slate-500">From:</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(0);
                }}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-slate-500">To:</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(0);
                }}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            {fromDate && toDate && fromDate > toDate && (
              <span className="text-rose-600 flex items-center gap-1 font-medium">
                <FiAlertCircle /> From Date must be before or equal to To Date
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. Summary Metric Cards (Reflecting current filters) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Total Allotted */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Allotted</span>
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <FiLayers className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {summary.totalAllotted.toLocaleString()}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Assigned within filter</p>
          </div>
        </div>

        {/* Card 2: Total Availed */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Availed</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <FiCheckCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-emerald-600 tracking-tight">
              {summary.totalAvailed.toLocaleString()}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Claimed / Worked leads</p>
          </div>
        </div>

        {/* Card 3: Total Unallotted */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Unallotted</span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <FiFileText className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-amber-600 tracking-tight">
              {summary.totalUnallotted.toLocaleString()}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Awaiting assignment</p>
          </div>
        </div>

        {/* Card 4: Total Registered */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Registered</span>
            <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <FiCheckCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-purple-600 tracking-tight">
              {summary.totalRegistered.toLocaleString()}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Converted Applications</p>
          </div>
        </div>

        {/* Card 5: Conversion Rate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Conversion Ratio</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <FiTrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-blue-600 tracking-tight">
              {summary.conversionRate.toFixed(2)}%
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Registered / Availed</p>
          </div>
        </div>

        {/* Card 6: Total Follow-ups */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Follow-ups</span>
            <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <FiPhoneCall className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-rose-600 tracking-tight">
              {summary.totalFollowUps.toLocaleString()}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Interactions logged</p>
          </div>
        </div>
      </div>

      {/* 4. Report Table Workspace */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Table Header / Subtitle */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Course & Lead Status Performance Breakdown
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing active Course + Lead Status combinations matching the selected scope and filters
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Rows per page:</span>
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(0);
              }}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-6 text-center">
            <div className="inline-flex p-3 bg-rose-50 text-rose-600 rounded-full mb-2">
              <FiXCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Unable to load report</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">{error}</p>
            <button
              type="button"
              onClick={fetchReport}
              className="mt-3 px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3" />
            <p className="text-xs text-slate-500 font-medium">Aggregating report data...</p>
          </div>
        )}

        {/* Table Content */}
        {!loading && !error && rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  {reportMode === 'DEPARTMENTAL' && (
                    <th
                      className="px-4 py-3.5 cursor-pointer hover:text-indigo-600 select-none"
                      onClick={() => handleSort('departmentName')}
                    >
                      <div className="flex items-center gap-1.5">
                        Department
                        {sortBy === 'departmentName' &&
                          (sortDirection === 'ASC' ? <FiArrowUp /> : <FiArrowDown />)}
                      </div>
                    </th>
                  )}
                  <th
                    className="px-4 py-3.5 cursor-pointer hover:text-indigo-600 select-none"
                    onClick={() => handleSort('courseName')}
                  >
                    <div className="flex items-center gap-1.5">
                      Course
                      {sortBy === 'courseName' &&
                        (sortDirection === 'ASC' ? <FiArrowUp /> : <FiArrowDown />)}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3.5 cursor-pointer hover:text-indigo-600 select-none"
                    onClick={() => handleSort('leadStatusName')}
                  >
                    <div className="flex items-center gap-1.5">
                      Lead Status
                      {sortBy === 'leadStatusName' &&
                        (sortDirection === 'ASC' ? <FiArrowUp /> : <FiArrowDown />)}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3.5 text-right cursor-pointer hover:text-indigo-600 select-none"
                    onClick={() => handleSort('totalAllotted')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      Allotted
                      {sortBy === 'totalAllotted' &&
                        (sortDirection === 'ASC' ? <FiArrowUp /> : <FiArrowDown />)}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3.5 text-right cursor-pointer hover:text-indigo-600 select-none"
                    onClick={() => handleSort('totalAvailed')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      Availed
                      {sortBy === 'totalAvailed' &&
                        (sortDirection === 'ASC' ? <FiArrowUp /> : <FiArrowDown />)}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3.5 text-right cursor-pointer hover:text-indigo-600 select-none"
                    onClick={() => handleSort('totalUnallotted')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      Unallotted
                      {sortBy === 'totalUnallotted' &&
                        (sortDirection === 'ASC' ? <FiArrowUp /> : <FiArrowDown />)}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3.5 text-right cursor-pointer hover:text-indigo-600 select-none"
                    onClick={() => handleSort('totalRegistered')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      Registered
                      {sortBy === 'totalRegistered' &&
                        (sortDirection === 'ASC' ? <FiArrowUp /> : <FiArrowDown />)}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3.5 text-center cursor-pointer hover:text-indigo-600 select-none"
                    onClick={() => handleSort('conversionRate')}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      Conversion %
                      {sortBy === 'conversionRate' &&
                        (sortDirection === 'ASC' ? <FiArrowUp /> : <FiArrowDown />)}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3.5 text-right cursor-pointer hover:text-indigo-600 select-none"
                    onClick={() => handleSort('totalFollowUps')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      Follow-ups
                      {sortBy === 'totalFollowUps' &&
                        (sortDirection === 'ASC' ? <FiArrowUp /> : <FiArrowDown />)}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, idx) => (
                  <tr
                    key={`${row.courseId || 'c'}-${row.leadStatusId || 's'}-${idx}`}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {reportMode === 'DEPARTMENTAL' && (
                      <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">
                        {row.departmentName || '—'}
                      </td>
                    )}
                    <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                      {row.courseName}
                      {row.courseCode && (
                        <span className="ml-1.5 text-[10px] font-normal text-slate-400">
                          ({row.courseCode})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                        {row.leadStatusName}
                      </span>
                    </td>
                    {/* Allotted with Drill-down */}
                    <td className="px-4 py-3 text-right whitespace-nowrap font-medium text-slate-800">
                      {row.totalAllotted > 0 ? (
                        <button
                          type="button"
                          onClick={() => handleDrillDown('allotted', row)}
                          className="text-indigo-600 hover:text-indigo-800 hover:underline font-semibold"
                          title="Drill down to allotted leads"
                        >
                          {row.totalAllotted.toLocaleString()}
                        </button>
                      ) : (
                        0
                      )}
                    </td>
                    {/* Availed with Drill-down */}
                    <td className="px-4 py-3 text-right whitespace-nowrap font-medium text-emerald-600">
                      {row.totalAvailed > 0 ? (
                        <button
                          type="button"
                          onClick={() => handleDrillDown('availed', row)}
                          className="text-emerald-600 hover:text-emerald-800 hover:underline font-semibold"
                          title="Drill down to availed leads"
                        >
                          {row.totalAvailed.toLocaleString()}
                        </button>
                      ) : (
                        0
                      )}
                    </td>
                    {/* Unallotted */}
                    <td className="px-4 py-3 text-right whitespace-nowrap font-medium text-amber-600">
                      {row.totalUnallotted.toLocaleString()}
                    </td>
                    {/* Registered with Drill-down */}
                    <td className="px-4 py-3 text-right whitespace-nowrap font-medium text-purple-600">
                      {row.totalRegistered > 0 ? (
                        <button
                          type="button"
                          onClick={() => handleDrillDown('registered', row)}
                          className="text-purple-600 hover:text-purple-800 hover:underline font-semibold"
                          title="Drill down to registered leads"
                        >
                          {row.totalRegistered.toLocaleString()}
                        </button>
                      ) : (
                        0
                      )}
                    </td>
                    {/* Conversion Rate */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${Math.min(100, row.conversionRate)}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-800">
                          {row.conversionRate.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    {/* Follow-ups with Drill-down */}
                    <td className="px-4 py-3 text-right whitespace-nowrap font-medium text-rose-600">
                      {row.totalFollowUps > 0 ? (
                        <button
                          type="button"
                          onClick={() => handleDrillDown('followups', row)}
                          className="text-rose-600 hover:text-rose-800 hover:underline font-semibold"
                          title="Drill down to follow-ups"
                        >
                          {row.totalFollowUps.toLocaleString()}
                        </button>
                      ) : (
                        0
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Summary / Total Footer Row */}
              <tfoot className="bg-slate-100/80 border-t-2 border-slate-300 text-slate-900 font-bold">
                <tr>
                  {reportMode === 'DEPARTMENTAL' && (
                    <td className="px-4 py-3 text-slate-700">Total / Overall</td>
                  )}
                  <td className="px-4 py-3">
                    {reportMode === 'DEPARTMENTAL' ? '—' : 'Total / Overall'}
                  </td>
                  <td className="px-4 py-3 text-slate-500">—</td>
                  <td className="px-4 py-3 text-right font-bold">
                    {summary.totalAllotted.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-700">
                    {summary.totalAvailed.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-amber-700">
                    {summary.totalUnallotted.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-purple-700">
                    {summary.totalRegistered.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-indigo-700">
                    {summary.conversionRate.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-rose-700">
                    {summary.totalFollowUps.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && rows.length === 0 && (
          <div className="p-12 text-center">
            <div className="inline-flex p-3 bg-slate-100 text-slate-400 rounded-full mb-3">
              <FiFileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">No report records found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no allotted leads matching the current combination of filters and scope.
              Try adjusting the date range, session, or course filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-3 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* 5. Pagination Bar */}
        {!loading && !error && totalElements > 0 && (
          <div className="px-6 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-800">{page * size + 1}</span> to{' '}
              <span className="font-semibold text-slate-800">
                {Math.min((page + 1) * size, totalElements)}
              </span>{' '}
              of <span className="font-semibold text-slate-800">{totalElements}</span> entries
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i;
                if (totalPages > 5 && page > 2) {
                  pageNum = Math.min(page - 2 + i, totalPages - 1);
                }
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold ${page === pageNum
                      ? 'bg-indigo-600 text-white'
                      : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Next Page"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
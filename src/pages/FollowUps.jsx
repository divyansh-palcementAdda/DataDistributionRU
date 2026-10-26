import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { usePermissions } from '../PermissionContext';
import ReusableTable from '../component/reusable/table';
import {
  getAllFollowups,
  rescheduleFollowup,
  completeFollowup,
  markFollowupNotConnected,
  openFollowUp,
  getFollowUpDashboardStats
} from '../Services/followUp/followService';
import FollowupFormModal from "../component/reusable/FollowupFormModal";
import FollowUpCards from "../component/reusable/DashBoards/followUpCards";
import ScheduleModal from "../component/reusable/Leads/scheduleModel";
import * as XLSX from 'xlsx';

const formatFollowUpDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getStatusClass = (value) => {
  switch (value) {
    case "PENDING":
      return "bg-orange-100 text-orange-700";
    case "UPCOMING":
      return "bg-blue-100 text-blue-700";
    case "COMPLETED":
      return "bg-green-100 text-green-700";
    case "MISSED":
      return "bg-red-100 text-red-700";
    case "RESCHEDULED":
      return "bg-blue-100 text-blue-700";
    case "NOT_CONNECTED":
      return "bg-purple-100 text-purple-700";
    case "CANCELLED":
      return "bg-gray-200 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const FollowUps = () => {
  const { showToast, navTo } = useAppContext();
  const { hasPermission } = usePermissions();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // assignedUserId comes from URL search param — single source of truth.
  // /followups                      → null   → All Follow-ups
  // /followups?assignedUserId=123   → '123'  → My Follow-ups
  const assignedUserId = searchParams.get('assignedUserId') ?? null;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [sortBy, setSortBy] = useState("followUpDate");
  const [sortDirection, setSortDirection] = useState("asc");

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isNotConnectedModalOpen, setIsNotConnectedModalOpen] = useState(false);
  const [selectedFollowup, setSelectedFollowup] = useState(null);
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "ALL");
  const [selectedLeadStatusId, setSelectedLeadStatusId] = useState(null);

  const [dashboardStats, setDashboardStats] = useState(null);

  const debounceRef = useRef(null);

  // Sync activeTab if dashboard navigates here with { state: { activeTab: 'TODAY' } }
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state?.activeTab]);

  // Reset filters when assignedUserId changes (All Follow-ups ↔ My Follow-ups navigation)
  useEffect(() => {
    setActiveTab("ALL");
    setSearch("");
    setSearchInput("");
    setFromDate("");
    setToDate("");
    setSelectedLeadStatusId(null);
    setPage(0);
  }, [assignedUserId]);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await getFollowUpDashboardStats({
        userId: assignedUserId || undefined,
        leadStatusIds: selectedLeadStatusId ? [selectedLeadStatusId] : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        search: search || undefined,
      });
      const payload = res?.data ?? res ?? {};
      setDashboardStats(payload);
    } catch (err) {
      console.warn("Could not fetch follow-up dashboard stats:", err?.message || err);
    }
  }, [assignedUserId, selectedLeadStatusId, fromDate, toDate, search]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const handleCardClick = (filter) => {
    if (filter.type === 'leadStatus') {
      setSelectedLeadStatusId(prev => prev === filter.value ? null : filter.value);
      setPage(0);
    }
  };

  const handleSearchInput = (e) => {
    const value = e.target.value;

    setSearchInput(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setSearch(value);
      setPage(0);
    }, 300);
  };

  const handleSort = (column, direction) => {
    setSortBy(column);
    setSortDirection(direction);
    setPage(0);
  };

  const handleReschedule = (row) => {
    setSelectedFollowup(row);
    setIsScheduleModalOpen(true);
  };

  const handleComplete = (row) => {
    setSelectedFollowup(row);
    setIsCompleteModalOpen(true);
  };

  const handleCompleteSubmit = async (remarks) => {
    if (!selectedFollowup?.id) return;
    const targetLeadId = selectedFollowup.leadId || selectedFollowup.lead?.id;

    try {
      await completeFollowup(selectedFollowup.id, { remarks });
      showToast("Follow-up marked as completed! Please update the lead status before leaving.", "info");
      setIsCompleteModalOpen(false);
      setSelectedFollowup(null);

      if (targetLeadId) {
        navTo(`lead-detail/${targetLeadId}`);
      } else {
        fetchData();
        fetchDashboardStats();
      }
    } catch (err) {
      showToast(err?.message || "Failed to complete follow-up", "error");
      setIsCompleteModalOpen(false);
      setSelectedFollowup(null);
    }
  };

  const handleNotConnected = (row) => {
    setSelectedFollowup(row);
    setIsNotConnectedModalOpen(true);
  };

  const handleNotConnectedSubmit = async (remarks) => {
    if (!selectedFollowup?.id) return;

    try {
      await markFollowupNotConnected(selectedFollowup.id, { remarks });
      showToast("Follow-up marked as Not Connected and Lead status updated!", "success");
      fetchData();
      fetchDashboardStats();
    } catch (err) {
      showToast(err?.message || "Failed to mark follow-up as Not Connected", "error");
    } finally {
      setIsNotConnectedModalOpen(false);
      setSelectedFollowup(null);
    }
  };

  const handleViewLead = async (row) => {
    const leadId = row.leadId || row.lead?.id || row.id;
    const followUpId = row.id;
    if (followUpId && row.leadId && row.status === 'PENDING' && !row.completed) {
      try {
        await openFollowUp(followUpId);
        showToast("Follow-up opened and automatically marked as completed", "info");
      } catch (err) {
        console.warn("Follow-up open handled:", err?.message || err);
      }
    }
    if (leadId) {
      navTo(`lead-detail/${leadId}`);
    }
  };

  const handleScheduleSubmit = async (payload) => {
    try {
      if (selectedFollowup?.id) {
        await rescheduleFollowup(selectedFollowup.id, {
          newFollowUpDate: payload.followUpDate,
          remarks: payload.remarks,
        });
        showToast("Follow-up rescheduled successfully", "success");
      } else {
        showToast("Follow-up scheduled successfully", "success");
      }
      fetchData();
      fetchDashboardStats();
    } catch (error) {
      showToast(error?.message || "Error rescheduling follow-up", "error");
    } finally {
      setSelectedFollowup(null);
    }
  };

  const downloadExcel = async () => {
    try {
      // Fetch all followups with canonical API using current active filters
      const res = await getAllFollowups({
        page: 0,
        size: 10000,
        sortBy,
        sortDirection: sortDirection.toUpperCase(),
        search,
        category: activeTab,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        leadStatusIds: selectedLeadStatusId ? [selectedLeadStatusId] : [],
        userId: assignedUserId || undefined,
      });

      const apiData = res?.data ?? res ?? {};
      const payload = apiData?.data ?? apiData;

      const allFollowupsData = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.content)
          ? payload.content
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

      if (allFollowupsData.length === 0) {
        showToast('No follow-up records found to export', 'info');
        return;
      }

      // Flatten the followups data for Excel export
      const excelData = allFollowupsData.map((followup, index) => {
        return {
          'S.No': index + 1,
          'Lead Name': followup.leadFullName || followup.leadName || followup.name || 'N/A',
          'Lead Code': followup.leadCode || followup.mobileNo || followup.phone || 'N/A',
          'Follow-up Date': formatFollowUpDate(followup.followUpDate),
          'Remarks': followup.remarks || 'N/A',
          'Status': followup.status || 'N/A',
          'Created By': followup?.createdBy?.firstName || followup?.createdBy?.lastName
            ? `${followup.createdBy.firstName || ""} ${followup.createdBy.lastName || ""}`.trim()
            : followup?.createdBy?.username || 'N/A',
          'Lead ID': followup.leadId || followup.id || 'N/A'
        };
      });

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Follow-ups');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `followups_export_${timestamp}.xlsx`;

      // Download the file
      XLSX.writeFile(workbook, filename);

      showToast('Excel file downloaded successfully', 'success');
    } catch (error) {
      console.error('Error downloading Excel:', error);
      showToast('Failed to download Excel file', 'error');
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getAllFollowups({
        page,
        size,
        sortBy,
        sortDirection: sortDirection.toUpperCase(),
        search,
        category: activeTab,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        leadStatusIds: selectedLeadStatusId ? [selectedLeadStatusId] : [],
        userId: assignedUserId || undefined,
      });

      const apiData = res?.data ?? res ?? {};
      const payload = apiData?.data ?? apiData;

      const content = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.content)
          ? payload.content
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

      setData(content);
      setTotalElements(payload?.totalElements || content.length || 0);
      setTotalPages(payload?.totalPages || 1);
    } catch (err) {
      const msg = err?.message || (typeof err === 'string' ? err : "Error fetching followups");
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    size,
    sortBy,
    sortDirection,
    search,
    activeTab,
    fromDate,
    toDate,
    selectedLeadStatusId,
    assignedUserId,
    showToast,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = [
    {
      key: "sno",
      sortable: false,
      header: "S.no",
      render: (_, __, index) => index + 1 + (page * size),
    },
    {
      key: "leadFullName",
      header: "Lead Name",
      render: (_, row) => (
        <div>
          <div className="font-semibold text-gray-900">
            {row.leadFullName || row.leadName || row.name || "-"}
          </div>
          <div className="text-xs text-gray-400">
            {row.leadCode || row.mobileNo || row.phone || "-"}
          </div>
        </div>
      ),
    },

    {
      key: "followUpDate",
      header: "Follow-up Date",
      render: (value) => formatFollowUpDate(value),
    },

    {
      key: "remarks",
      header: "Remarks",
      render: (value) => value || "-",
    },

    {
      key: "status",
      header: "Status",
      render: (value) => {
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(value)}`}
          >
            {value || "-"}
          </span>
        );
      },
    },

    {
      key: "createdBy",
      header: "Created By",
      render: (_value, row) =>
        row?.createdBy?.firstName || row?.createdBy?.lastName
          ? `${row.createdBy.firstName || ""} ${row.createdBy.lastName || ""}`.trim()
          : row?.createdBy?.username || "-",
    },

    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          {hasPermission('FOLLOWUP_VIEW') && (
            <button
              className="btn btn-sm btn-primary"
              onClick={() => handleViewLead(row)}
            >
              View
            </button>
          )}
        </div>
      ),
    },
  ];

  const filterTabs = [
    {
      value: "ALL",
      label: "ALL",
      count: dashboardStats?.allFollowUps !== undefined ? dashboardStats.allFollowUps : totalElements,
      iconBg: '#E0E7FF',
      iconStroke: '#4F46E5',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      )
    },
    {
      value: "TODAY",
      label: "TODAY'S DUE",
      count: dashboardStats?.todayFollowUps,
      iconBg: '#FEF3C7',
      iconStroke: '#D97706',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <path d="M12 6v6M12 18h.01" />
        </svg>
      )
    },
    // {
    //   value: "TODAY_CONTINUOUS",
    //   label: "TODAY'S CONTINUOUS",
    //   count: dashboardStats?.todayContinuousFollowUps,
    //   iconBg: '#CFFAFE',
    //   iconStroke: '#0891B2',
    //   icon: (
    //     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //       <polyline points="23 4 23 10 17 10" />
    //       <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    //     </svg>
    //   )
    // },
    // {
    //   value: "TODAY_NOT_CONNECTED",
    //   label: "TODAY'S NOT CONNECTED",
    //   count: dashboardStats?.todayNotConnectedFollowUps,
    //   iconBg: '#FFE4E6',
    //   iconStroke: '#E11D48',
    //   icon: (
    //     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //       <circle cx="12" cy="12" r="10" />
    //       <line x1="15" y1="9" x2="9" y2="15" />
    //       <line x1="9" y1="9" x2="15" y2="15" />
    //     </svg>
    //   )
    // },
    {
      value: "PENDING",
      label: "PENDING",
      count: dashboardStats?.pendingFollowUps,
      iconBg: '#FFEDD5',
      iconStroke: '#EA580C',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    },
    {
      value: "UPCOMING",
      label: "UPCOMING",
      count: dashboardStats?.upcomingFollowUps,
      iconBg: '#DBEAFE',
      iconStroke: '#2563EB',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 14 10" />
        </svg>
      )
    },
    {
      value: "COMPLETED",
      label: "COMPLETED",
      count: dashboardStats?.completedFollowUps,
      iconBg: '#D1FAE5',
      iconStroke: '#059669',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      )
    },
    {
      value: "MISSED",
      label: "MISSED",
      count: dashboardStats?.missedFollowUps,
      iconBg: '#FEE2E2',
      iconStroke: '#DC2626',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      )
    },
    {
      value: "NOT_CONNECTED",
      label: "NOT CONNECTED",
      count: dashboardStats?.notConnectedFollowUps,
      iconBg: '#F3E8FF',
      iconStroke: '#9333EA',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="m4.93 4.93 14.14 14.14" />
        </svg>
      )
    },
    {
      value: "CANCELLED",
      label: "CANCELLED",
      count: dashboardStats?.cancelledFollowUps,
      iconBg: '#F1F5F9',
      iconStroke: '#64748B',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      )
    },
  ];

  return (
    <div>
      {/* Header */}
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: "700",
            }}
          >
            Follow-up Management
          </h1>

          <p className="text-sm text-gray-500">
            Track and manage follow-ups across categories and outcomes
          </p>
        </div>
        <div className="flex gap-2 h-8">
          {/* Download Excel */}
          <button
            className="flex items-center gap-1.5"
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              padding: '4px 12px',
              fontSize: '12px',
              borderRadius: '4px',
              cursor: 'pointer',
              boxShadow: 'none'
            }}
            onClick={downloadExcel}
            disabled={loading || data.length === 0}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Download
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <FollowUpCards
        onCardClick={handleCardClick}
        activeFilters={selectedLeadStatusId ? [{ type: 'leadStatus', value: selectedLeadStatusId }] : []}
        assignedUserId={assignedUserId}
      />

      {/* Filter Status Cards */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '12px',
        }}>
          {filterTabs.map((tab) => {
            const isSelected = activeTab === tab.value;
            return (
              <div
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value);
                  setPage(0);
                }}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: isSelected
                    ? '0 0 0 2px #6366f1, 0 4px 16px rgba(99,102,241,0.18)'
                    : '0 2px 8px rgba(0, 0, 0, 0.08)',
                  border: isSelected
                    ? '2px solid #6366f1'
                    : '1px solid #e5e7eb',
                  transition: 'all 0.25s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  height: '80px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Active indicator badge */}
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    background: '#6366f1',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  height: '100%',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flex: 1,
                    minWidth: 0,
                  }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: tab.iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ color: tab.iconStroke }}>
                        {tab.icon}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      minWidth: 0,
                      flex: 1,
                    }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#1e293b',
                        lineHeight: '1.2',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {tab.label}
                      </span>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        color: isSelected ? '#4f46e5' : '#64748b',
                        marginTop: '2px',
                      }}>
                        {tab.count !== undefined && tab.count !== null ? Number(tab.count).toLocaleString() : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters Bar: Search, Date Range, Active Filter Pills, and Clear Button */}
      <div
        className="filter-bar"
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "16px",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Search Input */}
          <input
            type="text"
            className="form-control"
            placeholder="Search lead or remarks..."
            value={searchInput}
            onChange={handleSearchInput}
            style={{ width: "230px" }}
          />

          {/* From Date */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>From:</span>
            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(0);
              }}
              style={{ width: "140px" }}
            />
          </div>

          {/* To Date */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>To:</span>
            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(0);
              }}
              style={{ width: "140px" }}
            />
          </div>

          {/* Active Lead Status Pill */}
          {selectedLeadStatusId && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "16px",
                backgroundColor: "#EEF2FF",
                color: "#4338CA",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              Status Filter Active
              <button
                type="button"
                onClick={() => {
                  setSelectedLeadStatusId(null);
                  setPage(0);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#4338CA",
                  padding: 0,
                  fontSize: "14px",
                  lineHeight: 1,
                }}
                title="Remove Lead Status Filter"
              >
                ×
              </button>
            </span>
          )}

          {/* Clear All Filters Button */}
          {(search || searchInput || fromDate || toDate || selectedLeadStatusId || activeTab !== "ALL") && (
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setFromDate("");
                setToDate("");
                setSelectedLeadStatusId(null);
                setActiveTab("ALL");
                setPage(0);
              }}
              style={{
                fontSize: "12px",
                color: "#dc2626",
                border: "1px solid #fecaca",
                backgroundColor: "#fef2f2",
                borderRadius: "6px",
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Results summary text */}
        <div style={{ fontSize: "12px", color: "#64748b" }}>
          Showing {totalElements} {totalElements === 1 ? "record" : "records"}
        </div>
      </div>

      {/* Table / Error / Loading */}
      <div className="card">
        {loading ? (
          <div
            style={{
              padding: "50px",
              textAlign: "center",
            }}
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3" />
            <span style={{ fontSize: "14px", color: "#64748b" }}>Loading followups...</span>
          </div>
        ) : error ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#dc2626" }}>
            <p style={{ fontWeight: "600", marginBottom: "8px" }}>Failed to load follow-up data</p>
            <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px" }}>{error}</p>
            <button
              className="btn btn-sm btn-primary"
              onClick={fetchData}
            >
              Retry
            </button>
          </div>
        ) : (
          <ReusableTable
            columns={columns}
            data={data}
            emptyMessage="No followups found."
            isServerSide={true}
            totalElements={totalElements}
            totalPages={totalPages}
            currentPage={page + 1}
            rowsPerPage={size}
            onPageChange={(newPage) =>
              setPage(newPage - 1)
            }
            onRowsPerPageChange={(newSize) => {
              setSize(newSize);
              setPage(0);
            }}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        )}
      </div>

      <FollowupFormModal
        isOpen={isFollowupModalOpen}
        onClose={() => setIsFollowupModalOpen(false)}
        onSubmit={() => {
          setIsFollowupModalOpen(false);
          fetchData();
          fetchDashboardStats();
        }}
      />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSelectedFollowup(null);
        }}
        onSubmit={handleScheduleSubmit}
      />

      {/* Complete Followup Modal */}
      {isCompleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)' }}
        >
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Complete Follow-up</h3>
            <p className="text-xs text-slate-500 mb-4">Add completion remarks or feedback for this follow-up.</p>
            <textarea
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
              rows="3"
              placeholder="Add remarks (optional)"
              id="completeRemarks"
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                onClick={() => {
                  setIsCompleteModalOpen(false);
                  setSelectedFollowup(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                onClick={() => {
                  const remarks = document.getElementById('completeRemarks')?.value || '';
                  handleCompleteSubmit(remarks);
                }}
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Not Connected Modal */}
      {isNotConnectedModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)' }}
        >
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Mark as Not Connected</h3>
            <p className="text-xs text-slate-500 mb-4">Record attempt remarks and update lead status.</p>
            <textarea
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
              rows="3"
              placeholder="Add remarks (optional)"
              id="notConnectedRemarks"
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                onClick={() => {
                  setIsNotConnectedModalOpen(false);
                  setSelectedFollowup(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                onClick={() => {
                  const remarks = document.getElementById('notConnectedRemarks')?.value || '';
                  handleNotConnectedSubmit(remarks);
                }}
              >
                Mark Not Connected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUps;

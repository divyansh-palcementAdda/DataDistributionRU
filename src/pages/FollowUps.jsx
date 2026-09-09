import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { usePermissions } from '../PermissionContext';
import ReusableTable from '../component/reusable/table';
import { getAllFollowups, getTodayFollowups, rescheduleFollowup, completeFollowup, markFollowupNotConnected } from '../Services/followUp/followService';
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

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [sortBy, setSortBy] = useState("followUpDate");
  const [sortDirection, setSortDirection] = useState("asc");

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isNotConnectedModalOpen, setIsNotConnectedModalOpen] = useState(false);
  const [selectedFollowup, setSelectedFollowup] = useState(null);
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "ALL");
  const [selectedLeadStatusId, setSelectedLeadStatusId] = useState(null);

  const debounceRef = useRef(null);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state?.activeTab]);

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

    try {
      await completeFollowup(selectedFollowup.id, { remarks });
      showToast("Follow-up marked as completed!", "success");
      fetchData();
    } catch (err) {
      showToast(err?.message || "Failed to complete follow-up", "error");
    } finally {
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
    } catch (err) {
      showToast(err?.message || "Failed to mark follow-up as Not Connected", "error");
    } finally {
      setIsNotConnectedModalOpen(false);
      setSelectedFollowup(null);
    }
  };

  const handleViewLead = (row) => {
    const leadId = row.leadId || row.id;
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
    } catch (error) {
      showToast(error?.message || "Error rescheduling follow-up", "error");
    } finally {
      setSelectedFollowup(null);
    }
  };

  const downloadExcel = () => {
    try {
      // Flatten the followups data for Excel export
      const excelData = data.map((followup, index) => {
        return {
          'S.No': (page * size) + index + 1,
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
      
      showToast('Excel file downloaded successfully');
    } catch (error) {
      console.error('Error downloading Excel:', error);
      showToast('Failed to download Excel file', 'error');
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      let res;
      if (activeTab === "TODAY") {
        res = await getTodayFollowups({
          page,
          size,
          sortBy,
          sortDirection: sortDirection.toUpperCase(),
          search,
        });
      } else {
        res = await getAllFollowups({
          page,
          size,
          sortBy,
          sortDirection: sortDirection.toUpperCase(),
          search,
          status: activeTab === "ALL" ? "" : activeTab,
          leadStatusIds: selectedLeadStatusId ? [selectedLeadStatusId] : [],
        });
      }

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
      showToast("Error fetching followups", "error");
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
    selectedLeadStatusId,
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
          {(row.status === "PENDING" || row.status === "UPCOMING") && (
            <>
              <button
                className="px-2 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded text-xs font-medium transition-colors"
                onClick={() => handleComplete(row)}
                title="Complete Follow-up"
              >
                Done
              </button>
              <button
                className="px-2 py-1 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded text-xs font-medium transition-colors"
                onClick={() => handleNotConnected(row)}
                title="Mark Follow-up as Not Connected"
              >
                Not Connected
              </button>
            </>
          )}
        </div>
      ),
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
            Track and manage follow-ups
          </p>
        </div>
        <div className="flex gap-2 h-8">
          {/* Download Excel */}
          <button
            className="flex items-center gap-1.5"
            style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '4px 10px', fontSize: '12px', borderRadius: '4px', cursor: 'pointer', boxShadow: 'none' }}
            onClick={downloadExcel}
            disabled={data.length === 0}
          >
            <svg
              width="10"
              height="10"
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
      />

      {/* Filter Status Cards */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '12px',
        }}>
          {[
            {
              value: "ALL", label: "ALL", iconBg: '#E0E7FF', iconStroke: '#4F46E5', icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              )
            },
            {
              value: "TODAY", label: "TODAY'S DUE", iconBg: '#FEF3C7', iconStroke: '#D97706', icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                  <path d="M12 6v6M12 18h.01" />
                </svg>
              )
            },
            {
              value: "PENDING", label: "PENDING", iconBg: '#FFF7ED', iconStroke: '#EA580C', icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              )
            },
            {
              value: "COMPLETED", label: "COMPLETED", iconBg: '#D1FAE5', iconStroke: '#059669', icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              )
            },
            {
              value: "MISSED", label: "MISSED", iconBg: '#FEE2E2', iconStroke: '#DC2626', icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              )
            },
          ].map((tab) => (
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
                boxShadow: activeTab === tab.value
                  ? '0 0 0 2px #6366f1, 0 4px 16px rgba(99,102,241,0.18)'
                  : '0 2px 8px rgba(0, 0, 0, 0.08)',
                border: activeTab === tab.value
                  ? '2px solid #6366f1'
                  : '1px solid #e5e7eb',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                height: '80px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Active indicator badge */}
              {activeTab === tab.value && (
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
                      width: '40px',
                      height: '40px',
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
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1e293b',
                    lineHeight: '1.3',
                    flex: 1,
                  }}>
                    {tab.label}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div
        className="filter-bar"
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "16px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          className="form-control"
          placeholder="Search followup..."
          value={searchInput}
          onChange={handleSearchInput}
          style={{ maxWidth: "250px" }}
        />
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div
            style={{
              padding: "50px",
              textAlign: "center",
            }}
          >
            Loading followups...
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Complete Follow-up</h3>
            <textarea
              className="form-control mb-4"
              rows="3"
              placeholder="Add remarks (optional)"
              id="completeRemarks"
            />
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setIsCompleteModalOpen(false);
                  setSelectedFollowup(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Mark as Not Connected</h3>
            <textarea
              className="form-control mb-4"
              rows="3"
              placeholder="Add remarks (optional)"
              id="notConnectedRemarks"
            />
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setIsNotConnectedModalOpen(false);
                  setSelectedFollowup(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
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

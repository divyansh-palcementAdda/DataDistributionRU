import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { usePermissions } from '../PermissionContext';
import ReusableTable from '../component/reusable/table';
import { getAllFollowups } from '../Services/followUp/followService';
import FollowupFormModal from "../component/reusable/FollowupFormModal";
import LeadCards from "../component/reusable/DashBoards/leadCards";
import ScheduleModal from "../component/reusable/Leads/scheduleModel";

const formatFollowUpDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const getStatusClass = (value) => {
  switch (value) {
    case "PENDING":
      return "bg-orange-100 text-orange-700";
    case "COMPLETED":
      return "bg-green-100 text-green-700";
    case "MISSED":
      return "bg-red-100 text-red-700";
    case "RESCHEDULED":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const FollowUps = () => {
  const { showToast, navTo } = useAppContext();
  const { hasPermission } = usePermissions();

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
  const [selectedFollowup, setSelectedFollowup] = useState(null);
  const [activeTab, setActiveTab] = useState("PENDING");
  const [selectedLeadStatusId, setSelectedLeadStatusId] = useState(null);

  const debounceRef = useRef(null);

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

  const handleViewLead = (row) => {
    const leadId = row.leadId || row.id;
    if (leadId) {
      navTo(`lead-detail/${leadId}`);
    }
  };

  const handleScheduleSubmit = async (payload) => {
    try {
      // Here you can add the API call to reschedule the followup
      // For now, just showing a toast and refreshing data
      showToast("Follow-up rescheduled successfully", "success");
      fetchData();
    } catch (error) {
      showToast("Error rescheduling follow-up", "error");
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const res = await getAllFollowups({
        page,
        size,
        sortBy,
        sortDirection: sortDirection.toUpperCase(),
        search,
        status: activeTab === "ALL" ? "" : activeTab,
        leadStatusIds: selectedLeadStatusId ? [selectedLeadStatusId] : [],
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
        <div className="flex gap-2">
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
      </div>

      {/* ── Stat Cards ── */}
      <LeadCards 
        onCardClick={handleCardClick} 
        activeFilters={selectedLeadStatusId ? [{ type: 'leadStatus', value: selectedLeadStatusId }] : []}
      />

      {/* Search */}
      <div
        className="filter-bar"
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "16px",
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
        <select
          className="form-control"
          value={activeTab}
          onChange={(e) => {
            setActiveTab(e.target.value);
            setPage(0);
          }}
          style={{ maxWidth: "150px" }}
        >
          <option value="ALL">ALL</option>
          <option value="PENDING">PENDING</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="MISSED">MISSED</option>
        </select>
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
    </div>
  );
};

export default FollowUps;

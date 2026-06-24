import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAppContext } from "../AppContext";
import ReusableTable from "../component/reusable/table";
import { getAllFollowups } from "../Services/followUp/followService"

const nextDir = (cur) => (cur === "ASC" ? "DESC" : "ASC");

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

const SortIcon = ({ active, direction }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? "var(--primary)" : "var(--gray-400)"}
    strokeWidth="2.5"
    style={{
      marginLeft: "4px",
      flexShrink: 0,
      transform:
        active && direction === "DESC"
          ? "rotate(180deg)"
          : "none",
    }}
  >
    <path
      d="M12 5l7 7H5z"
      fill={active ? "var(--primary)" : "var(--gray-400)"}
      stroke="none"
    />
  </svg>
);

const FollowUps = () => {
  const { showToast } = useAppContext();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [sortBy, setSortBy] = useState("followUpDate");
  const [sortDirection, setSortDirection] = useState("ASC");

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [activeTab, setActiveTab] = useState("PENDING");

  const debounceRef = useRef(null);

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

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const res = await getAllFollowups({
        page,
        size,
        sortBy,
        sortDirection,
        search,
        status: activeTab === "ALL" ? "" : activeTab,
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
    showToast,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(nextDir(sortDirection));
    } else {
      setSortBy(column);
      setSortDirection("ASC");
    }

    setPage(0);
  };

  const SortHeader = ({ keyName, label }) => (
    <div
      onClick={() => handleSort(keyName)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      {label}
      <SortIcon
        active={sortBy === keyName}
        direction={sortDirection}
      />
    </div>
  );

  const columns = [
    {
      key: "leadFullName",
      header: (
        <SortHeader
          keyName="leadFullName"
          label="Lead Name"
        />
      ),
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
      header: (
        <SortHeader
          keyName="followUpDate"
          label="Follow-up Date"
        />
      ),
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
          <button
            className="btn btn-sm btn-outline"
            onClick={() =>
              showToast("Rescheduled")
            }
          >
            Reschedule
          </button>

          <button
            className="btn btn-sm btn-primary"
            onClick={() =>
              showToast("Action Taken")
            }
          >
            Action
          </button>
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

        {/* <button
          className="btn btn-primary btn-sm"
          onClick={openAddLeadModal}
        >
          + Schedule Follow-up
        </button> */}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          className={`btn btn-sm ${activeTab === "PENDING"
            ? "btn-primary"
            : "btn-outline"
            }`}
          onClick={() => {
            setActiveTab("PENDING");
            setPage(0);
          }}
        >
          Pending
        </button>

        <button
          className={`btn btn-sm ${activeTab === "COMPLETED"
            ? "btn-primary"
            : "btn-outline"
            }`}
          onClick={() => {
            setActiveTab("COMPLETED");
            setPage(0);
          }}
        >
          Completed
        </button>

        <button
          className={`btn btn-sm ${activeTab === "ALL"
            ? "btn-primary"
            : "btn-outline"
            }`}
          onClick={() => {
            setActiveTab("ALL");
            setPage(0);
          }}
        >
          All
        </button>
      </div>

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
          />
        )}
      </div>
    </div>
  );
};

export default FollowUps;

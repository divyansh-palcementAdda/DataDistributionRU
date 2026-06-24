import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAppContext } from "../AppContext";
import ReusableTable from "../component/reusable/table";
import { getAllFollowups } from "../Services/followUp/followService"

const nextDir = (cur) => (cur === "ASC" ? "DESC" : "ASC");

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
  const { openAddLeadModal, showToast } = useAppContext();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [sortBy, setSortBy] = useState("date");
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
        status: activeTab,
      });

      const payload = res?.data?.data || res?.data || {};

      const content = Array.isArray(payload)
        ? payload
        : payload.content || payload.data || [];

      setData(content);
      setTotalElements(payload.totalElements || 0);
      setTotalPages(payload.totalPages || 0);
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
      key: "leadName",
      header: (
        <SortHeader
          keyName="leadName"
          label="Lead Name"
        />
      ),
      render: (_, row) => (
        <div>
          <div className="font-semibold text-gray-900">
            {row.leadName || row.name || "-"}
          </div>
          <div className="text-xs text-gray-400">
            {row.mobileNo || row.phone || "-"}
          </div>
        </div>
      ),
    },

    {
      key: "course",
      header: "Course",
      render: (value) => value || "-",
    },

    {
      key: "type",
      header: "Type",
      render: (value) => value || "-",
    },

    {
      key: "date",
      header: (
        <SortHeader
          keyName="date"
          label="Date"
        />
      ),
      render: (value) => value || "-",
    },

    {
      key: "time",
      header: "Time",
      render: (value) => value || "-",
    },

    {
      key: "status",
      header: "Status",
      render: (value) => {
        let className =
          "bg-gray-100 text-gray-700";

        if (value === "TODAY") {
          className =
            "bg-orange-100 text-orange-700";
        }

        if (value === "UPCOMING") {
          className =
            "bg-green-100 text-green-700";
        }

        if (value === "MISSED") {
          className =
            "bg-red-100 text-red-700";
        }

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}
          >
            {value}
          </span>
        );
      },
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
          className={`btn btn-sm ${activeTab === "TODAY"
            ? "btn-primary"
            : "btn-outline"
            }`}
          onClick={() => {
            setActiveTab("TODAY");
            setPage(0);
          }}
        >
          Today
        </button>

        <button
          className={`btn btn-sm ${activeTab === "UPCOMING"
            ? "btn-primary"
            : "btn-outline"
            }`}
          onClick={() => {
            setActiveTab("UPCOMING");
            setPage(0);
          }}
        >
          Upcoming
        </button>

        <button
          className={`btn btn-sm ${activeTab === "MISSED"
            ? "btn-primary"
            : "btn-outline"
            }`}
          onClick={() => {
            setActiveTab("MISSED");
            setPage(0);
          }}
        >
          Missed
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

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAppContext } from "../AppContext";
import ReusableTable from "../component/reusable/table";
import { getAllFollowups } from "../Services/followUp/followService";
import FollowupFormModal from "../component/reusable/FollowupFormModal";

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

/* ── Stat Cards data ── */
const followupStatCards = [
  {
    color: 'orange',
    label: 'Form Follow up',
    value: '0',
    iconBg: '#FFF7ED',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <path d="M8 14h.01M12 14h.01M16 14h.01" />
      </svg>
    ),
  },
  {
    color: 'blue',
    label: 'Counselling Follow-up',
    value: '0',

    iconBg: 'var(--primary-light)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    color: 'green',
    label: 'Registered',
    value: '0',
    iconBg: 'var(--success-light)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    color: 'orange',
    label: 'Continue Form Follow-up',
    value: '0',
    iconBg: '#FFF7ED',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2">
        <path d="M17 14V2H7v12l5 5 5-5z" />
        <path d="M9 18l-6 6" />
        <path d="M15 18l6 6" />
      </svg>
    ),
  },
  {
    color: 'purple',
    label: 'Interested Form Follow-up',
    value: '0',
    iconBg: '#F3E8FF',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
];

/* ── Arrow icons ── */
const ArrowUp = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);
const ArrowDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="6 9 12 15 18 9" />
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
  const [sortDirection, setSortDirection] = useState("asc");

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("PENDING");

  const debounceRef = useRef(null);

  // Calculate stat cards based on followup data
  const calculatedStatCards = useMemo(() => {
    const formFollowUp = data.filter(d => d.status === 'formfollowup' || d.status === 'FORMFOLLOWUP' || d.followUpType === 'formfollowup').length;
    const counsellingFollowUp = data.filter(d => d.status === 'counsellingfollowup' || d.status === 'COUNSELLINGFOLLOWUP' || d.followUpType === 'counsellingfollowup').length;
    const registered = data.filter(d => d.status === 'registered' || d.status === 'REGISTERED' || d.followUpType === 'registered').length;
    const continueFormFollowUp = data.filter(d => d.status === 'continueformfollowup' || d.status === 'CONTINUEFORMFOLLOWUP' || d.followUpType === 'continueformfollowup').length;
    const interestedFollowUpNotInterested = data.filter(d => d.status === 'interestedfollowupnotinterested' || d.status === 'INTERESTEDFOLLOWUPNOTINTERESTED' || d.followUpType === 'interestedfollowupnotinterested').length;

    return followupStatCards.map(card => {
      switch (card.label) {
        case 'Form Follow up': return { ...card, value: formFollowUp.toLocaleString() };
        case 'Counselling Follow-up': return { ...card, value: counsellingFollowUp.toLocaleString() };
        case 'Registered': return { ...card, value: registered.toLocaleString() };
        case 'Continue Form Follow-up': return { ...card, value: continueFormFollowUp.toLocaleString() };
        case 'Interested Form Follow-up': return { ...card, value: interestedFollowUpNotInterested.toLocaleString() };
        default: return card;
      }
    });
  }, [data]);

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
          <button
            className="btn btn-sm btn-outline"
            onClick={() =>
              showToast("Rescheduled")
            }
          >
            Reschedule
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
      </div>

      {/* ── Stat Cards ── */}
      <div className="stat-grid mb-5">
        {calculatedStatCards.map((card) => (
          <div key={card.label} className={`stat-card ${card.color}`}>
            <div className="stat-label">{card.label}</div>
            <div className="stat-value">{card.value}</div>
          
            <div className="stat-icon" style={{ background: card.iconBg }}>
              {card.icon}
            </div>
          </div>
        ))}
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
    </div>
  );
};

export default FollowUps;

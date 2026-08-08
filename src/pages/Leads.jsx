import { useState, useMemo, useEffect } from 'react';
import { FiEye, FiEdit, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import { statusConfig } from '../mockData';
import { getAllLeads, deleteLead } from '../Services/lead/leadService';
import { getAllCourses } from '../Services/course/course';
import { useAppContext } from '../AppContext';
import ReusableTable from '../component/reusable/table';
import LeadRemarkModal from '../component/reusable/Leads/LeadRemarkModal';
import DeleteModal from "../component/reusable/deleteModel"


const STATUSES = [
  { value: '', label: 'All Status' },
  { value: 'raw', label: 'Raw Lead' },
  { value: 'connected', label: 'Connected' },
  { value: 'interested', label: 'Interested' },
  { value: 'registered', label: 'Registered' },
  { value: 'notinterested', label: 'Not Interested' },
  { value: 'bad', label: 'Bad Lead' },
];

/* ── Stat Cards data ── */
const leadStatCards = [
  {
    color: 'blue',
    label: 'Raw Lead',
    value: '0',
    change: '+12.5% this month',
    changeColor: 'var(--success)',
    up: true,
    iconBg: 'var(--primary-light)',
    iconStroke: 'var(--primary)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    color: 'blue',
    label: 'Connected',
    value: '0',
    change: '+8.2% this month',
    changeColor: 'var(--success)',
    up: true,
    iconBg: 'var(--primary-light)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.9" />
      </svg>
    ),
  },
  {
    color: 'gray',
    label: 'Not Connected',
    value: '0',
    change: '+5.0% this month',
    changeColor: 'var(--primary)',
    up: true,
    iconBg: 'var(--gray-100)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-500)" strokeWidth="2">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    color: 'green',
    label: 'Interested',
    value: '0',
    change: '+10.0% this month',
    changeColor: 'var(--success)',
    up: true,
    iconBg: 'var(--success-light)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
        <path d="M17 14V2H7v12l5 5 5-5z" />
        <path d="M9 18l-6 6" />
        <path d="M15 18l6 6" />
      </svg>
    ),
  },
  {
    color: 'green',
    label: 'Registered',
    value: '0',
    change: '+18.6% this month',
    changeColor: 'var(--success)',
    up: true,
    iconBg: 'var(--success-light)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    color: 'purple',
    label: 'My Assigned Leads',
    value: '0',
    change: '+15.0% this month',
    changeColor: 'var(--success)',
    up: true,
    iconBg: '#F3E8FF',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    color: 'orange',
    label: 'Form Follow up',
    value: '0',
    change: '+7.0% this month',
    changeColor: 'var(--warning)',
    up: true,
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
    color: 'red',
    label: 'Not Interested',
    value: '0',
    change: '-2.5% this month',
    changeColor: 'var(--danger)',
    up: false,
    iconBg: 'var(--danger-light)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    color: 'red',
    label: 'Finally Not Interested',
    value: '0',
    change: '+1.5% this month',
    changeColor: 'var(--danger)',
    up: false,
    iconBg: 'var(--danger-light)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    color: 'red',
    label: 'Bad Lead',
    value: '0',
    change: '+2.1% this month',
    changeColor: 'var(--danger)',
    up: false,
    iconBg: 'var(--danger-light)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
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

const COUNSELORS = ['All Counselors', 'Rahul Singh', 'Neha Joshi', 'Priya Patel', 'Vikram Das'];
const COURSES = ['All Courses'];

const Leads = () => {
  const { openAddLeadModal, navTo, showToast } = useAppContext();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCounselor, setFilterCounselor] = useState('All Counselors');
  const [filterCourse, setFilterCourse] = useState('All Courses');
  const [selectedIds, setSelectedIds] = useState([]);
  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // API State
  const [leadsData, setLeadsData] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [coursesData, setCoursesData] = useState([]);

  // Calculate stat cards based on leads data
  const calculatedStatCards = useMemo(() => {
    const rawLeads = leadsData.filter(l => l.currentStatus === 'raw' || l.currentStatus === 'RAW').length;
    const connectedLeads = leadsData.filter(l => l.currentStatus === 'connected' || l.currentStatus === 'CONNECTED').length;
    const notConnectedLeads = leadsData.filter(l => l.currentStatus === 'notconnected' || l.currentStatus === 'NOTCONNECTED').length;
    const interestedLeads = leadsData.filter(l => l.currentStatus === 'interested' || l.currentStatus === 'INTERESTED').length;
    const registeredLeads = leadsData.filter(l => l.currentStatus === 'registered' || l.currentStatus === 'REGISTERED').length;
    const myAssignedLeads = leadsData.filter(l => l.assignedTo && l.assignedTo !== '').length;
    const formFollowUp = leadsData.filter(l => l.currentStatus === 'formfollowup' || l.currentStatus === 'FORMFOLLOWUP').length;
    const notInterestedLeads = leadsData.filter(l => l.currentStatus === 'notinterested' || l.currentStatus === 'NOTINTERESTED').length;
    const finallyNotInterested = leadsData.filter(l => l.currentStatus === 'finallynotinterested' || l.currentStatus === 'FINALLYNOTINTERESTED').length;
    const badLeads = leadsData.filter(l => l.currentStatus === 'bad' || l.currentStatus === 'BAD').length;

    return leadStatCards.map(card => {
      switch (card.label) {
        case 'Raw Lead': return { ...card, value: rawLeads.toLocaleString() };
        case 'Connected': return { ...card, value: connectedLeads.toLocaleString() };
        case 'Not Connected': return { ...card, value: notConnectedLeads.toLocaleString() };
        case 'Interested': return { ...card, value: interestedLeads.toLocaleString() };
        case 'Registered': return { ...card, value: registeredLeads.toLocaleString() };
        case 'My Assigned Leads': return { ...card, value: myAssignedLeads.toLocaleString() };
        case 'Form Follow up': return { ...card, value: formFollowUp.toLocaleString() };
        case 'Not Interested': return { ...card, value: notInterestedLeads.toLocaleString() };
        case 'Finally Not Interested': return { ...card, value: finallyNotInterested.toLocaleString() };
        case 'Bad Lead': return { ...card, value: badLeads.toLocaleString() };
        default: return card;
      }
    });
  }, [leadsData]);

  const openDeleteModal = (lead) => {
    console.log("openDeleteModal called with lead:", lead);
    setLeadToDelete(lead);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    console.log("closeDeleteModal called");
    setIsDeleteModalOpen(false);
    setLeadToDelete(null);
  };

  const handleConfirmDelete = async () => {
    const leadId = leadToDelete?.id ?? leadToDelete?.leadId;
    if (!leadId) {
      showToast('Lead ID not found. Cannot delete.', 'error');
      return;
    }
    setIsDeleting(true);
    try {
      await deleteLead(leadId);
      showToast('Lead deleted successfully');
      fetchLeads();
      closeDeleteModal();
    } catch (error) {
      console.error('Delete error', error);
      showToast('Failed to delete lead', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {
        page: page,
        size: size,
        search: search || undefined,
        sortBy: sortBy || undefined,
        sortDirection: sortDirection || undefined
      };
      const res = await getAllLeads(params);
      if (res?.data?.success) {
        const content = res.data.data.content;
        if (content?.length > 0) {
          console.log('🔍 Lead object structure from backend:', content[0]);
        }
        setLeadsData(content);
        setTotalElements(res.data.data.totalElements);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch leads", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await getAllCourses({ page: 0, size: 100 });
      if (res?.success) {
        const courses = res.data.content;
        const courseNames = courses.map(course => course.courseName);
       
        setCoursesData(['All Courses', ...courseNames]);
      } else {
        console.log('API response success check failed');
      }
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLeads();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [page, size, search, sortBy, sortDirection]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [selectedLeadForRemark, setSelectedLeadForRemark] = useState(null);

  const openRemarkModal = (lead) => {
      console.log("Lead Data:", lead);
    setSelectedLeadForRemark(lead);
    setIsRemarkModalOpen(true);
  };

  const closeRemarkModal = () => {
    setIsRemarkModalOpen(false);
    setSelectedLeadForRemark(null);
  };

  const handleSaveRemark = async (lead, remark) => {
    showToast(`Remark saved for ${lead.fullName || lead.name}`);
    // After saving the remark, refetch the leads to show updated data
    await fetchLeads();
  };

  const handleSort = (columnKey, direction) => {
    // Map frontend column keys to backend field names (using camelCase from API response)
    const fieldMapping = {
      'sno': 'id',
      'leadCode': 'leadCode',
      'lead': 'fullName',
      'courseInterested': 'courseInterested',
      'source': 'source.name',
      'currentStatus': 'currentStatus',
      'assignedTo': 'assignedTo',
      'nextFollowUpDate': 'nextFollowUpDate',
      'createdBy': 'createdBy',
      'createdDate': 'createdAt'
    };
    
    const backendField = fieldMapping[columnKey] || columnKey;
    setSortBy(backendField);
    setSortDirection(direction);
  };

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">
            All Leads
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Manage and track all your education leads
          </p>
        </div>
        <div className="flex gap-2">
          {/* Export */}
          <button
            className="btn btn-secondary btn-sm flex items-center gap-1.5"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export
          </button>
          {/* Add Lead */}
          <button
            className="btn btn-primary btn-sm flex items-center gap-1.5"
            onClick={() => openAddLeadModal()}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Lead
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stat-grid mb-5">
        {calculatedStatCards.map((card) => (
          <div key={card.label} className={`stat-card ${card.color}`}>
            <div className="stat-label">{card.label}</div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-change" style={{ color: card.changeColor }}>
              {card.up ? <ArrowUp /> : <ArrowDown />}
              {card.change}
            </div>
            <div className="stat-icon" style={{ background: card.iconBg }}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex gap-2 flex-wrap mb-4">
        <input
          type="text"
          className="form-control max-w-[240px]"
          placeholder="Search leads…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); }}
        />
        <select
          className="form-control max-w-[160px]"
          value={filterCourse}
          onChange={(e) => { setFilterCourse(e.target.value); }}
        >
          {coursesData.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button
          className="btn btn-ghost btn-sm flex items-center gap-1.5"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          Filters
        </button>
      </div>

      {/* ── Table Card ── */}
      <div className="card">
        <div className="table-wrap">
          <ReusableTable
            columns={[
              {
                key: 'sno',
                header: 'S.No',
                sortable: false,
                render: (value, row, index) => {
                  const serialNumber = (page * size) + index + 1;
                  return <span className="font-semibold text-gray-700">{serialNumber}</span>;
                },
              },
              {
                key: 'leadCode',
                header: 'Lead Code',
                render: (value) => <span className="font-semibold text-blue-600">{value}</span>,
              },
              {
                key: 'lead',
                header: 'Lead Info',
                render: (value, row) => (
                  <div>
                    <div className="font-semibold text-gray-800">{row.fullName}</div>
                  </div>
                ),
              },
              { key: 'courseInterested', header: 'Course' },
              {
                key: 'source',
                header: 'Source',
                render: (value, row) => row.source?.name || 'N/A',
              },
              {
                key: 'currentStatus',
                header: 'Status',
                render: (value, row) => (
                  <span className="badge bg-slate-200 text-slate-800 px-2 py-1 rounded text-xs font-medium">
                    {row.currentStatus}
                  </span>
                ),
              },
              {
                key: 'assignedTo',
                header: 'Counselor',
                render: (value, row) =>
                  row.assignedTo ? `${row.assignedTo.firstName} ${row.assignedTo.lastName}` : 'Unassigned',
              },
              {
                key: 'nextFollowUpDate',
                header: 'Follow-up',
                render: (value, row) =>
                  row.nextFollowUpDate ? new Date(row.nextFollowUpDate).toLocaleDateString() : 'None',
              },
              {
                key: 'createdBy',
                header: 'Created By',
                render: (value, row) =>
                  row.createdBy ? `${row.createdBy.firstName} ${row.createdBy.lastName}` : 'N/A',
              },
            ]}
            data={leadsData}
            isServerSide={true}
            totalElements={totalElements}
            totalPages={totalPages}
            currentPage={page + 1}
            rowsPerPage={size}
            onPageChange={(newPage) => setPage(newPage - 1)}
            onRowsPerPageChange={(newSize) => {
              setSize(newSize);
              setPage(0);
            }}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
            actions={(row) => (
              <div className="flex justify-center items-center gap-3">
                <button
                  className="text-blue-500 hover:text-blue-700 transition bg-transparent border-none cursor-pointer"
                  title="Remark"
                  onClick={() => openRemarkModal(row)}
                >
                  <FiMessageSquare size={18} />
                </button>
                <button
                  className="text-gray-500 hover:text-gray-700 transition bg-transparent border-none cursor-pointer"
                  title="View"
                  onClick={() => navTo(`lead-detail/${row?.id ?? row?.leadId}`)}
                >
                  <FiEye size={18} />
                </button>
                <button
                  className="text-gray-500 hover:text-gray-700 transition bg-transparent border-none cursor-pointer"
                  title="Edit"
                  onClick={() => openAddLeadModal(row)}
                >
                  <FiEdit size={18} />
                </button>
                <button
                  className="text-red-500 hover:text-red-700 transition bg-transparent border-none cursor-pointer"
                  title="Delete"
                  onClick={() => {
                    console.log("Inline delete button clicked for row:", row);
                    openDeleteModal(row);
                  }}
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            )}
            emptyMessage={loading ? "Loading..." : "No leads match your filters."}
          />
        </div>

      </div>


      {/* Lead Remark Modal */}
      <LeadRemarkModal
        isOpen={isRemarkModalOpen}
        onClose={closeRemarkModal}
        lead={selectedLeadForRemark}
        followUpId={selectedLeadForRemark?.followUpId || selectedLeadForRemark?.nextFollowUpId || selectedLeadForRemark?.followupId}
        onSave={handleSaveRemark}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Lead"
        message={`Are you sure you want to delete lead "${leadToDelete?.fullName}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default Leads;

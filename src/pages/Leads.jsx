import { useState, useMemo, useEffect } from 'react';
import { FiEye, FiEdit, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import { statusConfig } from '../mockData';
import { getAllLeads, deleteLead } from '../Services/lead/leadService';
import { useAppContext } from '../AppContext';
import ReusableTable from '../component/reusable/table';
import LeadRemarkModal from '../component/reusable/Leads/LeadRemarkModal';
import DeleteModal from "../component/reusable/deleteModel"


const STATUSES = [
  { value: '', label: 'All Status' },
  { value: 'raw', label: 'Raw Lead' },
  { value: 'connected', label: 'Connected' },
  { value: 'interested', label: 'Interested' },
  { value: 'hot', label: 'Hot Lead' },
  { value: 'registered', label: 'Registered' },
  { value: 'cold', label: 'Cold Lead' },
  { value: 'notinterested', label: 'Not Interested' },
  { value: 'bad', label: 'Bad Lead' },
];

const COUNSELORS = ['All Counselors', 'Rahul Singh', 'Neha Joshi', 'Priya Patel', 'Vikram Das'];
const COURSES = ['All Courses', 'Full Stack Dev', 'Data Science', 'UI/UX Design', 'DevOps'];

/* ── Score badge colour ── */
const scoreBg = (score) => {
  if (score >= 80) return { background: 'var(--success-light)', color: 'var(--success)' };
  if (score >= 50) return { background: '#FFF7ED', color: '#EA580C' };
  return { background: 'var(--danger-light)', color: 'var(--danger)' };
};

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

  // API State
  const [leadsData, setLeadsData] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {
        page: page,
        size: size,
        search: search || undefined
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

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLeads();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [page, size, search]);

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

  return (
    <div>
      {/* ── Page Header ── */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--gray-900)' }}>
            All Leads
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '4px' }}>
            Manage and track all your education leads
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Export */}
          <button
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
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
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
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

      {/* ── Filter Bar ── */}
      <div
        className="filter-bar"
        style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}
      >
        <input
          type="text"
          className="form-control"
          placeholder="Search leads…"
          style={{ maxWidth: '240px' }}
          value={search}
          onChange={(e) => { setSearch(e.target.value); }}
        />
        <select
          className="form-control"
          style={{ maxWidth: '140px' }}
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); }}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          className="form-control"
          style={{ maxWidth: '160px' }}
          value={filterCounselor}
          onChange={(e) => { setFilterCounselor(e.target.value); }}
        >
          {COUNSELORS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          className="form-control"
          style={{ maxWidth: '160px' }}
          value={filterCourse}
          onChange={(e) => { setFilterCourse(e.target.value); }}
        >
          {COURSES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button
          className="btn btn-ghost btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
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
                key: 'leadCode',
                header: 'Lead Code',
                render: (value) => <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{value}</span>,
              },
              {
                key: 'lead',
                header: 'Lead Info',
                render: (value, row) => (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{row.fullName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{row.email}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{row.phoneNumber}</div>
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
                  <span className={`badge`} style={{ background: '#E2E8F0', color: '#1E293B', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>
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
            actions={(row) => (
              <div className="flex justify-center items-center gap-3" style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="text-blue-500 hover:text-blue-700 transition"
                  title="Remark"
                  onClick={() => openRemarkModal(row)}
                  style={{ color: '#3b82f6', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <FiMessageSquare size={18} />
                </button>
                <button
                  className="text-gray-500 hover:text-gray-700 transition"
                  title="View"
                  onClick={() => navTo(`lead-detail/${row?.id ?? row?.leadId}`)}
                  style={{ color: '#6b7280', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <FiEye size={18} />
                </button>
                <button
                  className="text-gray-500 hover:text-gray-700 transition"
                  title="Edit"
                  style={{ color: '#6b7280', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  onClick={() => openAddLeadModal(row)}
                >
                  <FiEdit size={18} />
                </button>
                <button
                  className="text-red-500 hover:text-red-700 transition"
                  title="Delete"
                  style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}
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

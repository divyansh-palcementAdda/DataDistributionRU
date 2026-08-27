import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../AppContext';
import ReusableTable from '../component/reusable/table';
import AddLeadSourceModal from '../component/reusable/Leads/addLeadSourceModel';
import { getAllLeadSource, deleteLeadSource, toggleLeadSource } from '../Services/leadsource/leadSourceService';
import { getLeadSourceWiseStats } from '../Services/lead/leadService';
import CustomToggle from '../component/reusable/custumToggle';
import StatsCard from '../component/reusable/StatsCard';
import DeleteModal from '../component/reusable/deleteModel';
import { usePermissions } from '../PermissionContext';


/* ── Date formatter ── */
const fmtDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};


const LeadSource = () => {
    const { showToast, navTo } = useAppContext();
    const { canCreate, canUpdate, canDelete, canRead, hasPermission } = usePermissions();

    // Helper function to check both LEADSOURCE_READ and LEADSOURCE_VIEW permissions
    const canReadLeadSource = () => {
        return hasPermission('LEADSOURCE_READ') || hasPermission('LEADSOURCE_VIEW');
    };

    /* ── Stats Cards state ── */
    const [statsData, setStatsData] = useState([]);
    const [statsLoading, setStatsLoading] = useState(false);

    /* ── API state ── */
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    /* ── Pagination ── */
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);

    /* ── Sort ── */
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('DESC');

    /* ── Search (debounced) ── */
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const debounceRef = useRef(null);

    const handleSearchInput = (e) => {
        const val = e.target.value;
        setSearchInput(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setSearch(val);
            setPage(0);
        }, 300);
    };

    /* ── Filter by status ── */
    const [statusFilter, setStatusFilter] = useState('all');

    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setPage(0);
    };

    /* ── Modal ── */
    const [isAddLeadSourceModalOpen, setIsAddLeadSourceModalOpen] = useState(false);
    const [editModalData, setEditModalData] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteModalData, setDeleteModalData] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    /* ── Fetch Stats ── */
    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const res = await getLeadSourceWiseStats();
            const payload = res?.data;
            if (payload?.success) {
                setStatsData(payload.data ?? []);
            }
        } catch (err) {
            // silently fail stats
        } finally {
            setStatsLoading(false);
        }
    }, []);

    /* ── Fetch ── */
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, size, sortBy, sortDirection };
            if (search.trim()) params.search = search.trim();
            if (statusFilter !== 'all') params.active = statusFilter === 'active';
            const res = await getAllLeadSource(params);
            const payload = res?.data;
            if (payload?.success) {
                setData(payload.data?.content ?? []);
                setTotalElements(payload.data?.totalElements ?? 0);
                setTotalPages(payload.data?.totalPages ?? 0);
            } else {
                showToast(payload?.message || 'Failed to load lead sources', 'error');
            }
        } catch (err) {
            showToast('Error fetching lead sources', 'error');
        } finally {
            setLoading(false);
        }
    }, [page, size, sortBy, sortDirection, search, statusFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    /* ── Handlers ── */
    const handleSort = (columnKey, direction) => {
        setSortBy(columnKey);
        setSortDirection(direction.toUpperCase());
        setPage(0);
    };

    const handleModalClose = (didChange) => {
        setIsAddLeadSourceModalOpen(false);
        setEditModalData(null);
        if (didChange === true) fetchData(); // refresh after creation or update
    };

    const handleView = (row) => {
        navTo(`lead-source-details/${row.id}`);
    };

    const handleEdit = (row) => {
        setEditModalData(row);
        setIsAddLeadSourceModalOpen(true);
    };

    const handleDelete = (row) => {
        setDeleteModalData(row);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteModalData) return;
        setIsDeleting(true);
        try {
            const res = await deleteLeadSource(deleteModalData.id);
            if (res?.data?.success) {
                showToast('Lead source deleted successfully', 'success');
                setIsDeleteModalOpen(false);
                setDeleteModalData(null);
                fetchData();
            } else {
                showToast(res?.data?.message || 'Failed to delete lead source', 'error');
            }
        } catch (err) {
            showToast('Error deleting lead source', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggle = async (row) => {
        if (!hasPermission('LEADSOURCE_UPDATE')) {
            showToast('You do not have permission to update lead source status', 'error');
            return;
        }
        try {
            const res = await toggleLeadSource(row.id);
            if (res?.data?.success) {
                showToast('Status updated successfully', 'success');
                fetchData(); // refresh the list to reflect new status
            } else {
                showToast(res?.data?.message || 'Failed to update status', 'error');
            }
        } catch (err) {
            showToast('Error updating status', 'error');
        }
    };

    /* ── Table columns ── */
    const columns = [
        {
            key: 'sno',
            header: 'S.No',
            sortable: false,
            render: (value, row, index) => (
                <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>
                    {page * size + index + 1}
                </span>
            ),
        },
        {
            key: 'name',
            header: 'Name',
            sortable: true,
            render: (value) => (
                <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{value}</span>
            ),
        },
        {
            key: 'description',
            header: 'Description',
            sortable: true,
            render: (value) => (
                <span style={{ color: 'var(--gray-500)', fontSize: '13px' }}>
                    {value || '—'}
                </span>
            ),
        },
        {
            key: 'active',
            header: 'Status',
            sortable: true,
            render: (value, row) => (
                hasPermission('LEADSOURCE_UPDATE') ? (
                    <CustomToggle
                        checked={value}
                        onChange={() => handleToggle(row)}
                    />
                ) : null
            ),
        },
        {
            key: 'createdAt',
            header: 'Created At',
            sortable: true,
            render: (value) => (
                <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{fmtDate(value)}</span>
            ),
        },
    ];

    /* ── Palette for stat cards ── */
    const CARD_COLORS = [
        { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '#a78bfa' },
        { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', icon: '#f9a8d4' },
        { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', icon: '#7dd3fc' },
        { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', icon: '#6ee7b7' },
        { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', icon: '#fde68a' },
        { bg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', icon: '#d8b4fe' },
    ];

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
                        Data Source
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {hasPermission('LEADSOURCE_CREATE') && (
                        <button
                            className="btn btn-primary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            onClick={() => setIsAddLeadSourceModalOpen(true)}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Add Lead Source
                        </button>
                    )}
                </div>
            </div>


            {/* ── Search & Sort Bar ── */}
            <div
                className="filter-bar"
                style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}
            >
                {/* Debounced search input */}
                <div style={{ position: 'relative' }}>
                    <svg
                        width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="var(--gray-400)" strokeWidth="2"
                        style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name…"
                        style={{ maxWidth: '240px', paddingLeft: '32px' }}
                        value={searchInput}
                        onChange={handleSearchInput}
                    />
                </div>

                {/* Status Filter dropdown */}
                <select
                    className="form-control"
                    style={{ maxWidth: '150px', fontSize: '13px' }}
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* ── Table Card ── */}
            <div className="card">
                {loading ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--gray-400)' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            style={{ animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 12px' }}>
                            <path d="M21 12a9 9 0 11-6.219-8.56" />
                        </svg>
                        Loading lead sources…
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : (
                    <ReusableTable
                        columns={columns}
                        data={data}
                        emptyMessage={
                            search
                                ? `No lead sources match "${search}".`
                                : 'No lead sources found. Add one to get started.'
                        }
                        onView={canReadLeadSource() ? handleView : undefined}
                        onEdit={hasPermission('LEADSOURCE_UPDATE') ? handleEdit : undefined}
                        onDelete={hasPermission('LEADSOURCE_DELETE') ? handleDelete : undefined}
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
                        sortDirection={sortDirection.toLowerCase()}
                        onSort={handleSort}
                    />
                )}
            </div>

            {/* ── Add/Edit Lead Source Modal ── */}
            <AddLeadSourceModal
                isOpen={isAddLeadSourceModalOpen}
                onClose={handleModalClose}
                editData={editModalData}
            />



            {/* ── Delete Modal ── */}
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="Delete Lead Source"
                message={`Are you sure you want to delete the lead source "${deleteModalData?.name}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default LeadSource;

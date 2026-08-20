import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiLayers, FiUsers, FiUser, FiCalendar, FiEdit, FiEye, FiMessageSquare } from 'react-icons/fi';
import { getDepartmentById, getDepartmentUsers, getDepartmentHods, getDepartmentCounsellors } from '../Services/department/departmentService';
import {
    getLeadSourceBreakdown,
    getGradeBreakdown,
    getBoardBreakdown,
    getCourseTypesBreakdown,
} from '../Services/cards/cardService';
import axiosInstance from '../axiosInstance/axios';
import ApiRoutes from '../apiRoutes/allApiRoutes';
import LeadCards from '../component/reusable/DashBoards/leadCards';
import LeadSource from '../component/reusable/DashBoards/leadSource';
import CategorywiseCard from '../component/reusable/DashBoards/categorywiseCard';
import BoardWiseCard from '../component/reusable/DashBoards/BoardWiseCard';
import GradWiseCard from '../component/reusable/DashBoards/gradWiseCard';
import ReusableTable from '../component/reusable/table';
import LeadRemarkModal from '../component/reusable/Leads/LeadRemarkModal';
import AddDepartmentModal from '../component/reusable/department/addDepartmentModel';

// ─── Format Date Helper ───────────────────────────────────────────────────────
const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
        return new Date(isoString).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
        });
    } catch {
        return isoString;
    }
};

// ─── Lead table columns ───────────────────────────────────────────────────────
const buildLeadColumns = (page, size) => [
    {
        key: 'sno',
        header: 'S.No',
        sortable: false,
        render: (value, row, index) => (
            <span className="font-semibold text-gray-700">{page * size + index + 1}</span>
        ),
    },
    {
        key: 'leadCode',
        header: 'Lead Code',
        render: (value, row) => {
            const v = value || row.leadCode;
            const display = typeof v === 'object' ? (v?.code || v?.name || 'N/A') : (v || 'N/A');
            return <span className="font-semibold text-blue-600">{display}</span>;
        },
    },
    {
        key: 'lead',
        header: 'Lead Info',
        render: (value, row) => (
            <div className="font-semibold text-gray-800">
                {typeof row.fullName === 'object'
                    ? row.fullName?.name || row.fullName?.firstName || 'N/A'
                    : row.fullName || 'N/A'}
            </div>
        ),
    },
    {
        key: 'courseInterested',
        header: 'Course',
        render: (value, row) => {
            const v = value || row.courseInterested;
            if (typeof v === 'object' && v !== null) return v?.courseName || v?.name || 'N/A';
            return v || 'N/A';
        },
    },
    {
        key: 'source',
        header: 'Source',
        render: (value, row) => {
            if (typeof row.source === 'object' && row.source !== null) return row.source?.name || 'N/A';
            return row.source || 'N/A';
        },
    },
    {
        key: 'currentStatus',
        header: 'Status',
        render: (value, row) => {
            const v = value || row.currentStatus;
            const display = typeof v === 'object' ? (v?.name || v?.code || 'N/A') : (v || 'N/A');
            return (
                <span className="badge bg-slate-200 text-slate-800 px-2 py-1 rounded text-xs font-medium">
                    {display}
                </span>
            );
        },
    },
    {
        key: 'assignedTo',
        header: 'Counselor',
        render: (value, row) => {
            if (typeof row.assignedTo === 'object' && row.assignedTo !== null)
                return `${row.assignedTo.firstName || ''} ${row.assignedTo.lastName || ''}`.trim() || 'Not Allotted';
            return row.assignedTo || 'Not Allotted';
        },
    },
    {
        key: 'nextFollowUpDate',
        header: 'Follow-up',
        render: (value, row) => {
            if (row.nextFollowUpDate) {
                try { return new Date(row.nextFollowUpDate).toLocaleDateString(); }
                catch { return 'Invalid Date'; }
            }
            return 'None';
        },
    },
    {
        key: 'createdBy',
        header: 'Created By',
        render: (value, row) => {
            const v = value || row.createdBy;
            if (typeof v === 'object' && v !== null)
                return `${v.firstName || ''} ${v.lastName || ''}`.trim() || 'N/A';
            return v || 'N/A';
        },
    },
];

// ─── Helper: fetch leads for selected card (server-side) ─────────────────────
const fetchLeadsForCard = async (selectedCard, departmentId, page, size, sortBy, sortDirection) => {
    if (!selectedCard || !departmentId) return { content: [], totalElements: 0, totalPages: 0 };

    const params = {
        departmentId,     // always filter by this department
        page,
        size,
        sortBy: sortBy || 'createdAt',
        sortDirection: sortDirection || 'desc',
    };

    switch (selectedCard.type) {
        case 'all':         break; // only departmentId, no extra filter
        case 'leadStatus':  params.statusId     = selectedCard.value; break;
        case 'leadSource':  params.sourceId     = selectedCard.value; break;
        case 'courseType':  params.courseTypeId = selectedCard.value; break;
        case 'board':       params.boardId      = selectedCard.value; break;
        case 'grade':       params.gradeId      = selectedCard.value; break;
        default:            return { content: [], totalElements: 0, totalPages: 0 };
    }

    try {
        const res = await axiosInstance.get(ApiRoutes.Lead.getAllLeads, { params });
        const d = res?.data?.data || res?.data || {};
        return {
            content:       d.content       ?? (Array.isArray(d) ? d : []),
            totalElements: d.totalElements ?? 0,
            totalPages:    d.totalPages    ?? 0,
        };
    } catch (err) {
        console.error('Failed to fetch lead table data', err);
        return { content: [], totalElements: 0, totalPages: 0 };
    }
};

// ─── Main Component ───────────────────────────────────────────────────────────
const DepartmentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // detail state
    const [department, setDepartment] = useState(null);
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState(null);

    // dashboard card data
    const [dashData, setDashData] = useState({ leadSource: [], courseType: [], board: [], grade: [] });

    // department staff
    const [hods, setHods]             = useState([]);
    const [counsellors, setCounsellors] = useState([]);
    const [users, setUsers]           = useState([]);

    // filter / table state
    const [selectedCard, setSelectedCard]               = useState({ type: 'all', value: null, label: 'All Leads' });
    const [tableData, setTableData]                     = useState([]);
    const [tableLoading, setTableLoading]               = useState(false);

    // server-side pagination & sorting
    const [tablePage, setTablePage]                     = useState(0);
    const [tableSize, setTableSize]                     = useState(10);
    const [tableTotalElements, setTableTotalElements]   = useState(0);
    const [tableTotalPages, setTableTotalPages]         = useState(0);
    const [tableSortBy, setTableSortBy]                 = useState('createdAt');
    const [tableSortDir, setTableSortDir]               = useState('desc');

    // staff view state
    const [activeStaffView, setActiveStaffView]     = useState(null); // null | 'users' | 'hods' | 'counsellors'
    const [staffTableData, setStaffTableData]       = useState([]);
    const [staffTableLoading, setStaffTableLoading] = useState(false);

    // remark modal
    const [isRemarkModalOpen, setIsRemarkModalOpen]         = useState(false);
    const [selectedLeadForRemark, setSelectedLeadForRemark] = useState(null);

    // edit modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // ── fetch department details ──
    useEffect(() => {
        if (!id) return;
        const run = async () => {
            setLoading(true);
            try {
                const res = await getDepartmentById(id);
                setDepartment(res?.data || res);
            } catch (err) {
                console.error('Error fetching department details:', err);
                setError(err?.message || 'Failed to fetch department details');
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [id]);

    // ── fetch dashboard breakdown data ──
    useEffect(() => {
        if (!id) return;
        const fetchDashboardData = async () => {
            const params = { departmentId: id };
            try {
                const [sourceRes, courseTypeRes, boardRes, gradeRes] = await Promise.all([
                    getLeadSourceBreakdown(params).catch(() => null),
                    getCourseTypesBreakdown(params).catch(() => null),
                    getBoardBreakdown(params).catch(() => null),
                    getGradeBreakdown(params).catch(() => null),
                ]);
                const toArr = (r) => r?.data?.data || r?.data || [];
                setDashData({
                    leadSource: toArr(sourceRes),
                    courseType: toArr(courseTypeRes),
                    board:      toArr(boardRes),
                    grade:      toArr(gradeRes),
                });
            } catch (err) {
                console.error('Dashboard data fetch failed', err);
            }
        };
        fetchDashboardData();
    }, [id]);

    // ── fetch department staff ──
    useEffect(() => {
        if (!id) return;
        const fetchStaffData = async () => {
            try {
                const [usersRes, hodsRes, counsellorsRes] = await Promise.all([
                    getDepartmentUsers(id).catch(() => ({ data: [] })),
                    getDepartmentHods(id).catch(() => ({ data: [] })),
                    getDepartmentCounsellors(id).catch(() => ({ data: [] })),
                ]);
                setUsers(usersRes?.data || []);
                setHods(hodsRes?.data || []);
                setCounsellors(counsellorsRes?.data || []);
            } catch (err) {
                console.error('Staff data fetch failed', err);
            }
        };
        fetchStaffData();
    }, [id]);

    // ── fetch leads when card selected or pagination/sort changes ──
    useEffect(() => {
        if (!selectedCard) { setTableData([]); setTableTotalElements(0); setTableTotalPages(0); return; }
        if (!id) return;
        setTableLoading(true);
        fetchLeadsForCard(selectedCard, id, tablePage, tableSize, tableSortBy, tableSortDir)
            .then(({ content, totalElements, totalPages }) => {
                setTableData(content);
                setTableTotalElements(totalElements);
                setTableTotalPages(totalPages);
                setTableLoading(false);
            });
    }, [selectedCard, id, tablePage, tableSize, tableSortBy, tableSortDir]);

    // ── card click handler ──
    const handleCardClick = (card) => {
        const isSame = selectedCard?.type === card.type && selectedCard?.value === card.value;
        setSelectedCard(isSame ? { type: 'all', value: null, label: 'All Leads' } : card);
        setTablePage(0);
    };

    // ── staff card click handler ──
    const handleStaffCardClick = async (type) => {
        if (activeStaffView === type) {
            setActiveStaffView(null);
            setStaffTableData([]);
            return;
        }
        setActiveStaffView(type);
        setStaffTableLoading(true);
        try {
            let res;
            if (type === 'users')       res = await getDepartmentUsers(id);
            else if (type === 'hods')   res = await getDepartmentHods(id);
            else                        res = await getDepartmentCounsellors(id);
            const data = res?.data?.data || res?.data || res || [];
            setStaffTableData(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Staff fetch failed', err);
            setStaffTableData([]);
        } finally {
            setStaffTableLoading(false);
        }
    };

    // ── remark modal handlers ──
    const openRemarkModal  = (lead) => { setSelectedLeadForRemark(lead); setIsRemarkModalOpen(true); };
    const closeRemarkModal = () => { setIsRemarkModalOpen(false); setSelectedLeadForRemark(null); };

    // ── lead table sort handler ──
    const handleLeadSort = (columnKey, direction) => {
        const fieldMap = {
            leadCode:         'leadCode',
            lead:             'fullName',
            courseInterested: 'courseInterested',
            source:           'source.name',
            currentStatus:    'currentStatus',
            assignedTo:       'assignedTo',
            nextFollowUpDate: 'nextFollowUpDate',
            createdBy:        'createdAt',
        };
        setTableSortBy(fieldMap[columnKey] || columnKey);
        setTableSortDir(direction);
        setTablePage(0);
    };

    // ── loading / error / not-found guards ──
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <span className="ml-2 text-gray-600 font-medium">Loading department details...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex justify-between items-center shadow-sm">
                    <span>{error}</span>
                    <button onClick={() => navigate('/department')} className="text-sm font-semibold underline hover:text-red-800">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!department) {
        return (
            <div className="p-6">
                <div className="bg-gray-50 border border-gray-200 text-gray-600 px-4 py-3 rounded-xl flex justify-between items-center shadow-sm">
                    <span>Department not found</span>
                    <button onClick={() => navigate('/department')} className="text-sm font-semibold underline hover:text-gray-800">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
        <div style={{ padding: '24px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

            {/* ── Page Header ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => navigate('/department')}
                        style={{ padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                    >
                        <FiArrowLeft style={{ color: '#64748B', fontSize: '16px' }} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Department Details</h1>
                        <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748B' }}>View comprehensive department information</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsEditModalOpen(true)}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #2563EB', backgroundColor: '#2563EB', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                >
                    <FiEdit style={{ fontSize: '14px' }} />
                    Edit Department
                </button>
            </div>

            {/* ── Detail Card (TOP) ── */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', flexShrink: 0 }}>
                        {department.name ? department.name.substring(0, 2).toUpperCase() : 'DP'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: '0 0 8px 0' }}>{department.name}</h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', backgroundColor: department.active ? '#DCFCE7' : '#F1F5F9', color: department.active ? '#15803D' : '#64748B', border: `1px solid ${department.active ? '#BBF7D0' : '#E2E8F0'}` }}>
                                {department.active ? 'Active' : 'Inactive'}
                            </span>
                            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #DBEAFE' }}>
                                {department.code}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <FiLayers style={{ color: '#64748B', fontSize: '14px' }} />
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Description</span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#334155', margin: 0, lineHeight: '1.5' }}>
                            {department.description || 'No description provided'}
                        </p>
                    </div>

                    {/* ── Total Users Card ── */}
                    <div
                        onClick={() => handleStaffCardClick('users')}
                        style={{ backgroundColor: activeStaffView === 'users' ? '#DBEAFE' : '#EFF6FF', padding: '16px', borderRadius: '8px', border: `2px solid ${activeStaffView === 'users' ? '#2563EB' : '#BFDBFE'}`, cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FiUsers style={{ color: '#FFFFFF', fontSize: '15px' }} />
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Users</span>
                        </div>
                        <p style={{ fontSize: '28px', fontWeight: '800', color: '#1E40AF', margin: '0 0 2px 0', lineHeight: 1 }}>
                            {users.length > 0 ? users.length : (department.userCount ?? 0)}
                        </p>
                        <p style={{ fontSize: '11px', color: '#3B82F6', margin: 0 }}>Click to view list</p>
                        {activeStaffView === 'users' && (
                            <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
                        )}
                    </div>

                    {/* ── HODs Card ── */}
                    <div
                        onClick={() => handleStaffCardClick('hods')}
                        style={{ backgroundColor: activeStaffView === 'hods' ? '#EDE9FE' : '#F5F3FF', padding: '16px', borderRadius: '8px', border: `2px solid ${activeStaffView === 'hods' ? '#7C3AED' : '#DDD6FE'}`, cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FiUser style={{ color: '#FFFFFF', fontSize: '15px' }} />
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Heads of Dept.</span>
                        </div>
                        <p style={{ fontSize: '28px', fontWeight: '800', color: '#5B21B6', margin: '0 0 2px 0', lineHeight: 1 }}>
                            {hods.length > 0 ? hods.length : (department.hods?.length ?? 0)}
                        </p>
                        <p style={{ fontSize: '11px', color: '#8B5CF6', margin: 0 }}>Click to view list</p>
                        {activeStaffView === 'hods' && (
                            <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#7C3AED' }} />
                        )}
                    </div>

                    {/* ── Counsellors Card ── */}
                    <div
                        onClick={() => handleStaffCardClick('counsellors')}
                        style={{ backgroundColor: activeStaffView === 'counsellors' ? '#DCFCE7' : '#F0FDF4', padding: '16px', borderRadius: '8px', border: `2px solid ${activeStaffView === 'counsellors' ? '#16A34A' : '#BBF7D0'}`, cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(22,163,74,0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FiUsers style={{ color: '#FFFFFF', fontSize: '15px' }} />
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Counsellors</span>
                        </div>
                        <p style={{ fontSize: '28px', fontWeight: '800', color: '#166534', margin: '0 0 2px 0', lineHeight: 1 }}>
                            {counsellors.length > 0 ? counsellors.length : (department.counsellors?.length ?? 0)}
                        </p>
                        <p style={{ fontSize: '11px', color: '#22C55E', margin: 0 }}>Click to view list</p>
                        {activeStaffView === 'counsellors' && (
                            <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
                        )}
                    </div>

                    <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <FiCalendar style={{ color: '#64748B', fontSize: '14px' }} />
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Created Date</span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#334155', margin: 0 }}>{formatDate(department.createdAt)}</p>
                    </div>

                    <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <FiEdit style={{ color: '#64748B', fontSize: '14px' }} />
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Last Updated</span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#334155', margin: 0 }}>{formatDate(department.updatedAt)}</p>
                    </div>
                </div>
            </div>

            {/* ── Staff List Table (shown on card click) ── */}
            {activeStaffView && (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {activeStaffView === 'users' && <FiUsers style={{ color: '#2563EB' }} />}
                            {activeStaffView === 'hods'  && <FiUser  style={{ color: '#7C3AED' }} />}
                            {activeStaffView === 'counsellors' && <FiUsers style={{ color: '#16A34A' }} />}
                            {activeStaffView === 'users' ? 'All Users' : activeStaffView === 'hods' ? 'Heads of Department' : 'Counsellors'}
                            <span style={{ fontSize: '12px', fontWeight: '500', color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '12px' }}>
                                {staffTableData.length} records
                            </span>
                        </h3>
                        <button
                            onClick={() => { setActiveStaffView(null); setStaffTableData([]); }}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', color: '#64748B', fontSize: '12px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            Close
                        </button>
                    </div>

                    {staffTableLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '120px', gap: '8px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', animation: 'spin 0.8s linear infinite' }} />
                            <span style={{ color: '#64748B', fontSize: '14px' }}>Loading...</span>
                        </div>
                    ) : staffTableData.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px', color: '#94A3B8', fontSize: '14px' }}>
                            No records found.
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                        <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '700', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>#</th>
                                        <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '700', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Name</th>
                                        <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '700', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</th>
                                        <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '700', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                            {activeStaffView === 'hods' ? 'Access Type' : 'Role'}
                                        </th>
                                        <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '700', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staffTableData.map((member, idx) => (
                                        <tr key={member.id || idx} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <td style={{ padding: '12px 14px', color: '#94A3B8', fontWeight: '500' }}>{idx + 1}</td>
                                            <td style={{ padding: '12px 14px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: activeStaffView === 'hods' ? '#7C3AED' : activeStaffView === 'counsellors' ? '#2563EB' : '#0F172A', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                                                        {member.firstName?.[0] || '?'}
                                                    </div>
                                                    <span style={{ fontWeight: '600', color: '#1E293B' }}>
                                                        {`${member.firstName || ''} ${member.lastName || ''}`.trim() || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 14px', color: '#475569' }}>{member.email || '—'}</td>
                                            <td style={{ padding: '12px 14px' }}>
                                                {activeStaffView === 'hods' ? (
                                                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', backgroundColor: '#F5F3FF', color: '#6D28D9', border: '1px solid #E9D5FF' }}>
                                                        {member.hodAccessType || 'FULL_ACCESS'}
                                                    </span>
                                                ) : (
                                                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', backgroundColor: '#DBEAFE', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
                                                        {(member.roles && member.roles[0]) || member.roleName || '—'}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px 14px' }}>
                                                <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', backgroundColor: member.active ? '#DCFCE7' : '#F1F5F9', color: member.active ? '#15803D' : '#64748B', border: `1px solid ${member.active ? '#BBF7D0' : '#E2E8F0'}` }}>
                                                    {member.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── HODs Section ── */}
            {hods && hods.length > 0 && (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiUser style={{ color: '#7C3AED', fontSize: '18px' }} />
                        Heads of Department ({hods.length})
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {hods.map((hod, index) => (
                            <div key={hod.id || index} style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#7C3AED', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700' }}>
                                        {hod.firstName?.[0] || 'H'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#1E293B', fontSize: '14px' }}>{hod.firstName} {hod.lastName}</div>
                                        <div style={{ fontSize: '12px', color: '#64748B' }}>{hod.email}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', backgroundColor: '#F5F3FF', color: '#6D28D9', border: '1px solid #E9D5FF' }}>
                                        {hod.hodAccessType || 'FULL_ACCESS'}
                                    </span>
                                    {hod.active && (
                                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0' }}>Active</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Counsellors Section ── */}
            {counsellors && counsellors.length > 0 && (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiUsers style={{ color: '#2563EB', fontSize: '18px' }} />
                        Counsellors ({counsellors.length})
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {counsellors.map((counsellor, index) => (
                            <div key={counsellor.id || index} style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#2563EB', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700' }}>
                                        {counsellor.firstName?.[0] || 'C'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#1E293B', fontSize: '14px' }}>{counsellor.firstName} {counsellor.lastName}</div>
                                        <div style={{ fontSize: '12px', color: '#64748B' }}>{counsellor.email}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {counsellor.active && (
                                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0' }}>Active</span>
                                    )}
                                    {counsellor.roles && counsellor.roles.length > 0 && (
                                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', backgroundColor: '#DBEAFE', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
                                            {counsellor.roles[0]}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── No Staff Message ── */}
            {(!hods || hods.length === 0) && (!counsellors || counsellors.length === 0) && (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px dashed #E2E8F0', padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
                    <FiUsers style={{ color: '#CBD5E1', fontSize: '32px', marginBottom: '12px' }} />
                    <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>No staff members assigned to this department yet</p>
                </div>
            )}

            {/* ── Dashboard Cards (BOTTOM) ── */}
            <div style={{ marginBottom: '24px' }}>
                <LeadCards
                    onCardClick={handleCardClick}
                    selectedCard={selectedCard}
                />
                <LeadSource
                    data={dashData.leadSource}
                    onCardClick={handleCardClick}
                    selectedCard={selectedCard}
                />
                <CategorywiseCard
                    data={dashData.courseType}
                    onCardClick={handleCardClick}
                    selectedCard={selectedCard}
                />
                <BoardWiseCard
                    data={dashData.board}
                    onCardClick={handleCardClick}
                    selectedCard={selectedCard}
                />
                <GradWiseCard
                    data={dashData.grade}
                    onCardClick={handleCardClick}
                    selectedCard={selectedCard}
                />
            </div>

            {/* ── Filtered Lead Table ── */}
            {selectedCard && (
                <div style={{ marginTop: '24px' }}>
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-5 bg-indigo-500 rounded-full" />
                            <h3 className="text-base font-bold text-gray-900">{selectedCard.label}</h3>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {tableTotalElements} records
                            </span>
                        </div>
                        {selectedCard.type !== 'all' && (
                        <button
                            onClick={() => { setSelectedCard({ type: 'all', value: null, label: 'All Leads' }); setTablePage(0); }}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-red-200 transition-all"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            Clear Filter
                        </button>
                        )}
                    </div>

                    {tableLoading ? (
                        <div className="flex justify-center items-center h-40 bg-white rounded-xl border border-gray-200">
                            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-500" />
                            <span className="ml-2 text-sm text-gray-500">Loading data...</span>
                        </div>
                    ) : (
                        <div className="card">
                            <ReusableTable
                                columns={buildLeadColumns(tablePage, tableSize)}
                                data={tableData}
                                isServerSide={true}
                                totalElements={tableTotalElements}
                                totalPages={tableTotalPages}
                                currentPage={tablePage + 1}
                                rowsPerPage={tableSize}
                                onPageChange={(newPage) => setTablePage(newPage - 1)}
                                onRowsPerPageChange={(newSize) => { setTableSize(newSize); setTablePage(0); }}
                                sortBy={tableSortBy}
                                sortDirection={tableSortDir}
                                onSort={handleLeadSort}
                                actions={(row) => {
                                    const safeRow = {
                                        ...row,
                                        id:     typeof row.id     === 'object' ? row.id?.id     : row.id,
                                        leadId: typeof row.leadId === 'object' ? row.leadId?.id : row.leadId,
                                    };
                                    return (
                                        <div className="flex justify-center items-center gap-3">
                                            <button
                                                className="text-blue-500 hover:text-blue-700 transition bg-transparent border-none cursor-pointer"
                                                title="Remark"
                                                onClick={() => openRemarkModal(safeRow)}
                                            >
                                                <FiMessageSquare size={18} />
                                            </button>
                                            <button
                                                className="text-gray-500 hover:text-gray-700 transition bg-transparent border-none cursor-pointer"
                                                title="View"
                                                onClick={() => navigate(`/lead-detail/${safeRow?.id ?? safeRow?.leadId}`)}
                                            >
                                                <FiEye size={18} />
                                            </button>
                                        </div>
                                    );
                                }}
                                emptyMessage={`No leads found for "${selectedCard.label}"`}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* ── Hint when no card selected — removed (default all-leads table always visible) ── */}

            {/* ── Edit Department Modal ── */}
            <AddDepartmentModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={(updatedData) => { setDepartment(updatedData); setIsEditModalOpen(false); }}
                initialData={department}
            />
        </div>

        {/* ── Remark Modal ── */}
        <LeadRemarkModal
            isOpen={isRemarkModalOpen}
            onClose={closeRemarkModal}
            lead={selectedLeadForRemark}
            followUpId={selectedLeadForRemark?.followUpId || selectedLeadForRemark?.nextFollowUpId || selectedLeadForRemark?.followupId}
            onSave={() => {
                closeRemarkModal();
                setTablePage((p) => p);
            }}
        />
        </>
    );
};

export default DepartmentDetails;

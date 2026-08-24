import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEye, FiMessageSquare, FiUserPlus } from 'react-icons/fi';
import { useAppContext } from '../AppContext';
import { getCounselorById } from '../Services/Counselors/counselors';
import {
    getLeadStatusBreakdown,
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
import AssignLeadModal from '../component/reusable/Leads/AssignLeadModal';
import ReassignModal from '../component/reusable/Leads/ReassignModal';

// ─── Lead table columns ───────────────────────────────────────────────────────
const buildLeadColumns = (page, size, selectedRows, onToggleRow, onToggleAll, currentData) => [
    {
        key: 'checkbox',
        header: (
            <input
                type="checkbox"
                checked={currentData.length > 0 && currentData.every(r => selectedRows.has(r.id ?? r.leadId))}
                onChange={(e) => onToggleAll(e.target.checked, currentData)}
                style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#4f46e5' }}
                title="Select All"
            />
        ),
        sortable: false,
        render: (value, row) => {
            const rowId = row.id ?? row.leadId;
            return (
                <input
                    type="checkbox"
                    checked={selectedRows.has(rowId)}
                    onChange={() => onToggleRow(rowId)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#4f46e5' }}
                />
            );
        },
    },
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

// ─── Follow-up table columns ───────────────────────────────────────────────────
const buildFollowUpColumns = (page, size, isReassignableMode = false, selectedRows = new Set(), onToggleRow = () => {}, onToggleAll = () => {}, currentData = []) => {
    if (isReassignableMode) {
        // Columns for reassignable follow-ups API response
        return [
            {
                key: 'checkbox',
                header: (
                    <input
                        type="checkbox"
                        checked={currentData.length > 0 && currentData.every(r => selectedRows.has(r.id ?? r.followUpId))}
                        onChange={(e) => onToggleAll(e.target.checked, currentData)}
                        style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#4f46e5' }}
                        title="Select All"
                    />
                ),
                sortable: false,
                render: (value, row) => {
                    const rowId = row.id ?? row.followUpId;
                    return (
                        <input
                            type="checkbox"
                            checked={selectedRows.has(rowId)}
                            onChange={() => onToggleRow(rowId)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#4f46e5' }}
                        />
                    );
                },
            },
            {
                key: 'sno',
                header: 'S.No',
                sortable: false,
                render: (value, row, index) => (
                    <span className="font-semibold text-gray-700">{page * size + index + 1}</span>
                ),
            },
            {
                key: 'leadId',
                header: 'Lead ID',
                render: (value, row) => {
                    const v = row.leadId;
                    return <span className="font-semibold text-blue-600">{v || 'N/A'}</span>;
                },
            },
            {
                key: 'studentName',
                header: 'Student Name',
                render: (value, row) => (
                    <div className="font-semibold text-gray-800">
                        {row.studentName || 'N/A'}
                    </div>
                ),
            },
            {
                key: 'studentPhone',
                header: 'Phone',
                render: (value, row) => (
                    <div className="text-sm text-gray-600">
                        {row.studentPhone || 'N/A'}
                    </div>
                ),
            },
            {
                key: 'studentEmail',
                header: 'Email',
                render: (value, row) => (
                    <div className="text-sm text-gray-600">
                        {row.studentEmail || 'N/A'}
                    </div>
                ),
            },
            {
                key: 'followUpDate',
                header: 'Follow-up Date',
                render: (value, row) => {
                    if (row.followUpDate) {
                        try { return new Date(row.followUpDate).toLocaleDateString(); }
                        catch { return 'Invalid Date'; }
                    }
                    return 'N/A';
                },
            },
            {
                key: 'status',
                header: 'Status',
                render: (value, row) => {
                    const status = row.status || 'N/A';
                    const statusColors = {
                        'PENDING': 'bg-yellow-100 text-yellow-800',
                        'COMPLETED': 'bg-green-100 text-green-800',
                        'CANCELLED': 'bg-red-100 text-red-800',
                    };
                    const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
                    return (
                        <span className={`badge ${colorClass} px-2 py-1 rounded text-xs font-medium`}>
                            {status}
                        </span>
                    );
                },
            },
            {
                key: 'currentResponsibleUserName',
                header: 'Current Responsible',
                render: (value, row) => (
                    <div className="text-sm text-gray-600">
                        {row.currentResponsibleUserName || 'N/A'}
                    </div>
                ),
            },
            {
                key: 'originalCreatorUserName',
                header: 'Original Creator',
                render: (value, row) => (
                    <div className="text-sm text-gray-600">
                        {row.originalCreatorUserName || 'N/A'}
                    </div>
                ),
            },
        ];
    }

    // Regular follow-up columns
    return [
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
                const v = row.leadCode;
                return <span className="font-semibold text-blue-600">{v || 'N/A'}</span>;
            },
        },
        {
            key: 'leadFullName',
            header: 'Lead Name',
            render: (value, row) => (
                <div className="font-semibold text-gray-800">
                    {row.leadFullName || 'N/A'}
                </div>
            ),
        },
        {
            key: 'followUpDate',
            header: 'Follow-up Date',
            render: (value, row) => {
                if (row.followUpDate) {
                    try { return new Date(row.followUpDate).toLocaleDateString(); }
                    catch { return 'Invalid Date'; }
                }
                return 'N/A';
            },
        },
        {
            key: 'remarks',
            header: 'Remarks',
            render: (value, row) => (
                <div className="text-sm text-gray-600">
                    {row.remarks || 'N/A'}
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (value, row) => {
                const status = row.status || 'N/A';
                const statusColors = {
                    'PENDING': 'bg-yellow-100 text-yellow-800',
                    'COMPLETED': 'bg-green-100 text-green-800',
                    'CANCELLED': 'bg-red-100 text-red-800',
                };
                const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
                return (
                    <span className={`badge ${colorClass} px-2 py-1 rounded text-xs font-medium`}>
                        {status}
                    </span>
                );
            },
        },
        {
            key: 'completed',
            header: 'Completed',
            render: (value, row) => (
                <span className="text-sm">
                    {row.completed ? (
                        <span className="text-green-600 font-medium">Yes</span>
                    ) : (
                        <span className="text-red-600 font-medium">No</span>
                    )}
                </span>
            ),
        },
        {
            key: 'completedAt',
            header: 'Completed At',
            render: (value, row) => {
                if (row.completedAt) {
                    try { return new Date(row.completedAt).toLocaleDateString(); }
                    catch { return 'Invalid Date'; }
                }
                return 'N/A';
            },
        },
    ];
};

// ─── Helper: fetch leads for selected card (server-side) ─────────────────────
const fetchLeadsForCard = async (activeFilters, counselorId, page, size, sortBy, sortDirection) => {
    if (!counselorId) return { content: [], totalElements: 0, totalPages: 0 };

    const params = {
        assignedUserIds: counselorId,  // always filter by this counselor
        page,
        size,
        sortBy: sortBy || 'createdAt',
        sortDirection: sortDirection || 'desc',
    };

    // Support multiple filters - accumulate all active filter values
    activeFilters.forEach(filter => {
        switch (filter.type) {
            case 'leadStatus':  params.statusId     = filter.value; break;
            case 'leadSource':  params.sourceId     = filter.value; break;
            case 'courseType':  params.courseTypeId = filter.value; break;
            case 'board':       params.boardId      = filter.value; break;
            case 'grade':       params.gradeId      = filter.value; break;
            default:             break;
        }
    });

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

// ─── Helper: fetch follow-ups for user (server-side) ─────────────────────
const fetchFollowUpsForUser = async (userId, page, size) => {
    if (!userId) return { content: [], totalElements: 0, totalPages: 0 };

    const params = {
        page,
        size,
        sortBy: 'followUpDate',
        sortDirection: 'desc',
    };

    try {
        const url = ApiRoutes.FollowUp.getByUser.replace('{userId}', userId);
        const res = await axiosInstance.get(url, { params });
        const d = res?.data?.data || res?.data || {};
        return {
            content:       d.content       ?? (Array.isArray(d) ? d : []),
            totalElements: d.totalElements ?? 0,
            totalPages:    d.totalPages    ?? 0,
        };
    } catch (err) {
        console.error('Failed to fetch follow-up data', err);
        return { content: [], totalElements: 0, totalPages: 0 };
    }
};

// ─── Helper: fetch reassignable leads ─────────────────────────────────────
const fetchReassignableLeads = async (assignedUserId, page = 0, size = 10) => {
    try {
        const res = await axiosInstance.get('/api/leads/reassignable', {
            params: { assignedUserId, page, size }
        });
        const d = res?.data?.data || res?.data || {};
        return {
            content:       d.content       ?? (Array.isArray(d) ? d : []),
            totalElements: d.totalElements ?? 0,
            totalPages:    d.totalPages    ?? 0,
        };
    } catch (err) {
        console.error('Failed to fetch reassignable leads', err);
        return { content: [], totalElements: 0, totalPages: 0 };
    }
};

// ─── Helper: fetch reassignable follow-ups ─────────────────────────────────
const fetchReassignableFollowUps = async (responsibleUserId, page = 0, size = 10) => {
    try {
        const res = await axiosInstance.get('/api/follow-ups/reassignable', {
            params: { responsibleUserId, page, size }
        });
        const d = res?.data?.data || res?.data || {};
        return {
            content:       d.content       ?? (Array.isArray(d) ? d : []),
            totalElements: d.totalElements ?? 0,
            totalPages:    d.totalPages    ?? 0,
        };
    } catch (err) {
        console.error('Failed to fetch reassignable follow-ups', err);
        return { content: [], totalElements: 0, totalPages: 0 };
    }
};

const CounselorDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useAppContext();

    // detail state
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // dashboard card data
    const [dashData, setDashData] = useState({ leadSource: [], courseType: [], board: [], grade: [] });

    // filter / table state - support multiple active filters
    const [activeFilters, setActiveFilters] = useState([]); // Array of { type, value, label }
    const [tableData, setTableData] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);

    // server-side pagination & sorting
    const [tablePage, setTablePage] = useState(0);
    const [tableSize, setTableSize] = useState(10);
    const [tableTotalElements, setTableTotalElements] = useState(0);
    const [tableTotalPages, setTableTotalPages] = useState(0);
    const [tableSortBy, setTableSortBy] = useState('createdAt');
    const [tableSortDir, setTableSortDir] = useState('desc');

    // remark modal
    const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
    const [selectedLeadForRemark, setSelectedLeadForRemark] = useState(null);

    // row selection & assign modal
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    // reassign modal
    const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
    const [reassignDataType, setReassignDataType] = useState('leads'); // 'leads' or 'followups'

    // follow-up table state
    const [followUpData, setFollowUpData] = useState([]);
    const [followUpLoading, setFollowUpLoading] = useState(false);
    const [followUpPage, setFollowUpPage] = useState(0);
    const [followUpSize, setFollowUpSize] = useState(10);
    const [followUpTotalElements, setFollowUpTotalElements] = useState(0);
    const [followUpTotalPages, setFollowUpTotalPages] = useState(0);

    // reassignable leads state
    const [reassignableLeadsData, setReassignableLeadsData] = useState([]);
    const [reassignableLeadsLoading, setReassignableLeadsLoading] = useState(false);
    const [reassignableLeadsTotalElements, setReassignableLeadsTotalElements] = useState(0);
    const [reassignableLeadsTotalPages, setReassignableLeadsTotalPages] = useState(0);
    const [reassignableLeadsPage, setReassignableLeadsPage] = useState(0);
    const [reassignableLeadsSize, setReassignableLeadsSize] = useState(10);
    const [showReassignableLeads, setShowReassignableLeads] = useState(false);
    const [reassignableLeadsSelectedRows, setReassignableLeadsSelectedRows] = useState(new Set());

    // reassignable follow-ups state
    const [reassignableFollowUpsData, setReassignableFollowUpsData] = useState([]);
    const [reassignableFollowUpsLoading, setReassignableFollowUpsLoading] = useState(false);
    const [reassignableFollowUpsTotalElements, setReassignableFollowUpsTotalElements] = useState(0);
    const [reassignableFollowUpsTotalPages, setReassignableFollowUpsTotalPages] = useState(0);
    const [reassignableFollowUpsPage, setReassignableFollowUpsPage] = useState(0);
    const [reassignableFollowUpsSize, setReassignableFollowUpsSize] = useState(10);
    const [showReassignableFollowUps, setShowReassignableFollowUps] = useState(false);
    const [reassignableFollowUpsSelectedRows, setReassignableFollowUpsSelectedRows] = useState(new Set());

    // refs for scrolling to tables
    const reassignableLeadsRef = useRef(null);
    const reassignableFollowUpsRef = useRef(null);

    // ── fetch counselor details ──
    useEffect(() => {
        if (!id) return;
        const run = async () => {
            setLoading(true);
            try {
                const res = await getCounselorById(id);
                setDetails(res?.data?.data || res?.data || {});
            } catch (err) {
                const msg = err?.message || 'Failed to fetch counselor details';
                setError(msg);
                showToast(msg, 'error');
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [id, showToast]);

    // ── fetch dashboard breakdown data ──
    useEffect(() => {
        if (!id) return;
        const fetchDashboardData = async () => {
            const params = { counselorId: id };
            try {
                const [sourceRes, courseTypeRes, boardRes, gradeRes] = await Promise.all([
                    getLeadSourceBreakdown(params).catch(() => null),
                    getCourseTypesBreakdown(params).catch(() => null),
                    getBoardBreakdown(params).catch(() => null),
                    getGradeBreakdown(params).catch(() => null),
                ]);
                const toArr = (res) => res?.data?.data || res?.data || [];
                setDashData({
                    leadSource: toArr(sourceRes),
                    courseType: toArr(courseTypeRes),
                    board: toArr(boardRes),
                    grade: toArr(gradeRes),
                });
            } catch (err) {
                console.error('Dashboard data fetch failed', err);
            }
        };
        fetchDashboardData();
    }, [id]);

    // ── fetch leads when filters change or pagination/sort changes ──
    useEffect(() => {
        if (!id) return;
        setTableLoading(true);
        fetchLeadsForCard(activeFilters, id, tablePage, tableSize, tableSortBy, tableSortDir)
            .then(({ content, totalElements, totalPages }) => {
                setTableData(content);
                setTableTotalElements(totalElements);
                setTableTotalPages(totalPages);
                setTableLoading(false);
            });
    }, [activeFilters, id, tablePage, tableSize, tableSortBy, tableSortDir]);

    // ── fetch follow-ups when component mounts or pagination changes ──
    useEffect(() => {
        if (!id) return;
        setFollowUpLoading(true);
        fetchFollowUpsForUser(id, followUpPage, followUpSize)
            .then(({ content, totalElements, totalPages }) => {
                setFollowUpData(content);
                setFollowUpTotalElements(totalElements);
                setFollowUpTotalPages(totalPages);
                setFollowUpLoading(false);
            });
    }, [id, followUpPage, followUpSize]);

    // ── fetch reassignable leads when shown or pagination changes ──
    useEffect(() => {
        if (!showReassignableLeads || !id) return;
        setReassignableLeadsLoading(true);
        fetchReassignableLeads(id, reassignableLeadsPage, reassignableLeadsSize)
            .then(({ content, totalElements, totalPages }) => {
                setReassignableLeadsData(content);
                setReassignableLeadsTotalElements(totalElements);
                setReassignableLeadsTotalPages(totalPages);
                setReassignableLeadsLoading(false);
                // Scroll to the reassignable leads table
                if (reassignableLeadsRef.current) {
                    reassignableLeadsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
    }, [showReassignableLeads, id, reassignableLeadsPage, reassignableLeadsSize]);

    // ── fetch reassignable follow-ups when shown or pagination changes ──
    useEffect(() => {
        if (!showReassignableFollowUps || !id) return;
        setReassignableFollowUpsLoading(true);
        fetchReassignableFollowUps(id, reassignableFollowUpsPage, reassignableFollowUpsSize)
            .then(({ content, totalElements, totalPages }) => {
                setReassignableFollowUpsData(content);
                setReassignableFollowUpsTotalElements(totalElements);
                setReassignableFollowUpsTotalPages(totalPages);
                setReassignableFollowUpsLoading(false);
                // Scroll to the reassignable follow-ups table
                if (reassignableFollowUpsRef.current) {
                    reassignableFollowUpsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
    }, [showReassignableFollowUps, id, reassignableFollowUpsPage, reassignableFollowUpsSize]);

    // ── card click handler - toggle filters on/off ──
    const handleCardClick = (card) => {
        setActiveFilters(prev => {
            // Check if this filter is already active
            const existingIndex = prev.findIndex(f => f.type === card.type && f.value === card.value);
            
            if (existingIndex !== -1) {
                // Remove the filter (toggle off)
                const newFilters = [...prev];
                newFilters.splice(existingIndex, 1);
                return newFilters;
            } else {
                // Add the filter (toggle on)
                // First remove any existing filter of the same type (e.g., if clicking a different board)
                const filteredByType = prev.filter(f => f.type !== card.type);
                return [...filteredByType, card];
            }
        });
        // reset pagination and selection when filters change
        setTablePage(0);
        setSelectedRows(new Set());
    };

    // ── remove specific filter ──
    const handleRemoveFilter = (filterType, filterValue) => {
        setActiveFilters(prev => prev.filter(f => !(f.type === filterType && f.value === filterValue)));
        setTablePage(0);
        setSelectedRows(new Set());
    };

    // ── clear all filters ──
    const handleClearAllFilters = () => {
        setActiveFilters([]);
        setTablePage(0);
        setSelectedRows(new Set());
    };

    // ── handle switch lead button click ──
    const handleSwitchLead = () => {
        setReassignableLeadsPage(0);
        setShowReassignableLeads(true);
    };

    // ── handle switch follow-up button click ──
    const handleSwitchFollowUp = () => {
        setReassignableFollowUpsPage(0);
        setShowReassignableFollowUps(true);
    };

    // ── get current filter label for display ──
    const getFilterLabel = () => {
        if (activeFilters.length === 0) return 'All Leads';
        if (activeFilters.length === 1) return activeFilters[0].label;
        return `Filtered (${activeFilters.length})`;
    };

    // ── row selection handlers ──
    const handleToggleRow = (rowId) => {
        setSelectedRows(prev => {
            const next = new Set(prev);
            next.has(rowId) ? next.delete(rowId) : next.add(rowId);
            return next;
        });
    };

    const handleToggleAll = (checked, rows) => {
        setSelectedRows(prev => {
            const next = new Set(prev);
            rows.forEach(r => {
                const rowId = r.id ?? r.leadId;
                checked ? next.add(rowId) : next.delete(rowId);
            });
            return next;
        });
    };

    // ── reassignable leads row selection handlers ──
    const handleReassignableLeadsToggleRow = (rowId) => {
        setReassignableLeadsSelectedRows(prev => {
            const next = new Set(prev);
            next.has(rowId) ? next.delete(rowId) : next.add(rowId);
            return next;
        });
    };

    const handleReassignableLeadsToggleAll = (checked, rows) => {
        setReassignableLeadsSelectedRows(prev => {
            const next = new Set(prev);
            rows.forEach(r => {
                const rowId = r.id ?? r.leadId;
                checked ? next.add(rowId) : next.delete(rowId);
            });
            return next;
        });
    };

    // ── reassignable follow-ups row selection handlers ──
    const handleReassignableFollowUpsToggleRow = (rowId) => {
        setReassignableFollowUpsSelectedRows(prev => {
            const next = new Set(prev);
            next.has(rowId) ? next.delete(rowId) : next.add(rowId);
            return next;
        });
    };

    const handleReassignableFollowUpsToggleAll = (checked, rows) => {
        setReassignableFollowUpsSelectedRows(prev => {
            const next = new Set(prev);
            rows.forEach(r => {
                const rowId = r.id ?? r.followUpId;
                checked ? next.add(rowId) : next.delete(rowId);
            });
            return next;
        });
    };

    // ── remark modal handlers ──
    const openRemarkModal  = (lead) => { setSelectedLeadForRemark(lead); setIsRemarkModalOpen(true); };
    const closeRemarkModal = () => { setIsRemarkModalOpen(false); setSelectedLeadForRemark(null); };

    // ── reassign modal handler ──
    const handleReassign = async (payload) => {
        try {
            // After successful reassignment, clear selected rows and refresh data
            if (reassignDataType === 'leads') {
                setSelectedRows(new Set());
                setReassignableLeadsSelectedRows(new Set());
                setTablePage((prev) => prev);
                setReassignableLeadsPage((prev) => prev);
            } else {
                setReassignableFollowUpsSelectedRows(new Set());
                setReassignableFollowUpsPage((prev) => prev);
            }
            
            return Promise.resolve();
        } catch (error) {
            console.error('Reassign failed:', error);
            throw error;
        }
    };

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

    /* ── Color + Initials helpers ── */
    const getColor = (str = '') => {
        const colors = ['#7C3AED', '#0891B2', '#16A34A', '#EA580C', '#DB2777', '#0369A1', '#2563EB'];
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const getInitials = (first = '', last = '') => {
        if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
        if (first) return first.slice(0, 2).toUpperCase();
        return 'U';
    };

    const fullName = details
        ? (details.name || `${details.firstName || ''} ${details.lastName || ''}`.trim() || 'Unknown')
        : '';

    const isActive = details?.isActive !== false;

    return (
        <div className="block p-4 sm:p-6">
            {/* ── Page Header ── */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                        onClick={() => navigate('/counselors')}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">
                            Counselor Details
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            View comprehensive details for this counselor
                        </p>
                    </div>
                </div>
            </div>

            {/* ── States ── */}
            {loading ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-5xl">
                    <div className="flex items-center justify-center py-12 gap-3 text-gray-500">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            style={{ animation: 'spin 1s linear infinite' }}>
                            <path d="M21 12a9 9 0 11-6.219-8.56" />
                        </svg>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        Loading counselor details…
                    </div>
                </div>
            ) : error ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-5xl">
                    <div className="flex items-center justify-center py-12 text-red-500">{error}</div>
                </div>
            ) : (
                <>
                    {/* ── Details Card ── */}
                    {details && (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-5xl">
                            {/* ── Avatar + Name Header ── */}
                            <div className="flex flex-col sm:flex-row items-start gap-5 mb-8 pb-6 border-b border-gray-100">
                                <div
                                    className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0"
                                    style={{ backgroundColor: getColor(fullName) }}
                                >
                                    {getInitials(details.firstName || fullName, details.lastName || '')}
                                </div>

                                <div className="flex-1">
                                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{fullName}</h2>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${
                                            isActive
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-red-50 text-red-700 border-red-200'
                                        }`}>
                                            {isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        <span className="bg-gray-50 text-gray-500 text-[10px] font-medium px-2.5 py-1 rounded-full border border-gray-200">
                                            ID: {details?.id || 'N/A'}
                                        </span>
                                        {(details?.role?.name || details?.role) && (
                                            <span className="bg-blue-50 text-blue-600 text-[10px] font-medium px-2.5 py-1 rounded-full border border-blue-200">
                                                {details?.role?.name || details?.role}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ── Details Grid ── */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Email */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Email Address
                                    </div>
                                    <div className="text-sm font-semibold text-gray-800">
                                        {details?.email || 'N/A'}
                                    </div>
                                </div>

                                {/* Contact */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Contact Number
                                    </div>
                                    <div className="text-sm font-semibold text-gray-800">
                                        {details?.mobileNo || details?.phone || 'N/A'}
                                    </div>
                                </div>

                                {/* Role */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Role
                                    </div>
                                    <div className="text-sm font-semibold text-gray-800">
                                        {details?.role?.name || details?.role || 'N/A'}
                                    </div>
                                </div>

                                {/* Username */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Username
                                    </div>
                                    <div className="text-sm font-semibold text-gray-800">
                                        {details?.username || details?.userName || 'N/A'}
                                    </div>
                                </div>

                                {/* Created At */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Created At
                                    </div>
                                    <div className="text-sm font-semibold text-gray-800">
                                        {details?.createdAt
                                            ? new Date(details.createdAt).toLocaleString()
                                            : 'N/A'}
                                    </div>
                                </div>

                                {/* Updated At */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Last Updated
                                    </div>
                                    <div className="text-sm font-semibold text-gray-800">
                                        {details?.updatedAt
                                            ? new Date(details.updatedAt).toLocaleString()
                                            : 'N/A'}
                                    </div>
                                </div>

                                {/* Address */}
                                {details?.address && (
                                    <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                            Address
                                        </div>
                                        <div className="text-sm font-semibold text-gray-800 leading-relaxed">
                                            {details.address}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Dashboard Cards ── */}
                    <div className="mb-8 mt-6">
                        <LeadCards
                            onCardClick={handleCardClick}
                            activeFilters={activeFilters}
                            counselorId={id}
                        />
                        <LeadSource
                            data={dashData.leadSource}
                            onCardClick={handleCardClick}
                            activeFilters={activeFilters}
                        />
                        <CategorywiseCard
                            data={dashData.courseType}
                            onCardClick={handleCardClick}
                            activeFilters={activeFilters}
                        />
                        <BoardWiseCard
                            data={dashData.board}
                            onCardClick={handleCardClick}
                            activeFilters={activeFilters}
                        />
                        <GradWiseCard
                            data={dashData.grade}
                            onCardClick={handleCardClick}
                            activeFilters={activeFilters}
                        />
                    </div>

                    {/* ── Filtered Lead Table ── */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="w-1 h-5 bg-indigo-500 rounded-full" />
                                <h3 className="text-base font-bold text-gray-900">{getFilterLabel()}</h3>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {tableTotalElements} records
                                </span>
                                
                                {/* Active Filters Display */}
                                {activeFilters.length > 0 && (
                                    <div className="flex items-center gap-2 flex-wrap ml-2">
                                        {activeFilters.map((filter, index) => (
                                            <div
                                                key={`${filter.type}-${filter.value}-${index}`}
                                                className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200"
                                            >
                                                <span className="font-medium">{filter.label}</span>
                                                <button
                                                    onClick={() => handleRemoveFilter(filter.type, filter.value)}
                                                    className="hover:text-red-600 transition-colors"
                                                    title="Remove this filter"
                                                >
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                        <line x1="18" y1="6" x2="6" y2="18" />
                                                        <line x1="6" y1="6" x2="18" y2="18" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                        {activeFilters.length > 1 && (
                                            <button
                                                onClick={handleClearAllFilters}
                                                className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded-full border border-red-200 transition-all"
                                            >
                                                Clear All
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedRows.size > 0 && (
                                    <button
                                        onClick={() => {
                                            setReassignDataType('leads');
                                            setIsReassignModalOpen(true);
                                        }}
                                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm bg-orange-600 text-white hover:bg-orange-700"
                                    >
                                        Reassign ({selectedRows.size})
                                    </button>
                                )}
                                <button
                                    onClick={handleSwitchLead}
                                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm bg-indigo-600 text-white hover:bg-indigo-700"
                                >
                                    Switch Lead
                                </button>
                            </div>
                        </div>

                        {tableLoading ? (
                            <div className="flex justify-center items-center h-40 bg-white rounded-xl border border-gray-200">
                                <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-500" />
                                <span className="ml-2 text-sm text-gray-500">Loading data...</span>
                            </div>
                        ) : (
                            <div className="card">
                                <ReusableTable
                                    columns={buildLeadColumns(tablePage, tableSize, selectedRows, handleToggleRow, handleToggleAll, tableData)}
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
                                    emptyMessage={`No leads found for ${activeFilters.length === 1 ? `"${activeFilters[0].label}"` : 'selected filters'}`}
                                />
                            </div>
                        )}
                    </div>

                    {/* ── Reassignable Leads Table ── */}
                    {showReassignableLeads && (
                        <div className="mt-6" ref={reassignableLeadsRef}>
                            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-5 bg-purple-500 rounded-full" />
                                    <h3 className="text-base font-bold text-gray-900">Reassignable Leads</h3>
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {reassignableLeadsTotalElements} records
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {reassignableLeadsSelectedRows.size > 0 && (
                                        <button
                                            onClick={() => {
                                                setReassignDataType('leads');
                                                setIsReassignModalOpen(true);
                                            }}
                                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm bg-orange-600 text-white hover:bg-orange-700"
                                        >
                                            Reassign ({reassignableLeadsSelectedRows.size})
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setShowReassignableLeads(false)}
                                        className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded-full border border-red-200 transition-all"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>

                            {reassignableLeadsLoading ? (
                                <div className="flex justify-center items-center h-40 bg-white rounded-xl border border-gray-200">
                                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-purple-500" />
                                    <span className="ml-2 text-sm text-gray-500">Loading reassignable leads...</span>
                                </div>
                            ) : (
                                <div className="card">
                                    <ReusableTable
                                        columns={buildLeadColumns(reassignableLeadsPage, reassignableLeadsSize, reassignableLeadsSelectedRows, handleReassignableLeadsToggleRow, handleReassignableLeadsToggleAll, reassignableLeadsData)}
                                        data={reassignableLeadsData}
                                        isServerSide={true}
                                        totalElements={reassignableLeadsTotalElements}
                                        totalPages={reassignableLeadsTotalPages}
                                        currentPage={reassignableLeadsPage + 1}
                                        rowsPerPage={reassignableLeadsSize}
                                        onPageChange={(newPage) => setReassignableLeadsPage(newPage - 1)}
                                        onRowsPerPageChange={(newSize) => { setReassignableLeadsSize(newSize); setReassignableLeadsPage(0); }}
                                        actions={(row) => {
                                            const safeRow = {
                                                ...row,
                                                id:     typeof row.id     === 'object' ? row.id?.id     : row.id,
                                                leadId: typeof row.leadId === 'object' ? row.leadId?.id : row.leadId,
                                            };
                                            return (
                                                <div className="flex justify-center items-center gap-3">
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
                                        emptyMessage="No reassignable leads found"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Follow-up Table ── */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-5 bg-green-500 rounded-full" />
                                <h3 className="text-base font-bold text-gray-900">Follow-up Table</h3>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {followUpTotalElements} records
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleSwitchFollowUp}
                                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm bg-green-600 text-white hover:bg-green-700"
                                >
                                    Switch Follow-up
                                </button>
                            </div>
                        </div>

                        {followUpLoading ? (
                            <div className="flex justify-center items-center h-40 bg-white rounded-xl border border-gray-200">
                                <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-green-500" />
                                <span className="ml-2 text-sm text-gray-500">Loading follow-ups...</span>
                            </div>
                        ) : (
                            <div className="card">
                                <ReusableTable
                                    columns={buildFollowUpColumns(followUpPage, followUpSize, false, new Set(), () => {}, () => {}, followUpData)}
                                    data={followUpData}
                                    isServerSide={true}
                                    totalElements={followUpTotalElements}
                                    totalPages={followUpTotalPages}
                                    currentPage={followUpPage + 1}
                                    rowsPerPage={followUpSize}
                                    onPageChange={(newPage) => setFollowUpPage(newPage - 1)}
                                    onRowsPerPageChange={(newSize) => { setFollowUpSize(newSize); setFollowUpPage(0); }}
                                    emptyMessage="No follow-ups found"
                                />
                            </div>
                        )}
                    </div>

                    {/* ── Reassignable Follow-ups Table ── */}
                    {showReassignableFollowUps && (
                        <div className="mt-6" ref={reassignableFollowUpsRef}>
                            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-5 bg-orange-500 rounded-full" />
                                    <h3 className="text-base font-bold text-gray-900">Reassignable Follow-ups</h3>
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {reassignableFollowUpsTotalElements} records
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {reassignableFollowUpsSelectedRows.size > 0 && (
                                        <button
                                            onClick={() => {
                                                setReassignDataType('followups');
                                                setIsReassignModalOpen(true);
                                            }}
                                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm bg-orange-600 text-white hover:bg-orange-700"
                                        >
                                            Reassign ({reassignableFollowUpsSelectedRows.size})
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setShowReassignableFollowUps(false)}
                                        className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded-full border border-red-200 transition-all"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>

                            {reassignableFollowUpsLoading ? (
                                <div className="flex justify-center items-center h-40 bg-white rounded-xl border border-gray-200">
                                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-orange-500" />
                                    <span className="ml-2 text-sm text-gray-500">Loading reassignable follow-ups...</span>
                                </div>
                            ) : (
                                <div className="card">
                                    <ReusableTable
                                        columns={buildFollowUpColumns(reassignableFollowUpsPage, reassignableFollowUpsSize, true, reassignableFollowUpsSelectedRows, handleReassignableFollowUpsToggleRow, handleReassignableFollowUpsToggleAll, reassignableFollowUpsData)}
                                        data={reassignableFollowUpsData}
                                        isServerSide={true}
                                        totalElements={reassignableFollowUpsTotalElements}
                                        totalPages={reassignableFollowUpsTotalPages}
                                        currentPage={reassignableFollowUpsPage + 1}
                                        rowsPerPage={reassignableFollowUpsSize}
                                        onPageChange={(newPage) => setReassignableFollowUpsPage(newPage - 1)}
                                        onRowsPerPageChange={(newSize) => { setReassignableFollowUpsSize(newSize); setReassignableFollowUpsPage(0); }}
                                        emptyMessage="No reassignable follow-ups found"
                                    />
                                </div>
                            )}
                        </div>
                    )}

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

                    {/* ── Assign / Distribute Modal ── */}
                    <AssignLeadModal
                        isOpen={isAssignModalOpen}
                        onClose={() => setIsAssignModalOpen(false)}
                        filters={{
                            assignedUserIds: id ? [id] : [],
                            ...(activeFilters.some(f => f.type === 'leadStatus') && { 
                                leadStatusIds: activeFilters.filter(f => f.type === 'leadStatus').map(f => f.value) 
                            }),
                            ...(activeFilters.some(f => f.type === 'leadSource') && { 
                                leadSourceIds: activeFilters.filter(f => f.type === 'leadSource').map(f => f.value) 
                            }),
                            ...(activeFilters.some(f => f.type === 'courseType') && { 
                                courseTypeIds: activeFilters.filter(f => f.type === 'courseType').map(f => f.value) 
                            }),
                            ...(activeFilters.some(f => f.type === 'board') && { 
                                boardIds: activeFilters.filter(f => f.type === 'board').map(f => f.value) 
                            }),
                            ...(activeFilters.some(f => f.type === 'grade') && { 
                                gradeIds: activeFilters.filter(f => f.type === 'grade').map(f => f.value) 
                            }),
                        }}
                        showToast={(msg, type) => console.log(`[${type}]`, msg)}
                    />

                    {/* ── Reassign Modal ── */}
                    <ReassignModal
                        isOpen={isReassignModalOpen}
                        onClose={() => setIsReassignModalOpen(false)}
                        currentCounselorId={id}
                        selectedRows={reassignDataType === 'leads' ? 
                            (showReassignableLeads ? reassignableLeadsSelectedRows : selectedRows) : 
                            reassignableFollowUpsSelectedRows}
                        dataType={reassignDataType}
                        showToast={showToast}
                        onReassign={handleReassign}
                    />
                </>
            )}
        </div>
    );
};

export default CounselorDetails;

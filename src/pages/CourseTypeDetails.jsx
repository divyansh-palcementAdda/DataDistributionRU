import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiEye, FiMessageSquare, FiUserPlus } from 'react-icons/fi';
import { useAppContext } from '../AppContext';
import { usePermissions } from '../PermissionContext';
import { getCourseTypeById } from '../Services/courseTypes/courseTypeService';
import {
    getLeadSourceBreakdown,
    getGradeBreakdown,
    getBoardBreakdown,
} from '../Services/cards/cardService';
import axiosInstance from '../axiosInstance/axios';
import ApiRoutes from '../apiRoutes/allApiRoutes';
import LeadCards from '../component/reusable/DashBoards/leadCards';
import LeadSource from '../component/reusable/DashBoards/leadSource';
import BoardWiseCard from '../component/reusable/DashBoards/BoardWiseCard';
import GradWiseCard from '../component/reusable/DashBoards/gradWiseCard';
import UnallottedCard from '../component/reusable/DashBoards/UnallottedCard';
import AvailedCard from '../component/reusable/DashBoards/availedCard';
import AllottedCard from '../component/reusable/DashBoards/allottedCard';
import ReusableTable from '../component/reusable/table';
import LeadRemarkModal from '../component/reusable/Leads/LeadRemarkModal';
import AssignLeadModal from '../component/reusable/Leads/AssignLeadModal';

// ─── Lead table columns (same as Leads.jsx) ─────────────────────────────────
const buildLeadColumns = (page, size, onOpenRemark, navTo, selectedRows, onToggleRow, onToggleAll, currentData, hasPermission) => [
    {
        key: 'checkbox',
        header: hasPermission('LEAD_ASSIGN') ? (
            <input
                type="checkbox"
                checked={currentData.length > 0 && currentData.every(r => selectedRows.has(r.id ?? r.leadId))}
                onChange={(e) => onToggleAll(e.target.checked, currentData)}
                style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#4f46e5' }}
                title="Select All"
            />
        ) : null,
        sortable: false,
        render: (value, row) => {
            if (!hasPermission('LEAD_ASSIGN')) return null;
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

// ─── Helper: fetch leads for the selected card (server-side) ─────────────────
const fetchLeadsForCard = async (activeFilters, courseTypeId, page, size, sortBy, sortDirection, filterRequest) => {
    if (!courseTypeId) return { content: [], totalElements: 0, totalPages: 0 };

    const params = {
        courseTypeId,
        page,
        size,
        sortBy: sortBy || 'createdAt',
        sortDirection: sortDirection || 'desc',
    };

    // Smart conversion function: array to singular/plural based on length
    const convertFilterRequest = (request) => {
        const converted = { ...request };
        
        // Convert leadStatusIds → statusId or statusIds
        if (converted.leadStatusIds?.length === 1) {
            converted.statusId = converted.leadStatusIds[0];
            delete converted.leadStatusIds;
        }
        
        // Convert boardIds → boardId or boardIds
        if (converted.boardIds?.length === 1) {
            converted.boardId = converted.boardIds[0];
            delete converted.boardIds;
        }
        
        // Convert gradeIds → gradeId or gradeIds
        if (converted.gradeIds?.length === 1) {
            converted.gradeId = converted.gradeIds[0];
            delete converted.gradeIds;
        }
        
        // Convert courseTypeIds → courseTypeId or courseTypeIds
        if (converted.courseTypeIds?.length === 1) {
            converted.courseTypeId = converted.courseTypeIds[0];
            delete converted.courseTypeIds;
        }
        
        // Convert leadSourceIds → leadSourceId or leadSourceIds
        if (converted.leadSourceIds?.length === 1) {
            converted.leadSourceId = converted.leadSourceIds[0];
            delete converted.leadSourceIds;
        }
        
        return converted;
    };

    // Use filterRequest with smart conversion instead of direct assignment
    Object.assign(params, convertFilterRequest(filterRequest || {}));

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

// ─── Helper: fetch dashboard breakdown data for all card sections ────────────
const fetchDashboardData = async (courseTypeId) => {
    const params = { courseTypeId };
    try {
        const [sourceRes, boardRes, gradeRes] = await Promise.all([
            getLeadSourceBreakdown(params).catch(() => null),
            getBoardBreakdown(params).catch(() => null),
            getGradeBreakdown(params).catch(() => null),
        ]);

        // Cards now accept array format: [{id, name, code, count, percentage}]
        const toArr = (res) => res?.data?.data || res?.data || [];

        return {
            leadSource: toArr(sourceRes),
            board:      toArr(boardRes),
            grade:      toArr(gradeRes),
        };
    } catch (err) {
        console.error('Dashboard data fetch failed', err);
        return { leadSource: [], board: [], grade: [] };
    }
};

// ─── Main Component ──────────────────────────────────────────────────────────
const CourseTypeDetails = () => {
    const { id } = useParams();
    const { navTo } = useAppContext();
    const { hasPermission } = usePermissions();

    // detail state
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // dashboard card data
    const [dashData, setDashData] = useState({ leadSource: [], board: [], grade: [] });

    // filter / table state - support multiple active filters
    const [activeFilters, setActiveFilters] = useState([]); // Array of { type, value, label }
    const [tableData, setTableData] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);

    // filter request for cards
    const [filterRequest, setFilterRequest] = useState({ courseTypeId: id });

    // server-side pagination & sorting for lead table
    const [tablePage, setTablePage]             = useState(0);
    const [tableSize, setTableSize]             = useState(10);
    const [tableTotalElements, setTableTotalElements] = useState(0);
    const [tableTotalPages, setTableTotalPages] = useState(0);
    const [tableSortBy, setTableSortBy]         = useState('createdAt');
    const [tableSortDir, setTableSortDir]       = useState('desc');

    // remark modal
    const [isRemarkModalOpen, setIsRemarkModalOpen]       = useState(false);
    const [selectedLeadForRemark, setSelectedLeadForRemark] = useState(null);

    // row selection & assign modal
    const [selectedRows, setSelectedRows]         = useState(new Set());
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    // ── fetch course-type details ──
    useEffect(() => {
        if (!id) return;
        const run = async () => {
            setLoading(true);
            try {
                const res = await getCourseTypeById(id);
                if (res?.success) {
                    setDetails(res.data);
                } else {
                    setError(res?.message || 'Failed to load details');
                }
            } catch (err) {
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [id]);

    // ── fetch dashboard breakdown data for cards ──
    useEffect(() => {
        if (!id) return;
        fetchDashboardData(id).then(setDashData);
    }, [id]);

    // ── fetch table data when filters change or pagination/sort changes ──
    useEffect(() => {
        if (!id) return;
        setTableLoading(true);
        fetchLeadsForCard(activeFilters, id, tablePage, tableSize, tableSortBy, tableSortDir, filterRequest)
            .then(({ content, totalElements, totalPages }) => {
                setTableData(content);
                setTableTotalElements(totalElements);
                setTableTotalPages(totalPages);
                setTableLoading(false);
            });
    }, [activeFilters, id, tablePage, tableSize, tableSortBy, tableSortDir, filterRequest]);

    // ── update filterRequest when activeFilters change for cards ──
    useEffect(() => {
        const newFilterRequest = { courseTypeId: id };
        activeFilters.forEach(filter => {
            switch (filter.type) {
                case 'unallotted':
                    newFilterRequest.allotted = false;
                    break;
                case 'availed':
                    newFilterRequest.availed = true;
                    break;
                case 'allotted':
                    newFilterRequest.allotted = true;
                    break;
                case 'leadStatus':
                    if (!newFilterRequest.leadStatusIds) newFilterRequest.leadStatusIds = [];
                    if (!newFilterRequest.leadStatusIds.includes(filter.value)) {
                        newFilterRequest.leadStatusIds.push(filter.value);
                    }
                    break;
                case 'board':
                    if (!newFilterRequest.boardIds) newFilterRequest.boardIds = [];
                    if (!newFilterRequest.boardIds.includes(filter.value)) {
                        newFilterRequest.boardIds.push(filter.value);
                    }
                    break;
                case 'grade':
                    if (!newFilterRequest.gradeIds) newFilterRequest.gradeIds = [];
                    if (!newFilterRequest.gradeIds.includes(filter.value)) {
                        newFilterRequest.gradeIds.push(filter.value);
                    }
                    break;
                case 'leadSource':
                    if (!newFilterRequest.leadSourceIds) newFilterRequest.leadSourceIds = [];
                    if (!newFilterRequest.leadSourceIds.includes(filter.value)) {
                        newFilterRequest.leadSourceIds.push(filter.value);
                    }
                    break;
                default:
                    break;
            }
        });
        setFilterRequest(newFilterRequest);
    }, [activeFilters, id]);

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

    // ── remark modal handlers ──
    const openRemarkModal  = (lead) => { setSelectedLeadForRemark(lead); setIsRemarkModalOpen(true); };
    const closeRemarkModal = () => { setIsRemarkModalOpen(false); setSelectedLeadForRemark(null); };

    // ── lead table sort handler ──
    const handleLeadSort = (columnKey, direction) => {
        const fieldMap = {
            leadCode: 'leadCode',
            lead: 'fullName',
            courseInterested: 'courseInterested',
            source: 'source.name',
            currentStatus: 'currentStatus',
            assignedTo: 'assignedTo',
            nextFollowUpDate: 'nextFollowUpDate',
            createdBy: 'createdAt',
        };
        setTableSortBy(fieldMap[columnKey] || columnKey);
        setTableSortDir(direction);
        setTablePage(0);
    };

    const goBack = () => navTo('/course-types');

    // ── loading / error guards ──
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <span className="ml-2 text-gray-600 font-medium">Loading details...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex justify-between items-center shadow-sm">
                    <span>{error}</span>
                    <button onClick={goBack} className="text-sm font-semibold underline hover:text-red-800">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="block p-4 sm:p-6" id="page-course-type-detail">

            {/* ── Page Header ── */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                        onClick={goBack}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">Category Details</h1>
                        <p className="text-sm text-gray-500 mt-1">View comprehensive details for this category</p>
                    </div>
                </div>
            </div>

            {/* ── Detail Card ── */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-4xl mb-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start gap-5 mb-8 pb-6 border-b border-gray-100">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0">
                        {details?.name ? details.name.substring(0, 2).toUpperCase() : 'CT'}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{details?.name || 'N/A'}</h2>
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${
                                details?.status === 'ACTIVE'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                                {details?.status || 'UNKNOWN'}
                            </span>
                            <span className="bg-gray-50 text-gray-500 text-[10px] font-medium px-2.5 py-1 rounded-full border border-gray-200">
                                ID: {details?.id || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                            </svg>
                            Description
                        </div>
                        <div className="text-sm font-semibold text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {details?.description || 'No description provided.'}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            Creation Date
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                            {details?.createdAt ? new Date(details.createdAt).toLocaleString() : 'N/A'}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Last Updated
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                            {details?.updatedAt ? new Date(details.updatedAt).toLocaleString() : 'N/A'}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Dashboard Cards ── */}
            <div className="mb-8">
                {/* Allotted, Availed, Unallotted Cards Row */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <AllottedCard
                        onCardClick={handleCardClick}
                        activeFilters={activeFilters}
                        filterRequest={filterRequest}
                        courseTypeId={id}
                    />

                    <AvailedCard
                        onCardClick={handleCardClick}
                        activeFilters={activeFilters}
                        filterRequest={filterRequest}
                        courseTypeId={id}
                    />

                    <UnallottedCard
                        onCardClick={handleCardClick}
                        activeFilters={activeFilters}
                        filterRequest={filterRequest}
                        courseTypeId={id}
                    />
                </div>

                <LeadCards
                    onCardClick={handleCardClick}
                    activeFilters={activeFilters}
                    courseTypeId={id}
                />

                <LeadSource
                    data={dashData.leadSource}
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
            {activeFilters.length >= 0 && (
                <div className="mt-6">
                    {/* Table Header */}
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="w-1 h-5 bg-indigo-500 rounded-full" />
                            <h3 className="text-base font-bold text-gray-900">
                                {getFilterLabel()}
                            </h3>
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
                            {hasPermission('LEAD_ASSIGN') && (
                                <button
                                    onClick={() => setIsAssignModalOpen(true)}
                                    disabled={selectedRows.size === 0}
                                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm"
                                    style={{
                                        backgroundColor: selectedRows.size === 0 ? 'var(--gray-200, #e5e7eb)' : '#4f46e5',
                                        color: selectedRows.size === 0 ? 'var(--gray-400, #9ca3af)' : '#fff',
                                        cursor: selectedRows.size === 0 ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    <FiUserPlus size={13} />
                                    Allot Leads{selectedRows.size > 0 ? ` (${selectedRows.size})` : ''}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Loading spinner */}
                    {tableLoading ? (
                        <div className="flex justify-center items-center h-40 bg-white rounded-xl border border-gray-200">
                            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-500" />
                            <span className="ml-2 text-sm text-gray-500">Loading data...</span>
                        </div>
                    ) : (
                        <div className="card">
                            <ReusableTable
                                columns={buildLeadColumns(tablePage, tableSize, openRemarkModal, navTo, selectedRows, handleToggleRow, handleToggleAll, tableData, hasPermission)}
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
                                        id: typeof row.id === 'object' ? row.id?.id : row.id,
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
                                                onClick={() => navTo(`lead-detail/${safeRow?.id ?? safeRow?.leadId}`)}
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
            )}

            {/* ── Hint when no card selected — removed (default all-leads table always visible) ── */}
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

        {/* ── Assign / Distribute Modal ── */}
        <AssignLeadModal
            isOpen={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
            filters={{
                courseTypeIds: id ? [id] : [],
                ...(activeFilters.some(f => f.type === 'leadStatus') && {
                    leadStatusIds: activeFilters.filter(f => f.type === 'leadStatus').map(f => f.value)
                }),
                ...(activeFilters.some(f => f.type === 'leadSource') && {
                    leadSourceIds: activeFilters.filter(f => f.type === 'leadSource').map(f => f.value)
                }),
                ...(activeFilters.some(f => f.type === 'board') && {
                    boardIds: activeFilters.filter(f => f.type === 'board').map(f => f.value)
                }),
                ...(activeFilters.some(f => f.type === 'grade') && {
                    gradeIds: activeFilters.filter(f => f.type === 'grade').map(f => f.value)
                }),
                ...(activeFilters.some(f => f.type === 'unallotted') && {
                    allotted: false
                }),
                ...(activeFilters.some(f => f.type === 'availed') && {
                    availed: true
                }),
                ...(activeFilters.some(f => f.type === 'allotted') && {
                    allotted: true
                }),
            }}
            showToast={(msg, type) => console.log(`[${type}]`, msg)}
        />
        </>
    );
};

export default CourseTypeDetails;

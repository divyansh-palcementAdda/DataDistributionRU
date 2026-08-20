import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiEye, FiMessageSquare } from 'react-icons/fi';
import { useAppContext } from '../AppContext';
import gradsService from '../Services/Grads/gradsService';
import {
    getLeadSourceBreakdown,
    getBoardBreakdown,
    getCourseTypesBreakdown,
} from '../Services/cards/cardService';
import axiosInstance from '../axiosInstance/axios';
import ApiRoutes from '../apiRoutes/allApiRoutes';
import LeadCards from '../component/reusable/DashBoards/leadCards';
import LeadSource from '../component/reusable/DashBoards/leadSource';
import CategorywiseCard from '../component/reusable/DashBoards/categorywiseCard';
import BoardWiseCard from '../component/reusable/DashBoards/BoardWiseCard';
import ReusableTable from '../component/reusable/table';
import LeadRemarkModal from '../component/reusable/Leads/LeadRemarkModal';

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
const fetchLeadsForCard = async (selectedCard, gradeId, page, size, sortBy, sortDirection) => {
    if (!selectedCard) return { content: [], totalElements: 0, totalPages: 0 };

    const params = {
        gradeId,          // always filter by this grade
        page,
        size,
        sortBy: sortBy || 'createdAt',
        sortDirection: sortDirection || 'desc',
    };

    switch (selectedCard.type) {
        case 'leadStatus':  params.statusId     = selectedCard.value; break;
        case 'leadSource':  params.sourceId     = selectedCard.value; break;
        case 'courseType':  params.courseTypeId = selectedCard.value; break;
        case 'board':       params.boardId      = selectedCard.value; break;
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
const GradesDetails = () => {
    const { navTo } = useAppContext();
    const { id } = useParams();

    // detail state
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);

    // dashboard card data
    const [dashData, setDashData] = useState({ leadSource: [], courseType: [], board: [] });

    // filter / table state
    const [selectedCard, setSelectedCard]               = useState(null);
    const [tableData, setTableData]                     = useState([]);
    const [tableLoading, setTableLoading]               = useState(false);

    // server-side pagination & sorting
    const [tablePage, setTablePage]                     = useState(0);
    const [tableSize, setTableSize]                     = useState(10);
    const [tableTotalElements, setTableTotalElements]   = useState(0);
    const [tableTotalPages, setTableTotalPages]         = useState(0);
    const [tableSortBy, setTableSortBy]                 = useState('createdAt');
    const [tableSortDir, setTableSortDir]               = useState('desc');

    // remark modal
    const [isRemarkModalOpen, setIsRemarkModalOpen]         = useState(false);
    const [selectedLeadForRemark, setSelectedLeadForRemark] = useState(null);

    // ── fetch grade details ──
    useEffect(() => {
        if (!id) return;
        const run = async () => {
            setLoading(true);
            try {
                const res = await gradsService.getGradeById(id);
                setDetails({
                    id:           res.data.id,
                    gradeName:    res.data.name,
                    gradeCode:    res.data.code,
                    description:  res.data.description,
                    status:       res.data.active ? 'ACTIVE' : 'INACTIVE',
                    displayOrder: res.data.displayOrder,
                    createdAt:    res.data.createdAt,
                    updatedAt:    res.data.updatedAt,
                });
            } catch (err) {
                console.error('Failed to fetch grade details', err);
                setError(err.message || 'An error occurred');
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
            const params = { gradeId: id };
            try {
                const [sourceRes, courseTypeRes, boardRes] = await Promise.all([
                    getLeadSourceBreakdown(params).catch(() => null),
                    getCourseTypesBreakdown(params).catch(() => null),
                    getBoardBreakdown(params).catch(() => null),
                ]);
                const toArr = (r) => r?.data?.data || r?.data || [];
                setDashData({
                    leadSource: toArr(sourceRes),
                    courseType: toArr(courseTypeRes),
                    board:      toArr(boardRes),
                });
            } catch (err) {
                console.error('Dashboard data fetch failed', err);
            }
        };
        fetchDashboardData();
    }, [id]);

    // ── fetch leads when card selected or pagination/sort changes ──
    useEffect(() => {
        if (!selectedCard) { setTableData([]); setTableTotalElements(0); setTableTotalPages(0); return; }
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
        setSelectedCard(isSame ? null : card);
        setTablePage(0);
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

    const goBack = () => navTo('grades');

    return (
        <>
        <div className="block p-4 sm:p-6" id="page-grade-detail">

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
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">Grade Details</h1>
                        <p className="text-sm text-gray-500 mt-1">View comprehensive details for this grade</p>
                    </div>
                </div>
            </div>

            {/* ── Loading State ── */}
            {loading && (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                    <span className="ml-2 text-gray-600 font-medium">Loading details...</span>
                </div>
            )}

            {/* ── Error State ── */}
            {error && !loading && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex justify-between items-center shadow-sm mb-6">
                    <span>{error}</span>
                    <button onClick={goBack} className="text-sm font-semibold underline hover:text-red-800">
                        Go Back
                    </button>
                </div>
            )}

            {/* ── Detail Card (TOP) ── */}
            {!loading && !error && details && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-5xl mb-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start gap-5 mb-8 pb-6 border-b border-gray-100">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0">
                            {details?.gradeName ? details.gradeName.substring(0, 2).toUpperCase() : 'GR'}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{details?.gradeName || 'N/A'}</h2>
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
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Grade Code</div>
                            <div className="text-sm font-semibold text-gray-800">{details?.gradeCode || 'N/A'}</div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Display Order</div>
                            <div className="text-sm font-semibold text-gray-800">{details?.displayOrder ?? 'N/A'}</div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Creation Date</div>
                            <div className="text-sm font-semibold text-gray-800">
                                {details?.createdAt ? new Date(details.createdAt).toLocaleString() : 'N/A'}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Last Updated</div>
                            <div className="text-sm font-semibold text-gray-800">
                                {details?.updatedAt ? new Date(details.updatedAt).toLocaleString() : 'N/A'}
                            </div>
                        </div>

                        <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Description</div>
                            <div className="text-sm font-semibold text-gray-800 leading-relaxed whitespace-pre-wrap">
                                {details?.description || 'No description available.'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Dashboard Cards (BOTTOM) ── */}
            {!loading && !error && (
                <div className="mb-8">
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
                </div>
            )}

            {/* ── Filtered Lead Table ── */}
            {selectedCard && (
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-5 bg-indigo-500 rounded-full" />
                            <h3 className="text-base font-bold text-gray-900">{selectedCard.label}</h3>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {tableTotalElements} records
                            </span>
                        </div>
                        <button
                            onClick={() => setSelectedCard(null)}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-red-200 transition-all"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            Clear Filter
                        </button>
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
                                                onClick={() => navTo(`lead-detail/${safeRow?.id ?? safeRow?.leadId}`)}
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

            {/* ── Hint when no card selected ── */}
            {!selectedCard && !loading && !error && (
                <div className="mt-6 flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-50">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                    <p className="text-sm font-medium">No Data</p>
                </div>
            )}
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

export default GradesDetails;

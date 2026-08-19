import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { getLeadSourceById } from '../Services/leadsource/leadSourceService';
import {
    getLeadStatusBreakdown,
    getLeadSourceBreakdown,
    getGradeBreakdown,
    getBoardBreakdown,
    getCourseTypesBreakdown,
} from '../Services/cards/cardService';
import LeadCards from '../component/reusable/DashBoards/leadCards';
import CategorywiseCard from '../component/reusable/DashBoards/categorywiseCard';
import BoardWiseCard from '../component/reusable/DashBoards/BoardWiseCard';
import GradWiseCard from '../component/reusable/DashBoards/gradWiseCard';
import ReusableTable from '../component/reusable/table';

// ─── Table columns for the breakdown data ───────────────────────────────────
const TABLE_COLUMNS = [
    {
        key: 'name',
        header: 'Name',
        sortable: true,
    },
    {
        key: 'code',
        header: 'Code',
        sortable: true,
        render: (val) => (
            <span className="inline-block bg-gray-100 text-gray-700 text-xs font-mono px-2 py-0.5 rounded">
                {val || '-'}
            </span>
        ),
    },
    {
        key: 'count',
        header: 'Count',
        sortable: true,
        render: (val) => (
            <span className="font-semibold text-gray-900">
                {val !== undefined && val !== null ? val.toLocaleString() : '0'}
            </span>
        ),
    },
    {
        key: 'percentage',
        header: 'Percentage',
        sortable: true,
        render: (val) => {
            const pct = val !== undefined && val !== null ? Number(val) : 0;
            return (
                <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-[60px]">
                        <div
                            className="h-1.5 rounded-full bg-indigo-500"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                    </div>
                    <span className="text-xs font-medium text-gray-600 w-12 text-right">
                        {pct.toFixed(1)}%
                    </span>
                </div>
            );
        },
    },
];

// ─── Helper: fetch table data based on selected card ────────────────────────
const fetchTableData = async (selectedCard, leadSourceId) => {
    const baseParams = { leadSourceId };

    if (!selectedCard) return [];

    try {
        let res;
        switch (selectedCard.type) {
            case 'leadStatus':
                res = await getLeadStatusBreakdown({ ...baseParams, status: selectedCard.value });
                break;
            case 'leadSource':
                res = await getLeadSourceBreakdown({ ...baseParams, sourceKey: selectedCard.value });
                break;
            case 'courseType':
                res = await getCourseTypesBreakdown({ ...baseParams, courseTypeKey: selectedCard.value });
                break;
            case 'board':
                res = await getBoardBreakdown({ ...baseParams, boardKey: selectedCard.value });
                break;
            case 'grade':
                res = await getGradeBreakdown({ ...baseParams, gradeKey: selectedCard.value });
                break;
            default:
                return [];
        }
        return res?.data?.data || res?.data || [];
    } catch (err) {
        console.error('Failed to fetch table data', err);
        return [];
    }
};

const DataSourceDetails = () => {
    const { navTo } = useAppContext();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { id } = useParams();

    // Dashboard card data
    const [dashData, setDashData] = useState({ courseType: [], board: [], grade: [] });

    // Filter / table state
    const [selectedCard, setSelectedCard] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);

    useEffect(() => {
        if (id) {
            const fetchDetails = async () => {
                setLoading(true);
                try {
                    const res = await getLeadSourceById(id);
                    if (res?.data?.success) {
                        setDetails(res.data.data);
                    } else {
                        setError(res?.data?.message || "Failed to load data source details");
                    }
                } catch (err) {
                    console.error("Failed to fetch data source details", err);
                    setError(err.message || "An error occurred");
                } finally {
                    setLoading(false);
                }
            };

            fetchDetails();
        }
    }, [id]);

    // Fetch dashboard breakdown data (course types, board & grade) for this lead source
    useEffect(() => {
        if (!id) return;
        const fetchDashboardData = async () => {
            const params = { leadSourceId: id };
            try {
                const [courseTypeRes, boardRes, gradeRes] = await Promise.all([
                    getCourseTypesBreakdown(params).catch(() => null),
                    getBoardBreakdown(params).catch(() => null),
                    getGradeBreakdown(params).catch(() => null),
                ]);
                const toArr = (res) => res?.data?.data || res?.data || [];
                setDashData({
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

    // Fetch table data when a card is selected
    useEffect(() => {
        if (!selectedCard) { setTableData([]); return; }
        setTableLoading(true);
        fetchTableData(selectedCard, id).then((data) => {
            setTableData(data);
            setTableLoading(false);
        });
    }, [selectedCard, id]);

    // Card click handler
    const handleCardClick = (card) => {
        setSelectedCard((prev) =>
            prev?.type === card.type && prev?.value === card.value ? null : card
        );
    };

    const goBack = () => {
        navTo('lead-source');
    };

    if (loading) {
        return (
            <div className="block p-4 sm:p-6" id="page-data-source-detail">
                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--gray-400)' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        style={{ animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 12px' }}>
                        <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                    Loading data source details…
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="block p-4 sm:p-6" id="page-data-source-detail">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                        onClick={goBack}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Data Source Details</h1>
                </div>
                <div className="bg-white border border-red-200 rounded-xl p-6 text-center text-red-600">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="block p-4 sm:p-6" id="page-data-source-detail">
            {/* Page Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                        onClick={goBack}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        >
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>

                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">
                            Data Source Details
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            View comprehensive details for this data source
                        </p>
                    </div>
                </div>
            </div>

            {/* Dashboard Cards */}
            <div className="mb-8">
                <LeadCards
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

            {/* Main Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-5xl">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-start gap-5 mb-8 pb-6 border-b border-gray-100">
                    <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    >
                        {details?.name
                            ? details.name.substring(0, 2).toUpperCase()
                            : "DS"}
                    </div>

                    <div className="flex-1">
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                            {details?.name || "N/A"}
                        </h2>

                        <div className="flex flex-wrap gap-2 items-center">
                            <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${details?.active
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                                    }`}
                            >
                                {details?.active ? "Active" : "Inactive"}
                            </span>

                            <span className="bg-gray-50 text-gray-500 text-[10px] font-medium px-2.5 py-1 rounded-full border border-gray-200">
                                ID: {details?.id || "N/A"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Name */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Name
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                            {details?.name || "N/A"}
                        </div>
                    </div>

                    {/* Status */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Status
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                            {details?.active ? "Active" : "Inactive"}
                        </div>
                    </div>

                    {/* Created Date */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Creation Date
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                            {details?.createdAt
                                ? new Date(details.createdAt).toLocaleString()
                                : "N/A"}
                        </div>
                    </div>

                    {/* Updated Date */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Last Updated
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                            {details?.updatedAt
                                ? new Date(details.updatedAt).toLocaleString()
                                : "N/A"}
                        </div>
                    </div>

                    {/* Description — Full width */}
                    <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Description
                        </div>
                        <div className="text-sm font-semibold text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {details?.description || "No description available."}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Filtered Table ── */}
            {selectedCard && (
                <div className="mt-6">
                    {/* Table Header */}
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-5 bg-indigo-500 rounded-full" />
                            <h3 className="text-base font-bold text-gray-900">
                                {selectedCard.label}
                            </h3>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {tableData.length} records
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

                    {/* Loading spinner */}
                    {tableLoading ? (
                        <div className="flex justify-center items-center h-40 bg-white rounded-xl border border-gray-200">
                            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-500" />
                            <span className="ml-2 text-sm text-gray-500">Loading data...</span>
                        </div>
                    ) : (
                        <ReusableTable
                            columns={TABLE_COLUMNS}
                            data={tableData}
                            emptyMessage={`No data found for "${selectedCard.label}"`}
                        />
                    )}
                </div>
            )}

            {/* ── Hint when no card selected ── */}
            {!selectedCard && (
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
    );
};

export default DataSourceDetails;

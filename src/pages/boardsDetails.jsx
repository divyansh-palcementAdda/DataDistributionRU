import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { getBoardById } from '../Services/Boards/boardsService';
import {
    getLeadStatusBreakdown,
    getLeadSourceBreakdown,
    getGradeBreakdown,
    getCourseTypesBreakdown,
} from '../Services/cards/cardService';
import LeadCards from '../component/reusable/DashBoards/leadCards';
import LeadSource from '../component/reusable/DashBoards/leadSource';
import CategorywiseCard from '../component/reusable/DashBoards/categorywiseCard';
import GradWiseCard from '../component/reusable/DashBoards/gradWiseCard';
import ReusableTable from '../component/reusable/table';
import { toast } from 'react-toastify';

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
const fetchTableData = async (selectedCard, boardId) => {
    const baseParams = { boardId };

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

const BoardDetails = () => {
    const { navTo } = useAppContext();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { id } = useParams();

    // Dashboard card data
    const [dashData, setDashData] = useState({ leadSource: [], courseType: [], grade: [] });

    // Filter / table state
    const [selectedCard, setSelectedCard] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);

    useEffect(() => {
        if (id) {
            const fetchBoardDetails = async () => {
                setLoading(true);

                try {
                    const res = await getBoardById(id);

                    if (res?.success) {
                        setDetails(res.data);
                    } else {
                        setError(res?.message || "Failed to load board details");
                        toast.error(res?.message || "Failed to load board details");
                    }
                } catch (err) {
                    console.error("Failed to fetch board details", err);
                    setError(err.message || "An error occurred");
                    toast.error(err.message || "Failed to fetch board details");
                } finally {
                    setLoading(false);
                }
            };

            fetchBoardDetails();
        }
    }, [id]);

    // Fetch dashboard breakdown data (lead source, course types, & grade) for this board
    useEffect(() => {
        if (!id) return;
        const fetchDashboardData = async () => {
            const params = { boardId: id };
            try {
                const [sourceRes, courseTypeRes, gradeRes] = await Promise.all([
                    getLeadSourceBreakdown(params).catch(() => null),
                    getCourseTypesBreakdown(params).catch(() => null),
                    getGradeBreakdown(params).catch(() => null),
                ]);
                const toArr = (res) => res?.data?.data || res?.data || [];
                setDashData({
                    leadSource: toArr(sourceRes),
                    courseType: toArr(courseTypeRes),
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
        navTo('boards');
    };

    return (
        <div className="block p-4 sm:p-6" id="page-board-detail">
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
                            Specialization
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            View comprehensive details for this board
                        </p>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="bg-white border border-gray-200 rounded-xl p-12 shadow-sm max-w-5xl flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                        <p className="mt-4 text-gray-500">Loading board details...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="bg-white border border-red-200 rounded-xl p-12 shadow-sm max-w-5xl">
                    <div className="text-center">
                        <div className="inline-block text-red-500 mb-4">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Details</h3>
                        <p className="text-gray-500 mb-4">{error}</p>
                        <button
                            onClick={goBack}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            )}

            {/* Dashboard Cards */}
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
                    <GradWiseCard
                        data={dashData.grade}
                        onCardClick={handleCardClick}
                        selectedCard={selectedCard}
                    />
                </div>
            )}

            {/* Main Card */}
            {!loading && !error && details && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-5xl">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row items-start gap-5 mb-8 pb-6 border-b border-gray-100">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0">
                            {details?.name
                                ? details.name.substring(0, 2).toUpperCase()
                                : "BD"}
                        </div>

                        <div className="flex-1">
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                                {details?.name || "N/A"}
                            </h2>

                            <div className="flex flex-wrap gap-2 items-center">
                                <span
                                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${details?.active === true || details?.status === "ACTIVE"
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : "bg-red-50 text-red-700 border-red-200"
                                        }`}
                                >
                                    {details?.active === true || details?.status === "ACTIVE" ? "ACTIVE" : "INACTIVE"}
                                </span>

                                <span className="bg-gray-50 text-gray-500 text-[10px] font-medium px-2.5 py-1 rounded-full border border-gray-200">
                                    ID: {details?.id || "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Board Code */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Board Code
                            </div>
                            <div className="text-sm font-semibold text-gray-800">
                                {details?.code || "N/A"}
                            </div>
                        </div>

                        {/* Display Order */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Display Order
                            </div>
                            <div className="text-sm font-semibold text-gray-800">
                                {details?.displayOrder || "N/A"}
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

                        {/* Description */}
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
            )}

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
            {!selectedCard && !loading && !error && (
                <div className="mt-6 flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-50">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                    <p className="text-sm font-medium">Upar kisi card par click karein</p>
                    <p className="text-xs mt-1">Selected filter ka data yahan table mein dikhega</p>
                </div>
            )}
        </div>
    );
};

export default BoardDetails;

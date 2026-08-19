import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { getCounselorById } from '../Services/Counselors/counselors';
import {
    getLeadStatusBreakdown,
    getLeadSourceBreakdown,
    getGradeBreakdown,
    getBoardBreakdown,
    getCourseTypesBreakdown,
} from '../Services/cards/cardService';
import LeadCards from '../component/reusable/DashBoards/leadCards';
import LeadSource from '../component/reusable/DashBoards/leadSource';
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
const fetchTableData = async (selectedCard, counselorId) => {
    const baseParams = { counselorId };

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

const CounselorDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useAppContext();

    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Dashboard card data
    const [dashData, setDashData] = useState({ leadSource: [], courseType: [], board: [], grade: [] });

    // Filter / table state
    const [selectedCard, setSelectedCard] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);

    useEffect(() => {
        if (id) {
            const fetchDetails = async () => {
                setLoading(true);
                setError(null);
                try {
                    const res = await getCounselorById(id);
                    const data = res?.data?.data || res?.data || {};
                    setDetails(data);
                } catch (err) {
                    const msg = err?.message || 'Failed to fetch counselor details';
                    setError(msg);
                    showToast(msg, 'error');
                } finally {
                    setLoading(false);
                }
            };
            fetchDetails();
        }
    }, [id]);

    // Fetch dashboard breakdown data (lead source, course types, board & grade)
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
                    {/* ── Dashboard Cards ── */}
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
                        <GradWiseCard
                            data={dashData.grade}
                            onCardClick={handleCardClick}
                            selectedCard={selectedCard}
                        />
                    </div>

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
                            <p className="text-sm font-medium">No Data</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CounselorDetails;

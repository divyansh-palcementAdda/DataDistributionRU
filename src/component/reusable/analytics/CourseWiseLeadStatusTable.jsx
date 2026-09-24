import React, { useState, useEffect } from 'react';
import { FiSearch, FiChevronLeft, FiChevronRight, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { getCourseWiseLeadStatus } from '../../../Services/analytics/leadStatusAnalyticsService';

const CourseWiseLeadStatusTable = ({ contextParams = {}, activeStatusFilter = null }) => {
    const [loading, setLoading] = useState(false);
    const [statuses, setStatuses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [grandTotals, setGrandTotals] = useState({});
    const [totalLeads, setTotalLeads] = useState(0);

    // Pagination & Search & Sort
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('total');
    const [sortDirection, setSortDirection] = useState('DESC');

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(0);
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    // Fetch data whenever context, filters, page, size, search, sort changes
    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = {
                    ...contextParams,
                    page,
                    size,
                    search: debouncedSearch || undefined,
                    sortBy,
                    sortDirection,
                };
                const res = await getCourseWiseLeadStatus(params);
                if (isMounted && res) {
                    setStatuses(res.statuses || []);
                    setCourses(res.courses?.content || []);
                    setTotalElements(res.courses?.totalElements || 0);
                    setTotalPages(res.courses?.totalPages || 0);
                    setGrandTotals(res.grandTotalStatusCounts || {});
                    setTotalLeads(res.grandTotal || 0);
                }
            } catch (err) {
                console.error('Failed to load course-wise lead status data', err);
                if (isMounted) {
                    setCourses([]);
                    setTotalElements(0);
                    setTotalPages(0);
                    setGrandTotals({});
                    setTotalLeads(0);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        return () => {
            isMounted = false;
        };
    }, [contextParams, debouncedSearch, page, size, sortBy, sortDirection]);

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
        } else {
            setSortBy(field);
            setSortDirection(field === 'courseName' ? 'ASC' : 'DESC');
        }
        setPage(0);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-6">
            {/* Header with Title and Search/Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-indigo-600 rounded-full" />
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">
                            Course-wise Lead Status
                        </h3>
                        <p className="text-[11px] text-gray-500">
                            Distribution of leads across courses and lead statuses
                        </p>
                    </div>
                    <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100 ml-2">
                        {totalElements} Courses
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Search box */}
                    <div className="relative">
                        <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                        <input
                            type="text"
                            placeholder="Search course..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44 sm:w-56"
                        />
                    </div>
                </div>
            </div>

            {/* Table Container with Horizontal Scroll */}
            <div className="relative overflow-x-auto border border-gray-100 rounded-lg max-h-[500px]">
                <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-semibold sticky top-0 z-10 shadow-sm border-b border-gray-200">
                        <tr>
                            {/* Course Name Header */}
                            <th
                                onClick={() => handleSort('courseName')}
                                className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap min-w-[180px] bg-gray-50 sticky left-0 z-20 border-r border-gray-200"
                            >
                                <div className="flex items-center gap-1.5">
                                    <span>Course</span>
                                    {sortBy === 'courseName' && (
                                        sortDirection === 'ASC' ? <FiArrowUp size={11} className="text-indigo-600" /> : <FiArrowDown size={11} className="text-indigo-600" />
                                    )}
                                </div>
                            </th>

                            {/* Dynamic Status Headers */}
                            {statuses.map((st) => {
                                const isHighlighted = activeStatusFilter && (
                                    activeStatusFilter === st.code ||
                                    activeStatusFilter === st.statusId ||
                                    activeStatusFilter === st.name
                                );
                                return (
                                    <th
                                        key={st.code || st.statusId}
                                        onClick={() => handleSort(st.code)}
                                        className={`px-3 py-3 text-center cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap min-w-[110px] ${
                                            isHighlighted ? 'bg-indigo-50/80 text-indigo-700' : ''
                                        }`}
                                        title={`Sort by ${st.name}`}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            <span>{st.name || st.code}</span>
                                            {sortBy.toUpperCase() === st.code.toUpperCase() && (
                                                sortDirection === 'ASC' ? <FiArrowUp size={11} className="text-indigo-600" /> : <FiArrowDown size={11} className="text-indigo-600" />
                                            )}
                                        </div>
                                    </th>
                                );
                            })}

                            {/* Total Column Header */}
                            <th
                                onClick={() => handleSort('total')}
                                className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap min-w-[90px] font-bold text-gray-900 border-l border-gray-200"
                            >
                                <div className="flex items-center justify-end gap-1">
                                    <span>Total</span>
                                    {sortBy === 'total' && (
                                        sortDirection === 'ASC' ? <FiArrowUp size={11} className="text-indigo-600" /> : <FiArrowDown size={11} className="text-indigo-600" />
                                    )}
                                </div>
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 bg-white">
                        {loading ? (
                            <tr>
                                <td colSpan={statuses.length + 2} className="py-12 text-center text-gray-400">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent" />
                                        <span>Loading analytics data...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : courses.length === 0 ? (
                            <tr>
                                <td colSpan={statuses.length + 2} className="py-10 text-center text-gray-400">
                                    No courses found matching the selected criteria.
                                </td>
                            </tr>
                        ) : (
                            courses.map((c, idx) => (
                                <tr key={c.courseId || idx} className="hover:bg-indigo-50/20 transition-colors">
                                    <td className="px-4 py-2.5 font-medium text-gray-800 whitespace-nowrap bg-white sticky left-0 z-10 border-r border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900">{c.courseName}</span>
                                            {c.courseCode && (
                                                <span className="text-[10px] text-gray-400 font-mono">{c.courseCode}</span>
                                            )}
                                        </div>
                                    </td>
                                    {statuses.map((st) => {
                                        const count = c.statusCounts?.[st.code] ?? 0;
                                        const isHighlighted = activeStatusFilter && (
                                            activeStatusFilter === st.code ||
                                            activeStatusFilter === st.statusId ||
                                            activeStatusFilter === st.name
                                        );
                                        return (
                                            <td
                                                key={st.code}
                                                className={`px-3 py-2.5 text-center font-mono ${
                                                    count > 0 ? 'text-gray-700 font-medium' : 'text-gray-300'
                                                } ${isHighlighted ? 'bg-indigo-50/40 font-bold text-indigo-700' : ''}`}
                                            >
                                                {count}
                                            </td>
                                        );
                                    })}
                                    <td className="px-4 py-2.5 text-right font-mono font-bold text-indigo-700 bg-gray-50/50 border-l border-gray-100">
                                        {c.total ?? 0}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>

                    {/* Grand Total Footer */}
                    {!loading && courses.length > 0 && (
                        <tfoot className="bg-gray-100/90 text-gray-900 font-bold uppercase text-[11px] sticky bottom-0 z-10 border-t-2 border-gray-300 shadow-inner">
                            <tr>
                                <td className="px-4 py-3 bg-gray-100 sticky left-0 z-20 border-r border-gray-200">
                                    Grand Total
                                </td>
                                {statuses.map((st) => {
                                    const total = grandTotals?.[st.code] ?? 0;
                                    const isHighlighted = activeStatusFilter && (
                                        activeStatusFilter === st.code ||
                                        activeStatusFilter === st.statusId ||
                                        activeStatusFilter === st.name
                                    );
                                    return (
                                        <td
                                            key={st.code}
                                            className={`px-3 py-3 text-center font-mono ${
                                                isHighlighted ? 'bg-indigo-100 text-indigo-800' : ''
                                            }`}
                                        >
                                            {total}
                                        </td>
                                    );
                                })}
                                <td className="px-4 py-3 text-right font-mono text-indigo-700 font-extrabold border-l border-gray-200 text-sm">
                                    {totalLeads}
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                    <span>Rows per page:</span>
                    <select
                        value={size}
                        onChange={(e) => {
                            setSize(Number(e.target.value));
                            setPage(0);
                        }}
                        className="px-2 py-1 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                    <span className="text-gray-400">
                        Showing {courses.length > 0 ? page * size + 1 : 0} - {Math.min((page + 1) * size, totalElements)} of {totalElements}
                    </span>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0 || loading}
                        className={`p-1.5 rounded-md border border-gray-200 ${
                            page === 0 || loading
                                ? 'opacity-40 cursor-not-allowed text-gray-400'
                                : 'hover:bg-gray-100 text-gray-700 cursor-pointer'
                        }`}
                        title="Previous page"
                    >
                        <FiChevronLeft size={14} />
                    </button>
                    <span className="px-2 font-medium text-gray-700">
                        Page {totalPages > 0 ? page + 1 : 0} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1 || loading}
                        className={`p-1.5 rounded-md border border-gray-200 ${
                            page >= totalPages - 1 || loading
                                ? 'opacity-40 cursor-not-allowed text-gray-400'
                                : 'hover:bg-gray-100 text-gray-700 cursor-pointer'
                        }`}
                        title="Next page"
                    >
                        <FiChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseWiseLeadStatusTable;

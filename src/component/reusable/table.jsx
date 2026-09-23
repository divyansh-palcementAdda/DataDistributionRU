import React, { useState, useRef } from "react";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";

const ReusableTable = ({
    columns = [],
    data = [],
    actions,
    onView,
    onEdit,
    onDelete,
    onViewDisabled = false,
    onEditDisabled = false,
    onDeleteDisabled = false,
    emptyMessage = "No data found",
    isServerSide = false,
    totalElements = 0,
    totalPages: serverTotalPages = 0,
    currentPage: serverCurrentPage = 1,
    rowsPerPage: serverRowsPerPage = 10,
    onPageChange,
    onRowsPerPageChange,
    sortBy,
    sortDirection,
    onSort,
    headerClassName = "bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-xs border-b border-indigo-800",
}) => {
    const [clientPage, setClientPage] = useState(1);
    const [clientRows, setClientRows] = useState(10);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const tableContainerRef = useRef(null);

    const currentPage = isServerSide ? serverCurrentPage : clientPage;
    const rowsPerPage = isServerSide ? serverRowsPerPage : clientRows;
    const totalPages = isServerSide ? serverTotalPages : Math.max(1, Math.ceil(data.length / rowsPerPage));

    const startIndex = isServerSide ? ((currentPage - 1) * rowsPerPage) : ((clientPage - 1) * clientRows);
    const currentData = isServerSide ? data : data.slice(startIndex, startIndex + clientRows);
    
    const totalItems = isServerSide ? totalElements : data.length;

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            if (isServerSide && onPageChange) {
                onPageChange(newPage);
            } else {
                setClientPage(newPage);
            }
        }
    };

    const handleRowsPerPageChange = (e) => {
        const newRows = Number(e.target.value);
        if (isServerSide && onRowsPerPageChange) {
            onRowsPerPageChange(newRows);
        } else {
            setClientRows(newRows);
            setClientPage(1);
        }
    };

    const handleSort = (columnKey) => {
        if (!onSort) return;
        
        let newDirection = 'asc';
        if (sortBy === columnKey) {
            newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        }
        
        onSort(columnKey, newDirection);
    };

    const getSortIcon = (columnKey) => {
        if (sortBy !== columnKey) {
            return (
                <svg className="w-3.5 h-3.5 text-white/50 hover:text-white/90 opacity-70 ml-1 inline-block shrink-0 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            );
        }
        
        return (
            <svg className="w-3.5 h-3.5 text-amber-300 font-bold ml-1 inline-block shrink-0 drop-shadow-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sortDirection === 'asc' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                )}
            </svg>
        );
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - tableContainerRef.current.offsetLeft);
        setScrollLeft(tableContainerRef.current.scrollLeft);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - tableContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        tableContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    return (
        <div className="w-full overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs">
            {/* Desktop Table */}
            <div 
                ref={tableContainerRef}
                style={{ overflowX: 'auto', cursor: isDragging ? 'grabbing' : 'grab' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                <table className="w-full min-w-max border-collapse">
                    <thead>
                        <tr className={headerClassName}>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-4 py-3.5 text-left text-[11.5px] font-bold uppercase tracking-wider text-white select-none ${column.sortable !== false ? 'cursor-pointer hover:bg-white/10 transition-colors' : ''}`}
                                    style={{ color: '#ffffff' }}
                                    onClick={() => column.sortable !== false && handleSort(column.key)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffffff' }}>
                                        <span style={{ color: '#ffffff' }}>{column.header}</span>
                                        {column.sortable !== false && getSortIcon(column.key)}
                                    </div>
                                </th>
                            ))}

                            {(actions || onView || onEdit || onDelete) && (
                                <th 
                                    className="px-4 py-3.5 text-center text-[11.5px] font-bold uppercase tracking-wider text-white select-none"
                                    style={{ color: '#ffffff' }}
                                >
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {currentData.length > 0 ? (
                            currentData.map((row, index) => (
                                <tr
                                    key={index}
                                    className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors duration-150 group"
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className="px-4 py-3.5 text-[13px] text-slate-700 align-middle"
                                        >
                                            {column.render
                                                ? column.render(row[column.key], row, index)
                                                : (typeof row[column.key] === 'object' && row[column.key] !== null)
                                                    ? JSON.stringify(row[column.key])
                                                    : row[column.key] ?? '-'}
                                        </td>
                                    ))}

                                    {(actions || onView || onEdit || onDelete) && (
                                        <td className="px-4 py-3.5 text-center align-middle">
                                            {actions ? actions(row) : (
                                                <div className="flex justify-center items-center gap-2">
                                                    {onView && (
                                                        <button
                                                            onClick={() => onView(row)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors bg-transparent border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                                            title="View"
                                                            disabled={onViewDisabled}
                                                        >
                                                            <FiEye size={17} />
                                                        </button>
                                                    )}
                                                    {onEdit && (
                                                        <button
                                                            onClick={() => onEdit(row)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors bg-transparent border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                                            title="Edit"
                                                            disabled={onEditDisabled}
                                                        >
                                                            <FiEdit size={17} />
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button
                                                            onClick={() => onDelete(row)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors bg-transparent border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                                            title="Delete"
                                                            disabled={onDeleteDisabled}
                                                        >
                                                            <FiTrash2 size={17} />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length + ((actions || onView || onEdit || onDelete) ? 1 : 0)}
                                    className="py-10 text-center text-slate-400 text-sm"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div style={{ display: 'none' }}>
                {currentData.length > 0 ? (
                    currentData.map((row, index) => (
                        <div
                            key={index}
                            className="border-b border-gray-200 p-4 space-y-3"
                        >
                            {columns.map((column) => (
                                <div
                                    key={column.key}
                                    className="flex justify-between gap-4"
                                >
                                    <span className="text-xs font-semibold text-gray-500">
                                        {column.header}
                                    </span>

                                    <span className="text-sm text-gray-800 text-right">
                                        {column.render
                                            ? column.render(row[column.key], row, index)
                                            : (typeof row[column.key] === 'object' && row[column.key] !== null)
                                                ? JSON.stringify(row[column.key])
                                                : row[column.key] ?? '-'}
                                    </span>
                                </div>
                            ))}

                            {(actions || onView || onEdit || onDelete) && (
                                <div className="pt-2 border-t border-gray-100 flex justify-center gap-4">
                                    {actions ? actions(row) : (
                                        <>
                                            {onView && (
                                                <button
                                                    onClick={() => onView(row)}
                                                    className="text-gray-500 hover:text-gray-700 transition bg-transparent border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="View"
                                                    disabled={onViewDisabled}
                                                    style={{ cursor: onViewDisabled ? 'not-allowed' : 'pointer' }}
                                                >
                                                    <FiEye size={20} />
                                                </button>
                                            )}
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(row)}
                                                    className="text-gray-500 hover:text-gray-700 transition bg-transparent border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Edit"
                                                    disabled={onEditDisabled}
                                                    style={{ cursor: onEditDisabled ? 'not-allowed' : 'pointer' }}
                                                >
                                                    <FiEdit size={20} />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(row)}
                                                    className="text-red-500 hover:text-red-700 transition bg-transparent border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Delete"
                                                    disabled={onDeleteDisabled}
                                                    style={{ cursor: onDeleteDisabled ? 'not-allowed' : 'pointer' }}
                                                >
                                                    <FiTrash2 size={20} />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="p-6 text-center text-gray-500">
                        {emptyMessage}
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalItems > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center px-5 py-3.5 border-t border-slate-200/90 bg-slate-50/70 gap-4">
                    <div className="flex items-center text-xs font-medium text-slate-600">
                        <span>Show</span>
                        <select
                            value={rowsPerPage}
                            onChange={handleRowsPerPageChange}
                            className="mx-2 border border-slate-300 rounded-md px-2 py-1 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs cursor-pointer"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <span>entries</span>
                    </div>

                    <div className="text-xs font-medium text-slate-500">
                        Showing <span className="font-semibold text-slate-700">{totalItems === 0 ? 0 : startIndex + 1}</span> to <span className="font-semibold text-slate-700">{Math.min(startIndex + currentData.length, totalItems)}</span> of <span className="font-semibold text-slate-700">{totalItems}</span> entries
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                currentPage === 1
                                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-2xs cursor-pointer"
                            }`}
                        >
                            Previous
                        </button>
                        
                        <div className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 rounded-md">
                            Page {currentPage} of {totalPages}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                currentPage === totalPages || totalPages === 0
                                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-2xs cursor-pointer"
                            }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReusableTable;
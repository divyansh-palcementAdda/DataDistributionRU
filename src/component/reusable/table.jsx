import React, { useState } from "react";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";

const ReusableTable = ({
    columns = [],
    data = [],
    actions,
    onView,
    onEdit,
    onDelete,
    emptyMessage = "No data found",
    isServerSide = false,
    totalElements = 0,
    totalPages: serverTotalPages = 0,
    currentPage: serverCurrentPage = 1,
    rowsPerPage: serverRowsPerPage = 10,
    onPageChange,
    onRowsPerPageChange,
}) => {
    const [clientPage, setClientPage] = useState(1);
    const [clientRows, setClientRows] = useState(10);

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

    return (
        <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-max">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                                >
                                    {column.header}
                                </th>
                            ))}

                            {(actions || onView || onEdit || onDelete) && (
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {currentData.length > 0 ? (
                            currentData.map((row, index) => (
                                <tr
                                    key={index}
                                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className="px-4 py-3 text-sm text-gray-700"
                                        >
                                            {column.render
                                                ? column.render(row[column.key], row)
                                                : row[column.key]}
                                        </td>
                                    ))}

                                    {(actions || onView || onEdit || onDelete) && (
                                        <td className="px-4 py-3 text-center">
                                            {actions ? actions(row) : (
                                                <div className="flex justify-center items-center gap-3">
                                                    {onView && (
                                                        <button onClick={() => onView(row)} className="text-gray-500 hover:text-gray-700 transition" title="View">
                                                            <FiEye size={18} />
                                                        </button>
                                                    )}
                                                    {onEdit && (
                                                        <button onClick={() => onEdit(row)} className="text-gray-500 hover:text-gray-700 transition" title="Edit">
                                                            <FiEdit size={18} />
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button onClick={() => onDelete(row)} className="text-red-500 hover:text-red-700 transition" title="Delete">
                                                            <FiTrash2 size={18} />
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
                                    className="py-6 text-center text-gray-500"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
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
                                            ? column.render(row[column.key], row)
                                            : row[column.key]}
                                    </span>
                                </div>
                            ))}

                            {(actions || onView || onEdit || onDelete) && (
                                <div className="pt-2 border-t border-gray-100 flex justify-center gap-4">
                                    {actions ? actions(row) : (
                                        <>
                                            {onView && (
                                                <button onClick={() => onView(row)} className="text-gray-500 hover:text-gray-700 transition" title="View">
                                                    <FiEye size={20} />
                                                </button>
                                            )}
                                            {onEdit && (
                                                <button onClick={() => onEdit(row)} className="text-gray-500 hover:text-gray-700 transition" title="Edit">
                                                    <FiEdit size={20} />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button onClick={() => onDelete(row)} className="text-red-500 hover:text-red-700 transition" title="Delete">
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
                <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 border-t border-gray-200 bg-gray-50 gap-4">
                    <div className="flex items-center text-sm text-gray-600">
                        <span>Show</span>
                        <select
                            value={rowsPerPage}
                            onChange={handleRowsPerPageChange}
                            className="mx-2 border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <span>entries</span>
                    </div>

                    <div className="text-sm text-gray-600">
                        Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + currentData.length, totalItems)} of {totalItems} entries
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded border text-sm ${
                                currentPage === 1
                                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer"
                            }`}
                        >
                            Previous
                        </button>
                        
                        <div className="px-2 text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`px-3 py-1 rounded border text-sm ${
                                currentPage === totalPages || totalPages === 0
                                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer"
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
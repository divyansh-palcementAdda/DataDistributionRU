import React, { useState } from "react";

const ReusableTable = ({
    columns = [],
    data = [],
    actions,
    emptyMessage = "No data found",
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Calculate pagination data
    const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentData = data.slice(startIndex, startIndex + rowsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page
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

                            {actions && (
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

                                    {actions && (
                                        <td className="px-4 py-3 text-center">
                                            {actions(row)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length + (actions ? 1 : 0)}
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

                            {actions && (
                                <div className="pt-2 border-t border-gray-100">
                                    {actions(row)}
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
            {data.length > 0 && (
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
                        </select>
                        <span>entries</span>
                    </div>

                    <div className="text-sm text-gray-600">
                        Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, data.length)} of {data.length} entries
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
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded border text-sm ${
                                currentPage === totalPages
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
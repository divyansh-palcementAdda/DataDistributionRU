import React from "react";

const ReusableTable = ({
    columns = [],
    data = [],
    actions,
    emptyMessage = "No data found",
}) => {
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
                        {data.length > 0 ? (
                            data.map((row, index) => (
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
                {data.length > 0 ? (
                    data.map((row, index) => (
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
        </div>
    );
};

export default ReusableTable;
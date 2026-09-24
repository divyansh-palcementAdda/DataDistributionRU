import React from 'react';
import { FiCalendar, FiRotateCcw } from 'react-icons/fi';

const PRESETS = [
    { id: 'ALL_TIME', label: 'All Time' },
    { id: 'TODAY', label: 'Today' },
    { id: 'YESTERDAY', label: 'Yesterday' },
    { id: 'THIS_WEEK', label: 'This Week' },
    { id: 'THIS_MONTH', label: 'This Month' },
    { id: 'CUSTOM', label: 'Custom Range' },
];

const DatePresetFilter = ({
    datePreset,
    onPresetChange,
    startDate,
    endDate,
    onDateChange,
    onReset,
}) => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <FiCalendar size={16} />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                            Date Filter
                        </h4>
                        <p className="text-[11px] text-gray-500">
                            Filter course & user status counts by lead creation date
                        </p>
                    </div>
                </div>

                {/* Reset button */}
                <button
                    onClick={onReset}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-200 rounded-lg transition-colors cursor-pointer"
                    title="Reset to default scope"
                >
                    <FiRotateCcw size={12} />
                    Reset Date
                </button>
            </div>

            {/* Presets Button Row */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
                {PRESETS.map((p) => {
                    const isActive = datePreset === p.id;
                    return (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => onPresetChange(p.id)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                                isActive
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {p.label}
                        </button>
                    );
                })}
            </div>

            {/* Custom Date Inputs if CUSTOM selected */}
            {datePreset === 'CUSTOM' && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-gray-600">From:</label>
                        <input
                            type="date"
                            value={startDate || ''}
                            onChange={(e) => onDateChange('startDate', e.target.value)}
                            className="px-2.5 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-gray-600">To:</label>
                        <input
                            type="date"
                            value={endDate || ''}
                            onChange={(e) => onDateChange('endDate', e.target.value)}
                            className="px-2.5 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    {(startDate || endDate) && (
                        <span className="text-[11px] text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                            {startDate || '...'} → {endDate || '...'}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default DatePresetFilter;

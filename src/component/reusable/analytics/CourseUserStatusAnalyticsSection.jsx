import React, { useState, useMemo } from 'react';
import DatePresetFilter from './DatePresetFilter';
import CourseWiseLeadStatusTable from './CourseWiseLeadStatusTable';
import UserWiseLeadStatusTable from './UserWiseLeadStatusTable';

/**
 * Reusable Course-wise & User-wise Lead Status Analytics Section
 *
 * @param {Object} props
 * @param {'category'|'source'|'specialization'|'grade'|'counselor'} props.contextType - The entity type of the current detail page
 * @param {string} props.contextId - The UUID of the entity for the current detail page
 * @param {Array} props.activeFilters - Active card / page filters: [{ type, value, label }]
 */
const CourseUserStatusAnalyticsSection = ({
    contextType,
    contextId,
    activeFilters = [],
}) => {
    // Date filter state
    const [datePreset, setDatePreset] = useState('ALL_TIME');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    const handlePresetChange = (preset) => {
        setDatePreset(preset);
        if (preset !== 'CUSTOM') {
            setCustomStartDate('');
            setCustomEndDate('');
        }
    };

    const handleDateChange = (type, val) => {
        if (type === 'startDate') setCustomStartDate(val);
        if (type === 'endDate') setCustomEndDate(val);
    };

    const handleResetDate = () => {
        setDatePreset('ALL_TIME');
        setCustomStartDate('');
        setCustomEndDate('');
    };

    // Active Lead Status if any from card clicks
    const activeStatusFilter = useMemo(() => {
        const sf = activeFilters.find((f) => f.type === 'leadStatus');
        return sf ? (sf.value || sf.label) : null;
    }, [activeFilters]);

    // Build context params sent to the analytics API
    const contextParams = useMemo(() => {
        const params = {};

        // 1. Current Detail Page Scope
        if (contextType === 'category') {
            params.courseTypeId = contextId;
        } else if (contextType === 'source') {
            params.leadSourceId = contextId;
        } else if (contextType === 'specialization') {
            params.boardId = contextId;
        } else if (contextType === 'grade') {
            params.gradeId = contextId;
        } else if (contextType === 'counselor') {
            params.assignedUserId = contextId;
        }

        // 2. Active Page Filters from Cards
        if (Array.isArray(activeFilters)) {
            const statusFilter = activeFilters.find((f) => f.type === 'leadStatus');
            if (statusFilter && statusFilter.value) {
                params.statusId = statusFilter.value;
            }

            const sourceFilter = activeFilters.find((f) => f.type === 'leadSource');
            if (sourceFilter && sourceFilter.value && contextType !== 'source') {
                params.leadSourceId = sourceFilter.value;
            }

            const boardFilter = activeFilters.find((f) => f.type === 'board');
            if (boardFilter && boardFilter.value && contextType !== 'specialization') {
                params.boardId = boardFilter.value;
            }

            const gradeFilter = activeFilters.find((f) => f.type === 'grade');
            if (gradeFilter && gradeFilter.value && contextType !== 'grade') {
                params.gradeId = gradeFilter.value;
            }

            if (activeFilters.some((f) => f.type === 'allotted')) {
                params.allotted = true;
            } else if (activeFilters.some((f) => f.type === 'unallotted')) {
                params.allotted = false;
            }
        }

        // 3. Date Filters
        if (datePreset && datePreset !== 'ALL_TIME') {
            params.datePreset = datePreset;
            if (datePreset === 'CUSTOM') {
                if (customStartDate) params.startDate = customStartDate;
                if (customEndDate) params.endDate = customEndDate;
            }
        }

        return params;
    }, [contextType, contextId, activeFilters, datePreset, customStartDate, customEndDate]);

    return (
        <div className="mt-8 pt-6 border-t border-gray-200">
            {/* Section Heading */}
            <div className="mb-4">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full" />
                    <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
                        Lead Status Analytics
                    </h2>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 ml-4">
                    Course-wise & User-wise performance matrix scoped to current details
                </p>
            </div>

            {/* Date Filter Bar */}
            <DatePresetFilter
                datePreset={datePreset}
                onPresetChange={handlePresetChange}
                startDate={customStartDate}
                endDate={customEndDate}
                onDateChange={handleDateChange}
                onReset={handleResetDate}
            />

            {/* Table 1: Course-wise Lead Status */}
            <CourseWiseLeadStatusTable
                contextParams={contextParams}
                activeStatusFilter={activeStatusFilter}
            />

            {/* Table 2: User-wise Lead Status */}
            <UserWiseLeadStatusTable
                contextParams={contextParams}
                activeStatusFilter={activeStatusFilter}
            />
        </div>
    );
};

export default CourseUserStatusAnalyticsSection;

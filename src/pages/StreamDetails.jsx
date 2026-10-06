import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEye, FiMessageSquare, FiUserPlus, FiFilter, FiCheckSquare } from 'react-icons/fi';
import { useAppContext } from '../AppContext';
import { usePermissions } from '../PermissionContext';
import { getStreamById } from '../Services/streams/streamService';
import {
    getLeadSourceBreakdown,
    getGradeBreakdown,
    getBoardBreakdown,
    getCourseTypesBreakdown,
} from '../Services/cards/cardService';
import {
    getBoardsDropdown,
    getCourseTypesDropdown,
    getCoursesDropdown,
    getDepartmentsDropdown,
    getGradesDropdown,
    getLeadSourcesDropdown,
    getLeadStatusesDropdown,
    getUsersDropdown,
    getStreamsDropdown,
} from '../Services/drop-down/dropDownService';
import { DEFAULT_LEAD_FILTERS } from '../Services/lead/leadFilterModel';
import axiosInstance from '../axiosInstance/axios';
import ApiRoutes from '../apiRoutes/allApiRoutes';
import LeadCards from '../component/reusable/DashBoards/leadCards';
import LeadSource from '../component/reusable/DashBoards/leadSource';
import BoardWiseCard from '../component/reusable/DashBoards/BoardWiseCard';
import GradWiseCard from '../component/reusable/DashBoards/gradWiseCard';
import CategorywiseCard from '../component/reusable/DashBoards/categorywiseCard';
import UnallottedCard from '../component/reusable/DashBoards/UnallottedCard';
import AvailedCard from '../component/reusable/DashBoards/availedCard';
import AllottedCard from '../component/reusable/DashBoards/allottedCard';
import UserAllocationSummaryCards from '../component/reusable/segregation/UserAllocationSummaryCards';
import UserAllocationTable from '../component/reusable/segregation/UserAllocationTable';
import UserAllocationListModal from '../component/reusable/segregation/UserAllocationListModal';
import ReusableTable from '../component/reusable/table';
import LeadRemarkModal from '../component/reusable/Leads/LeadRemarkModal';
import AssignLeadModal from '../component/reusable/Leads/AssignLeadModal';
import LeadFilterDrawer from '../component/reusable/Leads/LeadFilterDrawer';
import CourseUserStatusAnalyticsSection from '../component/reusable/analytics/CourseUserStatusAnalyticsSection';
import * as XLSX from 'xlsx';
import {
    renderLeadInfoCell,
    renderCourseCell,
    renderSourceCell,
    renderStatusCell,
    renderCounselorCell,
    renderFollowUpCell,
    renderLeadDateCell,
} from '../component/reusable/leadTableHelpers';

// ─── Lead table columns ───────────────────────────────────────────────────────
const buildLeadColumns = (page, size, onOpenRemark, navTo, selectedRows, onToggleRow, onToggleAll, currentData, hasPermission, showToast) => [
    {
        key: 'checkbox',
        header: hasPermission('LEAD_ASSIGN') ? (
            <input
                type="checkbox"
                checked={currentData.length > 0 && currentData.every(r => selectedRows.has(r.id ?? r.leadId))}
                onChange={(e) => onToggleAll(e.target.checked, currentData)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                title="Select All"
            />
        ) : null,
        sortable: false,
        render: (value, row) => {
            if (!hasPermission('LEAD_ASSIGN')) return null;
            const rowId = row.id ?? row.leadId;
            return (
                <input
                    type="checkbox"
                    checked={selectedRows.has(rowId)}
                    onChange={() => onToggleRow(rowId)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
            );
        },
    },
    {
        key: 'sno',
        header: 'S.No',
        sortable: false,
        render: (value, row, index) => (
            <span className="font-semibold text-slate-500 text-xs font-mono">{page * size + index + 1}</span>
        ),
    },
    {
        key: 'fullName',
        header: 'Lead Info',
        render: (value, row) => renderLeadInfoCell(row, (r) => navTo && navTo('/lead-detail/' + (r.id ?? r.leadId)), showToast),
    },
    {
        key: 'interestedCourses',
        header: 'Course',
        render: (value, row) => renderCourseCell(row),
    },
    {
        key: 'source',
        header: 'Source',
        render: (value, row) => renderSourceCell(row),
    },
    {
        key: 'currentStatus',
        header: 'Status',
        render: (value, row) => renderStatusCell(value, row),
    },
    {
        key: 'assignedTo',
        header: 'Counselor',
        render: (value, row) => renderCounselorCell(row),
    },
    {
        key: 'nextFollowUpDate',
        header: 'Follow-up',
        render: (value, row) => renderFollowUpCell(row),
    },
    {
        key: 'createdAt',
        header: 'Lead Date',
        render: (value, row) => renderLeadDateCell(row),
    },
];

// ─── Helper: fetch leads for the selected card (server-side) ─────────────────
const fetchLeadsForCard = async (activeFilters, streamId, page, size, sortBy, sortDirection, filterRequest) => {
    if (!streamId) return { content: [], totalElements: 0, totalPages: 0 };

    const params = {
        streamId,
        streamIds: [streamId],
        page,
        size,
        sortBy: sortBy || 'createdAt',
        sortDirection: sortDirection || 'desc',
    };

    const convertFilterRequest = (request) => {
        const converted = { ...request };
        if (converted.leadStatusIds && Array.isArray(converted.leadStatusIds)) {
            if (converted.leadStatusIds.length === 1) {
                converted.statusId = converted.leadStatusIds[0];
            } else if (converted.leadStatusIds.length > 1) {
                converted.statusIds = converted.leadStatusIds;
            }
            delete converted.leadStatusIds;
        }
        if (converted.leadSourceIds && Array.isArray(converted.leadSourceIds)) {
            if (converted.leadSourceIds.length === 1) {
                converted.leadSourceId = converted.leadSourceIds[0];
            } else if (converted.leadSourceIds.length > 1) {
                converted.leadSourceIds = converted.leadSourceIds;
            }
        }
        if (converted.courseTypeIds && Array.isArray(converted.courseTypeIds)) {
            if (converted.courseTypeIds.length === 1) {
                converted.courseTypeId = converted.courseTypeIds[0];
            }
        }
        if (converted.boardIds && Array.isArray(converted.boardIds)) {
            if (converted.boardIds.length === 1) {
                converted.boardId = converted.boardIds[0];
            }
        }
        if (converted.gradeIds && Array.isArray(converted.gradeIds)) {
            if (converted.gradeIds.length === 1) {
                converted.gradeId = converted.gradeIds[0];
            }
        }
        if (converted.assignedUserIds && Array.isArray(converted.assignedUserIds)) {
            if (converted.assignedUserIds.length === 1) {
                converted.assignedUserId = converted.assignedUserIds[0];
            }
        }
        if (converted.courseIds && Array.isArray(converted.courseIds)) {
            if (converted.courseIds.length === 1) {
                converted.courseId = converted.courseIds[0];
            }
        }
        if (converted.departmentIds && Array.isArray(converted.departmentIds)) {
            if (converted.departmentIds.length === 1) {
                converted.departmentId = converted.departmentIds[0];
            }
        }
        return converted;
    };

    const processedFilterRequest = convertFilterRequest(filterRequest);

    if (processedFilterRequest.statusId) params.statusId = processedFilterRequest.statusId;
    if (processedFilterRequest.statusIds) params.statusIds = processedFilterRequest.statusIds;
    if (processedFilterRequest.leadSourceId) params.leadSourceId = processedFilterRequest.leadSourceId;
    if (processedFilterRequest.leadSourceIds) params.leadSourceIds = processedFilterRequest.leadSourceIds;
    if (processedFilterRequest.boardId) params.boardId = processedFilterRequest.boardId;
    if (processedFilterRequest.boardIds) params.boardIds = processedFilterRequest.boardIds;
    if (processedFilterRequest.gradeId) params.gradeId = processedFilterRequest.gradeId;
    if (processedFilterRequest.gradeIds) params.gradeIds = processedFilterRequest.gradeIds;
    if (processedFilterRequest.courseTypeId) params.courseTypeId = processedFilterRequest.courseTypeId;
    if (processedFilterRequest.courseTypeIds) params.courseTypeIds = processedFilterRequest.courseTypeIds;
    if (processedFilterRequest.courseId) params.courseId = processedFilterRequest.courseId;
    if (processedFilterRequest.courseIds) params.courseIds = processedFilterRequest.courseIds;
    if (processedFilterRequest.departmentId) params.departmentId = processedFilterRequest.departmentId;
    if (processedFilterRequest.departmentIds) params.departmentIds = processedFilterRequest.departmentIds;
    if (processedFilterRequest.assignedUserId) params.assignedUserId = processedFilterRequest.assignedUserId;
    if (processedFilterRequest.assignedUserIds) params.assignedUserIds = processedFilterRequest.assignedUserIds;

    if (processedFilterRequest.allotted !== undefined) params.allotted = processedFilterRequest.allotted;
    if (processedFilterRequest.availed !== undefined) params.availed = processedFilterRequest.availed;
    if (processedFilterRequest.multiSource !== undefined) params.multiSource = processedFilterRequest.multiSource;

    if (processedFilterRequest.startDate) params.startDate = processedFilterRequest.startDate;
    if (processedFilterRequest.endDate) params.endDate = processedFilterRequest.endDate;
    if (processedFilterRequest.updatedFrom) params.updatedFrom = processedFilterRequest.updatedFrom;
    if (processedFilterRequest.updatedTo) params.updatedTo = processedFilterRequest.updatedTo;
    if (processedFilterRequest.availedFrom) params.availedFrom = processedFilterRequest.availedFrom;
    if (processedFilterRequest.availedTo) params.availedTo = processedFilterRequest.availedTo;
    if (processedFilterRequest.search) params.search = processedFilterRequest.search;

    try {
        const response = await axiosInstance.get(ApiRoutes.Lead.getAllLeads, { params });
        const data = response.data?.data || response.data || {};
        return {
            content: data.content || [],
            totalElements: data.totalElements || 0,
            totalPages: data.totalPages || 0,
        };
    } catch (err) {
        console.error('Failed to fetch leads for stream card:', err);
        return { content: [], totalElements: 0, totalPages: 0 };
    }
};

const StreamDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useAppContext();
    const { hasPermission } = usePermissions();

    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [activeFilters, setActiveFilters] = useState([]);
    const [appliedFilters, setAppliedFilters] = useState({
        ...DEFAULT_LEAD_FILTERS,
        streamIds: id ? [id] : [],
    });
    const [filterRequest, setFilterRequest] = useState({ streamId: id, streamIds: id ? [id] : [] });

    const [dashData, setDashData] = useState({
        leadSource: [],
        board: [],
        grade: [],
        category: [],
    });

    const [tableData, setTableData] = useState([]);
    const [tableTotalElements, setTableTotalElements] = useState(0);
    const [tableTotalPages, setTableTotalPages] = useState(0);
    const [tablePage, setTablePage] = useState(0);
    const [tableSize, setTableSize] = useState(10);
    const [tableSortBy, setTableSortBy] = useState('createdAt');
    const [tableSortDir, setTableSortDir] = useState('desc');
    const [tableLoading, setTableLoading] = useState(false);

    const [selectedRows, setSelectedRows] = useState(new Set());
    const [autoSelectCount, setAutoSelectCount] = useState('');
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
    const [selectedLeadForRemark, setSelectedLeadForRemark] = useState(null);
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

    const [userAllocationWorkingOnly, setUserAllocationWorkingOnly] = useState(false);
    const [isUserAllocationModalOpen, setIsUserAllocationModalOpen] = useState(false);
    const [userAllocationInitialWorkingOnly, setUserAllocationInitialWorkingOnly] = useState(false);

    const [lookups, setLookups] = useState({
        sources: [],
        courseTypes: [],
        courses: [],
        departments: [],
        users: [],
        boards: [],
        streams: [],
        grades: [],
        statuses: [],
    });

    const pendingAutoSelectRef = useRef(null);

    // Permission guard
    const canViewStream = hasPermission('STREAM_VIEW') || hasPermission('STREAM_READ');

    useEffect(() => {
        if (!canViewStream) {
            showToast('You do not have permission to view Stream details', 'error');
            navigate('/streams');
        }
    }, [canViewStream, navigate, showToast]);

    // Fetch Stream Master details
    useEffect(() => {
        const fetchStream = async () => {
            try {
                setLoading(true);
                const response = await getStreamById(id);
                setDetails(response?.data || response);
                setError(null);
            } catch (err) {
                console.error('Failed to load stream details:', err);
                setError('Failed to load stream details');
            } finally {
                setLoading(false);
            }
        };

        if (id && canViewStream) {
            fetchStream();
        }
    }, [id, canViewStream]);

    // Fetch dropdown lookups
    useEffect(() => {
        const fetchLookups = async () => {
            try {
                const [srcRes, ctRes, cRes, deptRes, uRes, bRes, strRes, gRes, stRes] = await Promise.all([
                    getLeadSourcesDropdown(),
                    getCourseTypesDropdown(),
                    getCoursesDropdown(),
                    getDepartmentsDropdown(),
                    getUsersDropdown(),
                    getBoardsDropdown(),
                    getStreamsDropdown(),
                    getGradesDropdown(),
                    getLeadStatusesDropdown(),
                ]);
                setLookups({
                    sources: srcRes?.data || srcRes || [],
                    courseTypes: ctRes?.data || ctRes || [],
                    courses: cRes?.data || cRes || [],
                    departments: deptRes?.data || deptRes || [],
                    users: uRes?.data || uRes || [],
                    boards: bRes?.data || bRes || [],
                    streams: strRes?.data || strRes || [],
                    grades: gRes?.data || gRes || [],
                    statuses: stRes?.data || stRes || [],
                });
            } catch (e) {
                console.error('Failed to load filter lookups:', e);
            }
        };
        fetchLookups();
    }, []);

    // Fetch dimension breakdowns scoped to Stream
    useEffect(() => {
        const fetchBreakdowns = async () => {
            if (!id) return;
            try {
                const currentFilter = { ...filterRequest, streamId: id, streamIds: id ? [id] : [] };
                const [srcRes, bRes, gRes, ctRes] = await Promise.all([
                    getLeadSourceBreakdown(currentFilter),
                    getBoardBreakdown(currentFilter),
                    getGradeBreakdown(currentFilter),
                    getCourseTypesBreakdown(currentFilter),
                ]);

                setDashData({
                    leadSource: srcRes?.data?.data || srcRes?.data || [],
                    board: bRes?.data?.data || bRes?.data || [],
                    grade: gRes?.data?.data || gRes?.data || [],
                    category: ctRes?.data?.data || ctRes?.data || [],
                });
            } catch (err) {
                console.error('Error fetching stream breakdown data:', err);
            }
        };

        fetchBreakdowns();
    }, [id, filterRequest]);

    // Synchronize filterRequest whenever activeFilters or appliedFilters change
    useEffect(() => {
        const newFilterRequest = { streamId: id, streamIds: id ? [id] : [] };

        if (appliedFilters.leadSourceIds?.length > 0) newFilterRequest.leadSourceIds = appliedFilters.leadSourceIds;
        if (appliedFilters.courseTypeIds?.length > 0) newFilterRequest.courseTypeIds = appliedFilters.courseTypeIds;
        if (appliedFilters.courseIds?.length > 0) newFilterRequest.courseIds = appliedFilters.courseIds;
        if (appliedFilters.boardIds?.length > 0) newFilterRequest.boardIds = appliedFilters.boardIds;
        if (appliedFilters.gradeIds?.length > 0) newFilterRequest.gradeIds = appliedFilters.gradeIds;
        if (appliedFilters.statusIds?.length > 0) newFilterRequest.leadStatusIds = appliedFilters.statusIds;
        if (appliedFilters.assignedUserIds?.length > 0) newFilterRequest.assignedUserIds = appliedFilters.assignedUserIds;
        if (appliedFilters.departmentIds?.length > 0) newFilterRequest.departmentIds = appliedFilters.departmentIds;
        if (appliedFilters.allotted !== null && appliedFilters.allotted !== undefined) newFilterRequest.allotted = appliedFilters.allotted;
        if (appliedFilters.availed !== null && appliedFilters.availed !== undefined) newFilterRequest.availed = appliedFilters.availed;
        if (appliedFilters.startDate) newFilterRequest.startDate = appliedFilters.startDate;
        if (appliedFilters.endDate) newFilterRequest.endDate = appliedFilters.endDate;
        if (appliedFilters.search) newFilterRequest.search = appliedFilters.search;

        activeFilters.forEach(f => {
            switch (f.type) {
                case 'unallotted':
                    newFilterRequest.allotted = false;
                    break;
                case 'availed':
                    newFilterRequest.availed = true;
                    break;
                case 'allotted':
                    newFilterRequest.allotted = true;
                    break;
                case 'leadStatus':
                    if (!newFilterRequest.leadStatusIds) newFilterRequest.leadStatusIds = [];
                    if (!newFilterRequest.leadStatusIds.includes(f.value)) newFilterRequest.leadStatusIds.push(f.value);
                    break;
                case 'board':
                    if (!newFilterRequest.boardIds) newFilterRequest.boardIds = [];
                    if (!newFilterRequest.boardIds.includes(f.value)) newFilterRequest.boardIds.push(f.value);
                    break;
                case 'grade':
                    if (!newFilterRequest.gradeIds) newFilterRequest.gradeIds = [];
                    if (!newFilterRequest.gradeIds.includes(f.value)) newFilterRequest.gradeIds.push(f.value);
                    break;
                case 'leadSource':
                    if (!newFilterRequest.leadSourceIds) newFilterRequest.leadSourceIds = [];
                    if (!newFilterRequest.leadSourceIds.includes(f.value)) newFilterRequest.leadSourceIds.push(f.value);
                    break;
                case 'course':
                    if (!newFilterRequest.courseIds) newFilterRequest.courseIds = [];
                    if (!newFilterRequest.courseIds.includes(f.value)) newFilterRequest.courseIds.push(f.value);
                    break;
                case 'courseType':
                case 'category':
                    if (!newFilterRequest.courseTypeIds) newFilterRequest.courseTypeIds = [];
                    if (!newFilterRequest.courseTypeIds.includes(f.value)) newFilterRequest.courseTypeIds.push(f.value);
                    break;
                case 'assignedUser':
                case 'counselor':
                    if (!newFilterRequest.assignedUserIds) newFilterRequest.assignedUserIds = [];
                    if (!newFilterRequest.assignedUserIds.includes(f.value)) newFilterRequest.assignedUserIds.push(f.value);
                    break;
                case 'department':
                    if (!newFilterRequest.departmentIds) newFilterRequest.departmentIds = [];
                    if (!newFilterRequest.departmentIds.includes(f.value)) newFilterRequest.departmentIds.push(f.value);
                    break;
                case 'search':
                    newFilterRequest.search = f.value;
                    break;
                case 'dateRange':
                    if (f.value) {
                        newFilterRequest.startDate = f.value.start;
                        newFilterRequest.endDate = f.value.end;
                    }
                    break;
                default:
                    break;
            }
        });

        setFilterRequest(newFilterRequest);
    }, [activeFilters, appliedFilters, id]);

    // Fetch leads for table
    useEffect(() => {
        const loadLeads = async () => {
            if (!id) return;
            setTableLoading(true);
            try {
                const result = await fetchLeadsForCard(
                    activeFilters,
                    id,
                    tablePage,
                    tableSize,
                    tableSortBy,
                    tableSortDir,
                    filterRequest
                );
                setTableData(result.content);
                setTableTotalElements(result.totalElements);
                setTableTotalPages(result.totalPages);

                if (pendingAutoSelectRef.current !== null) {
                    const count = pendingAutoSelectRef.current;
                    pendingAutoSelectRef.current = null;
                    const topIds = result.content.slice(0, count).map(lead => lead.id ?? lead.leadId);
                    setSelectedRows(new Set(topIds));
                }
            } catch (err) {
                console.error('Error fetching leads:', err);
                setTableData([]);
                setTableTotalElements(0);
                setTableTotalPages(0);
            } finally {
                setTableLoading(false);
            }
        };

        loadLeads();
    }, [id, activeFilters, tablePage, tableSize, tableSortBy, tableSortDir, filterRequest]);

    const handleCardClick = (card) => {
        setActiveFilters(prev => {
            const existingIndex = prev.findIndex(f => f.type === card.type && f.value === card.value);
            if (existingIndex !== -1) {
                const newFilters = [...prev];
                newFilters.splice(existingIndex, 1);
                return newFilters;
            } else {
                const filteredByType = prev.filter(f => f.type !== card.type);
                return [...filteredByType, card];
            }
        });
        setTablePage(0);
        setSelectedRows(new Set());
        setAutoSelectCount('');
    };

    const convertDrawerFiltersToActiveFilters = (drawerFilters) => {
        const newActiveFilters = [];

        if (drawerFilters.search) {
            newActiveFilters.push({
                type: 'search',
                value: drawerFilters.search,
                label: `Search: ${drawerFilters.search}`
            });
        }

        if (drawerFilters.leadSourceIds && drawerFilters.leadSourceIds.length > 0) {
            drawerFilters.leadSourceIds.forEach(sourceId => {
                const source = lookups.sources?.find(s => s.id === sourceId);
                if (source) {
                    newActiveFilters.push({
                        type: 'leadSource',
                        value: sourceId,
                        label: source.name || source.code || `Source ${sourceId}`
                    });
                }
            });
        }

        if (drawerFilters.statusIds && drawerFilters.statusIds.length > 0) {
            drawerFilters.statusIds.forEach(statusId => {
                const status = lookups.statuses?.find(s => s.id === statusId);
                if (status) {
                    newActiveFilters.push({
                        type: 'leadStatus',
                        value: statusId,
                        label: status.name || status.code || `Status ${statusId}`
                    });
                }
            });
        }

        if (drawerFilters.boardIds && drawerFilters.boardIds.length > 0) {
            drawerFilters.boardIds.forEach(boardId => {
                const board = lookups.boards?.find(b => b.id === boardId);
                if (board) {
                    newActiveFilters.push({
                        type: 'board',
                        value: boardId,
                        label: board.name || board.code || `Board ${boardId}`
                    });
                }
            });
        }

        if (drawerFilters.gradeIds && drawerFilters.gradeIds.length > 0) {
            drawerFilters.gradeIds.forEach(gradeId => {
                const grade = lookups.grades?.find(g => g.id === gradeId);
                if (grade) {
                    newActiveFilters.push({
                        type: 'grade',
                        value: gradeId,
                        label: grade.name || grade.code || `Grade ${gradeId}`
                    });
                }
            });
        }

        if (drawerFilters.courseTypeIds && drawerFilters.courseTypeIds.length > 0) {
            drawerFilters.courseTypeIds.forEach(ctId => {
                const ct = lookups.courseTypes?.find(c => c.id === ctId);
                if (ct) {
                    newActiveFilters.push({
                        type: 'courseType',
                        value: ctId,
                        label: ct.name || ct.code || `Category ${ctId}`
                    });
                }
            });
        }

        if (drawerFilters.courseIds && drawerFilters.courseIds.length > 0) {
            drawerFilters.courseIds.forEach(courseId => {
                const course = lookups.courses?.find(c => c.id === courseId);
                if (course) {
                    newActiveFilters.push({
                        type: 'course',
                        value: courseId,
                        label: course.courseName || course.name || `Course ${courseId}`
                    });
                }
            });
        }

        if (drawerFilters.departmentIds && drawerFilters.departmentIds.length > 0) {
            drawerFilters.departmentIds.forEach(deptId => {
                const dept = lookups.departments?.find(d => d.id === deptId);
                if (dept) {
                    newActiveFilters.push({
                        type: 'department',
                        value: deptId,
                        label: dept.name || dept.code || `Department ${deptId}`
                    });
                }
            });
        }

        if (drawerFilters.assignedUserIds && drawerFilters.assignedUserIds.length > 0) {
            drawerFilters.assignedUserIds.forEach(userId => {
                const user = lookups.users?.find(u => u.id === userId);
                if (user) {
                    newActiveFilters.push({
                        type: 'assignedUser',
                        value: userId,
                        label: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || `User ${userId}`
                    });
                }
            });
        }

        if (drawerFilters.allotted === true) {
            newActiveFilters.push({
                type: 'allotted',
                value: true,
                label: 'Allotted'
            });
        } else if (drawerFilters.allotted === false) {
            newActiveFilters.push({
                type: 'unallotted',
                value: false,
                label: 'Unallotted'
            });
        }

        if (drawerFilters.availed === true) {
            newActiveFilters.push({
                type: 'availed',
                value: true,
                label: 'Availed'
            });
        }

        if (drawerFilters.startDate || drawerFilters.endDate) {
            newActiveFilters.push({
                type: 'dateRange',
                value: { start: drawerFilters.startDate, end: drawerFilters.endDate },
                label: `Created: ${drawerFilters.startDate || '...'} to ${drawerFilters.endDate || '...'}`
            });
        }

        return newActiveFilters;
    };

    const handleDrawerApply = (drawerFilters) => {
        const filtersWithStream = {
            ...drawerFilters,
            streamIds: id ? [id] : [],
            streamId: id,
        };
        setAppliedFilters(filtersWithStream);
        const newActiveFilters = convertDrawerFiltersToActiveFilters(drawerFilters);
        setActiveFilters(newActiveFilters);
        setTablePage(0);
        setSelectedRows(new Set());
        setAutoSelectCount('');
        setIsFilterDrawerOpen(false);
    };

    const handleRemoveFilter = (filterType, filterValue) => {
        setActiveFilters(prev => prev.filter(f => !(f.type === filterType && f.value === filterValue)));
        setAppliedFilters(prev => {
            const updated = { ...prev };
            switch (filterType) {
                case 'leadSource':
                    updated.leadSourceIds = (updated.leadSourceIds || []).filter(v => v !== filterValue);
                    break;
                case 'leadStatus':
                    updated.statusIds = (updated.statusIds || []).filter(v => v !== filterValue);
                    break;
                case 'board':
                    updated.boardIds = (updated.boardIds || []).filter(v => v !== filterValue);
                    break;
                case 'grade':
                    updated.gradeIds = (updated.gradeIds || []).filter(v => v !== filterValue);
                    break;
                case 'courseType':
                case 'category':
                    updated.courseTypeIds = (updated.courseTypeIds || []).filter(v => v !== filterValue);
                    break;
                case 'course':
                    updated.courseIds = (updated.courseIds || []).filter(v => v !== filterValue);
                    break;
                case 'department':
                    updated.departmentIds = (updated.departmentIds || []).filter(v => v !== filterValue);
                    break;
                case 'assignedUser':
                case 'counselor':
                    updated.assignedUserIds = (updated.assignedUserIds || []).filter(v => v !== filterValue);
                    break;
                case 'allotted':
                case 'unallotted':
                    updated.allotted = null;
                    break;
                case 'availed':
                    updated.availed = null;
                    break;
                case 'search':
                    updated.search = '';
                    break;
                case 'dateRange':
                    updated.startDate = '';
                    updated.endDate = '';
                    break;
                default:
                    break;
            }
            return updated;
        });
        setTablePage(0);
        setSelectedRows(new Set());
        setAutoSelectCount('');
    };

    const handleClearAllFilters = () => {
        setActiveFilters([]);
        setAppliedFilters({
            ...DEFAULT_LEAD_FILTERS,
            streamIds: id ? [id] : [],
            streamId: id,
        });
        setTablePage(0);
        setSelectedRows(new Set());
        setAutoSelectCount('');
    };

    const handleViewAllLeads = () => {
        const searchParams = new URLSearchParams();
        searchParams.set('streamId', id);
        if (details?.name) {
            searchParams.set('streamName', details.name);
        }

        if (filterRequest.allotted === true) searchParams.set('allotted', 'true');
        if (filterRequest.allotted === false) searchParams.set('allotted', 'false');
        if (filterRequest.availed === true) searchParams.set('availed', 'true');

        if (filterRequest.courseId) searchParams.set('courseId', filterRequest.courseId);
        else if (filterRequest.courseIds?.length === 1) searchParams.set('courseId', filterRequest.courseIds[0]);

        if (filterRequest.courseTypeId) searchParams.set('courseTypeId', filterRequest.courseTypeId);
        else if (filterRequest.courseTypeIds?.length === 1) searchParams.set('courseTypeId', filterRequest.courseTypeIds[0]);

        if (filterRequest.leadSourceId) searchParams.set('leadSourceId', filterRequest.leadSourceId);
        else if (filterRequest.leadSourceIds?.length === 1) searchParams.set('leadSourceId', filterRequest.leadSourceIds[0]);

        if (filterRequest.boardId) searchParams.set('boardId', filterRequest.boardId);
        else if (filterRequest.boardIds?.length === 1) searchParams.set('boardId', filterRequest.boardIds[0]);

        if (filterRequest.gradeId) searchParams.set('gradeId', filterRequest.gradeId);
        else if (filterRequest.gradeIds?.length === 1) searchParams.set('gradeId', filterRequest.gradeIds[0]);

        if (filterRequest.assignedUserId) searchParams.set('assignedUserId', filterRequest.assignedUserId);
        else if (filterRequest.assignedUserIds?.length === 1) searchParams.set('assignedUserId', filterRequest.assignedUserIds[0]);

        if (filterRequest.departmentId) searchParams.set('departmentId', filterRequest.departmentId);
        else if (filterRequest.departmentIds?.length === 1) searchParams.set('departmentId', filterRequest.departmentIds[0]);

        if (filterRequest.statusId) searchParams.set('statusId', filterRequest.statusId);
        else if (filterRequest.leadStatusIds?.length === 1) searchParams.set('statusId', filterRequest.leadStatusIds[0]);

        if (filterRequest.startDate) searchParams.set('startDate', filterRequest.startDate);
        if (filterRequest.endDate) searchParams.set('endDate', filterRequest.endDate);
        if (filterRequest.search) searchParams.set('search', filterRequest.search);

        const searchString = searchParams.toString();
        navigate(
            {
                pathname: '/leads',
                search: searchString ? `?${searchString}` : ''
            },
            {
                state: { activeFilters }
            }
        );
    };

    const handleToggleRow = (rowId) => {
        setSelectedRows(prev => {
            const next = new Set(prev);
            next.has(rowId) ? next.delete(rowId) : next.add(rowId);
            return next;
        });
    };

    const handleToggleAll = (checked, rows) => {
        setSelectedRows(prev => {
            const next = new Set(prev);
            rows.forEach(r => {
                const rowId = r.id ?? r.leadId;
                checked ? next.add(rowId) : next.delete(rowId);
            });
            return next;
        });
    };

    const handleAutoSelectCount = (e) => {
        const val = e.target.value;
        setAutoSelectCount(val);
        const count = parseInt(val, 10);
        if (!isNaN(count) && count > 0) {
            if (count <= tableData.length) {
                const topIds = tableData.slice(0, count).map(lead => lead.id ?? lead.leadId);
                setSelectedRows(new Set(topIds));
                setTableSize(count);
                setTablePage(0);
            } else {
                pendingAutoSelectRef.current = count;
                setTablePage(0);
                setTableSize(count);
            }
        } else {
            setSelectedRows(new Set());
            setTableSize(10);
            setTablePage(0);
        }
    };

    const openRemarkModal = (lead) => { setSelectedLeadForRemark(lead); setIsRemarkModalOpen(true); };
    const closeRemarkModal = () => { setIsRemarkModalOpen(false); setSelectedLeadForRemark(null); };

    const handleLeadSort = (columnKey, direction) => {
        setTableSortBy(columnKey);
        setTableSortDir(direction);
        setTablePage(0);
    };

    const downloadExcel = async () => {
        try {
            const result = await fetchLeadsForCard(activeFilters, id, 0, 10000, tableSortBy, tableSortDir, filterRequest);
            const exportLeads = result.content || [];

            const excelData = exportLeads.map((lead, index) => ({
                'S.No': index + 1,
                'Lead Code': lead.leadCode || '-',
                'Name': lead.fullName || '-',
                'Email': lead.email || '-',
                'Mobile': lead.mobileNumber || lead.phone || '-',
                'Stream': details?.name || '-',
                'Status': lead.currentStatus?.name || lead.leadStatus || '-',
                'Counselor': lead.assignedTo?.name || lead.assignedUserName || '-',
                'Created Date': lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A',
            }));

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
            XLSX.writeFile(workbook, `stream_${details?.name || id}_leads.xlsx`);
            showToast('Excel downloaded successfully', 'success');
        } catch (e) {
            console.error('Download error:', e);
            showToast('Failed to download leads', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !details) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500 font-medium mb-4">{error || 'Stream not found'}</p>
                <button
                    onClick={() => navigate('/streams')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                >
                    Back to Streams
                </button>
            </div>
        );
    }

    return (
        <div className="block p-4 sm:p-6" id="page-stream-details">
            {/* Page Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                        onClick={() => navigate('/streams')}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">Stream Details</h1>
                        <p className="text-sm text-gray-500 mt-1">View comprehensive analytics and metrics for {details?.name}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all"
                        onClick={handleViewAllLeads}
                    >
                        <FiEye size={12} />
                        View Leads
                    </button>
                    <button
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all"
                        onClick={downloadExcel}
                        disabled={tableTotalElements === 0}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        Download Leads
                    </button>
                </div>
            </div>

            {/* Stream Header Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
                <div className="flex flex-col sm:flex-row items-start gap-5 mb-8 pb-6 border-b border-gray-100">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0">
                        {details?.name ? details.name.substring(0, 2).toUpperCase() : 'ST'}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{details?.name}</h2>
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${details?.active
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                {details?.active ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                            {details?.code && (
                                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-indigo-200">
                                    CODE: {details.code}
                                </span>
                            )}
                            <span className="bg-gray-50 text-gray-500 text-[10px] font-medium px-2.5 py-1 rounded-full border border-gray-200">
                                ID: {details?.id}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            Description
                        </div>
                        <div className="text-sm font-semibold text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {details?.description || 'No description provided.'}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            Creation Date
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                            {details?.createdAt ? new Date(details.createdAt).toLocaleString() : 'N/A'}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── The Six Analytics Components ─── */}
            <div className="mb-8">
                {/* 1, 2, 3: Allotted, Unallotted, Availed Cards */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <AllottedCard
                        onCardClick={handleCardClick}
                        activeFilters={activeFilters}
                        filterRequest={filterRequest}
                        streamId={id}
                    />
                    <UnallottedCard
                        onCardClick={handleCardClick}
                        activeFilters={activeFilters}
                        filterRequest={filterRequest}
                        streamId={id}
                    />
                    <AvailedCard
                        onCardClick={handleCardClick}
                        activeFilters={activeFilters}
                        filterRequest={filterRequest}
                        streamId={id}
                    />
                </div>

                {/* 4: User Allocation Summary & Table */}
                <UserAllocationSummaryCards
                    streamId={id}
                    filterRequest={filterRequest}
                    activeFilters={activeFilters}
                    scopeTitle={details?.name || 'Stream'}
                    activeWorkingOnly={userAllocationWorkingOnly}
                    onWorkingOnlyChange={(val) => setUserAllocationWorkingOnly(val)}
                    onCardClick={handleCardClick}
                />

                {/* 5: Lead Cards Status Distribution */}
                <LeadCards
                    onCardClick={handleCardClick}
                    activeFilters={activeFilters}
                    streamId={id}
                    filterRequest={filterRequest}
                />

                {/* 6: Dimension Breakdown Cards */}
                <LeadSource
                    data={dashData.leadSource}
                    onCardClick={handleCardClick}
                    activeFilters={activeFilters}
                />
                <BoardWiseCard
                    data={dashData.board}
                    onCardClick={handleCardClick}
                    activeFilters={activeFilters}
                />
                <GradWiseCard
                    data={dashData.grade}
                    onCardClick={handleCardClick}
                    activeFilters={activeFilters}
                />
                {dashData.category?.length > 0 && (
                    <CategorywiseCard
                        data={dashData.category}
                        onCardClick={handleCardClick}
                        activeFilters={activeFilters}
                    />
                )}
            </div>

            {/* ─── Course-wise & User-wise Lead Status Analytics Section ─── */}
            <CourseUserStatusAnalyticsSection
                contextType="stream"
                contextId={id}
                activeFilters={activeFilters}
            />

            {/* ─── Leads Table Section ─── */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="w-1 h-5 bg-indigo-500 rounded-full" />
                        <h3 className="text-base font-bold text-gray-900">
                            {activeFilters.length === 0 ? 'All Stream Leads' : `Filtered Leads (${activeFilters.length})`}
                        </h3>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            {tableTotalElements} records
                        </span>

                        {activeFilters.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap ml-2">
                                {activeFilters.map((filter, index) => (
                                    <div
                                        key={`${filter.type}-${filter.value}-${index}`}
                                        className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200"
                                    >
                                        <span className="font-medium">{filter.label}</span>
                                        <button
                                            onClick={() => handleRemoveFilter(filter.type, filter.value)}
                                            className="hover:text-red-600 transition-colors"
                                            title="Remove filter"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={handleClearAllFilters}
                                    className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded-full border border-red-200"
                                >
                                    Clear All
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsFilterDrawerOpen(true)}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-sm"
                        >
                            <FiFilter size={13} />
                            Advanced Filters
                        </button>

                        {hasPermission('LEAD_ASSIGN') && (
                            <>
                                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-600">
                                    <span className="font-semibold text-slate-500 mr-2 select-none">Quick Select:</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max={tableData.length}
                                        value={autoSelectCount}
                                        onChange={handleAutoSelectCount}
                                        placeholder="Qty"
                                        className="w-12 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-center font-bold text-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <button
                                    onClick={() => setIsAssignModalOpen(true)}
                                    disabled={selectedRows.size === 0}
                                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${selectedRows.size > 0
                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <FiUserPlus size={13} />
                                    Assign ({selectedRows.size})
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <ReusableTable
                    columns={buildLeadColumns(
                        tablePage,
                        tableSize,
                        openRemarkModal,
                        navigate,
                        selectedRows,
                        handleToggleRow,
                        handleToggleAll,
                        tableData,
                        hasPermission,
                        showToast
                    )}
                    data={tableData}
                    loading={tableLoading}
                    pagination={{
                        currentPage: tablePage + 1,
                        totalPages: tableTotalPages,
                        totalElements: tableTotalElements,
                        rowsPerPage: tableSize,
                        onPageChange: (newPage) => setTablePage(newPage - 1),
                        onRowsPerPageChange: (newSize) => {
                            setTableSize(newSize);
                            setTablePage(0);
                        },
                    }}
                    onSort={handleLeadSort}
                    sortBy={tableSortBy}
                    sortDirection={tableSortDir}
                />
            </div>

            {/* ── User Allocation & Workload Table ── */}
            <div id="user-allocation-table-section" className="mt-8">
                <UserAllocationTable
                    streamId={id}
                    filterRequest={filterRequest}
                    activeFilters={activeFilters}
                    scopeTitle={details?.name || 'Stream'}
                    workingOnly={userAllocationWorkingOnly}
                    onTabChange={(val) => setUserAllocationWorkingOnly(val)}
                />
            </div>

            {/* Remark Modal */}
            {isRemarkModalOpen && selectedLeadForRemark && (
                <LeadRemarkModal
                    isOpen={isRemarkModalOpen}
                    onClose={closeRemarkModal}
                    lead={selectedLeadForRemark}
                />
            )}

            {/* Assign Modal */}
            {isAssignModalOpen && (
                <AssignLeadModal
                    isOpen={isAssignModalOpen}
                    onClose={() => {
                        setIsAssignModalOpen(false);
                        setSelectedRows(new Set());
                        setAutoSelectCount('');
                    }}
                    selectedLeadIds={Array.from(selectedRows)}
                    onSuccess={() => {
                        setIsAssignModalOpen(false);
                        setSelectedRows(new Set());
                        setAutoSelectCount('');
                        // Trigger reload
                        setTablePage(0);
                    }}
                />
            )}

            {/* Filter Drawer */}
            <LeadFilterDrawer
                isOpen={isFilterDrawerOpen}
                onClose={() => setIsFilterDrawerOpen(false)}
                filters={appliedFilters}
                onApplyFilters={handleDrawerApply}
                onResetFilters={() => {
                    handleClearAllFilters();
                    setIsFilterDrawerOpen(false);
                }}
                lookups={lookups}
            />

            {/* User Allocation List Modal */}
            {isUserAllocationModalOpen && (
                <UserAllocationListModal
                    isOpen={isUserAllocationModalOpen}
                    onClose={() => setIsUserAllocationModalOpen(false)}
                    streamId={id}
                    filterRequest={filterRequest}
                    scopeTitle={details?.name || 'Stream'}
                    initialWorkingOnly={userAllocationInitialWorkingOnly}
                />
            )}
        </div>
    );
};

export default StreamDetails;

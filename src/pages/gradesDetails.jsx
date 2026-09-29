import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEye, FiMessageSquare, FiUserPlus, FiFilter, FiCheckSquare } from 'react-icons/fi';
import { useAppContext } from '../AppContext';
import { usePermissions } from '../PermissionContext';
import gradsService from '../Services/Grads/gradsService';
import {
    getLeadSourceBreakdown,
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
} from '../Services/drop-down/dropDownService';
import { DEFAULT_LEAD_FILTERS } from '../Services/lead/leadFilterModel';
import axiosInstance from '../axiosInstance/axios';
import ApiRoutes from '../apiRoutes/allApiRoutes';
import LeadCards from '../component/reusable/DashBoards/leadCards';
import LeadSource from '../component/reusable/DashBoards/leadSource';
import CategorywiseCard from '../component/reusable/DashBoards/categorywiseCard';
import BoardWiseCard from '../component/reusable/DashBoards/BoardWiseCard';
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

// ─── Lead table columns ───────────────────────────────────────────────────────
const buildLeadColumns = (page, size, selectedRows, onToggleRow, onToggleAll, currentData, hasPermission) => [
    {
        key: 'checkbox',
        header: hasPermission('LEAD_ASSIGN') ? (
            <input
                type="checkbox"
                checked={currentData.length > 0 && currentData.every(r => selectedRows.has(r.id ?? r.leadId))}
                onChange={(e) => onToggleAll(e.target.checked, currentData)}
                style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#4f46e5' }}
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
                    style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#4f46e5' }}
                />
            );
        },
    },
    {
        key: 'sno',
        header: 'S.No',
        sortable: false,
        render: (value, row, index) => (
            <span className="font-semibold text-gray-700">{page * size + index + 1}</span>
        ),
    },
    {
        key: 'leadCode',
        header: 'Lead Code',
        render: (value, row) => {
            const v = value || row.leadCode;
            const display = typeof v === 'object' ? (v?.code || v?.name || 'N/A') : (v || 'N/A');
            return <span className="font-semibold text-blue-600">{display}</span>;
        },
    },
    {
        key: 'lead',
        header: 'Lead Info',
        render: (value, row) => (
            <div className="font-semibold text-gray-800">
                {typeof row.fullName === 'object'
                    ? row.fullName?.name || row.fullName?.firstName || 'N/A'
                    : row.fullName || 'N/A'}
            </div>
        ),
    },
    {
        key: 'interestedCourses',
        header: 'Course',
        render: (value, row) => {
            // Priority: interestedCourses[0] > registered course
            if (Array.isArray(row.interestedCourses) && row.interestedCourses.length > 0) {
                const c = row.interestedCourses[0];
                return (typeof c === 'object' && c !== null) ? (c.courseName || c.name || 'N/A') : (c || 'N/A');
            }
            if (row.course && typeof row.course === 'object') return row.course.courseName || row.course.name || 'N/A';
            return 'N/A';
        },
    },
    {
        key: 'source',
        header: 'Source',
        render: (value, row) => {
            // Check if leadSources array exists and has items
            if (Array.isArray(row.leadSources) && row.leadSources.length > 0) {
                const sourcesToShow = row.leadSources.slice(0, 2);
                const remainingCount = row.leadSources.length - 2;

                return (
                    <div className="flex items-center gap-1">
                        {sourcesToShow.map((source, index) => {
                            // Generate a consistent color based on source name or code
                            const colors = [
                                'bg-blue-100 text-blue-800 border-blue-200',
                                'bg-green-100 text-green-800 border-green-200',
                                'bg-purple-100 text-purple-800 border-purple-200',
                                'bg-orange-100 text-orange-800 border-orange-200',
                                'bg-pink-100 text-pink-800 border-pink-200',
                                'bg-teal-100 text-teal-800 border-teal-200',
                                'bg-indigo-100 text-indigo-800 border-indigo-200',
                                'bg-red-100 text-red-800 border-red-200',
                            ];
                            const colorIndex = index % colors.length;
                            const sourceName = source?.name || source?.code || 'N/A';

                            return (
                                <span
                                    key={source?.id || index}
                                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${colors[colorIndex]}`}
                                >
                                    {sourceName}
                                </span>
                            );
                        })}
                        {remainingCount > 0 && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                                +{remainingCount}
                            </span>
                        )}
                    </div>
                );
            }
            // Fallback to sourceDetails if leadSources is empty
            if (row.sourceDetails) {
                return (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-800 border border-gray-200">
                        {row.sourceDetails}
                    </span>
                );
            }
            return 'N/A';
        },
    },
    {
        key: 'currentStatus',
        header: 'Status',
        render: (value, row) => {
            const v = value || row.currentStatus;
            const display = typeof v === 'object' ? (v?.name || v?.code || 'N/A') : (v || 'N/A');
            return (
                <span className="badge bg-slate-200 text-slate-800 px-2 py-1 rounded text-xs font-medium">
                    {display}
                </span>
            );
        },
    },
    {
        key: 'assignedTo',
        header: 'Counselor',
        render: (value, row) => {
            if (typeof row.assignedTo === 'object' && row.assignedTo !== null)
                return `${row.assignedTo.firstName || ''} ${row.assignedTo.lastName || ''}`.trim() || 'Not Allotted';
            return row.assignedTo || 'Not Allotted';
        },
    },
    {
        key: 'nextFollowUpDate',
        header: 'Follow-up',
        render: (value, row) => {
            if (row.nextFollowUpDate) {
                try { return new Date(row.nextFollowUpDate).toLocaleDateString(); }
                catch { return 'Invalid Date'; }
            }
            return 'None';
        },
    },
    {
        key: 'createdBy',
        header: 'Created By',
        render: (value, row) => {
            const v = value || row.createdBy;
            if (typeof v === 'object' && v !== null)
                return `${v.firstName || ''} ${v.lastName || ''}`.trim() || 'N/A';
            return v || 'N/A';
        },
    },
];

// ─── Helper: fetch leads for selected card (server-side) ─────────────────────
const fetchLeadsForCard = async (activeFilters, gradeId, page, size, sortBy, sortDirection, filterRequest) => {
    if (!gradeId) return { content: [], totalElements: 0, totalPages: 0 };

    const params = {
        gradeId,          // always filter by this grade
        page,
        size,
        sortBy: sortBy || 'createdAt',
        sortDirection: sortDirection || 'desc',
    };

    // Smart conversion function: array to singular/plural based on length
    const convertFilterRequest = (request) => {
        const converted = { ...request };

        // Convert leadStatusIds → statusId or statusIds
        if (converted.leadStatusIds?.length === 1) {
            converted.statusId = converted.leadStatusIds[0];
            delete converted.leadStatusIds;
        }

        // Convert boardIds → boardId or boardIds
        if (converted.boardIds?.length === 1) {
            converted.boardId = converted.boardIds[0];
            delete converted.boardIds;
        }

        // Convert gradeIds → gradeId or gradeIds
        if (converted.gradeIds?.length === 1) {
            converted.gradeId = converted.gradeIds[0];
            delete converted.gradeIds;
        }

        // Convert courseTypeIds → courseTypeId or courseTypeIds
        if (converted.courseTypeIds?.length === 1) {
            converted.courseTypeId = converted.courseTypeIds[0];
            delete converted.courseTypeIds;
        }

        // Convert courseIds → courseId or courseIds
        if (converted.courseIds?.length === 1) {
            converted.courseId = converted.courseIds[0];
            delete converted.courseIds;
        }

        // Convert departmentIds → departmentId or departmentIds
        if (converted.departmentIds?.length === 1) {
            converted.departmentId = converted.departmentIds[0];
            delete converted.departmentIds;
        }

        // Convert assignedUserIds → assignedUserId or assignedUserIds
        if (converted.assignedUserIds?.length === 1) {
            converted.assignedUserId = converted.assignedUserIds[0];
            delete converted.assignedUserIds;
        }

        // Convert leadSourceIds → leadSourceId or leadSourceIds
        if (converted.leadSourceIds?.length === 1) {
            converted.leadSourceId = converted.leadSourceIds[0];
            delete converted.leadSourceIds;
        }

        return converted;
    };

    // Use filterRequest with smart conversion instead of direct assignment
    Object.assign(params, convertFilterRequest(filterRequest || {}));

    try {
        const res = await axiosInstance.get(ApiRoutes.Lead.getAllLeads, { params });
        const d = res?.data?.data || res?.data || {};
        return {
            content: d.content ?? (Array.isArray(d) ? d : []),
            totalElements: d.totalElements ?? 0,
            totalPages: d.totalPages ?? 0,
        };
    } catch (err) {
        console.error('Failed to fetch lead table data', err);
        return { content: [], totalElements: 0, totalPages: 0 };
    }
};

// ─── Main Component ───────────────────────────────────────────────────────────
const GradesDetails = () => {
    const { navTo, showToast } = useAppContext();
    const { hasPermission } = usePermissions();
    const navigate = useNavigate();
    const { id } = useParams();

    // detail state
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // dashboard card data
    const [dashData, setDashData] = useState({ leadSource: [], courseType: [], board: [] });

    // filter / table state - support multiple active filters
    const [activeFilters, setActiveFilters] = useState([]); // Array of { type, value, label }
    const [tableData, setTableData] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);

    // filter request for cards
    const [filterRequest, setFilterRequest] = useState({ gradeId: id });

    // server-side pagination & sorting
    const [tablePage, setTablePage] = useState(0);
    const [tableSize, setTableSize] = useState(10);
    const [tableTotalElements, setTableTotalElements] = useState(0);
    const [tableTotalPages, setTableTotalPages] = useState(0);
    const [tableSortBy, setTableSortBy] = useState('createdAt');
    const [tableSortDir, setTableSortDir] = useState('desc');

    // remark modal
    const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
    const [selectedLeadForRemark, setSelectedLeadForRemark] = useState(null);

    // row selection & assign modal
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [autoSelectCount, setAutoSelectCount] = useState('');
    const pendingAutoSelectRef = useRef(null);

    // lead filter drawer state
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState(() => ({
        ...DEFAULT_LEAD_FILTERS,
        gradeIds: id ? [id] : [] // Always set to current grade
    }));

    // dropdown lookups for filter drawer
    const [lookups, setLookups] = useState({
        sources: [],
        courseTypes: [],
        courses: [],
        departments: [],
        users: [],
        boards: [],
        grades: [],
        statuses: [],
    });

    // user allocation list modal
    const [isUserAllocationModalOpen, setIsUserAllocationModalOpen] = useState(false);
    const [userAllocationInitialWorkingOnly, setUserAllocationInitialWorkingOnly] = useState(false);
    const [userAllocationWorkingOnly, setUserAllocationWorkingOnly] = useState(false);

    // ── fetch grade details ──
    useEffect(() => {
        if (!id) return;
        const run = async () => {
            setLoading(true);
            try {
                const res = await gradsService.getGradeById(id);
                setDetails({
                    id: res.data.id,
                    gradeName: res.data.name,
                    gradeCode: res.data.code,
                    description: res.data.description,
                    status: res.data.active ? 'ACTIVE' : 'INACTIVE',
                    displayOrder: res.data.displayOrder,
                    createdAt: res.data.createdAt,
                    updatedAt: res.data.updatedAt,
                });
            } catch (err) {
                console.error('Failed to fetch grade details', err);
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [id]);

    // ── fetch dashboard breakdown data ──
    useEffect(() => {
        if (!id) return;
        const fetchDashboardData = async () => {
            const params = { gradeId: id };
            try {
                const [sourceRes, courseTypeRes, boardRes] = await Promise.all([
                    getLeadSourceBreakdown(params).catch(() => null),
                    getCourseTypesBreakdown(params).catch(() => null),
                    getBoardBreakdown(params).catch(() => null),
                ]);
                const toArr = (r) => r?.data?.data || r?.data || [];
                setDashData({
                    leadSource: toArr(sourceRes),
                    courseType: toArr(courseTypeRes),
                    board: toArr(boardRes),
                });
            } catch (err) {
                console.error('Dashboard data fetch failed', err);
            }
        };
        fetchDashboardData();
    }, [id]);

    // ── fetch dropdown lookups for filter drawer ──
    useEffect(() => {
        let isCancelled = false;
        const fetchDropdowns = async () => {
            try {
                const [
                    sourcesRes,
                    courseTypesRes,
                    coursesRes,
                    deptRes,
                    usersRes,
                    boardsRes,
                    gradesRes,
                    statusesRes,
                ] = await Promise.allSettled([
                    getLeadSourcesDropdown(),
                    getCourseTypesDropdown(),
                    getCoursesDropdown(),
                    getDepartmentsDropdown(),
                    getUsersDropdown(),
                    getBoardsDropdown(),
                    getGradesDropdown(),
                    getLeadStatusesDropdown(),
                ]);

                if (!isCancelled) {
                    setLookups({
                        sources: sourcesRes.status === 'fulfilled' && sourcesRes.value?.data ? (Array.isArray(sourcesRes.value.data) ? sourcesRes.value.data : []) : [],
                        courseTypes: courseTypesRes.status === 'fulfilled' && courseTypesRes.value?.data ? (Array.isArray(courseTypesRes.value.data) ? courseTypesRes.value.data : []) : [],
                        courses: coursesRes.status === 'fulfilled' && coursesRes.value?.data ? (Array.isArray(coursesRes.value.data) ? coursesRes.value.data : []) : [],
                        departments: deptRes.status === 'fulfilled' && deptRes.value?.data ? (Array.isArray(deptRes.value.data) ? deptRes.value.data : []) : [],
                        users: usersRes.status === 'fulfilled' && usersRes.value?.data ? (Array.isArray(usersRes.value.data) ? usersRes.value.data : []) : [],
                        boards: boardsRes.status === 'fulfilled' && boardsRes.value?.data ? (Array.isArray(boardsRes.value.data) ? boardsRes.value.data : []) : [],
                        grades: gradesRes.status === 'fulfilled' && gradesRes.value?.data ? (Array.isArray(gradesRes.value.data) ? gradesRes.value.data : []) : [],
                        statuses: statusesRes.status === 'fulfilled' && statusesRes.value?.data ? (Array.isArray(statusesRes.value.data) ? statusesRes.value.data : []) : [],
                    });
                }
            } catch (err) {
                console.error('Failed to load filter dropdown lookups', err);
            }
        };

        fetchDropdowns();
        return () => {
            isCancelled = true;
        };
    }, []);

    // ── ensure gradeIds is always set to current grade in appliedFilters ──
    useEffect(() => {
        setAppliedFilters(prev => ({
            ...prev,
            gradeIds: id ? [id] : []
        }));
    }, [id]);

    // ── fetch leads when filters change or pagination/sort changes ──
    useEffect(() => {
        if (!id) return;
        setTableLoading(true);
        fetchLeadsForCard(activeFilters, id, tablePage, tableSize, tableSortBy, tableSortDir, filterRequest)
            .then(({ content, totalElements, totalPages }) => {
                setTableData(content);
                setTableTotalElements(totalElements);
                setTableTotalPages(totalPages);
                setTableLoading(false);

                // Apply pending auto-select if set (triggered by Quick Select resize)
                if (pendingAutoSelectRef.current !== null) {
                    const pending = pendingAutoSelectRef.current;
                    pendingAutoSelectRef.current = null;
                    const topIds = content.slice(0, pending).map(lead => {
                        const rowId = typeof lead.id === 'object' ? lead.id?.id : lead.id;
                        const rowLeadId = typeof lead.leadId === 'object' ? lead.leadId?.id : lead.leadId;
                        return rowId || rowLeadId;
                    });
                    setSelectedRows(new Set(topIds));
                }
            });
    }, [activeFilters, id, tablePage, tableSize, tableSortBy, tableSortDir, filterRequest]);

    // ── update filterRequest when activeFilters change for cards ──
    useEffect(() => {
        const newFilterRequest = {
            gradeId: id,
            gradeIds: id ? [id] : [] // Always set to current grade
        };

        // Add drawer-applied filters (except gradeIds which is forced above)
        if (appliedFilters.search) {
            newFilterRequest.search = appliedFilters.search;
        }
        if (appliedFilters.leadSourceIds && appliedFilters.leadSourceIds.length > 0) {
            newFilterRequest.leadSourceIds = appliedFilters.leadSourceIds;
        }
        if (appliedFilters.statusIds && appliedFilters.statusIds.length > 0) {
            newFilterRequest.leadStatusIds = appliedFilters.statusIds;
        }
        if (appliedFilters.boardIds && appliedFilters.boardIds.length > 0) {
            newFilterRequest.boardIds = appliedFilters.boardIds;
        }
        if (appliedFilters.gradeIds && appliedFilters.gradeIds.length > 0) {
            newFilterRequest.gradeIds = appliedFilters.gradeIds;
        }
        if (appliedFilters.courseIds && appliedFilters.courseIds.length > 0) {
            newFilterRequest.courseIds = appliedFilters.courseIds;
        }
        if (appliedFilters.courseTypeIds && appliedFilters.courseTypeIds.length > 0) {
            newFilterRequest.courseTypeIds = appliedFilters.courseTypeIds;
        }
        if (appliedFilters.departmentIds && appliedFilters.departmentIds.length > 0) {
            newFilterRequest.departmentIds = appliedFilters.departmentIds;
        }
        if (appliedFilters.assignedUserIds && appliedFilters.assignedUserIds.length > 0) {
            newFilterRequest.assignedUserIds = appliedFilters.assignedUserIds;
        }
        if (appliedFilters.allotted !== null && appliedFilters.allotted !== undefined) {
            newFilterRequest.allotted = appliedFilters.allotted;
        }
        if (appliedFilters.availed !== null && appliedFilters.availed !== undefined) {
            newFilterRequest.availed = appliedFilters.availed;
        }
        if (appliedFilters.multiSource !== null && appliedFilters.multiSource !== undefined) {
            newFilterRequest.multiSource = appliedFilters.multiSource;
        }
        if (appliedFilters.startDate) {
            newFilterRequest.startDate = appliedFilters.startDate;
        }
        if (appliedFilters.endDate) {
            newFilterRequest.endDate = appliedFilters.endDate;
        }
        if (appliedFilters.updatedFrom) {
            newFilterRequest.updatedFrom = appliedFilters.updatedFrom;
        }
        if (appliedFilters.updatedTo) {
            newFilterRequest.updatedTo = appliedFilters.updatedTo;
        }
        if (appliedFilters.availedFrom) {
            newFilterRequest.availedFrom = appliedFilters.availedFrom;
        }
        if (appliedFilters.availedTo) {
            newFilterRequest.availedTo = appliedFilters.availedTo;
        }

        // Add card-based active filters (these can override drawer filters)
        activeFilters.forEach(filter => {
            switch (filter.type) {
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
                    if (!newFilterRequest.leadStatusIds.includes(filter.value)) {
                        newFilterRequest.leadStatusIds.push(filter.value);
                    }
                    break;
                case 'leadSource':
                    if (!newFilterRequest.leadSourceIds) newFilterRequest.leadSourceIds = [];
                    if (!newFilterRequest.leadSourceIds.includes(filter.value)) {
                        newFilterRequest.leadSourceIds.push(filter.value);
                    }
                    break;
                case 'courseType':
                    if (!newFilterRequest.courseTypeIds) newFilterRequest.courseTypeIds = [];
                    if (!newFilterRequest.courseTypeIds.includes(filter.value)) {
                        newFilterRequest.courseTypeIds.push(filter.value);
                    }
                    break;
                case 'board':
                    if (!newFilterRequest.boardIds) newFilterRequest.boardIds = [];
                    if (!newFilterRequest.boardIds.includes(filter.value)) {
                        newFilterRequest.boardIds.push(filter.value);
                    }
                    break;
                // Note: grade filter is handled by the base gradeId
                default:
                    break;
            }
        });
        setFilterRequest(newFilterRequest);
    }, [activeFilters, appliedFilters, id]);

    // ── card click handler - toggle filters on/off ──
    const handleCardClick = (card) => {
        setActiveFilters(prev => {
            // Check if this filter is already active
            const existingIndex = prev.findIndex(f => f.type === card.type && f.value === card.value);

            if (existingIndex !== -1) {
                // Remove the filter (toggle off)
                const newFilters = [...prev];
                newFilters.splice(existingIndex, 1);
                return newFilters;
            } else {
                // Add the filter (toggle on)
                // First remove any existing filter of the same type (e.g., if clicking a different board)
                const filteredByType = prev.filter(f => f.type !== card.type);
                return [...filteredByType, card];
            }
        });
        // reset pagination and selection when filters change
        setTablePage(0);
        setTableSize(10); // Reset to default page size
        setSelectedRows(new Set());
        setAutoSelectCount('');
    };

    // ── remove specific filter ──
    const handleRemoveFilter = (filterType, filterValue) => {
        setActiveFilters(prev => prev.filter(f => !(f.type === filterType && f.value === filterValue)));

        // Also update appliedFilters to match
        setAppliedFilters(prev => {
            const updated = { ...prev };
            switch (filterType) {
                case 'leadSource':
                    updated.leadSourceIds = (updated.leadSourceIds || []).filter(id => id !== filterValue);
                    break;
                case 'leadStatus':
                    updated.statusIds = (updated.statusIds || []).filter(id => id !== filterValue);
                    break;
                case 'board':
                    updated.boardIds = (updated.boardIds || []).filter(id => id !== filterValue);
                    break;
                case 'grade':
                    updated.gradeIds = (updated.gradeIds || []).filter(id => id !== filterValue);
                    break;
                case 'course':
                    updated.courseIds = (updated.courseIds || []).filter(id => id !== filterValue);
                    break;
                case 'courseType':
                    updated.courseTypeIds = (updated.courseTypeIds || []).filter(id => id !== filterValue);
                    break;
                case 'department':
                    updated.departmentIds = (updated.departmentIds || []).filter(id => id !== filterValue);
                    break;
                case 'assignedUser':
                    updated.assignedUserIds = (updated.assignedUserIds || []).filter(id => id !== filterValue);
                    break;
                case 'allotted':
                case 'unallotted':
                    updated.allotted = null;
                    break;
                case 'availed':
                case 'unavailed':
                    updated.availed = null;
                    break;
                case 'multiSource':
                case 'singleSource':
                    updated.multiSource = null;
                    break;
                case 'search':
                    updated.search = '';
                    break;
                case 'dateRange':
                    updated.startDate = '';
                    updated.endDate = '';
                    break;
                case 'updatedDateRange':
                    updated.updatedFrom = '';
                    updated.updatedTo = '';
                    break;
                case 'availedDateRange':
                    updated.availedFrom = '';
                    updated.availedTo = '';
                    break;
                default:
                    break;
            }
            return updated;
        });

        setTablePage(0);
        setTableSize(10); // Reset to default page size
        setSelectedRows(new Set());
        setAutoSelectCount('');
    };

    // ── clear all filters ──
    const handleClearAllFilters = () => {
        setActiveFilters([]);
        setAppliedFilters(DEFAULT_LEAD_FILTERS);
        setTablePage(0);
        setTableSize(10); // Reset to default page size
        setSelectedRows(new Set());
        setAutoSelectCount('');
    };

    // ── get current filter label for display ──
    const getFilterLabel = () => {
        if (activeFilters.length === 0) return 'All Leads';
        if (activeFilters.length === 1) return activeFilters[0].label;
        return `Filtered (${activeFilters.length})`;
    };

    // ── row selection handlers ──
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

    // ── quick select handler ──
    const handleAutoSelectCount = (e) => {
        const val = e.target.value;
        setAutoSelectCount(val);
        const count = parseInt(val, 10);
        if (!isNaN(count) && count > 0) {
            if (count <= tableData.length) {
                // Data already loaded — select immediately and sync page size
                const topIds = tableData.slice(0, count).map(lead => {
                    const rowId = typeof lead.id === 'object' ? lead.id?.id : lead.id;
                    const rowLeadId = typeof lead.leadId === 'object' ? lead.leadId?.id : lead.leadId;
                    return rowId || rowLeadId;
                });
                setSelectedRows(new Set(topIds));
                setTableSize(count);
                setTablePage(0);
            } else {
                // Need more data — resize page, store pending count, fetch will apply selection
                pendingAutoSelectRef.current = count;
                setTablePage(0);
                setTableSize(count);
            }
        } else {
            // Clear selection and reset page size to default
            setSelectedRows(new Set());
            setTableSize(10); // Reset to default page size
            setTablePage(0);
        }
    };

    // ── convert drawer filters to activeFilters format ──
    const convertDrawerFiltersToActiveFilters = (drawerFilters) => {
        const newActiveFilters = [];

        // Add search filter if present
        if (drawerFilters.search) {
            newActiveFilters.push({
                type: 'search',
                value: drawerFilters.search,
                label: `Search: ${drawerFilters.search}`
            });
        }

        // Convert lead source IDs
        if (drawerFilters.leadSourceIds && drawerFilters.leadSourceIds.length > 0) {
            drawerFilters.leadSourceIds.forEach(sourceId => {
                const source = lookups.sources.find(s => s.id === sourceId);
                if (source) {
                    newActiveFilters.push({
                        type: 'leadSource',
                        value: sourceId,
                        label: source.name || source.code || `Source ${sourceId}`
                    });
                }
            });
        }

        // Convert status IDs
        if (drawerFilters.statusIds && drawerFilters.statusIds.length > 0) {
            drawerFilters.statusIds.forEach(statusId => {
                const status = lookups.statuses.find(s => s.id === statusId);
                if (status) {
                    newActiveFilters.push({
                        type: 'leadStatus',
                        value: statusId,
                        label: status.name || status.code || `Status ${statusId}`
                    });
                }
            });
        }

        // Convert board IDs
        if (drawerFilters.boardIds && drawerFilters.boardIds.length > 0) {
            drawerFilters.boardIds.forEach(boardId => {
                const board = lookups.boards.find(b => b.id === boardId);
                if (board) {
                    newActiveFilters.push({
                        type: 'board',
                        value: boardId,
                        label: board.name || board.code || `Board ${boardId}`
                    });
                }
            });
        }

        // Convert grade IDs
        if (drawerFilters.gradeIds && drawerFilters.gradeIds.length > 0) {
            drawerFilters.gradeIds.forEach(gradeId => {
                const grade = lookups.grades.find(g => g.id === gradeId);
                if (grade) {
                    newActiveFilters.push({
                        type: 'grade',
                        value: gradeId,
                        label: grade.name || grade.code || `Grade ${gradeId}`
                    });
                }
            });
        }

        // Convert course type IDs
        if (drawerFilters.courseTypeIds && drawerFilters.courseTypeIds.length > 0) {
            drawerFilters.courseTypeIds.forEach(courseTypeId => {
                const courseType = lookups.courseTypes.find(c => c.id === courseTypeId);
                if (courseType) {
                    newActiveFilters.push({
                        type: 'courseType',
                        value: courseTypeId,
                        label: courseType.name || courseType.code || `Course Type ${courseTypeId}`
                    });
                }
            });
        }

        // Convert course IDs
        if (drawerFilters.courseIds && drawerFilters.courseIds.length > 0) {
            drawerFilters.courseIds.forEach(courseId => {
                const course = lookups.courses.find(c => c.id === courseId);
                if (course) {
                    newActiveFilters.push({
                        type: 'course',
                        value: courseId,
                        label: course.courseName || course.name || `Course ${courseId}`
                    });
                }
            });
        }

        // Convert department IDs
        if (drawerFilters.departmentIds && drawerFilters.departmentIds.length > 0) {
            drawerFilters.departmentIds.forEach(deptId => {
                const dept = lookups.departments.find(d => d.id === deptId);
                if (dept) {
                    newActiveFilters.push({
                        type: 'department',
                        value: deptId,
                        label: dept.name || dept.code || `Department ${deptId}`
                    });
                }
            });
        }

        // Convert assigned user IDs
        if (drawerFilters.assignedUserIds && drawerFilters.assignedUserIds.length > 0) {
            drawerFilters.assignedUserIds.forEach(userId => {
                const user = lookups.users.find(u => u.id === userId);
                if (user) {
                    newActiveFilters.push({
                        type: 'assignedUser',
                        value: userId,
                        label: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || `User ${userId}`
                    });
                }
            });
        }

        // Convert allotted status
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

        // Convert availed status
        if (drawerFilters.availed === true) {
            newActiveFilters.push({
                type: 'availed',
                value: true,
                label: 'Availed'
            });
        } else if (drawerFilters.availed === false) {
            newActiveFilters.push({
                type: 'unavailed',
                value: false,
                label: 'Unavailed'
            });
        }

        // Convert multi-source status
        if (drawerFilters.multiSource === true) {
            newActiveFilters.push({
                type: 'multiSource',
                value: true,
                label: 'Multi-Source Only'
            });
        } else if (drawerFilters.multiSource === false) {
            newActiveFilters.push({
                type: 'singleSource',
                value: false,
                label: 'Single Source'
            });
        }

        // Convert date ranges
        if (drawerFilters.startDate || drawerFilters.endDate) {
            newActiveFilters.push({
                type: 'dateRange',
                value: { start: drawerFilters.startDate, end: drawerFilters.endDate },
                label: `Created: ${drawerFilters.startDate || '...'} to ${drawerFilters.endDate || '...'}`
            });
        }

        if (drawerFilters.updatedFrom || drawerFilters.updatedTo) {
            newActiveFilters.push({
                type: 'updatedDateRange',
                value: { start: drawerFilters.updatedFrom, end: drawerFilters.updatedTo },
                label: `Updated: ${drawerFilters.updatedFrom || '...'} to ${drawerFilters.updatedTo || '...'}`
            });
        }

        if (drawerFilters.availedFrom || drawerFilters.availedTo) {
            newActiveFilters.push({
                type: 'availedDateRange',
                value: { start: drawerFilters.availedFrom, end: drawerFilters.availedTo },
                label: `Availed: ${drawerFilters.availedFrom || '...'} to ${drawerFilters.availedTo || '...'}`
            });
        }

        return newActiveFilters;
    };

    // ── handle drawer filter apply ──
    const handleDrawerApply = (drawerFilters) => {
        // Set the applied filters from drawer with gradeIds (always set to current grade)
        const filtersWithGrade = {
            ...drawerFilters,
            gradeIds: id ? [id] : [] // Always set to current grade, user cannot change it
        };
        setAppliedFilters(filtersWithGrade);

        // Convert drawer filters to activeFilters format for display
        const newActiveFilters = convertDrawerFiltersToActiveFilters(drawerFilters);

        // Replace all activeFilters with drawer filters (drawer takes precedence)
        setActiveFilters(newActiveFilters);
        setTablePage(0);
        setTableSize(10); // Reset to default page size
        setSelectedRows(new Set());
        setAutoSelectCount('');
        setIsFilterDrawerOpen(false);
    };

    // ── remark modal handlers ──
    const openRemarkModal = (lead) => { setSelectedLeadForRemark(lead); setIsRemarkModalOpen(true); };
    const closeRemarkModal = () => { setIsRemarkModalOpen(false); setSelectedLeadForRemark(null); };

    // ── lead table sort handler ──
    const handleLeadSort = (columnKey, direction) => {
        const fieldMap = {
            leadCode: 'leadCode',
            lead: 'fullName',
            interestedCourses: 'interestedCourses',
            source: 'source.name',
            currentStatus: 'currentStatus',
            assignedTo: 'assignedTo',
            nextFollowUpDate: 'nextFollowUpDate',
            createdBy: 'createdAt',
        };
        setTableSortBy(fieldMap[columnKey] || columnKey);
        setTableSortDir(direction);
        setTablePage(0);
    };

    const goBack = () => navigate(-1);

    // ── download Excel function ──
    const downloadExcel = async () => {
        try {
            // Fetch all leads with current filters applied
            const allLeadsData = await fetchLeadsForCard(activeFilters, id, 0, 10000, tableSortBy, tableSortDir, filterRequest);

            // Flatten the table data for Excel export
            const excelData = allLeadsData.content.map((lead, index) => {
                const rowId = typeof lead.id === 'object' ? lead.id?.id : lead.id;
                const rowLeadId = typeof lead.leadId === 'object' ? lead.leadId?.id : lead.leadId;
                const idToUse = rowId || rowLeadId;

                return {
                    'S.No': index + 1,
                    'Lead Code': typeof lead.leadCode === 'object' ? lead.leadCode?.code || lead.leadCode?.name || 'N/A' : lead.leadCode || 'N/A',
                    'Lead Name': typeof lead.fullName === 'object' ? lead.fullName?.name || lead.fullName?.firstName || 'N/A' : lead.fullName || 'N/A',
                    'Phone Number': lead.phoneNumber || 'N/A',
                    'Email': lead.email || 'N/A',
                    'Course': (() => { const c = lead.interestedCourses?.[0]; return (c && typeof c === 'object') ? (c.courseName || c.name || 'N/A') : lead.course?.courseName || 'N/A'; })(),
                    'Source': Array.isArray(lead.leadSources) && lead.leadSources.length > 0
                        ? lead.leadSources.map(s => s?.name || s?.code || 'N/A').join(', ')
                        : lead.sourceDetails || 'N/A',
                    'Status': typeof lead.currentStatus === 'object' ? lead.currentStatus?.name || lead.currentStatus?.code || 'N/A' : lead.currentStatus || 'N/A',
                    'Counselor': typeof lead.assignedTo === 'object' ? `${lead.assignedTo.firstName || ''} ${lead.assignedTo.lastName || ''}`.trim() || 'Not Allotted' : lead.assignedTo || 'Not Allotted',
                    'Follow-up Date': lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString() : 'None',
                    'Created By': typeof lead.createdBy === 'object' ? `${lead.createdBy.firstName || ''} ${lead.createdBy.lastName || ''}`.trim() || 'N/A' : lead.createdBy || 'N/A',
                    'Created Date': lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A',
                    'Remarks': lead.remarks || 'N/A',
                    'City': typeof lead.city === 'object' ? lead.city?.name || '' : lead.city || 'N/A',
                    'State': typeof lead.state === 'object' ? lead.state?.name || '' : lead.state || 'N/A',
                    'Country': typeof lead.country === 'object' ? lead.country?.name || '' : lead.country || 'N/A'
                };
            });

            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(excelData);

            // Create workbook
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const filename = `grade_leads_${timestamp}.xlsx`;

            // Download the file
            XLSX.writeFile(workbook, filename);

            showToast('Excel file downloaded successfully');
        } catch (error) {
            console.error('Error downloading Excel:', error);
            showToast('Failed to download Excel file', 'error');
        }
    };

    return (
        <>
            <div className="block p-4 sm:p-6" id="page-grade-detail">

                {/* ── Page Header ── */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                            onClick={goBack}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">Grade Details</h1>
                            <p className="text-sm text-gray-500 mt-1">View comprehensive details for this grade</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {/* Download Excel */}
                        <button
                            className="flex items-center gap-1.5"
                            style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '4px 10px', fontSize: '12px', borderRadius: '4px', cursor: 'pointer', boxShadow: 'none' }}
                            onClick={downloadExcel}
                            disabled={tableData.length === 0}
                        >
                            <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                            </svg>
                            Download
                        </button>
                    </div>
                </div>

                {/* ── Loading State ── */}
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                        <span className="ml-2 text-gray-600 font-medium">Loading details...</span>
                    </div>
                )}

                {/* ── Error State ── */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex justify-between items-center shadow-sm mb-6">
                        <span>{error}</span>
                        <button onClick={goBack} className="text-sm font-semibold underline hover:text-red-800">
                            Go Back
                        </button>
                    </div>
                )}

                {/* ── Detail Card (TOP) ── */}
                {!loading && !error && details && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row items-start gap-5 mb-8 pb-6 border-b border-gray-100">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0">
                                {details?.gradeName ? details.gradeName.substring(0, 2).toUpperCase() : 'GR'}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{details?.gradeName || 'N/A'}</h2>
                                <div className="flex flex-wrap gap-2 items-center">
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${details?.status === 'ACTIVE'
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : 'bg-red-50 text-red-700 border-red-200'
                                        }`}>
                                        {details?.status || 'UNKNOWN'}
                                    </span>
                                    <span className="bg-gray-50 text-gray-500 text-[10px] font-medium px-2.5 py-1 rounded-full border border-gray-200">
                                        ID: {details?.id || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Grade Code</div>
                                <div className="text-sm font-semibold text-gray-800">{details?.gradeCode || 'N/A'}</div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Display Order</div>
                                <div className="text-sm font-semibold text-gray-800">{details?.displayOrder ?? 'N/A'}</div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Creation Date</div>
                                <div className="text-sm font-semibold text-gray-800">
                                    {details?.createdAt ? new Date(details.createdAt).toLocaleString() : 'N/A'}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Last Updated</div>
                                <div className="text-sm font-semibold text-gray-800">
                                    {details?.updatedAt ? new Date(details.updatedAt).toLocaleString() : 'N/A'}
                                </div>
                            </div>

                            <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Description</div>
                                <div className="text-sm font-semibold text-gray-800 leading-relaxed whitespace-pre-wrap">
                                    {details?.description || 'No description available.'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Dashboard Cards (BOTTOM) ── */}
                {!loading && !error && (
                    <div className="mb-8">
                        {/* Allotted, Availed, Unallotted Cards Row */}
                        <div className="flex flex-wrap gap-4 mb-8">
                            <AllottedCard
                                onCardClick={handleCardClick}
                                activeFilters={activeFilters}
                                filterRequest={filterRequest}
                                gradeId={id}
                            />

                            <UnallottedCard
                                onCardClick={handleCardClick}
                                activeFilters={activeFilters}
                                filterRequest={filterRequest}
                                gradeId={id}
                            />
                            <AvailedCard
                                onCardClick={handleCardClick}
                                activeFilters={activeFilters}
                                filterRequest={filterRequest}
                                gradeId={id}
                            />
                        </div>

                        {/* User Allocation & Workload Analytics Cards */}
                        <UserAllocationSummaryCards
                            gradeId={id}
                            filterRequest={filterRequest}
                            activeFilters={activeFilters}
                            scopeTitle={details?.gradeName || 'Grade'}
                            activeWorkingOnly={userAllocationWorkingOnly}
                            onWorkingOnlyChange={(val) => setUserAllocationWorkingOnly(val)}
                            onCardClick={handleCardClick}
                        />

                        <LeadCards
                            onCardClick={handleCardClick}
                            activeFilters={activeFilters}
                            gradeId={id}
                        />
                        <LeadSource
                            data={dashData.leadSource}
                            onCardClick={handleCardClick}
                            activeFilters={activeFilters}
                            gradeId={id}
                        />
                        <CategorywiseCard
                            data={dashData.courseType}
                            onCardClick={handleCardClick}
                            activeFilters={activeFilters}
                            gradeId={id}
                        />
                        <BoardWiseCard
                            data={dashData.board}
                            onCardClick={handleCardClick}
                            activeFilters={activeFilters}
                            gradeId={id}
                        />
                    </div>
                )}

                {/* ── Course-wise & User-wise Lead Status Analytics Section ── */}
                <CourseUserStatusAnalyticsSection
                    contextType="grade"
                    contextId={id}
                    activeFilters={activeFilters}
                />

                {/* ── Filtered Lead Table ── */}
                {!loading && !error && (
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="w-1 h-5 bg-indigo-500 rounded-full" />
                                <h3 className="text-base font-bold text-gray-900">{getFilterLabel()}</h3>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {tableTotalElements} records
                                </span>

                                {/* Active Filters Display */}
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
                                                    title="Remove this filter"
                                                >
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                        <line x1="18" y1="6" x2="6" y2="18" />
                                                        <line x1="6" y1="6" x2="18" y2="18" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                        {activeFilters.length > 1 && (
                                            <button
                                                onClick={handleClearAllFilters}
                                                className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded-full border border-red-200 transition-all"
                                            >
                                                Clear All
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsFilterDrawerOpen(true)}
                                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm"
                                    style={{
                                        backgroundColor: '#9333ea',
                                        color: '#fff',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <FiFilter size={13} />
                                    Advanced Filters
                                </button>
                                {hasPermission('LEAD_ASSIGN') && (
                                    <>
                                        {/* Quick Auto-select input group */}
                                        <div className="flex items-center bg-slate-50/90 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-600">
                                            <span className="font-semibold text-slate-500 mr-2 select-none">Quick Select:</span>
                                            <input
                                                type="number"
                                                min="1"
                                                max={tableData.length}
                                                value={autoSelectCount}
                                                onChange={handleAutoSelectCount}
                                                onBlur={() => {
                                                    if (!autoSelectCount) {
                                                        setTableSize(10);
                                                        setTablePage(0);
                                                    }
                                                }}
                                                onWheel={(e) => e.target.blur()}
                                                placeholder="Qty"
                                                className="w-12 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-center font-bold text-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                title="Number of leads to auto-select from top"
                                            />
                                        </div>

                                        {/* Selected Count Badge */}
                                        {selectedRows.size > 0 && (
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-lg text-xs font-bold text-emerald-700">
                                                <FiCheckSquare size={13} className="text-emerald-600" />
                                                <span>{selectedRows.size} Selected</span>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => setIsAssignModalOpen(true)}
                                            disabled={selectedRows.size === 0}
                                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm"
                                            style={{
                                                backgroundColor: selectedRows.size === 0 ? 'var(--gray-200, #e5e7eb)' : '#4f46e5',
                                                color: selectedRows.size === 0 ? 'var(--gray-400, #9ca3af)' : '#fff',
                                                cursor: selectedRows.size === 0 ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            <FiUserPlus size={13} />
                                            Allot Leads{selectedRows.size > 0 ? ` (${selectedRows.size})` : ''}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {tableLoading ? (
                            <div className="flex justify-center items-center h-40 bg-white rounded-xl border border-gray-200">
                                <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-500" />
                                <span className="ml-2 text-sm text-gray-500">Loading data...</span>
                            </div>
                        ) : (
                            <div className="card">
                                <ReusableTable
                                    columns={buildLeadColumns(tablePage, tableSize, selectedRows, handleToggleRow, handleToggleAll, tableData, hasPermission)}
                                    data={tableData}
                                    isServerSide={true}
                                    totalElements={tableTotalElements}
                                    totalPages={tableTotalPages}
                                    currentPage={tablePage + 1}
                                    rowsPerPage={tableSize}
                                    onPageChange={(newPage) => setTablePage(newPage - 1)}
                                    onRowsPerPageChange={(newSize) => {
                                        setTableSize(newSize);
                                        setTablePage(0);
                                        setAutoSelectCount('');
                                        // If user manually changes page size and autoSelectCount is empty, keep their selection
                                        // If autoSelectCount was set, it's already cleared above
                                    }}
                                    sortBy={tableSortBy}
                                    sortDirection={tableSortDir}
                                    onSort={handleLeadSort}
                                    actions={(row) => {
                                        const safeRow = {
                                            ...row,
                                            id: typeof row.id === 'object' ? row.id?.id : row.id,
                                            leadId: typeof row.leadId === 'object' ? row.leadId?.id : row.leadId,
                                        };
                                        return (
                                            <div className="flex justify-center items-center gap-3">
                                                <button
                                                    className="text-blue-500 hover:text-blue-700 transition bg-transparent border-none cursor-pointer"
                                                    title="Remark"
                                                    onClick={() => openRemarkModal(safeRow)}
                                                >
                                                    <FiMessageSquare size={18} />
                                                </button>
                                                <button
                                                    className="text-gray-500 hover:text-gray-700 transition bg-transparent border-none cursor-pointer"
                                                    title="View"
                                                    onClick={() => navTo(`lead-detail/${safeRow?.id ?? safeRow?.leadId}`)}
                                                >
                                                    <FiEye size={18} />
                                                </button>
                                            </div>
                                        );
                                    }}
                                    emptyMessage={`No leads found for ${activeFilters.length === 1 ? `"${activeFilters[0].label}"` : 'selected filters'}`}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* ── User Allocation & Workload Table (Always Open Below All Lead Table) ── */}
                <div id="user-allocation-table-section" className="mt-8">
                    <UserAllocationTable
                        gradeId={id}
                        filterRequest={filterRequest}
                        activeFilters={activeFilters}
                        scopeTitle={details?.gradeName || 'Grade'}
                        workingOnly={userAllocationWorkingOnly}
                        onTabChange={(val) => setUserAllocationWorkingOnly(val)}
                    />
                </div>

                {/* ── Hint when no card selected — removed (default all-leads table always visible) ── */}
            </div>

            {/* ── Remark Modal ── */}
            <LeadRemarkModal
                isOpen={isRemarkModalOpen}
                onClose={closeRemarkModal}
                lead={selectedLeadForRemark}
                followUpId={selectedLeadForRemark?.followUpId || selectedLeadForRemark?.nextFollowUpId || selectedLeadForRemark?.followupId}
                onSave={() => {
                    closeRemarkModal();
                    setTablePage((p) => p);
                }}
            />

            {/* ── Assign / Distribute Modal ── */}
            <AssignLeadModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                selectedLeadIds={Array.from(selectedRows)}
                onAssign={() => {
                    setSelectedRows(new Set());
                    setAutoSelectCount('');
                    setIsAssignModalOpen(false);
                    setTablePage((p) => p);
                }}
                filters={{
                    gradeIds: id ? [id] : [],
                    ...(activeFilters.some(f => f.type === 'leadStatus') && {
                        leadStatusIds: activeFilters.filter(f => f.type === 'leadStatus').map(f => f.value)
                    }),
                    ...(activeFilters.some(f => f.type === 'leadSource') && {
                        leadSourceIds: activeFilters.filter(f => f.type === 'leadSource').map(f => f.value)
                    }),
                    ...(activeFilters.some(f => f.type === 'courseType') && {
                        courseTypeIds: activeFilters.filter(f => f.type === 'courseType').map(f => f.value)
                    }),
                    ...(activeFilters.some(f => f.type === 'board') && {
                        boardIds: activeFilters.filter(f => f.type === 'board').map(f => f.value)
                    }),
                    ...(activeFilters.some(f => f.type === 'unallotted') && {
                        allotted: false
                    }),
                    ...(activeFilters.some(f => f.type === 'availed') && {
                        availed: true
                    }),
                    ...(activeFilters.some(f => f.type === 'allotted') && {
                        allotted: true
                    }),
                }}
                showToast={(msg, type) => console.log(`[${type}]`, msg)}
            />

            {/* ── Lead Filter Drawer ── */}
            <LeadFilterDrawer
                isOpen={isFilterDrawerOpen}
                onClose={() => setIsFilterDrawerOpen(false)}
                appliedFilters={appliedFilters}
                onApply={handleDrawerApply}
                lookups={{
                    ...lookups,
                    grades: id && details ? [{ id: id, name: details.gradeName, code: details.gradeCode }] : [] // Show only current grade
                }}
            />
        </>
    );
};

export default GradesDetails;

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEye, FiMessageSquare, FiUserPlus, FiFilter, FiCheckSquare } from 'react-icons/fi';
import { useAppContext } from '../AppContext';
import { usePermissions } from '../PermissionContext';
import { getLeadStatusById } from '../Services/leadStatus/leadStatusService';
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
} from '../Services/drop-down/dropDownService';
import { DEFAULT_LEAD_FILTERS } from '../Services/lead/leadFilterModel';
import axiosInstance from '../axiosInstance/axios';
import ApiRoutes from '../apiRoutes/allApiRoutes';
import LeadSource from '../component/reusable/DashBoards/leadSource';
import CategorywiseCard from '../component/reusable/DashBoards/categorywiseCard';
import BoardWiseCard from '../component/reusable/DashBoards/BoardWiseCard';
import GradWiseCard from '../component/reusable/DashBoards/gradWiseCard';
import AllottedCard from '../component/reusable/DashBoards/allottedCard';
import AvailedCard from '../component/reusable/DashBoards/availedCard';
import UnallottedCard from '../component/reusable/DashBoards/UnallottedCard';
import UserAllocationSummaryCards from '../component/reusable/segregation/UserAllocationSummaryCards';
import UserAllocationTable from '../component/reusable/segregation/UserAllocationTable';
import UserAllocationListModal from '../component/reusable/segregation/UserAllocationListModal';
import ReusableTable from '../component/reusable/table';
import LeadRemarkModal from '../component/reusable/Leads/LeadRemarkModal';
import AssignLeadModal from '../component/reusable/Leads/AssignLeadModal';
import LeadFilterDrawer from '../component/reusable/Leads/LeadFilterDrawer';
import {
    renderLeadInfoCell,
    renderCourseCell,
    renderSourceCell,
    renderStatusCell,
    renderCounselorCell,
    renderFollowUpCell,
    renderLeadDateCell,
} from '../component/reusable/leadTableHelpers';
import * as XLSX from 'xlsx';

// ─── Lead table columns ───────────────────────────────────────────────────────
const buildLeadColumns = (page, size, selectedRows, onToggleRow, onToggleAll, currentData, hasPermission, onLeadClick, showToast) => [
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
        render: (value, row) => renderLeadInfoCell(row, onLeadClick, showToast),
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

// ─── Helper: fetch leads for selected card (server-side) ─────────────────────
const fetchLeadsForCard = async (activeFilters, statusId, page, size, sortBy, sortDirection) => {
    if (!statusId) return { content: [], totalElements: 0, totalPages: 0 };

    const params = {
        statusId,         // always filter by this lead status
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

        // Convert leadSourceIds → leadSourceId or leadSourceIds
        if (converted.leadSourceIds?.length === 1) {
            converted.leadSourceId = converted.leadSourceIds[0];
            delete converted.leadSourceIds;
        }

        return converted;
    };

    // Build filterRequest from activeFilters
    const filterRequest = {};
    activeFilters.forEach(filter => {
        switch (filter.type) {
            case 'leadStatus':
                if (!filterRequest.leadStatusIds) filterRequest.leadStatusIds = [];
                if (!filterRequest.leadStatusIds.includes(filter.value)) {
                    filterRequest.leadStatusIds.push(filter.value);
                }
                break;
            case 'leadSource':
                if (!filterRequest.leadSourceIds) filterRequest.leadSourceIds = [];
                if (!filterRequest.leadSourceIds.includes(filter.value)) {
                    filterRequest.leadSourceIds.push(filter.value);
                }
                break;
            case 'courseType':
                if (!filterRequest.courseTypeIds) filterRequest.courseTypeIds = [];
                if (!filterRequest.courseTypeIds.includes(filter.value)) {
                    filterRequest.courseTypeIds.push(filter.value);
                }
                break;
            case 'board':
                if (!filterRequest.boardIds) filterRequest.boardIds = [];
                if (!filterRequest.boardIds.includes(filter.value)) {
                    filterRequest.boardIds.push(filter.value);
                }
                break;
            case 'grade':
                if (!filterRequest.gradeIds) filterRequest.gradeIds = [];
                if (!filterRequest.gradeIds.includes(filter.value)) {
                    filterRequest.gradeIds.push(filter.value);
                }
                break;
            case 'allotted': params.isAllotted = true; break;
            case 'availed': params.isAvailed = true; break;
            case 'unallotted': params.isUnallotted = true; break;
            default: break;
        }
    });

    // Apply smart conversion to filterRequest
    Object.assign(params, convertFilterRequest(filterRequest));

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
const LeadStatusDetails = () => {
    const { navTo, showToast } = useAppContext();
    const { hasPermission } = usePermissions();
    const navigate = useNavigate();
    const { id } = useParams();

    // detail state
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // dashboard card data
    const [dashData, setDashData] = useState({ leadSource: [], courseType: [], board: [], grade: [] });

    // filter / table state - support multiple active filters
    const [activeFilters, setActiveFilters] = useState([]); // Array of { type, value, label }
    const [filterRequest, setFilterRequest] = useState({});
    const [tableData, setTableData] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);

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
    const [userAllocationWorkingOnly, setUserAllocationWorkingOnly] = useState(false);
    const [autoSelectCount, setAutoSelectCount] = useState('');
    const pendingAutoSelectRef = useRef(null);

    // lead filter drawer state
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState(() => ({
        ...DEFAULT_LEAD_FILTERS,
        leadStatusIds: id ? [id] : [] // Always set to current lead status
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

    // ── fetch lead status details ──
    useEffect(() => {
        if (!id) return;
        const run = async () => {
            setLoading(true);
            try {
                const res = await getLeadStatusById(id);
                if (res?.success) {
                    setDetails(res.data);
                } else {
                    setError(res?.message || 'Failed to load lead status details');
                }
            } catch (err) {
                console.error('Failed to fetch lead status details', err);
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
            const params = { statusId: appliedFilters.leadStatusIds?.[0] || id };
            try {
                const [sourceRes, courseTypeRes, boardRes, gradeRes] = await Promise.all([
                    getLeadSourceBreakdown(params).catch(() => null),
                    getCourseTypesBreakdown(params).catch(() => null),
                    getBoardBreakdown(params).catch(() => null),
                    getGradeBreakdown(params).catch(() => null),
                ]);
                const toArr = (r) => r?.data?.data || r?.data || [];
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
    }, [id, appliedFilters.leadStatusIds]);

    // ── fetch leads when filters change or pagination/sort changes ──
    useEffect(() => {
        if (!id) return;
        setTableLoading(true);
        fetchLeadsForCard(activeFilters, appliedFilters.leadStatusIds?.[0] || id, tablePage, tableSize, tableSortBy, tableSortDir)
            .then(({ content, totalElements, totalPages }) => {
                setTableData(content);
                setTableTotalElements(totalElements);
                setTableTotalPages(totalPages);
                setTableLoading(false);
            });
    }, [activeFilters, appliedFilters.leadStatusIds, id, tablePage, tableSize, tableSortBy, tableSortDir]);

    // ── fetch dropdown lookups for filter drawer ──
    useEffect(() => {
        let isCancelled = false;
        const fetchLookups = async () => {
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
                console.error('Failed to fetch filter drawer lookups', err);
            }
        };
        fetchLookups();
        return () => { isCancelled = true; };
    }, []);

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
        setSelectedRows(new Set());
    };

    // ── clear all filters ──
    const handleClearAllFilters = () => {
        setActiveFilters([]);
        setAppliedFilters(prev => ({
            ...DEFAULT_LEAD_FILTERS,
            leadStatusIds: [id] // Always keep current page's status
        }));
        setTablePage(0);
        setSelectedRows(new Set());
    };

    // ── drawer apply handler ──
    const handleDrawerApply = (newFilters) => {
        setAppliedFilters(newFilters);

        // Convert drawer filters to activeFilters format for card clicks
        const newActiveFilters = [];

        if (newFilters.leadStatusIds?.length > 0) {
            newFilters.leadStatusIds.forEach(statusId => {
                const status = lookups.statuses.find(s => s.id === statusId);
                if (status) {
                    newActiveFilters.push({ type: 'leadStatus', value: statusId, label: status.name || status.code });
                }
            });
        }

        if (newFilters.leadSourceIds?.length > 0) {
            newFilters.leadSourceIds.forEach(sourceId => {
                const source = lookups.sources.find(s => s.id === sourceId);
                if (source) {
                    newActiveFilters.push({ type: 'leadSource', value: sourceId, label: source.name || source.code });
                }
            });
        }

        if (newFilters.courseTypeIds?.length > 0) {
            newFilters.courseTypeIds.forEach(courseTypeId => {
                const courseType = lookups.courseTypes.find(c => c.id === courseTypeId);
                if (courseType) {
                    newActiveFilters.push({ type: 'courseType', value: courseTypeId, label: courseType.name });
                }
            });
        }

        if (newFilters.boardIds?.length > 0) {
            newFilters.boardIds.forEach(boardId => {
                const board = lookups.boards.find(b => b.id === boardId);
                if (board) {
                    newActiveFilters.push({ type: 'board', value: boardId, label: board.name });
                }
            });
        }

        if (newFilters.gradeIds?.length > 0) {
            newFilters.gradeIds.forEach(gradeId => {
                const grade = lookups.grades.find(g => g.id === gradeId);
                if (grade) {
                    newActiveFilters.push({ type: 'grade', value: gradeId, label: grade.name });
                }
            });
        }

        if (newFilters.isAllotted) {
            newActiveFilters.push({ type: 'allotted', value: true, label: 'Allotted' });
        }

        if (newFilters.isAvailed) {
            newActiveFilters.push({ type: 'availed', value: true, label: 'Availed' });
        }

        if (newFilters.isUnallotted) {
            newActiveFilters.push({ type: 'unallotted', value: true, label: 'Unallotted' });
        }

        setActiveFilters(newActiveFilters);
        setTablePage(0);
        setTableSize(10);
        setSelectedRows(new Set());
        setAutoSelectCount('');
        setIsFilterDrawerOpen(false);
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
                // Adjust page size to accommodate selection if needed
                if (count > tableSize) {
                    setTableSize(count);
                }
            }
        } else {
            setSelectedRows(new Set());
        }
    };

    // ── update filterRequest when activeFilters change for cards ──
    useEffect(() => {
        const newFilterRequest = { statusId: appliedFilters.leadStatusIds?.[0] || id, leadStatusIds: appliedFilters.leadStatusIds || [id] };
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
                default:
                    break;
            }
        });
        setFilterRequest(newFilterRequest);
    }, [activeFilters, appliedFilters.leadStatusIds, id]);

    // ── initialize filterRequest with leadStatusIds ──
    useEffect(() => {
        if (id) {
            setFilterRequest({ statusId: id, leadStatusIds: [id] });
            setAppliedFilters(prev => ({
                ...prev,
                leadStatusIds: [id]
            }));
        }
    }, [id]);

    // ── get current filter label for display ──
    const getFilterLabel = () => {
        if (activeFilters.length === 0) return 'All Leads';
        if (activeFilters.length === 1) return activeFilters[0].label;
        return `Filtered (${activeFilters.length})`;
    };

    // ── remove specific filter (support leadStatus) ──
    const handleRemoveFilter = (filterType, filterValue) => {
        if (filterType === 'leadStatus') {
            // For lead status, we need to reset to the current page's status
            setAppliedFilters(prev => ({
                ...prev,
                leadStatusIds: [id]
            }));
        }
        setActiveFilters(prev => prev.filter(f => !(f.type === filterType && f.value === filterValue)));
        setTablePage(0);
        setSelectedRows(new Set());
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

    // ── download Excel function ──
    const downloadExcel = () => {
        try {
            // Flatten the table data for Excel export
            const excelData = tableData.map((lead, index) => {
                const rowId = typeof lead.id === 'object' ? lead.id?.id : lead.id;
                const rowLeadId = typeof lead.leadId === 'object' ? lead.leadId?.id : lead.leadId;
                const idToUse = rowId || rowLeadId;

                return {
                    'S.No': (tablePage * tableSize) + index + 1,
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
            const filename = `lead_status_leads_${timestamp}.xlsx`;

            // Download the file
            XLSX.writeFile(workbook, filename);

            showToast('Excel file downloaded successfully');
        } catch (error) {
            console.error('Error downloading Excel:', error);
            showToast('Failed to download Excel file', 'error');
        }
    };

    const goBack = () => navigate(-1);

    // ── loading / error guards ──
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <span className="ml-2 text-gray-600 font-medium">Loading details...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex justify-between items-center shadow-sm">
                    <span>{error}</span>
                    <button onClick={goBack} className="text-sm font-semibold underline hover:text-red-800">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="block p-4 sm:p-6" id="page-lead-status-detail">

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
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">Lead Status Details</h1>
                            <p className="text-sm text-gray-500 mt-1">View comprehensive details for this lead status</p>
                        </div>
                    </div>
                </div>

                {/* ── Detail Card (TOP) ── */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start gap-5 mb-8 pb-6 border-b border-gray-100">
                        <div
                            className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0"
                            style={{ backgroundColor: '#3B82F6' }}
                        >
                            {details?.name ? details.name.substring(0, 2).toUpperCase() : 'LS'}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{details?.name || 'N/A'}</h2>
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
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Name</div>
                            <div className="text-sm font-semibold text-gray-800">{details?.name || 'N/A'}</div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Code</div>
                            <div className="text-sm font-semibold text-gray-800">{details?.code || 'N/A'}</div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Active</div>
                            <div className="text-sm font-semibold text-gray-800">{details?.active ? 'Yes' : 'No'}</div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Display Order</div>
                            <div className="text-sm font-semibold text-gray-800">{details?.displayOrder ?? 'N/A'}</div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sentiment Category</div>
                            <div className="text-sm font-semibold text-gray-800">{details?.sentimentCategory || 'N/A'}</div>
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

                {/* ── Dashboard Cards (BOTTOM) ── */}
                <div className="mb-8">
                    {/* Allocation Cards in single row */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        <AllottedCard
                            onCardClick={handleCardClick}
                            activeFilters={activeFilters}
                            filterRequest={filterRequest}
                            statusId={appliedFilters.leadStatusIds?.[0] || id}
                        />
                        <UnallottedCard
                            onCardClick={handleCardClick}
                            activeFilters={activeFilters}
                            filterRequest={filterRequest}
                            statusId={appliedFilters.leadStatusIds?.[0] || id}
                        />
                        <AvailedCard
                            onCardClick={handleCardClick}
                            activeFilters={activeFilters}
                            filterRequest={filterRequest}
                            statusId={appliedFilters.leadStatusIds?.[0] || id}
                        />
                    </div>

                    {/* User Allocation & Workload Analytics Cards */}
                    <UserAllocationSummaryCards
                        leadStatusId={appliedFilters.leadStatusIds?.[0] || id}
                        filterRequest={filterRequest}
                        activeFilters={activeFilters}
                        scopeTitle={details?.name || 'Lead Status'}
                        activeWorkingOnly={userAllocationWorkingOnly}
                        onWorkingOnlyChange={(val) => setUserAllocationWorkingOnly(val)}
                        onCardClick={handleCardClick}
                    />

                    <LeadSource
                        data={dashData.leadSource}
                        onCardClick={handleCardClick}
                        activeFilters={activeFilters}
                    />
                    <CategorywiseCard
                        data={dashData.courseType}
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
                </div>

                {/* ── Filtered Lead Table ── */}
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
                                onClick={downloadExcel}
                                disabled={tableData.length === 0}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                </svg>
                                Download
                            </button>
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
                                columns={buildLeadColumns(tablePage, tableSize, selectedRows, handleToggleRow, handleToggleAll, tableData, hasPermission, navTo, showToast)}
                                data={tableData}
                                isServerSide={true}
                                totalElements={tableTotalElements}
                                totalPages={tableTotalPages}
                                currentPage={tablePage + 1}
                                rowsPerPage={tableSize}
                                onPageChange={(newPage) => setTablePage(newPage - 1)}
                                onRowsPerPageChange={(newSize) => { setTableSize(newSize); setTablePage(0); }}
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

                {/* ── User Allocation & Workload Table (Always Open Below All Lead Table) ── */}
                <div id="user-allocation-table-section" className="mt-8">
                    <UserAllocationTable
                        leadStatusId={appliedFilters.leadStatusIds?.[0] || id}
                        filterRequest={filterRequest}
                        activeFilters={activeFilters}
                        scopeTitle={details?.name || 'Lead Status'}
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
                    setIsAssignModalOpen(false);
                    setTablePage((p) => p);
                }}
                filters={{
                    leadStatusIds: appliedFilters.leadStatusIds || (id ? [id] : []),
                    ...activeFilters.reduce((acc, filter) => {
                        if (filter.type === 'leadSource') acc.leadSourceIds = [...(acc.leadSourceIds || []), filter.value];
                        if (filter.type === 'courseType') acc.courseTypeIds = [...(acc.courseTypeIds || []), filter.value];
                        if (filter.type === 'board') acc.boardIds = [...(acc.boardIds || []), filter.value];
                        if (filter.type === 'grade') acc.gradeIds = [...(acc.gradeIds || []), filter.value];
                        if (filter.type === 'allotted') acc.isAllotted = true;
                        if (filter.type === 'availed') acc.isAvailed = true;
                        if (filter.type === 'unallotted') acc.isUnallotted = true;
                        return acc;
                    }, {}),
                }}
                showToast={(msg, type) => console.log(`[${type}]`, msg)}
            />

            {/* ── User Allocation List Modal ── */}
            <UserAllocationListModal
                isOpen={isUserAllocationModalOpen}
                onClose={() => setIsUserAllocationModalOpen(false)}
                initialWorkingOnly={userAllocationInitialWorkingOnly}
                filters={{
                    leadStatusIds: appliedFilters.leadStatusIds || (id ? [id] : []),
                    ...activeFilters.reduce((acc, filter) => {
                        if (filter.type === 'leadSource') acc.leadSourceIds = [...(acc.leadSourceIds || []), filter.value];
                        if (filter.type === 'courseType') acc.courseTypeIds = [...(acc.courseTypeIds || []), filter.value];
                        if (filter.type === 'board') acc.boardIds = [...(acc.boardIds || []), filter.value];
                        if (filter.type === 'grade') acc.gradeIds = [...(acc.gradeIds || []), filter.value];
                        if (filter.type === 'allotted') acc.isAllotted = true;
                        if (filter.type === 'availed') acc.isAvailed = true;
                        if (filter.type === 'unallotted') acc.isUnallotted = true;
                        return acc;
                    }, {}),
                }}
                scopeTitle={details?.name || 'Lead Status'}
            />

            {/* ── Lead Filter Drawer ── */}
            <LeadFilterDrawer
                isOpen={isFilterDrawerOpen}
                onClose={() => setIsFilterDrawerOpen(false)}
                appliedFilters={appliedFilters}
                onApply={handleDrawerApply}
                lookups={lookups}
            />
        </>
    );
};

export default LeadStatusDetails;

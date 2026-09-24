import { useState, useMemo, useEffect, useRef } from 'react';
import { FiEye, FiEdit, FiTrash2, FiSearch, FiFilter, FiUserPlus, FiX, FiCheckSquare } from 'react-icons/fi';
import { statusConfig } from '../mockData';
import { getAllLeads, deleteLead, getLeadById, availLead } from '../Services/lead/leadService';
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
import {
  DEFAULT_LEAD_FILTERS,
  buildLeadQueryParams,
  parseFiltersFromSearchParams,
  syncFiltersToSearchParams,
  countActiveFilters,
  buildFilterChips,
  removeFilterFromState,
} from '../Services/lead/leadFilterModel';
import LeadFilterDrawer from '../component/reusable/Leads/LeadFilterDrawer';
import { useAppContext } from '../AppContext';
import { usePermissions } from '../PermissionContext';
import { canViewLeadField } from '../config/leadFieldPermissions';
import { useLocation, useSearchParams } from 'react-router-dom';
import ReusableTable from '../component/reusable/table';
import {
  renderLeadInfoCell,
  renderCourseCell,
  renderSourceCell,
  renderStatusCell,
  renderCounselorCell,
  renderFollowUpCell,
  renderLeadDateCell,
} from '../component/reusable/leadTableHelpers';
// import LeadRemarkModal from '../component/reusable/Leads/LeadRemarkModal';
import DeleteModal from "../component/reusable/deleteModel"
import AssignLeadModal from '../component/reusable/Leads/AssignLeadModal';
import LeadCards from '../component/reusable/DashBoards/leadCards';
import LeadSource from '../component/reusable/DashBoards/leadSource';
import UnallottedCard from '../component/reusable/DashBoards/UnallottedCard';
import AvailedCard from '../component/reusable/DashBoards/availedCard';
import AllottedCard from '../component/reusable/DashBoards/allottedCard';
import MultiSourceCard from '../component/reusable/DashBoards/MultiSourceCard';
import CategorywiseCard from '../component/reusable/DashBoards/categorywiseCard';
import BulkUploadModal from '../component/reusable/Leads/BulkUploadModal';
import PreviewDistributionModal from '../component/reusable/Leads/PreviewDistributionModal';
import * as XLSX from 'xlsx';

const Leads = () => {
  const { openAddLeadModal, navTo, showToast, leadRefreshTrigger } = useAppContext();
  const { canCreate, canUpdate, canDelete, canView, hasPermission } = usePermissions();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Canonical filter state
  const [filters, setFilters] = useState(() => parseFiltersFromSearchParams(searchParams, location.state));
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(() => searchParams.get('search') || '');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Dropdown lookups for drawer & chip labels
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

  // Table selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [autoSelectCount, setAutoSelectCount] = useState('');

  const handleAutoSelectCount = (e) => {
    const val = e.target.value;
    setAutoSelectCount(val);
    const count = parseInt(val, 10);
    if (!isNaN(count) && count > 0) {
      const topIds = leadsData.slice(0, count).map(lead => lead.id || lead.leadId);
      setSelectedIds(topIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      const allIds = leadsData.map(lead => lead.id || lead.leadId);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
    setSelectAll(false);
  };

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Table pagination & sorting
  const [leadsData, setLeadsData] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  const requestIdRef = useRef(0);

  // Load dropdown lookup datasets on mount
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

  // Debounced search sync
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setFilters(prev => {
        const trimmed = search.trim();
        if ((prev.search || '') === trimmed) return prev;
        const next = { ...prev, search: trimmed };
        const params = syncFiltersToSearchParams(next);
        setSearchParams(params, { replace: true });
        return next;
      });
      setPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Sync state from URL search params (or router state)
  useEffect(() => {
    const parsed = parseFiltersFromSearchParams(searchParams, location.state);
    setFilters(parsed);
    if (parsed.search !== undefined && parsed.search !== search) {
      setSearch(parsed.search || '');
      setDebouncedSearch(parsed.search || '');
    }
  }, [location.search, location.state]);

  // Single authoritative filter request object for cards, table, and export
  const filterRequest = useMemo(() => buildLeadQueryParams(filters), [filters]);
  const filterRequestKey = useMemo(() => JSON.stringify(filterRequest), [filterRequest]);
  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);
  const filterChips = useMemo(() => buildFilterChips(filters, lookups), [filters, lookups]);

  // Active criteria representation for card highlight state
  const activeCardFilters = useMemo(() => {
    const list = [];
    if (filters.allotted === false) list.push({ type: 'unallotted', value: true });
    if (filters.allotted === true) list.push({ type: 'allotted', value: true });
    if (filters.availed === true) list.push({ type: 'availed', value: true });
    if (filters.multiSource === true) list.push({ type: 'multiSource', value: true });
    (filters.statusIds || []).forEach(id => list.push({ type: 'leadStatus', value: id }));
    (filters.leadStatusHistoryIds || []).forEach(id => list.push({ type: 'leadStatusHistory', value: id }));
    (filters.leadSourceIds || []).forEach(id => list.push({ type: 'leadSource', value: id }));
    (filters.courseTypeIds || []).forEach(id => list.push({ type: 'courseType', value: id }));
    (filters.courseIds || []).forEach(id => list.push({ type: 'course', value: id }));
    (filters.boardIds || []).forEach(id => list.push({ type: 'board', value: id }));
    (filters.gradeIds || []).forEach(id => list.push({ type: 'grade', value: id }));
    (filters.assignedUserIds || []).forEach(id => list.push({ type: 'assignedUser', value: id }));
    return list;
  }, [filters]);

  const openDeleteModal = (lead) => {
    setLeadToDelete(lead);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setLeadToDelete(null);
  };

  const handleConfirmDelete = async () => {
    const leadId = leadToDelete?.id ?? leadToDelete?.leadId;
    if (!leadId) {
      showToast('Lead ID not found. Cannot delete.', 'error');
      return;
    }
    setIsDeleting(true);
    try {
      await deleteLead(leadId);
      showToast('Lead deleted successfully');
      fetchLeads();
      closeDeleteModal();
    } catch (error) {
      console.error('Delete error', error);
      showToast('Failed to delete lead', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = (cardInfo) => {
    setFilters(prev => {
      const next = { ...prev };
      if (cardInfo.type === 'allotted') {
        next.allotted = prev.allotted === true ? null : true;
      } else if (cardInfo.type === 'unallotted') {
        next.allotted = prev.allotted === false ? null : false;
      } else if (cardInfo.type === 'availed') {
        next.availed = prev.availed === true ? null : true;
      } else if (cardInfo.type === 'multiSource') {
        next.multiSource = prev.multiSource === true ? null : true;
      } else if (cardInfo.type === 'leadStatus' && cardInfo.value) {
        const current = next.statusIds || [];
        next.statusIds = current.includes(cardInfo.value)
          ? current.filter(id => id !== cardInfo.value)
          : [...current, cardInfo.value];
      } else if (cardInfo.type === 'leadStatusHistory' && cardInfo.value) {
        const current = next.leadStatusHistoryIds || [];
        next.leadStatusHistoryIds = current.includes(cardInfo.value)
          ? current.filter(id => id !== cardInfo.value)
          : [...current, cardInfo.value];
      } else if (cardInfo.type === 'leadSource' && cardInfo.value) {
        const current = next.leadSourceIds || [];
        next.leadSourceIds = current.includes(cardInfo.value)
          ? current.filter(id => id !== cardInfo.value)
          : [...current, cardInfo.value];
      } else if (cardInfo.type === 'courseType' && cardInfo.value) {
        const current = next.courseTypeIds || [];
        next.courseTypeIds = current.includes(cardInfo.value)
          ? current.filter(id => id !== cardInfo.value)
          : [...current, cardInfo.value];
      } else if (cardInfo.type === 'course' && cardInfo.value) {
        const current = next.courseIds || [];
        next.courseIds = current.includes(cardInfo.value)
          ? current.filter(id => id !== cardInfo.value)
          : [...current, cardInfo.value];
      } else if (cardInfo.type === 'board' && cardInfo.value) {
        const current = next.boardIds || [];
        next.boardIds = current.includes(cardInfo.value)
          ? current.filter(id => id !== cardInfo.value)
          : [...current, cardInfo.value];
      } else if (cardInfo.type === 'grade' && cardInfo.value) {
        const current = next.gradeIds || [];
        next.gradeIds = current.includes(cardInfo.value)
          ? current.filter(id => id !== cardInfo.value)
          : [...current, cardInfo.value];
      } else if (cardInfo.type === 'assignedUser' && cardInfo.value) {
        const current = next.assignedUserIds || [];
        next.assignedUserIds = current.includes(cardInfo.value)
          ? current.filter(id => id !== cardInfo.value)
          : [...current, cardInfo.value];
      }

      const params = syncFiltersToSearchParams(next);
      setSearchParams(params, { replace: true });
      return next;
    });

    setPage(0);
  };

  const handleApplyDrawerFilters = (newFilters) => {
    setFilters(newFilters);
    setSearch(newFilters.search || '');
    setDebouncedSearch(newFilters.search || '');
    setPage(0);
    const params = syncFiltersToSearchParams(newFilters);
    setSearchParams(params, { replace: true });
  };

  const handleRemoveFilterChip = (chip) => {
    setFilters(prev => {
      const next = removeFilterFromState(prev, chip.key, chip.value);
      if (chip.key === 'search') {
        setSearch('');
        setDebouncedSearch('');
      }
      const params = syncFiltersToSearchParams(next);
      setSearchParams(params, { replace: true });
      return next;
    });
    setPage(0);
  };

  const handleClearAllFilters = () => {
    setFilters({ ...DEFAULT_LEAD_FILTERS });
    setSearch('');
    setDebouncedSearch('');
    setPage(0);
    setSearchParams({}, { replace: true });
  };

  const fetchLeads = async () => {
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const params = {
        page: page,
        size: size,
        sortBy: sortBy || undefined,
        sortDirection: sortDirection || undefined,
        ...filterRequest,
      };
      const res = await getAllLeads(params);
      if (currentRequestId !== requestIdRef.current) {
        return; // Stale request, ignore
      }
      if (res?.data?.success) {
        const pageData = res.data.data;
        setLeadsData(pageData?.content || []);
        setTotalElements(pageData?.totalElements || 0);
        setTotalPages(pageData?.totalPages || 0);
      } else {
        setLeadsData([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } catch (error) {
      if (currentRequestId === requestIdRef.current) {
        console.error("Failed to fetch leads", error);
        setLeadsData([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, size, sortBy, sortDirection, leadRefreshTrigger, filterRequestKey]);

  // Remark system commented out
  // const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  // const [selectedLeadForRemark, setSelectedLeadForRemark] = useState(null);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isAllotModalOpen, setIsAllotModalOpen] = useState(false);
  const [selectedLeadForAllot, setSelectedLeadForAllot] = useState(null);
  const [usersData, setUsersData] = useState([]);
  

  // Remark system functions commented out
  // const openRemarkModal = (lead) => {
  //   setSelectedLeadForRemark(lead);
  //   setIsRemarkModalOpen(true);
  // };

  // const closeRemarkModal = () => {
  //   setIsRemarkModalOpen(false);
  //   setSelectedLeadForRemark(null);
  // };

  // const handleSaveRemark = async (lead, remark) => {
  //   showToast(`Remark saved for ${lead.fullName || lead.name}`);
  //   // After saving the remark, refetch the leads to show updated data
  //   await fetchLeads();
  // };

  const openAllotModal = (leadOrIds) => {
    setSelectedLeadForAllot(leadOrIds);
    setIsAllotModalOpen(true);
  };

  const closeAllotModal = () => {
    setIsAllotModalOpen(false);
    setSelectedLeadForAllot(null);
  };

  const handleAllotLead = async () => {
    setSelectedIds([]);
    setSelectAll(false);
    setAutoSelectCount('');
    setSelectedLeadForAllot(null);
    await fetchLeads();
  };

  const handleSort = (columnKey, direction) => {
    // Map frontend column keys to backend field names (using camelCase from API response)
    const fieldMapping = {
      'sno': 'id',
      'leadCode': 'leadCode',
      'lead': 'fullName',
      'interestedCourses': 'interestedCourses',
      'source': 'source.name',
      'currentStatus': 'currentStatus',
      'assignedTo': 'assignedTo',
      'nextFollowUpDate': 'nextFollowUpDate',
      'createdBy': 'createdBy',
      'createdDate': 'createdAt'
    };
    
    const backendField = fieldMapping[columnKey] || columnKey;
    setSortBy(backendField);
    setSortDirection(direction);
  };

  const downloadExcel = async () => {
    try {
      // Fetch all leads with current filters applied
      const params = {
        page: 0,
        size: 10000,
        sortBy: sortBy || undefined,
        sortDirection: sortDirection || undefined,
        ...filterRequest,
      };
      const res = await getAllLeads(params);
      const allLeadsData = res?.data?.data?.content || [];
      
      // Flatten the leads data for Excel export
      const excelData = allLeadsData.map((lead, index) => {
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
          'Source': lead.sourceDetails || (Array.isArray(lead.leadSources) && lead.leadSources[0]?.name) || (typeof lead.source === 'object' ? lead.source?.name : lead.source) || 'N/A',
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
      const filename = `leads_export_${timestamp}.xlsx`;
      
      // Download the file
      XLSX.writeFile(workbook, filename);
      
      showToast('Excel file downloaded successfully');
    } catch (error) {
      console.error('Error downloading Excel:', error);
      showToast('Failed to download Excel file', 'error');
    }
  };

  const tableColumns = useMemo(() => {
    const cols = [];

    // Select Checkbox column
    cols.push({
      key: 'select',
      header: hasPermission('LEAD_ASSIGN') ? (
        <input
          type="checkbox"
          checked={selectAll}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600 align-middle"
        />
      ) : null,
      sortable: false,
      render: (value, row) => {
        if (!hasPermission('LEAD_ASSIGN')) return null;
        
        const rowId = typeof row.id === 'object' ? row.id?.id : row.id;
        const rowLeadId = typeof row.leadId === 'object' ? row.leadId?.id : row.leadId;
        const idToUse = rowId || rowLeadId;
        
        return (
          <input
            type="checkbox"
            checked={selectedIds.includes(idToUse)}
            onChange={(e) => handleSelectRow(idToUse, e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
          />
        );
      },
    });

    // S.No
    cols.push({
      key: 'sno',
      header: (
        <span className="inline-flex items-center gap-1 font-bold text-white" style={{ color: '#ffffff' }}>
          <span className="text-indigo-200 font-bold">#</span>
          <span>S.No</span>
        </span>
      ),
      sortable: false,
      render: (value, row, index) => {
        const serialNumber = (page * size) + index + 1;
        return <span className="font-semibold text-slate-500 text-xs font-mono">{typeof serialNumber === 'number' ? serialNumber : 'N/A'}</span>;
      },
    });

    // Lead Info (Full Name + Lead ID uniquely below name)
    if (canViewLeadField(hasPermission, 'fullName')) {
      cols.push({
        key: 'fullName',
        header: (
          <span className="inline-flex items-center gap-1.5 font-bold text-white" style={{ color: '#ffffff' }}>
            <span className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_6px_rgba(103,232,249,0.8)]"></span>
            <span>Lead Info</span>
          </span>
        ),
        render: (value, row) =>
          renderLeadInfoCell(
            row,
            (r) => {
              const leadId = r?.id ?? r?.leadId;
              if (leadId) navTo(`lead-detail/${leadId}`);
            },
            showToast
          ),
      });
    } else if (canViewLeadField(hasPermission, 'leadCode')) {
      cols.push({
        key: 'leadCode',
        header: (
          <span className="inline-flex items-center gap-1.5 font-bold text-white" style={{ color: '#ffffff' }}>
            <span className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_6px_rgba(103,232,249,0.8)]"></span>
            <span>Lead Code</span>
          </span>
        ),
        render: (value, row) => {
          const leadCodeValue = value || row.leadCode;
          let displayValue = 'N/A';
          if (typeof leadCodeValue === 'object' && leadCodeValue !== null) {
            displayValue = leadCodeValue?.code || leadCodeValue?.name || 'N/A';
          } else if (typeof leadCodeValue === 'string') {
            displayValue = leadCodeValue;
          }
          return <span className="font-semibold text-indigo-600 font-mono text-xs">{displayValue}</span>;
        },
      });
    }

    // Course (Interested Courses / Multiple Course Support)
    if (canViewLeadField(hasPermission, 'course') || canViewLeadField(hasPermission, 'interestedCourses')) {
      cols.push({
        key: 'interestedCourses',
        header: (
          <span className="inline-flex items-center gap-1.5 font-bold text-white" style={{ color: '#ffffff' }}>
            <span className="w-2 h-2 rounded-full bg-blue-300 shadow-[0_0_6px_rgba(147,197,253,0.8)]"></span>
            <span>Course</span>
          </span>
        ),
        render: (value, row) => renderCourseCell(row),
      });
    }

    // Source (Primary + Multi-Source Badge)
    if (canViewLeadField(hasPermission, 'leadSources')) {
      cols.push({
        key: 'source',
        header: (
          <span className="inline-flex items-center gap-1.5 font-bold text-white" style={{ color: '#ffffff' }}>
            <span className="w-2 h-2 rounded-full bg-purple-300 shadow-[0_0_6px_rgba(216,180,254,0.8)]"></span>
            <span>Source</span>
          </span>
        ),
        render: (value, row) => renderSourceCell(row),
      });
    }

    // Status (Vibrant Semantic Color Badges)
    if (canViewLeadField(hasPermission, 'currentStatus')) {
      cols.push({
        key: 'currentStatus',
        header: (
          <span className="inline-flex items-center gap-1.5 font-bold text-white" style={{ color: '#ffffff' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_6px_rgba(110,231,183,0.8)]"></span>
            <span>Status</span>
          </span>
        ),
        render: (value, row) => renderStatusCell(value, row),
      });
    }

    // Counselor (Highlighted with Initials Avatar & Unallotted Badge)
    if (canViewLeadField(hasPermission, 'assignedTo')) {
      cols.push({
        key: 'assignedTo',
        header: (
          <span className="inline-flex items-center gap-1.5 font-bold text-white" style={{ color: '#ffffff' }}>
            <span className="w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(252,211,77,0.8)]"></span>
            <span>Counselor</span>
          </span>
        ),
        render: (value, row) => renderCounselorCell(row),
      });
    }

    // Follow-up
    if (canViewLeadField(hasPermission, 'nextFollowUpDate')) {
      cols.push({
        key: 'nextFollowUpDate',
        header: (
          <span className="inline-flex items-center gap-1.5 font-bold text-white" style={{ color: '#ffffff' }}>
            <span className="w-2 h-2 rounded-full bg-sky-300 shadow-[0_0_6px_rgba(125,211,252,0.8)]"></span>
            <span>Follow-up</span>
          </span>
        ),
        render: (value, row) => renderFollowUpCell(row),
      });
    }

    // Lead Date (Created Date & Availed Status - 100% Non-PII)
    cols.push({
      key: 'createdAt',
      header: (
        <span className="inline-flex items-center gap-1.5 font-bold text-white" style={{ color: '#ffffff' }}>
          <span className="w-2 h-2 rounded-full bg-pink-300 shadow-[0_0_6px_rgba(244,114,182,0.8)]"></span>
          <span>Lead Date</span>
        </span>
      ),
      render: (value, row) => renderLeadDateCell(row),
    });

    return cols;
  }, [hasPermission, selectAll, selectedIds, page, size]);

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">
            All Leads
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Manage and track all your education leads
          </p>
        </div>
        <div className="flex gap-2">
          {/* Bulk Upload */}
          {hasPermission('LEAD_CREATE') && (
            <button
              className="btn btn-secondary btn-sm flex items-center gap-1.5"
              onClick={() => setIsBulkUploadOpen(true)}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              Import
            </button>
          )}
          {/* Download Excel */}
          <button
            className="flex items-center gap-1.5"
            style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '4px 10px', fontSize: '12px', borderRadius: '4px', cursor: 'pointer', boxShadow: 'none' }}
            onClick={downloadExcel}
            disabled={leadsData.length === 0}
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
          {/* Add Lead */}
          {hasPermission('LEAD_CREATE') && (
            <button
              className="btn btn-primary btn-sm flex items-center gap-1.5"
              onClick={() => openAddLeadModal()}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Lead
            </button>
          )}
        </div>
      </div>

      {/* ── New Lead Status Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <UnallottedCard 
          onCardClick={handleCardClick}
          activeFilters={activeCardFilters}
          filterRequest={filterRequest}
        />
       
        <AllottedCard 
          onCardClick={handleCardClick}
          activeFilters={activeCardFilters}
          filterRequest={filterRequest}
        />
        <AvailedCard 
          onCardClick={handleCardClick}
          activeFilters={activeCardFilters}
          filterRequest={filterRequest}
        />
        <MultiSourceCard 
          onCardClick={handleCardClick}
          activeFilters={activeCardFilters}
          filterRequest={filterRequest}
        />
      </div>

      {/* ── Category / Course Type breakdown ── */}
      <CategorywiseCard
        onCardClick={handleCardClick}
        activeFilters={activeCardFilters}
        filterRequest={filterRequest}
      />

      {/* ── Stat Cards: Status breakdown ── */}
      <LeadCards
        onCardClick={handleCardClick}
        activeFilters={activeCardFilters}
        filterRequest={filterRequest}
      />

      {/* ── Stat Cards: Source breakdown ── */}
      <LeadSource
        onCardClick={handleCardClick}
        activeFilters={activeCardFilters}
        filterRequest={filterRequest}
      />

      {/* ── Action & Filter Control Bar ── */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs p-3 mb-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Search & Filter Trigger */}
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {/* Search Input with Icon & Clear button */}
          <div className="relative min-w-[220px] max-w-sm flex-1 sm:flex-initial">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
            <input
              type="text"
              className="w-full pl-9 pr-8 py-2 text-xs md:text-sm bg-slate-50/80 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 font-medium text-slate-800"
              placeholder="Search leads by name, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60 transition-colors"
                title="Clear search"
              >
                <FiX size={13} />
              </button>
            )}
          </div>

          {/* Filter Drawer Trigger Button */}
          <button
            type="button"
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-semibold rounded-lg border transition-all cursor-pointer shadow-2xs ${
              activeFilterCount > 0
                ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100/80'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
            onClick={() => setIsFilterDrawerOpen(true)}
            title="Open Advanced Filters"
          >
            <FiFilter className={activeFilterCount > 0 ? 'text-purple-600' : 'text-slate-500'} size={14} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center bg-purple-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px]">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Clear all active filters button */}
          {(filterChips.length > 0 || search) && (
            <button
              onClick={handleClearAllFilters}
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-lg transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <FiX size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right: Quick Lead Selection & Allotment Actions */}
        {hasPermission('LEAD_ASSIGN') && (
          <div className="flex items-center gap-2.5 flex-wrap justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
            {/* Quick Auto-select input group */}
            <div className="flex items-center bg-slate-50/90 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-600">
              <span className="font-semibold text-slate-500 mr-2 select-none">Quick Select:</span>
              <input
                type="number"
                min="1"
                max={leadsData.length}
                value={autoSelectCount}
                onChange={handleAutoSelectCount}
                onWheel={(e) => e.target.blur()}
                placeholder="Qty"
                className="w-12 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-center font-bold text-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                title="Number of leads to auto-select from top"
              />
            </div>

            {/* Selected Count Badge */}
            {selectedIds.length > 0 && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-lg text-xs font-bold text-emerald-700 animate-fadeIn">
                <FiCheckSquare size={13} className="text-emerald-600" />
                <span>{selectedIds.length} Selected</span>
              </div>
            )}

            {/* Allot Lead Button */}
            <button
              className="inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98] rounded-lg shadow-xs hover:shadow transition-all cursor-pointer border-none"
              onClick={() => {
                if (selectedIds.length > 0) {
                  openAllotModal(selectedIds);
                } else {
                  showToast('Please select leads to allot', 'warning');
                }
              }}
            >
              <FiUserPlus size={15} />
              <span>Allot Leads</span>
            </button>
          </div>
        )}
      </div>

      {/* Active filter chips row */}
      {filterChips.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-3 px-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filtered by:</span>
          {filterChips.map((chip, idx) => (
            <div 
              key={`${chip.key}-${chip.value}-${idx}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50/90 border border-indigo-200/80 rounded-full text-xs text-indigo-800 font-medium shadow-2xs"
            >
              <span>{chip.label}</span>
              <button
                onClick={() => handleRemoveFilterChip(chip)}
                className="text-indigo-400 hover:text-indigo-700 bg-transparent border-none cursor-pointer flex items-center p-0.5 rounded-full hover:bg-indigo-200/50 transition-colors"
                title="Remove this filter"
              >
                <FiX size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Table Container ── */}
      <div className="w-full">
        <ReusableTable
            columns={tableColumns}
            data={leadsData}
            isServerSide={true}
            totalElements={totalElements}
            totalPages={totalPages}
            currentPage={page + 1}
            rowsPerPage={size}
            onPageChange={(newPage) => setPage(newPage - 1)}
            onRowsPerPageChange={(newSize) => {
              setSize(newSize);
              setPage(0);
            }}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
            actions={(row) => {
              // Ensure row IDs are handled properly
              const safeRow = {
                ...row,
                id: typeof row.id === 'object' ? row.id?.id : row.id,
                leadId: typeof row.leadId === 'object' ? row.leadId?.id : row.leadId
              };

              return (
                <div className="flex justify-center items-center gap-1.5">
                  {(hasPermission('LEAD_READ') || hasPermission('LEAD_VIEW')) && (
                    <button
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors bg-transparent border-none cursor-pointer"
                      title="View Lead"
                      onClick={async () => {
                        const leadId = safeRow?.id ?? safeRow?.leadId;
                        try {
                          // Fetch lead details to check conditions
                          const res = await getLeadById(leadId);
                          const leadDetails = res?.data?.data;

                          // Get current user from localStorage
                          const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                          const currentUserId = userInfo?.id || userInfo?.userId;

                          // Check conditions
                          const shouldCallAvail = 
                            (leadDetails?.isAvailed === false || leadDetails?.isAvailed === null) &&
                            (leadDetails?.assignedTo === null || leadDetails?.assignedTo?.id === currentUserId);

                          if (shouldCallAvail) {
                            await availLead(leadId);
                            showToast('Lead marked as availed successfully');
                            fetchLeads();
                          }
                        } catch (error) {
                          console.error('Error:', error);
                          // Still navigate even if avail API fails
                        }
                        navTo(`lead-detail/${leadId}`);
                      }}
                    >
                      <FiEye size={17} />
                    </button>
                  )}
                  {hasPermission('LEAD_UPDATE') && (
                    <button
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors bg-transparent border-none cursor-pointer"
                      title="Edit Lead"
                      onClick={async () => {
                        const leadId = safeRow?.id ?? safeRow?.leadId;
                        try {
                          // Fetch full lead detail so we get proper IDs for all fields
                          const res = await getLeadById(leadId);
                          const full = res?.data?.success ? res.data.data : safeRow;

                          const editData = {
                            id: full.id ?? full.leadId,
                            leadId: full.id ?? full.leadId,
                            fullName: full.fullName || '',
                            phoneNumber: full.phoneNumber || '',
                            alternatePhoneNumber: full.alternatePhoneNumber || '',
                            email: full.email || '',
                            country: typeof full.country === 'object' ? full.country?.name || '' : full.country || '',
                            state: typeof full.state === 'object' ? full.state?.name || '' : full.state || '',
                            city: typeof full.city === 'object' ? full.city?.name || '' : full.city || '',
                            sourceDetails: full.sourceDetails || '',
                            remarks: full.remarks || '',
                            nextFollowUpDate: full.nextFollowUpDate || '',
                            active: full.active !== undefined ? full.active : true,
                            // courseId — could be full.course.id or full.courseId
                            courseId: String(
                              full.course?.id ?? full.courseId ?? ''
                            ),
                            // registeredCourse
                            registeredCourseId: String(
                              full.registeredCourse?.id ?? full.registeredCourseId ?? ''
                            ),
                            registrationStatus: full.registrationStatus || '',
                            isRegistrationVerified: Boolean(
                              full.registrationStatus === 'COMPLETED_MATCHED' ||
                              full.registrationStatus === 'MANUALLY_APPROVED' ||
                              full.registrationStatus === 'VERIFIED' ||
                              full.registrationStatus === 'REGISTERED_VERIFIED' ||
                              full.registrationStatus === 'APPROVED' ||
                              full.isRegistrationVerified ||
                              full.registrationVerified
                            ),
                            // board
                            boardId: String(
                              full.board?.id ?? full.boardId ?? ''
                            ),
                            // grade
                            gradeId: String(
                              full.grade?.id ?? full.gradeId ?? ''
                            ),
                            // category / courseType
                            courseTypeId: String(
                              full.courseType?.id ?? full.interestedCourseTypes?.[0]?.id ?? full.courseTypeId ?? ''
                            ),
                            // department
                            departmentId: String(
                              full.department?.id ?? full.departmentId ?? ''
                            ),
                            // assignedTo
                            assignedToUserId: String(
                              full.assignedTo?.id ?? full.assignedToUserId ?? ''
                            ),
                            // status
                            statusId: String(
                              full.currentStatus?.id ?? full.statusId ?? ''
                            ),
                            // leadSources array
                            leadSourceIds: Array.isArray(full.leadSources)
                              ? full.leadSources.map(s => String(typeof s === 'object' ? s.id : s)).filter(Boolean)
                              : Array.isArray(full.leadSourceIds)
                                ? full.leadSourceIds.map(String)
                                : (full.source?.id ? [String(full.source.id)] : []),
                            // interestedCourses array
                            interestedCourseIds: Array.isArray(full.interestedCourses)
                              ? full.interestedCourses.map(c => String(typeof c === 'object' ? c.id : c)).filter(Boolean)
                              : Array.isArray(full.interestedCourseIds)
                                ? full.interestedCourseIds.map(String)
                                : [],
                          };

                          openAddLeadModal(editData);
                        } catch (err) {
                          console.error('Failed to fetch lead for edit', err);
                          showToast('Failed to load lead data', 'error');
                        }
                      }}
                    >
                      <FiEdit size={17} />
                    </button>
                  )}
                  {hasPermission('LEAD_DELETE') && (
                    <button
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors bg-transparent border-none cursor-pointer"
                      title="Delete Lead"
                      onClick={() => {
                        openDeleteModal(safeRow);
                      }}
                    >
                      <FiTrash2 size={17} />
                    </button>
                  )}
                </div>
              );
            }}
            emptyMessage={loading ? "Loading..." : "No leads match your filters."}
          />
      </div>


      {/* Lead Remark Modal - commented out */}
      {/* <LeadRemarkModal
        isOpen={isRemarkModalOpen}
        onClose={closeRemarkModal}
        lead={selectedLeadForRemark}
        followUpId={selectedLeadForRemark?.followUpId || selectedLeadForRemark?.nextFollowUpId || selectedLeadForRemark?.followupId}
        onSave={handleSaveRemark}
      /> */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Lead"
        message={`Are you sure you want to delete lead "${leadToDelete?.fullName}"? This action cannot be undone.`}
      />
      <AssignLeadModal
        isOpen={isAllotModalOpen}
        onClose={closeAllotModal}
        onAssign={handleAllotLead}
        selectedLeadIds={selectedLeadForAllot || selectedIds}
        filters={filterRequest}
        showToast={showToast}
      />

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onSuccess={() => {
          showToast('Leads uploaded successfully!');
          fetchLeads();
        }}
      />

      {/* Preview Distribution Modal */}
      <PreviewDistributionModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        showToast={showToast}
      />

      {/* ── Lead Filter Drawer ── */}
      <LeadFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        appliedFilters={filters}
        onApply={handleApplyDrawerFilters}
        lookups={lookups}
      />
    </div>
  );
};

export default Leads;

import { useState, useMemo, useEffect } from 'react';
import { FiEye, FiEdit, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import { statusConfig } from '../mockData';
import { getAllLeads, deleteLead, getLeadById } from '../Services/lead/leadService';
import { getAllCourses } from '../Services/course/course';
import { useAppContext } from '../AppContext';
import { usePermissions } from '../PermissionContext';
import ReusableTable from '../component/reusable/table';
import LeadRemarkModal from '../component/reusable/Leads/LeadRemarkModal';
import DeleteModal from "../component/reusable/deleteModel"
import AssignLeadModal from '../component/reusable/Leads/AssignLeadModal';
import LeadCards from '../component/reusable/DashBoards/leadCards';
import BulkUploadModal from '../component/reusable/Leads/BulkUploadModal';
import PreviewDistributionModal from '../component/reusable/Leads/PreviewDistributionModal';


const Leads = () => {
  const { openAddLeadModal, navTo, showToast, leadRefreshTrigger } = useAppContext();
  const { canCreate, canUpdate, canDelete, canView, hasPermission } = usePermissions();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCounselor, setFilterCounselor] = useState('All Counselors');
  const [filterCourse, setFilterCourse] = useState('All Courses');
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

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

  // API State
  const [leadsData, setLeadsData] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [coursesData, setCoursesData] = useState([]);

  // Calculate stat cards data for LeadCards component
  const leadCardsData = useMemo(() => {
    const rawLeads = leadsData.filter(l => l.currentStatus === 'raw' || l.currentStatus === 'RAW').length;
    const connectedLeads = leadsData.filter(l => l.currentStatus === 'connected' || l.currentStatus === 'CONNECTED').length;
    const notConnectedLeads = leadsData.filter(l => l.currentStatus === 'notconnected' || l.currentStatus === 'NOTCONNECTED').length;
    const interestedLeads = leadsData.filter(l => l.currentStatus === 'interested' || l.currentStatus === 'INTERESTED').length;
    const registeredLeads = leadsData.filter(l => l.currentStatus === 'registered' || l.currentStatus === 'REGISTERED').length;
    const myAllottedLeads = leadsData.filter(l => l.assignedTo && l.assignedTo !== '').length;
    const allottedLeads = leadsData.filter(l => l.assignedTo && l.assignedTo !== '').length;
    const notAllotted = leadsData.filter(l => !l.assignedTo || l.assignedTo === '').length;
    const formFollowUp = leadsData.filter(l => l.currentStatus === 'formfollowup' || l.currentStatus === 'FORMFOLLOWUP').length;
    const notInterestedLeads = leadsData.filter(l => l.currentStatus === 'notinterested' || l.currentStatus === 'NOTINTERESTED').length;
    const finallyNotInterested = leadsData.filter(l => l.currentStatus === 'finallynotinterested' || l.currentStatus === 'FINALLYNOTINTERESTED').length;
    const badLeads = leadsData.filter(l => l.currentStatus === 'bad' || l.currentStatus === 'BAD').length;
    const firstCall = leadsData.filter(l => l.currentStatus === 'firstcall' || l.currentStatus === 'FIRSTCALL').length;
    const secondCall = leadsData.filter(l => l.currentStatus === 'secondcall' || l.currentStatus === 'SECONDCALL').length;
    const thirdCall = leadsData.filter(l => l.currentStatus === 'thirdcall' || l.currentStatus === 'THIRDCALL').length;
    const fourthCall = leadsData.filter(l => l.currentStatus === 'fourthcall' || l.currentStatus === 'FOURTHCALL').length;

    return {
      rowData: rawLeads,
      totalAllotted: allottedLeads,
      totalUnallotted: notAllotted,
      totalAvailed: registeredLeads,
      connected: connectedLeads,
      interested: interestedLeads,
      notInterested: notInterestedLeads,
      formFollowUp: formFollowUp,
      counselingFollowUp: 0,
      registered: registeredLeads,
      formNotInterested: 0,
      continueFormFollowUp: 0,
      counselingFollowUp2: 0,
      continuesCounselingFollowUp: 0,
      interestedFollowUp: 0,
      counselingToFormFollowUp: 0,
      notInterestedAfterCounseling: 0,
      goesToFormFollowUpAfterCounseling: 0,
      badData: badLeads,
      notConnected: notConnectedLeads,
      firstNotConnected: firstCall,
      secondNotConnected: secondCall,
      thirdNotConnected: thirdCall,
      fourthNotConnected: fourthCall,
      finallyNotConnected: finallyNotInterested,
    };
  }, [leadsData]);

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
    // Toggle: same card click kare toh filter clear ho jaye
    if (selectedCard?.type === cardInfo.type && selectedCard?.value === cardInfo.value) {
      setSelectedCard(null);
    } else {
      setSelectedCard(cardInfo);
    }
    setPage(0); // filter change hone par page reset
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {
        page: page,
        size: size,
        search: search || undefined,
        sortBy: sortBy || undefined,
        sortDirection: sortDirection || undefined,
        // Card filter — statusId send karo agar koi card selected hai
        ...(selectedCard?.type === 'leadStatus' && selectedCard?.value
          ? { statusId: selectedCard.value }
          : {}),
      };
      const res = await getAllLeads(params);
      if (res?.data?.success) {
        const content = res.data.data.content;
        if (content?.length > 0) {
        }
        setLeadsData(content);
        setTotalElements(res.data.data.totalElements);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch leads", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await getAllCourses({ page: 0, size: 100 });
      if (res?.success) {
        const courses = res.data.content;
        const courseNames = courses.map(course => course.courseName);
       
        setCoursesData(['All Courses', ...courseNames]);
      } else {
      }
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLeads();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [page, size, search, sortBy, sortDirection, leadRefreshTrigger, selectedCard]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [selectedLeadForRemark, setSelectedLeadForRemark] = useState(null);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isAllotModalOpen, setIsAllotModalOpen] = useState(false);
  const [selectedLeadForAllot, setSelectedLeadForAllot] = useState(null);
  const [usersData, setUsersData] = useState([]);
  

  const openRemarkModal = (lead) => {
    setSelectedLeadForRemark(lead);
    setIsRemarkModalOpen(true);
  };

  const closeRemarkModal = () => {
    setIsRemarkModalOpen(false);
    setSelectedLeadForRemark(null);
  };

  const handleSaveRemark = async (lead, remark) => {
    showToast(`Remark saved for ${lead.fullName || lead.name}`);
    // After saving the remark, refetch the leads to show updated data
    await fetchLeads();
  };

  const openAllotModal = (leadOrIds) => {
    setSelectedLeadForAllot(leadOrIds);
    setIsAllotModalOpen(true);
  };

  const closeAllotModal = () => {
    setIsAllotModalOpen(false);
    setSelectedLeadForAllot(null);
  };

  const handleAllotLead = async (leadOrIds, userId) => {
    // TODO: Implement the actual API call to allot the lead(s)
    if (Array.isArray(leadOrIds)) {
      showToast(`${leadOrIds.length} leads allotted successfully`);
    } else {
      showToast('Lead allotted successfully');
    }
    await fetchLeads();
  };

  const handleSort = (columnKey, direction) => {
    // Map frontend column keys to backend field names (using camelCase from API response)
    const fieldMapping = {
      'sno': 'id',
      'leadCode': 'leadCode',
      'lead': 'fullName',
      'courseInterested': 'courseInterested',
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
          <button
            className="btn btn-secondary btn-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setIsBulkUploadOpen(true)}
            disabled={!hasPermission('LEAD_CREATE')}
            style={{ cursor: !hasPermission('LEAD_CREATE') ? 'not-allowed' : 'pointer' }}
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
            Export
          </button>
          {/* Add Lead */}
          <button
            className="btn btn-primary btn-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => openAddLeadModal()}
            disabled={!hasPermission('LEAD_CREATE')}
            style={{ cursor: !hasPermission('LEAD_CREATE') ? 'not-allowed' : 'pointer' }}
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
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <LeadCards
        onCardClick={handleCardClick}
        selectedCard={selectedCard}
      />

      {/* ── Filter Bar ── */}
      <div className="flex gap-2 flex-wrap mb-4">
        <input
          type="text"
          className="form-control max-w-[240px]"
          placeholder="Search leads…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); }}
        />
        {/* Active card filter badge */}
        {selectedCard && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-md text-sm text-indigo-700 font-medium">
            <span>Filter: {selectedCard.label}</span>
            <button
              onClick={() => { setSelectedCard(null); setPage(0); }}
              className="ml-1 text-indigo-400 hover:text-indigo-700 bg-transparent border-none cursor-pointer leading-none"
              title="Clear filter"
            >
              ✕
            </button>
          </div>
        )}
        {/* Allot Lead */}
        <button
          className="btn btn-secondary btn-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            if (selectedIds.length > 0) {
              openAllotModal(selectedIds);
            } else {
              showToast('Please select leads to allot', 'warning');
            }
          }}
          disabled={!hasPermission('LEAD_ASSIGN')}
          style={{ cursor: !hasPermission('LEAD_ASSIGN') ? 'not-allowed' : 'pointer' }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
          Allot Lead
        </button>
        <button
          className="btn btn-ghost btn-sm flex items-center gap-1.5"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          Filters
        </button>
      </div>

      {/* ── Table Card ── */}
      <div className="card">
        <div className="table-wrap">
          <ReusableTable
            columns={[
              {
                key: 'select',
                header: (
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="cursor-pointer"
                    disabled={!hasPermission('LEAD_ASSIGN')}
                    style={{ cursor: !hasPermission('LEAD_ASSIGN') ? 'not-allowed' : 'pointer' }}
                  />
                ),
                sortable: false,
                render: (value, row) => {
                  const rowId = typeof row.id === 'object' ? row.id?.id : row.id;
                  const rowLeadId = typeof row.leadId === 'object' ? row.leadId?.id : row.leadId;
                  const idToUse = rowId || rowLeadId;
                  
                  return (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(idToUse)}
                      onChange={(e) => handleSelectRow(idToUse, e.target.checked)}
                      className="cursor-pointer"
                      disabled={!hasPermission('LEAD_ASSIGN')}
                      style={{ cursor: !hasPermission('LEAD_ASSIGN') ? 'not-allowed' : 'pointer' }}
                    />
                  );
                },
              },
              {
                key: 'sno',
                header: 'S.No',
                sortable: false,
                render: (value, row, index) => {
                  const serialNumber = (page * size) + index + 1;
                  return <span className="font-semibold text-gray-700">{typeof serialNumber === 'number' ? serialNumber : 'N/A'}</span>;
                },
              },
              {
                key: 'leadCode',
                header: 'Lead Code',
                render: (value, row) => {
                  // Handle both value parameter and row.leadCode
                  const leadCodeValue = value || row.leadCode;
                  let displayValue = 'N/A';
                  
                  if (typeof leadCodeValue === 'object' && leadCodeValue !== null) {
                    displayValue = leadCodeValue?.code || leadCodeValue?.name || 'N/A';
                  } else if (typeof leadCodeValue === 'string') {
                    displayValue = leadCodeValue;
                  } else if (leadCodeValue === null || leadCodeValue === undefined) {
                    displayValue = 'N/A';
                  }
                  
                  return <span className="font-semibold text-blue-600">{displayValue}</span>;
                },
              },
              {
                key: 'lead',
                header: 'Lead Info',
                render: (value, row) => (
                  <div>
                    <div className="font-semibold text-gray-800">
                      {typeof row.fullName === 'object' ? row.fullName?.name || row.fullName?.firstName || 'N/A' : row.fullName || 'N/A'}
                    </div>
                  </div>
                ),
              },
              { 
                key: 'courseInterested', 
                header: 'Course',
                render: (value, row) => {
                  // Handle both value parameter and row.courseInterested
                  const courseValue = value || row.courseInterested;
                  let displayValue = 'N/A';
                  
                  if (typeof courseValue === 'object' && courseValue !== null) {
                    displayValue = courseValue?.courseName || courseValue?.name || 'N/A';
                  } else if (typeof courseValue === 'string') {
                    displayValue = courseValue;
                  } else if (courseValue === null || courseValue === undefined) {
                    displayValue = 'N/A';
                  }
                  
                  return displayValue;
                },
              },
              {
                key: 'source',
                header: 'Source',
                render: (value, row) => {
                  if (typeof row.source === 'object' && row.source !== null) {
                    return row.source?.name || 'N/A';
                  }
                  return row.source || 'N/A';
                },
              },
              {
                key: 'currentStatus',
                header: 'Status',
                render: (value, row) => {
                  // Handle both value parameter and row.currentStatus
                  const statusValue = value || row.currentStatus;
                  let displayValue = 'N/A';
                  
                  if (typeof statusValue === 'object' && statusValue !== null) {
                    displayValue = statusValue?.name || statusValue?.code || 'N/A';
                  } else if (typeof statusValue === 'string') {
                    displayValue = statusValue;
                  } else if (statusValue === null || statusValue === undefined) {
                    displayValue = 'N/A';
                  }
                  
                  return (
                    <span className="badge bg-slate-200 text-slate-800 px-2 py-1 rounded text-xs font-medium">
                      {displayValue}
                    </span>
                  );
                },
              },
              {
                key: 'assignedTo',
                header: 'Counselor',
                render: (value, row) => {
                  if (typeof row.assignedTo === 'object' && row.assignedTo !== null) {
                    return `${row.assignedTo.firstName || ''} ${row.assignedTo.lastName || ''}`.trim() || 'Not Allotted';
                  }
                  return row.assignedTo || 'Not Allotted';
                },
              },
              {
                key: 'nextFollowUpDate',
                header: 'Follow-up',
                render: (value, row) => {
                  const followUpDate = row.nextFollowUpDate;
                  if (followUpDate) {
                    try {
                      return new Date(followUpDate).toLocaleDateString();
                    } catch (e) {
                      return 'Invalid Date';
                    }
                  }
                  return 'None';
                },
              },
              {
                key: 'createdBy',
                header: 'Created By',
                render: (value, row) => {
                  const createdByValue = value || row.createdBy;
                  if (typeof createdByValue === 'object' && createdByValue !== null) {
                    return `${createdByValue.firstName || ''} ${createdByValue.lastName || ''}`.trim() || 'N/A';
                  }
                  return createdByValue || 'N/A';
                },
              },
            ]}
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
                <div className="flex justify-center items-center gap-3">
                  <button
                    className="text-blue-500 hover:text-blue-700 transition bg-transparent border-none cursor-pointer"
                    title="Remark"
                    onClick={() => openRemarkModal(safeRow)}
                  >
                    <FiMessageSquare size={18} />
                  </button>
                  <button
                    className="text-gray-500 hover:text-gray-700 transition bg-transparent border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title="View"
                    onClick={() => navTo(`lead-detail/${safeRow?.id ?? safeRow?.leadId}`)}
                    disabled={!hasPermission('LEAD_READ') && !hasPermission('LEAD_VIEW')}
                    style={{ cursor: (!hasPermission('LEAD_READ') && !hasPermission('LEAD_VIEW')) ? 'not-allowed' : 'pointer' }}
                  >
                    <FiEye size={18} />
                  </button>
                  <button
                    className="text-gray-500 hover:text-gray-700 transition bg-transparent border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Edit"
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
                    disabled={!hasPermission('LEAD_UPDATE')}
                    style={{ cursor: !hasPermission('LEAD_UPDATE') ? 'not-allowed' : 'pointer' }}
                  >
                    <FiEdit size={18} />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700 transition bg-transparent border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete"
                    onClick={() => {
                      openDeleteModal(safeRow);
                    }}
                    disabled={!hasPermission('LEAD_DELETE')}
                    style={{ cursor: !hasPermission('LEAD_DELETE') ? 'not-allowed' : 'pointer' }}
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              );
            }}
            emptyMessage={loading ? "Loading..." : "No leads match your filters."}
          />
        </div>

      </div>


      {/* Lead Remark Modal */}
      <LeadRemarkModal
        isOpen={isRemarkModalOpen}
        onClose={closeRemarkModal}
        lead={selectedLeadForRemark}
        followUpId={selectedLeadForRemark?.followUpId || selectedLeadForRemark?.nextFollowUpId || selectedLeadForRemark?.followupId}
        onSave={handleSaveRemark}
      />
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
        currentLead={selectedLeadForAllot}
        users={usersData}
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
    </div>
  );
};

export default Leads;

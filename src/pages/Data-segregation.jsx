import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../PermissionContext';
import {
  getSegregationCapabilities,
  getCourseTypesSummary,
  getSegregationMatrix,
  getUserSegregationAnalytics,
  getLeadStatusSegregationAnalytics
} from '../Services/segregation/dataSegregationService';
import UserSegregationAnalyticsModal from '../component/reusable/segregation/UserSegregationAnalyticsModal';
import LeadStatusSegregationModal from '../component/reusable/segregation/LeadStatusSegregationModal';

const DataSegregation = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  // State: Resolved Server Capabilities
  const [capabilities, setCapabilities] = useState(null);

  // State: Course Types
  const [courseTypes, setCourseTypes] = useState([]);
  const [selectedCourseType, setSelectedCourseType] = useState(null);
  const [loadingCourseTypes, setLoadingCourseTypes] = useState(true);

  // State: Segregation Matrix
  const [matrixData, setMatrixData] = useState(null);
  const [loadingMatrix, setLoadingMatrix] = useState(false);
  const [matrixError, setMatrixError] = useState(null);

  // State: Expanded Tree Rows (IDs of expanded sources and boards)
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  // State: User Analytics Modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userModalData, setUserModalData] = useState(null);
  const [loadingUserModal, setLoadingUserModal] = useState(false);
  const [activeScopeTitle, setActiveScopeTitle] = useState('');

  // State: Lead Status Analytics Modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusModalData, setStatusModalData] = useState(null);
  const [loadingStatusModal, setLoadingStatusModal] = useState(false);
  const [statusModalTotalLeads, setStatusModalTotalLeads] = useState(0);

  // =========================================================================
  // Derived Capability Flags (Server Capabilities prioritized, fallback to Context)
  // =========================================================================
  const canView = useMemo(() => {
    if (capabilities) return capabilities.canView;
    return hasPermission('DATA_SEGREGATION_VIEW') || hasPermission('DATA_SEGREGATION_FULL_FLOW_VIEW');
  }, [capabilities, hasPermission]);

  const canViewFullFlow = useMemo(() => {
    if (capabilities) return capabilities.canViewFullFlow;
    return hasPermission('DATA_SEGREGATION_FULL_FLOW_VIEW');
  }, [capabilities, hasPermission]);

  const canViewCourseType = useMemo(() => {
    if (canViewFullFlow) return true;
    if (capabilities) return capabilities.canViewCourseType;
    return hasPermission('DATA_SEGREGATION_COURSE_TYPE_VIEW') || hasPermission('DATA_SEGREGATION_VIEW');
  }, [canViewFullFlow, capabilities, hasPermission]);

  const canViewSource = useMemo(() => {
    if (canViewFullFlow) return true;
    if (capabilities) return capabilities.canViewSource;
    return hasPermission('DATA_SEGREGATION_SOURCE_VIEW') || hasPermission('DATA_SEGREGATION_VIEW');
  }, [canViewFullFlow, capabilities, hasPermission]);

  const canViewBoard = useMemo(() => {
    if (canViewFullFlow) return true;
    if (capabilities) return capabilities.canViewBoard;
    return hasPermission('DATA_SEGREGATION_BOARD_VIEW');
  }, [canViewFullFlow, capabilities, hasPermission]);

  const canViewGrade = useMemo(() => {
    if (canViewFullFlow) return true;
    if (capabilities) return capabilities.canViewGrade;
    return hasPermission('DATA_SEGREGATION_GRADE_VIEW');
  }, [canViewFullFlow, capabilities, hasPermission]);

  const canViewUserAnalytics = useMemo(() => {
    if (canViewFullFlow) return true;
    if (capabilities) return capabilities.canViewUserAnalytics;
    return hasPermission('DATA_SEGREGATION_USER_ANALYTICS') || hasPermission('DATA_SEGREGATION_VIEW');
  }, [canViewFullFlow, capabilities, hasPermission]);

  const canViewStatusAnalytics = useMemo(() => {
    if (canViewFullFlow) return true;
    if (capabilities) return capabilities.canViewLeadStatusAnalytics;
    return hasPermission('DATA_SEGREGATION_LEAD_STATUS_ANALYTICS') || hasPermission('DATA_SEGREGATION_VIEW');
  }, [canViewFullFlow, capabilities, hasPermission]);

  // Fetch Capabilities and Course Types on Mount
  useEffect(() => {
    const initData = async () => {
      try {
        const capRes = await getSegregationCapabilities();
        if (capRes?.success && capRes.data) {
          setCapabilities(capRes.data);
          if (capRes.data.canViewCourseType) {
            await fetchCourseTypes();
          } else {
            setLoadingCourseTypes(false);
          }
        } else {
          await fetchCourseTypes();
        }
      } catch (err) {
        console.error('Failed to load segregation capabilities:', err);
        await fetchCourseTypes();
      }
    };

    initData();
  }, []);

  const fetchCourseTypes = async () => {
    setLoadingCourseTypes(true);
    try {
      const res = await getCourseTypesSummary();
      if (res?.success && res.data?.length > 0) {
        setCourseTypes(res.data);
        // Default to first active course type
        setSelectedCourseType(res.data[0]);
      } else {
        setCourseTypes([]);
      }
    } catch (err) {
      console.error('Failed to load course types for data segregation:', err);
    } finally {
      setLoadingCourseTypes(false);
    }
  };

  // Fetch Segregation Matrix whenever selected course type changes
  useEffect(() => {
    if (selectedCourseType?.id && canViewCourseType) {
      fetchMatrix(selectedCourseType.id);
    }
  }, [selectedCourseType, canViewCourseType]);

  const fetchMatrix = async (courseTypeId) => {
    setLoadingMatrix(true);
    setMatrixError(null);
    try {
      const res = await getSegregationMatrix({ courseTypeId });
      if (res?.success) {
        setMatrixData(res.data);
        if (res.data.capabilities) {
          setCapabilities(res.data.capabilities);
        }
        // Auto-expand all sources by default for easy visibility
        if (res.data?.sources) {
          const initialExpanded = new Set();
          res.data.sources.forEach((s) => {
            initialExpanded.add(`source-${s.sourceId}`);
          });
          setExpandedNodes(initialExpanded);
          setIsAllExpanded(false);
        }
      } else {
        setMatrixError(res?.message || 'Failed to fetch matrix data.');
      }
    } catch (err) {
      console.error('Failed to fetch segregation matrix:', err);
      setMatrixError('An error occurred while loading segregation matrix.');
    } finally {
      setLoadingMatrix(false);
    }
  };

  // Toggle node expansion in hierarchy table
  const toggleNode = (nodeKey) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeKey)) {
        next.delete(nodeKey);
      } else {
        next.add(nodeKey);
      }
      return next;
    });
  };

  const toggleExpandCollapseAll = () => {
    if (!matrixData?.sources) return;

    if (isAllExpanded) {
      setExpandedNodes(new Set());
      setIsAllExpanded(false);
    } else {
      const all = new Set();
      matrixData.sources.forEach((s) => {
        all.add(`source-${s.sourceId}`);
        if (canViewBoard) {
          s.boards?.forEach((b) => {
            all.add(`board-${s.sourceId}-${b.boardId}`);
          });
        }
      });
      setExpandedNodes(all);
      setIsAllExpanded(true);
    }
  };

  // =========================================================================
  // Deep-Link Navigation into /leads
  // =========================================================================
  const navigateToLeads = (filters) => {
    const activeFilters = [];

    if (filters.courseTypeId && selectedCourseType && canViewCourseType) {
      activeFilters.push({
        type: 'courseType',
        value: filters.courseTypeId,
        label: `Category: ${selectedCourseType.name}`
      });
    }

    if (filters.leadSourceId && filters.sourceName && canViewSource) {
      activeFilters.push({
        type: 'leadSource',
        value: filters.leadSourceId,
        label: `Source: ${filters.sourceName}`
      });
    }

    if (filters.boardId && filters.boardName && canViewBoard) {
      activeFilters.push({
        type: 'board',
        value: filters.boardId,
        label: `Specialization: ${filters.boardName}`
      });
    }

    if (filters.gradeId && filters.gradeName && canViewGrade) {
      activeFilters.push({
        type: 'grade',
        value: filters.gradeId,
        label: `Grade: ${filters.gradeName}`
      });
    }

    if (filters.assignedUserId) {
      activeFilters.push({
        type: 'assignedUser',
        value: filters.assignedUserId,
        label: `User: ${filters.userName || 'Assigned User'}`
      });
    }

    if (filters.statusId) {
      activeFilters.push({
        type: 'leadStatus',
        value: filters.statusId,
        label: `Status: ${filters.statusName || 'Status'}`
      });
    }

    navigate('/leads', { state: { activeFilters } });
  };

  // =========================================================================
  // Modal Open Handlers
  // =========================================================================
  const handleOpenUserAnalytics = async ({ leadSourceId, sourceName, boardId, boardName, gradeId, gradeName }) => {
    if (!canViewUserAnalytics) return;
    const scopeParts = [
      selectedCourseType?.name,
      sourceName,
      canViewBoard ? boardName : null,
      canViewGrade ? gradeName : null
    ].filter(Boolean);

    setActiveScopeTitle(scopeParts.join(' → '));
    setIsUserModalOpen(true);
    setLoadingUserModal(true);

    try {
      const res = await getUserSegregationAnalytics({
        courseTypeId: selectedCourseType.id,
        leadSourceId,
        boardId: (canViewBoard && boardId) ? boardId : undefined,
        gradeId: (canViewGrade && gradeId) ? gradeId : undefined
      });
      if (res?.success) {
        setUserModalData(res.data);
      }
    } catch (err) {
      console.error('Failed to load user segregation analytics:', err);
    } finally {
      setLoadingUserModal(false);
    }
  };

  const handleOpenStatusAnalytics = async ({ leadSourceId, sourceName, boardId, boardName, gradeId, gradeName, totalLeads }) => {
    if (!canViewStatusAnalytics) return;
    const scopeParts = [
      selectedCourseType?.name,
      sourceName,
      canViewBoard ? boardName : null,
      canViewGrade ? gradeName : null
    ].filter(Boolean);

    setActiveScopeTitle(scopeParts.join(' → '));
    setStatusModalTotalLeads(totalLeads || 0);
    setIsStatusModalOpen(true);
    setLoadingStatusModal(true);

    try {
      const res = await getLeadStatusSegregationAnalytics({
        courseTypeId: selectedCourseType.id,
        leadSourceId,
        boardId: (canViewBoard && boardId) ? boardId : undefined,
        gradeId: (canViewGrade && gradeId) ? gradeId : undefined
      });
      if (res?.success) {
        setStatusModalData(res.data);
      }
    } catch (err) {
      console.error('Failed to load lead status analytics:', err);
    } finally {
      setLoadingStatusModal(false);
    }
  };

  // Filter sources by search term
  const filteredSources = useMemo(() => {
    if (!matrixData?.sources || !canViewSource) return [];
    if (!searchTerm.trim()) return matrixData.sources;
    const term = searchTerm.toLowerCase();

    return matrixData.sources.filter((s) => {
      const matchSource = s.sourceName?.toLowerCase().includes(term);
      const matchBoard = canViewBoard && s.boards?.some(
        (b) =>
          b.boardName?.toLowerCase().includes(term) ||
          (canViewGrade && b.grades?.some((g) => g.gradeName?.toLowerCase().includes(term)))
      );
      return matchSource || matchBoard;
    });
  }, [matrixData, searchTerm, canViewSource, canViewBoard, canViewGrade]);

  // Access denied screen if base permission is missing
  if (!canView) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center max-w-md">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-sm text-gray-600 mb-6">
            You do not have permission to view Data Segregation. Please contact your administrator.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-all cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Data Segregation Matrix</h1>
              <p className="text-sm text-gray-500">
                Multi-level hierarchical breakdown by Category → Data Source → Specialization → Grade
              </p>
            </div>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => selectedCourseType && fetchMatrix(selectedCourseType.id)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium text-sm rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <svg className={`w-4 h-4 ${loadingMatrix ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>

          {selectedCourseType && canViewCourseType && (
            <button
              onClick={() =>
                navigateToLeads({
                  courseTypeId: selectedCourseType.id
                })
              }
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Whole Category Data
            </button>
          )}
        </div>
      </div>

      {/* Course Type Navigation Cards / Tabs (if permitted) */}
      {canViewCourseType && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
            Select Category (Course Type)
          </label>
          {loadingCourseTypes ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {courseTypes.map((ct) => {
                const isSelected = selectedCourseType?.id === ct.id;
                return (
                  <div
                    key={ct.id}
                    onClick={() => setSelectedCourseType(ct)}
                    className={`relative p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-blue-600 shadow-md scale-[1.02]'
                        : 'bg-white hover:bg-gray-50/80 text-gray-800 border-gray-200 shadow-2xs hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="font-bold text-base tracking-tight truncate" title={ct.name}>
                        {ct.name}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-white/30"></span>
                      )}
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>Total Leads</span>
                      <span className={`text-lg font-black ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                        {ct.totalLeads}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Overview Statistics Banner */}
      {matrixData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Leads</p>
              <h3 className="text-2xl font-bold text-gray-900">{matrixData.totalLeads}</h3>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Allotted Data</p>
              <h3 className="text-2xl font-bold text-indigo-700">{matrixData.allottedLeads}</h3>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unallotted Data</p>
              <h3 className="text-2xl font-bold text-amber-700">{matrixData.unallottedLeads}</h3>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Availed Data</p>
              <h3 className="text-2xl font-bold text-emerald-700">{matrixData.availedLeads}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Main Hierarchical Matrix Table Card (if source viewing permitted) */}
      {canViewSource ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          
          {/* Table Toolbar */}
          <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={
                  canViewGrade
                    ? 'Search Source, Specialization, Grade...'
                    : canViewBoard
                    ? 'Search Source, Specialization...'
                    : 'Search Source...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
              />
            </div>

            {canViewBoard && (
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleExpandCollapseAll}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg shadow-2xs cursor-pointer"
                >
                  {isAllExpanded ? 'Collapse All' : 'Expand All'}
                </button>
              </div>
            )}
          </div>

          {/* Hierarchical Table */}
          <div className="overflow-x-auto">
            {loadingMatrix ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-gray-600">Loading segregation breakdown...</p>
              </div>
            ) : matrixError ? (
              <div className="py-16 text-center text-red-600">
                <p className="font-semibold">{matrixError}</p>
              </div>
            ) : filteredSources.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-gray-500 font-medium">No segregation data found for this selection.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-100/90 text-gray-700 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-3.5 px-6 min-w-[320px]">
                      Hierarchy ({
                        ['Source', canViewBoard ? 'Specialization' : null, canViewGrade ? 'Grade' : null]
                          .filter(Boolean)
                          .join(' → ')
                      })
                    </th>
                    <th className="py-3.5 px-4 text-center min-w-[100px]">Total Leads</th>
                    <th className="py-3.5 px-4 text-center min-w-[100px]">Allotted</th>
                    <th className="py-3.5 px-4 text-center min-w-[100px]">Unallotted</th>
                    <th className="py-3.5 px-4 text-center min-w-[100px]">Availed</th>
                    <th className="py-3.5 px-6 text-right min-w-[280px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSources.map((source) => {
                    const sourceKey = `source-${source.sourceId}`;
                    const isSourceExpanded = expandedNodes.has(sourceKey);
                    const hasBoards = canViewBoard && source.boards && source.boards.length > 0;

                    return (
                      <React.Fragment key={source.sourceId}>
                        {/* LEVEL 1: LEAD SOURCE ROW */}
                        <tr className="bg-blue-50/30 hover:bg-blue-50/70 transition-colors font-medium border-t-2 border-gray-200">
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-3">
                              {canViewBoard && hasBoards ? (
                                <button
                                  onClick={() => toggleNode(sourceKey)}
                                  className={`p-1 rounded-md hover:bg-blue-200/60 transition-transform cursor-pointer ${
                                    isSourceExpanded ? 'rotate-90 text-blue-700' : 'text-gray-500'
                                  }`}
                                  title={isSourceExpanded ? 'Collapse' : 'Expand'}
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                              ) : (
                                <div className="w-6"></div>
                              )}
                              <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                                S
                              </span>
                              <div>
                                <span className="font-bold text-gray-900 text-base">{source.sourceName}</span>
                                {source.sourceCode && (
                                  <span className="ml-2 text-xs text-gray-500 font-mono">({source.sourceCode})</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-gray-900 bg-white/40">{source.total}</td>
                          <td className="py-3 px-4 text-center font-semibold text-indigo-700">{source.allotted}</td>
                          <td className="py-3 px-4 text-center font-semibold text-amber-700">{source.unallotted}</td>
                          <td className="py-3 px-4 text-center font-semibold text-emerald-700">{source.availed}</td>
                          <td className="py-3 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* View Whole Data */}
                              <button
                                onClick={() =>
                                  navigateToLeads({
                                    courseTypeId: selectedCourseType?.id,
                                    leadSourceId: source.sourceId,
                                    sourceName: source.sourceName
                                  })
                                }
                                className="px-2.5 py-1 bg-white hover:bg-gray-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold shadow-2xs hover:shadow transition-all cursor-pointer"
                                title="View leads for this source"
                              >
                                View Leads
                              </button>

                              {/* User Analytics */}
                              {canViewUserAnalytics && (
                                <button
                                  onClick={() =>
                                    handleOpenUserAnalytics({
                                      leadSourceId: source.sourceId,
                                      sourceName: source.sourceName
                                    })
                                  }
                                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs hover:shadow transition-all cursor-pointer"
                                  title="View user breakdown"
                                >
                                  Users
                                </button>
                              )}

                              {/* Status Matrix */}
                              {canViewStatusAnalytics && (
                                <button
                                  onClick={() =>
                                    handleOpenStatusAnalytics({
                                      leadSourceId: source.sourceId,
                                      sourceName: source.sourceName,
                                      totalLeads: source.total
                                    })
                                  }
                                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-2xs hover:shadow transition-all cursor-pointer"
                                  title="View lead status breakdown"
                                >
                                  Status Matrix
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* LEVEL 2: BOARDS (if permitted) */}
                        {canViewBoard &&
                          isSourceExpanded &&
                          hasBoards &&
                          source.boards.map((board) => {
                            const boardKey = `board-${source.sourceId}-${board.boardId}`;
                            const isBoardExpanded = expandedNodes.has(boardKey);
                            const hasGrades = canViewGrade && board.grades && board.grades.length > 0;

                            return (
                              <React.Fragment key={board.boardId || board.boardName}>
                                <tr className="bg-gray-50/80 hover:bg-indigo-50/40 transition-colors">
                                  <td className="py-2.5 px-6 pl-14">
                                    <div className="flex items-center gap-2.5">
                                      {canViewGrade && hasGrades ? (
                                        <button
                                          onClick={() => toggleNode(boardKey)}
                                          className={`p-1 rounded-md hover:bg-gray-200 transition-transform cursor-pointer ${
                                            isBoardExpanded ? 'rotate-90 text-indigo-700' : 'text-gray-400'
                                          }`}
                                        >
                                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                          </svg>
                                        </button>
                                      ) : (
                                        <div className="w-5.5"></div>
                                      )}
                                      <span className="w-5.5 h-5.5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                                        B
                                      </span>
                                      <span className="font-semibold text-gray-800">{board.boardName}</span>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-4 text-center font-bold text-gray-900">{board.total}</td>
                                  <td className="py-2.5 px-4 text-center text-indigo-600 font-medium">{board.allotted}</td>
                                  <td className="py-2.5 px-4 text-center text-amber-600 font-medium">{board.unallotted}</td>
                                  <td className="py-2.5 px-4 text-center text-emerald-600 font-medium">{board.availed}</td>
                                  <td className="py-2.5 px-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() =>
                                          navigateToLeads({
                                            courseTypeId: selectedCourseType?.id,
                                            leadSourceId: source.sourceId,
                                            sourceName: source.sourceName,
                                            boardId: board.boardId,
                                            boardName: board.boardName
                                          })
                                        }
                                        className="px-2 py-0.5 bg-white hover:bg-gray-100 text-blue-700 border border-blue-200 rounded text-xs font-medium cursor-pointer"
                                      >
                                        Leads
                                      </button>
                                      {canViewUserAnalytics && (
                                        <button
                                          onClick={() =>
                                            handleOpenUserAnalytics({
                                              leadSourceId: source.sourceId,
                                              sourceName: source.sourceName,
                                              boardId: board.boardId,
                                              boardName: board.boardName
                                            })
                                          }
                                          className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-medium cursor-pointer"
                                        >
                                          Users
                                        </button>
                                      )}
                                      {canViewStatusAnalytics && (
                                        <button
                                          onClick={() =>
                                            handleOpenStatusAnalytics({
                                              leadSourceId: source.sourceId,
                                              sourceName: source.sourceName,
                                              boardId: board.boardId,
                                              boardName: board.boardName,
                                              totalLeads: board.total
                                            })
                                          }
                                          className="px-2 py-0.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded text-xs font-medium cursor-pointer"
                                        >
                                          Status
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>

                                {/* LEVEL 3: GRADES (if permitted) */}
                                {canViewGrade &&
                                  isBoardExpanded &&
                                  hasGrades &&
                                  board.grades.map((grade) => (
                                    <tr key={grade.gradeId || grade.gradeName} className="bg-white hover:bg-gray-50/60 transition-colors">
                                      <td className="py-2 px-6 pl-24">
                                        <div className="flex items-center gap-2">
                                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                          <span className="w-5 h-5 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-[10px]">
                                            G
                                          </span>
                                          <span className="text-gray-700 font-medium">{grade.gradeName}</span>
                                        </div>
                                      </td>
                                      <td className="py-2 px-4 text-center font-semibold text-gray-800">{grade.total}</td>
                                      <td className="py-2 px-4 text-center text-indigo-600 text-xs">{grade.allotted}</td>
                                      <td className="py-2 px-4 text-center text-amber-600 text-xs">{grade.unallotted}</td>
                                      <td className="py-2 px-4 text-center text-emerald-600 text-xs">{grade.availed}</td>
                                      <td className="py-2 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                          <button
                                            onClick={() =>
                                              navigateToLeads({
                                                courseTypeId: selectedCourseType?.id,
                                                leadSourceId: source.sourceId,
                                                sourceName: source.sourceName,
                                                boardId: board.boardId,
                                                boardName: board.boardName,
                                                gradeId: grade.gradeId,
                                                gradeName: grade.gradeName
                                              })
                                            }
                                            className="px-2 py-0.5 bg-gray-50 hover:bg-gray-100 text-blue-600 border border-gray-200 rounded text-xs cursor-pointer"
                                          >
                                            Leads
                                          </button>
                                          {canViewUserAnalytics && (
                                            <button
                                              onClick={() =>
                                                handleOpenUserAnalytics({
                                                  leadSourceId: source.sourceId,
                                                  sourceName: source.sourceName,
                                                  boardId: board.boardId,
                                                  boardName: board.boardName,
                                                  gradeId: grade.gradeId,
                                                  gradeName: grade.gradeName
                                                })
                                              }
                                              className="px-2 py-0.5 bg-blue-50/60 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded text-xs cursor-pointer"
                                            >
                                              Users
                                            </button>
                                          )}
                                          {canViewStatusAnalytics && (
                                            <button
                                              onClick={() =>
                                                handleOpenStatusAnalytics({
                                                  leadSourceId: source.sourceId,
                                                  sourceName: source.sourceName,
                                                  boardId: board.boardId,
                                                  boardName: board.boardName,
                                                  gradeId: grade.gradeId,
                                                  gradeName: grade.gradeName,
                                                  totalLeads: grade.total
                                                })
                                              }
                                              className="px-2 py-0.5 bg-purple-50/60 hover:bg-purple-100 text-purple-600 border border-purple-100 rounded text-xs cursor-pointer"
                                            >
                                              Status
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                              </React.Fragment>
                            );
                          })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-2xs text-center">
          <p className="text-gray-500 font-medium">Source breakdown is not available under your current permissions.</p>
        </div>
      )}

      {/* User Analytics Modal */}
      {canViewUserAnalytics && (
        <UserSegregationAnalyticsModal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          data={userModalData}
          loading={loadingUserModal}
          scopeTitle={activeScopeTitle}
          onViewUserData={(user) => {
            setIsUserModalOpen(false);
            navigateToLeads({
              courseTypeId: userModalData?.courseTypeId,
              leadSourceId: userModalData?.leadSourceId,
              boardId: userModalData?.boardId,
              gradeId: userModalData?.gradeId,
              assignedUserId: user.userId,
              userName: user.fullName || user.username
            });
          }}
        />
      )}

      {/* Lead Status Analytics Modal */}
      {canViewStatusAnalytics && (
        <LeadStatusSegregationModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          data={statusModalData}
          loading={loadingStatusModal}
          scopeTitle={activeScopeTitle}
          totalScopeLeads={statusModalTotalLeads}
          onViewStatusData={(status) => {
            setIsStatusModalOpen(false);
            navigateToLeads({
              courseTypeId: selectedCourseType?.id,
              statusId: status.statusId,
              statusName: status.name
            });
          }}
        />
      )}
    </div>
  );
};

export default DataSegregation;
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { usePermissions } from '../PermissionContext';
import { canViewLeadField } from '../config/leadFieldPermissions';
import { toast } from 'react-toastify';
import CustomButton from '../component/reusable/CustomButton';
import ScheduleModal from "../component/reusable/Leads/scheduleModel";
import CallModal from '../component/reusable/CallModal';
import WhatsAppModal from '../component/reusable/WhatsAppModal';
import EmailModal from '../component/reusable/EmailModal';
import LeadRemarkModal from '../component/reusable/Leads/LeadRemarkModal';
import PlanUniversityVisitModal from '../component/reusable/Leads/PlanUniversityVisitModal';
import ReusableTable from '../component/reusable/table';
import {
  createLeadSchedule,
  getLeadById,
  getLeadInfoPanel,
  sendLeadWhatsApp,
  sendLeadEmail,
  changeLeadStatus,
  getLeadStatusHistory,
  getLeadFollowUps,
  manualApproveLeadRegistration,
  retryCmsStudentVerification,
  getLeadAssignmentHistory
} from '../Services/lead/leadService';
import { getCoursesDropdown } from '../Services/drop-down/dropDownService';
import { completeFollowup, cancelFollowup, markFollowupNotConnected } from '../Services/followUp/followService';

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { navTo, showToast, openAddLeadModal, leadRefreshTrigger } = useAppContext();
  const { hasPermission } = usePermissions();

  // Modals state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);

  // Data state
  const [leadDetails, setLeadDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [statusHistoryLoading, setStatusHistoryLoading] = useState(false);
  const [followUps, setFollowUps] = useState([]);
  const [followUpsLoading, setFollowUpsLoading] = useState(false);
  const [assignmentHistory, setAssignmentHistory] = useState([]);

  // Course & Info Panel state
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [communicationConfig, setCommunicationConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(false);

  // Manual Registration Approval state
  const [isManualApproveModalOpen, setIsManualApproveModalOpen] = useState(false);
  const [manualApproveCourseId, setManualApproveCourseId] = useState('');
  const [manualApproveEnrollmentId, setManualApproveEnrollmentId] = useState('');
  const [manualApproveRemarks, setManualApproveRemarks] = useState('');
  const [manualApproveSubmitting, setManualApproveSubmitting] = useState(false);
  const [isRetryingCms, setIsRetryingCms] = useState(false);

  // Searchable course dropdown state
  const [courseSearch, setCourseSearch] = useState('');
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [selectedCourseObj, setSelectedCourseObj] = useState(null);
  const courseDropdownRef = useRef(null);
  const courseSearchDebounceRef = useRef(null);

  // Centralized full data loader to guarantee fresh data & prevent stale data
  const loadLeadData = useCallback(async (isInitial = false) => {
    if (!id) return;
    if (isInitial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const [leadRes, historyRes, followupsRes] = await Promise.allSettled([
        getLeadById(id),
        getLeadStatusHistory(id, { page: 0, size: 50, sortBy: 'changedAt', sortDirection: 'desc' }),
        getLeadFollowUps(id)
      ]);

      if (leadRes.status === 'fulfilled' && leadRes.value?.data?.success) {
        setLeadDetails(leadRes.value.data.data);
      } else if (leadRes.status === 'rejected') {
        console.error("Failed to fetch lead details", leadRes.reason);
      }

      if (historyRes.status === 'fulfilled' && historyRes.value?.data?.success && historyRes.value.data.data?.content) {
        setStatusHistory(historyRes.value.data.data.content);
      } else {
        setStatusHistory([]);
      }

      if (followupsRes.status === 'fulfilled' && followupsRes.value?.data?.success && followupsRes.value.data.data) {
        setFollowUps(followupsRes.value.data.data);
      } else {
        setFollowUps([]);
      }

      // Optionally fetch assignment history if permission exists
      if (hasPermission('LEAD_HISTORY_READ')) {
        try {
          const assignRes = await getLeadAssignmentHistory(id);
          if (assignRes?.data?.success && Array.isArray(assignRes.data.data)) {
            setAssignmentHistory(assignRes.data.data);
          }
        } catch (e) {
          // assignment history is optional
        }
      }
    } catch (err) {
      console.error("Failed to load lead data", err);
      showToast("Failed to load lead information", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, hasPermission, showToast]);

  // Initial fetch on route id change (clearing previous state immediately to avoid ghost/stale data)
  useEffect(() => {
    setLeadDetails(null);
    setStatusHistory([]);
    setFollowUps([]);
    loadLeadData(true);
  }, [id, loadLeadData]);

  // Re-fetch automatically whenever a modal completes an update and fires leadRefreshTrigger
  useEffect(() => {
    if (id && leadRefreshTrigger > 0) {
      loadLeadData(false);
    }
  }, [leadRefreshTrigger, id, loadLeadData]);

  // Auto-select interested course when lead details are loaded
  useEffect(() => {
    if (leadDetails) {
      const interestedCourse = leadDetails.course || leadDetails.registeredCourse || leadDetails.interestedCourses?.[0];
      if (interestedCourse?.id) {
        setSelectedCourse(interestedCourse.id);
        setSelectedCourseObj(interestedCourse);
      }
    }
  }, [leadDetails]);

  // Search courses dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true);
      try {
        const res = await getCoursesDropdown('', '', courseSearch);
        if (res?.success && res?.data) {
          setCourses(res.data);
        } else {
          setCourses([]);
        }
      } catch (err) {
        console.error("Failed to fetch courses", err);
        setCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    };

    if (courseSearchDebounceRef.current) clearTimeout(courseSearchDebounceRef.current);
    courseSearchDebounceRef.current = setTimeout(() => {
      fetchCourses();
    }, 300);

    return () => {
      if (courseSearchDebounceRef.current) clearTimeout(courseSearchDebounceRef.current);
    };
  }, [courseSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(e.target)) {
        setIsCourseDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Info Panel config when course selection changes
  useEffect(() => {
    const fetchInfoPanel = async () => {
      if (selectedCourse && id) {
        setConfigLoading(true);
        try {
          const res = await getLeadInfoPanel(id, selectedCourse);
          if (res?.data?.success) {
            setCommunicationConfig(res.data.data);
          } else {
            setCommunicationConfig(null);
          }
        } catch (err) {
          console.error("Failed to fetch info panel", err);
          setCommunicationConfig(null);
        } finally {
          setConfigLoading(false);
        }
      } else {
        setCommunicationConfig(null);
      }
    };
    fetchInfoPanel();
  }, [selectedCourse, id]);

  // Format Helpers
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    try {
      const [h, m] = timeString.split(':');
      const hour = parseInt(h, 10);
      const period = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${m} ${period}`;
    } catch {
      return timeString;
    }
  };

  const getStatusColor = (status) => {
    const statusValue = typeof status === 'object' ? status?.name || status?.code : status;
    switch (statusValue?.toLowerCase()) {
      case 'connected': return 'bg-green-100 text-green-700';
      case 'not connected': return 'bg-red-100 text-red-700';
      case 'interested': return 'bg-blue-100 text-blue-700';
      case 'follow up': return 'bg-orange-100 text-orange-700';
      case 'raw': return 'bg-purple-100 text-purple-700';
      case 'registered': return 'bg-emerald-100 text-emerald-700';
      case 'converted': return 'bg-green-100 text-green-700';
      case 'lost': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Status history table columns
  const statusHistoryColumns = [
    {
      key: 'sno',
      header: 'S.No',
      render: (_, __, index) => index + 1,
    },
    {
      key: 'status',
      header: 'Status',
      render: (value, row) => {
        const statusObj = row?.newStatus || row?.currentStatus || row?.status;
        const statusValue = typeof statusObj === 'object' ? statusObj?.name || statusObj?.code || '-' : statusObj || '-';
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(statusValue)}`}>
            {statusValue}
          </span>
        );
      },
    },
    {
      key: 'changedAt',
      header: 'Changed At',
      render: (value) => formatDateTime(value),
    },
    {
      key: 'changedBy',
      header: 'Changed By',
      render: (value, row) =>
        row?.changedBy?.firstName && row?.changedBy?.lastName
          ? `${row.changedBy.firstName} ${row.changedBy.lastName}`
          : row?.changedBy?.username || row?.changedBy || '-',
    },
    {
      key: 'remarks',
      header: 'Remarks',
      render: (value, row) => row?.feedback || row?.remarks || value || '-',
    },
  ];

  // Follow-ups table columns
  const followUpsColumns = [
    {
      key: 'sno',
      header: 'S.No',
      render: (_, __, index) => index + 1,
    },
    {
      key: 'followUpDate',
      header: 'Follow-up Date',
      render: (value) => formatDate(value),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => {
        const statusValue = value || '-';
        let statusColor = 'bg-gray-100 text-gray-700';
        if (statusValue === 'PENDING') statusColor = 'bg-amber-100 text-amber-800';
        if (statusValue === 'COMPLETED') statusColor = 'bg-green-100 text-green-700';
        if (statusValue === 'CANCELLED') statusColor = 'bg-red-100 text-red-700';
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
            {statusValue}
          </span>
        );
      },
    },
    {
      key: 'completed',
      header: 'Completed',
      render: (value) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'completedAt',
      header: 'Completed At',
      render: (value) => formatDateTime(value),
    },
    {
      key: 'createdBy',
      header: 'Created By',
      render: (value, row) =>
        row?.createdBy?.firstName && row?.createdBy?.lastName
          ? `${row.createdBy.firstName} ${row.createdBy.lastName}`
          : row?.createdBy?.username || row?.createdBy || '-',
    },
    {
      key: 'remarks',
      header: 'Remarks',
      render: (value) => value || '-',
    },
  ];

  // Derived Business Flags
  const userRole = localStorage.getItem('userRole')?.toUpperCase() || '';
  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

  const statusName = leadDetails?.currentStatus?.name || leadDetails?.currentStatus?.code || 'N/A';
  const assignedToName = leadDetails?.assignedTo?.firstName && leadDetails?.assignedTo?.lastName
    ? `${leadDetails.assignedTo.firstName} ${leadDetails.assignedTo.lastName}`
    : leadDetails?.assignedTo?.username || 'Unassigned';

  const createdByName = leadDetails?.createdBy?.firstName && leadDetails?.createdBy?.lastName
    ? `${leadDetails.createdBy.firstName} ${leadDetails.createdBy.lastName}`
    : leadDetails?.createdBy?.username || 'System';

  const isFinallyNotConnected = statusName === 'Finally Not Connected' || statusName === 'Bad' || statusName === 'Not Interested';
  const hasPendingFollowup = followUps.some(f => f.status === 'PENDING' && !f.completed);
  const followUpStatus = leadDetails?.currentStatus?.followUpStatus || false;

  // Lead Registration Verification Status
  const isRegistrationVerified = Boolean(
    leadDetails?.registrationStatus === 'COMPLETED_MATCHED' ||
    leadDetails?.registrationStatus === 'MANUALLY_APPROVED' ||
    leadDetails?.registrationStatus === 'VERIFIED' ||
    leadDetails?.registrationStatus === 'REGISTERED_VERIFIED' ||
    leadDetails?.registrationStatus === 'APPROVED' ||
    leadDetails?.isRegistrationVerified ||
    leadDetails?.registrationVerified
  );

  // Multi-Source Business Logic (as defined by backend Lead entity and leadSources collection)
  const isMultiSource = useMemo(() => {
    if (!leadDetails) return false;
    return Boolean(
      leadDetails.isMultiSource === true ||
      leadDetails.multiSource === true ||
      (Array.isArray(leadDetails.leadSources) && leadDetails.leadSources.length > 1)
    );
  }, [leadDetails]);

  // Availed & Allotted logic (user terminology: availed & unAvailed, alloted & unAlloted)
  const isAvailed = Boolean(leadDetails?.isAvailed || leadDetails?.availed);
  const isAllotted = Boolean(leadDetails?.assignedTo);

  // Copy to clipboard helper
  const copyToClipboard = (text, label) => {
    if (!text || text === '-' || text === 'Not specified') return;
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  // Data Quality / Unmapped Fields Analysis
  const missingMappingFields = useMemo(() => {
    if (!leadDetails) return [];
    const missing = [];

    // Course
    const hasCourse = Boolean(
      leadDetails.course?.courseName ||
      leadDetails.registeredCourse?.courseName ||
      (Array.isArray(leadDetails.interestedCourses) && leadDetails.interestedCourses.length > 0)
    );
    if (!hasCourse && canViewLeadField(hasPermission, 'course')) {
      missing.push({ key: 'course', label: 'Course' });
    }

    // Course Type
    const hasCourseType = Boolean(
      (Array.isArray(leadDetails.interestedCourseTypes) && leadDetails.interestedCourseTypes.length > 0) ||
      leadDetails.course?.courseType
    );
    if (!hasCourseType && canViewLeadField(hasPermission, 'courseType')) {
      missing.push({ key: 'courseType', label: 'Course Type' });
    }

    // Grade
    if (!leadDetails.grade?.name && canViewLeadField(hasPermission, 'grade')) {
      missing.push({ key: 'grade', label: 'Grade' });
    }

    // Board
    if (!leadDetails.board?.name && canViewLeadField(hasPermission, 'board')) {
      missing.push({ key: 'board', label: 'Board' });
    }

    // Lead Source
    const hasSource = Boolean(
      (Array.isArray(leadDetails.leadSources) && leadDetails.leadSources.length > 0) ||
      leadDetails.sourceDetails
    );
    if (!hasSource && canViewLeadField(hasPermission, 'leadSources')) {
      missing.push({ key: 'source', label: 'Lead Source' });
    }

    // Program / School
    if (!leadDetails.program?.name && canViewLeadField(hasPermission, 'program')) {
      missing.push({ key: 'program', label: 'Program / School' });
    }

    // Department
    if (!leadDetails.department?.name && canViewLeadField(hasPermission, 'department')) {
      missing.push({ key: 'department', label: 'Department' });
    }

    // Counselor / Assigned User
    if (!leadDetails.assignedTo && canViewLeadField(hasPermission, 'assignedTo')) {
      missing.push({ key: 'assignedTo', label: 'Assigned Counselor' });
    }

    return missing;
  }, [leadDetails, hasPermission]);

  // Edit Lead Action
  const handleEditLeadClick = () => {
    if (!leadDetails) return;
    const editPayload = {
      id: leadDetails.id ?? leadDetails.leadId,
      leadId: leadDetails.id ?? leadDetails.leadId,
      fullName: leadDetails.fullName || '',
      phoneNumber: leadDetails.phoneNumber || '',
      alternatePhoneNumber: leadDetails.alternatePhoneNumber || '',
      email: leadDetails.email || '',
      city: leadDetails.city || '',
      state: leadDetails.state || '',
      country: leadDetails.country || '',
      preferredStudyState: leadDetails.preferredStudyState || '',
      preferredStudyCity: leadDetails.preferredStudyCity || '',
      planningToVisitUniversity: leadDetails.planningToVisitUniversity || false,
      visitDate: leadDetails.visitDate || '',
      visitTime: leadDetails.visitTime || '',
      visitRemarks: leadDetails.visitRemarks || '',
      leadSourceIds: leadDetails.leadSources?.map((s) => s.id) || [],
      sourceDetails: leadDetails.sourceDetails || '',
      interestedCourseIds: leadDetails.interestedCourses?.map((c) => c.id) || [],
      courseId: leadDetails.course?.id || '',
      registeredCourseId: leadDetails.registeredCourse?.id || '',
      registrationStatus: leadDetails.registrationStatus || '',
      isRegistrationVerified,
      programId: leadDetails.program?.id || '',
      boardId: leadDetails.board?.id || '',
      gradeId: leadDetails.grade?.id || '',
      departmentId: leadDetails.department?.id || '',
      remarks: leadDetails.remarks || '',
      assignedToUserId: leadDetails.assignedTo?.id || '',
      statusId: leadDetails.currentStatus?.id || '',
      active: leadDetails.active !== undefined ? leadDetails.active : true,
      nextFollowUpDate: leadDetails.nextFollowUpDate || '',
    };
    openAddLeadModal(editPayload);
  };

  // Schedule follow-up handler
  const handleScheduleSubmit = async (formData) => {
    try {
      const response = await createLeadSchedule(id, formData);
      if (response?.data?.success) {
        showToast('Follow-up scheduled successfully');

        if (formData.leadStatus && formData.leadStatusCode) {
          try {
            await changeLeadStatus(id, {
              newStatusId: formData.leadStatus,
              statusCode: formData.leadStatusCode,
              feedback: formData.remarks || ""
            });
          } catch (error) {
            console.error('Error changing lead status in background:', error);
          }
        }
        await loadLeadData(false);
        return true;
      } else {
        showToast(response?.data?.message || 'Unable to schedule follow-up', 'error');
        return false;
      }
    } catch (error) {
      console.error('Failed to schedule follow-up', error);
      showToast('Failed to schedule follow-up', 'error');
      return false;
    }
  };

  // WhatsApp & Email handlers
  const handleWhatsAppSend = async (payload) => {
    const response = await sendLeadWhatsApp(id, payload);
    if (response?.data?.success) {
      showToast('WhatsApp message sent successfully');
    } else {
      const msg = response?.data?.message || 'Failed to send WhatsApp message';
      showToast(msg);
      throw new Error(msg);
    }
  };

  const handleEmailSend = async (payload) => {
    const response = await sendLeadEmail(id, payload);
    if (response?.data?.success) {
      showToast('Email sent successfully');
    } else {
      const msg = response?.data?.message || 'Failed to send email';
      showToast(msg);
      throw new Error(msg);
    }
  };

  // Status & Registration Handlers
  const handleRegisteredClick = async () => {
    try {
      setRefreshing(true);
      const response = await changeLeadStatus(id, {
        newStatusId: leadDetails.currentStatus?.id,
        statusCode: 'REGISTERED',
        feedback: 'Lead marked as registered'
      });

      if (response?.data?.success) {
        toast.success('Student verified with CMS & registered successfully!');
      } else {
        toast.error(response?.data?.message || 'Failed to change lead status');
      }
    } catch (error) {
      console.error('Failed to register lead with CMS check', error);
      const errMsg = error?.response?.data?.message || error?.message || 'CMS verification failed. Lead not registered.';
      toast.error(errMsg);
    } finally {
      await loadLeadData(false);
    }
  };

  const handleOpenManualApproveModal = () => {
    const courseId = leadDetails?.registeredCourse?.id || leadDetails?.course?.id || leadDetails?.interestedCourses?.[0]?.id || '';
    setManualApproveCourseId(courseId);
    setManualApproveEnrollmentId(leadDetails?.enrollmentId || '');
    setManualApproveRemarks('');
    setIsManualApproveModalOpen(true);
  };

  const handleManualApproveSubmit = async (e) => {
    e.preventDefault();
    if (!manualApproveCourseId) {
      toast.error('Please select the registered course');
      return;
    }
    try {
      setManualApproveSubmitting(true);
      const res = await manualApproveLeadRegistration(id, {
        registeredCourseId: manualApproveCourseId,
        enrollmentId: manualApproveEnrollmentId ? manualApproveEnrollmentId.trim() : null,
        remarks: manualApproveRemarks ? manualApproveRemarks.trim() : null,
      });
      if (res?.data?.success) {
        toast.success('Registration manually approved successfully!');
        setIsManualApproveModalOpen(false);
        await loadLeadData(false);
      } else {
        toast.error(res?.data?.message || 'Failed to approve registration');
      }
    } catch (err) {
      console.error('Error approving registration:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to approve registration');
    } finally {
      setManualApproveSubmitting(false);
    }
  };

  const handleRetryCms = async () => {
    try {
      setIsRetryingCms(true);
      const res = await retryCmsStudentVerification(id);
      if (res?.data?.success) {
        toast.success('CMS verification successful & student registered!');
      } else {
        toast.error(res?.data?.message || 'CMS verification failed');
      }
    } catch (err) {
      console.error('Error retrying CMS verification:', err);
      toast.error(err?.response?.data?.message || err?.message || 'CMS verification failed');
    } finally {
      setIsRetryingCms(false);
      await loadLeadData(false);
    }
  };

  const handleCompleteFollowup = async () => {
    try {
      const pendingFollowup = followUps.find(f => f.status === 'PENDING' && !f.completed);
      if (!pendingFollowup) {
        toast.error('No pending follow-up found to complete');
        return;
      }
      const response = await completeFollowup(pendingFollowup.id, {
        feedback: 'Follow-up completed',
        remarks: 'Marked as completed for follow-up'
      });
      if (response?.success) {
        toast.success('Follow-up marked as completed successfully');
      } else {
        toast.error(response?.message || 'Failed to complete follow-up');
      }
    } catch (error) {
      console.error('Failed to complete follow-up', error);
      toast.error('Failed to complete follow-up');
    } finally {
      await loadLeadData(false);
    }
  };

  const handleCancelFollowup = async () => {
    try {
      const pendingFollowup = followUps.find(f => f.status === 'PENDING' && !f.completed);
      if (!pendingFollowup) {
        toast.error('No pending follow-up found to cancel');
        return;
      }
      const response = await cancelFollowup(pendingFollowup.id, {
        feedback: 'Follow-up cancelled',
        remarks: 'Marked as cancelled for follow-up'
      });
      if (response?.success) {
        toast.success('Follow-up marked as cancelled successfully');
      } else {
        toast.error(response?.message || 'Failed to cancel follow-up');
      }
    } catch (error) {
      console.error('Failed to cancel follow-up', error);
      toast.error('Failed to cancel follow-up');
    } finally {
      await loadLeadData(false);
    }
  };

  const handleFollowupNotConnected = async () => {
    try {
      const activeFollowup = followUps.find(f => (f.status === 'PENDING' || f.status === 'UPCOMING') && !f.completed);
      if (!activeFollowup) {
        toast.error('No active follow-up found to mark as not connected');
        return;
      }
      const response = await markFollowupNotConnected(activeFollowup.id, {
        remarks: 'Follow-up call not attended / unanswered by student'
      });
      if (response?.success || response?.data) {
        toast.success('Follow-up marked as Not Connected and Lead status synchronized successfully');
        setIsCallModalOpen(false);
      } else {
        toast.error(response?.message || 'Failed to mark follow-up as not connected');
      }
    } catch (error) {
      console.error('Failed to mark follow-up as not connected', error);
      toast.error(error?.message || 'Failed to mark follow-up as not connected');
    } finally {
      await loadLeadData(false);
    }
  };

  const handleRemarkSave = async () => {
    await loadLeadData(false);
    showToast('Remark saved successfully');
  };

  // Initials for avatar
  const initials = useMemo(() => {
    const fullName = leadDetails?.fullName;
    return fullName ? fullName.substring(0, 2).toUpperCase() : '--';
  }, [leadDetails]);

  // Loading skeleton state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <svg className="animate-spin text-blue-600" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div className="text-gray-500 text-sm font-medium">Loading lead details...</div>
      </div>
    );
  }

  if (!leadDetails) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-lg mx-auto my-12 shadow-sm">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Lead Not Found</h3>
        <p className="text-sm text-gray-500 mb-6">The requested lead could not be found or you do not have permission to view it.</p>
        <CustomButton variant="primary" onClick={() => navigate(-1)}>
          Back to Leads
        </CustomButton>
      </div>
    );
  }

  return (
    <div className="block pb-12" id="page-lead-detail">
      {/* Top Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <button
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600 hover:text-gray-900"
            onClick={() => navigate(-1)}
            title="Back to Leads"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Lead Details</h1>
              <button
                onClick={() => loadLeadData(false)}
                disabled={refreshing}
                className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                title="Refresh Lead Data"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={refreshing ? 'animate-spin text-blue-600' : ''}
                >
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {hasPendingFollowup && !followUpStatus && (
            <CustomButton
              variant="primary"
              onClick={handleCancelFollowup}
              className="text-xs py-2 px-3.5 flex items-center gap-1.5 bg-red-600 hover:bg-red-700 shadow-sm"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Cancel Follow-Up
            </CustomButton>
          )}

          {hasPendingFollowup && !followUpStatus && (
            <CustomButton
              variant="primary"
              onClick={handleCompleteFollowup}
              className="text-xs py-2 px-3.5 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 shadow-sm"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Complete Follow-Up
            </CustomButton>
          )}

          {hasPendingFollowup && !followUpStatus && (
            <CustomButton
              variant="primary"
              onClick={handleFollowupNotConnected}
              className="text-xs py-2 px-3.5 flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 shadow-sm"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              Not Connected
            </CustomButton>
          )}

          {!isFinallyNotConnected && statusName !== 'Registered' && (
            <CustomButton
              variant="primary"
              onClick={handleRegisteredClick}
              className="text-xs py-2 px-3.5 flex items-center gap-1.5 bg-green-600 hover:bg-green-700 shadow-sm"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Mark as Registered
            </CustomButton>
          )}

          {leadDetails.assignedTo && !isFinallyNotConnected && !hasPendingFollowup && (
            <CustomButton
              variant="primary"
              onClick={() => setIsScheduleModalOpen(true)}
              className="text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              Schedule Follow-up
            </CustomButton>
          )}
        </div>
      </div>

      {/* Main Grid: Left 2 Cols (Content) | Right 1 Col (Info Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="flex flex-col gap-5 lg:col-span-2">

          {/* SECTION A: Lead Identity & Priority Overview Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-base font-bold shadow-sm shadow-blue-100 flex-shrink-0">
                  {canViewLeadField(hasPermission, 'fullName') ? initials : '?'}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                      {canViewLeadField(hasPermission, 'fullName') ? (leadDetails.fullName || 'N/A') : '••••••••'}
                    </h2>
                    {canViewLeadField(hasPermission, 'leadCode') && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                        {leadDetails.leadCode || 'NO-CODE'}
                      </span>
                    )}
                  </div>

                  {/* Top Business Status Badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {/* MULTI SOURCE (High Priority Indicator) */}
                    {canViewLeadField(hasPermission, 'leadSources') && isMultiSource && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-md shadow-purple-200 border border-purple-300 tracking-wide">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polygon points="12 2 2 7 12 12 22 7 12 2" />
                          <polyline points="2 17 12 22 22 17" />
                          <polyline points="2 12 12 17 22 12" />
                        </svg>
                        MULTI SOURCE
                      </span>
                    )}

                    {/* AVAILED / UNAVAILED BADGE */}
                    {canViewLeadField(hasPermission, 'isAvailed') && (
                      isAvailed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          AVAILED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                          UNAVAILED
                        </span>
                      )
                    )}

                    {/* ALLOTTED / UNALLOTTED BADGE */}
                    {canViewLeadField(hasPermission, 'assignedTo') && (
                      isAllotted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          ALLOTTED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          UNALLOTTED
                        </span>
                      )
                    )}

                    {/* UNMAPPED WARNING BADGE (if incomplete mapping exists - Admin only) */}
                    {isAdmin && missingMappingFields.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-300 shadow-xs">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        UNMAPPED
                      </span>
                    )}

                    {/* Current Status Badge */}
                    {canViewLeadField(hasPermission, 'currentStatus') && (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(statusName)} border-transparent`}>
                        {statusName}
                      </span>
                    )}

                    {/* Registration Status Badge */}
                    {leadDetails.registrationStatus && leadDetails.registrationStatus !== 'NONE' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs">
                        {leadDetails.registrationStatus === 'CHECK_PENDING' && 'Reg: Verification Pending'}
                        {leadDetails.registrationStatus === 'CHECK_REJECTED' && 'Reg: Check Rejected'}
                        {leadDetails.registrationStatus === 'COMPLETED_MATCHED' && 'Reg: CMS Verified'}
                        {leadDetails.registrationStatus === 'MANUALLY_APPROVED' && 'Reg: Manually Approved'}
                        {!['CHECK_PENDING', 'CHECK_REJECTED', 'COMPLETED_MATCHED', 'MANUALLY_APPROVED'].includes(leadDetails.registrationStatus) && `Reg: ${leadDetails.registrationStatus}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions Header */}
              <div className="flex items-center gap-2 self-end sm:self-start">
                {hasPermission('LEAD_UPDATE') && (
                  <button
                    onClick={handleEditLeadClick}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
                    title="Edit Lead"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                )}

                {!isFinallyNotConnected && (
                  <button
                    onClick={() => setIsCallModalOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
                    title="Call Lead"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    Call
                  </button>
                )}

                <button
                  onClick={() => setIsRemarkModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
                  title="Add Remark"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Remark
                </button>
              </div>
            </div>
          </div>

          {/* Registration Verification Alert (Slim, Elegant) */}
          {(leadDetails.registrationStatus === 'CHECK_REJECTED' || leadDetails.registrationStatus === 'CHECK_PENDING') && (
            <div className={`px-4 py-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${leadDetails.registrationStatus === 'CHECK_REJECTED' ? 'bg-red-50/60 border-red-200 text-red-800' : 'bg-amber-50/60 border-amber-200 text-amber-800'
              }`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${leadDetails.registrationStatus === 'CHECK_REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div>
                  <span className="font-bold mr-1.5">
                    {leadDetails.registrationStatus === 'CHECK_REJECTED' ? 'Registration Check Rejected:' : 'Registration Verification Pending:'}
                  </span>
                  <span className="text-gray-700">
                    {leadDetails.registrationCheckFailureReason || 'CMS verification not matched.'}
                  </span>
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleOpenManualApproveModal}
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-2xs"
                  >
                    Manually Approve
                  </button>
                  <button
                    onClick={handleRetryCms}
                    disabled={isRetryingCms}
                    className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors shadow-2xs disabled:opacity-50"
                  >
                    {isRetryingCms ? 'Retrying...' : 'Retry CMS'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SECTION B: Data Mapping Required Alert (Slim, Elegant - Admin only) */}
          {isAdmin && missingMappingFields.length > 0 && (
            <div className="px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-amber-900">Missing Mapping:</span>
                  <span className="text-gray-700">
                    {missingMappingFields.map(f => f.label).join(' · ')}
                  </span>
                </div>
              </div>

              {hasPermission('LEAD_UPDATE') && (
                <button
                  onClick={handleEditLeadClick}
                  className="px-3 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-2xs flex-shrink-0"
                >
                  Complete Mapping
                </button>
              )}
            </div>
          )}

          {/* SECTION C: Contact & Location Information */}
          {(canViewLeadField(hasPermission, 'phoneNumber') ||
            canViewLeadField(hasPermission, 'alternatePhoneNumber') ||
            canViewLeadField(hasPermission, 'email') ||
            canViewLeadField(hasPermission, 'city') ||
            canViewLeadField(hasPermission, 'state') ||
            canViewLeadField(hasPermission, 'country') ||
            canViewLeadField(hasPermission, 'preferredLocation') ||
            canViewLeadField(hasPermission, 'auditInfo') ||
            canViewLeadField(hasPermission, 'nextFollowUpDate')) && (
              <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-2xs">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 pb-2.5 border-b border-gray-100 flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-blue-600">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Contact & Location Details
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-4 gap-x-6 text-xs">
                  {canViewLeadField(hasPermission, 'phoneNumber') && (
                    <div>
                      <div className="text-[11px] font-medium text-gray-400">Phone Number</div>
                      <div className="text-sm font-bold text-gray-900 mt-1 flex items-center gap-1.5 font-mono">
                        {leadDetails.phoneNumber || <span className="text-gray-400 font-normal italic">Not specified</span>}
                        {leadDetails.phoneNumber && (
                          <button
                            onClick={() => copyToClipboard(leadDetails.phoneNumber, 'Phone number')}
                            className="text-gray-400 hover:text-blue-600 p-0.5 transition-colors"
                            title="Copy"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {canViewLeadField(hasPermission, 'alternatePhoneNumber') && (
                    <div>
                      <div className="text-[11px] font-medium text-gray-400">Alternate Phone</div>
                      <div className="text-sm font-bold text-gray-900 mt-1 flex items-center gap-1.5 font-mono">
                        {leadDetails.alternatePhoneNumber || <span className="text-gray-400 font-normal italic">-</span>}
                        {leadDetails.alternatePhoneNumber && (
                          <button
                            onClick={() => copyToClipboard(leadDetails.alternatePhoneNumber, 'Alternate phone')}
                            className="text-gray-400 hover:text-blue-600 p-0.5 transition-colors"
                            title="Copy"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {canViewLeadField(hasPermission, 'email') && (
                    <div className="sm:col-span-2 md:col-span-2">
                      <div className="text-[11px] font-medium text-gray-400">Email Address</div>
                      <div className="text-sm font-bold text-gray-900 mt-1 flex items-center gap-1.5 truncate">
                        {leadDetails.email ? (
                          <>
                            <a href={`mailto:${leadDetails.email}`} className="text-blue-600 hover:underline truncate">
                              {leadDetails.email}
                            </a>
                            <button
                              onClick={() => copyToClipboard(leadDetails.email, 'Email address')}
                              className="text-gray-400 hover:text-blue-600 p-0.5 flex-shrink-0 transition-colors"
                              title="Copy"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-400 font-normal italic">Not specified</span>
                        )}
                      </div>
                    </div>
                  )}

                  {canViewLeadField(hasPermission, 'city') && (
                    <div>
                      <div className="text-[11px] font-medium text-gray-400">City</div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">{leadDetails.city || '-'}</div>
                    </div>
                  )}

                  {canViewLeadField(hasPermission, 'state') && (
                    <div>
                      <div className="text-[11px] font-medium text-gray-400">State</div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">{leadDetails.state || '-'}</div>
                    </div>
                  )}

                  {canViewLeadField(hasPermission, 'country') && (
                    <div>
                      <div className="text-[11px] font-medium text-gray-400">Country</div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">{leadDetails.country || 'India'}</div>
                    </div>
                  )}

                  {canViewLeadField(hasPermission, 'preferredLocation') && (
                    <div>
                      <div className="text-[11px] font-medium text-gray-400">Preferred Location</div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        {[leadDetails.preferredStudyCity, leadDetails.preferredStudyState].filter(Boolean).join(', ') || <span className="text-gray-400 font-normal italic">Not specified</span>}
                      </div>
                    </div>
                  )}

                  {canViewLeadField(hasPermission, 'auditInfo') && (
                    <div>
                      <div className="text-[11px] font-medium text-gray-400">Last Connected</div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        {leadDetails.lastConnected ? formatDateTime(leadDetails.lastConnected) : '-'}
                      </div>
                    </div>
                  )}

                  {canViewLeadField(hasPermission, 'nextFollowUpDate') && (
                    <div>
                      <div className="text-[11px] font-medium text-gray-400">Next Follow-up</div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        {leadDetails.nextFollowUpDate ? formatDate(leadDetails.nextFollowUpDate) : '-'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* SECTION D: Academic & Course Information Card */}
          {/* SECTION D: Academic & Course Information Card */}
          {(canViewLeadField(hasPermission, 'program') ||
            canViewLeadField(hasPermission, 'courseType') ||
            canViewLeadField(hasPermission, 'course') ||
            canViewLeadField(hasPermission, 'interestedCourses') ||
            canViewLeadField(hasPermission, 'board') ||
            canViewLeadField(hasPermission, 'grade')) && (
              <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-2xs">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 pb-2.5 border-b border-gray-100 flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-indigo-600">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  Academic & Course Information
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-4 gap-x-6 text-xs">
                  {canViewLeadField(hasPermission, 'program') && (
                    <div>
                      <div className="text-[11px] font-medium text-gray-400">Program / School</div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        {leadDetails.program?.name || <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">UNMAPPED</span>}
                      </div>
                    </div>
                  )}

                  {canViewLeadField(hasPermission, 'courseType') && (
                    <div>
                      <div className="text-[11px] font-medium text-gray-400">Course Type</div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        {leadDetails.interestedCourseTypes?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {leadDetails.interestedCourseTypes.map((ct) => (
                              <span key={ct.id} className="text-xs bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded border border-purple-100">
                                {ct.name}
                              </span>
                            ))}
                          </div>
                        ) : leadDetails.course?.courseType?.name ? (
                          leadDetails.course.courseType.name
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">UNMAPPED</span>
                        )}
                      </div>
                    </div>
                  )}

                  {(canViewLeadField(hasPermission, 'course') || canViewLeadField(hasPermission, 'interestedCourses')) && (
                    <div>
                      <div className="text-[11px] font-medium text-gray-400">Interested Course</div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        {leadDetails.interestedCourses?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {leadDetails.interestedCourses.map((c) => (
                              <span key={c.id} className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-100">
                                {c.courseName || c.name}
                              </span>
                            ))}
                          </div>
                        ) : leadDetails.course?.courseName ? (
                          <span className="text-blue-600 font-bold">{leadDetails.course.courseName}</span>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">UNMAPPED</span>
                        )}
                      </div>
                    </div>
                  )}

                  {canViewLeadField(hasPermission, 'course') && isRegistrationVerified && (leadDetails.registeredCourse || leadDetails.course) && (
                    <div>
                      <div className="text-[11px] font-medium text-gray-400">Registered Course</div>
                      <div className="text-sm font-bold text-emerald-700 mt-1">
                        {leadDetails.registeredCourse?.courseName || leadDetails.course?.courseName || 'Not specified'}
                      </div>
                    </div>
                  )}

                  {(canViewLeadField(hasPermission, 'board') || canViewLeadField(hasPermission, 'grade')) && (
                    <div>
                      <div className="text-[11px] font-medium text-gray-400">Specialization</div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        {leadDetails.board?.name || leadDetails.grade?.name || 'Not specified'}
                      </div>
                    </div>
                  )}

                  {canViewLeadField(hasPermission, 'grade') && (
                    <div>
                      <div className="text-[11px] font-medium text-gray-400">Grade</div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        {leadDetails.grade?.name || <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">UNMAPPED</span>}
                      </div>
                    </div>
                  )}

                  {canViewLeadField(hasPermission, 'board') && (
                    <div>
                      <div className="text-[11px] font-medium text-gray-400">Board</div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        {leadDetails.board?.name || <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">UNMAPPED</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* SECTION E: Lead Source & Acquisition Card */}
          {(canViewLeadField(hasPermission, 'leadSources') || canViewLeadField(hasPermission, 'sourceDetails')) && (
            <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-purple-600">
                    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  Lead Source & Acquisition
                </h3>
                {isMultiSource && canViewLeadField(hasPermission, 'leadSources') && (
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                    {leadDetails.leadSources?.length || 2} Recorded Sources
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-xs">
                {canViewLeadField(hasPermission, 'leadSources') && (
                  <div>
                    <div className="text-[11px] font-medium text-gray-400">Primary Source</div>
                    <div className="text-sm font-bold text-gray-900 mt-1">
                      {leadDetails.leadSources?.[0]?.name || leadDetails.sourceDetails || 'Not specified'}
                    </div>
                    {leadDetails.leadSources?.[0]?.code && (
                      <div className="text-[10px] text-gray-400 mt-0.5">Code: {leadDetails.leadSources[0].code}</div>
                    )}
                  </div>
                )}

                {canViewLeadField(hasPermission, 'sourceDetails') && (
                  <div>
                    <div className="text-[11px] font-medium text-gray-400">Source Campaign / Details</div>
                    <div className="text-sm font-medium text-gray-700 mt-1">
                      {leadDetails.sourceDetails || '-'}
                    </div>
                  </div>
                )}

                {canViewLeadField(hasPermission, 'leadSources') && leadDetails.leadSources?.length > 1 && (
                  <div className="sm:col-span-2 md:col-span-1">
                    <div className="text-[11px] font-medium text-gray-400">All Associated Sources</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {leadDetails.leadSources.map((source, idx) => (
                        <span key={source.id || idx} className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                          {source.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION F: Allotment & Availed Information */}
          {(canViewLeadField(hasPermission, 'assignedTo') ||
            canViewLeadField(hasPermission, 'department') ||
            canViewLeadField(hasPermission, 'auditInfo') ||
            canViewLeadField(hasPermission, 'isAvailed')) && (
              <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-2xs">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 pb-2.5 border-b border-gray-100 flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-emerald-600">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M9 14l2 2 4-4" />
                  </svg>
                  Allotment & Availed Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  {/* Allotment Column */}
                  {(canViewLeadField(hasPermission, 'assignedTo') ||
                    canViewLeadField(hasPermission, 'department') ||
                    canViewLeadField(hasPermission, 'auditInfo')) && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Allotment Details</span>
                          {canViewLeadField(hasPermission, 'assignedTo') && (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isAllotted ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                              {isAllotted ? 'ALLOTTED' : 'UNALLOTTED'}
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          {canViewLeadField(hasPermission, 'assignedTo') && (
                            <div className="flex items-baseline justify-between border-b border-gray-50 pb-1.5">
                              <span className="text-gray-400 font-medium">Assigned Counselor:</span>
                              <span className="font-bold text-gray-900">{assignedToName}</span>
                            </div>
                          )}
                          {canViewLeadField(hasPermission, 'department') && (
                            <div className="flex items-baseline justify-between border-b border-gray-50 pb-1.5">
                              <span className="text-gray-400 font-medium">Department:</span>
                              <span className="font-semibold text-gray-800">{leadDetails.department?.name || 'UNMAPPED'}</span>
                            </div>
                          )}
                          {canViewLeadField(hasPermission, 'auditInfo') && (
                            <div className="flex items-baseline justify-between border-b border-gray-50 pb-1.5">
                              <span className="text-gray-400 font-medium">Created By:</span>
                              <span className="text-gray-700">{createdByName} ({formatDate(leadDetails.createdAt)})</span>
                            </div>
                          )}
                          {canViewLeadField(hasPermission, 'auditInfo') && leadDetails.updatedAt && (
                            <div className="flex items-baseline justify-between">
                              <span className="text-gray-400 font-medium">Last Modified:</span>
                              <span className="text-gray-700">{formatDateTime(leadDetails.updatedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Availed Column */}
                  {canViewLeadField(hasPermission, 'isAvailed') && (
                    <div className="sm:border-l sm:border-gray-100 sm:pl-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Availed Details</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isAvailed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                          {isAvailed ? 'AVAILED' : 'UNAVAILED'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between border-b border-gray-50 pb-1.5">
                          <span className="text-gray-400 font-medium">Availed Since:</span>
                          <span className="font-bold text-gray-900">{leadDetails.availedAt ? formatDateTime(leadDetails.availedAt) : 'Not Availed'}</span>
                        </div>
                        <div className="flex items-baseline justify-between border-b border-gray-50 pb-1.5">
                          <span className="text-gray-400 font-medium">Availed By:</span>
                          <span className="font-semibold text-gray-800">
                            {leadDetails.availedBy
                              ? `${leadDetails.availedBy.firstName || ''} ${leadDetails.availedBy.lastName || ''}`.trim() || leadDetails.availedBy.username
                              : '-'}
                          </span>
                        </div>
                        {leadDetails.enrollmentId && (
                          <div className="flex items-baseline justify-between">
                            <span className="text-gray-400 font-medium">CMS Enrollment ID:</span>
                            <span className="font-bold text-indigo-700">{leadDetails.enrollmentId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* SECTION G: Status History & Follow-ups */}
          {(canViewLeadField(hasPermission, 'statusHistory') || canViewLeadField(hasPermission, 'nextFollowUpDate')) && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
              {canViewLeadField(hasPermission, 'statusHistory') && (
                <>
                  <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-gray-100">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-blue-600">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      Lead Status History
                    </h3>
                  </div>

                  {statusHistoryLoading ? (
                    <div className="flex items-center justify-center py-6 gap-2 text-gray-500 text-xs">
                      <svg className="animate-spin text-blue-600" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Loading status history...
                    </div>
                  ) : (
                    <ReusableTable
                      columns={statusHistoryColumns}
                      data={statusHistory}
                      emptyMessage="No status history available"
                    />
                  )}
                </>
              )}

              {/* Follow-ups Subsection */}
              {canViewLeadField(hasPermission, 'nextFollowUpDate') && (
                <div className={`${canViewLeadField(hasPermission, 'statusHistory') ? 'mt-5 pt-4 border-t border-gray-100' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-amber-600">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3" />
                      </svg>
                      Follow-ups
                    </h3>
                  </div>

                  {followUpsLoading ? (
                    <div className="flex items-center justify-center py-6 gap-2 text-gray-500 text-xs">
                      <svg className="animate-spin text-blue-600" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Loading follow-ups...
                    </div>
                  ) : (
                    <ReusableTable
                      columns={followUpsColumns}
                      data={followUps}
                      emptyMessage="No follow-ups scheduled for this lead"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* SECTION H: Remarks & Additional Information Card */}
          {canViewLeadField(hasPermission, 'remarks') && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-amber-600">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Remarks & Notes
                </h3>
                <button
                  onClick={() => setIsRemarkModalOpen(true)}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-800 transition-colors"
                >
                  + Add Note
                </button>
              </div>

              {leadDetails.remarks ? (
                <div className="p-3.5 bg-gray-50/80 rounded-lg text-xs text-gray-800 leading-relaxed font-normal border border-gray-100">
                  {leadDetails.remarks}
                </div>
              ) : (
                <div className="py-2 text-xs text-gray-400 italic">
                  No remarks added for this lead yet.
                </div>
              )}
            </div>
          )}

          {/* University Visit Planning Card */}
          {canViewLeadField(hasPermission, 'visitPlanning') && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-indigo-600">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    University Visit Planning
                  </h3>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${leadDetails.planningToVisitUniversity
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}
                  >
                    {leadDetails.planningToVisitUniversity ? 'Visit Planned' : 'No Visit'}
                  </span>
                </div>

                {hasPermission('LEAD_UPDATE') && (
                  <button
                    onClick={() => setIsVisitModalOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors self-start sm:self-auto"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    {leadDetails.planningToVisitUniversity ? 'Edit Plan' : 'Plan Visit'}
                  </button>
                )}
              </div>

              {leadDetails.planningToVisitUniversity ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-6 text-xs">
                  <div>
                    <div className="text-[11px] font-medium text-gray-400">Visit Date</div>
                    <div className="text-sm font-semibold text-gray-900 mt-1 flex items-center gap-1.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {formatDate(leadDetails.visitDate)}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-medium text-gray-400">Visit Time</div>
                    <div className="text-sm font-semibold text-gray-900 mt-1 flex items-center gap-1.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {formatTime(leadDetails.visitTime)}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-medium text-gray-400">Visit Remarks</div>
                    <div className="text-sm font-semibold text-gray-900 mt-1 break-words">
                      {leadDetails.visitRemarks || '-'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-2 text-xs text-gray-400 italic">
                  No university visit has been planned for this lead yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT SIDE: Info Panel & Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs w-full sticky top-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 pb-2.5 border-b border-gray-100 flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-blue-600">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Course Information & Action Panel
            </h3>

            {/* Quick Action Button for WhatsApp */}
            <div className="flex gap-2 mb-4">
              <CustomButton
                variant="secondary"
                onClick={() => setIsWhatsAppModalOpen(true)}
                disabled={!selectedCourse}
                className="bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 text-xs flex-1 flex items-center justify-center gap-2 rounded-xl shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
                WhatsApp
              </CustomButton>

              <CustomButton
                variant="secondary"
                onClick={() => setIsEmailModalOpen(true)}
                disabled={!selectedCourse}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 text-xs flex-1 flex items-center justify-center gap-2 rounded-xl shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Email
              </CustomButton>
            </div>

            {/* Course Searchable Dropdown */}
            <div className="mb-4" ref={courseDropdownRef}>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Select Course</label>
              <div className="relative">
                <div
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm bg-white cursor-pointer flex items-center justify-between gap-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
                  onClick={() => setIsCourseDropdownOpen(true)}
                >
                  {isCourseDropdownOpen ? (
                    <input
                      autoFocus
                      type="text"
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Search course..."
                      className="flex-1 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400"
                    />
                  ) : (
                    <span className={`flex-1 truncate text-sm ${selectedCourseObj ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                      {selectedCourseObj
                        ? `${selectedCourseObj.name || selectedCourseObj.courseName} (${selectedCourseObj.code || selectedCourseObj.courseCode || 'CODE'})`
                        : 'Select a course...'}
                    </span>
                  )}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {selectedCourseObj && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCourse('');
                          setSelectedCourseObj(null);
                          setCourseSearch('');
                          setIsCourseDropdownOpen(false);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
                        title="Clear selection"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className={`text-gray-400 transition-transform ${isCourseDropdownOpen ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {isCourseDropdownOpen && (
                  <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                    {coursesLoading ? (
                      <div className="flex items-center justify-center py-4 gap-2 text-gray-500 text-xs">
                        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        Searching...
                      </div>
                    ) : courses.length === 0 ? (
                      <div className="py-4 text-center text-xs text-gray-400">No courses found</div>
                    ) : (
                      courses.map((course) => (
                        <div
                          key={course.id}
                          onClick={() => {
                            setSelectedCourse(course.id);
                            setSelectedCourseObj(course);
                            setCourseSearch('');
                            setIsCourseDropdownOpen(false);
                          }}
                          className={`px-3.5 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 ${selectedCourse === course.id ? 'bg-blue-50' : ''}`}
                        >
                          <div className="text-sm font-medium text-gray-800">{course.name || course.courseName}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{course.code || course.courseCode} · {course.duration} {course.durationUnit}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Course Summary */}
            {selectedCourse && selectedCourseObj && (
              <div className="mt-4">
                <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/70 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{selectedCourseObj.name || selectedCourseObj.courseName}</h4>
                      <p className="text-xs text-gray-500">{selectedCourseObj.code || selectedCourseObj.courseCode}</p>
                    </div>
                    {selectedCourseObj.duration && (
                      <span className="text-[10px] font-bold text-blue-700 bg-white border border-blue-200 px-2 py-0.5 rounded-full shadow-2xs">
                        {selectedCourseObj.duration} {selectedCourseObj.durationUnit}
                      </span>
                    )}
                  </div>

                  {communicationConfig && (
                    <div className="mt-3 pt-3 border-t border-blue-100/80 space-y-2 text-xs">
                      {communicationConfig.brochureUrl && (
                        <a
                          href={communicationConfig.brochureUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold underline"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          Download Brochure
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Modals */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        leadData={leadDetails}
        onSubmit={handleScheduleSubmit}
      />

      <CallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        studentData={leadDetails}
        phoneNumber={leadDetails.phoneNumber}
        onComplete={() => loadLeadData(false)}
        onScheduleOpen={() => setIsScheduleModalOpen(true)}
      />

      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        studentData={leadDetails}
        selectedCourse={selectedCourse}
        onSend={handleWhatsAppSend}
      />

      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        studentData={leadDetails}
        selectedCourse={selectedCourse}
        onSend={handleEmailSend}
      />

      <LeadRemarkModal
        isOpen={isRemarkModalOpen}
        onClose={() => setIsRemarkModalOpen(false)}
        lead={leadDetails}
        onSave={handleRemarkSave}
      />

      {/* Admin Manual Registration Approval Modal */}
      {isManualApproveModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Manually Approve Registration</h3>
                  <p className="text-xs text-gray-500">Approve lead as Registered without CMS verification</p>
                </div>
              </div>
              <button
                onClick={() => setIsManualApproveModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleManualApproveSubmit} className="p-6 space-y-4">
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-900">{leadDetails?.fullName || 'N/A'}</div>
                  <div className="text-[11px] text-gray-500">{leadDetails?.leadCode} · {leadDetails?.phoneNumber}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Registered Course <span className="text-red-500">*</span>
                </label>
                <select
                  value={manualApproveCourseId}
                  onChange={(e) => setManualApproveCourseId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                >
                  <option value="">-- Select Registered Course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.courseName} {c.courseCode ? `(${c.courseCode})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-500 mt-1">Select the course in which the student is enrolled.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Enrollment ID (Optional)
                </label>
                <input
                  type="text"
                  value={manualApproveEnrollmentId}
                  onChange={(e) => setManualApproveEnrollmentId(e.target.value)}
                  placeholder="e.g. RU2026-ENG-1082"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Approval Remarks / Notes
                </label>
                <textarea
                  rows="2"
                  value={manualApproveRemarks}
                  onChange={(e) => setManualApproveRemarks(e.target.value)}
                  placeholder="e.g. Verified physically via fee receipt"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsManualApproveModalOpen(false)}
                  disabled={manualApproveSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={manualApproveSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {manualApproveSubmitting ? 'Approving...' : 'Mark Registration Successful'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plan University Visit Modal */}
      <PlanUniversityVisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        leadDetails={leadDetails}
        onSuccess={() => loadLeadData(false)}
      />
    </div>
  );
};

export default LeadDetail;

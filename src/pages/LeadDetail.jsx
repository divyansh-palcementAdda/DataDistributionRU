import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { usePermissions } from '../PermissionContext';
import { toast } from 'react-toastify';
import CustomButton from '../component/reusable/CustomButton';
import ScheduleModal from "../component/reusable/Leads/scheduleModel";
import CallModal from '../component/reusable/CallModal';
import WhatsAppModal from '../component/reusable/WhatsAppModal';
import EmailModal from '../component/reusable/EmailModal';
import ReusableTable from '../component/reusable/table';
import { createLeadSchedule, getLeadById, getLeadInfoPanel, sendLeadWhatsApp, sendLeadEmail, changeLeadStatus, getLeadStatusHistory, getLeadFollowUps } from '../Services/lead/leadService';
import { getAllCourses } from '../Services/course/course';
import { completeFollowup, cancelFollowup } from '../Services/followUp/followService';

const BASE_URL = import.meta.env.VITE_BASE_URL || '';

const LeadDetail = () => {
  const { id } = useParams();
  const { navTo, showToast, openAddLeadModal } = useAppContext();
  const { hasPermission } = usePermissions();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [leadDetails, setLeadDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [communicationConfig, setCommunicationConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [statusHistoryLoading, setStatusHistoryLoading] = useState(false);
  const [followUps, setFollowUps] = useState([]);
  const [followUpsLoading, setFollowUpsLoading] = useState(false);

  // Searchable course dropdown state
  const [courseSearch, setCourseSearch] = useState('');
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [selectedCourseObj, setSelectedCourseObj] = useState(null);
  const courseDropdownRef = useRef(null);
  const courseSearchDebounceRef = useRef(null);

  useEffect(() => {
    if (id) {
      const fetchLead = async () => {
        setLoading(true);
        try {
          const res = await getLeadById(id);
          if (res?.data?.success) {
            setLeadDetails(res.data.data);
          }
        } catch (err) {
          console.error("Failed to fetch lead", err);
        } finally {
          setLoading(false);
        }
      };
      fetchLead();
    }
  }, [id]);

  // Auto-select interested course when lead details are loaded
  useEffect(() => {
    if (leadDetails) {
      // Check if there's an interested course and auto-select it
      const interestedCourse = leadDetails.course || leadDetails.interestedCourses?.[0];
      if (interestedCourse?.id) {
        setSelectedCourse(interestedCourse.id);
        setSelectedCourseObj(interestedCourse);
      }
    }
  }, [leadDetails]);

  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true);
      try {
        const res = await getAllCourses({ page: 0, size: 20, search: courseSearch });
        if (res?.success && res?.data?.content) {
          setCourses(res.data.content);
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

    // Debounce search API calls
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

  useEffect(() => {
    const fetchInfoPanel = async () => {
      if (selectedCourse) {
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
  }, [selectedCourse]);

  useEffect(() => {
    const fetchStatusHistory = async () => {
      if (id) {
        setStatusHistoryLoading(true);
        try {
          const res = await getLeadStatusHistory(id, { page: 0, size: 50, sortBy: 'changedAt', sortDirection: 'desc' });
          if (res?.data?.success && res?.data?.data?.content) {
            setStatusHistory(res.data.data.content);
          } else {
            setStatusHistory([]);
          }
        } catch (err) {
          console.error("Failed to fetch status history", err);
          setStatusHistory([]);
        } finally {
          setStatusHistoryLoading(false);
        }
      }
    };
    fetchStatusHistory();
  }, [id]);

  useEffect(() => {
    const fetchFollowUps = async () => {
      if (id) {
        setFollowUpsLoading(true);
        try {
          const res = await getLeadFollowUps(id);
          if (res?.data?.success && res?.data?.data) {
            setFollowUps(res.data.data);
          } else {
            setFollowUps([]);
          }
        } catch (err) {
          console.error("Failed to fetch follow-ups", err);
          setFollowUps([]);
        } finally {
          setFollowUpsLoading(false);
        }
      }
    };
    fetchFollowUps();
  }, [id]);

  const initials = (() => {
    const fullName = leadDetails?.fullName;
    return fullName ? fullName.substring(0, 2).toUpperCase() : '--';
  })();

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
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

  const getStatusColor = (status) => {
    const statusValue = typeof status === 'object' ? status?.name || status?.code : status;
    switch (statusValue?.toLowerCase()) {
      case 'connected': return 'bg-green-100 text-green-700';
      case 'not connected': return 'bg-red-100 text-red-700';
      case 'interested': return 'bg-blue-100 text-blue-700';
      case 'follow up': return 'bg-orange-100 text-orange-700';
      case 'raw': return 'bg-purple-100 text-purple-700';
      case 'converted': return 'bg-green-100 text-green-700';
      case 'lost': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const statusHistoryColumns = [
    {
      key: 'sno',
      header: 'S.No',
      render: (_, __, index) => index + 1,
    },
    {
      key: 'status',
      header: 'Status',
      render: (value, row, index) => {
        const statusObj = row?.newStatus || row?.currentStatus || row?.status;
        const statusValue = typeof statusObj === 'object' ? statusObj?.name || statusObj?.code || '-' : statusObj || '-';
        return (
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(statusValue)}`}>
              {statusValue}
            </span>
            {index === 0 && (
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                Current
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'changedAt',
      header: 'Changed At',
      render: (value) => formatDate(value),
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
        if (statusValue === 'PENDING') statusColor = 'bg-yellow-100 text-yellow-700';
        if (statusValue === 'COMPLETED') statusColor = 'bg-green-100 text-green-700';
        if (statusValue === 'CANCELLED') statusColor = 'bg-red-100 text-red-700';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {statusValue}
          </span>
        );
      },
    },
    {
      key: 'completed',
      header: 'Completed',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'completedAt',
      header: 'Completed At',
      render: (value) => formatDate(value),
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

  const handleScheduleSubmit = async (formData) => {
    try {
      const response = await createLeadSchedule(id, formData);
      if (response?.data?.success) {
        showToast('Follow-up scheduled successfully');
        
        // Background API call to change lead status
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
      } else {
        showToast(response?.data?.message || 'Unable to schedule follow-up');
      }
    } catch (error) {
      console.error('Failed to schedule follow-up', error);
      showToast('Failed to schedule follow-up');
    }
  };

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

  const handleRegisteredClick = async () => {
    try {
      // Call the changeStatus API
      const response = await changeLeadStatus(id, {
        newStatusId: leadDetails.currentStatus?.id,
        statusCode: 'REGISTERED',
        feedback: 'Lead registered successfully'
      });
      
      if (response?.data?.success) {
        showToast('Lead status changed to Registered successfully');
        // Refresh lead details to get updated status
        const res = await getLeadById(id);
        if (res?.data?.success) {
          setLeadDetails(res.data.data);
        }
      } else {
        showToast(response?.data?.message || 'Failed to change lead status');
      }
    } catch (error) {
      console.error('Failed to change lead status', error);
      showToast('Failed to change lead status');
    }
  };

  const handleCompleteFollowup = async () => {
    try {
      // Find the first pending follow-up for this lead
      const pendingFollowup = followUps.find(f => f.status === 'PENDING' && !f.completed);
      
      if (!pendingFollowup) {
        toast.error('No pending follow-up found to complete');
        return;
      }

      const response = await completeFollowup({
        id: pendingFollowup.id,
        feedback: 'Follow-up completed',
        remarks: 'Marked as completed for follow-up'
      });
      
      if (response?.success) {
        toast.success('Follow-up marked as completed successfully');
        // Refresh follow-ups data
        const res = await getLeadFollowUps(id);
        if (res?.data?.success && res?.data?.data) {
          setFollowUps(res.data.data);
        }
      } else {
        toast.error(response?.message || 'Failed to complete follow-up');
      }
    } catch (error) {
      console.error('Failed to complete follow-up', error);
      toast.error('Failed to complete follow-up');
    }
  };

  const handleCancelFollowup = async () => {
    try {
      // Find the first pending follow-up for this lead
      const pendingFollowup = followUps.find(f => f.status === 'PENDING' && !f.completed);
      
      if (!pendingFollowup) {
        toast.error('No pending follow-up found to cancel');
        return;
      }

      const response = await cancelFollowup({
        id: pendingFollowup.id,
        feedback: 'Follow-up cancelled',
        remarks: 'Marked as cancelled for follow-up'
      });
      
      if (response?.success) {
        toast.success('Follow-up marked as cancelled successfully');
        // Refresh follow-ups data
        const res = await getLeadFollowUps(id);
        if (res?.data?.success && res?.data?.data) {
          setFollowUps(res.data.data);
        }
      } else {
        toast.error(response?.message || 'Failed to cancel follow-up');
      }
    } catch (error) {
      console.error('Failed to cancel follow-up', error);
      toast.error('Failed to cancel follow-up');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 text-sm">Loading lead details...</div>
      </div>
    );
  }

  if (!leadDetails) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm">No lead data found.</div>
      </div>
    );
  }

  const statusName = leadDetails.currentStatus?.name || leadDetails.currentStatus?.code || 'N/A';
  const assignedToName = leadDetails.assignedTo?.firstName && leadDetails.assignedTo?.lastName
    ? `${leadDetails.assignedTo.firstName} ${leadDetails.assignedTo.lastName}`
    : leadDetails.assignedTo?.username || 'N/A';
  const createdByName = leadDetails.createdBy?.firstName && leadDetails.createdBy?.lastName
    ? `${leadDetails.createdBy.firstName} ${leadDetails.createdBy.lastName}`
    : leadDetails.createdBy?.username || 'N/A';
  
  // Check if status is "Finally Not Connected", "Bad", or "Not Interested"
  const isFinallyNotConnected = statusName === 'Finally Not Connected' || statusName === 'Bad' || statusName === 'Not Interested';
  const hasPendingFollowup = followUps.some(f => f.status === 'PENDING' && !f.completed);

  return (
    <div className="block" id="page-lead-detail">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => navTo('leads')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">Lead Details</h1>
          </div>
        </div>
        <div className="flex gap-2">

          {/* {hasPermission('LEAD_CREATE') && (
            <CustomButton
              variant="secondary"
              onClick={() => openAddLeadModal()}
              className="text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Lead
            </CustomButton>
          )} */}
              
               {hasPendingFollowup && (
                <CustomButton
                variant="primary"
                onClick={handleCancelFollowup}
                className="text-xs py-1.5 px-3 flex items-center gap-1.5 bg-red-600 hover:bg-red-700"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Mark as Cancelled For Follow-Up
              </CustomButton>
              )}

               {hasPendingFollowup && (
                <CustomButton
                variant="primary"
                onClick={handleCompleteFollowup}
                className="text-xs py-1.5 px-3 flex items-center gap-1.5 bg-green-600 hover:bg-green-700"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Mark as Completed For Follow-Up
              </CustomButton>
              )}


           {!isFinallyNotConnected && (
            <CustomButton
              variant="primary"
              onClick={handleRegisteredClick}
              className="text-xs py-1.5 px-3 flex items-center gap-1.5 bg-green-600 hover:bg-green-700"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Registered
            </CustomButton>
          )}
            
          {!isFinallyNotConnected && !hasPendingFollowup && (
            <CustomButton
              variant="primary"
              onClick={() => setIsScheduleModalOpen(true)}
              className="text-xs py-1.5 px-3 flex items-center gap-1.5"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left / Main Content */}
        <div className="flex flex-col gap-4 lg:col-span-2">

          {/* Lead Info Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full">

            {/* Card Header with Edit and Call Buttons */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-gray-700">Lead Info</h3>
              <div className="flex gap-2">
                {hasPermission('LEAD_UPDATE') && (
                  <button
                    onClick={() => {
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
                        leadSourceIds: leadDetails.leadSources?.map((s) => s.id) || [],
                        sourceDetails: leadDetails.sourceDetails || '',
                        interestedCourseIds: leadDetails.interestedCourses?.map((c) => c.id) || [],
                        courseId: leadDetails.course?.id || '',
                        registeredCourseId: leadDetails.registeredCourse?.id || '',
                        boardId: leadDetails.board?.id || '',
                        gradeId: leadDetails.grade?.id || '',
                        remarks: leadDetails.remarks || '',
                        assignedToUserId: leadDetails.assignedTo?.id || '',
                        statusId: leadDetails.currentStatus?.id || '',
                        active: leadDetails.active !== undefined ? leadDetails.active : true,
                        nextFollowUpDate: leadDetails.nextFollowUpDate || '',
                      };
                      openAddLeadModal(editPayload);
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
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
                  className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg transition-colors"
                  title="Call Lead"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  Call
                  </button>
                )}
              </div>
            </div>

            {/* Avatar + Name */}
            <div className="flex flex-col sm:flex-row items-start gap-5 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  {leadDetails.fullName || 'N/A'}
                </h2>
                <p className="text-sm text-gray-500 mb-3">
                  {leadDetails.leadCode || 'N/A'}{leadDetails.nextFollowUpDate ? ` · Next Follow up Date ${formatDate(leadDetails.nextFollowUpDate)}` : ''}
                </p>

                <div className="flex flex-wrap gap-2">
                   Assign To : {assignedToName}
                </div>
              </div>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { label: 'Phone Number', value: leadDetails.phoneNumber || 'N/A' },
                { label: 'Alternate Phone', value: leadDetails.alternatePhoneNumber || 'N/A' },
                { label: 'Email', value: leadDetails.email || 'N/A' },
                { label: 'City', value: leadDetails.city || 'N/A' },
                { label: 'State', value: leadDetails.state || 'N/A' },
                { label: 'Country', value: leadDetails.country || 'N/A' },
                { label: 'Department', value: leadDetails.department?.name || 'N/A' },
                { label: 'Last Connected', value: leadDetails.lastConnected ? formatDate(leadDetails.lastConnected) : '-' },
                // { label: 'Status', value: statusName },
                // { label: 'Lead Date', value: formatDate(leadDetails.createdAt) },
                // { label: 'Lead Code', value: leadDetails.leadCode || 'N/A' },
                // {
                //   label: 'Next Follow-up',
                //   value: formatDate(leadDetails.nextFollowUpDate),
                // },
                // {
                //   label: 'Last Contacted',
                //   value: leadDetails.lastContactedAt ? formatDate(leadDetails.lastContactedAt) : '-',
                // },
                // { label: 'Assigned To', value: assignedToName },
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{item.label}</div>
                  <div className={`text-xs font-semibold text-gray-800 ${item.label === 'Email' ? 'break-all' : ''}`}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Course Information */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Course Information</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                {/* Interested Course */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Interested Course</div>
                  <div className="text-xs font-bold text-blue-600">
                    {leadDetails.courseInterested || leadDetails.course?.courseName || 'N/A'}
                  </div>
                  {leadDetails.interestedCourses?.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {leadDetails.interestedCourses.map((c) => (
                        <span key={c.id} className="text-[9px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded border border-blue-100">
                          {c.courseName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Registered Course - Only show when status is Registered */}
                {statusName === 'Registered' && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Registered Course</div>
                    <div className="text-xs font-semibold text-gray-800">
                      {leadDetails.registeredCourse?.courseName || 'N/A'}
                    </div>
                    {leadDetails.registeredCourse?.courseCode && (
                      <div className="text-[9px] text-gray-400 mt-0.5">{leadDetails.registeredCourse.courseCode}</div>
                    )}
                  </div>
                )}

                {/* Specialization */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Specialization</div>
                  <div className="text-xs font-semibold text-gray-800">
                    {leadDetails.board?.name || leadDetails.grade?.name || 'N/A'}
                  </div>
                  {leadDetails.board?.code && (
                    <div className="text-[9px] text-gray-400 mt-0.5">{leadDetails.board.code}</div>
                  )}
                  {leadDetails.grade?.code && (
                    <div className="text-[9px] text-gray-400 mt-0.5">{leadDetails.grade.code}</div>
                  )}
                </div>

                {/* Source */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Source</div>
                  <div className="text-xs font-semibold text-gray-800">
                    {leadDetails.sourceDetails || 'N/A'}
                  </div>
                  {leadDetails.leadSources?.length > 0 && (
                    <div className="mt-1 flex gap-1">
                      {leadDetails.leadSources.map((source) => (
                        <span key={source.id} className="text-[9px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded border border-blue-100">
                          {source.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Interested Course Types */}
              {leadDetails.interestedCourseTypes?.length > 0 && (
                <div className="mt-3">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Interested Course Types</div>
                  <div className="flex flex-wrap gap-2">
                    {leadDetails.interestedCourseTypes.map((ct) => (
                      <span key={ct.id} className="bg-purple-50 text-purple-600 text-[10px] font-medium px-2 py-0.5 rounded-full border border-purple-100">
                        {ct.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Remarks */}
              {leadDetails.remarks && (
                <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Remarks</div>
                  <div className="text-xs font-semibold text-gray-800">{leadDetails.remarks}</div>
                </div>
              )}
            </div>

          

            {/* Lead Sources */}
            {/* {leadDetails.leadSources?.length > 0 && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Lead Sources</h3>
                <div className="flex flex-wrap gap-2">
                  {leadDetails.leadSources.map((source) => (
                    <span key={source.id} className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100">
                      {source.name}
                    </span>
                  ))}
                </div>
              </div>
            )} */}

            {/* Created By */}
            {/* {leadDetails.createdBy && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Created By</h3>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-xs font-semibold text-gray-800">{createdByName}</div>
                  <div className="text-[10px] text-gray-500 mt-1">{leadDetails.createdBy.email || 'N/A'}</div>
                </div>
              </div>
            )} */}

            {/* Lead Status History */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Lead Status History</h3>
              {statusHistoryLoading ? (
                <div className="flex items-center justify-center py-8 gap-2 text-gray-500 text-sm">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            </div>

            {/* Lead Follow-ups */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Follow-ups</h3>
              {followUpsLoading ? (
                <div className="flex items-center justify-center py-8 gap-2 text-gray-500 text-sm">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Loading follow-ups...
                </div>
              ) : (
                <ReusableTable
                  columns={followUpsColumns}
                  data={followUps}
                  emptyMessage="No follow-ups available"
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Side — Info Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full sticky top-2">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Info Penal</h3>

            <div className="flex gap-2 mb-4">
              <CustomButton
                variant="primary"
                onClick={() => setIsEmailModalOpen(true)}
                disabled={!selectedCourse}
                className="bg-blue-600 hover:bg-blue-700 py-2 px-4 text-xs flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Email
              </CustomButton>
              <CustomButton
                variant="secondary"
                onClick={() => setIsWhatsAppModalOpen(true)}
                disabled={!selectedCourse}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 text-xs flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
                WhatsApp
              </CustomButton>
            </div>

            {/* Course Searchable Dropdown */}
            <div className="mb-4" ref={courseDropdownRef}>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Select Course</label>
              <div className="relative">
                {/* Input trigger */}
                <div
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer flex items-center justify-between gap-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
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
                    <span className={`flex-1 truncate text-sm ${selectedCourseObj ? 'text-gray-800' : 'text-gray-400'}`}>
                      {selectedCourseObj
                        ? `${selectedCourseObj.courseName} (${selectedCourseObj.courseCode})`
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

                {/* Dropdown List */}
                {isCourseDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
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
                          className={`px-3 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 ${selectedCourse === course.id ? 'bg-blue-50' : ''}`}
                        >
                          <div className="text-sm font-medium text-gray-800">{course.courseName}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{course.courseCode} · {course.duration} {course.durationUnit}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Course Info */}
            {selectedCourse && selectedCourseObj && (
              <div className="mt-4">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-bold text-blue-800">{selectedCourseObj.courseName}</h4>
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {selectedCourseObj.duration} {selectedCourseObj.durationUnit}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{selectedCourseObj.description}</p>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-white p-2 rounded border border-gray-100">
                      <div className="text-[9px] font-bold text-gray-400 uppercase">Fees</div>
                      <div className="text-xs font-semibold text-green-600">₹{selectedCourseObj.fees?.toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-100">
                      <div className="text-[9px] font-bold text-gray-400 uppercase">Course Code</div>
                      <div className="text-xs font-semibold text-gray-700">{selectedCourseObj.courseCode}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase mb-1">Course Type</div>
                    <div className="bg-white text-gray-600 text-[10px] px-2 py-0.5 rounded border border-gray-200">
                      {selectedCourseObj.courseType?.name || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Communication Config */}
            {configLoading ? (
              <div className="mt-4 text-center py-4 text-gray-500 text-xs">Loading communication config...</div>
            ) : communicationConfig ? (
              <div className="mt-4 bg-gradient-to-br from-green-50 to-teal-50 border border-green-100 rounded-lg p-4">
                <h4 className="text-sm font-bold text-green-800 mb-3">Details</h4>
                <div className="space-y-2">
                  {/* Lead Name */}
                  {communicationConfig.leadFullName && (
                    <div className="bg-white p-2 rounded border border-gray-100">
                      <div className="text-[9px] font-bold text-gray-400 uppercase">Lead Name</div>
                      <div className="text-xs font-semibold text-gray-700">{communicationConfig.leadFullName}</div>
                    </div>
                  )}

                  {/* Course Info */}
                  {communicationConfig.course && (
                    <div className="bg-white p-2 rounded border border-gray-100">
                      <div className="text-[9px] font-bold text-gray-400 uppercase">Course</div>
                      <div className="text-xs font-semibold text-gray-700">{communicationConfig.course.courseName}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{communicationConfig.course.courseCode}</div>
                    </div>
                  )}

                  {/* Template Info */}
                  {communicationConfig.template && (
                    <div className="bg-white p-2 rounded border border-gray-100">
                      <div className="text-[9px] font-bold text-gray-400 uppercase">Template</div>
                      <div className="text-xs font-semibold text-gray-700">{communicationConfig.template.name}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">Channel: {communicationConfig.template.channel}</div>
                    </div>
                  )}

                  {/* Active Image */}
                  {communicationConfig.activeImage && (
                    <div className="bg-white p-2 rounded border border-gray-100">
                      <div className="text-[9px] font-bold text-gray-400 uppercase">Active Image</div>
                      <div className="text-xs font-semibold text-gray-700">{communicationConfig.activeImage.displayName}</div>
                      {communicationConfig.activeImage.imageUrl && (
                        <img 
                          src={`${BASE_URL}${communicationConfig.activeImage.imageUrl}`} 
                          alt="Active image" 
                          className="mt-2 rounded border border-gray-200 max-w-full h-auto"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  )}

                  {/* Rendered Content */}
                  {communicationConfig.renderedContent && (
                    <div className="bg-white p-2 rounded border border-gray-100">
                      <div className="text-[9px] font-bold text-gray-400 uppercase">Content</div>
                      <div className="text-xs font-semibold text-gray-700">{communicationConfig.renderedContent}</div>
                    </div>
                  )}

                  {/* USPs */}
                  {communicationConfig.usps && communicationConfig.usps.length > 0 && (
                    <div className="bg-white p-2 rounded border border-gray-100">
                      <div className="text-[9px] font-bold text-gray-400 uppercase">USPs</div>
                      <div className="mt-1 space-y-1">
                        {communicationConfig.usps.map((usp, idx) => (
                          <div key={idx} className="text-xs text-gray-700">• {usp.content}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available Images */}
                  {communicationConfig.availableImages && communicationConfig.availableImages.length > 0 && (
                    <div className="bg-white p-2 rounded border border-gray-100">
                      <div className="text-[9px] font-bold text-gray-400 uppercase">Available Images</div>
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        {communicationConfig.availableImages.map((img, idx) => (
                          <div key={idx}>
                            <div className="text-xs text-gray-700 mb-1">{img.displayName}</div>
                            <img
                              src={`${BASE_URL}${img.imageUrl}`}
                              alt={img.displayName}
                              className="rounded border border-gray-200 max-w-full h-auto"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : selectedCourse ? (
              <div className="mt-4 text-center py-4 text-gray-400 text-xs">No communication config available</div>
            ) : null}
          </div>
        </div>
      </div>

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSubmit={handleScheduleSubmit}
      />

      <CallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        studentData={leadDetails}
        onScheduleOpen={() => setIsScheduleModalOpen(true)}
        isFinallyNotConnected={isFinallyNotConnected}
      />

      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        studentData={leadDetails}
        leadId={id}
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
    </div>
  );
};

export default LeadDetail;

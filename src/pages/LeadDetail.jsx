import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import CustomButton from '../component/reusable/CustomButton';
import ScheduleModal from "../component/reusable/Leads/scheduleModel";
import CallModal from '../component/reusable/CallModal';
import WhatsAppModal from '../component/reusable/WhatsAppModal';
import ReusableTable from '../component/reusable/table';
import { createLeadSchedule, getLeadById } from '../Services/lead/leadService';

const LeadDetail = () => {
  const { id } = useParams();
  const { navTo, showToast } = useAppContext();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [leadDetails, setLeadDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [statusHistoryLoading, setStatusHistoryLoading] = useState(false);

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

  useEffect(() => {
    // Static data for lead status history (since API is not available yet)
    const staticStatusHistory = [
      {
        status: 'Connected',
        changedAt: '2025-06-15T10:30:00',
        changedBy: { firstName: 'Rahul', lastName: 'Sharma', username: 'rahul.s' },
        remarks: 'Initial contact made via phone call'
      },
      {
        status: 'Interested',
        changedAt: '2025-06-16T14:45:00',
        changedBy: { firstName: 'Rahul', lastName: 'Sharma', username: 'rahul.s' },
        remarks: 'Showed interest in Full Stack Development course'
      },
      {
        status: 'Follow Up',
        changedAt: '2025-06-18T11:00:00',
        changedBy: { firstName: 'Priya', lastName: 'Singh', username: 'priya.s' },
        remarks: 'Scheduled follow-up for course details discussion'
      },
      {
        status: 'Not Connected',
        changedAt: '2025-06-20T16:30:00',
        changedBy: { firstName: 'Amit', lastName: 'Kumar', username: 'amit.k' },
        remarks: 'Call not answered, left voicemail'
      },
      {
        status: 'Hot Lead',
        changedAt: '2025-06-22T09:15:00',
        changedBy: { firstName: 'Rahul', lastName: 'Sharma', username: 'rahul.s' },
        remarks: 'Lead responded positively, ready for enrollment'
      }
    ];
    setStatusHistory(staticStatusHistory);
    setStatusHistoryLoading(false);
  }, [id]);

  const initials = leadDetails?.fullName ? leadDetails.fullName.substring(0, 2).toUpperCase() : 'PK';

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'connected':
        return 'bg-green-100 text-green-700';
      case 'not connected':
        return 'bg-red-100 text-red-700';
      case 'interested':
        return 'bg-blue-100 text-blue-700';
      case 'follow up':
        return 'bg-orange-100 text-orange-700';
      case 'hot lead':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const statusHistoryColumns = [
    {
      key: 'sno',
      header: 'S.No',
      render: (_, __, index) => index + 1
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value || '-'}
        </span>
      )
    },
    {
      key: 'changedAt',
      header: 'Changed At',
      render: (value) => formatDate(value)
    },
    {
      key: 'changedBy',
      header: 'Changed By',
      render: (value, row) => row?.changedBy?.firstName && row?.changedBy?.lastName
        ? `${row.changedBy.firstName} ${row.changedBy.lastName}`
        : row?.changedBy?.username || '-'
    },
    {
      key: 'remarks',
      header: 'Remarks',
      render: (value) => value || '-'
    }
  ];

  const handleScheduleSubmit = async (formData) => {
    try {
      const response = await createLeadSchedule(id, formData);
      if (response?.data?.success) {
        showToast('Follow-up scheduled successfully');
      } else {
        showToast(response?.data?.message || 'Unable to schedule follow-up');
      }
    } catch (error) {
      console.error('Failed to schedule follow-up', error);
      showToast('Failed to schedule follow-up');
    }
  };

  if (loading) {
    return <div className="p-6">Loading lead details...</div>;
  }

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
          <CustomButton variant="primary" onClick={() => setIsScheduleModalOpen(true)} className="text-xs py-1.5 px-3 flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Schedule Follow-up
          </CustomButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div className="flex flex-col gap-4">
          {/* Lead Info Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full">
            <div className="flex flex-col sm:flex-row items-start gap-5 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900 mb-1">{leadDetails?.fullName || 'Priya Kumar'}</h2>
                <p className="text-sm text-gray-500 mb-3">{leadDetails ? `${leadDetails.phoneNumber} · ${leadDetails.email}` : '+91 98765 43210 · priya.kumar@gmail.com'}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-100 uppercase tracking-wide">🔥 {leadDetails?.currentStatus || 'Hot Lead'}</span>
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-wide">{leadDetails?.courseInterested || 'Full Stack Dev'}</span>
                  <span className="bg-gray-50 text-gray-500 text-[10px] font-medium px-2 py-0.5 rounded-full border border-gray-100">Source: {leadDetails?.source?.name || 'Google Ads'}</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <CustomButton variant="primary" onClick={() => setIsCallModalOpen(true)} className="bg-green-600 hover:bg-green-700 py-1.5 px-3 text-xs">Call</CustomButton>
                <CustomButton variant="secondary" onClick={() => setIsWhatsAppModalOpen(true)} className="py-1.5 px-3 text-xs">WhatsApp</CustomButton>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'City', value: leadDetails?.city || 'Bangalore, KA' },
                { label: 'State', value: leadDetails?.state || 'Karnataka' },
                { label: 'Country', value: leadDetails?.country || 'India' },
                { label: 'Status', value: leadDetails?.currentStatus || 'Professional' },
                { label: 'Lead Date', value: leadDetails?.createdAt ? new Date(leadDetails.createdAt).toLocaleDateString() : 'June 3, 2025' },
                { label: 'Source', value: leadDetails?.source?.name || 'Google Ads' }
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{item.label}</div>
                  <div className="text-xs font-semibold text-gray-800">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Course Info */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Course Information</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Interested Course</div>
                  <div className="text-xs font-bold text-blue-600">{leadDetails?.courseInterested || 'Full Stack Development'}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Batch Preference</div>
                  <div className="text-xs font-semibold text-gray-800">Weekend Batch</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Budget</div>
                  <div className="text-xs font-semibold text-gray-800">₹45,000 – ₹60,000</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Start Date Pref.</div>
                  <div className="text-xs font-semibold text-gray-800">July 2025</div>
                </div>
              </div>
            </div>

            {/* Lead Status History */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Lead Status History</h3>
              {statusHistoryLoading ? (
                <div className="text-center py-4 text-gray-500 text-sm">Loading status history...</div>
              ) : (
                <ReusableTable
                  columns={statusHistoryColumns}
                  data={statusHistory}
                  emptyMessage="No status history available"
                />
              )}
            </div>
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
      />

      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        studentData={leadDetails}
      />
    </div>
  );
};

export default LeadDetail;

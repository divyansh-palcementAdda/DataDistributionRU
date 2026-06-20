import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import CustomButton from '../component/reusable/CustomButton';
import LeadRemarkModal from "../component/reusable/Leads/LeadRemarkModal";
import { getLeadById, getLeadAssignmentHistory } from '../Services/lead/leadService';

const LeadDetail = () => {
  const { id } = useParams();
  const { navTo, showToast, openAddLeadModal } = useAppContext();
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [leadDetails, setLeadDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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

      const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
          const res = await getLeadAssignmentHistory(id);
          if (res?.data?.success) {
            setAssignmentHistory(res.data.data || []);
          }
        } catch (err) {
          console.error('Failed to fetch assignment history', err);
        } finally {
          setHistoryLoading(false);
        }
      };
      fetchHistory();
    }
  }, [id]);

  const mockLead = { name: 'Priya Kumar', phone: '+91 98765 43210', course: 'Full Stack Dev', remark: 'Lead is very interested in Full Stack. Has budget clarity. Needs EMI option info. Decision maker herself. Likely to register by end of June.' };

  const currentLead = leadDetails || mockLead;
  const initials = leadDetails?.fullName ? leadDetails.fullName.substring(0, 2).toUpperCase() : 'PK';

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
          <CustomButton variant="primary" onClick={() => showToast('Scheduled successfully')} className="text-xs py-1.5 px-3 flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Schedule Follow-up
          </CustomButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        <div className="flex flex-col gap-4">
          {/* Lead Info Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
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
                <CustomButton variant="primary" onClick={() => showToast('Calling Priya Kumar…')} className="bg-green-600 hover:bg-green-700 py-1.5 px-3 text-xs">Call</CustomButton>
                <CustomButton variant="secondary" onClick={() => showToast('Opening WhatsApp…')} className="py-1.5 px-3 text-xs">WhatsApp</CustomButton>
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
          </div>

          {/* Course Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Course Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          {/* Communication History */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Communication History</h3>
            <div className="space-y-3" id="timeline-list">
              {historyLoading ? (
                <div className="text-xs text-gray-400 italic text-center py-6">Loading history...</div>
              ) : assignmentHistory.length === 0 ? (
                <div className="text-xs text-gray-400 italic text-center py-6">No assignment history found</div>
              ) : (
                assignmentHistory.map((item, idx) => {
                  const isFirst = idx === 0;
                  const assignedAt = item.assignedAt ? new Date(item.assignedAt) : null;
                  return (
                    <div key={item.id || idx} className="relative flex gap-3">
                      {/* Timeline line */}
                      {idx < assignmentHistory.length - 1 && (
                        <div className="absolute left-[15px] top-8 bottom-0 w-px bg-gray-100" />
                      )}
                      {/* Dot */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                        isFirst ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isFirst ? '#2563eb' : '#9ca3af'} strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      {/* Content */}
                      <div className="flex-1 bg-gray-50 border border-gray-100 rounded-lg p-3">
                        <div className="flex flex-wrap items-start justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-gray-800">
                            {item.assignedTo?.fullName || item.assignedTo?.name || 'Unknown User'}
                          </span>
                          {assignedAt && (
                            <span className="text-[10px] text-gray-400">
                              {assignedAt.toLocaleDateString()} · {assignedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        {item.assignedBy && (
                          <p className="text-[11px] text-gray-500">
                            Assigned by <span className="font-semibold text-gray-700">{item.assignedBy?.fullName || item.assignedBy?.name || 'System'}</span>
                          </p>
                        )}
                        {item.remarks && (
                          <p className="text-[11px] text-gray-600 mt-1 italic">"{item.remarks}"</p>
                        )}
                        {isFirst && (
                          <span className="inline-block mt-1.5 bg-blue-50 text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-wide">Current</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Remarks */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-gray-800">Remarks & Notes</h3>
              <CustomButton variant="secondary" className="text-[10px] py-1 px-2" onClick={() => setIsRemarkModalOpen(true)}>
                Edit Remark
              </CustomButton>
            </div>
            <div className="p-3 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
              {leadDetails?.remarks || 'Lead is very interested in Full Stack. Has budget clarity. Needs EMI option info. Decision maker herself. Likely to register by end of June.'}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-center">
            <div className="relative inline-flex items-center justify-center mb-2">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100" />
                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-orange-500" strokeDasharray={226.2} strokeDashoffset={226.2 - (226.2 * 87) / 100} />
              </svg>
              <span className="absolute text-xl font-black text-orange-600">87</span>
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Lead Score</div>

            <div className="space-y-3 px-1">
              {[
                { label: 'Engagement', val: 90, color: 'bg-green-500' },
                { label: 'Budget Fit', val: 80, color: 'bg-blue-500' },
                { label: 'Intent', val: 85, color: 'bg-orange-500' }
              ].map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-1">
                    <span>{s.label}</span>
                    <span>{s.val}%</span>
                  </div>
                  <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${s.color}`} style={{ width: `${s.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Assigned Counselor</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">RS</div>
              <div>
                <div className="text-xs font-bold text-gray-800">Rahul Singh</div>
                <div className="text-[10px] text-gray-400">Senior Counselor</div>
              </div>
            </div>
            <CustomButton variant="secondary" className="w-full text-[11px] py-1.5" onClick={() => showToast('Reassigned successfully')}>Reassign</CustomButton>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <button onClick={() => showToast('Marked as Registered!')} className="w-full py-1.5 rounded-lg text-[11px] font-bold bg-green-50 text-green-600 hover:bg-green-100 transition-colors border border-green-100">✓ Mark Registered</button>
              <button onClick={() => showToast('Marked as Hot Lead!')} className="w-full py-1.5 rounded-lg text-[11px] font-bold bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors border border-orange-100">🔥 Mark Hot Lead</button>
              <button onClick={() => showToast('Marked as Cold Lead')} className="w-full py-1.5 rounded-lg text-[11px] font-bold bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors border border-gray-100">❄️ Mark Cold Lead</button>
              <button onClick={() => showToast('Marked as Bad Lead')} className="w-full py-1.5 rounded-lg text-[11px] font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-100">✗ Mark Bad Lead</button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Next Follow-up</h3>
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-3">
              <div className="text-xs font-bold text-orange-800">{leadDetails?.nextFollowUpDate ? new Date(leadDetails.nextFollowUpDate).toLocaleDateString() : 'June 15, 2025'}</div>
              <div className="text-[10px] text-orange-600 mt-0.5 font-medium">{leadDetails?.nextFollowUpDate ? new Date(leadDetails.nextFollowUpDate).toLocaleTimeString() : '10:00 AM · Call'}</div>
            </div>
            <CustomButton variant="secondary" className="w-full text-[11px] py-1.5" onClick={openAddLeadModal}>Reschedule</CustomButton>
          </div>
        </div>
      </div>

      <LeadRemarkModal
        isOpen={isRemarkModalOpen}
        onClose={() => setIsRemarkModalOpen(false)}
        lead={mockLead}
        onSave={(lead, remark) => showToast('Remark saved')}
      />
    </div>
  );
};

export default LeadDetail;
import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import CustomButton from '../component/reusable/CustomButton';
import LeadRemarkModal from '../component/reusable/LeadRemarkModal';

const LeadDetail = () => {
  const { navTo, showToast, openAddLeadModal } = useAppContext();
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  
  const mockLead = { name: 'Priya Kumar', phone: '+91 98765 43210', course: 'Full Stack Dev', remark: 'Lead is very interested in Full Stack. Has budget clarity. Needs EMI option info. Decision maker herself. Likely to register by end of June.' };


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
            <p className="text-sm text-gray-500">Full CRM profile for this lead</p>
          </div>
        </div>
        <div className="flex gap-2">
          <CustomButton variant="secondary" className="text-xs py-1.5 px-3">Edit Lead</CustomButton>
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
                PK
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Priya Kumar</h2>
                <p className="text-sm text-gray-500 mb-3">+91 98765 43210 · priya.kumar@gmail.com</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-100 uppercase tracking-wide">🔥 Hot Lead</span>
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-wide">Full Stack Dev</span>
                  <span className="bg-gray-50 text-gray-500 text-[10px] font-medium px-2 py-0.5 rounded-full border border-gray-100">Source: Google Ads</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <CustomButton variant="primary" onClick={() => showToast('Calling Priya Kumar…')} className="bg-green-600 hover:bg-green-700 py-1.5 px-3 text-xs">Call</CustomButton>
                <CustomButton variant="secondary" onClick={() => showToast('Opening WhatsApp…')} className="py-1.5 px-3 text-xs">WhatsApp</CustomButton>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'City', value: 'Bangalore, KA' },
                { label: 'Qualification', value: 'B.Tech (CS)' },
                { label: 'Work Status', value: 'Professional' },
                { label: 'Experience', value: '2 years' },
                { label: 'Lead Date', value: 'June 3, 2025' },
                { label: 'Source', value: 'Google Ads' }
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
                <div className="text-xs font-bold text-blue-600">Full Stack Development</div>
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
            <div className="space-y-4" id="timeline-list">
              {/* Timeline content can be mapped here */}
              <div className="text-xs text-gray-400 italic text-center py-4">No recent activity</div>
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
              Lead is very interested in Full Stack. Has budget clarity. Needs EMI option info. Decision maker herself. Likely to register by end of June.
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
              <div className="text-xs font-bold text-orange-800">June 15, 2025</div>
              <div className="text-[10px] text-orange-600 mt-0.5 font-medium">10:00 AM · Call</div>
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
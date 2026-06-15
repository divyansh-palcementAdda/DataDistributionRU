import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import CustomButton from '../component/reusable/CustomButton';
import { followups } from '../mockData';

const FollowUps = () => {
  const { openAddLeadModal, showToast } = useAppContext();
  const [activeTab, setActiveTab] = useState('fu-today');

  // Data categorization based on status
  const todayList = followups.filter(f => f.status === 'today');
  const upcomingList = followups.filter(f => f.status === 'upcoming');
  const missedList = followups.filter(f => f.status === 'missed');

  const FollowupCard = ({ followup }) => (
    <div className={`p-4 rounded-xl border shadow-sm flex flex-wrap items-center justify-between gap-4 transition-all hover:shadow-md ${followup.urgent ? 'bg-orange-50 border-orange-100' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${followup.urgent ? 'bg-orange-500' : 'bg-purple-600'}`}>
          {followup.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">{followup.name}</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">{followup.course} • <span className="font-semibold text-blue-600">{followup.type}</span> • {followup.time}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => showToast('Rescheduled!')} className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors uppercase tracking-tight">Reschedule</button>
        <button onClick={() => showToast('Action taken')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold text-white transition-colors uppercase tracking-tight shadow-sm ${followup.urgent ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}>Take Action</button>
      </div>
    </div>
  );

  return (
    <div className="block" id="page-followups">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Follow-up Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage all scheduled follow-ups</p>
        </div>
        <CustomButton variant="primary" onClick={openAddLeadModal} className="text-xs py-1.5 px-3">
          + Schedule Follow-up
        </CustomButton>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-5 w-fit">
        <div
          className={`px-4 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all duration-150 ${activeTab === 'fu-today' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('fu-today')}
        >
          Today ({todayList.length})
        </div>
        <div
          className={`px-4 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all duration-150 ${activeTab === 'fu-upcoming' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('fu-upcoming')}
        >
          Upcoming ({upcomingList.length})
        </div>
        <div
          className={`px-4 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all duration-150 ${activeTab === 'fu-missed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('fu-missed')}
        >
          Missed ({missedList.length})
        </div>
      </div>

      {activeTab === 'fu-today' && (
        <div id="fu-today">
          <div className="grid grid-cols-1 gap-2.5" id="followup-today-list">
            {todayList.length > 0 ? (
              todayList.map((f, idx) => <FollowupCard key={idx} followup={f} />)
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl py-12 text-center text-gray-400 italic text-sm">
                No follow-ups scheduled for today
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'fu-upcoming' && (
        <div id="fu-upcoming">
          <div className="grid grid-cols-1 gap-2.5">
            {upcomingList.length > 0 ? (
              upcomingList.map((f, idx) => <FollowupCard key={idx} followup={f} />)
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl py-12 text-center text-gray-400 italic text-sm">
                No upcoming follow-ups
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'fu-missed' && (
        <div id="fu-missed" className="tab-pane">
          <div className="grid grid-cols-1 gap-2.5" id="followup-missed-list">
            {missedList.length > 0 ? (
              missedList.map((f, idx) => <FollowupCard key={idx} followup={f} />)
            ) : (
              <div className="bg-green-50 border border-dashed border-green-100 rounded-xl py-12 text-center text-green-600 italic text-sm font-medium">
                ✓ All follow-ups completed! No missed entries.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUps;
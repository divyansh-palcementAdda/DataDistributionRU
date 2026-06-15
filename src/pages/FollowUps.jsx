import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import CustomButton from '../component/reusable/CustomButton';

const FollowUps = () => {
  const { openAddLeadModal } = useAppContext();
  const [activeTab, setActiveTab] = useState('fu-today');

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
          Today (12)
        </div>
        <div
          className={`px-4 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all duration-150 ${activeTab === 'fu-upcoming' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('fu-upcoming')}
        >
          Upcoming (47)
        </div>
        <div
          className={`px-4 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all duration-150 ${activeTab === 'fu-missed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('fu-missed')}
        >
          Missed (8)
        </div>
      </div>

      {activeTab === 'fu-today' && (
        <div id="fu-today">
          <div className="grid grid-cols-1 gap-2.5" id="followup-today-list">
            {/* Content for today's follow-ups will go here */}
          </div>
        </div>
      )}

      {activeTab === 'fu-upcoming' && (
        <div id="fu-upcoming">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="p-5">
              <div className="grid grid-cols-7 gap-1" id="calendar-grid"></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fu-missed' && (
        <div id="fu-missed" className="tab-pane">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }} id="followup-missed-list"></div>
        </div>
      )}
    </div>
  );
};

export default FollowUps;
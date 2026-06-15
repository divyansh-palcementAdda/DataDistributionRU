import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import CustomButton from '../component/reusable/CustomButton';

const FollowUps = () => {
  const { openAddLeadModal } = useAppContext();
  const [activeTab, setActiveTab] = useState('fu-today');

  return (
    <div className="page active" id="page-followups">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="text-xl font-bold text-gray-900">Follow-up Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage all scheduled follow-ups</p>
        </div>
        <CustomButton variant="primary" onClick={openAddLeadModal} className="btn-sm">
          + Schedule Follow-up
        </CustomButton>
      </div>

      <div className="tabs">
        <div
          className={`tab ${activeTab === 'fu-today' ? 'active' : ''}`}
          onClick={() => setActiveTab('fu-today')}
        >
          Today (12)
        </div>
        <div
          className={`tab ${activeTab === 'fu-upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('fu-upcoming')}
        >
          Upcoming (47)
        </div>
        <div
          className={`tab ${activeTab === 'fu-missed' ? 'active' : ''}`}
          onClick={() => setActiveTab('fu-missed')}
        >
          Missed (8)
        </div>
      </div>

      {activeTab === 'fu-today' && (
        <div id="fu-today" className="tab-pane">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }} id="followup-today-list">
            {/* Content for today's follow-ups will go here */}
          </div>
        </div>
      )}

      {activeTab === 'fu-upcoming' && (
        <div id="fu-upcoming" className="tab-pane">
          <div className="card">
            <div style={{ padding: '20px' }}>
              <div className="calendar-grid" id="calendar-grid"></div>
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
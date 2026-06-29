import React, { useState, useMemo } from 'react';
import { useAppContext } from '../AppContext';
import CustomButton from '../component/reusable/CustomButton';
import { leads as initialLeads, kanbanCols, counselors, statusConfig } from '../mockData';
import {
  FiPhoneCall,
  FiUsers,
  FiCheckCircle,
  FiUserCheck,
  FiXCircle,
  FiUserX ,
} from "react-icons/fi";

const Pipeline = () => {
  const { openAddLeadModal, navTo, showToast } = useAppContext();
  const [leads, setLeads] = useState(initialLeads);
  const [activeStatus, setActiveStatus] = useState(kanbanCols[0].key);

 const statusIcons = {
  raw: <FiUsers size={16} />,
  connected: <FiPhoneCall size={16} />,
  interested: <FiCheckCircle size={16} />,
  registered: <FiUserCheck size={16} />,
  notinterested: <FiUserX size={16} />,
  bad: <FiXCircle size={16} />
};

  const filteredLeads = useMemo(() => {
    return leads.filter(l => l.status === activeStatus);
  }, [leads, activeStatus]);

  const onDragStart = (e, id) => {
    e.dataTransfer.setData('leadId', id);
  };

  const onDrop = (e, newStatus) => {
    const leadId = parseInt(e.dataTransfer.getData('leadId'));
    const lead = leads.find((l) => l.id === leadId);

    if (lead && lead.status !== newStatus) {
      const updatedLeads = leads.map((l) =>
        l.id === leadId ? { ...l, status: newStatus } : l
      );
      setLeads(updatedLeads);
      showToast(`Moved ${lead.name} to ${statusConfig[newStatus].label}`);
    }
  };

  return (
    <div className="block" id="page-pipeline">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Lead Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">Drag and drop leads through the sales funnel</p>
        </div>
        <div className="flex gap-2">
          <CustomButton variant="secondary" className="text-xs py-1.5 px-3 flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Filter
          </CustomButton>
          <CustomButton variant="primary" onClick={openAddLeadModal} className="text-xs py-1.5 px-3">
            + Add Lead
          </CustomButton>
        </div>
      </div>

      {/* ── Status Cards as Tabs ── */}
      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        {kanbanCols.map((col) => {
          const colLeads = leads.filter((l) => l.status === col.key);
          const isActive = activeStatus === col.key;
          return (
            <div
              key={col.key}
              onClick={() => setActiveStatus(col.key)}
              className={`
    relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm
    border transition-all duration-300 cursor-pointer
    hover:shadow-lg hover:-translate-y-1
    ${isActive
                  ? "border-blue-500 ring-2 ring-blue-100"
                  : "border-gray-100"}
  `}
            >
             <div className="flex items-start justify-between mb-4">

  <div>
    <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">
      {col.label}
    </p>

    <h2 className="text-3xl font-bold text-gray-900 mt-2">
      {colLeads.length}
    </h2>
  </div>

  <div
    className="w-10 h-10 rounded-xl flex items-center justify-center"
    style={{
      backgroundColor: `${col.color}20`,
      color: col.color
    }}
  >
    {statusIcons[col.key]}
  </div>

</div>

<div className="flex items-center justify-between">
  <span className="text-sm text-gray-400">
    Total Leads
  </span>

  {isActive && (
    <span className="text-xs font-semibold text-blue-600">
      Active
    </span>
  )}
</div>

              {/* <div className="stat-value">{colLeads.length}</div>
              <div className="stat-icon" style={{ background: col.color, opacity: 0.1 }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: col.color }}></div>
              </div> */}
            </div>
          );
        })}
      </div>

      {/* ── Leads Table ── */}
      <div className="card animate-fadeIn">
        <div className="card-header">
          <div className="card-title">Leads for {statusConfig[activeStatus]?.label}</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Lead Name</th>
                <th>Course</th>
                <th>Counselor</th>
                <th>Source</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{lead.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{lead.phone}</div>
                    </td>
                    <td style={{ color: 'var(--gray-700)' }}>{lead.course}</td>
                    <td style={{ color: 'var(--gray-700)' }}>{lead.counselor}</td>
                    <td style={{ color: 'var(--gray-500)', fontSize: '12px' }}>{lead.source}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => navTo('lead-detail')}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
                    Is category mein koi leads nahi hain.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Pipeline;
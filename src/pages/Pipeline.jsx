import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import CustomButton from '../component/reusable/CustomButton';
import { leads as initialLeads, kanbanCols, counselors, statusConfig } from '../mockData';

const Pipeline = () => {
  const { openAddLeadModal, navTo, showToast } = useAppContext();
  const [leads, setLeads] = useState(initialLeads);

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

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-220px)] scrollbar-hide">
        {kanbanCols.map((col) => {
          const colLeads = leads.filter((l) => l.status === col.key);
          return (
            <div
              key={col.key}
              className="min-w-[280px] max-w-[280px] bg-gray-100 rounded-xl flex flex-col h-fit"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, col.key)}
            >
              {/* Column Header */}
              <div className="p-3.5 flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }}></div>
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">{col.label}</h3>
                </div>
                <span className="bg-white border border-gray-200 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {colLeads.length}
                </span>
              </div>

              {/* Column Body / Cards */}
              <div className="p-2 flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-300px)]">
                {colLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, lead.id)}
                    onClick={() => navTo('lead-detail')}
                    className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:border-blue-500 transition-all group"
                  >
                    <div className="text-sm font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                      {lead.name}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-2">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07" />
                      </svg>
                      {lead.phone}
                    </div>
                    <div className="inline-block bg-blue-50 text-blue-600 text-[10px] font-semibold px-2 py-0.5 rounded mb-2">
                      {lead.course}
                    </div>
                    <div className="text-[10px] text-gray-400 mb-3 flex items-center gap-1">
                      <span>📍 {lead.city}</span>
                      <span>•</span>
                      <span>{lead.source}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                          style={{ backgroundColor: counselors.find(c => c.name === lead.counselor)?.color || '#94A3B8' }}
                        >
                          {lead.counselor.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-[10px] text-gray-500 font-medium">{lead.counselor.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pipeline;
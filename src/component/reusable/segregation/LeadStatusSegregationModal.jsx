import React, { useState, useMemo } from 'react';

const LeadStatusSegregationModal = ({
  isOpen,
  onClose,
  data,
  loading,
  scopeTitle,
  totalScopeLeads,
  onViewStatusData
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const statuses = data || [];

  const totalLeadsCalculated = useMemo(() => {
    return statuses.reduce((sum, item) => sum + (item.count || 0), 0);
  }, [statuses]);

  const effectiveTotal = totalScopeLeads || totalLeadsCalculated || 1;

  const filteredStatuses = useMemo(() => {
    if (!searchTerm.trim()) return statuses;
    const term = searchTerm.toLowerCase();
    return statuses.filter(
      (s) =>
        s.name?.toLowerCase().includes(term) ||
        s.code?.toLowerCase().includes(term) ||
        s.sentimentCategory?.toLowerCase().includes(term)
    );
  }, [statuses, searchTerm]);

  if (!isOpen) return null;

  const getSentimentBadge = (category) => {
    switch (category) {
      case 'POSITIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Positive
          </span>
        );
      case 'NEGATIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Negative
          </span>
        );
      case 'NEUTRAL':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Neutral
          </span>
        );
    }
  };

  const getProgressBarColor = (category) => {
    switch (category) {
      case 'POSITIVE':
        return 'bg-emerald-500';
      case 'NEGATIVE':
        return 'bg-rose-500';
      case 'NEUTRAL':
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white p-5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <span>Scope</span>
              <span>•</span>
              <span className="text-white bg-white/20 px-2 py-0.5 rounded-md font-medium">{scopeTitle || 'Selected Segregation'}</span>
            </div>
            <h3 className="font-bold text-white text-xl flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Lead Status Breakdown Matrix
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all cursor-pointer"
            title="Close modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search status by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-2xs"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg border border-purple-100 font-bold">
              Total Scope Leads: {totalScopeLeads ?? totalLeadsCalculated}
            </span>
          </div>
        </div>

        {/* Status List / Table */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50/50">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-gray-600">Loading status analytics...</p>
            </div>
          ) : filteredStatuses.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-xl border border-dashed border-gray-300 p-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No Lead Status Data</h3>
              <p className="mt-1 text-sm text-gray-500">No lead status metrics available for the current selection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredStatuses.map((status) => {
                const count = status.count || 0;
                const percentage = effectiveTotal > 0 ? ((count / effectiveTotal) * 100).toFixed(1) : '0';

                return (
                  <div
                    key={status.statusId}
                    className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-base group-hover:text-purple-700 transition-colors">
                            {status.name}
                          </h4>
                          {getSentimentBadge(status.sentimentCategory)}
                        </div>
                        <span className="text-xl font-extrabold text-gray-900 bg-gray-50 px-2.5 py-0.5 rounded-lg border border-gray-100">
                          {count}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span className="font-mono">{status.code}</span>
                        <span>{percentage}% of scope</span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(
                            status.sentimentCategory
                          )}`}
                          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center justify-end pt-2 border-t border-gray-100">
                      <button
                        onClick={() => onViewStatusData(status)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white rounded-lg font-semibold text-xs transition-all cursor-pointer border border-purple-200 hover:border-purple-600 shadow-2xs"
                        title={`View all leads in status "${status.name}"`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Data
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadStatusSegregationModal;

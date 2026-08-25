import React from 'react';
import CustomButton from './CustomButton';

const BreakdownModal = ({
  isOpen,
  onClose,
  title,
  data
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-600 text-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-lg">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 bg-gray-50">
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            
            {/* Connected */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700">Connected</span>
              </div>
              <span className="text-lg font-bold text-green-600">{data?.connected || 0}</span>
            </div>

            {/* Not Connected */}
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700">Not Connected</span>
              </div>
              <span className="text-lg font-bold text-red-600">{data?.notConnected || 0}</span>
            </div>

            {/* Additional Stats */}
            {data?.assign !== undefined && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Assign</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{data?.assign || 0}</span>
              </div>
            )}

            {data?.albeit !== undefined && (
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Albeit</span>
                </div>
                <span className="text-lg font-bold text-amber-600">{data?.albeit || 0}</span>
              </div>
            )}

            {data?.notAssign !== undefined && (
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="6" x2="12" y2="18" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Not Assign</span>
                </div>
                <span className="text-lg font-bold text-purple-600">{data?.notAssign || 0}</span>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-5 py-4 border-t border-gray-100">
          <CustomButton
            variant="primary"
            onClick={onClose}
            className="w-full text-sm py-2 bg-blue-600 hover:bg-blue-700"
          >
            Close
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default BreakdownModal;
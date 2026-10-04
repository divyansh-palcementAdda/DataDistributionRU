import React, { useState, useEffect } from 'react';
import { completeLeadFollowUp, updateLeadRemarks } from '../../../Services/lead/leadService';

const LeadRemarkModal = ({ isOpen, onClose, lead, onSave, followUpId }) => {
  const [remark, setRemark] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getLeadName = (item) =>
    item?.fullName || item?.name || item?.leadName || 'Unknown Lead';

  const getLeadPhone = (item) =>
    item?.phoneNumber || item?.phone || item?.mobileNumber || item?.mobile || 'N/A';

  const getLeadCourse = (item) => {
    if (!item) return 'N/A';

    // Check interestedCourses array first (replaces legacy courseInterested string)
    if (Array.isArray(item.interestedCourses) && item.interestedCourses.length > 0) {
      const c = item.interestedCourses[0];
      if (typeof c === 'object' && c !== null) return c.courseName || c.courseCode || 'N/A';
      if (typeof c === 'string' && c.trim()) return c;
    }

    if (typeof item.course === 'string' && item.course.trim()) {
      return item.course;
    }

    if (item.course && typeof item.course === 'object') {
      return item.course.courseName || item.course.courseCode || 'N/A';
    }

    return 'N/A';
  };

  const getLeadStatus = (item) => {
    const s = item?.currentStatus || item?.status;
    if (!s) return '';
    if (typeof s === 'string') return s;
    return s.name || s.code || '';
  };

  const getInitials = (item) => {
    const name = getLeadName(item);
    if (!name || name === 'Unknown Lead') return 'LD';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    if (lead) {
      setRemark(lead.remarks || lead.remark || '');
    } else {
      setRemark('');
    }
    setErrorMessage('');
  }, [lead, isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSaving) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  const resolveFollowUpId = () =>
    followUpId ||
    lead?.followUpId ||
    lead?.followupId ||
    lead?.nextFollowUp?.id ||
    lead?.followUp?.id ||
    lead?.followup?.id ||
    lead?.followUp?.followUpId ||
    lead?.nextFollowUp?.followUpId;

  const handleSave = async () => {
    if (!remark || !remark.trim()) {
      setErrorMessage('Please enter a remark before saving.');
      return;
    }

    const trimmedRemark = remark.trim();
    const resolvedFollowUpId = resolveFollowUpId();
    const leadId = lead?.id || lead?._id;

    setIsSaving(true);
    setErrorMessage('');

    try {
      if (resolvedFollowUpId) {
        const response = await completeLeadFollowUp(resolvedFollowUpId, trimmedRemark);

        if (!response?.data?.success) {
          const message =
            response?.data?.message ||
            'Failed to complete follow-up.';
          setErrorMessage(message);
          return;
        }
      } else if (leadId) {
        const response = await updateLeadRemarks(leadId, trimmedRemark);
        if (!response?.data?.success && response?.status !== 200) {
          const message =
            response?.data?.message ||
            'Failed to save lead remark.';
          setErrorMessage(message);
          return;
        }
      }

      if (onSave) {
        await onSave(lead, trimmedRemark);
      }

      onClose();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to save remark.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const leadName = getLeadName(lead);
  const leadPhone = getLeadPhone(lead);
  const leadCourse = getLeadCourse(lead);
  const leadStatus = getLeadStatus(lead);
  const initials = getInitials(lead);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shadow-xs">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Lead Remark</h3>
              <p className="text-xs text-slate-500">Record counselor feedback or updates for this lead</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
            title="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 bg-white">
          {/* Candidate Summary Card */}
          {lead && (
            <div className="p-3.5 bg-gradient-to-r from-purple-50/40 via-slate-50 to-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0 uppercase tracking-wide">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-800 truncate">{leadName}</span>
                  {leadStatus && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 tracking-wide uppercase">
                      {leadStatus}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-mono text-[11px] text-slate-600">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    {leadPhone}
                  </span>
                  {leadCourse !== 'N/A' && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="truncate bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium text-[11px] border border-purple-100 max-w-[200px]">
                        {leadCourse}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Textarea Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>Remark Notes</span>
                <span className="text-purple-600 font-bold">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                {remark ? `${remark.length} characters` : 'Required'}
              </span>
            </div>
            <textarea
              rows={4}
              placeholder="Enter detailed counselor feedback, interaction notes, student concerns, or next steps..."
              value={remark}
              onChange={(e) => {
                setRemark(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              disabled={isSaving}
              className={`w-full rounded-xl border p-3.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all outline-none resize-y min-h-[120px] ${
                errorMessage
                  ? 'border-red-300 bg-red-50/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                  : 'border-slate-200 bg-slate-50/40 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'
              }`}
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 animate-in fade-in duration-150">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-500 shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50/70 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 border border-slate-200 rounded-xl transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-xl shadow-sm shadow-purple-600/25 hover:shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin text-white" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Save Remark
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadRemarkModal;

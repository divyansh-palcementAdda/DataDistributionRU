import React, { useState, useEffect } from 'react';
import CustomButton from '../CustomButton';
import { completeLeadFollowUp } from '../../../Services/lead/leadService';

const LeadRemarkModal = ({ isOpen, onClose, lead, onSave, followUpId }) => {
  const [remark, setRemark] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getLeadName = (item) =>
    item?.fullName || item?.name || item?.leadName || 'Unknown Lead';

  const getLeadPhone = (item) =>
    item?.phoneNumber || item?.phone || item?.mobileNumber || 'N/A';

  const getLeadCourse = (item) => {
    if (!item) return 'N/A';

    if (typeof item.courseInterested === 'string' && item.courseInterested.trim()) {
      return item.courseInterested;
    }

    if (typeof item.course === 'string' && item.course.trim()) {
      return item.course;
    }

    if (item.course && typeof item.course === 'object') {
      return item.course.courseName || item.course.courseCode || 'N/A';
    }

    return 'N/A';
  };

  useEffect(() => {
    if (lead && lead.remark) {
      setRemark(lead.remark);
    } else {
      setRemark('');
    }
    setErrorMessage('');
  }, [lead, isOpen]);

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
    console.log("Save button clicked");
    const resolvedFollowUpId = resolveFollowUpId();
    console.log("Resolved FollowUp ID:", resolvedFollowUpId);

    setIsSaving(true);
    setErrorMessage('');

    try {
      if (resolvedFollowUpId) {
        const response = await completeLeadFollowUp(resolvedFollowUpId, remark);

        if (!response?.data?.success) {
          const message =
            response?.data?.message ||
            'Failed to complete follow-up.';
          setErrorMessage(message);
          return;
        }
      }

      if (onSave) {
        onSave(lead, remark);
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

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: '450px' }}>
        <div className="modal-header">
          <div className="modal-title">Lead Remark</div>
          <CustomButton variant="ghost" className="btn-icon" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </CustomButton>
        </div>
        <div className="modal-body">
          {lead && (
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'var(--gray-50)', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gray-800)' }}>
                {getLeadName(lead)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>
                {getLeadPhone(lead)} | {getLeadCourse(lead)}
              </div>
            </div>
          )}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '600', color: 'var(--gray-700)' }}>Remark Notes</label>
            <textarea
              className="form-control"
              rows="4"
              placeholder="Enter remarks for this lead..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
              ></textarea>
          </div>
          {errorMessage && (
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#dc2626' }}>
              {errorMessage}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <CustomButton variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</CustomButton>
          <CustomButton variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Remark'}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default LeadRemarkModal;

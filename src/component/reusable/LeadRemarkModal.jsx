import React, { useState, useEffect } from 'react';
import CustomButton from './CustomButton';

const LeadRemarkModal = ({ isOpen, onClose, lead, onSave }) => {
  const [remark, setRemark] = useState('');

  useEffect(() => {
    if (lead && lead.remark) {
      setRemark(lead.remark);
    } else {
      setRemark('');
    }
  }, [lead, isOpen]);

  const handleSave = () => {
    if (onSave) {
      onSave(lead, remark);
    }
    onClose();
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
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gray-800)' }}>{lead.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{lead.phone} | {lead.course}</div>
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
        </div>
        <div className="modal-footer">
          <CustomButton variant="secondary" onClick={onClose}>Cancel</CustomButton>
          <CustomButton variant="primary" onClick={handleSave}>Save Remark</CustomButton>
        </div>
      </div>
    </div>
  );
};

export default LeadRemarkModal;

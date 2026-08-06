import React from 'react';
import CustomButton from '../CustomButton';

const FollowUpActionModal = ({ isOpen, onClose, lead, onActionSelect }) => {
  if (!isOpen) return null;

  const getLeadName = (item) =>
    item?.fullName || item?.name || item?.leadName || 'Unknown Lead';

  const getLeadPhone = (item) =>
    item?.phoneNumber || item?.phone || item?.mobileNumber || 'N/A';

  const handleActionClick = (action) => {
    if (onActionSelect) {
      onActionSelect(lead, action);
    }
  };

  const actionButtons = [
    { label: 'Connected', value: 'connected', color: 'success' },
    { label: 'Not Connected', value: 'not_connected', color: 'danger' },
    { label: 'Form Follow up', value: 'form_followup', color: 'primary' },
    { label: 'Not Interested', value: 'not_interested', color: 'warning' },
    { label: 'Bad Data', value: 'bad_data', color: 'secondary' },
  ];

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div className="modal-title">Follow Up Action</div>
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
                {getLeadPhone(lead)}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {actionButtons.map((action) => (
              <CustomButton
                key={action.value}
                variant={action.color}
                onClick={() => handleActionClick(action.value)}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {action.label}
              </CustomButton>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <CustomButton variant="secondary" onClick={onClose}>
            Cancel
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default FollowUpActionModal;

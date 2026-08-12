import React, { useState, useEffect } from 'react';
import CustomButton from '../CustomButton';

const AssignLeadModal = ({ isOpen, onClose, onAssign, currentLead, users }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [isAlloting, setIsAlloting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const currentUser = {
    firstName: 'Current',
    lastName: 'User'
  };

  const isMultipleLeads = Array.isArray(currentLead);
  const leadCount = isMultipleLeads ? currentLead.length : 1;

  useEffect(() => {
    if (isOpen) {
      setSelectedUser('');
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleAllot = async () => {
    if (!selectedUser) {
      setErrorMessage('Please select a user to allot the lead to.');
      return;
    }

    setIsAlloting(true);
    setErrorMessage('');

    try {
      await onAssign(currentLead, selectedUser);
      onClose();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to allot lead.'
      );
    } finally {
      setIsAlloting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: '450px' }}>
        <div className="modal-header">
          <div className="modal-title">Allot Lead{leadCount > 1 ? 's' : ''}</div>
          <CustomButton variant="ghost" className="btn-icon" onClick={onClose} disabled={isAlloting}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </CustomButton>
        </div>
        <div className="modal-body">
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'var(--gray-50)', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gray-800)' }}>
              {isMultipleLeads ? `${leadCount} leads selected` : (currentLead?.fullName || currentLead?.name || 'Unknown Lead')}
            </div>
            {!isMultipleLeads && (
              <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>
                {currentLead?.leadCode || 'N/A'}
              </div>
            )}
          </div>
          
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontWeight: '600', color: 'var(--gray-700)' }}>From</label>
            <input
              type="text"
              className="form-control"
              value={`${currentUser.firstName} ${currentUser.lastName}`}
              disabled
              style={{ backgroundColor: 'var(--gray-100)', cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '600', color: 'var(--gray-700)' }}>To</label>
            <select
              className="form-control"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              disabled={isAlloting}
            >
              <option value="">Select a user...</option>
              {users && users.map((user) => (
                <option key={user.id || user.userId} value={user.id || user.userId}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>

          {errorMessage && (
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#dc2626' }}>
              {errorMessage}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <CustomButton variant="secondary" onClick={onClose} disabled={isAlloting}>Cancel</CustomButton>
          <CustomButton variant="primary" onClick={handleAllot} disabled={isAlloting}>
            {isAlloting ? 'Alloting...' : `Allot Lead${leadCount > 1 ? 's' : ''}`}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default AssignLeadModal;

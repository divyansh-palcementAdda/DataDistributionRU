import React, { useState, useEffect } from 'react';
import CustomButton from '../CustomButton';
import { getUsersDropdown } from '../../../Services/drop-down/dropDownService';
import { reassignLeads, reassignDistributeLeads, reassignFollowUps, reassignDistributeFollowUps } from '../../../Services/lead/leadService';

/**
 * ReassignModal
 *
 * Props:
 *  - isOpen            : bool
 *  - onClose           : fn
 *  - currentAssignedUserId: string - the current assigned user's ID (for filtering)
 *  - selectedRows      : Set - selected lead/followup IDs from table
 *  - dataType          : string - 'leads' or 'followups'
 *  - showToast         : fn(message, type) — optional toast notifier
 *  - onReassign        : fn(payload) — callback when reassign is confirmed
 */
const ReassignModal = ({ 
  isOpen, 
  onClose, 
  currentAssignedUserId, 
  selectedRows,
  dataType = 'leads',
  showToast,
  onReassign 
}) => {
  // ── step: 'selection' | 'single' | 'multiple' | 'preview' | 'done'
  const [step, setStep] = useState('selection');

  // form fields
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [singleSelectedUserId, setSingleSelectedUserId] = useState('');
  const [maximumDataPerUser, setMaximumDataPerUser] = useState('');
  const [reason, setReason] = useState('');

  // users list
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');

  // loading / error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // fetch all users when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setStep('selection');
    setSelectedUserIds([]);
    setSingleSelectedUserId('');
    setMaximumDataPerUser('');
    setReason('');
    setError('');

    const fetchUsers = async () => {
      setUsersLoading(true);
      setUsersError('');
      try {
        const res = await getUsersDropdown();
        // API returns { success: true, data: [...], ... }
        const list = Array.isArray(res?.data) ? res.data : [];
        // Filter out current counselor from the list
        const filteredUsers = list.filter(user => (user.id || user.userId) !== currentAssignedUserId);
        setUsers(filteredUsers);
        setSingleSelectedUserId('');
      } catch (err) {
        setUsersError('Users load karne mein error aaya.');
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, currentAssignedUserId]);

  // ── helpers ────────────────────────────────────────────────
  const toggleUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ── handlers ───────────────────────────────────────────────
  const handleSingleAssign = () => {
    setStep('single');
    setSingleSelectedUserId('');
    setError('');
  };

  const handleMultipleAssign = () => {
    setStep('multiple');
    setError('');
  };

  const handleBack = () => {
    setStep('selection');
    setSelectedUserIds([]);
    setSingleSelectedUserId('');
    setMaximumDataPerUser('');
    setReason('');
    setError('');
  };

  const handleSingleConfirm = async () => {
    setError('');
    if (!singleSelectedUserId) {
      setError('Please select a user to assign to.');
      return;
    }
    setLoading(true);
    try {
      let payload;
      let res;

      if (dataType === 'followups') {
        // Use follow-up specific API for follow-ups
        payload = {
          sourceUserId: currentAssignedUserId,
          assignments: [
            {
              targetUserId: singleSelectedUserId,
              followupIds: Array.from(selectedRows),
              count: selectedRows.size
            }
          ],
          reason: reason,
          allowWorkloadOverride: false
        };
        res = await reassignFollowUps(payload);
      } else {
        // Use existing lead reassign API for leads
        payload = {
          sourceUserId: currentAssignedUserId,
          assignments: [
            {
              targetUserId: singleSelectedUserId,
              leadIds: Array.from(selectedRows),
              count: selectedRows.size
            }
          ],
          reason: reason,
          reassignRelatedPendingFollowUps: true
        };
        res = await reassignLeads(payload);
      }
      
      if (res?.data?.success || res?.status === 200 || res?.status === 201) {
        setStep('done');
        showToast && showToast(`${dataType === 'leads' ? 'Lead' : 'Follow-up'} successfully reassigned!`, 'success');
        onReassign(payload);
      } else {
        setError(res?.data?.message || 'Reassignment failed. Please try again.');
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMultipleConfirm = async () => {
    setError('');
    if (selectedUserIds.length === 0) {
      setError('Kam se kam ek user select karna zaroori hai.');
      return;
    }
    setLoading(true);
    try {
      // Create assignments array for multiple users
      const dataArray = dataType === 'leads' ? Array.from(selectedRows) : Array.from(selectedRows);
      const isLeads = dataType === 'leads';
      
      // If max per user is specified, distribute data accordingly
      // Otherwise, distribute evenly among selected users
      let assignments;
      
      if (maximumDataPerUser !== '' && !isNaN(Number(maximumDataPerUser))) {
        const maxPerUser = Number(maximumDataPerUser);
        assignments = [];
        
        let currentIndex = 0;
        selectedUserIds.forEach((userId) => {
          if (currentIndex < dataArray.length) {
            const userData = dataArray.slice(currentIndex, currentIndex + maxPerUser);
            assignments.push({
              targetUserId: userId,
              leadIds: isLeads ? userData : [],
              followupIds: !isLeads ? userData : [],
              count: userData.length
            });
            currentIndex += maxPerUser;
          }
        });
      } else {
        // Distribute evenly
        const dataPerUser = Math.ceil(dataArray.length / selectedUserIds.length);
        assignments = selectedUserIds.map((userId, index) => {
          const startIndex = index * dataPerUser;
          const endIndex = startIndex + dataPerUser;
          const userData = dataArray.slice(startIndex, endIndex);
          
          return {
            targetUserId: userId,
            leadIds: isLeads ? userData : [],
            followupIds: !isLeads ? userData : [],
            count: userData.length
          };
        });
      }
      
      let payload;
      let res;

      if (dataType === 'followups') {
        // Use follow-up distribute API for follow-ups
        payload = {
          sourceUserId: currentAssignedUserId,
          assignments: assignments,
          reason: reason,
          allowWorkloadOverride: false
        };
        res = await reassignDistributeFollowUps(payload);
      } else {
        // Use existing lead distribute API for leads
        payload = {
          sourceUserId: currentAssignedUserId,
          assignments: assignments,
          reason: reason,
          reassignRelatedPendingFollowUps: true
        };
        res = await reassignDistributeLeads(payload);
      }
      
      if (res?.data?.success || res?.status === 200 || res?.status === 201) {
        setStep('done');
        showToast && showToast(`${dataType === 'leads' ? 'Leads' : 'Follow-ups'} successfully reassigned to selected users!`, 'success');
        onReassign(payload);
      } else {
        setError(res?.data?.message || 'Reassignment failed. Please try again.');
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  // ── render ─────────────────────────────────────────────────
  return (
    <div className="modal-overlay open">
      <div
        className="modal"
        style={{ maxWidth: '640px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            {step === 'selection' && `Reassign ${dataType === 'leads' ? 'Leads' : 'Follow-ups'}`}
            {step === 'single' && 'Single User Select'}
            {step === 'multiple' && 'Multiple User Assign'}
            {step === 'done' && 'Reassignment Complete'}
          </div>
          <CustomButton variant="ghost" className="btn-icon" onClick={handleClose} disabled={loading}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </CustomButton>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>

          {/* ── SELECTION STEP ── */}
          {step === 'selection' && (
            <div>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '20px' }}>
                  {selectedRows.size} {dataType === 'leads' ? 'lead' : 'follow-up'}{selectedRows.size !== 1 ? 's' : ''} selected for reassignment
                </div>
                
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleSingleAssign}
                    disabled={loading}
                    style={{
                      padding: '16px 24px',
                      borderRadius: '12px',
                      border: '2px solid #3b82f6',
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      minWidth: '180px',
                    }}
                    onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#dbeafe')}
                    onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#eff6ff')}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>👤</div>
                    Single User Select
                  </button>
                  
                  <button
                    onClick={handleMultipleAssign}
                    disabled={loading}
                    style={{
                      padding: '16px 24px',
                      borderRadius: '12px',
                      border: '2px solid #8b5cf6',
                      backgroundColor: '#f5f3ff',
                      color: '#6d28d9',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      minWidth: '180px',
                    }}
                    onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#ede9fe')}
                    onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#f5f3ff')}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>👥</div>
                    Multiple User Assign
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── SINGLE ASSIGN STEP ── */}
          {step === 'single' && (
            <div>
              <div style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '16px' }}>
                Assign {selectedRows.size} {dataType === 'leads' ? 'lead' : 'follow-up'}{selectedRows.size !== 1 ? 's' : ''} to a single user:
              </div>

              {/* User dropdown for single selection */}
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: 'var(--gray-700)', marginBottom: '8px', display: 'block' }}>
                  Select User <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  className="form-control"
                  value={singleSelectedUserId}
                  onChange={(e) => setSingleSelectedUserId(e.target.value)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--gray-200)',
                    backgroundColor: '#fff',
                    fontSize: '14px',
                    color: 'var(--gray-800)',
                  }}
                >
                  <option value="">-- Select a user --</option>
                  {usersLoading ? (
                    <option disabled>Loading users...</option>
                  ) : usersError ? (
                    <option disabled>Error loading users</option>
                  ) : users.length === 0 ? (
                    <option disabled>No users available</option>
                  ) : (
                    users.map((user) => {
                      const uid = user.id || user.userId;
                      return (
                        <option key={uid} value={uid}>
                          {user.name}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>

              {/* Reason field */}
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: 'var(--gray-700)', marginBottom: '8px', display: 'block' }}>
                  Reason (Optional)
                </label>
                <textarea
                  className="form-control"
                  placeholder="Enter reason for reassignment..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={loading}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--gray-200)',
                    backgroundColor: '#fff',
                    fontSize: '14px',
                    color: 'var(--gray-800)',
                    resize: 'vertical',
                  }}
                />
              </div>

              {error && <ErrorBox message={error} />}
            </div>
          )}

          {/* ── MULTIPLE ASSIGN STEP ── */}
          {step === 'multiple' && (
            <div>
              {/* Users multi-select */}
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: 'var(--gray-700)', marginBottom: '8px', display: 'block' }}>
                  Select Users <span style={{ color: '#dc2626' }}>*</span>
                  {selectedUserIds.length > 0 && (
                    <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--gray-500)', fontWeight: '400' }}>
                      ({selectedUserIds.length} selected)
                    </span>
                  )}
                </label>
                <div
                  style={{
                    border: '1px solid var(--gray-200)',
                    borderRadius: '8px',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    backgroundColor: '#fff',
                  }}
                >
                  {usersLoading ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--gray-400)', fontSize: '13px' }}>
                      Loading users...
                    </div>
                  ) : usersError ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#dc2626', fontSize: '13px' }}>
                      {usersError}
                    </div>
                  ) : users.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--gray-400)', fontSize: '13px' }}>
                      No other users available
                    </div>
                  ) : (
                    users.map((user) => {
                      const uid = user.id || user.userId;
                      const checked = selectedUserIds.includes(uid);
                      return (
                        <label
                          key={uid}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 14px',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--gray-100)',
                            backgroundColor: checked ? 'var(--primary-50, #eff6ff)' : 'transparent',
                            transition: 'background 0.15s',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleUser(uid)}
                            disabled={loading}
                            style={{ width: '15px', height: '15px', accentColor: 'var(--primary-600, #2563eb)', cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '13px', color: 'var(--gray-800)', fontWeight: checked ? '600' : '400' }}>
                            {user.name}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Max per user */}
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: 'var(--gray-700)', marginBottom: '8px', display: 'block' }}>
                  Maximum Data Per User
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 50  (leave blank for no limit)"
                  value={maximumDataPerUser}
                  onChange={(e) => setMaximumDataPerUser(e.target.value)}
                  disabled={loading}
                  min={1}
                  style={{ maxWidth: '300px' }}
                />
              </div>

              {/* Reason field */}
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: 'var(--gray-700)', marginBottom: '8px', display: 'block' }}>
                  Reason (Optional)
                </label>
                <textarea
                  className="form-control"
                  placeholder="Enter reason for reassignment..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={loading}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--gray-200)',
                    backgroundColor: '#fff',
                    fontSize: '14px',
                    color: 'var(--gray-800)',
                    resize: 'vertical',
                  }}
                />
              </div>

              {error && <ErrorBox message={error} />}
            </div>
          )}

          {/* ── DONE STEP ── */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '6px' }}>
                Reassignment Complete!
              </div>
              <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                {selectedRows.size} {dataType === 'leads' ? 'lead' : 'follow-up'}{selectedRows.size !== 1 ? 's' : ''} successfully reassigned.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {step === 'selection' && (
            <CustomButton variant="secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </CustomButton>
          )}

          {step === 'single' && (
            <>
              <CustomButton variant="secondary" onClick={handleBack} disabled={loading}>
                ← Back
              </CustomButton>
              <CustomButton variant="primary" onClick={handleSingleConfirm} disabled={loading || !singleSelectedUserId}>
                {loading ? 'Assigning...' : 'Confirm Assign'}
              </CustomButton>
            </>
          )}

          {step === 'multiple' && (
            <>
              <CustomButton variant="secondary" onClick={handleBack} disabled={loading}>
                ← Back
              </CustomButton>
              <CustomButton variant="primary" onClick={handleMultipleConfirm} disabled={loading || selectedUserIds.length === 0}>
                {loading ? 'Assigning...' : 'Confirm Assign'}
              </CustomButton>
            </>
          )}

          {step === 'done' && (
            <CustomButton variant="primary" onClick={handleClose}>
              Close
            </CustomButton>
          )}
        </div>
      </div>
    </div>
  );
};

// small helper component
const ErrorBox = ({ message }) => (
  <div
    style={{
      marginTop: '14px',
      padding: '10px 14px',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '6px',
      fontSize: '13px',
      color: '#dc2626',
    }}
  >
    {message}
  </div>
);

export default ReassignModal;
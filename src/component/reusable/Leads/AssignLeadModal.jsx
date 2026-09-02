import React, { useState, useEffect } from 'react';
import CustomButton from '../CustomButton';
import { previewLeadDistribution, distributeLeads } from '../../../Services/lead/leadService';
import { getUsersDropdown } from '../../../Services/drop-down/dropDownService';

/**
 * AssignLeadModal
 *
 * Props:
 *  - isOpen            : bool
 *  - onClose           : fn
 *  - filters           : object — filters already applied on leads page (passed from parent)
 *  - showToast         : fn(message, type) — optional toast notifier
 */
const AssignLeadModal = ({ isOpen, onClose, filters = {}, showToast }) => {
  // ── step: 'form' | 'preview' | 'done'
  const [step, setStep] = useState('form');

  // form fields
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [maximumDataPerUser, setMaximumDataPerUser] = useState('');

  // users list
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');

  // preview result
  const [previewResult, setPreviewResult] = useState(null);

  // loading / error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // fetch all users when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setStep('form');
    setSelectedUserIds([]);
    setMaximumDataPerUser('');
    setPreviewResult(null);
    setError('');

    const fetchUsers = async () => {
      setUsersLoading(true);
      setUsersError('');
      try {
        const res = await getUsersDropdown();
        const list = res?.data || [];
        // Filter out Admin and Super Admin users based on exact username match
        const filteredList = list.filter(
          (user) =>
            user.username?.toLowerCase() !== 'admin' &&
            user.username?.toLowerCase() !== 'superadmin'
        );
        setUsers(filteredList);
      } catch (err) {
        setUsersError('Users load karne mein error aaya.');
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen]);

  // ── helpers ────────────────────────────────────────────────
  const buildPayload = () => {
    const filtersPayload = {};

    if (filters.courseTypeIds?.length > 0) {
      filtersPayload.courseTypeIds = filters.courseTypeIds;
      filtersPayload.courseTypeId = filters.courseTypeIds[0];
    }
    if (filters.courseIds?.length > 0) {
      filtersPayload.courseIds = filters.courseIds;
      filtersPayload.courseId = filters.courseIds[0];
    }
    if (filters.gradeIds?.length > 0) {
      filtersPayload.gradeIds = filters.gradeIds;
      filtersPayload.gradeId = filters.gradeIds[0];
    }
    if (filters.boardIds?.length > 0) {
      filtersPayload.boardIds = filters.boardIds;
      filtersPayload.boardId = filters.boardIds[0];
    }
    if (filters.leadSourceIds?.length > 0) {
      filtersPayload.leadSourceIds = filters.leadSourceIds;
      filtersPayload.leadSourceId = filters.leadSourceIds[0];
    }
    if (filters.leadStatusIds?.length > 0) {
      filtersPayload.leadStatusIds = filters.leadStatusIds;
      filtersPayload.statusId = filters.leadStatusIds[0];
    }
    if (filters.departmentId) filtersPayload.departmentId = filters.departmentId;
    if (filters.createdDateStart) filtersPayload.createdDateStart = filters.createdDateStart;
    if (filters.createdDateEnd) filtersPayload.createdDateEnd = filters.createdDateEnd;

    return {
      filters: filtersPayload,
      userIds: selectedUserIds,
      ...(maximumDataPerUser !== '' && !isNaN(Number(maximumDataPerUser))
        ? { maximumDataPerUser: Number(maximumDataPerUser) }
        : {}),
    };
  };

  const toggleUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ── handlers ───────────────────────────────────────────────
  const handlePreview = async () => {
    setError('');
    if (selectedUserIds.length === 0) {
      setError('Kam se kam ek user select karna zaroori hai.');
      return;
    }
    setLoading(true);
    try {
      const res = await previewLeadDistribution(buildPayload());
      const body = res?.data;
      if (body?.success) {
        setPreviewResult(body.data);
        setStep('preview');
      } else {
        setError(body?.message || 'Preview failed. Please try again.');
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDistribute = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await distributeLeads(buildPayload());
      const body = res?.data;
      if (body?.success || res?.status === 200 || res?.status === 201) {
        setStep('done');
        showToast && showToast('Leads successfully distributed!', 'success');
      } else {
        setError(body?.message || 'Distribution failed. Please try again.');
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('form');
    setPreviewResult(null);
    setError('');
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
            {step === 'form' && 'Distribute Leads'}
            {step === 'preview' && 'Preview Distribution'}
            {step === 'done' && 'Distribution Complete'}
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

          {/* ── FORM STEP ── */}
          {step === 'form' && (
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
                      No users available
                    </div>
                  ) : (
                    users.map((user) => {
                      const uid = user.id || user.userId || user._id;
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
                            {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Max per user */}
              <div className="form-group" style={{ marginBottom: '6px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: 'var(--gray-700)', marginBottom: '6px', display: 'block' }}>
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

              {error && <ErrorBox message={error} />}
            </div>
          )}

          {/* ── PREVIEW STEP ── */}
          {step === 'preview' && previewResult && (
            <div>
              {/* Summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                {[
                  { label: 'Total Matching', value: previewResult.totalMatchingLeads ?? '—', color: '#3b82f6' },
                  { label: 'Total Available', value: previewResult.totalAvailableLeads ?? '—', color: '#10b981' },
                  { label: 'Total Assigned', value: previewResult.totalAssigned ?? '—', color: '#8b5cf6' },
                  { label: 'Max Per User', value: previewResult.requestedMaximumPerUser ?? '—', color: '#f59e0b' },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1px solid ${color}30`,
                      backgroundColor: `${color}10`,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '20px', fontWeight: '700', color }}>{value}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '2px' }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Users table */}
              {previewResult.users?.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                        {["User", "Email", "Today's Follow-ups", "Current Unavailed", "Remaining Capacity", "Assigned", "Status"].map((h) => (
                          <th
                            key={h}
                            style={{ padding: '9px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--gray-700)', whiteSpace: 'nowrap' }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewResult.users.map((u, idx) => (
                        <tr
                          key={u.userId || idx}
                          style={{ borderBottom: '1px solid var(--gray-100)', backgroundColor: idx % 2 === 0 ? '#fff' : 'var(--gray-50)' }}
                        >
                          <td style={{ padding: '9px 12px', fontWeight: '600', color: 'var(--gray-800)' }}>{u.userName || '—'}</td>
                          <td style={{ padding: '9px 12px', color: 'var(--gray-600)' }}>{u.userEmail || '—'}</td>
                          <td style={{ padding: '9px 12px', textAlign: 'center' }}>{u.todayFollowUpCount ?? '—'}</td>
                          <td style={{ padding: '9px 12px', textAlign: 'center' }}>{u.currentUnavailedLeadCount ?? '—'}</td>
                          <td style={{ padding: '9px 12px', textAlign: 'center' }}>{u.remainingCapacity ?? '—'}</td>
                          <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                            <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '12px', backgroundColor: '#dcfce7', color: '#16a34a', fontWeight: '600', fontSize: '12px' }}>
                              {u.assignedCount ?? 0}
                            </span>
                          </td>
                          <td style={{ padding: '9px 12px' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 10px',
                                borderRadius: '12px',
                                backgroundColor: u.status === 'OK' || u.status === 'ok' ? '#dcfce7' : '#fef9c3',
                                color: u.status === 'OK' || u.status === 'ok' ? '#16a34a' : '#ca8a04',
                                fontWeight: '500',
                                fontSize: '12px',
                              }}
                            >
                              {u.status || '—'}
                            </span>
                            {u.reason && (
                              <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '2px' }}>{u.reason}</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--gray-500)', fontSize: '14px' }}>
                  No user data found.
                </div>
              )}

              {error && <ErrorBox message={error} />}
            </div>
          )}

          {/* ── DONE STEP ── */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '6px' }}>
                Leads Distributed Successfully!
              </div>
              <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                Distribution to {selectedUserIds.length} user{selectedUserIds.length > 1 ? 's' : ''} completed.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {step === 'form' && (
            <>
              <CustomButton variant="secondary" onClick={handleClose} disabled={loading}>
                Cancel
              </CustomButton>
              <CustomButton variant="primary" onClick={handlePreview} disabled={loading || selectedUserIds.length === 0}>
                {loading ? 'Loading...' : 'Preview'}
              </CustomButton>
            </>
          )}

          {step === 'preview' && (
            <>
              <CustomButton variant="secondary" onClick={handleBack} disabled={loading}>
                ← Back
              </CustomButton>
              <CustomButton variant="primary" onClick={handleDistribute} disabled={loading}>
                {loading ? 'Distributing...' : 'Distribute Leads'}
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

export default AssignLeadModal;

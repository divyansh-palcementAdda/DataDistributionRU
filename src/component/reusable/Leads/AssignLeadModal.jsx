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
 *  - filters           : object — filters already applied on leads page
 *  - selectedLeadIds   : array — array of UUIDs of specifically selected leads
 *  - leadIds           : array — alias for selectedLeadIds
 *  - currentLead       : object — single lead object (if opened for 1 lead)
 *  - onAssign          : fn — callback on successful distribution/assignment
 *  - showToast         : fn(message, type) — optional toast notifier
 */
const AssignLeadModal = ({
  isOpen,
  onClose,
  filters = {},
  selectedLeadIds = [],
  leadIds = [],
  currentLead = null,
  onAssign,
  showToast,
}) => {
  // ── step: 'form' | 'preview' | 'done'
  const [step, setStep] = useState('form');

  // form fields
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [maximumNumber, setMaximumNumber] = useState('');

  // users list
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');

  // preview result
  const [previewResult, setPreviewResult] = useState(null);

  // loading / error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Effective selected lead IDs
  const effectiveLeadIds = React.useMemo(() => {
    if (selectedLeadIds && selectedLeadIds.length > 0) return selectedLeadIds;
    if (leadIds && leadIds.length > 0) return leadIds;
    if (currentLead?.id) return [currentLead.id];
    if (currentLead?.leadId) return [currentLead.leadId];
    return [];
  }, [selectedLeadIds, leadIds, currentLead]);

  // fetch all users when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setStep('form');
    setSelectedUserIds([]);
    setMaximumNumber('');
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
        setUsersError('Failed to load users list.');
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

    const payload = {
      userIds: selectedUserIds,
      ...(effectiveLeadIds.length > 0 ? { leadIds: effectiveLeadIds } : { filters: filtersPayload }),
      ...(maximumNumber !== '' && !isNaN(Number(maximumNumber))
        ? { maximumNumber: Number(maximumNumber), maximumDataPerUser: Number(maximumNumber) }
        : {}),
    };

    return payload;
  };

  const toggleUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllUsers = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map((u) => u.id || u.userId || u._id));
    }
  };

  // ── handlers ───────────────────────────────────────────────
  const handlePreview = async () => {
    setError('');
    if (selectedUserIds.length === 0) {
      setError('Please select at least one user.');
      return;
    }
    setLoading(true);
    try {
      const res = await previewLeadDistribution(buildPayload());
      const body = res?.data;
      if (body?.success || res?.status === 200) {
        setPreviewResult(body?.data || body);
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
        if (showToast) {
          showToast('Leads successfully distributed!', 'success');
        }
        if (onAssign) {
          onAssign();
        }
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
        style={{ maxWidth: '780px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            {step === 'form' && 'Distribute Leads'}
            {step === 'preview' && 'Preview Distribution Plan'}
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
              {/* Selected leads alert / info */}
              {effectiveLeadIds.length > 0 ? (
                <div
                  style={{
                    padding: '10px 14px',
                    marginBottom: '16px',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#1e40af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>
                    Distributing <strong>{effectiveLeadIds.length}</strong> explicitly selected lead{effectiveLeadIds.length > 1 ? 's' : ''}.
                  </span>
                  <span style={{ fontSize: '11px', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: '10px' }}>
                    Selected Mode
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    padding: '10px 14px',
                    marginBottom: '16px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#475569',
                  }}
                >
                  Distributing all available leads matching current page filters.
                </div>
              )}

              {/* Users multi-select */}
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ fontWeight: '600', color: 'var(--gray-700)', margin: 0 }}>
                    Select Target Counselors / Users <span style={{ color: '#dc2626' }}>*</span>
                    {selectedUserIds.length > 0 && (
                      <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--gray-500)', fontWeight: '400' }}>
                        ({selectedUserIds.length} selected)
                      </span>
                    )}
                  </label>
                  {users.length > 0 && (
                    <button
                      type="button"
                      onClick={selectAllUsers}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary-600, #2563eb)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: '500',
                      }}
                    >
                      {selectedUserIds.length === users.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>

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

              {/* Maximum leads to distribute */}
              <div className="form-group" style={{ marginBottom: '6px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: 'var(--gray-700)', marginBottom: '6px', display: 'block' }}>
                  Maximum Total Leads to Distribute (Optional)
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Leave blank to distribute all selected leads"
                  value={maximumNumber}
                  onChange={(e) => setMaximumNumber(e.target.value)}
                  disabled={loading}
                  min={1}
                  style={{ maxWidth: '320px' }}
                />
              </div>

              {error && <ErrorBox message={error} />}
            </div>
          )}

          {/* ── PREVIEW STEP ── */}
          {step === 'preview' && previewResult && (
            <div>
              {/* Summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '18px' }}>
                {[
                  { label: 'Total Selected', value: previewResult.totalSelectedLeads ?? previewResult.totalMatchingLeads ?? 0, color: '#3b82f6' },
                  { label: 'Distributable', value: previewResult.totalDistributableLeads ?? previewResult.totalAvailableLeads ?? 0, color: '#0ea5e9' },
                  { label: 'Total Assigned', value: previewResult.totalAssigned ?? 0, color: '#10b981' },
                  { label: 'Unassigned', value: previewResult.totalUnassigned ?? 0, color: (previewResult.totalUnassigned > 0 ? '#ef4444' : '#6b7280') },
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

              {/* User Capacities Table */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)', marginBottom: '8px' }}>
                  Counselor Allocation Breakdown
                </h4>
                {previewResult.users?.length > 0 ? (
                  <div style={{ overflowX: 'auto', border: '1px solid var(--gray-200)', borderRadius: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                          {["Counselor", "Today's Follow-ups (Max 30)", "Current RAW (Max 40)", "Workload Capacity", "Assigned Leads", "Status"].map((h) => (
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
                            <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                              <span style={{ fontWeight: '500' }}>{u.todayFollowupsCount ?? u.todayFollowUpCount ?? 0}</span>
                              <span style={{ color: 'var(--gray-400)', fontSize: '11px' }}> / 30</span>
                            </td>
                            <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                              <span style={{ fontWeight: '500' }}>{u.currentRawLeadsCount ?? u.currentUnavailedLeadCount ?? 0}</span>
                              <span style={{ color: 'var(--gray-400)', fontSize: '11px' }}> / 40</span>
                            </td>
                            <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: '600', color: (u.finalCapacity ?? u.remainingCapacity ?? 0) > 0 ? '#059669' : '#dc2626' }}>
                              {u.finalCapacity ?? u.remainingCapacity ?? 0}
                            </td>
                            <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                              <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '12px', backgroundColor: (u.assignedCount > 0 ? '#dcfce7' : '#f3f4f6'), color: (u.assignedCount > 0 ? '#16a34a' : '#6b7280'), fontWeight: '600', fontSize: '12px' }}>
                                +{u.assignedCount ?? 0}
                              </span>
                            </td>
                            <td style={{ padding: '9px 12px' }}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '2px 10px',
                                  borderRadius: '12px',
                                  backgroundColor: u.status === 'ELIGIBLE' || u.status === 'SUCCESS' || u.status === 'OK' ? '#dcfce7' : '#fef2f2',
                                  color: u.status === 'ELIGIBLE' || u.status === 'SUCCESS' || u.status === 'OK' ? '#16a34a' : '#dc2626',
                                  fontWeight: '500',
                                  fontSize: '11px',
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
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gray-500)', fontSize: '13px' }}>
                    No counselor metrics returned.
                  </div>
                )}
              </div>

              {/* Unassigned Leads Warning Section */}
              {previewResult.unassignedLeads && previewResult.unassignedLeads.length > 0 && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fef3c7',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ fontWeight: '600', color: '#92400e', fontSize: '13px', marginBottom: '6px' }}>
                    ⚠️ {previewResult.unassignedLeads.length} Lead{previewResult.unassignedLeads.length > 1 ? 's' : ''} Could Not Be Assigned
                  </div>
                  <div style={{ maxHeight: '100px', overflowY: 'auto', fontSize: '12px', color: '#78350f' }}>
                    {previewResult.unassignedLeads.slice(0, 10).map((un, i) => (
                      <div key={i} style={{ padding: '2px 0' }}>
                        • <strong>{un.leadCode || 'Lead'}</strong>: {un.reason || 'Capacity limit reached'}
                      </div>
                    ))}
                    {previewResult.unassignedLeads.length > 10 && (
                      <div style={{ fontStyle: 'italic', marginTop: '4px' }}>
                        ...and {previewResult.unassignedLeads.length - 10} more.
                      </div>
                    )}
                  </div>
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
                {loading ? 'Evaluating...' : 'Preview Distribution'}
              </CustomButton>
            </>
          )}

          {step === 'preview' && (
            <>
              <CustomButton variant="secondary" onClick={handleBack} disabled={loading}>
                ← Back
              </CustomButton>
              <CustomButton
                variant="primary"
                onClick={handleDistribute}
                disabled={loading || (previewResult?.totalAssigned === 0)}
              >
                {loading ? 'Distributing...' : 'Confirm & Distribute'}
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

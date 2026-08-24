import React, { useState } from 'react';
import { previewLeadDistribution } from '../../../Services/lead/leadService';
import CustomButton from '../CustomButton';

const PreviewDistributionModal = ({ isOpen, onClose, showToast }) => {
  const initialFilters = {
    courseTypeIds: [],
    courseIds: [],
    gradeIds: [],
    boardIds: [],
    leadSourceIds: [],
    leadStatusIds: [],
    departmentId: '',
    createdDateStart: '',
    createdDateEnd: '',
  };

  const [filters, setFilters] = useState(initialFilters);
  const [userIds, setUserIds] = useState('');
  const [maximumDataPerUser, setMaximumDataPerUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Helper: comma-separated string → array of non-empty strings
  const toArray = (str) =>
    str
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const handlePreview = async () => {
    setError('');
    setResult(null);

    const userIdsArray = toArray(userIds);
    if (userIdsArray.length === 0) {
      setError('Kam se kam ek User ID daalna zaroori hai.');
      return;
    }

    // Build payload — only include filter fields that have values
    const filtersPayload = {};

    if (filters.courseTypeIds.length > 0) {
      filtersPayload.courseTypeIds = filters.courseTypeIds;
      filtersPayload.courseTypeId = filters.courseTypeIds[0];
    }
    if (filters.courseIds.length > 0) {
      filtersPayload.courseIds = filters.courseIds;
      filtersPayload.courseId = filters.courseIds[0];
    }
    if (filters.gradeIds.length > 0) {
      filtersPayload.gradeIds = filters.gradeIds;
      filtersPayload.gradeId = filters.gradeIds[0];
    }
    if (filters.boardIds.length > 0) {
      filtersPayload.boardIds = filters.boardIds;
      filtersPayload.boardId = filters.boardIds[0];
    }
    if (filters.leadSourceIds.length > 0) {
      filtersPayload.leadSourceIds = filters.leadSourceIds;
      filtersPayload.leadSourceId = filters.leadSourceIds[0];
    }
    if (filters.leadStatusIds.length > 0) {
      filtersPayload.leadStatusIds = filters.leadStatusIds;
      filtersPayload.statusId = filters.leadStatusIds[0];
    }
    if (filters.departmentId) filtersPayload.departmentId = filters.departmentId;
    if (filters.createdDateStart) filtersPayload.createdDateStart = filters.createdDateStart;
    if (filters.createdDateEnd) filtersPayload.createdDateEnd = filters.createdDateEnd;

    const payload = {
      filters: filtersPayload,
      userIds: userIdsArray,
      ...(maximumDataPerUser !== '' && !isNaN(Number(maximumDataPerUser))
        ? { maximumDataPerUser: Number(maximumDataPerUser) }
        : {}),
    };

    setLoading(true);
    try {
      const res = await previewLeadDistribution(payload);
      const body = res?.data;
      if (body?.success) {
        setResult(body.data);
      } else {
        setError(body?.message || 'Preview failed. Please try again.');
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setUserIds('');
    setMaximumDataPerUser('');
    setResult(null);
    setError('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Update a filter field that stores comma-separated IDs as array
  const handleFilterArrayChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: toArray(value) }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay open">
      <div
        className="modal"
        style={{ maxWidth: '700px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">Preview Lead Distribution</div>
          <CustomButton variant="ghost" className="btn-icon" onClick={handleClose} disabled={loading}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </CustomButton>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>
          {!result ? (
            /* ── Filter Form ── */
            <div>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '16px' }}>
                Filters aur user IDs fill karo phir Preview karo. (IDs comma-separated daalo)
              </p>

              {/* User IDs — required */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: 'var(--gray-700)' }}>
                  User IDs <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. uuid1, uuid2"
                  value={userIds}
                  onChange={(e) => setUserIds(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Max per user */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: 'var(--gray-700)' }}>
                  Maximum Data Per User
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 50"
                  value={maximumDataPerUser}
                  onChange={(e) => setMaximumDataPerUser(e.target.value)}
                  disabled={loading}
                  min={1}
                />
              </div>

              {/* Grid filters */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                {[
                  { label: 'Course Type IDs', field: 'courseTypeIds' },
                  { label: 'Course IDs', field: 'courseIds' },
                  { label: 'Grade IDs', field: 'gradeIds' },
                  { label: 'Board IDs', field: 'boardIds' },
                  { label: 'Lead Source IDs', field: 'leadSourceIds' },
                  { label: 'Lead Status IDs', field: 'leadStatusIds' },
                ].map(({ label, field }) => (
                  <div className="form-group" key={field} style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '12px' }}>
                      {label}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="uuid1, uuid2..."
                      value={filters[field].join(', ')}
                      onChange={(e) => handleFilterArrayChange(field, e.target.value)}
                      disabled={loading}
                      style={{ fontSize: '12px' }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '12px' }}>
                    Department ID
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="uuid..."
                    value={filters.departmentId}
                    onChange={(e) => setFilters((p) => ({ ...p, departmentId: e.target.value.trim() }))}
                    disabled={loading}
                    style={{ fontSize: '12px' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '12px' }}>
                    Created Date Start
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.createdDateStart}
                    onChange={(e) => setFilters((p) => ({ ...p, createdDateStart: e.target.value }))}
                    disabled={loading}
                    style={{ fontSize: '12px' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '12px' }}>
                    Created Date End
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.createdDateEnd}
                    onChange={(e) => setFilters((p) => ({ ...p, createdDateEnd: e.target.value }))}
                    disabled={loading}
                    style={{ fontSize: '12px' }}
                  />
                </div>
              </div>

              {error && (
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
                  {error}
                </div>
              )}
            </div>
          ) : (
            /* ── Result View ── */
            <div>
              {/* Summary Stats */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                {[
                  { label: 'Total Matching', value: result.totalMatchingLeads ?? '—', color: '#3b82f6' },
                  { label: 'Total Available', value: result.totalAvailableLeads ?? '—', color: '#10b981' },
                  { label: 'Total Assigned', value: result.totalAssigned ?? '—', color: '#8b5cf6' },
                  { label: 'Max Per User', value: result.requestedMaximumPerUser ?? '—', color: '#f59e0b' },
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

              {/* Users Table */}
              {result.users && result.users.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                        {[
                          'User',
                          'Email',
                          "Today's Follow-ups",
                          'Current Unavailed',
                          'Remaining Capacity',
                          'Assigned',
                          'Status',
                        ].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: '10px 12px',
                              textAlign: 'left',
                              fontWeight: '600',
                              color: 'var(--gray-700)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.users.map((u, idx) => (
                        <tr
                          key={u.userId || idx}
                          style={{
                            borderBottom: '1px solid var(--gray-100)',
                            backgroundColor: idx % 2 === 0 ? '#fff' : 'var(--gray-50)',
                          }}
                        >
                          <td style={{ padding: '10px 12px', fontWeight: '600', color: 'var(--gray-800)' }}>
                            {u.userName || '—'}
                          </td>
                          <td style={{ padding: '10px 12px', color: 'var(--gray-600)' }}>{u.userEmail || '—'}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>{u.todayFollowUpCount ?? '—'}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>{u.currentUnavailedLeadCount ?? '—'}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>{u.remainingCapacity ?? '—'}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 10px',
                                borderRadius: '12px',
                                backgroundColor: '#dcfce7',
                                color: '#16a34a',
                                fontWeight: '600',
                                fontSize: '12px',
                              }}
                            >
                              {u.assignedCount ?? 0}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
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
                              <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '2px' }}>
                                {u.reason}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--gray-500)', fontSize: '14px' }}>
                  Koi user data nahi mila.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {result ? (
            <>
              <CustomButton variant="secondary" onClick={handleReset} disabled={loading}>
                ← Wapas jaao
              </CustomButton>
              <CustomButton variant="ghost" onClick={handleClose}>
                Close
              </CustomButton>
            </>
          ) : (
            <>
              <CustomButton variant="secondary" onClick={handleClose} disabled={loading}>
                Cancel
              </CustomButton>
              <CustomButton variant="primary" onClick={handlePreview} disabled={loading}>
                {loading ? 'Loading...' : 'Preview'}
              </CustomButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewDistributionModal;

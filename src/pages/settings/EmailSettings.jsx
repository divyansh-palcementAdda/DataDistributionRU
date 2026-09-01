import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../../AppContext';
import { usePermissions } from '../../PermissionContext';
import { getEmailConfigStatus, sendTestEmail, getEmailLogs, sendCustomEmail } from '../../Services/email/emailService';
import ReusableTable from '../../component/reusable/table';

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return dateStr;
  }
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'SENT':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'FAILED':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'SKIPPED':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'PENDING':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getTypeBadge = (type) => {
  const typeMap = {
    FOLLOWUP_SCHEDULED: { label: 'Follow-up Scheduled', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    FOLLOWUP_RESCHEDULED: { label: 'Follow-up Rescheduled', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    FOLLOWUP_COMPLETED: { label: 'Follow-up Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    FOLLOWUP_CANCELLED: { label: 'Follow-up Cancelled', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    DAILY_FOLLOWUP_REMINDER: { label: 'Daily Reminder (09:30 AM)', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    DATA_ALLOCATED: { label: 'Lead Allocation', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    DATA_REASSIGNED: { label: 'Lead Reassignment', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    TEST_EMAIL: { label: 'SMTP Test', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    CUSTOM_EMAIL: { label: 'Custom Notice', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  };

  const info = typeMap[type] || { label: type || 'Unknown', color: 'bg-gray-50 text-gray-700 border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${info.color}`}>
      {info.label}
    </span>
  );
};

const EmailSettings = () => {
  const { showToast } = useAppContext();
  const { hasPermission } = usePermissions();

  const canViewConfig = hasPermission('EMAIL_CONFIG_VIEW') || hasPermission('SETTINGS_PROJECT_CONFIGURATION') || true;
  const canTestEmail = hasPermission('EMAIL_CONFIG_TEST') || hasPermission('EMAIL_SEND') || true;
  const canViewLogs = hasPermission('EMAIL_LOG_VIEW') || hasPermission('SETTINGS_NOTIFICATIONS') || true;
  const canSendCustom = hasPermission('EMAIL_SEND');

  // Config State
  const [config, setConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(false);

  // Test Email State
  const [testEmail, setTestEmail] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  // Custom Email Modal State
  const [isCustomEmailModalOpen, setIsCustomEmailModalOpen] = useState(false);
  const [customEmailForm, setCustomEmailForm] = useState({
    recipientEmail: '',
    recipientName: '',
    subject: '',
    messageBody: '',
    ctaUrl: '',
    ctaText: '',
  });
  const [customEmailLoading, setCustomEmailLoading] = useState(false);

  // Logs Table State
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('DESC');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const debounceRef = useRef(null);

  // Fetch Config
  const fetchConfig = useCallback(async () => {
    if (!canViewConfig) return;
    setConfigLoading(true);
    try {
      const res = await getEmailConfigStatus();
      if (res?.success && res?.data) {
        setConfig(res.data);
      }
    } catch (err) {
      console.error('Failed to load email config status:', err);
    } finally {
      setConfigLoading(false);
    }
  }, [canViewConfig]);

  // Fetch Logs
  const fetchLogs = useCallback(async () => {
    if (!canViewLogs) return;
    setLogsLoading(true);
    try {
      const res = await getEmailLogs({
        page,
        size,
        sortBy,
        sortDirection,
        search,
        status: statusFilter === 'ALL' ? '' : statusFilter,
        emailType: typeFilter === 'ALL' ? '' : typeFilter,
      });

      const payload = res?.data || res;
      const content = Array.isArray(payload?.content) ? payload.content : Array.isArray(payload) ? payload : [];
      setLogs(content);
      setTotalElements(payload?.totalElements || content.length || 0);
      setTotalPages(payload?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load email logs:', err);
      showToast('Unable to load email notification logs', 'error');
    } finally {
      setLogsLoading(false);
    }
  }, [canViewLogs, page, size, sortBy, sortDirection, search, statusFilter, typeFilter, showToast]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Handle Search Debounce
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(val);
      setPage(0);
    }, 350);
  };

  // Handle Test Email
  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!testEmail || !emailRegex.test(testEmail.trim())) {
      showToast('Please enter a valid recipient email address', 'warning');
      return;
    }

    setTestLoading(true);
    try {
      const res = await sendTestEmail({ recipientEmail: testEmail.trim() });
      if (res?.success) {
        showToast(`Test email dispatched successfully to ${testEmail.trim()}`, 'success');
        setTestEmail('');
        fetchLogs();
      } else {
        showToast(res?.message || 'Unable to send test email. Please check server configuration.', 'error');
      }
    } catch (err) {
      const errMsg = err?.message || 'Failed to send test email. Please check SMTP connectivity.';
      showToast(errMsg, 'error');
    } finally {
      setTestLoading(false);
    }
  };

  // Handle Custom Email Send
  const handleSendCustomEmail = async (e) => {
    e.preventDefault();
    if (!customEmailForm.recipientEmail || !customEmailForm.subject || !customEmailForm.messageBody) {
      showToast('Please fill in recipient email, subject, and message body', 'warning');
      return;
    }

    setCustomEmailLoading(true);
    try {
      const res = await sendCustomEmail(customEmailForm);
      if (res?.success) {
        showToast('Email sent successfully!', 'success');
        setIsCustomEmailModalOpen(false);
        setCustomEmailForm({
          recipientEmail: '',
          recipientName: '',
          subject: '',
          messageBody: '',
          ctaUrl: '',
          ctaText: '',
        });
        fetchLogs();
      } else {
        showToast(res?.message || 'Failed to send email', 'error');
      }
    } catch (err) {
      showToast(err?.message || 'Error sending email', 'error');
    } finally {
      setCustomEmailLoading(false);
    }
  };

  const columns = [
    {
      key: 'sno',
      sortable: false,
      header: 'S.No',
      render: (_, __, index) => index + 1 + page * size,
    },
    {
      key: 'createdAt',
      header: 'Dispatched At',
      render: (val) => <span className="text-xs text-gray-700 font-medium">{formatDateTime(val)}</span>,
    },
    {
      key: 'emailType',
      header: 'Notification Type',
      render: (val) => getTypeBadge(val),
    },
    {
      key: 'recipientEmail',
      header: 'Recipient',
      render: (val, row) => (
        <div>
          <div className="text-xs font-semibold text-gray-900">{val || '-'}</div>
          {row?.recipientName && <div className="text-[11px] text-gray-500">{row.recipientName}</div>}
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      render: (val) => <div className="text-xs text-gray-800 font-medium truncate max-w-[280px]" title={val}>{val || '-'}</div>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (val, row) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadgeClass(val)}`}>
          {val || 'UNKNOWN'}
          {row?.retryCount > 0 && <span className="ml-1 text-[10px] opacity-75">({row.retryCount} retries)</span>}
        </span>
      ),
    },
    {
      key: 'actions',
      sortable: false,
      header: 'Details',
      render: (_, row) => (
        <button
          className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition-colors"
          onClick={() => setSelectedLog(row)}
        >
          View Log
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn" id="page-email-settings">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Email Notification Management</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor SMTP connectivity, verify email delivery, send diagnostic emails, and inspect post-commit notification audit logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canSendCustom && (
            <button
              onClick={() => setIsCustomEmailModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Compose Email
            </button>
          )}
          <button
            onClick={() => {
              fetchConfig();
              fetchLogs();
              showToast('Refreshed email logs & status', 'info');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Grid: Configuration Status & Diagnostic Test Email */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Status Card */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">SMTP Service Configuration</h3>
                <p className="text-[11px] text-gray-500">Secure server parameters managed via backend environment</p>
              </div>
            </div>
            {config && (
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  config.mailEnabled ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.mailEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                {config.mailEnabled ? 'Active' : 'Disabled'}
              </span>
            )}
          </div>

          {configLoading ? (
            <div className="text-center py-6 text-xs text-gray-400">Loading service configuration...</div>
          ) : config ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">SMTP Host</div>
                <div className="font-semibold text-gray-800 truncate" title={config.host}>{config.host || 'smtp.gmail.com'}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Port</div>
                <div className="font-semibold text-gray-800">{config.port || 587}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Sender Email</div>
                <div className="font-semibold text-gray-800 truncate" title={config.fromEmail}>{config.fromEmail || '-'}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Sender Name</div>
                <div className="font-semibold text-gray-800 truncate" title={config.fromName}>{config.fromName || 'Renaissance University CRM'}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Async Dispatch</div>
                <div className="font-semibold text-gray-800">{config.asyncDispatch ? 'Enabled (Thread Pool)' : 'Synchronous'}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Daily Reminder</div>
                <div className="font-semibold text-blue-600">09:30 AM IST Daily</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Max Retries</div>
                <div className="font-semibold text-gray-800">{config.maxRetries ?? 3} Attempts</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Transaction Safety</div>
                <div className="font-semibold text-emerald-600">After-Commit Safe</div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-500 py-2">Configuration status unavailable.</div>
          )}
        </div>

        {/* Send Test Email Card */}
        {canTestEmail && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2 11 13" />
                  <path d="m22 2-7 20-4-9-9-4 20-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Send Test Email</h3>
                <p className="text-[11px] text-gray-500">Test SMTP credentials & delivery</p>
              </div>
            </div>

            <form onSubmit={handleSendTestEmail} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Recipient Email Address</label>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  disabled={testLoading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={testLoading || !testEmail}
                className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                {testLoading ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Sending Test Email...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    Send Diagnostic Test
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Email Delivery Audit Logs Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Email Notification Delivery Audit Logs</h3>
            <p className="text-xs text-gray-500">Real-time audit history of all dispatched CRM notification events</p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search recipient or subject..."
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-56"
              value={searchInput}
              onChange={handleSearchChange}
            />

            <select
              className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="ALL">All Types</option>
              <option value="FOLLOWUP_SCHEDULED">Follow-up Scheduled</option>
              <option value="FOLLOWUP_RESCHEDULED">Follow-up Rescheduled</option>
              <option value="FOLLOWUP_COMPLETED">Follow-up Completed</option>
              <option value="FOLLOWUP_CANCELLED">Follow-up Cancelled</option>
              <option value="DAILY_FOLLOWUP_REMINDER">Daily Reminder</option>
              <option value="DATA_ALLOCATED">Data Allocated</option>
              <option value="DATA_REASSIGNED">Data Reassigned</option>
              <option value="TEST_EMAIL">SMTP Test</option>
              <option value="CUSTOM_EMAIL">Custom Notice</option>
            </select>

            <select
              className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="SENT">SENT</option>
              <option value="FAILED">FAILED</option>
              <option value="SKIPPED">SKIPPED</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>
        </div>

        {logsLoading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-gray-500 text-xs">
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Loading email logs...
          </div>
        ) : (
          <ReusableTable
            columns={columns}
            data={logs}
            emptyMessage="No email notification logs found matching current filters."
            isServerSide={true}
            totalElements={totalElements}
            totalPages={totalPages}
            currentPage={page + 1}
            rowsPerPage={size}
            onPageChange={(newPage) => setPage(newPage - 1)}
            onRowsPerPageChange={(newSize) => {
              setSize(newSize);
              setPage(0);
            }}
            sortBy={sortBy}
            sortDirection={sortDirection.toLowerCase()}
            onSort={(col, dir) => {
              setSortBy(col);
              setSortDirection(dir.toUpperCase());
              setPage(0);
            }}
          />
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden animate-scaleIn">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-gray-900">Email Delivery Audit Details</h4>
                {getTypeBadge(selectedLog.emailType)}
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600 text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Status</span>
                <span className={`px-2 py-0.5 rounded-full font-bold border ${getStatusBadgeClass(selectedLog.status)}`}>
                  {selectedLog.status}
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Recipient</span>
                <span className="font-semibold text-gray-900">{selectedLog.recipientEmail}</span>
              </div>

              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Subject</span>
                <span className="font-semibold text-gray-900 text-right max-w-[280px]">{selectedLog.subject}</span>
              </div>

              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Timestamp</span>
                <span className="text-gray-800">{formatDateTime(selectedLog.createdAt)}</span>
              </div>

              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Delivery Attempts</span>
                <span className="font-semibold text-gray-800">{selectedLog.retryCount ?? 1}</span>
              </div>

              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Idempotency Key</span>
                <span className="font-mono text-[10px] text-gray-600 truncate max-w-[240px]" title={selectedLog.idempotencyKey}>
                  {selectedLog.idempotencyKey || '-'}
                </span>
              </div>

              {selectedLog.errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 mt-2">
                  <div className="font-bold text-[11px] uppercase tracking-wider mb-1">Failure Reason</div>
                  <p className="font-mono text-[11px] whitespace-pre-wrap">{selectedLog.errorMessage}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compose Custom Email Modal */}
      {isCustomEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden animate-scaleIn">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <h4 className="text-sm font-bold text-gray-900">Compose Branded Email Notice</h4>
              <button
                onClick={() => setIsCustomEmailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendCustomEmail} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Recipient Email *</label>
                <input
                  type="email"
                  placeholder="recipient@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                  value={customEmailForm.recipientEmail}
                  onChange={(e) => setCustomEmailForm({ ...customEmailForm, recipientEmail: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Recipient Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                  value={customEmailForm.recipientName}
                  onChange={(e) => setCustomEmailForm({ ...customEmailForm, recipientName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  placeholder="Important CRM Notification"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                  value={customEmailForm.subject}
                  onChange={(e) => setCustomEmailForm({ ...customEmailForm, subject: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Message Body *</label>
                <textarea
                  rows="4"
                  placeholder="Type your message here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                  value={customEmailForm.messageBody}
                  onChange={(e) => setCustomEmailForm({ ...customEmailForm, messageBody: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Action Button Text</label>
                  <input
                    type="text"
                    placeholder="View Lead"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                    value={customEmailForm.ctaText}
                    onChange={(e) => setCustomEmailForm({ ...customEmailForm, ctaText: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Action Button URL</label>
                  <input
                    type="text"
                    placeholder="https://dds.areyoureporting.com/leads"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                    value={customEmailForm.ctaUrl}
                    onChange={(e) => setCustomEmailForm({ ...customEmailForm, ctaUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="p-3 border-t border-gray-100 flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCustomEmailModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={customEmailLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  {customEmailLoading ? 'Sending...' : 'Send Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailSettings;

import React, { useState, useEffect } from "react";
import { notificationService } from "../../Services/notifications";
import { getAllUser } from "../../Services/user/user";
import { useAppContext } from "../../AppContext";
import { usePermissions } from "../../PermissionContext";

const Notifications = () => {
  const { showToast } = useAppContext();
  const { hasPermission } = usePermissions();

  const canManageNotifications = hasPermission("SETTINGS_NOTIFICATIONS") || hasPermission("ROLE_ADMIN") || hasPermission("ADMIN");

  // Tabs
  const [activeTab, setActiveTab] = useState("preferences"); // "preferences" or "admin-broadcast"

  // User preferences state
  const [preferences, setPreferences] = useState({
    followUpRemindersEnabled: true,
    leadAllocationEnabled: true,
    leadReassignmentEnabled: true,
    taskAssignmentEnabled: true,
    emailNotificationsEnabled: true,
    browserNotificationsEnabled: true,
  });
  const [prefLoading, setPrefLoading] = useState(true);
  const [prefSaving, setPrefSaving] = useState(false);

  // Admin Broadcast form state
  const [usersList, setUsersList] = useState([]);
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "ADMIN_ANNOUNCEMENT",
    priority: "NORMAL",
    targetType: "ALL", // "ALL", "ROLE", "USER", "SELECTED_USERS"
    userIds: [],
    roleName: "COUNSELOR",
    navigationUrl: "",
  });
  const [sending, setSending] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Load user notification preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const data = await notificationService.getNotificationPreferences();
        if (data) {
          setPreferences({
            followUpRemindersEnabled: data.followUpRemindersEnabled ?? true,
            leadAllocationEnabled: data.leadAllocationEnabled ?? true,
            leadReassignmentEnabled: data.leadReassignmentEnabled ?? true,
            taskAssignmentEnabled: data.taskAssignmentEnabled ?? true,
            emailNotificationsEnabled: data.emailNotificationsEnabled ?? true,
            browserNotificationsEnabled: data.browserNotificationsEnabled ?? true,
          });
        }
      } catch (err) {
        console.error("Failed to load notification preferences:", err);
      } finally {
        setPrefLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Load users list for admin targeting
  useEffect(() => {
    if (canManageNotifications) {
      getAllUser({ page: 0, size: 200 })
        .then((res) => {
          const list = res.data?.data?.content || [];
          setUsersList(list);
        })
        .catch((err) => console.error("Failed to fetch users list for notification targeting:", err));
    }
  }, [canManageNotifications]);

  const handleSavePreferences = async () => {
    setPrefSaving(true);
    try {
      await notificationService.updateNotificationPreferences(preferences);
      showToast("Notification preferences updated successfully", "success");
    } catch (err) {
      console.error("Failed to save preferences:", err);
      showToast("Failed to save preferences", "error");
    } finally {
      setPrefSaving(false);
    }
  };

  const handleSendTest = async () => {
    setTesting(true);
    try {
      await notificationService.sendTestNotification();
      showToast("Test notification sent! Check your notification bell and dropdown.", "success");
    } catch (err) {
      console.error("Failed to send test notification:", err);
      showToast("Failed to dispatch test notification", "error");
    } finally {
      setTesting(false);
    }
  };

  const handleAdminSend = async () => {
    if (!form.title.trim()) {
      showToast("Please enter a notification title", "error");
      return;
    }
    if (!form.message.trim()) {
      showToast("Please enter a notification message", "error");
      return;
    }
    if (form.targetType === "USER" && form.userIds.length === 0) {
      showToast("Please select at least one recipient user", "error");
      return;
    }

    setShowConfirmModal(false);
    setSending(true);

    try {
      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        priority: form.priority,
        targetType: form.targetType,
        userIds: form.userIds,
        roleName: form.roleName,
        navigationUrl: form.navigationUrl.trim() || null,
      };

      const result = await notificationService.sendAdminNotification(payload);
      showToast(result?.statusMessage || "Notifications dispatched successfully", "success");

      // Reset form
      setForm({
        title: "",
        message: "",
        type: "ADMIN_ANNOUNCEMENT",
        priority: "NORMAL",
        targetType: "ALL",
        userIds: [],
        roleName: "COUNSELOR",
        navigationUrl: "",
      });
    } catch (err) {
      console.error("Admin notification dispatch failed:", err);
      showToast("Failed to dispatch notifications", "error");
    } finally {
      setSending(false);
    }
  };

  const calculateTargetCount = () => {
    if (form.targetType === "ALL") return "All Active Users";
    if (form.targetType === "ROLE") return `All users with role ${form.roleName}`;
    if (form.targetType === "USER" || form.targetType === "SELECTED_USERS") {
      return `${form.userIds.length} Selected User(s)`;
    }
    return "Unknown";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm animate-fadeIn">
      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("preferences")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "preferences"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:text-gray-900"
            }`}
          >
            My Preferences
          </button>

          {canManageNotifications && (
            <button
              type="button"
              onClick={() => setActiveTab("admin-broadcast")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === "admin-broadcast"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            >
              Admin Notification Broadcast
            </button>
          )}
        </div>

        {canManageNotifications && (
          <button
            type="button"
            disabled={testing}
            onClick={handleSendTest}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {testing ? "Sending..." : "Send Test Notification"}
          </button>
        )}
      </div>

      {/* TAB 1: User Notification Preferences */}
      {activeTab === "preferences" && (
        <div>
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-800">In-App & Alert Preferences</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Customize which notifications and reminders you receive. System and security alerts are always delivered.
            </p>
          </div>

          {prefLoading ? (
            <div className="space-y-4 py-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse flex items-center justify-between py-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded-full w-9" />
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <div className="flex items-center justify-between py-3.5">
                <div>
                  <span className="text-xs text-gray-800 font-semibold block">Follow-up Due Reminders</span>
                  <span className="text-[11px] text-gray-500 block">
                    Receive automated notifications 5 minutes and 2 minutes before scheduled follow-ups
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.followUpRemindersEnabled}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, followUpRemindersEnabled: e.target.checked }))
                    }
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3.5">
                <div>
                  <span className="text-xs text-gray-800 font-semibold block">New Lead Allocation</span>
                  <span className="text-[11px] text-gray-500 block">
                    Instant alerts when new leads are allotted to your account
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.leadAllocationEnabled}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, leadAllocationEnabled: e.target.checked }))
                    }
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3.5">
                <div>
                  <span className="text-xs text-gray-800 font-semibold block">Lead Reassignment</span>
                  <span className="text-[11px] text-gray-500 block">
                    Notifications when leads are transferred to or from other counselors
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.leadReassignmentEnabled}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, leadReassignmentEnabled: e.target.checked }))
                    }
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3.5">
                <div>
                  <span className="text-xs text-gray-800 font-semibold block">Email Notifications</span>
                  <span className="text-[11px] text-gray-500 block">
                    Receive daily follow-up digest and important allocation emails
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.emailNotificationsEnabled}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, emailNotificationsEnabled: e.target.checked }))
                    }
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3.5">
                <div>
                  <span className="text-xs text-gray-800 font-semibold block">In-App Popups & Toasts</span>
                  <span className="text-[11px] text-gray-500 block">
                    Display toast banner when a new notification arrives while working
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.browserNotificationsEnabled}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, browserNotificationsEnabled: e.target.checked }))
                    }
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              disabled={prefSaving || prefLoading}
              onClick={handleSavePreferences}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 shadow-sm"
            >
              {prefSaving ? "Saving Preferences..." : "Save Preferences"}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Admin Broadcast & Manual Notification Dispatch */}
      {activeTab === "admin-broadcast" && canManageNotifications && (
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Manual Notification Broadcast</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Send announcements, system notices, or urgent reminders to specific users, entire roles, or all team members.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Column */}
            <div className="space-y-4">
              {/* Target Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Target Recipients</label>
                <select
                  value={form.targetType}
                  onChange={(e) => setForm((f) => ({ ...f, targetType: e.target.value }))}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="ALL">All Active Users</option>
                  <option value="ROLE">By Role (Counselors, HOD, etc.)</option>
                  <option value="USER">Specific User(s)</option>
                </select>
              </div>

              {/* Role selector if target is ROLE */}
              {form.targetType === "ROLE" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Select Role</label>
                  <select
                    value={form.roleName}
                    onChange={(e) => setForm((f) => ({ ...f, roleName: e.target.value }))}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="COUNSELOR">Counselors</option>
                    <option value="HOD">Head of Department (HOD)</option>
                    <option value="ADMIN">Admins</option>
                    <option value="SUPER_ADMIN">Super Admins</option>
                  </select>
                </div>
              )}

              {/* User selector if target is USER */}
              {form.targetType === "USER" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Select Specific Users</label>
                  <select
                    multiple
                    size={4}
                    value={form.userIds}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                      setForm((f) => ({ ...f, userIds: selected }));
                    }}
                    className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.email || u.username})
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Hold Ctrl (or Cmd) to select multiple users
                  </span>
                </div>
              )}

              {/* Notification Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notification Title</label>
                <input
                  type="text"
                  placeholder="e.g. System Maintenance or Admissions Drive 2027"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notification Message */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notification Message</label>
                <textarea
                  rows={3}
                  placeholder="Enter details for the notification..."
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Type & Priority Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="ADMIN_ANNOUNCEMENT">Announcement</option>
                    <option value="SYSTEM">System Alert</option>
                    <option value="FOLLOW_UP_REMINDER">Follow-up Reminder</option>
                    <option value="NEW_LEAD_ASSIGNED">Lead Assigned</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Optional Navigation URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Optional Navigation URL / Path
                </label>
                <input
                  type="text"
                  placeholder="e.g. /leads or /followups"
                  value={form.navigationUrl}
                  onChange={(e) => setForm((f) => ({ ...f, navigationUrl: e.target.value }))}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Preview Card Column */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Live Preview (How Recipients See It)</label>
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 shadow-inner">
                <div className="bg-white border border-gray-200 rounded-lg p-3.5 shadow-sm flex items-start gap-3">
                  <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-purple-100 text-purple-600 shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 01-3.46 0" />
                    </svg>
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        {form.title || "Notification Title Preview"}
                      </h4>
                      <span className="text-[10px] text-gray-400">Just now</span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed mb-2">
                      {form.message || "This is how the notification message will appear to recipients in real time."}
                    </p>

                    <div className="flex items-center justify-between">
                      {form.navigationUrl && (
                        <span className="text-[11px] font-semibold text-blue-600">
                          Target link: {form.navigationUrl}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          form.priority === "URGENT"
                            ? "bg-red-100 text-red-700"
                            : form.priority === "HIGH"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {form.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
                  <span className="font-semibold block mb-0.5">Target Summary:</span>
                  <span>{calculateTargetCount()}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  disabled={sending || !form.title || !form.message}
                  onClick={() => setShowConfirmModal(true)}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 shadow-sm"
                >
                  {sending ? "Dispatching..." : "Review & Dispatch"}
                </button>
              </div>
            </div>
          </div>

          {/* Confirmation Modal */}
          {showConfirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
              <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
                <h3 className="text-base font-bold text-gray-900 mb-2">Confirm Notification Dispatch</h3>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                  Are you sure you want to send this notification to <strong>{calculateTargetCount()}</strong>?
                  This action will persist the notifications and deliver them immediately in real-time.
                </p>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs mb-5">
                  <div className="font-semibold text-gray-800">{form.title}</div>
                  <div className="text-gray-500 mt-1 line-clamp-2">{form.message}</div>
                </div>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={sending}
                    onClick={handleAdminSend}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 shadow-sm"
                  >
                    {sending ? "Sending..." : "Confirm & Send"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;

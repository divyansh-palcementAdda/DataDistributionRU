import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "../Services/notifications";
import { useNotifications } from "../context/NotificationContext";
import { useAppContext } from "../AppContext";

const Notifications = () => {
  const navigate = useNavigate();
  const {
    markAsRead: contextMarkAsRead,
    markAllAsRead: contextMarkAllAsRead,
    deleteNotification: contextDeleteNotification,
    refresh: refreshContext,
    lastEventTimestamp,
  } = useNotifications();
  const { showToast } = useAppContext();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState("all"); // "all", "unread", "read"
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12;

  const fetchNotifications = useCallback(
    async (page = 0) => {
      setLoading(true);
      try {
        const unreadOnly = filterTab === "unread";
        const data = await notificationService.getUserNotifications({
          page,
          size: pageSize,
          unreadOnly,
        });

        if (data) {
          let items = data.content || [];
          if (filterTab === "read") {
            items = items.filter((n) => n.read);
          }
          setNotifications(items);
          setCurrentPage(data.page || 0);
          setTotalPages(data.totalPages || 1);
          setTotalElements(data.totalElements || 0);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        showToast("Failed to load notifications", "error");
      } finally {
        setLoading(false);
      }
    },
    [filterTab, showToast]
  );

  // Initial fetch and when filter changes
  useEffect(() => {
    fetchNotifications(0);
  }, [fetchNotifications]);

  // Real-time synchronization: when a new notification arrives via SSE or polling, refresh inbox page 0
  useEffect(() => {
    if (currentPage === 0) {
      fetchNotifications(0);
    }
  }, [lastEventTimestamp]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      // Update local inbox state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      // Synchronize with global NotificationContext (updates header bell count & dropdown)
      await contextMarkAsRead(id);
      showToast("Marked as read", "success");
    } catch (err) {
      console.error("Failed to mark as read:", err);
      showToast("Error updating notification", "error");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      // Synchronize with global NotificationContext
      await contextMarkAllAsRead();
      showToast("All notifications marked as read", "success");
      fetchNotifications(currentPage);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      showToast("Error updating notifications", "error");
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    try {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      // Synchronize with global NotificationContext
      if (contextDeleteNotification) {
        await contextDeleteNotification(id);
      } else {
        await notificationService.deleteNotification(id);
        refreshContext();
      }
      showToast("Notification deleted", "success");
    } catch (err) {
      console.error("Failed to delete notification:", err);
      showToast("Error deleting notification", "error");
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.read) {
      handleMarkAsRead(notif.id);
    }
    if (notif.navigationUrl) {
      navigate(notif.navigationUrl);
    }
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr.replace(" ", "T"));
      const now = new Date();
      const diffSec = Math.floor((now - date) / 1000);

      if (diffSec < 60) return "Just now";
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour}h ago`;
      const diffDays = Math.floor(diffHour / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "FOLLOW_UP_REMINDER":
        return (
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100 text-amber-600 shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
        );
      case "NEW_LEAD_ASSIGNED":
        return (
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </span>
        );
      case "LEAD_REASSIGNED":
        return (
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 text-blue-600 shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 1l4 4-4 4" />
              <path d="M3 11V9a4 4 0 014-4h14" />
              <path d="M7 23l-4-4 4-4" />
              <path d="M21 13v2a4 4 0 01-4 4H3" />
            </svg>
          </span>
        );
      case "ADMIN_ANNOUNCEMENT":
        return (
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-100 text-purple-600 shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </span>
        );
      case "TEST":
        return (
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </span>
        );
      default:
        return (
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 text-gray-600 shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </span>
        );
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (typeFilter !== "ALL" && n.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title?.toLowerCase().includes(q);
      const matchMsg = n.message?.toLowerCase().includes(q);
      if (!matchTitle && !matchMsg) return false;
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notification Inbox</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Stay up to date with follow-up reminders, lead allocations, and team announcements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Mark all read
          </button>

          <button
            type="button"
            onClick={() => {
              fetchNotifications(currentPage);
              refreshContext();
            }}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Control Bar: Tabs + Search + Type Filter */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 mb-6 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
              filterTab === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("unread")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
              filterTab === "unread" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Unread
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("read")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
              filterTab === "read" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Read
          </button>
        </div>

        {/* Search & Type dropdown */}
        <div className="flex items-center gap-2 flex-1 md:max-w-md justify-end">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs px-3 py-2 pl-8 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs px-2.5 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="FOLLOW_UP_REMINDER">Follow-up</option>
            <option value="NEW_LEAD_ASSIGNED">Lead Assigned</option>
            <option value="LEAD_REASSIGNED">Lead Reassigned</option>
            <option value="ADMIN_ANNOUNCEMENT">Announcement</option>
            <option value="TEST">Test</option>
            <option value="SYSTEM">System</option>
          </select>
        </div>
      </div>

      {/* Notifications List Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-start gap-4 p-3">
                <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="h-2.5 bg-gray-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-800">No notifications found</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              {filterTab === "unread"
                ? "You have caught up with all unread notifications!"
                : "No notifications match your current filter criteria."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 flex items-start gap-4 transition cursor-pointer hover:bg-gray-50/80 ${
                  !notif.read ? "bg-blue-50/30" : ""
                }`}
              >
                {getNotificationIcon(notif.type)}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm ${
                          !notif.read ? "font-bold text-gray-900" : "font-medium text-gray-800"
                        }`}
                      >
                        {notif.title}
                      </h4>

                      {notif.priority === "URGENT" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          Urgent
                        </span>
                      )}
                      {notif.priority === "HIGH" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          High
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-gray-400 shrink-0 font-medium">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-2">
                    {notif.message}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    {notif.navigationUrl ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition">
                        Open details →
                      </span>
                    ) : (
                      <span />
                    )}

                    <div className="flex items-center gap-3">
                      {!notif.read && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          className="text-xs font-medium text-gray-500 hover:text-blue-600 transition cursor-pointer"
                          title="Mark as read"
                        >
                          Mark read
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleDelete(notif.id, e)}
                        className="text-xs font-medium text-gray-400 hover:text-red-600 transition cursor-pointer"
                        title="Delete notification"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {!notif.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-600">
            <span>
              Showing Page {currentPage + 1} of {totalPages} ({totalElements} total)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 0}
                onClick={() => fetchNotifications(currentPage - 1)}
                className="px-3 py-1.5 border border-gray-300 bg-white rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 font-medium transition cursor-pointer"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={currentPage + 1 >= totalPages}
                onClick={() => fetchNotifications(currentPage + 1)}
                className="px-3 py-1.5 border border-gray-300 bg-white rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 font-medium transition cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

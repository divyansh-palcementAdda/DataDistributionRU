import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { unreadCount, notifications, loading, markAsRead, markAllAsRead, refresh } = useNotifications();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch when opened
  const toggleDropdown = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        refresh();
      }
      return next;
    });
  };

  const handleNotificationClick = (notif) => {
    if (!notif.read) {
      markAsRead(notif.id);
    }
    setIsOpen(false);
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
      return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    } catch {
      return dateStr;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "FOLLOW_UP_REMINDER":
        return (
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 shrink-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
        );
      case "NEW_LEAD_ASSIGNED":
        return (
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 shrink-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </span>
        );
      case "LEAD_REASSIGNED":
        return (
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 shrink-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 1l4 4-4 4" />
              <path d="M3 11V9a4 4 0 014-4h14" />
              <path d="M7 23l-4-4 4-4" />
              <path d="M21 13v2a4 4 0 01-4 4H3" />
            </svg>
          </span>
        );
      case "ADMIN_ANNOUNCEMENT":
        return (
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 shrink-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </span>
        );
      case "TEST":
        return (
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 shrink-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </span>
        );
      default:
        return (
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 shrink-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </span>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        className="icon-btn relative flex items-center justify-center p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition cursor-pointer"
        onClick={toggleDropdown}
        title="Notifications"
        aria-label="Notifications"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-700"
        >
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 flex items-center justify-center bg-red-600 text-white font-bold rounded-full animate-pulse"
            style={{
              minWidth: "18px",
              height: "18px",
              fontSize: "10px",
              padding: "0 4px",
              boxShadow: "0 0 0 2px #fff",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn"
          style={{ width: "360px", maxWidth: "90vw" }}
        >
          {/* Header */}
          <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="divide-y divide-gray-100 max-h-[380px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                      <div className="h-2.5 bg-gray-100 rounded w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <svg
                  className="w-10 h-10 mx-auto mb-2 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <p className="text-sm font-medium text-gray-600">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3 flex items-start gap-3 cursor-pointer transition hover:bg-gray-50 ${
                    !notif.read ? "bg-blue-50/40" : ""
                  }`}
                >
                  {getNotificationIcon(notif.type)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p
                          className={`text-xs truncate ${
                            !notif.read ? "font-bold text-gray-900" : "font-medium text-gray-700"
                          }`}
                        >
                          {notif.title}
                        </p>
                        {notif.priority === "URGENT" && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 uppercase shrink-0">
                            Urgent
                          </span>
                        )}
                        {notif.priority === "HIGH" && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-700 uppercase shrink-0">
                            High
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>

                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-gray-100 bg-gray-50 text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate("/notifications");
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
            >
              View All Notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

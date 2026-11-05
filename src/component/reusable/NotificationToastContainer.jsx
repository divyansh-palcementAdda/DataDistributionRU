import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";

const ToastItem = ({ toastItem, onDismiss, onNavigateAndMarkRead }) => {
  const { id, notification, duration } = toastItem;
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const remainingTimeRef = useRef(duration);
  const startTimeRef = useRef(Date.now());
  const animationFrameRef = useRef(null);

  useEffect(() => {
    startTimeRef.current = Date.now();

    const updateProgress = () => {
      if (!isPaused) {
        const elapsed = Date.now() - startTimeRef.current;
        const currentRemaining = Math.max(0, remainingTimeRef.current - elapsed);
        const percent = (currentRemaining / duration) * 100;
        setProgress(percent);

        if (currentRemaining <= 0) {
          onDismiss(id);
          return;
        }
      }
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [id, duration, isPaused, onDismiss]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    startTimeRef.current = Date.now();
    setIsPaused(false);
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "URGENT":
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 tracking-wide uppercase">
            Urgent
          </span>
        );
      case "HIGH":
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 tracking-wide uppercase">
            High
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "FOLLOW_UP_REMINDER":
        return (
          <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
        );
      case "NEW_LEAD_ASSIGNED":
        return (
          <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </span>
        );
      case "LEAD_REASSIGNED":
        return (
          <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 1l4 4-4 4" />
              <path d="M3 11V9a4 4 0 014-4h14" />
              <path d="M7 23l-4-4 4-4" />
              <path d="M21 13v2a4 4 0 01-4 4H3" />
            </svg>
          </span>
        );
      case "ADMIN_ANNOUNCEMENT":
        return (
          <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </span>
        );
      case "TEST":
        return (
          <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </span>
        );
      default:
        return (
          <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </span>
        );
    }
  };

  const getBorderColor = (priority) => {
    if (priority === "URGENT") return "border-l-4 border-l-red-500";
    if (priority === "HIGH") return "border-l-4 border-l-amber-500";
    return "border-l-4 border-l-blue-500";
  };

  const getProgressColor = (priority) => {
    if (priority === "URGENT") return "bg-red-500";
    if (priority === "HIGH") return "bg-amber-500";
    return "bg-blue-600";
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onNavigateAndMarkRead(notification)}
      className={`pointer-events-auto relative w-full max-w-sm sm:max-w-md bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 animate-slideInRight ${getBorderColor(
        notification.priority
      )}`}
      style={{
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="p-3.5 flex items-start gap-3">
        {getTypeIcon(notification.type)}

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-xs font-bold text-gray-900 truncate max-w-[200px]">
              {notification.title}
            </span>
            {getPriorityBadge(notification.priority)}
            <span className="text-[10px] text-gray-400 ml-auto shrink-0 font-medium">
              Just now
            </span>
          </div>

          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {notification.message}
          </p>

          <div className="mt-2 flex items-center justify-between">
            {notification.navigationUrl ? (
              <span className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition inline-flex items-center gap-1">
                Open details →
              </span>
            ) : (
              <span className="text-[11px] text-gray-400">Click to view</span>
            )}

            <span className="text-[10px] text-gray-400 font-normal">
              {isPaused ? "Paused" : "Auto-dismissing"}
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(id);
          }}
          className="absolute top-2.5 right-2.5 p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          aria-label="Dismiss notification"
          title="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Progress countdown bar */}
      <div className="w-full bg-gray-100 h-1 overflow-hidden">
        <div
          className={`h-full transition-all ease-linear ${getProgressColor(notification.priority)}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

const NotificationToastContainer = () => {
  const { toasts, dismissToast, markAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNavigateAndMarkRead = (notification) => {
    if (!notification) return;
    if (!notification.read) {
      markAsRead(notification.id);
    }
    dismissToast(notification.id);
    if (notification.navigationUrl) {
      navigate(notification.navigationUrl);
    }
  };

  if (!toasts || toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed z-[9999] top-4 right-4 flex flex-col gap-2.5 pointer-events-none"
      style={{ maxWidth: "calc(100vw - 32px)", width: "380px" }}
    >
      {toasts.map((toastItem) => (
        <ToastItem
          key={toastItem.id}
          toastItem={toastItem}
          onDismiss={dismissToast}
          onNavigateAndMarkRead={handleNavigateAndMarkRead}
        />
      ))}
    </div>
  );
};

export default NotificationToastContainer;


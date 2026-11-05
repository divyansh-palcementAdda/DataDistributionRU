import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { notificationService } from "../Services/notifications";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const location = useLocation();
  const [token, setToken] = useState(() => Cookies.get("accessToken") || null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [lastEventTimestamp, setLastEventTimestamp] = useState(Date.now());

  // Tracking seen notification IDs to prevent duplicate toasts
  const seenNotificationIdsRef = useRef(new Set());
  const initialFetchDoneRef = useRef(false);

  // SSE and reconnect refs
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Sync token from cookies whenever location, focus, or storage changes
  const checkToken = useCallback(() => {
    const currentToken = Cookies.get("accessToken") || null;
    if (currentToken !== token) {
      setToken(currentToken);
    }
    return currentToken;
  }, [token]);

  useEffect(() => {
    checkToken();
  }, [location.pathname, checkToken]);

  useEffect(() => {
    const handleAuthChange = () => checkToken();
    window.addEventListener("focus", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("authStateChanged", handleAuthChange);

    return () => {
      window.removeEventListener("focus", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("authStateChanged", handleAuthChange);
    };
  }, [checkToken]);

  // Dismiss a toast by notification ID
  const dismissToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  // Trigger a rich toast popup for genuinely new incoming notification
  const triggerToast = useCallback((notif) => {
    if (!notif || !notif.id) return;
    const duration = notif.priority === "URGENT" || notif.priority === "HIGH" ? 8000 : 5500;

    setToasts((prev) => [
      {
        id: notif.id,
        notification: notif,
        duration,
        createdAt: Date.now(),
      },
      ...prev.filter((t) => t.id !== notif.id).slice(0, 3), // Keep at most 4 stacked toasts
    ]);
  }, []);

  // Handle incoming real-time notification (from SSE or Polling)
  const handleIncomingNotification = useCallback(
    (newNotif) => {
      if (!newNotif || !newNotif.id) return;

      // Deduplicate: If already seen, never trigger duplicate toast
      if (seenNotificationIdsRef.current.has(newNotif.id)) {
        return;
      }

      // Mark as seen
      seenNotificationIdsRef.current.add(newNotif.id);

      // Add to latest notifications list for dropdown
      setNotifications((prev) => {
        const filtered = prev.filter((n) => n.id !== newNotif.id);
        return [newNotif, ...filtered].slice(0, 10);
      });

      // Increment unread count if unread
      if (!newNotif.read) {
        setUnreadCount((prev) => prev + 1);
      }

      // Trigger rich floating toast notification
      triggerToast(newNotif);

      setLastEventTimestamp(Date.now());
    },
    [triggerToast]
  );

  // Fetch unread count and latest notifications from backend
  const fetchLatestNotifications = useCallback(async () => {
    const currentToken = Cookies.get("accessToken");
    if (!currentToken) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const [countData, pageData] = await Promise.all([
        notificationService.getUnreadCount().catch((err) => {
          console.warn("getUnreadCount fallback:", err?.message);
          return null;
        }),
        notificationService.getUserNotifications({ page: 0, size: 10 }).catch((err) => {
          console.warn("getUserNotifications fallback:", err?.message);
          return null;
        }),
      ]);

      // 1. Update unread count
      if (countData && typeof countData.unreadCount === "number") {
        setUnreadCount(countData.unreadCount);
      } else if (pageData && typeof pageData.unreadCount === "number") {
        setUnreadCount(pageData.unreadCount);
      }

      // 2. Update notifications list
      if (pageData && Array.isArray(pageData.content)) {
        setNotifications(pageData.content);

        if (!initialFetchDoneRef.current) {
          // On first load, seed seen IDs so historical notifications NEVER trigger toasts
          pageData.content.forEach((n) => {
            if (n?.id) seenNotificationIdsRef.current.add(n.id);
          });
          initialFetchDoneRef.current = true;
        } else {
          // On subsequent syncs (e.g., polling fallback), detect newly added notifications
          pageData.content.forEach((n) => {
            if (n?.id && !seenNotificationIdsRef.current.has(n.id)) {
              seenNotificationIdsRef.current.add(n.id);
              triggerToast(n);
              setLastEventTimestamp(Date.now());
            }
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch latest notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [triggerToast]);

  // Connect to SSE stream
  const connectSse = useCallback(() => {
    const currentToken = Cookies.get("accessToken");
    if (!currentToken) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    try {
      const streamUrl = notificationService.getStreamUrl(currentToken);
      const es = new EventSource(streamUrl);
      eventSourceRef.current = es;

      es.addEventListener("NOTIFICATION", (e) => {
        try {
          const data = JSON.parse(e.data);
          handleIncomingNotification(data);
        } catch (parseErr) {
          console.error("Error parsing SSE notification payload:", parseErr);
        }
      });

      es.addEventListener("PING", () => {
        // Heartbeat received
      });

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;
        // Auto-reconnect after 10 seconds if still authenticated
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          if (Cookies.get("accessToken")) {
            connectSse();
          }
        }, 10000);
      };
    } catch (e) {
      console.warn("Could not establish SSE connection, using polling fallback:", e);
    }
  }, [handleIncomingNotification]);

  // Life-cycle when authentication token changes
  useEffect(() => {
    if (token) {
      fetchLatestNotifications();
      connectSse();

      // Reliable background polling fallback every 30 seconds
      const pollInterval = setInterval(() => {
        fetchLatestNotifications();
      }, 30000);

      return () => {
        clearInterval(pollInterval);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setToasts([]);
      seenNotificationIdsRef.current.clear();
      initialFetchDoneRef.current = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    }
  }, [token, fetchLatestNotifications, connectSse]);

  // Mark a single notification as read
  const markAsRead = async (id) => {
    if (!id) return;
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      dismissToast(id);

      await notificationService.markAsRead(id);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      // Resync in case of error
      fetchLatestNotifications();
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      setToasts([]);

      await notificationService.markAllAsRead();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      fetchLatestNotifications();
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    if (!id) return;
    try {
      const target = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (target && !target.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      dismissToast(id);

      await notificationService.deleteNotification(id);
    } catch (err) {
      console.error("Failed to delete notification:", err);
      fetchLatestNotifications();
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        token,
        unreadCount,
        notifications,
        loading,
        toasts,
        lastEventTimestamp,
        dismissToast,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refresh: fetchLatestNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export default NotificationContext;

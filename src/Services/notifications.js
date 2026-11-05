import axiosInstance from "../axiosInstance/axios";

export const notificationService = {
  // Fetch paginated notifications for current user
  getUserNotifications: async (params = {}) => {
    const response = await axiosInstance.get("/api/notifications", { params });
    return response.data?.data;
  },

  // Fetch unread count
  getUnreadCount: async () => {
    const response = await axiosInstance.get("/api/notifications/unread-count");
    return response.data?.data;
  },

  // Mark single notification as read
  markAsRead: async (id) => {
    const response = await axiosInstance.put(`/api/notifications/${id}/read`);
    return response.data?.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await axiosInstance.put("/api/notifications/read-all");
    return response.data?.data;
  },

  // Delete notification
  deleteNotification: async (id) => {
    const response = await axiosInstance.delete(`/api/notifications/${id}`);
    return response.data?.data;
  },

  // Notification Preferences
  getNotificationPreferences: async () => {
    const response = await axiosInstance.get("/api/notifications/preferences");
    return response.data?.data;
  },

  updateNotificationPreferences: async (preferences) => {
    const response = await axiosInstance.put("/api/notifications/preferences", preferences);
    return response.data?.data;
  },

  // Admin Manual Send Notification
  sendAdminNotification: async (payload) => {
    const response = await axiosInstance.post("/api/notifications/admin/send", payload);
    return response.data?.data;
  },

  // Admin Send Test Notification
  sendTestNotification: async () => {
    const response = await axiosInstance.post("/api/notifications/admin/test");
    return response.data?.data;
  },

  // Stream URL for SSE
  getStreamUrl: (token) => {
    const rawBase = import.meta.env.VITE_BASE_URL || "";
    const base = rawBase.replace(/\/+$/, "");
    return `${base}/api/notifications/stream?token=${encodeURIComponent(token)}`;
  }
};


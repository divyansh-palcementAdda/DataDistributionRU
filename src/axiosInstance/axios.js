// src/utils/axiosInstance.js

import axios from "axios";
import Cookies from "js-cookie";

const RAW_BASE_URL = import.meta.env.VITE_BASE_URL || "";
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes
const LAST_ACTIVITY_KEY = "lastActivity";

const axiosInstance = axios.create({
  baseURL: BASE_URL || undefined,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (
  error,
  token = null,
  tokenType = "Bearer"
) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve({
        accessToken: token,
        tokenType,
      });
    }
  });

  failedQueue = [];
};

let inactivityTimer = null;
let isSessionExpiredByInactivity = false;
let isLoggingOut = false;

// ======================================================
// LOGOUT FUNCTION
// ======================================================

export const logoutUser = async (reason = "MANUAL_LOGOUT") => {
  if (isLoggingOut) {
    return;
  }

  isLoggingOut = true;
  isSessionExpiredByInactivity = true;

  try {
    const accessToken = Cookies.get("accessToken");
    const refreshToken = Cookies.get("refreshToken");
    const tokenType = Cookies.get("tokenType") || "Bearer";

    if (accessToken && refreshToken) {
      await axios.post(
        `${BASE_URL}/api/auth/logout`,
        {
          refreshToken,
          logoutReason: reason,
        },
        {
          timeout: 3000,
          headers: {
            Authorization: `${tokenType} ${accessToken}`,
          },
        }
      );
    }
  } catch (logoutError) {
    console.log(
      "Logout API error:",
      logoutError.response?.status || logoutError.message
    );
  } finally {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }

    // Clear all auth cookies
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("tokenType");

    // Clear local storage
    localStorage.removeItem("user");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("userRole");
    localStorage.removeItem("roleId");
    localStorage.removeItem(LAST_ACTIVITY_KEY);

    // Clear pending refresh requests
    if (failedQueue.length > 0) {
      processQueue(new Error("User logged out"));
    }
    isRefreshing = false;

    // Redirect to login
    window.location.href = "/";
  }
};

// ======================================================
// START / RESET INACTIVITY TIMER
// ======================================================

const resetInactivityTimer = () => {
  const accessToken = Cookies.get("accessToken");
  if (!accessToken || isSessionExpiredByInactivity) {
    return;
  }

  const now = Date.now();
  localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());

  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  inactivityTimer = setTimeout(() => {
    isSessionExpiredByInactivity = true;
    logoutUser("INACTIVITY_LOGOUT");
  }, INACTIVITY_LIMIT);
};

// ======================================================
// INITIALIZE INACTIVITY TIMER
// ======================================================

const initializeInactivityTimer = () => {
  const accessToken = Cookies.get("accessToken");
  if (!accessToken) {
    return;
  }

  const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
  if (!lastActivity) {
    resetInactivityTimer();
    return;
  }

  const elapsedTime = Date.now() - Number(lastActivity);
  if (elapsedTime >= INACTIVITY_LIMIT) {
    isSessionExpiredByInactivity = true;
    logoutUser("INACTIVITY_LOGOUT");
    return;
  }

  const remainingTime = INACTIVITY_LIMIT - elapsedTime;
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  inactivityTimer = setTimeout(() => {
    isSessionExpiredByInactivity = true;
    logoutUser("INACTIVITY_LOGOUT");
  }, remainingTime);
};

// ======================================================
// USER ACTIVITY EVENTS & MULTI-TAB SYNC
// ======================================================

const activityEvents = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
];

let activityThrottle = false;

const handleUserActivity = () => {
  if (isSessionExpiredByInactivity) {
    return;
  }

  if (activityThrottle) {
    return;
  }

  activityThrottle = true;
  resetInactivityTimer();

  setTimeout(() => {
    activityThrottle = false;
  }, 1000);
};

// Register activity listeners
activityEvents.forEach((event) => {
  window.addEventListener(event, handleUserActivity, {
    passive: true,
  });
});

// Multi-tab sync for activity and logout
window.addEventListener("storage", (e) => {
  if (e.key === LAST_ACTIVITY_KEY && e.newValue) {
    if (!isSessionExpiredByInactivity) {
      const elapsedTime = Date.now() - Number(e.newValue);
      if (elapsedTime < INACTIVITY_LIMIT) {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
          isSessionExpiredByInactivity = true;
          logoutUser("INACTIVITY_LOGOUT");
        }, INACTIVITY_LIMIT - elapsedTime);
      }
    }
  } else if ((e.key === "userInfo" || e.key === "user") && !e.newValue) {
    // Logged out in another tab
    const accessToken = Cookies.get("accessToken");
    if (!accessToken && !isLoggingOut) {
      logoutUser("MANUAL_LOGOUT");
    }
  }
});

// Initialize timer on load
initializeInactivityTimer();

// ======================================================
// REQUEST INTERCEPTOR
// ======================================================

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get("accessToken");
    const tokenType = Cookies.get("tokenType") || "Bearer";

    if (accessToken) {
      config.headers.Authorization = `${tokenType} ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ======================================================
// RESPONSE INTERCEPTOR
// ======================================================

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // No response / Network error
    if (!error.response) {
      return Promise.reject(error);
    }

    // 403 Forbidden
    if (error.response.status === 403) {
      window.dispatchEvent(new CustomEvent("accessDenied"));
      return Promise.reject(error);
    }

    // 401 Unauthorized
    if (error.response.status === 401 && !originalRequest?._retry) {
      // 1. Check if user is inactive (>= 15 minutes without activity)
      const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || 0);
      const isInactive =
        !lastActivity || Date.now() - lastActivity >= INACTIVITY_LIMIT;

      if (isInactive || isSessionExpiredByInactivity) {
        isSessionExpiredByInactivity = true;
        logoutUser("INACTIVITY_LOGOUT");
        return Promise.reject(error);
      }

      // 2. Prevent recursion if the failed request itself is refresh-token or login
      if (
        originalRequest.url?.includes("/api/auth/refresh-token") ||
        originalRequest.url?.includes("/api/auth/login")
      ) {
        logoutUser("MANUAL_LOGOUT");
        return Promise.reject(error);
      }

      // 3. If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(({ accessToken, tokenType }) => {
            originalRequest.headers.Authorization = `${tokenType} ${accessToken}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // 4. Start refreshing
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = Cookies.get("refreshToken");
        if (!refreshToken) {
          isRefreshing = false;
          logoutUser("MANUAL_LOGOUT");
          return Promise.reject(error);
        }

        // Safety check before calling refresh API
        if (isSessionExpiredByInactivity) {
          isRefreshing = false;
          logoutUser("INACTIVITY_LOGOUT");
          return Promise.reject(error);
        }

        // Direct axios call (not using axiosInstance to prevent recursive interception)
        const response = await axios.post(
          `${BASE_URL}/api/auth/refresh-token`,
          {
            refreshToken,
          },
          {
            timeout: 10000,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const {
          accessToken,
          refreshToken: newRefreshToken,
          tokenType,
        } = response.data.data;

        // Save new tokens
        Cookies.set("accessToken", accessToken);
        if (newRefreshToken) {
          Cookies.set("refreshToken", newRefreshToken);
        }
        if (tokenType) {
          Cookies.set("tokenType", tokenType);
        }

        // Update default header
        axiosInstance.defaults.headers.common["Authorization"] = `${tokenType || "Bearer"} ${accessToken}`;

        // Process queued requests
        processQueue(null, accessToken, tokenType || "Bearer");

        // Retry original request
        originalRequest.headers.Authorization = `${tokenType || "Bearer"} ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Process and reject queued requests
        processQueue(refreshError);

        // Immediate logout on refresh failure to stop any infinite retry loops
        logoutUser("MANUAL_LOGOUT");

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
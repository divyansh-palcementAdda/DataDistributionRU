// src/utils/axiosInstance.js

import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = import.meta.env.VITE_BASE_URL;


const INACTIVITY_LIMIT = 15 * 60 * 1000;
// const INACTIVITY_LIMIT = 2 * 60 * 1000; // 15 minutes
const LAST_ACTIVITY_KEY = "lastActivity";



const axiosInstance = axios.create({
  baseURL: BASE_URL,
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

// VERY IMPORTANT
// 15 minutes complete hone ke baad ye true ho jayega.
// Iske baad 401 par refresh API call nahi hogi.
let isSessionExpiredByInactivity = false;

// Prevent multiple redirects
let isLoggingOut = false;

// ======================================================
// LOGOUT FUNCTION
// ======================================================

const logoutUser = async () => {
  // Multiple logout calls ko prevent karo
  if (isLoggingOut) {
    return;
  }

  isLoggingOut = true;

  try {
    const accessToken = Cookies.get("accessToken");
    const tokenType =
      Cookies.get("tokenType") || "Bearer";

    // Backend logout API
    if (accessToken) {
      await axios.post(
        `${BASE_URL}api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `${tokenType} ${accessToken}`,
          },
        }
      );

      console.log("Logout API called successfully");
    }
  } catch (logoutError) {
    // Logout API fail ho jaye tab bhi
    // frontend logout hona chahiye
    console.log(
      "Logout API error:",
      logoutError.response?.status ||
        logoutError.message
    );
  } finally {
    // Stop inactivity timer
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }

    // Clear cookies
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("tokenType");

    // Clear local storage
    localStorage.removeItem("user");
    localStorage.removeItem(
      LAST_ACTIVITY_KEY
    );

    // Clear pending refresh requests
    failedQueue = [];

    // Redirect to login
    window.location.href = "/";
  }
};

// ======================================================
// START / RESET INACTIVITY TIMER
// ======================================================

const resetInactivityTimer = () => {
  const accessToken =
    Cookies.get("accessToken");

  // User logged in nahi hai
  if (!accessToken) {
    return;
  }

  // Agar session already expire ho chuka hai
  if (isSessionExpiredByInactivity) {
    return;
  }

  // Save activity time
  const now = Date.now();

  localStorage.setItem(
    LAST_ACTIVITY_KEY,
    now.toString()
  );

  // Clear old timer
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  // Start new 15 minute timer
  inactivityTimer = setTimeout(() => {
    // VERY IMPORTANT
    // Flag pehle true hoga
    isSessionExpiredByInactivity = true;

    // Uske baad logout
    logoutUser();
  }, INACTIVITY_LIMIT);
};

// ======================================================
// INITIALIZE INACTIVITY TIMER
// ======================================================

const initializeInactivityTimer = () => {
  const accessToken =
    Cookies.get("accessToken");

  // User logged in nahi hai
  if (!accessToken) {
    return;
  }

  const lastActivity =
    localStorage.getItem(
      LAST_ACTIVITY_KEY
    );

  // Previous activity available nahi hai
  if (!lastActivity) {
    resetInactivityTimer();
    return;
  }

  const elapsedTime =
    Date.now() - Number(lastActivity);

  // ================================================
  // 15 MINUTES ALREADY COMPLETE
  // ================================================

  if (elapsedTime >= INACTIVITY_LIMIT) {
    isSessionExpiredByInactivity = true;

    logoutUser();

    return;
  }

  // ================================================
  // REMAINING TIME CALCULATE
  // ================================================

  const remainingTime =
    INACTIVITY_LIMIT - elapsedTime;

  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  inactivityTimer = setTimeout(() => {
    isSessionExpiredByInactivity = true;

    logoutUser();
  }, remainingTime);
};

// ======================================================
// USER ACTIVITY EVENTS
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
  // Already expired
  if (isSessionExpiredByInactivity) {
    return;
  }

  // Prevent excessive localStorage writes
  if (activityThrottle) {
    return;
  }

  activityThrottle = true;

  resetInactivityTimer();

  setTimeout(() => {
    activityThrottle = false;
  }, 1000);
};

// Register events
activityEvents.forEach((event) => {
  window.addEventListener(
    event,
    handleUserActivity,
    {
      passive: true,
    }
  );
});

// Initialize timer
initializeInactivityTimer();

// ======================================================
// REQUEST INTERCEPTOR
// ======================================================

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken =
      Cookies.get("accessToken");

    const tokenType =
      Cookies.get("tokenType") || "Bearer";

    if (accessToken) {
      config.headers.Authorization =
        `${tokenType} ${accessToken}`;
    }

    console.log("Making request:", config.method?.toUpperCase(), config.url, config.params);
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

    console.log(
      "Axios error:",
      error.message,
      error.response?.status
    );

    // ==================================================
    // NO RESPONSE / NETWORK ERROR
    // ==================================================

    if (!error.response) {
      return Promise.reject(error);
    }

    // ==================================================
    // 403 ERROR - ACCESS DENIED
    // ==================================================

    if (error.response.status === 403) {
      // Dispatch custom event to show Access Denied modal
      window.dispatchEvent(new CustomEvent('accessDenied'));
      return Promise.reject(error);
    }

    // ==================================================
    // 401 ERROR
    // ==================================================

    if (
      error.response.status === 401 &&
      !originalRequest?._retry
    ) {
      // =================================================
      // MOST IMPORTANT CONDITION
      // =================================================
      //
      // Agar 15 minutes inactivity complete ho chuki hai
      // toh REFRESH API CALL NAHI HOGI.
      //
      // Direct logout + login redirect.
      // =================================================

      if (isSessionExpiredByInactivity) {
        console.log(
          "15 minutes inactivity completed."
        );

        console.log(
          "401 received -> Refresh API will NOT run."
        );

        logoutUser();

        return Promise.reject(error);
      }

      // =================================================
      // REFRESH API KO DOBARA REFRESH MAT KARO
      // =================================================

      if (
        originalRequest.url?.includes(
          "/api/auth/refresh-token"
        )
      ) {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        Cookies.remove("tokenType");

        localStorage.removeItem("user");
        localStorage.removeItem(
          LAST_ACTIVITY_KEY
        );

        window.location.href = "/";

        return Promise.reject(error);
      }

      // =================================================
      // REFRESH ALREADY RUNNING
      // =================================================

      if (isRefreshing) {
        return new Promise(
          (resolve, reject) => {
            failedQueue.push({
              resolve,
              reject,
            });
          }
        )
          .then(
            ({
              accessToken,
              tokenType,
            }) => {
              originalRequest.headers.Authorization =
                `${tokenType} ${accessToken}`;

              return axiosInstance(
                originalRequest
              );
            }
          )
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // =================================================
      // MARK REQUEST AS RETRY
      // =================================================

      originalRequest._retry = true;

      isRefreshing = true;

      try {
        // =================================================
        // GET REFRESH TOKEN
        // =================================================

        const refreshToken =
          Cookies.get("refreshToken");

        // =================================================
        // REFRESH TOKEN NOT AVAILABLE
        // =================================================

        if (!refreshToken) {
          isRefreshing = false;

          return Promise.reject(error);
        }

        // =================================================
        // SAFETY CHECK
        // =================================================
        //
        // Refresh API call karne se just pehle bhi
        // inactivity check karenge.
        //
        // Isse race condition ke case mein bhi
        // refresh API nahi chalegi.
        // =================================================

        if (isSessionExpiredByInactivity) {
          logoutUser();

          return Promise.reject(error);
        }

        // =================================================
        // CALL REFRESH API
        // =================================================

        const response = await axios.post(
          `${BASE_URL}api/auth/refresh-token`,
          {
            refreshToken,
          }
        );

        // =================================================
        // GET NEW TOKENS
        // =================================================

        const {
          accessToken,
          refreshToken: newRefreshToken,
          tokenType,
        } = response.data.data;

        // =================================================
        // SAVE NEW TOKENS
        // =================================================

        Cookies.set(
          "accessToken",
          accessToken
        );

        Cookies.set(
          "refreshToken",
          newRefreshToken
        );

        Cookies.set(
          "tokenType",
          tokenType
        );

        // =================================================
        // UPDATE AXIOS DEFAULT HEADER
        // =================================================

        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `${tokenType} ${accessToken}`;

        // =================================================
        // RETRY PENDING REQUESTS
        // =================================================

        processQueue(
          null,
          accessToken,
          tokenType
        );

        // =================================================
        // RETRY ORIGINAL REQUEST
        // =================================================

        originalRequest.headers.Authorization =
          `${tokenType} ${accessToken}`;

        return axiosInstance(
          originalRequest
        );
      } catch (refreshError) {
        const refreshStatus =
          refreshError.response?.status;

        console.log(
          "Refresh API error:",
          refreshStatus
        );

        // Reject queued requests
        processQueue(refreshError);

        // =================================================
        // ONLY REFRESH API 401 -> LOGOUT
        // =================================================

        if (refreshStatus === 401) {
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          Cookies.remove("tokenType");

          localStorage.removeItem("user");
          localStorage.removeItem(
            LAST_ACTIVITY_KEY
          );

          window.location.href = "/";
        }

        // 400 / 403 / 500 / network error
        // Existing behavior same rahega

        return Promise.reject(
          refreshError
        );
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
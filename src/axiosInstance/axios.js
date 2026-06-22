// src/utils/axiosInstance.js

import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null, tokenType = "Bearer") => {
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

// ================= REQUEST INTERCEPTOR =================

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    const tokenType =
      localStorage.getItem("tokenType") || "Bearer";

    if (accessToken) {
      config.headers.Authorization =
        `${tokenType} ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================= RESPONSE INTERCEPTOR =================

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      // Refresh API par dobara refresh mat lagao
      if (
        originalRequest.url?.includes(
          "/api/auth/refresh-token"
        )
      ) {
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(error);
      }

      // Agar refresh already chal raha hai
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(({ accessToken, tokenType }) => {
            originalRequest.headers.Authorization =
              `${tokenType} ${accessToken}`;

            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken =
          localStorage.getItem("refreshToken");

        const response = await axios.post(
          `${BASE_URL}/api/auth/refresh-token`,
          {
            refreshToken,
          }
        );

        const {
          accessToken,
          refreshToken: newRefreshToken,
          tokenType,
        } = response.data.data;

        // Save new tokens
        localStorage.setItem(
          "accessToken",
          accessToken
        );

        localStorage.setItem(
          "refreshToken",
          newRefreshToken
        );

        localStorage.setItem(
          "tokenType",
          tokenType
        );

        // Update default header
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `${tokenType} ${accessToken}`;

        // Retry pending requests
        processQueue(
          null,
          accessToken,
          tokenType
        );

        // Retry original request
        originalRequest.headers.Authorization =
          `${tokenType} ${accessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("tokenType");
        localStorage.removeItem("user");

        window.location.href = "/";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
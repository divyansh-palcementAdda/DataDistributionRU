import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

/**
 * Send a custom branded email to a recipient (RBAC: EMAIL_SEND).
 * @param {Object} data - { recipientEmail, recipientName, subject, messageBody, ctaUrl, ctaText }
 */
export const sendCustomEmail = async (data) => {
    try {
        const response = await axiosInstance.post(ApiRoutes.Email.send, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Send a diagnostic test email to verify SMTP configuration (RBAC: EMAIL_CONFIG_TEST).
 * @param {Object} data - { recipientEmail }
 */
export const sendTestEmail = async (data) => {
    try {
        const response = await axiosInstance.post(ApiRoutes.Email.test, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Retrieve paginated email delivery audit logs with optional filters (RBAC: EMAIL_LOG_VIEW).
 * @param {Object} params - { page, size, sortBy, sortDirection, search, emailType, status }
 */
export const getEmailLogs = async ({
    page = 0,
    size = 10,
    sortBy = "createdAt",
    sortDirection = "DESC",
    search = "",
    emailType = "",
    status = "",
} = {}) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Email.logs, {
            params: {
                page,
                size,
                sortBy,
                sortDirection,
                search: search || undefined,
                emailType: emailType || undefined,
                status: status || undefined,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Get sanitized email service configuration status (RBAC: EMAIL_CONFIG_VIEW).
 */
export const getEmailConfigStatus = async () => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Email.status);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

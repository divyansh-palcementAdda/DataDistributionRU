import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";


export const getAllFollowups = async ({
    page = 0,
    size = 10,
    sortBy = "",
    sortDirection = "",
    search = "",
    date = "",
    status = "",
    userId = "",
    leadId = "",
    leadStatusIds = "",
}) => {
    try {
        const followUpRoute =
            ApiRoutes.FollowUp?.getAllFollowUps ||
            "/api/followups";

        const response = await axiosInstance.get(
            followUpRoute,
            {
                params: {
                    page,
                    size,
                    sortBy,
                    sortDirection,
                    search,
                    date,
                    status,
                    userId,
                    leadId,
                    leadStatusIds: Array.isArray(leadStatusIds) ? leadStatusIds.join(',') : leadStatusIds,
                },
            }
        );

        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get today's follow-ups for counselors/admins (RBAC: FOLLOWUP_VIEW).
 */
export const getTodayFollowups = async ({
    page = 0,
    size = 10,
    sortBy = "followUpDate",
    sortDirection = "ASC",
    search = "",
} = {}) => {
    try {
        const route = ApiRoutes.FollowUp?.getToday || "/api/followups/today";
        const response = await axiosInstance.get(route, {
            params: { page, size, sortBy, sortDirection, search: search || undefined },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get pending follow-ups (RBAC: FOLLOWUP_VIEW).
 */
export const getPendingFollowups = async ({
    page = 0,
    size = 10,
    sortBy = "followUpDate",
    sortDirection = "ASC",
    search = "",
} = {}) => {
    try {
        const route = ApiRoutes.FollowUp?.getPending || "/api/followups/pending";
        const response = await axiosInstance.get(route, {
            params: { page, size, sortBy, sortDirection, search: search || undefined },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get completed follow-ups (RBAC: FOLLOWUP_VIEW).
 */
export const getCompletedFollowups = async ({
    page = 0,
    size = 10,
    sortBy = "followUpDate",
    sortDirection = "DESC",
    search = "",
} = {}) => {
    try {
        const route = ApiRoutes.FollowUp?.getCompleted || "/api/followups/completed";
        const response = await axiosInstance.get(route, {
            params: { page, size, sortBy, sortDirection, search: search || undefined },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Reschedule a follow-up. Backend automatically detects the change and dispatches FollowUpRescheduledEvent post-commit.
 * @param {string} followUpId
 * @param {Object} data - { newFollowUpDate, remarks }
 */
export const rescheduleFollowup = async (followUpId, data) => {
    try {
        const route = (ApiRoutes.FollowUp?.reschedule || "/api/followups/{id}/reschedule").replace("{id}", followUpId);
        const response = await axiosInstance.patch(route, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Mark a follow-up as completed. Backend automatically dispatches FollowUpCompletedEvent post-commit.
 * @param {string} followUpId
 * @param {Object|string} remarksOrPayload - { remarks } or remarks string
 */
export const completeFollowup = async (followUpId, remarksOrPayload) => {
    try {
        const route = (ApiRoutes.FollowUp?.complete || "/api/followups/{id}/complete").replace("{id}", followUpId);
        const payload = typeof remarksOrPayload === "string" ? { remarks: remarksOrPayload } : remarksOrPayload;
        const response = await axiosInstance.patch(route, payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Cancel a follow-up. Backend automatically dispatches FollowUpCancelledEvent post-commit.
 * @param {string} followUpId
 * @param {Object|string} remarksOrPayload - { remarks } or remarks string
 */
export const cancelFollowup = async (followUpId, remarksOrPayload) => {
    try {
        const route = (ApiRoutes.FollowUp?.cancel || "/api/followups/{id}/cancel").replace("{id}", followUpId);
        const payload = typeof remarksOrPayload === "string" ? { remarks: remarksOrPayload } : remarksOrPayload;
        const response = await axiosInstance.patch(route, payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

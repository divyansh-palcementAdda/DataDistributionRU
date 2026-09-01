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
            "/api/follow-ups";

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

export const completeFollowup = async ({
    id,
    feedback,
    remarks = "",
}) => {
    try {
        const completeFollowupRoute =
            ApiRoutes.FollowUp?.completeFollowup?.replace("{id}", id) ||
            `/api/followups/${id}/complete`;

        const response = await axiosInstance.post(
            completeFollowupRoute,
            {
                feedback,
                remarks,
            },
            {
                params: {
                    remarks,
                },
            }
        );

        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const cancelFollowup = async ({
    id,
    feedback,
    remarks = "",
}) => {
    try {
        const cancelFollowupRoute =
            ApiRoutes.FollowUp?.cancelFollowup?.replace("{id}", id) ||
            `/api/followups/${id}/cancel`;

        const response = await axiosInstance.post(
            cancelFollowupRoute,
            {
                feedback,
                remarks,
            },
            {
                params: {
                    remarks,
                },
            }
        );

        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

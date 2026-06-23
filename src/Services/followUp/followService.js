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
                },
            }
        );

        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

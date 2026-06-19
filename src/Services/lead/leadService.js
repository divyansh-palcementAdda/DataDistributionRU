import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

export const createLead = async (data) => {
    try {
        const response = await axiosInstance.post(ApiRoutes.Lead.create, data);
        return response;
    } catch (error) {
        return error;
    }
};

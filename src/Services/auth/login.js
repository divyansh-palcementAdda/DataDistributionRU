import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

export const login = async (data) => {
    try {
        const response = await axiosInstance.post(ApiRoutes.Auth.login, data);
        return response;
    } catch (error) {
        return error;
    }
};  

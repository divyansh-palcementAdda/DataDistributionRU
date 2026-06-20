import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

export const getAllUser = () => {
    return axiosInstance.get(ApiRoutes.Users.getAllUser)
}   
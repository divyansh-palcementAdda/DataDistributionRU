import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

export const getRolePermissions = async (roleId) => {
    try {
        const response = await axiosInstance.get(`${ApiRoutes.Role.getPermissions}/${roleId}/permissions`);
        return response;
    } catch (error) {
        return error;
    }
};

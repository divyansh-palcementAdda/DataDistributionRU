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

export const getAllRoles = async () => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Role.getAllRoles);
        return response;
    } catch (error) {
        return error;
    }
}
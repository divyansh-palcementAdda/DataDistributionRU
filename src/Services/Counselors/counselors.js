import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

export const getCounselorById = async (id) => {
    try {
        const response = await axiosInstance.get(
            ApiRoutes.Users.getById.replace("{id}", id)
        );
        return response;
    } catch (error) {
        return error;
    }
};

export const getAllCounselors = async (params = {}) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Counselors.getAllCounselors, {
            params: {
                roleName: params.roleName || "Conseller",
                roleNames: params.roleNames || "",
                status: params.status || "",
                page: params.page ?? 0,
                size: params.size ?? 10,
                sortBy: params.sortBy || "",
                sortDirection: params.sortDirection || "ASC",
                search: params.search || "",
            },
        });
        return response;
    } catch (error) {
        return error;
    }
};

export const getUserPerformance = async (params = {}) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Counselors.getUserPerformance, {
            params: {
                page: params.page ?? 0,
                size: params.size ?? 10,
                sortBy: params.sortBy || "userName",
                sortDirection: params.sortDirection || "ASC",
                search: params.search || "",
                role: params.role || "",
                roles: params.roles || "",
                departmentId: params.departmentId || "",
                status: params.status || "",
                currentlyWorking: params.currentlyWorking !== undefined ? params.currentlyWorking : "",
            },
        });
        return response;
    } catch (error) {
        return error;
    }
};

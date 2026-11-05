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
        const queryParams = {
            page: params.page ?? 0,
            size: params.size ?? 10,
            sortBy: params.sortBy || "userName",
            sortDirection: params.sortDirection || "ASC",
            period: params.period || "TODAY",
        };
        if (params.search) queryParams.search = params.search;
        if (params.role) queryParams.role = params.role;
        if (params.roles) queryParams.roles = params.roles;
        if (params.departmentId) queryParams.departmentId = params.departmentId;
        if (params.status) queryParams.status = params.status;
        if (params.currentlyWorking !== undefined && params.currentlyWorking !== "") {
            queryParams.currentlyWorking = params.currentlyWorking;
        }
        if (params.startDate) queryParams.startDate = params.startDate;
        if (params.endDate) queryParams.endDate = params.endDate;

        const response = await axiosInstance.get(ApiRoutes.Counselors.getUserPerformance, {
            params: queryParams,
        });
        return response;
    } catch (error) {
        return error;
    }
};

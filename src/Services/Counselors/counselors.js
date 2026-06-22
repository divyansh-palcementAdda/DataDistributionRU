import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";


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

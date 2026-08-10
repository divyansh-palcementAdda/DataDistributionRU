import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes.jsx";

export const createLeadStatus = async (data) => {
    try {
        const response = await axiosInstance.post(
            ApiRoutes.LeadStatus.create,
            data
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getAllLeadStatus = async ({
    page = 0,
    size = 10,
    sortBy = "",
    sortDirection = "ASC",
    search = ""
}) => {
    try {
        const response = await axiosInstance.get(
            ApiRoutes.LeadStatus.getAll,
            {
                params: {
                    page,
                    size,
                    sortBy,
                    sortDirection,
                    search,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getLeadStatusById = async (id) => {
    try {
        const response = await axiosInstance.get(
            ApiRoutes.LeadStatus.getDetailsById.replace('{id}', id)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateLeadStatus = async (id, data) => {
    try {
        const response = await axiosInstance.put(
            ApiRoutes.LeadStatus.update.replace('{id}', id),
            data
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteLeadStatus = async (id) => {
    try {
        const response = await axiosInstance.delete(
            ApiRoutes.LeadStatus.delete.replace('{id}', id)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const toggleLeadStatusStatus = async (id) => {
    try {
        const response = await axiosInstance.put(
            ApiRoutes.LeadStatus.toggle.replace('{id}', id)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getActiveLeadStatus = async () => {
    try {
        const response = await axiosInstance.get(
            ApiRoutes.LeadStatus.getActive
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

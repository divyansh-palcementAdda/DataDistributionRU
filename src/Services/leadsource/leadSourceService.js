import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

/**
 * Fetch paginated lead sources with optional search & sort.
 * @param {object} params - { page, size, sortBy, sortDirection, search }
 */
export const getAllLeadSource = (params = {}) => {
    try {
        const response = axiosInstance.get(ApiRoutes.Lead_Source.getAll, { params });
        return response;
    } catch (error) {
        throw error;
    }
};

export const getLeadSourceById = (id) => {
    try {
        const url = ApiRoutes.Lead_Source.getDetailsById.replace('{id}', id);
        const response = axiosInstance.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};

export const createLeadSource = (data) => {
    try {
        const response = axiosInstance.post(ApiRoutes.Lead_Source.create, data);
        return response;
    } catch (error) {
        throw error;
    }
};

export const updateLeadSource = (id, data) => {
    try {
        const url = ApiRoutes.Lead_Source.update.replace('{id}', id);
        const response = axiosInstance.put(url, data);
        return response;
    } catch (error) {
        throw error;
    }
};

export const deleteLeadSource = (id) => {
    try {
        const url = ApiRoutes.Lead_Source.delete.replace('{id}', id);
        const response = axiosInstance.delete(url);
        return response;
    } catch (error) {
        throw error;
    }
};

export const toggleLeadSource = (id) => {
    try {
        const url = ApiRoutes.Lead_Source.toggle.replace('{id}', id);
        const response = axiosInstance.put(url);
        return response;
    } catch (error) {
        throw error;
    }
};
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
        const response = axiosInstance.get(`${ApiRoutes.Lead_Source.getAll}/${id}`);
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
        const response = axiosInstance.put(`${ApiRoutes.Lead_Source.update}/${id}`, data);
        return response;
    } catch (error) {
        throw error;
    }
};

export const deleteLeadSource = (id) => {
    try {
        const response = axiosInstance.delete(`${ApiRoutes.Lead_Source.delete}/${id}`);
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
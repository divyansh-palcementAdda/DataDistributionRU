import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

export const createLead = async (data) => {
    try {
        const response = await axiosInstance.post(ApiRoutes.Lead.create, data);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getAllLeads = async (params) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Lead.getAllLeads, { params });
        return response;
    } catch (error) {
        return error;
    }
};
export const updateLead = async (id, data) => {
    try {
        const response = await axiosInstance.put(`${ApiRoutes.Lead.update}/${id}`, data);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getLeadById = async (id) => {
    try {
        const response = await axiosInstance.get(`${ApiRoutes.Lead.getById}/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};
export const getLeadAssignmentHistory = async (id) => {
    try {
        const response = await axiosInstance.get(`${ApiRoutes.Lead.assignmentHistory}/${id}/assignment-history`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const deleteLead = async (id) => {
    try {
        const response = await axiosInstance.delete(`${ApiRoutes.Lead.getAllLeads}/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getLeadSourceWiseStats = async () => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Lead.sourceWiseStats);
        return response;
    } catch (error) {
        throw error;
    }
};

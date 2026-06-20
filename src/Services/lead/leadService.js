import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

export const createLead = async (data) => {
    try {
        const response = await axiosInstance.post(ApiRoutes.Lead.create, data);
        return response;
    } catch (error) {
        return error;
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
        const response = await axiosInstance.put(`${ApiRoutes.Lead.getAllLeads}/${id}`, data);
        return response;
    } catch (error) {
        return error;
    }
};

export const getLeadById = async (id) => {
    try {
        const response = await axiosInstance.get(`${ApiRoutes.Lead.getAllLeads}/${id}`);
        return response;
    } catch (error) {
        return error;
    }
};

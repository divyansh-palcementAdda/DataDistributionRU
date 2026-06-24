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

//  for schedule lead its use at schedule btn in details page 
export const createLeadSchedule = async (id, data) => {
    try {
        const url = ApiRoutes.Lead.leadSchedule.replace("{id}", id);
        const response = await axiosInstance.post(
            url,
            data
        );
        return response;
    } catch (error) {
        throw error;
    }
};

// Mark a follow-up as completed
export const completeLeadFollowUp = async (followUpId, remarks = "") => {
    try {
        const route =
            ApiRoutes.Lead.completeFollowUp ||
            ApiRoutes.Lead.markLead;

        const url = route.replace("{followUpId}", followUpId);
        const response = await axiosInstance.post(url, null, {
            params: { remarks },
        });

        return response;
    } catch (error) {
        throw error;
    }
};

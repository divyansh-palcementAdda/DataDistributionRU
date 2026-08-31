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

// Get Info Panel data for a lead (with optional courseId)
export const getLeadInfoPanel = async (leadId, courseId = null) => {
    try {
        const url = ApiRoutes.Lead.infoPanel.replace('{leadId}', leadId);
        const response = await axiosInstance.get(url, {
            params: courseId ? { courseId } : {},
        });
        return response;
    } catch (error) {
        throw error;
    }
};

// Send WhatsApp message to lead via course template
export const sendLeadWhatsApp = async (leadId, data) => {
    try {
        const url = ApiRoutes.Lead.sendWhatsApp.replace('{leadId}', leadId);
        const response = await axiosInstance.post(url, data);
        return response;
    } catch (error) {
        throw error;
    }
};

// Send Email to lead via course template
export const sendLeadEmail = async (leadId, data) => {
    try {
        const url = ApiRoutes.Lead.sendEmail.replace('{leadId}', leadId);
        const response = await axiosInstance.post(url, data);
        return response;
    } catch (error) {
        throw error;
    }
};

// Preview lead distribution — POST /api/leads/distribute/preview
export const previewLeadDistribution = async (payload) => {
    try {
        const response = await axiosInstance.post(ApiRoutes.Distribution.preview, payload);
        return response;
    } catch (error) {
        throw error;
    }
};

// Distribute leads — POST /api/leads/distribute
export const distributeLeads = async (payload) => {
    try {
        const response = await axiosInstance.post(ApiRoutes.Distribution.distribute, payload);
        return response;
    } catch (error) {
        throw error;
    }
};

// Reassign leads — POST /api/leads/reassign
export const reassignLeads = async (payload) => {
    try {
        const response = await axiosInstance.post(ApiRoutes.Lead.reassign, payload);
        return response;
    } catch (error) {
        throw error;
    }
};

// Reassign and distribute leads — POST /api/leads/reassign/distribute
export const reassignDistributeLeads = async (payload) => {
    try {
        const response = await axiosInstance.post(ApiRoutes.Lead.reassignDistribute, payload);
        return response;
    } catch (error) {
        throw error;
    }
};

// Reassign follow-ups — POST /api/follow-ups/reassign
export const reassignFollowUps = async (payload) => {
    try {
        const response = await axiosInstance.post(ApiRoutes.FollowUp.reassign, payload);
        return response;
    } catch (error) {
        throw error;
    }
};

// Reassign and distribute follow-ups — POST /api/follow-ups/reassign/distribute
export const reassignDistributeFollowUps = async (payload) => {
    try {
        const response = await axiosInstance.post(ApiRoutes.FollowUp.reassignDistribute, payload);
        return response;
    } catch (error) {
        throw error;
    }
};

// Change lead status — POST /api/leads/{id}/change-status
export const changeLeadStatus = async (id, data) => {
    try {
        const url = ApiRoutes.Lead.changeStatus.replace("{id}", id);
        const response = await axiosInstance.post(url, data);
        return response;
    } catch (error) {
        throw error;
    }
};

// Get lead status history — GET /api/leads/{id}/status-history
export const getLeadStatusHistory = async (id, params = {}) => {
    try {
        const url = ApiRoutes.Lead.statusHistory.replace("{id}", id);
        const response = await axiosInstance.get(url, { params });
        return response;
    } catch (error) {
        throw error;
    }
};

// Get lead follow-ups — GET /api/leads/{id}/followups
export const getLeadFollowUps = async (id, params = {}) => {
    try {
        const url = ApiRoutes.Lead.getFollowUps.replace("{id}", id);
        const response = await axiosInstance.get(url, { params });
        return response;
    } catch (error) {
        throw error;
    }
};

// Mark a lead as availed — POST /api/leads/{id}/avail
export const availLead = async (id) => {
    try {
        const url = ApiRoutes.Lead.avail.replace("{id}", id);
        const response = await axiosInstance.post(url);
        return response;
    } catch (error) {
        throw error;
    }
};

import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

export const getInfoPanelByCourse = async (courseId, academicSession = "") => {
    try {
        const url = ApiRoutes.InfoPanel.getByCourse.replace('{courseId}', courseId);
        const response = await axiosInstance.get(url, {
            params: academicSession ? { academicSession } : {}
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getLeadCallerGuidance = async (leadId, courseId = "") => {
    try {
        const url = ApiRoutes.InfoPanel.getByLead.replace('{leadId}', leadId);
        const response = await axiosInstance.get(url, {
            params: courseId ? { courseId } : {}
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getInfoPanelById = async (id) => {
    try {
        const url = ApiRoutes.InfoPanel.getById.replace('{id}', id);
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getInfoPanelPermissions = async () => {
    try {
        const response = await axiosInstance.get(ApiRoutes.InfoPanel.permissions);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const createInfoPanel = async (data) => {
    try {
        const response = await axiosInstance.post(ApiRoutes.InfoPanel.create, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateInfoPanel = async (id, data) => {
    try {
        const url = ApiRoutes.InfoPanel.update.replace('{id}', id);
        const response = await axiosInstance.put(url, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteInfoPanel = async (id) => {
    try {
        const url = ApiRoutes.InfoPanel.delete.replace('{id}', id);
        const response = await axiosInstance.delete(url);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const addCompetitor = async (infoPanelId, data) => {
    try {
        const url = ApiRoutes.InfoPanel.addCompetitor.replace('{id}', infoPanelId);
        const response = await axiosInstance.post(url, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateCompetitor = async (infoPanelId, competitorId, data) => {
    try {
        const url = ApiRoutes.InfoPanel.updateCompetitor
            .replace('{id}', infoPanelId)
            .replace('{competitorId}', competitorId);
        const response = await axiosInstance.put(url, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteCompetitor = async (infoPanelId, competitorId) => {
    try {
        const url = ApiRoutes.InfoPanel.deleteCompetitor
            .replace('{id}', infoPanelId)
            .replace('{competitorId}', competitorId);
        const response = await axiosInstance.delete(url);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const reorderCompetitors = async (infoPanelId, competitorIds) => {
    try {
        const url = ApiRoutes.InfoPanel.reorderCompetitors.replace('{id}', infoPanelId);
        const response = await axiosInstance.put(url, competitorIds);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

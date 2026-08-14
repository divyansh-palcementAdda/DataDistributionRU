import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

export const getLeadStatusBreakdown = async (params = {}) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Dashboard.leadStatus, { params });
        return response;
    } catch (error) {
        throw error;
    }
};

export const getLeadSourceBreakdown = async (params = {}) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Dashboard.leadSource, { params });
        return response;
    } catch (error) {
        throw error;
    }
};

export const getGradeBreakdown = async (params = {}) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Dashboard.grade, { params });
        return response;
    } catch (error) {
        throw error;
    }
};

export const getCourseBreakdown = async (params = {}) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Dashboard.course, { params });
        return response;
    } catch (error) {
        throw error;
    }
};

export const getBoardBreakdown = async (params = {}) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Dashboard.board, { params });
        return response;
    } catch (error) {
        throw error;
    }
};


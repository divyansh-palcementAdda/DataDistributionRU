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

export const getCourseTypesBreakdown = async (params = {}) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Dashboard.courseTypes, { params });
        return response;
    } catch (error) {
        throw error;
    }
};

export const getUnallottedCount = async (filterRequest = {}) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Dashboard.unallottedCount, { params: filterRequest });
        return response;
    } catch (error) {
        throw error;
    }
};

export const getAvailedCount = async (filterRequest = {}) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Dashboard.availedCount, { params: filterRequest });
        return response;
    } catch (error) {
        throw error;
    }
};

export const getAllottedCount = async (filterRequest = {}) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Dashboard.allottedCount, { params: filterRequest });
        return response;
    } catch (error) {
        throw error;
    }
};


import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

/**
 * Fetch course types summary with lead counts
 */
export const getCourseTypesSummary = async () => {
    try {
        const response = await axiosInstance.get(ApiRoutes.DataSegregation.courseTypes);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Fetch hierarchical data segregation matrix
 * @param {Object} params - { courseTypeId, leadSourceId, boardId, gradeId }
 */
export const getSegregationMatrix = async (params = {}) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.DataSegregation.matrix, { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Fetch user analytics breakdown for a selected scope
 * @param {Object} params - { courseTypeId, leadSourceId, boardId, gradeId }
 */
export const getUserSegregationAnalytics = async (params = {}) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.DataSegregation.userAnalytics, { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Fetch dynamic lead status analytics matrix for a selected scope
 * @param {Object} params - { courseTypeId, leadSourceId, boardId, gradeId }
 */
export const getLeadStatusSegregationAnalytics = async (params = {}) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.DataSegregation.leadStatusAnalytics, { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

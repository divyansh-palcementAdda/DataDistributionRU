import axiosInstance from '../../axiosInstance/axios';
import ApiRoutes from '../../apiRoutes/allApiRoutes';

/**
 * Fetch Course-wise Lead Status Analytics
 * @param {Object} params - Context, Date Preset/Range, Search, Pagination, Sort params
 * @returns {Promise<Object>} API response data
 */
export const getCourseWiseLeadStatus = async (params = {}) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.LeadAnalytics.courseStatus, { params });
        return response?.data?.data || response?.data || {};
    } catch (error) {
        console.error('Error fetching course-wise lead status analytics:', error);
        throw error;
    }
};

/**
 * Fetch User-wise Lead Status Analytics
 * @param {Object} params - Context, Date Preset/Range, Search, Pagination, Sort params
 * @returns {Promise<Object>} API response data
 */
export const getUserWiseLeadStatus = async (params = {}) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.LeadAnalytics.userStatus, { params });
        return response?.data?.data || response?.data || {};
    } catch (error) {
        console.error('Error fetching user-wise lead status analytics:', error);
        throw error;
    }
};

/**
 * Fetch combined Course & User Lead Status Analytics
 * @param {Object} params - Context, Date Preset/Range, Search, Pagination, Sort params
 * @returns {Promise<Object>} API response data
 */
export const getCourseUserLeadStatus = async (params = {}) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.LeadAnalytics.courseUserStatus, { params });
        return response?.data?.data || response?.data || {};
    } catch (error) {
        console.error('Error fetching combined lead status analytics:', error);
        throw error;
    }
};

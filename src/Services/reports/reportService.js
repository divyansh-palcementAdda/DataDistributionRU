import axiosInstance from '../../axiosInstance/axios';
import ApiRoutes from '../../apiRoutes/allApiRoutes';

/**
 * Fetch User Performance & Departmental Report
 * @param {Object} params - fromDate, toDate, datePreset, sessionId, departmentId, userId, courseId, leadStatusId, reportMode, page, size, sortBy, sortDirection
 * @returns {Promise<Object>} API response data
 */
export const getUserPerformanceReport = async (params = {}) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Reports.getUserPerformance, { params });
        return response?.data?.data || response?.data || {};
    } catch (error) {
        console.error('Error fetching user performance report:', error);
        throw error;
    }
};

/**
 * Download User Performance Excel Report (.xlsx) from backend
 * @param {Object} params - Same filters as report
 * @returns {Promise<Blob>} Excel Blob
 */
export const downloadUserPerformanceExcel = async (params = {}) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Reports.exportUserPerformance, {
            params,
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        console.error('Error exporting user performance report:', error);
        throw error;
    }
};

/**
 * Fetch available academic sessions
 * @returns {Promise<Array>} List of academic sessions
 */
export const getAcademicSessions = async () => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Reports.getSessions);
        return response?.data?.data || response?.data || [];
    } catch (error) {
        console.error('Error fetching academic sessions:', error);
        throw error;
    }
};

/**
 * Fetch current active academic session
 * @returns {Promise<Object>} Active academic session
 */
export const getActiveAcademicSession = async () => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Reports.getActiveSession);
        return response?.data?.data || response?.data || {};
    } catch (error) {
        console.error('Error fetching active academic session:', error);
        throw error;
    }
};

import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

const getRecentActivity = async () => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Dashboard.recentActivity);
        return response.data;
    } catch (error) {
        return error;
    }
};

const getDashboardSummary = async (params = {}) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Dashboard.summary, { params });
        return response.data;
    } catch (error) {
        return error;
    }
};

const getLowDataUsers = async (params = {}) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Dashboard.lowDataUsers, { params });
        return response.data;
    } catch (error) {
        return error;
    }
};

const getUsersNotLoggedIn = async (params = {}) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Dashboard.usersNotLoggedIn, { params });
        return response.data;
    } catch (error) {
        return error;
    }
};

const getFollowupUsersNotLoggedIn11am = async (params = {}) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Dashboard.followupUsersNotLoggedIn11am, { params });
        return response.data;
    } catch (error) {
        return error;
    }
};

export {
    getRecentActivity,
    getDashboardSummary,
    getLowDataUsers,
    getUsersNotLoggedIn,
    getFollowupUsersNotLoggedIn11am
};


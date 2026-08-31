import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

const getBoardsDropdown = async (search = '') => {
    try {
        const params = search ? { search } : {};
        const response = await axiosInstance.get(ApiRoutes.Dropdowns.boards, { params });
        return response.data;
    } catch (error) {
        return error;
    }
};

const getCourseTypesDropdown = async (search = '') => {
    try {
        const params = search ? { search } : {};
        const response = await axiosInstance.get(ApiRoutes.Dropdowns.courseTypes, { params });
        return response.data;
    } catch (error) {
        return error;
    }
};

const getCoursesDropdown = async (courseTypeId = '', search = '') => {
    try {
        const params = {};
        if (courseTypeId) params.courseTypeId = courseTypeId;
        if (search) params.search = search;
        const response = await axiosInstance.get(ApiRoutes.Dropdowns.courses, { params });
        return response.data;
    } catch (error) {
        return error;
    }
};

const getDepartmentsDropdown = async (search = '') => {
    try {
        const params = search ? { search } : {};
        const response = await axiosInstance.get(ApiRoutes.Dropdowns.departments, { params });
        return response.data;
    } catch (error) {
        return error;
    }
};

const getGradesDropdown = async (search = '') => {
    try {
        const params = search ? { search } : {};
        const response = await axiosInstance.get(ApiRoutes.Dropdowns.grades, { params });
        return response.data;
    } catch (error) {
        return error;
    }
};

const getLeadSourcesDropdown = async (search = '') => {
    try {
        const params = search ? { search } : {};
        const response = await axiosInstance.get(ApiRoutes.Dropdowns.leadSources, { params });
        return response.data;
    } catch (error) {
        return error;
    }
};

const getLeadStatusesDropdown = async (sentimentCategory = '') => {
    try {
        const params = sentimentCategory ? { sentimentCategory } : {};
        const response = await axiosInstance.get(ApiRoutes.Dropdowns.leadStatuses, { params });
        return response.data;
    } catch (error) {
        return error;
    }
};

const getRolesDropdown = async (search = '') => {
    try {
        const params = search ? { search } : {};
        const response = await axiosInstance.get(ApiRoutes.Dropdowns.roles, { params });
        return response.data;
    } catch (error) {
        return error;
    }
};

const getUsersDropdown = async (role = '', departmentId = '', search = '') => {
    try {
        const params = {};
        if (role) params.role = role;
        if (departmentId) params.departmentId = departmentId;
        if (search) params.search = search;
        const response = await axiosInstance.get(ApiRoutes.Dropdowns.users, { params });
        return response.data;
    } catch (error) {
        return error;
    }
};

// api for Schedule Follow Up modal Speacilly  status drop down - lead status drop down 

const getFollowupStatusesDropdown = async () => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Dropdowns.followupStatuses);
        return response.data;
    } catch (error) {
        return error;
    }
};

const getFollowupLeadStatusesDropdown = async () => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Dropdowns.followupLeadStatuses);
        return response.data;
    } catch (error) {
        return error;
    }
};



export {
    getBoardsDropdown,
    getCourseTypesDropdown,
    getCoursesDropdown,
    getDepartmentsDropdown,
    getGradesDropdown,
    getLeadSourcesDropdown,
    getLeadStatusesDropdown,
    getRolesDropdown,
    getUsersDropdown,
    getFollowupStatusesDropdown,
    getFollowupLeadStatusesDropdown
};
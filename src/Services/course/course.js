import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

export const createCourse = async (data) => {
    try {
        const response = await axiosInstance.post(
            ApiRoutes.Course.createCourse,
            data
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getAllCourses = async ({
    page = 0,
    size = 10,
    sortBy = "",
    sortDirection = "ASC",
    search = "",
    courseTypeId = ""
}) => {
    try {
        const response = await axiosInstance.get(
            ApiRoutes.Course.getAllCourses,
            {
                params: {
                    page,
                    size,
                    sortBy,
                    sortDirection,
                    search,
                    courseTypeId,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getCourseById = async (id) => {
    try {
        const response = await axiosInstance.get(
            ApiRoutes.Course.details.replace('{id}', id)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateCourse = async (id, data) => {
    try {
        const response = await axiosInstance.put(
            ApiRoutes.Course.update.replace('{id}', id),
            data
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteCourse = async (id) => {
    try {
        const response = await axiosInstance.delete(
            ApiRoutes.Course.delete.replace('{id}', id)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const toggleCourseStatus = async (id) => {
    try {
        const response = await axiosInstance.put(
            ApiRoutes.Course.toggle.replace('{id}', id)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

export const createCourseType = async (data) => {
    try {
        const response = await axiosInstance.post(
            ApiRoutes.CoursesTypes.create,
            data
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getAllCourseType = async ({
    page = 0,
    size = 10,
    sortBy = "",
    sortDirection = "ASC",
    search = "",
}) => {
    try {
        const response = await axiosInstance.get(
            ApiRoutes.CoursesTypes.getAllCourse,
            {
                params: {
                    page,
                    size,
                    sortBy,
                    sortDirection,
                    search,
                },
            }
        );

        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getCourseTypeById = async (id) => {
    try {
        const response = await axiosInstance.get(
            ApiRoutes.CoursesTypes.getDetailsById.replace('{id}', id)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const toggleCourseStatus = async (id) => {
    try {
        const response = await axiosInstance.put(
            ApiRoutes.CoursesTypes.toggle.replace('{id}', id)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteCourseType = async (id) => {
    try {
        const response = await axiosInstance.delete(
            ApiRoutes.CoursesTypes.delete.replace('{id}', id)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateCourseType = async (id, data) => {
    try {
        const response = await axiosInstance.put(
            ApiRoutes.CoursesTypes.update.replace('{id}', id),
            data
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getActiveCourseTypes = async () => {
    try {
        const response = await axiosInstance.get(
            ApiRoutes.CoursesTypes.getActive
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

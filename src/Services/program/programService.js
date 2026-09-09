import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

export const getAllPrograms = async (params = {}) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Program.getAll, { params });
        return response.data;
    } catch (error) {
        return error;
    }
};

export const getActivePrograms = async () => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Program.getActive);
        return response.data;
    } catch (error) {
        return error;
    }
};

export const getProgramById = async (id) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Program.getById.replace('{id}', id));
        return response.data;
    } catch (error) {
        return error;
    }
};

export const createProgram = async (payload) => {
    try {
        const response = await axiosInstance.post(ApiRoutes.Program.create, payload);
        return response.data;
    } catch (error) {
        return error;
    }
};

export const updateProgram = async (id, payload) => {
    try {
        const response = await axiosInstance.put(ApiRoutes.Program.update.replace('{id}', id), payload);
        return response.data;
    } catch (error) {
        return error;
    }
};

export const deleteProgram = async (id) => {
    try {
        const response = await axiosInstance.delete(ApiRoutes.Program.delete.replace('{id}', id));
        return response.data;
    } catch (error) {
        return error;
    }
};

export const toggleProgramActive = async (id) => {
    try {
        const response = await axiosInstance.put(ApiRoutes.Program.toggle.replace('{id}', id));
        return response.data;
    } catch (error) {
        return error;
    }
};

export const mapCoursesToProgram = async (id, courseIds) => {
    try {
        const response = await axiosInstance.put(ApiRoutes.Program.mapCourses.replace('{id}', id), { courseIds });
        return response.data;
    } catch (error) {
        return error;
    }
};

export const getProgramCourses = async (id) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Program.getCourses.replace('{id}', id));
        return response.data;
    } catch (error) {
        return error;
    }
};

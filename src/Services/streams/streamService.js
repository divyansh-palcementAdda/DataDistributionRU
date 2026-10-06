import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

export const createStream = async (data) => {
    try {
        const response = await axiosInstance.post(
            ApiRoutes.Streams.create,
            data
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getAllStreams = async ({
    page = 0,
    size = 10,
    sortBy = "",
    sortDirection = "ASC",
    search = "",
}) => {
    try {
        const response = await axiosInstance.get(
            ApiRoutes.Streams.getAll,
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

export const getStreamById = async (id) => {
    try {
        const response = await axiosInstance.get(
            ApiRoutes.Streams.getById.replace('{id}', id)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const toggleStreamStatus = async (id) => {
    try {
        const response = await axiosInstance.put(
            ApiRoutes.Streams.toggle.replace('{id}', id)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteStream = async (id) => {
    try {
        const response = await axiosInstance.delete(
            ApiRoutes.Streams.delete.replace('{id}', id)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateStream = async (id, data) => {
    try {
        const response = await axiosInstance.put(
            ApiRoutes.Streams.update.replace('{id}', id),
            data
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getActiveStreams = async () => {
    try {
        const response = await axiosInstance.get(
            ApiRoutes.Streams.getActive
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

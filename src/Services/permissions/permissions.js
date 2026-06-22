import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

export const getAllPermissions = async () => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Permission.getAll);
        return response;
    } catch (error) {
        return error;
    }
};

export const getPermissionById = async (id) => {
    try {
        const response = await axiosInstance.get(
            ApiRoutes.Permission.getDetailsById.replace("{id}", id)
        );
        return response;
    } catch (error) {
        return error;
    }
};

export const createPermission = async (data) => {
    try {
        const response = await axiosInstance.post(ApiRoutes.Permission.create, data);
        return response;
    } catch (error) {
        return error;
    }
};

export const updatePermission = async (id, data) => {
    try {
        const response = await axiosInstance.put(
            ApiRoutes.Permission.update.replace("{id}", id),
            data
        );
        return response;
    } catch (error) {
        return error;
    }
};

export const deletePermission = async (id) => {
    try {
        const response = await axiosInstance.delete(
            ApiRoutes.Permission.delete.replace("{id}", id)
        );
        return response;
    } catch (error) {
        return error;
    }
};

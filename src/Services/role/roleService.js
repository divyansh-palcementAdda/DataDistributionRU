import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

export const getRolePermissions = async (roleId) => {
    try {
        const response = await axiosInstance.get(`${ApiRoutes.Role.getPermissions}/${roleId}/permissions`);
        return response;
    } catch (error) {
        return error;
    }
};

export const getAllRoles = async () => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Role.getAllRoles);
        return response;
    } catch (error) {
        return error;
    }
};

export const getRoleById = async (id) => {
    try {
        const response = await axiosInstance.get(
            ApiRoutes.Role.getDetailsById.replace('{id}', id)
        );
        return response;
    } catch (error) {
        return error;
    }
};

export const createRole = async (data) => {
    try {
        const response = await axiosInstance.post(ApiRoutes.Role.cretae, data);
        return response;
    } catch (error) {
        return error;
    }
};

export const updateRole = async (id, data) => {
    try {
        const response = await axiosInstance.put(
            ApiRoutes.Role.upadte.replace('{id}', id),
            data
        );
        return response;
    } catch (error) {
        return error;
    }
};

export const deleteRole = async (id) => {
    try {
        const response = await axiosInstance.delete(
            ApiRoutes.Role.delete.replace('{id}', id)
        );
        return response;
    } catch (error) {
        return error;
    }
};

export const toggleRoleStatus = async (id, isActive) => {
    try {
        const route = isActive
            ? ApiRoutes.Role.activate.replace('{id}', id)
            : ApiRoutes.Role.deactivate.replace('{id}', id);

        const response = await axiosInstance.patch(route);
        return response;
    } catch (error) {
        return error;
    }
};

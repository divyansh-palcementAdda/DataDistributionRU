import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

export const getAllUser = (params = {}) => {
    return axiosInstance.get(ApiRoutes.Users.getAllUser, {
        params: {
            page: params.page ?? 0,
            size: params.size ?? 10,
            sortBy: params.sortBy || "",
            sortDirection: params.sortDirection || "ASC",
            search: params.search || ""
        }
    });
};

export const addUser = (data) => {
    return axiosInstance.post(ApiRoutes.Users.create, data, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const updateUser = (id, data) => {
    return axiosInstance.put(ApiRoutes.Users.update.replace('{id}', id), data, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const deleteUser = (id) => {
    return axiosInstance.delete(ApiRoutes.Users.delete.replace('{id}', id));
};

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

export const getUserCreationOptions = () => {
    return axiosInstance.get(ApiRoutes.Users.creationOptions);
};

export const downloadUserTemplate = async () => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Users.bulkUploadTemplate, {
            responseType: 'blob'
        });
        const blob = new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', 'user_bulk_upload_template.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
        return true;
    } catch (error) {
        throw error.response?.data || error.message || error;
    }
};

export const validateUserBulkUpload = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosInstance.post(ApiRoutes.Users.bulkUploadValidate, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message || error;
    }
};

export const bulkUploadUsers = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosInstance.post(ApiRoutes.Users.bulkUpload, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message || error;
    }
};

export const downloadUserErrorFile = async (importId) => {
    try {
        const url = ApiRoutes.Users.bulkUploadErrorFile.replace('{importId}', importId);
        const response = await axiosInstance.get(url, {
            responseType: 'blob'
        });
        const blob = new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `user_bulk_upload_errors_${importId}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
        return true;
    } catch (error) {
        throw error.response?.data || error.message || error;
    }
};


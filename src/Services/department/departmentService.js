import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

const createDepartment = async ({
    name,
    code,
    description,
    active = true
} = {}) => {
    try {
        const payload = {
            name,
            code,
            description,
            active
        };
        const response = await axiosInstance.post(ApiRoutes.Department.create, payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message || error;
    }
};

const getAllDepartments = async ({
    page = 0,
    size = 10,
    sortBy = "name",
    sortDirection = "ASC",
    active,
    search = ""
} = {}) => {
    try {
        const params = {
            page,
            size,
            sortBy,
            sortDirection: sortDirection ? sortDirection.toUpperCase() : "ASC"
        };

        if (search !== undefined && search !== null && search.trim() !== "") {
            params.search = search.trim();
        }

        if (active !== undefined && active !== null && active !== "" && active !== "ALL") {
            params.active = active;
        }

        const response = await axiosInstance.get(ApiRoutes.Department.getAll, { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message || error;
    }
};

const getDepartmentById = async (id) => {
    try {
        if (!id) throw new Error("Department ID (UUID) is required");
        const response = await axiosInstance.get(ApiRoutes.Department.getDetailsById.replace('{id}', id));
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message || error;
    }
};

const updateDepartment = async (id, {
    name,
    code,
    description,
    active = true
} = {}) => {
    try {
        if (!id) throw new Error("Department ID (UUID) is required");
        const payload = {
            name,
            code,
            description,
            active
        };
        const response = await axiosInstance.put(ApiRoutes.Department.update.replace('{id}', id), payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message || error;
    }
};

const deleteDepartment = async (id) => {
    try {
        if (!id) throw new Error("Department ID (UUID) is required");
        const response = await axiosInstance.delete(ApiRoutes.Department.delete.replace('{id}', id));
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message || error;
    }
};

const toggleDepartmentStatus = async (id) => {
    try {
        if (!id) throw new Error("Department ID (UUID) is required");
        const response = await axiosInstance.put(ApiRoutes.Department.toggle.replace('{id}', id));
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message || error;
    }
};

const getDepartmentUsers = async (id) => {
    try {
        if (!id) throw new Error("Department ID (UUID) is required");
        const response = await axiosInstance.get(ApiRoutes.Department.getUsers.replace('{id}', id));
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message || error;
    }
};

const getDepartmentHods = async (id) => {
    try {
        if (!id) throw new Error("Department ID (UUID) is required");
        const response = await axiosInstance.get(ApiRoutes.Department.getHods.replace('{id}', id));
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message || error;
    }
};

const getDepartmentCounsellors = async (id) => {
    try {
        if (!id) throw new Error("Department ID (UUID) is required");
        const response = await axiosInstance.get(ApiRoutes.Department.getCounsellors.replace('{id}', id));
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message || error;
    }
};

const downloadDepartmentTemplate = async () => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Department.bulkUploadTemplate, {
            responseType: 'blob'
        });
        const blob = new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', 'department_bulk_upload_template.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
        return true;
    } catch (error) {
        throw error.response?.data || error.message || error;
    }
};

const validateDepartmentBulkUpload = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosInstance.post(ApiRoutes.Department.bulkUploadValidate, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message || error;
    }
};

const bulkUploadDepartments = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosInstance.post(ApiRoutes.Department.bulkUpload, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message || error;
    }
};

const downloadDepartmentErrorFile = async (importId) => {
    try {
        const url = ApiRoutes.Department.bulkUploadErrorFile.replace('{importId}', importId);
        const response = await axiosInstance.get(url, {
            responseType: 'blob'
        });
        const blob = new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `department_bulk_upload_errors_${importId}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
        return true;
    } catch (error) {
        throw error.response?.data || error.message || error;
    }
};

export {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
    toggleDepartmentStatus,
    getDepartmentUsers,
    getDepartmentHods,
    getDepartmentCounsellors,
    downloadDepartmentTemplate,
    validateDepartmentBulkUpload,
    bulkUploadDepartments,
    downloadDepartmentErrorFile
};


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
        const response = await axiosInstance.get(ApiRoutes.Department.getById.replace('{id}', id));
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

export {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
    toggleDepartmentStatus
};


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

export const getCourseCommunicationConfig = async (courseId) => {
    try {
        const response = await axiosInstance.get(
            ApiRoutes.Course.communicationConfig.replace('{courseId}', courseId)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getCourseImages = async (courseId, activeOnly = true) => {
    try {
        const response = await axiosInstance.get(
            ApiRoutes.Course.getImages.replace('{courseId}', courseId),
            {
                params: {
                    activeOnly,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const downloadCourseTemplate = async () => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Course.bulkUploadTemplate, {
            responseType: 'blob'
        });
        const blob = new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', 'course_bulk_upload_template.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
        return true;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const validateCourseBulkUpload = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosInstance.post(ApiRoutes.Course.bulkUploadValidate, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const bulkUploadCourses = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosInstance.post(ApiRoutes.Course.bulkUpload, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const downloadCourseErrorFile = async (importId) => {
    try {
        const url = ApiRoutes.Course.bulkUploadErrorFile.replace('{importId}', importId);
        const response = await axiosInstance.get(url, {
            responseType: 'blob'
        });
        const blob = new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `course_bulk_upload_errors_${importId}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
        return true;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";



export const getCourseImages = async (courseId, activeOnly = true) => {
    try {
        const response = await axiosInstance.get(
            ApiRoutes.Course.getImages.replace("{courseId}", courseId),
            {
                params: { activeOnly },
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// POST /api/courses/{courseId}/images
export const uploadCourseImage = async (courseId, file, { displayName = "", displayOrder = "" } = {}) => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const params = {};
        if (displayName) params.displayName = displayName;
        if (displayOrder !== "") params.displayOrder = displayOrder;

        const response = await axiosInstance.post(
            ApiRoutes.Course.uploadImage.replace("{courseId}", courseId),
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                params,
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};


export const updateCourseImage = async (imageId, { displayName, displayOrder, active } = {}) => {
    try {
        const params = {};
        if (displayName !== undefined) params.displayName = displayName;
        if (displayOrder !== undefined) params.displayOrder = displayOrder;
        if (active !== undefined) params.active = active;

        const response = await axiosInstance.put(
            ApiRoutes.CourseImage.update.replace("{imageId}", imageId),
            null,
            { params }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};


export const deleteCourseImage = async (imageId) => {
    try {
        const response = await axiosInstance.delete(
            ApiRoutes.CourseImage.delete.replace("{imageId}", imageId)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

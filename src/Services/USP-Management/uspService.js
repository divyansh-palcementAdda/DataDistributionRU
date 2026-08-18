import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

// POST /api/courses/{courseId}/usps — Add a USP to a course
export const addUsp = async (courseId, { content, displayOrder, active }) => {
    const url = ApiRoutes.USP.add.replace("{courseId}", courseId);

    const params = { content };
    if (displayOrder !== undefined && displayOrder !== null && displayOrder !== "") {
        params.displayOrder = displayOrder;
    }
    if (active !== undefined) {
        params.active = active;
    }

    const response = await axiosInstance.post(url, null, { params });
    return response.data;
};

// GET /api/courses/{courseId}/usps — Get USPs for a course
export const getUsps = async (courseId, activeOnly) => {
    const url = ApiRoutes.USP.getAll.replace("{courseId}", courseId);

    const params = {};
    if (activeOnly !== undefined) {
        params.activeOnly = activeOnly;
    }

    const response = await axiosInstance.get(url, { params });
    return response.data;
};

// PUT /api/course-usps/{uspId} — Update a course USP
export const updateUsp = async (uspId, { content, displayOrder, active }) => {
    const url = ApiRoutes.USP.update.replace("{uspId}", uspId);

    const params = {};
    if (content !== undefined && content !== null && content !== "") {
        params.content = content;
    }
    if (displayOrder !== undefined && displayOrder !== null && displayOrder !== "") {
        params.displayOrder = displayOrder;
    }
    if (active !== undefined) {
        params.active = active;
    }

    const response = await axiosInstance.put(url, null, { params });
    return response.data;
};

// DELETE /api/course-usps/{uspId} — Delete a course USP
export const deleteUsp = async (uspId) => {
    const url = ApiRoutes.USP.delete.replace("{uspId}", uspId);
    const response = await axiosInstance.delete(url);
    return response.data;
};

import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

// GET /api/courses/{courseId}/communication-config
export const getCommunicationConfig = async (courseId) => {
    const url = ApiRoutes.Course.communicationConfig.replace("{courseId}", courseId);
    const response = await axiosInstance.get(url);
    return response.data;
};

// PUT /api/courses/{courseId}/communication-config
export const updateCommunicationConfig = async (courseId, data) => {
    /**
     * Expected request body shape:
     * {
     *   id: string (uuid),
     *   courseId: string (uuid),
     *   infoPanelTemplate: {
     *     id, name, subject, content, channel,
     *     course: { id, courseName, courseCode, status, courseType: { id, name, description, status, createdAt, updatedAt } },
     *     active, createdAt, updatedAt
     *   },
     *   emailTemplate: { ...same shape as infoPanelTemplate },
     *   whatsappTemplate: { ...same shape as infoPanelTemplate },
     *   infoPanelImage: { id, courseId, imageUrl, displayName, displayOrder, active, createdAt, updatedAt },
     *   emailImage: { ...same shape as infoPanelImage },
     *   whatsappImage: { ...same shape as infoPanelImage },
     *   infoPanelTemplateId: string (uuid),
     *   emailTemplateId: string (uuid),
     *   whatsappTemplateId: string (uuid),
     *   infoPanelImageId: string (uuid),
     *   emailImageId: string (uuid),
     *   whatsappImageId: string (uuid)
     * }
     */
    const url = ApiRoutes.Course.communicationConfig.replace("{courseId}", courseId);
    const response = await axiosInstance.put(url, data);
    return response.data;
};

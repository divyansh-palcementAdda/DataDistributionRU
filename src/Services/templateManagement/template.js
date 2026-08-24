import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";


//  use example
//  import { createCourseTemplate } from "../Services/templateManagement/template";

// await createCourseTemplate({
//   name: "Summer Batch",
//   subject: "Welcome",
//   content: "Hello there!",
//   channel: "email",
//   courseId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//   active: true,
// });

// GET /api/course-templates — Get all course templates
export const getAllCourseTemplates = async () => {
    const response = await axiosInstance.get(ApiRoutes.CourseTemplate.getAll);
    return response.data;
};

// POST /api/course-templates — Create a new course template
export const createCourseTemplate = async (data) => {
    const response = await axiosInstance.post(ApiRoutes.CourseTemplate.create, data);
    return response.data;
};

// GET /api/courses/{courseId}/templates — Get course templates for a specific course
export const getCourseTemplatesByCourseId = async (courseId) => {
    const url = ApiRoutes.CourseTemplate.getByCourseId.replace('{courseId}', courseId);
    const response = await axiosInstance.get(url);
    return response.data;
};

// PUT /api/course-templates/{id} — Update an existing course template
export const updateCourseTemplate = async (id, data) => {
    const url = ApiRoutes.CourseTemplate.update.replace('{id}', id);
    const response = await axiosInstance.put(url, data);
    return response.data;
};

// DELETE /api/course-templates/{id} — Soft delete a course template
export const deleteCourseTemplate = async (id) => {
    const url = ApiRoutes.CourseTemplate.delete.replace('{id}', id);
    const response = await axiosInstance.delete(url);
    return response.data;
};

// GET /api/course-templates/{id} — Get a specific course template by ID
export const getCourseTemplateById = async (id) => {
    const url = ApiRoutes.CourseTemplate.getById.replace('{id}', id);
    const response = await axiosInstance.get(url);
    return response.data;
};




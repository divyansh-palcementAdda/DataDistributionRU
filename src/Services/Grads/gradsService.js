import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

const gradsService = {
  // Create a new grade
  createGrade: async (gradeData) => {
    console.log("Creating grade with data:", gradeData);
    console.log("API route:", ApiRoutes.Grads.create);
    const response = await axiosInstance.post(ApiRoutes.Grads.create, gradeData);
    return response.data;
  },

  // Get all grades with pagination and filters
  getAllGrades: async (params) => {
    console.log("Getting all grades with params:", params);
    console.log("API route:", ApiRoutes.Grads.getAll);
    const response = await axiosInstance.get(ApiRoutes.Grads.getAll, { params });
    return response.data;
  },

  // Get grade by ID
  getGradeById: async (id) => {
    console.log("Getting grade by ID:", id);
    console.log("API route:", ApiRoutes.Grads.getById.replace('{id}', id));
    const response = await axiosInstance.get(ApiRoutes.Grads.getById.replace('{id}', id));
    return response.data;
  },

  // Update grade
  updateGrade: async (id, gradeData) => {
    console.log("Updating grade:", id, gradeData);
    console.log("API route:", ApiRoutes.Grads.update.replace('{id}', id));
    const response = await axiosInstance.put(ApiRoutes.Grads.update.replace('{id}', id), gradeData);
    return response.data;
  },

  // Delete grade
  deleteGrade: async (id) => {
    console.log("Deleting grade:", id);
    console.log("API route:", ApiRoutes.Grads.delete.replace('{id}', id));
    const response = await axiosInstance.delete(ApiRoutes.Grads.delete.replace('{id}', id));
    return response.data;
  },

  // Toggle grade active status
  toggleGradeStatus: async (id) => {
    console.log("Toggling grade status:", id);
    console.log("API route:", ApiRoutes.Grads.toggle.replace('{id}', id));
    const response = await axiosInstance.put(ApiRoutes.Grads.toggle.replace('{id}', id));
    return response.data;
  }
};

export default gradsService;
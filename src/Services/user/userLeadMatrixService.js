import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

export const getCourseLeadMatrix = (userId) => {
    return axiosInstance.get(ApiRoutes.Users.courseMatrix.replace('{userId}', userId));
};

export const getProgramLeadMatrix = (userId) => {
    return axiosInstance.get(ApiRoutes.Users.programMatrix.replace('{userId}', userId));
};

import axiosInstance from "../../axiosInstance/axios";

export const logout = async () => {
  try {
    const response = await axiosInstance.post('/api/auth/logout');
    return response;
  } catch (error) {
    return error;
  }
};
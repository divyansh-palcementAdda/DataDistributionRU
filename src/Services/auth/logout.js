import axiosInstance from "../../axiosInstance/axios";
import Cookies from "js-cookie";

export const logout = async () => {
  try {
    const refreshToken = Cookies.get('refreshToken');
    const response = await axiosInstance.post('/api/auth/logout', { refreshToken });
    return response;
  } catch (error) {
    return error;
  }
};
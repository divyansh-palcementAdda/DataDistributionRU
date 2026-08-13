import axiosInstance from "../../axiosInstance/axios";
import ApiRoutes from "../../apiRoutes/allApiRoutes";

const createBoard = async (boardData) => {
    try {
        const response = await axiosInstance.post(ApiRoutes.Boards.create, boardData);
        return response.data;
    } catch (error) {
        return error;
    }
};

const getAllBoards = async (params) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Boards.getAll, { params });
        return response.data;
    } catch (error) {
        return error;
    }
};

const getBoardById = async (id) => {
    try {
        const response = await axiosInstance.get(ApiRoutes.Boards.getById.replace('{id}', id));
        return response.data;
    } catch (error) {
        return error;
    }
};

const updateBoard = async (id, boardData) => {
    try {
        const response = await axiosInstance.put(ApiRoutes.Boards.update.replace('{id}', id), boardData);
        return response.data;
    } catch (error) {
        return error;
    }
};

const deleteBoard = async (id) => {
    try {
        const response = await axiosInstance.delete(ApiRoutes.Boards.delete.replace('{id}', id));
        return response.data;
    } catch (error) {
        return error;
    }
};

const toggleBoardStatus = async (id) => {
    try {
        const response = await axiosInstance.put(ApiRoutes.Boards.toggle.replace('{id}', id));
        return response.data;
    } catch (error) {
        return error;
    }
};

export {
    createBoard,
    getAllBoards,
    getBoardById,
    updateBoard,
    deleteBoard,
    toggleBoardStatus
};

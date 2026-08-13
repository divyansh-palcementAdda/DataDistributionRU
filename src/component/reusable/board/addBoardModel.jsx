import React, { useState, useEffect } from "react";
import CustomButton from "../CustomButton";
import CustomInput from "../CustomInput";
import Toggle from "../custumToggle";
import { toast } from "react-toastify";
import { createBoard, updateBoard } from "../../../Services/Boards/boardsService";

const AddBoardModal = ({
    isOpen,
    onClose,
    onSubmit,
    isLoading = false,
    initialData = null,
}) => {
    const [formData, setFormData] = useState({
        boardName: "",
        boardCode: "",
        description: "",
        status: "ACTIVE",
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    boardName: initialData.name || initialData.boardName || "",
                    boardCode: initialData.code || initialData.boardCode || "",
                    description: initialData.description || "",
                    status: initialData.status || (initialData.active ? "ACTIVE" : "INACTIVE") || "ACTIVE",
                });
            } else {
                setFormData({
                    boardName: "",
                    boardCode: "",
                    description: "",
                    status: "ACTIVE",
                });
            }

            setErrors({});
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.boardName.trim())
            newErrors.boardName = "Board name is required";

        if (!formData.boardCode.trim())
            newErrors.boardCode = "Board code is required";

        if (!formData.description.trim())
            newErrors.description = "Description is required";

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validate()) {
            try {
                setIsSubmitting(true);

                const payload = {
                    name: formData.boardName,
                    code: formData.boardCode,
                    description: formData.description,
                    active: formData.status === "ACTIVE",
                    displayOrder: 1073741824
                };

                if (initialData?.id) {
                    const response = await updateBoard(initialData.id, payload);
                    if (response.success) {
                        toast.success("Board updated successfully!");
                        onSubmit(payload);
                    } else {
                        toast.error(response.message || "Failed to update board");
                    }
                } else {
                    const response = await createBoard(payload);
                    if (response.success) {
                        toast.success("Board created successfully!");
                        onSubmit(payload);
                    } else {
                        toast.error(response.message || "Failed to create board");
                    }
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || "Something went wrong";
                toast.error(errorMessage);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col relative z-[111]">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 flex-shrink-0">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                        <svg
                            width="22"
                            height="22"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-orange-600"
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 6v12M6 12h12" />
                        </svg>

                        {initialData ? "Edit Board" : "Add New Board"}
                    </div>

                    <button
                        onClick={onClose}
                        disabled={isLoading || isSubmitting}
                        className="p-2 rounded-lg hover:bg-gray-100"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <form
                    id="boardForm"
                    onSubmit={handleSubmit}
                    className="p-6 space-y-4 overflow-y-auto flex-grow"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <CustomInput
                            label="Board Name"
                            name="boardName"
                            value={formData.boardName}
                            onChange={handleChange}
                            placeholder="Enter board name"
                            error={errors.boardName}
                        />

                        <CustomInput
                            label="Board Code"
                            name="boardCode"
                            value={formData.boardCode}
                            onChange={handleChange}
                            placeholder="Enter board code"
                            error={errors.boardCode}
                        />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700">
                            Description
                        </label>

                        <textarea
                            rows={4}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter description"
                            className={`px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.description
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300"
                                }`}
                        />

                        {errors.description && (
                            <span className="text-xs text-red-500">
                                {errors.description}
                            </span>
                        )}
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700">
                            Status
                        </label>

                        <div className="flex items-center gap-3">
                            <Toggle
                                checked={formData.status === "ACTIVE"}
                                onChange={() =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        status:
                                            prev.status === "ACTIVE"
                                                ? "INACTIVE"
                                                : "ACTIVE",
                                    }))
                                }
                            />

                            <span
                                className={`text-sm font-medium ${formData.status === "ACTIVE"
                                    ? "text-green-600"
                                    : "text-gray-500"
                                    }`}
                            >
                                {formData.status === "ACTIVE"
                                    ? "Active"
                                    : "Inactive"}
                            </span>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3 flex-shrink-0">
                    <CustomButton
                        variant="secondary"
                        onClick={onClose}
                        disabled={isLoading || isSubmitting}
                    >
                        Cancel
                    </CustomButton>

                    <CustomButton
                        type="submit"
                        form="boardForm"
                        variant="primary"
                        disabled={isLoading || isSubmitting}
                    >
                        {isSubmitting || isLoading
                            ? "Saving..."
                            : "Save Board"}
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

export default AddBoardModal;

import React, { useState, useEffect } from "react";
import CustomButton from "../CustomButton";
import CustomInput from "../CustomInput";
import Toggle from "../custumToggle";
import { toast } from "react-toastify";
import { createStream, updateStream } from "../../../Services/streams/streamService";

const AddStreamModal = ({
    isOpen,
    onClose,
    onSubmit,
    isLoading = false,
    initialData = null,
}) => {
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        description: "",
        status: "ACTIVE",
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name || "",
                    code: initialData.code || "",
                    description: initialData.description || "",
                    status: initialData.status || (initialData.active ? "ACTIVE" : "INACTIVE") || "ACTIVE",
                });
            } else {
                setFormData({
                    name: "",
                    code: "",
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
        if (!formData.name.trim()) {
            newErrors.name = "Stream name is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validate()) {
            try {
                setIsSubmitting(true);

                const payload = {
                    name: formData.name.trim(),
                    code: formData.code.trim() ? formData.code.trim().toUpperCase() : null,
                    description: formData.description.trim() || null,
                    active: formData.status === "ACTIVE",
                    displayOrder: initialData?.displayOrder ?? 0,
                };

                if (initialData?.id) {
                    const response = await updateStream(initialData.id, payload);
                    if (response.success || response.data) {
                        toast.success("Stream updated successfully!");
                        onSubmit(response.data || payload);
                    } else {
                        toast.error(response.message || "Failed to update stream");
                    }
                } else {
                    const response = await createStream(payload);
                    if (response.success || response.data) {
                        toast.success("Stream created successfully!");
                        onSubmit(response.data || payload);
                    } else {
                        toast.error(response.message || "Failed to create stream");
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
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col relative z-[111]">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 flex-shrink-0">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                        <svg
                            width="22"
                            height="22"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-indigo-600"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {initialData ? "Edit Stream" : "Add New Stream"}
                    </div>

                    <button
                        onClick={onClose}
                        disabled={isLoading || isSubmitting}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    <form id="streamForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <CustomInput
                            label="Stream Name *"
                            name="name"
                            placeholder="e.g. Science, Commerce, Arts"
                            value={formData.name}
                            onChange={handleChange}
                            error={errors.name}
                        />

                        <CustomInput
                            label="Stream Code"
                            name="code"
                            placeholder="e.g. SCI, COM, ART"
                            value={formData.code}
                            onChange={handleChange}
                            error={errors.code}
                        />

                        <div className="flex flex-col gap-1.5 w-full">
                            <label className="text-sm font-semibold text-gray-700">Description</label>
                            <textarea
                                name="description"
                                placeholder="Enter stream description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="px-4 py-2 border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none border-gray-300 bg-white text-sm"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 w-full">
                            <label className="text-sm font-semibold text-gray-700">Status</label>
                            <div className="flex items-center gap-3 mt-1">
                                <Toggle
                                    checked={formData.status === "ACTIVE"}
                                    onChange={() => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            status: prev.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                                        }));
                                    }}
                                />
                                <span className={`text-sm font-medium ${formData.status === "ACTIVE" ? "text-green-600" : "text-gray-500"}`}>
                                    {formData.status === "ACTIVE" ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 flex-shrink-0">
                    <CustomButton
                        variant="secondary"
                        onClick={onClose}
                        disabled={isLoading || isSubmitting}
                    >
                        Cancel
                    </CustomButton>
                    <CustomButton
                        type="submit"
                        form="streamForm"
                        variant="primary"
                        disabled={isLoading || isSubmitting}
                    >
                        {isSubmitting || isLoading ? "Saving..." : initialData ? "Update Stream" : "Save Stream"}
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

export default AddStreamModal;

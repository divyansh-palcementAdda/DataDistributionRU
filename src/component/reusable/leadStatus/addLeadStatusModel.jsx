import React, { useState, useEffect } from "react";
import CustomButton from "../CustomButton.jsx";
import CustomInput from "../CustomInput.jsx";
import Toggle from "../custumToggle.jsx";
import { toast } from "react-toastify";
import { createLeadStatus, updateLeadStatus } from "../../../Services/leadStatus/leadStatusService.js";

const AddLeadStatusModal = ({
    isOpen,
    onClose,
    onSubmit,
    isLoading = false,
    initialData = null,
}) => {
    const [formData, setFormData] = useState({
        statusName: "",
        description: "",
        color: "#3B82F6",
        status: "ACTIVE",
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    statusName: initialData.statusName || "",
                    description: initialData.description || "",
                    color: initialData.color || "#3B82F6",
                    status: initialData.status || "ACTIVE",
                });
            } else {
                setFormData({
                    statusName: "",
                    description: "",
                    color: "#3B82F6",
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

    const handleColorChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            color: e.target.value,
        }));
    };

    const handleStatusToggle = () => {
        setFormData((prev) => ({
            ...prev,
            status: prev.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.statusName.trim())
            newErrors.statusName = "Status name is required";

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
                    ...formData,
                };

                if (initialData?.id) {
                    await updateLeadStatus(initialData.id, payload);
                    toast.success("Lead status updated successfully!");
                } else {
                    await createLeadStatus(payload);
                    toast.success("Lead status created successfully!");
                }

                onSubmit(payload);
            } catch (error) {
                toast.error(error.message || "Something went wrong");
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
                            className="text-blue-600"
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 6v12M6 12h12" />
                        </svg>

                        {initialData ? "Edit Lead Status" : "Add New Lead Status"}
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
                    id="leadStatusForm"
                    onSubmit={handleSubmit}
                    className="p-6 space-y-4 overflow-y-auto flex-grow"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <CustomInput
                            label="Status Name"
                            name="statusName"
                            value={formData.statusName}
                            onChange={handleChange}
                            placeholder="Enter status name (e.g., Connected, Not Connected)"
                            error={errors.statusName}
                        />

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">
                                Color
                            </label>

                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleColorChange}
                                    className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                                />
                                <input
                                    type="text"
                                    value={formData.color}
                                    onChange={handleColorChange}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="#3B82F6"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <CustomInput
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter description for this lead status"
                                error={errors.description}
                            />
                        </div>

                        <div className="md:col-span-2 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <div className="text-sm font-semibold text-gray-700">
                                    Status
                                </div>
                                <div className="text-xs text-gray-500">
                                    {formData.status === "ACTIVE" ? "Active - This status is available for use" : "Inactive - This status is disabled"}
                                </div>
                            </div>
                            <Toggle
                                checked={formData.status === "ACTIVE"}
                                onChange={handleStatusToggle}
                            />
                        </div>

                    </div>
                </form>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
                    <CustomButton
                        variant="secondary"
                        onClick={onClose}
                        disabled={isLoading || isSubmitting}
                    >
                        Cancel
                    </CustomButton>
                    <CustomButton
                        type="submit"
                        form="leadStatusForm"
                        variant="primary"
                        disabled={isLoading || isSubmitting}
                    >
                        {isSubmitting ? "Saving..." : initialData ? "Update Status" : "Create Status"}
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

export default AddLeadStatusModal;

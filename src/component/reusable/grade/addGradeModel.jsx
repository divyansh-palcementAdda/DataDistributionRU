import React, { useState, useEffect } from "react";
import CustomButton from "../CustomButton";
import CustomInput from "../CustomInput";
import Toggle from "../custumToggle";
import { toast } from "react-toastify";
import gradsService from "../../../Services/Grads/gradsService";

const AddGradeModal = ({
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
        active: true,
        displayOrder: 1073741824,
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name || initialData.gradeName || "",
                    code: initialData.code || initialData.gradeCode || "",
                    description: initialData.description || "",
                    active: initialData.active !== undefined ? initialData.active : (initialData.status === "ACTIVE" || initialData.status === true),
                    displayOrder: initialData.displayOrder || 1073741824,
                });
            } else {
                setFormData({
                    name: "",
                    code: "",
                    description: "",
                    active: true,
                    displayOrder: 1073741824,
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

        if (!formData.name.trim())
            newErrors.name = "Grade name is required";

        if (!formData.code.trim())
            newErrors.code = "Grade code is required";

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
                    name: formData.name,
                    code: formData.code,
                    description: formData.description,
                    active: formData.active,
                    displayOrder: formData.displayOrder,
                };

                if (initialData?.id) {
                    await gradsService.updateGrade(initialData.id, payload);
                    toast.success("Grade updated successfully!");
                } else {
                    await gradsService.createGrade(payload);
                    toast.success("Grade created successfully!");
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
                            className="text-emerald-600"
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 6v12M6 12h12" />
                        </svg>

                        {initialData ? "Edit Grade" : "Add New Grade"}
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
                    id="gradeForm"
                    onSubmit={handleSubmit}
                    className="p-6 space-y-4 overflow-y-auto flex-grow"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <CustomInput
                            label="Grade Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter grade name"
                            error={errors.name}
                        />

                        <CustomInput
                            label="Grade Code"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="Enter grade code"
                            error={errors.code}
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
                            className={`px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.description
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
                                checked={formData.active}
                                onChange={() =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        active: !prev.active,
                                    }))
                                }
                            />

                            <span
                                className={`text-sm font-medium ${formData.active
                                    ? "text-green-600"
                                    : "text-gray-500"
                                    }`}
                            >
                                {formData.active ? "Active" : "Inactive"}
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
                        form="gradeForm"
                        variant="primary"
                        disabled={isLoading || isSubmitting}
                    >
                        {isSubmitting || isLoading
                            ? "Saving..."
                            : "Save Grade"}
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

export default AddGradeModal;

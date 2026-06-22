import React, { useState, useEffect } from "react";
import CustomButton from "../CustomButton";
import CustomInput from "../CustomInput";
import Toggle from "../custumToggle";
import { toast } from "react-toastify";
import { createCourse, updateCourse } from "../../../Services/course/course";
import { getActiveCourseTypes } from "../../../Services/courseTypes/courseTypeService";

const AddCourseModal = ({
    isOpen,
    onClose,
    onSubmit,
    isLoading = false,
    initialData = null,
}) => {
    const [formData, setFormData] = useState({
        courseName: "",
        courseCode: "",
        description: "",
        duration: "",
        durationUnit: "",
        fees: "",
        courseTypeId: "",
        status: "ACTIVE",
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeCourseTypes, setActiveCourseTypes] = useState([]);

    useEffect(() => {
        if (isOpen) {
            const fetchCourseTypes = async () => {
                try {
                    const res = await getActiveCourseTypes();
                    let data = [];
                    if (res?.success && res?.data) {
                        data = res.data.content || res.data || [];
                    } else {
                        data = res?.content || res?.data || res || [];
                    }
                    setActiveCourseTypes(Array.isArray(data) ? data : []);
                } catch (error) {
                    console.error("Failed to fetch course types", error);
                    toast.error("Failed to load course types");
                }
            };
            fetchCourseTypes();

            if (initialData) {
                setFormData({
                    courseName: initialData.courseName || "",
                    courseCode: initialData.courseCode || "",
                    description: initialData.description || "",
                    duration: initialData.duration || "",
                    durationUnit: initialData.durationUnit || "",
                    fees: initialData.fees || "",
                    courseTypeId: initialData.courseTypeId || "",
                    status: initialData.status || "ACTIVE",
                });
            } else {
                setFormData({
                    courseName: "",
                    courseCode: "",
                    description: "",
                    duration: "",
                    durationUnit: "",
                    fees: "",
                    courseTypeId: "",
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

        if (!formData.courseName.trim())
            newErrors.courseName = "Course name is required";

        if (!formData.courseCode.trim())
            newErrors.courseCode = "Course code is required";

        if (!formData.description.trim())
            newErrors.description = "Description is required";

        if (!formData.duration)
            newErrors.duration = "Duration is required";

        if (!formData.durationUnit.trim())
            newErrors.durationUnit = "Duration unit is required";

        if (!formData.fees)
            newErrors.fees = "Fees is required";

        if (!formData.courseTypeId.trim())
            newErrors.courseTypeId = "Course type is required";

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
                    duration: Number(formData.duration),
                    fees: Number(formData.fees),
                };

                if (initialData?.id) {
                    await updateCourse(initialData.id, payload);
                    toast.success("Course updated successfully!");
                } else {
                    await createCourse(payload);
                    toast.success("Course created successfully!");
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">

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

                        {initialData ? "Edit Course" : "Add New Course"}
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
                    id="courseForm"
                    onSubmit={handleSubmit}
                    className="p-6 space-y-4 overflow-y-auto flex-grow"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <CustomInput
                            label="Course Name"
                            name="courseName"
                            value={formData.courseName}
                            onChange={handleChange}
                            placeholder="Enter course name"
                            error={errors.courseName}
                        />

                        <CustomInput
                            label="Course Code"
                            name="courseCode"
                            value={formData.courseCode}
                            onChange={handleChange}
                            placeholder="Enter course code"
                            error={errors.courseCode}
                        />

                        <CustomInput
                            label="Duration"
                            type="number"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            placeholder="Enter duration"
                            error={errors.duration}
                        />

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">
                                Duration Unit
                            </label>

                            <select
                                name="durationUnit"
                                value={formData.durationUnit}
                                onChange={handleChange}
                                className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.durationUnit
                                    ? "border-red-500"
                                    : "border-gray-300"
                                    }`}
                            >
                                <option value="">Select Unit</option>
                                <option value="DAY">Day</option>
                                <option value="MONTH">Month</option>
                                <option value="YEAR">Year</option>
                            </select>

                            {errors.durationUnit && (
                                <span className="text-xs text-red-500">
                                    {errors.durationUnit}
                                </span>
                            )}
                        </div>

                        <CustomInput
                            label="Fees"
                            type="number"
                            step="0.01"
                            name="fees"
                            value={formData.fees}
                            onChange={handleChange}
                            placeholder="Enter fees"
                            error={errors.fees}
                        />

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">
                                Course Type
                            </label>

                            <select
                                name="courseTypeId"
                                value={formData.courseTypeId}
                                onChange={handleChange}
                                className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.courseTypeId
                                    ? "border-red-500"
                                    : "border-gray-300"
                                    }`}
                            >
                                <option value="">Select Course Type</option>
                                {activeCourseTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>

                            {errors.courseTypeId && (
                                <span className="text-xs text-red-500">
                                    {errors.courseTypeId}
                                </span>
                            )}
                        </div>
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
                            className={`px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description
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
                        form="courseForm"
                        variant="primary"
                        disabled={isLoading || isSubmitting}
                    >
                        {isSubmitting || isLoading
                            ? "Saving..."
                            : "Save Course"}
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

export default AddCourseModal;
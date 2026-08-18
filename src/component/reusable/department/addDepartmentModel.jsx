import React, { useState, useEffect } from "react";
import CustomButton from "../CustomButton";
import CustomInput from "../CustomInput";
import Toggle from "../custumToggle";
import { toast } from "react-toastify";
import { createDepartment, updateDepartment } from "../../../Services/department/departmentService";

const AddDepartmentModal = ({
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
                    status: initialData.active !== undefined 
                        ? (initialData.active ? "ACTIVE" : "INACTIVE") 
                        : (initialData.status || "ACTIVE"),
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
            [name]: name === "code" ? value.toUpperCase() : value,
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

        if (!formData.name.trim()) newErrors.name = "Department name is required";
        if (!formData.code.trim()) newErrors.code = "Department code is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";

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
                    code: formData.code.trim().toUpperCase(),
                    description: formData.description.trim(),
                    active: formData.status === "ACTIVE",
                };

                if (initialData?.id) {
                    const response = await updateDepartment(initialData.id, payload);
                    if (response?.success || response?.status === 200 || !response?.isAxiosError) {
                        toast.success("Department updated successfully!");
                        onSubmit({ ...initialData, ...payload });
                    } else {
                        toast.error(response?.message || "Failed to update department");
                    }
                } else {
                    const response = await createDepartment(payload);
                    if (response?.success || response?.status === 200 || !response?.isAxiosError) {
                        toast.success("Department created successfully!");
                        onSubmit(payload);
                    } else {
                        toast.error(response?.message || "Failed to create department");
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
        <div 
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 110,
                padding: '16px'
            }}
        >
            <div 
                style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                    width: '100%',
                    maxWidth: '560px',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    zIndex: 111,
                    overflow: 'hidden',
                    border: '1px solid #E2E8F0'
                }}
            >
                {/* Header */}
                <div 
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #F1F5F9',
                        padding: '16px 24px',
                        backgroundColor: '#F8FAFC'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>
                        <svg
                            width="20"
                            height="20"
                            fill="none"
                            stroke="#2563EB"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <rect x="4" y="2" width="16" height="20" rx="2" />
                            <path d="M9 22v-4h6v4" />
                            <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
                        </svg>
                        <span>{initialData ? "Edit Department" : "Add New Department"}</span>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading || isSubmitting}
                        style={{
                            border: 'none',
                            background: 'none',
                            padding: '6px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: '#64748B',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Body Form */}
                <form
                    id="departmentForm"
                    onSubmit={handleSubmit}
                    style={{
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        overflowY: 'auto',
                        flexGrow: 1
                    }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <CustomInput
                            label="Department Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Admissions"
                            error={errors.name}
                        />

                        <CustomInput
                            label="Department Code"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="e.g. ADM"
                            error={errors.code}
                        />
                    </div>

                    {/* Description */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                            Description
                        </label>
                        <textarea
                            rows={4}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter department scope & responsibilities"
                            style={{
                                padding: '10px 14px',
                                border: errors.description ? '1px solid #EF4444' : '1px solid #CBD5E1',
                                backgroundColor: errors.description ? '#FEF2F2' : '#FFFFFF',
                                borderRadius: '8px',
                                resize: 'vertical',
                                fontSize: '13px',
                                outline: 'none',
                                fontFamily: 'inherit'
                            }}
                        />
                        {errors.description && (
                            <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '2px' }}>
                                {errors.description}
                            </span>
                        )}
                    </div>

                    {/* Status Toggle */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                            Status
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Toggle
                                checked={formData.status === "ACTIVE"}
                                onChange={() =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        status: prev.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                                    }))
                                }
                            />
                            <span
                                style={{
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: formData.status === "ACTIVE" ? '#16A34A' : '#64748B'
                                }}
                            >
                                {formData.status === "ACTIVE" ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div 
                    style={{
                        borderTop: '1px solid #F1F5F9',
                        padding: '16px 24px',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        backgroundColor: '#F8FAFC'
                    }}
                >
                    <CustomButton
                        variant="secondary"
                        onClick={onClose}
                        disabled={isLoading || isSubmitting}
                    >
                        Cancel
                    </CustomButton>

                    <CustomButton
                        type="submit"
                        form="departmentForm"
                        variant="primary"
                        disabled={isLoading || isSubmitting}
                    >
                        {isSubmitting || isLoading ? "Saving..." : initialData ? "Update Department" : "Save Department"}
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

export default AddDepartmentModal;

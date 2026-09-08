import React, { useState, useEffect } from "react";
import { getFollowupLeadStatusesDropdown } from "../../../Services/drop-down/dropDownService";

const ScheduleModal = ({ isOpen, onClose, onSubmit }) => {
    const todayStr = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        followUpDate: "",
        remarks: "",
        leadStatus: "",
        leadStatusCode: "",
    });
    const [errors, setErrors] = useState({});
    const [leadStatuses, setLeadStatuses] = useState([]);

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const leadStatusesResponse = await getFollowupLeadStatusesDropdown();
                setLeadStatuses(leadStatusesResponse?.data || []);
            } catch (error) {
                console.error("Error fetching dropdowns:", error);
                setLeadStatuses([]);
            }
        };

        if (isOpen) {
            fetchDropdowns();
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Clear error for the field being changed
        setErrors(prev => ({
            ...prev,
            [name]: ""
        }));

        if (name === "leadStatus") {
            const selectedStatus = leadStatuses.find(status => status.id === value);
            setFormData((prev) => ({
                ...prev,
                [name]: value,
                leadStatusCode: selectedStatus?.code || "",
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSave = async () => {
        // Validation
        const newErrors = {};
        if (!formData.followUpDate) {
            newErrors.followUpDate = "Follow Up Date is required";
        } else if (formData.followUpDate < todayStr) {
            newErrors.followUpDate = "Follow Up Date cannot be in the past";
        }

        if (!formData.remarks?.trim()) {
            newErrors.remarks = "Remarks is required";
        }
        if (!formData.leadStatus) {
            newErrors.leadStatus = "Lead Status is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const payload = {
            ...formData,
            followUpDate: formData.followUpDate
                ? new Date(formData.followUpDate).toISOString()
                : "",
        };

        const success = await onSubmit(payload);

        if (success) {
            setFormData({
                followUpDate: "",
                remarks: "",
                leadStatus: "",
                leadStatusCode: "",
            });
            setErrors({});

            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-5">
                    <h2 className="text-xl font-semibold">
                        Schedule Follow Up
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-2xl text-gray-500 hover:text-red-500"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-4 p-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Follow Up Date <span className="text-red-500">*</span>
                        </label>

                        <div 
                            className={`w-full rounded-lg border px-3 py-2 cursor-pointer ${errors.followUpDate ? 'border-red-500' : 'border-gray-300'}`}
                            onClick={() => document.querySelector('input[name="followUpDate"]').showPicker?.() || document.querySelector('input[name="followUpDate"]').focus()}
                        >
                            <input
                                type="date"
                                name="followUpDate"
                                min={todayStr}
                                value={formData.followUpDate}
                                onChange={handleChange}
                                className="w-full outline-none cursor-pointer"
                                style={{ border: 'none', background: 'transparent' }}
                            />
                        </div>
                        {errors.followUpDate && <p className="mt-1 text-sm text-red-500">{errors.followUpDate}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Remarks <span className="text-red-500">*</span>
                        </label>

                        <textarea
                            rows={4}
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            placeholder="Enter remarks"
                            className={`w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500 ${errors.remarks ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.remarks && <p className="mt-1 text-sm text-red-500">{errors.remarks}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Lead Status <span className="text-red-500">*</span>
                        </label>

                        <select
                            name="leadStatus"
                            value={formData.leadStatus}
                            onChange={handleChange}
                            className={`w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500 ${errors.leadStatus ? 'border-red-500' : 'border-gray-300'}`}
                        >
                            <option value="">Select Lead Status</option>
                            {leadStatuses.map((status) => (
                                <option key={status.id} value={status.id}>
                                    {status.name}
                                </option>
                            ))}
                        </select>
                        {errors.leadStatus && <p className="mt-1 text-sm text-red-500">{errors.leadStatus}</p>}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t p-5">
                    <button
                        onClick={onClose}
                        className="rounded-lg border px-4 py-2 hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleModal;

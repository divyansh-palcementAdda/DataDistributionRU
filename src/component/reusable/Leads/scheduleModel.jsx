import React, { useState, useEffect } from "react";
import { getLeadStatusesDropdown } from "../../../Services/drop-down/dropDownService";

const ScheduleModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        followUpDate: "",
        remarks: "",
        status: "PENDING",
        leadStatus: "",
        leadStatusCode: "",
    });
    const [leadStatuses, setLeadStatuses] = useState([]);
    
    const allowedLeadStatuses = [
        "Form Follow-Up",
        "Counseling Follow-Up", 
        "Registered",
        "Form Not Interested",
        "Continuous Form Follow-Up",
        "Continuous Follow-Up",
        "Interested Follow-Up",
        "Go To Form Follow-Up",
        "Counseling Not Interested"
    ];

    useEffect(() => {
        const fetchLeadStatuses = async () => {
            try {
                const response = await getLeadStatusesDropdown();
                const allStatuses = response?.data || [];
                console.log("All statuses from API:", allStatuses.map(s => s.name));
                console.log("Allowed statuses:", allowedLeadStatuses);
                
                const filteredStatuses = allStatuses.filter(status => 
                    allowedLeadStatuses.some(allowed => 
                        allowed.toLowerCase() === status.name.toLowerCase()
                    )
                );
                console.log("Filtered statuses:", filteredStatuses.map(s => s.name));
                setLeadStatuses(filteredStatuses);
            } catch (error) {
                console.error("Error fetching lead statuses:", error);
                setLeadStatuses([]);
            }
        };

        if (isOpen) {
            fetchLeadStatuses();
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;

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
        const payload = {
            ...formData,
            followUpDate: formData.followUpDate
                ? new Date(formData.followUpDate).toISOString()
                : "",
        };

        await onSubmit(payload);

        setFormData({
            followUpDate: "",
            remarks: "",
            status: "PENDING",
            leadStatus: "",
            leadStatusCode: "",
        });

        onClose();
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
                            Follow Up Date
                        </label>

                        <input
                            type="date"
                            name="followUpDate"
                            value={formData.followUpDate}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Remarks
                        </label>

                        <textarea
                            rows={4}
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            placeholder="Enter remarks"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Status
                        </label>

                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                        >
                            <option value="PENDING">PENDING</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Lead Status
                        </label>

                        <select
                            name="leadStatus"
                            value={formData.leadStatus}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                        >
                            <option value="">Select Lead Status</option>
                            {leadStatuses.map((status) => (
                                <option key={status.id} value={status.id}>
                                    {status.name}
                                </option>
                            ))}
                        </select>
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

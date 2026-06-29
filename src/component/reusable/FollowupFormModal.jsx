import React, { useState, useEffect } from 'react';
import CustomInput from './CustomInput';
import CustomButton from './CustomButton';
import { useAppContext } from '../../AppContext';
import { FaUser, FaStickyNote, FaRegCalendarAlt, FaRegClock } from 'react-icons/fa';

const RadioPill = ({ name, value, label, checked, onChange }) => (
    <label
        className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 text-sm font-medium rounded-xl border px-3 py-2.5 cursor-pointer transition-all duration-200 select-none
            ${checked
                ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-100"
                : "border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100"
            }`}
    >
        <input
            type="radio"
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            className="sr-only"
        />
        {label}
    </label>
);

const FollowupFormModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
    const { showToast } = useAppContext();
    const [formData, setFormData] = useState({
        leadId: '',
        status: 'Connected',
        type: 'Call',
        remarks: '',
        nextFollowupDate: '',
        nextFollowupTime: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Reset form when modal opens, potentially with initial data later
            setFormData({
                leadId: initialData?.leadId || '',
                status: initialData?.status || 'Connected',
                type: initialData?.type || 'Call',
                remarks: initialData?.remarks || '',
                nextFollowupDate: initialData?.nextFollowupDate || '',
                nextFollowupTime: initialData?.nextFollowupTime || '',
            });
        }
    }, [isOpen, initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRadioChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.leadId || !formData.remarks) {
            showToast("Please fill in Lead ID and Remarks.", "warning");
            return;
        }
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            showToast("Follow-up submitted successfully!", "success");
            console.log("Form Data Submitted:", formData);
            onSubmit(formData); // Callback to parent
            onClose(); // Close modal on success
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay open">
            <div className="modal" style={{ maxWidth: '600px' }}>
                {/* Header */}
                <div className="modal-header">
                    <h1 className="modal-title">Log a Follow-up</h1>
                    <CustomButton variant="ghost" className="btn-icon" onClick={onClose} disabled={loading}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </CustomButton>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-1">
                    <CustomInput
                        label="Lead ID or Phone Number"
                        name="leadId"
                        value={formData.leadId}
                        onChange={handleChange}
                        placeholder="e.g., LD12345 or 9876543210"
                        required
                        icon={<FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
                    />

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Interaction Type</label>
                        <div className="flex flex-wrap gap-2">
                            <RadioPill name="type" value="Call" label="Call" checked={formData.type === "Call"} onChange={() => handleRadioChange('type', 'Call')} />
                            <RadioPill name="type" value="Email" label="Email" checked={formData.type === "Email"} onChange={() => handleRadioChange('type', 'Email')} />
                            <RadioPill name="type" value="WhatsApp" label="WhatsApp" checked={formData.type === "WhatsApp"} onChange={() => handleRadioChange('type', 'WhatsApp')} />
                            <RadioPill name="type" value="Visit" label="Visit" checked={formData.type === "Visit"} onChange={() => handleRadioChange('type', 'Visit')} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Lead Status</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            <RadioPill name="status" value="Connected" label="Connected" checked={formData.status === "Connected"} onChange={() => handleRadioChange('status', 'Connected')} />
                            <RadioPill name="status" value="Not Connected" label="Not Connected" checked={formData.status === "Not Connected"} onChange={() => handleRadioChange('status', 'Not Connected')} />
                            <RadioPill name="status" value="Interested" label="Interested" checked={formData.status === "Interested"} onChange={() => handleRadioChange('status', 'Interested')} />
                            <RadioPill name="status" value="Not Interested" label="Not Interested" checked={formData.status === "Not Interested"} onChange={() => handleRadioChange('status', 'Not Interested')} />
                            <RadioPill name="status" value="Hot Lead" label="Hot Lead" checked={formData.status === "Hot Lead"} onChange={() => handleRadioChange('status', 'Hot Lead')} />
                            <RadioPill name="status" value="Registered" label="Registered" checked={formData.status === "Registered"} onChange={() => handleRadioChange('status', 'Registered')} />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-700 ml-1 mb-1.5 flex items-center gap-2">
                            <FaStickyNote className="text-gray-500" /> Remarks
                        </label>
                        <textarea
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            placeholder="Enter notes from your conversation..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-base text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300 resize-none"
                            required
                        />
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Schedule Next Follow-up (Optional)</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CustomInput
                                label="Next Follow-up Date"
                                type="date"
                                name="nextFollowupDate"
                                value={formData.nextFollowupDate}
                                onChange={handleChange}
                                icon={<FaRegCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
                            />
                            <CustomInput
                                label="Next Follow-up Time"
                                type="time"
                                name="nextFollowupTime"
                                value={formData.nextFollowupTime}
                                onChange={handleChange}
                                icon={<FaRegClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <CustomButton variant="secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </CustomButton>
                        <CustomButton type="submit" variant="primary" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Follow-up'}
                        </CustomButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FollowupFormModal;
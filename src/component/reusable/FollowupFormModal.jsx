import { useState, useEffect, useCallback } from 'react';
import CustomInput from './CustomInput';
import { useAppContext } from '../../AppContext';
import { FaUser, FaStickyNote, FaRegCalendarAlt, FaRegClock, FaPhoneAlt, FaEnvelope, FaWhatsapp, FaWalking } from 'react-icons/fa';

const RadioPill = ({ name, value, label, icon, checked, onChange }) => (
    <label
        className={`flex-1 min-w-[90px] flex items-center justify-center gap-1.5 text-xs font-semibold rounded-xl border py-2.5 px-3 cursor-pointer transition-all duration-150 select-none ${
            checked
                ? "border-blue-600 bg-blue-50 text-blue-700 shadow-2xs ring-1 ring-blue-500/20"
                : "border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
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
        {icon}
        <span>{label}</span>
    </label>
);

const FollowupFormModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
    const { showToast } = useAppContext();
    const [prevInitialData, setPrevInitialData] = useState(initialData);
    const [formData, setFormData] = useState({
        leadId: initialData?.leadId || '',
        status: initialData?.status || 'Connected',
        type: initialData?.type || 'Call',
        remarks: initialData?.remarks || '',
        nextFollowupDate: initialData?.nextFollowupDate || '',
        nextFollowupTime: initialData?.nextFollowupTime || '',
    });
    const [loading, setLoading] = useState(false);

    // Adjust state when initialData changes (React recommended pattern)
    if (initialData !== prevInitialData) {
        setPrevInitialData(initialData);
        setFormData({
            leadId: initialData?.leadId || '',
            status: initialData?.status || 'Connected',
            type: initialData?.type || 'Call',
            remarks: initialData?.remarks || '',
            nextFollowupDate: initialData?.nextFollowupDate || '',
            nextFollowupTime: initialData?.nextFollowupTime || '',
        });
    }

    const handleClose = useCallback(() => {
        if (loading) return;
        onClose();
    }, [loading, onClose]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen && !loading) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, loading, handleClose]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRadioChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.leadId || !formData.remarks) {
            showToast("Please fill in Lead ID and Remarks.", "warning");
            return;
        }
        setLoading(true);

        try {
            if (onSubmit) {
                await onSubmit(formData);
            }
            showToast("Follow-up submitted successfully!", "success");
            onClose();
        } catch (error) {
            console.error("Failed to submit follow-up:", error);
            showToast("Failed to submit follow-up", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
            onClick={handleClose}
        >
            <div
                className="w-full max-w-md sm:max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 leading-tight">
                                Log Follow-Up
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Record interactions and plan the next callback
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
                        aria-label="Close modal"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col">
                    <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                        <CustomInput
                            label="Lead ID or Phone Number"
                            name="leadId"
                            value={formData.leadId}
                            onChange={handleChange}
                            placeholder="e.g., LD12345 or 9876543210"
                            required
                            icon={<FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
                        />

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Interaction Type
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <RadioPill name="type" value="Call" label="Call" icon={<FaPhoneAlt className="text-xs" />} checked={formData.type === "Call"} onChange={() => handleRadioChange('type', 'Call')} />
                                <RadioPill name="type" value="Email" label="Email" icon={<FaEnvelope className="text-xs" />} checked={formData.type === "Email"} onChange={() => handleRadioChange('type', 'Email')} />
                                <RadioPill name="type" value="WhatsApp" label="WhatsApp" icon={<FaWhatsapp className="text-xs text-emerald-600" />} checked={formData.type === "WhatsApp"} onChange={() => handleRadioChange('type', 'WhatsApp')} />
                                <RadioPill name="type" value="Visit" label="Visit" icon={<FaWalking className="text-xs" />} checked={formData.type === "Visit"} onChange={() => handleRadioChange('type', 'Visit')} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Lead Status
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                <RadioPill name="status" value="Connected" label="Connected" checked={formData.status === "Connected"} onChange={() => handleRadioChange('status', 'Connected')} />
                                <RadioPill name="status" value="Not Connected" label="Not Connected" checked={formData.status === "Not Connected"} onChange={() => handleRadioChange('status', 'Not Connected')} />
                                <RadioPill name="status" value="Interested" label="Interested" checked={formData.status === "Interested"} onChange={() => handleRadioChange('status', 'Interested')} />
                                <RadioPill name="status" value="Not Interested" label="Not Interested" checked={formData.status === "Not Interested"} onChange={() => handleRadioChange('status', 'Not Interested')} />
                                <RadioPill name="status" value="Registered" label="Registered" checked={formData.status === "Registered"} onChange={() => handleRadioChange('status', 'Registered')} />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                <FaStickyNote className="text-slate-400" /> Remarks <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                placeholder="Enter specific conversation notes, updates, or outcomes..."
                                rows={3}
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                                required
                            />
                        </div>

                        <div className="border-t border-slate-100 pt-3">
                            <label className="block text-xs font-semibold text-slate-700 mb-2">
                                Schedule Next Follow-up <span className="text-slate-400 font-normal">(Optional)</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <CustomInput
                                    label="Next Follow-up Date"
                                    type="date"
                                    name="nextFollowupDate"
                                    value={formData.nextFollowupDate}
                                    onChange={handleChange}
                                    icon={<FaRegCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
                                />
                                <CustomInput
                                    label="Next Follow-up Time"
                                    type="time"
                                    name="nextFollowupTime"
                                    value={formData.nextFollowupTime}
                                    onChange={handleChange}
                                    icon={<FaRegClock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
                        <span className="text-[11px] text-slate-400">
                            Press ESC to close
                        </span>
                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={loading}
                                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-xs hover:shadow transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <span>Submit Follow-up</span>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FollowupFormModal;
import { useState, useEffect, useCallback } from "react";
import { getFollowupLeadStatusesDropdown } from "../../../Services/drop-down/dropDownService";

const ScheduleModal = ({ isOpen, onClose, onSubmit, leadData }) => {
    // Get local date in YYYY-MM-DD format (not UTC)
    const todayStr = new Date().toLocaleDateString('en-CA');

    const getOffsetDate = (days) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d.toLocaleDateString('en-CA');
    };

    const [formData, setFormData] = useState({
        followUpDate: "",
        followUpTime: "10:30",
        remarks: "",
        leadStatus: "",
        leadStatusCode: "",
    });
    const [errors, setErrors] = useState({});
    const [leadStatuses, setLeadStatuses] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [phoneCopied, setPhoneCopied] = useState(false);

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

    const handleClose = useCallback(() => {
        if (isSubmitting) return;
        setErrors({});
        onClose();
    }, [isSubmitting, onClose]);

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen && !isSubmitting) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isSubmitting, handleClose]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Clear error for the field being changed
        setErrors(prev => ({
            ...prev,
            [name]: ""
        }));

        if (name === "leadStatus") {
            const selectedStatus = leadStatuses.find(status => String(status.id) === String(value));
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

    const handleQuickDate = (dateVal) => {
        setFormData(prev => ({
            ...prev,
            followUpDate: dateVal
        }));
        setErrors(prev => ({
            ...prev,
            followUpDate: ""
        }));
    };

    const handleCopyPhone = (e) => {
        e.stopPropagation();
        if (!leadPhone) return;
        navigator.clipboard.writeText(leadPhone);
        setPhoneCopied(true);
        setTimeout(() => setPhoneCopied(false), 2000);
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();

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

        setIsSubmitting(true);
        try {
            const localDate = formData.followUpDate;
            const localTime = formData.followUpTime
                ? (formData.followUpTime.length === 5 ? `${formData.followUpTime}:00` : formData.followUpTime)
                : "11:00:00";

            const payload = {
                ...formData,
                followUpDate: `${localDate}T${localTime}`,
            };

            const success = await onSubmit(payload);

            if (success) {
                setFormData({
                    followUpDate: "",
                    followUpTime: "11:00",
                    remarks: "",
                    leadStatus: "",
                    leadStatusCode: "",
                });
                setErrors({});
                onClose();
            }
        } catch (error) {
            console.error("Failed to schedule follow up:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // Lead metadata
    const leadPhone = leadData?.phoneNumber || leadData?.mobile || leadData?.contactNo || '';
    const leadName = leadData?.fullName || leadData?.name || '';
    const courseName = (
        Array.isArray(leadData?.interestedCourses) && leadData.interestedCourses.length > 0
            ? (leadData.interestedCourses[0]?.courseName || leadData.interestedCourses[0]?.name)
            : (leadData?.course?.courseName || leadData?.courseName)
    ) || '';

    const initials = leadName
        ? leadName
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map(n => n[0])
            .join('')
            .toUpperCase()
        : 'LD';

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
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 leading-tight">
                                Schedule Follow Up
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Set callback date, time, and lead outcome status
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
                        aria-label="Close modal"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSave} className="flex flex-col">
                    <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                        {/* Candidate Summary Card (If leadData is available) */}
                        {leadName && (
                            <div className="bg-gradient-to-br from-slate-50 to-blue-50/20 rounded-xl p-3.5 border border-slate-200/70 shadow-2xs space-y-2.5">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs flex-shrink-0">
                                        {initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] text-slate-500 font-medium">Candidate</p>
                                        <p className="text-sm font-bold text-slate-900 truncate">
                                            {leadName}
                                        </p>
                                    </div>
                                    {courseName && (
                                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full truncate max-w-[150px]" title={courseName}>
                                            {courseName}
                                        </span>
                                    )}
                                </div>

                                {leadPhone && (
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                                        <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-emerald-600">
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                            </svg>
                                            <span className="font-mono font-semibold text-slate-800">{leadPhone}</span>
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={handleCopyPhone}
                                                className="text-[11px] text-slate-500 hover:text-slate-800 font-medium px-2 py-0.5 rounded hover:bg-slate-200/60 transition-colors cursor-pointer"
                                            >
                                                {phoneCopied ? 'Copied!' : 'Copy'}
                                            </button>
                                            <a
                                                href={`tel:${leadPhone}`}
                                                className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded transition-colors"
                                            >
                                                Dial
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Date & Time Row */}
                        <div className="space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Date Input */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Follow Up Date <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="followUpDate"
                                            min={todayStr}
                                            value={formData.followUpDate}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                            className={`w-full px-3 py-2 rounded-lg border text-sm text-gray-800 bg-white transition-all outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 ${errors.followUpDate
                                                    ? 'border-red-400 bg-red-50/20 text-red-900'
                                                    : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                        />
                                    </div>
                                    {errors.followUpDate && (
                                        <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="12" y1="8" x2="12" y2="12" />
                                                <line x1="12" y1="16" x2="12.01" y2="16" />
                                            </svg>
                                            {errors.followUpDate}
                                        </p>
                                    )}
                                </div>

                                {/* Time Input */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Follow Up Time <span className="text-gray-400 font-normal">(Optional)</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            name="followUpTime"
                                            value={formData.followUpTime}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 hover:border-gray-400 text-sm text-gray-800 bg-white transition-all outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Quick Date Shortcuts */}
                            <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                                <span className="text-[11px] font-medium text-gray-400 mr-1">Quick:</span>
                                <button
                                    type="button"
                                    onClick={() => handleQuickDate(todayStr)}
                                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-all cursor-pointer ${formData.followUpDate === todayStr
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'
                                        }`}
                                >
                                    Today
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleQuickDate(getOffsetDate(1))}
                                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-all cursor-pointer ${formData.followUpDate === getOffsetDate(1)
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'
                                        }`}
                                >
                                    Tomorrow
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleQuickDate(getOffsetDate(2))}
                                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-all cursor-pointer ${formData.followUpDate === getOffsetDate(2)
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'
                                        }`}
                                >
                                    In 2 Days
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleQuickDate(getOffsetDate(7))}
                                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-all cursor-pointer ${formData.followUpDate === getOffsetDate(7)
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'
                                        }`}
                                >
                                    In 1 Week
                                </button>
                            </div>
                        </div>

                        {/* Remarks */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Remarks <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={3}
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                placeholder="Enter specific conversation notes, callback requirements or discussion points..."
                                className={`w-full px-3 py-2 rounded-lg border text-sm text-gray-800 bg-white placeholder:text-gray-400 transition-all outline-none resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 ${errors.remarks
                                        ? 'border-red-400 bg-red-50/20 text-red-900'
                                        : 'border-gray-300 hover:border-gray-400'
                                    }`}
                            />
                            {errors.remarks && (
                                <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {errors.remarks}
                                </p>
                            )}
                        </div>

                        {/* Follow-Up Status */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Follow-Up Status <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    name="leadStatus"
                                    value={formData.leadStatus}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className={`w-full appearance-none px-3.5 py-2.5 rounded-lg border text-sm transition-all outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 pr-10 bg-white ${!formData.leadStatus ? 'text-gray-400' : 'text-gray-900 font-medium'
                                        } ${errors.leadStatus
                                            ? 'border-red-400 bg-red-50/20 text-red-900'
                                            : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    <option value="" disabled className="text-gray-400">
                                        Select Lead Status
                                    </option>
                                    {leadStatuses.map((status) => (
                                        <option key={status.id} value={status.id} className="text-gray-900 font-normal">
                                            {status.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </div>
                            </div>
                            {errors.leadStatus && (
                                <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {errors.leadStatus}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
                        <span className="text-[11px] text-gray-400">
                            Press ESC to cancel
                        </span>
                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-xs hover:shadow transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        <span>Save Schedule</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleModal;

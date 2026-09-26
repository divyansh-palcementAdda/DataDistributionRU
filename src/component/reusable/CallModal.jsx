import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { changeLeadStatus } from '../../Services/lead/leadService';

const CallModal = ({
    isOpen,
    onClose,
    studentData,
    phoneNumber,
    onComplete,
    followups,
    onScheduleOpen,
    onInfoPanelOpen,
    isFinallyNotConnected,
    hasPendingFollowup,
    onCompleteFollowup,
    onCancelFollowup,
    onFollowupNotConnected,
    onRegisterLead,
    hasClickedInfoPanel,
    onResetInfoPanel
}) => {
    // Local workflow interaction overrides
    const [overrideState, setOverrideState] = useState(null); // 'connected' | 'interested' | 'not_connected'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeAction, setActiveAction] = useState(null);
    const [followupActionCompleted, setFollowupActionCompleted] = useState(null);
    const [phoneCopied, setPhoneCopied] = useState(false);

    const handleClose = useCallback(() => {
        if (isSubmitting) return;
        setFollowupActionCompleted(null);
        setActiveAction(null);
        setOverrideState(null);
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

    // Current status info
    const currentStatus = studentData?.currentStatus;
    const statusName = currentStatus?.name || currentStatus?.code || studentData?.status || '';
    const followUpStatus = currentStatus?.followUpStatus || false;
    const currentStatusCode = (currentStatus?.code || currentStatus?.name || '').toUpperCase();

    // Derived connection/stage states
    const isConnected = overrideState
        ? (overrideState === 'connected' || overrideState === 'interested')
        : (currentStatusCode === 'CONNECTED' || currentStatusCode === 'INTERESTED');

    const showInterestButtons = overrideState
        ? (overrideState === 'connected')
        : (currentStatusCode === 'CONNECTED');

    const showActionButtons = overrideState
        ? (overrideState === 'interested')
        : (currentStatusCode === 'INTERESTED');

    if (!isOpen) return null;

    // Check if any followup has MISSED status
    const hasMissedFollowup = followups?.some(f => f.status === 'MISSED');

    // Determine visibility conditions
    const shouldShowConnectionButtons = !followUpStatus || hasMissedFollowup;

    const leadPhone = phoneNumber || studentData?.phoneNumber || studentData?.mobile || studentData?.contactNo || '';
    const leadName = studentData?.fullName || studentData?.name || 'Unnamed Lead';
    const courseName = (
        Array.isArray(studentData?.interestedCourses) && studentData.interestedCourses.length > 0
            ? (studentData.interestedCourses[0]?.courseName || studentData.interestedCourses[0]?.name)
            : (studentData?.course?.courseName || studentData?.courseName)
    ) || 'Not specified';

    // Initials for avatar
    const initials = leadName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(n => n[0])
        .join('')
        .toUpperCase() || 'LD';

    const handleCopyPhone = (e) => {
        e.stopPropagation();
        if (!leadPhone) return;
        navigator.clipboard.writeText(leadPhone);
        setPhoneCopied(true);
        setTimeout(() => setPhoneCopied(false), 2000);
    };

    // Actions
    const handleMarkAsConnected = async () => {
        setIsSubmitting(true);
        setActiveAction('CONNECTED');
        try {
            await changeLeadStatus(studentData?.id, {
                newStatusId: studentData?.currentStatus?.id,
                statusCode: 'CONNECTED',
                feedback: 'Marked as connected'
            });
            setOverrideState('connected');
            toast.success('Lead marked as Connected');
            if (onResetInfoPanel) onResetInfoPanel();
            if (onComplete) onComplete();
        } catch (error) {
            console.error('Error marking as connected:', error);
            toast.error(error?.response?.data?.message || 'Failed to mark as connected');
        } finally {
            setIsSubmitting(false);
            setActiveAction(null);
        }
    };

    const handleInterested = async () => {
        setIsSubmitting(true);
        setActiveAction('INTERESTED');
        try {
            await changeLeadStatus(studentData?.id, {
                newStatusId: studentData?.currentStatus?.id,
                statusCode: 'INTERESTED',
                feedback: 'Interested in the course'
            });
            setOverrideState('interested');
            toast.success('Lead marked as Interested');
            if (onResetInfoPanel) onResetInfoPanel();
            if (onComplete) onComplete();
        } catch (error) {
            console.error('Error changing status to Interested:', error);
            toast.error(error?.response?.data?.message || 'Failed to update status');
        } finally {
            setIsSubmitting(false);
            setActiveAction(null);
        }
    };

    const handleNotInterested = async () => {
        setIsSubmitting(true);
        setActiveAction('NOT_INTERESTED');
        try {
            await changeLeadStatus(studentData?.id, {
                newStatusId: studentData?.currentStatus?.id,
                statusCode: 'NOT_INTERESTED',
                feedback: 'Not interested in the course'
            });
            toast.info('Lead marked as Not Interested');
            handleClose();
            if (onComplete) onComplete();
        } catch (error) {
            console.error('Error changing status to Not Interested:', error);
            toast.error(error?.response?.data?.message || 'Failed to update status');
        } finally {
            setIsSubmitting(false);
            setActiveAction(null);
        }
    };

    const handleBad = async () => {
        setIsSubmitting(true);
        setActiveAction('BAD');
        try {
            await changeLeadStatus(studentData?.id, {
                newStatusId: studentData?.currentStatus?.id,
                statusCode: 'BAD',
                feedback: 'Bad data / Invalid lead'
            });
            toast.warning('Lead marked as Bad / Invalid Data');
            handleClose();
            if (onComplete) onComplete();
        } catch (error) {
            console.error('Error changing status to Bad:', error);
            toast.error(error?.response?.data?.message || 'Failed to update status');
        } finally {
            setIsSubmitting(false);
            setActiveAction(null);
        }
    };

    const handleInfoPanel = () => {
        handleClose();
        if (onInfoPanelOpen) {
            onInfoPanelOpen();
        }
    };

    const handleScheduleFollowUp = () => {
        handleClose();
        if (onScheduleOpen) {
            onScheduleOpen();
        }
    };

    const handleMarkAsNotConnected = async () => {
        setIsSubmitting(true);
        setActiveAction('NOT_CONNECTED_1');
        try {
            await changeLeadStatus(studentData?.id, {
                newStatusId: studentData?.currentStatus?.id,
                statusCode: 'NOT_CONNECTED_1',
                feedback: 'Marked as not connected'
            });
            setOverrideState('not_connected');
            toast.info('Marked as Not Connected (1st Attempt)');
            handleClose();
            if (onComplete) onComplete();
        } catch (error) {
            console.error('Error marking as not connected:', error);
            toast.error(error?.response?.data?.message || 'Failed to update status');
        } finally {
            setIsSubmitting(false);
            setActiveAction(null);
        }
    };

    const handleMarkAsNotConnected2 = async () => {
        setIsSubmitting(true);
        setActiveAction('NOT_CONNECTED_2');
        try {
            await changeLeadStatus(studentData?.id, {
                newStatusId: studentData?.currentStatus?.id,
                statusCode: 'NOT_CONNECTED_2',
                feedback: 'Marked as not connected - 2'
            });
            setOverrideState('not_connected');
            toast.info('Marked as Not Connected (2nd Attempt)');
            handleClose();
            if (onComplete) onComplete();
        } catch (error) {
            console.error('Error marking as not connected - 2:', error);
            toast.error(error?.response?.data?.message || 'Failed to update status');
        } finally {
            setIsSubmitting(false);
            setActiveAction(null);
        }
    };

    const handleMarkAsNotConnected3 = async () => {
        setIsSubmitting(true);
        setActiveAction('NOT_CONNECTED_3');
        try {
            await changeLeadStatus(studentData?.id, {
                newStatusId: studentData?.currentStatus?.id,
                statusCode: 'NOT_CONNECTED_3',
                feedback: 'Marked as not connected - 3'
            });
            setOverrideState('not_connected');
            toast.info('Marked as Not Connected (3rd Attempt)');
            handleClose();
            if (onComplete) onComplete();
        } catch (error) {
            console.error('Error marking as not connected - 3:', error);
            toast.error(error?.response?.data?.message || 'Failed to update status');
        } finally {
            setIsSubmitting(false);
            setActiveAction(null);
        }
    };

    const handleFinallyNotConnected = async () => {
        setIsSubmitting(true);
        setActiveAction('FINALLY_NOT_CONNECTED');
        try {
            await changeLeadStatus(studentData?.id, {
                newStatusId: studentData?.currentStatus?.id,
                statusCode: 'FINALLY_NOT_CONNECTED',
                feedback: 'Finally not connected'
            });
            setOverrideState('not_connected');
            toast.warning('Marked as Finally Not Connected');
            handleClose();
            if (onComplete) onComplete();
        } catch (error) {
            console.error('Error marking as finally not connected:', error);
            toast.error(error?.response?.data?.message || 'Failed to update status');
        } finally {
            setIsSubmitting(false);
            setActiveAction(null);
        }
    };

    const handleCompleteFollowup = async () => {
        if (onCompleteFollowup) {
            setIsSubmitting(true);
            setActiveAction('COMPLETE_FOLLOWUP');
            try {
                await onCompleteFollowup();
                setFollowupActionCompleted('completed');
                if (onComplete) onComplete();
            } finally {
                setIsSubmitting(false);
                setActiveAction(null);
            }
        }
    };

    const handleCancelFollowup = async () => {
        if (onCancelFollowup) {
            setIsSubmitting(true);
            setActiveAction('CANCEL_FOLLOWUP');
            try {
                await onCancelFollowup();
                setFollowupActionCompleted('cancelled');
                if (onComplete) onComplete();
            } finally {
                setIsSubmitting(false);
                setActiveAction(null);
            }
        }
    };

    const handleFollowupNotConnected = async () => {
        if (onFollowupNotConnected) {
            setIsSubmitting(true);
            setActiveAction('FOLLOWUP_NOT_CONNECTED');
            try {
                await onFollowupNotConnected();
                setFollowupActionCompleted('not_connected');
                if (onComplete) onComplete();
            } finally {
                setIsSubmitting(false);
                setActiveAction(null);
            }
        }
    };

    const handleRegisterLead = async () => {
        if (onRegisterLead) {
            await onRegisterLead();
            handleClose();
            if (onComplete) onComplete();
        }
    };

    const handleFollowupNotInterested = async () => {
        setIsSubmitting(true);
        setActiveAction('FOLLOWUP_NOT_INTERESTED');
        try {
            await changeLeadStatus(studentData?.id, {
                newStatusId: studentData?.currentStatus?.id,
                statusCode: 'NOT_INTERESTED',
                feedback: 'Followup not interested'
            });
            handleClose();
            if (onComplete) onComplete();
        } catch (error) {
            console.error('Error changing status to Not Interested:', error);
            toast.error(error?.response?.data?.message || 'Failed to update status');
        } finally {
            setIsSubmitting(false);
            setActiveAction(null);
        }
    };

    // Helper for Not Connected button configuration
    const getNotConnectedConfig = () => {
        if (currentStatusCode === 'NOT_CONNECTED_1') {
            return {
                label: 'Not Connected',
                badge: '2nd Attempt',
                actionId: 'NOT_CONNECTED_2',
                onClick: handleMarkAsNotConnected2
            };
        } else if (currentStatusCode === 'NOT_CONNECTED_2') {
            return {
                label: 'Not Connected',
                badge: '3rd Attempt',
                actionId: 'NOT_CONNECTED_3',
                onClick: handleMarkAsNotConnected3
            };
        } else if (currentStatusCode === 'NOT_CONNECTED_3') {
            return {
                label: 'Finally Not Connected',
                badge: 'Final Attempt',
                actionId: 'FINALLY_NOT_CONNECTED',
                onClick: handleFinallyNotConnected
            };
        } else {
            return {
                label: 'Not Connected',
                badge: '1st Attempt',
                actionId: 'NOT_CONNECTED_1',
                onClick: handleMarkAsNotConnected
            };
        }
    };

    const notConnectedConfig = getNotConnectedConfig();

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
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-slate-900 leading-tight">
                                    Call Details
                                </h2>
                                {statusName && (
                                    <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                        {statusName}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Log caller interaction & record outcome
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
                        aria-label="Close modal"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {/* Lead Card Summary */}
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50/20 rounded-xl p-4 border border-slate-200/70 shadow-2xs space-y-3.5">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs flex-shrink-0">
                                {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-500 font-medium">Candidate Name</p>
                                <p className="text-sm font-bold text-slate-900 truncate">
                                    {leadName}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                            {/* Contact Number with Call & Copy */}
                            <div className="flex items-start gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] text-slate-500 font-medium">Contact Number</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-xs font-semibold text-slate-800 tracking-wide font-mono">
                                            {leadPhone || 'N/A'}
                                        </span>
                                        {leadPhone && (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={handleCopyPhone}
                                                    title={phoneCopied ? 'Copied!' : 'Copy phone number'}
                                                    className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                                                >
                                                    {phoneCopied ? (
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    ) : (
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <a
                                                    href={`tel:${leadPhone}`}
                                                    title="Direct Dial"
                                                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded transition-colors"
                                                >
                                                    Dial
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Course */}
                            <div className="flex items-start gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-purple-100/70 text-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] text-slate-500 font-medium">Interested Course</p>
                                    <p className="text-xs font-semibold text-slate-800 mt-0.5 truncate" title={courseName}>
                                        {courseName}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step Action Prompts & Controls */}
                    <div className="space-y-3">
                        {!isFinallyNotConnected && currentStatusCode !== 'FINALLY_NOT_CONNECTED' && (
                            <>
                                {/* STAGE 1: Call Outcome (Connected / Not Connected / Bad) */}
                                {shouldShowConnectionButtons && !isConnected && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                Step 1: Call Outcome
                                            </span>
                                            <span className="text-[11px] text-slate-400">
                                                Did the student pick up?
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Connected Button */}
                                            <button
                                                type="button"
                                                onClick={handleMarkAsConnected}
                                                disabled={isSubmitting}
                                                className="group relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-xs hover:shadow transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                                            >
                                                {activeAction === 'CONNECTED' ? (
                                                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                ) : (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                )}
                                                <span>Mark Connected</span>
                                            </button>

                                            {/* Not Connected Button */}
                                            <button
                                                type="button"
                                                onClick={notConnectedConfig.onClick}
                                                disabled={isSubmitting}
                                                className="group relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 active:scale-[0.98] shadow-2xs transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                                            >
                                                {activeAction === notConnectedConfig.actionId ? (
                                                    <svg className="animate-spin w-4 h-4 text-amber-700" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                ) : (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="1" y1="1" x2="23" y2="23" />
                                                        <path d="M9 9v.01" />
                                                        <path d="M17 17v.01" />
                                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                                    </svg>
                                                )}
                                                <span>{notConnectedConfig.label}</span>
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200/70 text-amber-900">
                                                    {notConnectedConfig.badge}
                                                </span>
                                            </button>
                                        </div>

                                        {/* Bad Lead Option as separate secondary row */}
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                            <span className="text-xs text-slate-500">
                                                Invalid contact or spam lead?
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleBad}
                                                disabled={isSubmitting}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                                            >
                                                {activeAction === 'BAD' ? (
                                                    <svg className="animate-spin w-3.5 h-3.5 text-rose-600" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                ) : (
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                                    </svg>
                                                )}
                                                <span>Mark as Bad Lead</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* STAGE 2: Lead Interest (When Connected) */}
                                {isConnected && showInterestButtons && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                Step 2: Candidate Interest
                                            </span>
                                            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                Call Connected
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Interested */}
                                            <button
                                                type="button"
                                                onClick={handleInterested}
                                                disabled={isSubmitting}
                                                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] shadow-xs hover:shadow transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                                            >
                                                {activeAction === 'INTERESTED' ? (
                                                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                ) : (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                                    </svg>
                                                )}
                                                <span>Interested</span>
                                            </button>

                                            {/* Not Interested */}
                                            <button
                                                type="button"
                                                onClick={handleNotInterested}
                                                disabled={isSubmitting}
                                                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                                            >
                                                {activeAction === 'NOT_INTERESTED' ? (
                                                    <svg className="animate-spin w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                ) : (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
                                                    </svg>
                                                )}
                                                <span>Not Interested</span>
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                            <span className="text-xs text-slate-500">
                                                Candidate requested removal / wrong data?
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleBad}
                                                disabled={isSubmitting}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                                            >
                                                <span>Mark as Bad Lead</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* STAGE 3: Actions for Interested Candidate */}
                                {showActionButtons && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                Step 3: Next Actions
                                            </span>
                                            <span className="text-[11px] text-blue-600 font-medium">
                                                Lead is Interested
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={handleInfoPanel}
                                                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-xs hover:shadow transition-all cursor-pointer"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                                    <line x1="8" y1="21" x2="16" y2="21" />
                                                    <line x1="12" y1="17" x2="12" y2="21" />
                                                </svg>
                                                <span>Open Info Panel</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleScheduleFollowUp}
                                                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 active:scale-[0.98] transition-all cursor-pointer"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                    <line x1="16" y1="2" x2="16" y2="6" />
                                                    <line x1="8" y1="2" x2="8" y2="6" />
                                                    <line x1="3" y1="10" x2="21" y2="10" />
                                                </svg>
                                                <span>Schedule Follow-Up</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Return to Schedule button */}
                                {hasClickedInfoPanel && !showActionButtons && !isConnected && (
                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            onClick={handleScheduleFollowUp}
                                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-all cursor-pointer"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                <line x1="16" y1="2" x2="16" y2="6" />
                                                <line x1="8" y1="2" x2="8" y2="6" />
                                                <line x1="3" y1="10" x2="21" y2="10" />
                                            </svg>
                                            <span>Schedule Follow-Up</span>
                                        </button>
                                    </div>
                                )}

                                {/* PENDING FOLLOW-UP ACTIONS */}
                                {(hasPendingFollowup || followUpStatus === 'upcoming') && !followupActionCompleted && (
                                    <div className="space-y-3 pt-2 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                Follow-Up Actions
                                            </span>
                                            <span className="text-[11px] text-amber-600 font-medium">
                                                Follow-up Pending
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <button
                                                type="button"
                                                onClick={handleCompleteFollowup}
                                                disabled={isSubmitting}
                                                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
                                            >
                                                {activeAction === 'COMPLETE_FOLLOWUP' ? (
                                                    <svg className="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                ) : (
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                )}
                                                <span>Mark Completed</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleCancelFollowup}
                                                disabled={isSubmitting}
                                                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-semibold text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all disabled:opacity-50 cursor-pointer"
                                            >
                                                {activeAction === 'CANCEL_FOLLOWUP' ? (
                                                    <svg className="animate-spin w-3.5 h-3.5 text-rose-600" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                ) : (
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                        <line x1="18" y1="6" x2="6" y2="18" />
                                                        <line x1="6" y1="6" x2="18" y2="18" />
                                                    </svg>
                                                )}
                                                <span>Mark Cancelled</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleFollowupNotConnected}
                                                disabled={isSubmitting}
                                                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-semibold text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all disabled:opacity-50 cursor-pointer"
                                            >
                                                {activeAction === 'FOLLOWUP_NOT_CONNECTED' ? (
                                                    <svg className="animate-spin w-3.5 h-3.5 text-amber-700" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                ) : (
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                                        <line x1="1" y1="1" x2="23" y2="23" />
                                                        <path d="M9 9v.01" />
                                                        <path d="M17 17v.01" />
                                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07" />
                                                    </svg>
                                                )}
                                                <span>Not Connected</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Follow-up Completed / Post Actions */}
                                {followupActionCompleted === 'cancelled' && (
                                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={handleRegisterLead}
                                            disabled={isSubmitting}
                                            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-all cursor-pointer"
                                        >
                                            Registered
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleScheduleFollowUp}
                                            disabled={isSubmitting}
                                            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer"
                                        >
                                            Schedule Next
                                        </button>
                                    </div>
                                )}

                                {followupActionCompleted === 'completed' && (
                                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={handleRegisterLead}
                                            disabled={isSubmitting}
                                            className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-all cursor-pointer"
                                        >
                                            Registered
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleScheduleFollowUp}
                                            disabled={isSubmitting}
                                            className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl font-semibold text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer"
                                        >
                                            Schedule
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleFollowupNotInterested}
                                            disabled={isSubmitting}
                                            className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl font-semibold text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
                                        >
                                            Not Interested
                                        </button>
                                    </div>
                                )}

                                {followupActionCompleted === 'not_connected' && (
                                    <div className="pt-2 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={handleScheduleFollowUp}
                                            disabled={isSubmitting}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer"
                                        >
                                            Schedule Follow-Up
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Footer with Close / Dismiss */}
                <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">
                        Press ESC to close
                    </span>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200 transition-colors cursor-pointer"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CallModal;

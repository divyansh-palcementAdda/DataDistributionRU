import React, { useState } from 'react';
import CustomButton from './CustomButton';
import { changeLeadStatus } from '../../Services/lead/leadService';

const CallModal = ({ isOpen, onClose, studentData, onScheduleOpen, onInfoPanelOpen, isFinallyNotConnected, hasPendingFollowup, onCompleteFollowup, onCancelFollowup, onFollowupNotConnected, onRegisterLead }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [showInterestButtons, setShowInterestButtons] = useState(false);
    const [showActionButtons, setShowActionButtons] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [followupActionCompleted, setFollowupActionCompleted] = useState(null); // 'cancelled', 'completed', 'not_connected'

    if (!isOpen) return null;

    // Get current status from API response
    const currentStatus = studentData?.currentStatus;
    const statusName = currentStatus?.code || currentStatus?.name || '';
    const followUpStatus = currentStatus?.followUpStatus || false;
    const currentStatusCode = statusName.toUpperCase();

    // Determine which buttons to show based on currentStatus
    const shouldShowConnectionButtons = !followUpStatus;
    const shouldShowInterestButtons = followUpStatus;

    const handleMarkAsConnected = async () => {
        setIsSubmitting(true);
        try {
            await changeLeadStatus(studentData?.id, {
                newStatusId: studentData?.currentStatus?.id,
                statusCode: 'CONNECTED',
                feedback: 'Marked as connected'
            });
            setIsConnected(true);
            setShowInterestButtons(true);
        } catch (error) {
            console.error('Error marking as connected:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInterested = async () => {
        setIsSubmitting(true);
        try {
            await changeLeadStatus(studentData?.id, {
                newStatusId: studentData?.currentStatus?.id,
                statusCode: 'INTERESTED',
                feedback: 'Interested in the course'
            });
            setShowInterestButtons(false);
            setShowActionButtons(true);
        } catch (error) {
            console.error('Error changing status to Interested:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNotInterested = async () => {
        setIsSubmitting(true);
        try {
            await changeLeadStatus(studentData?.id, {
                newStatusId: studentData?.currentStatus?.id,
                statusCode: 'NOT_INTERESTED',
                feedback: 'Not interested in the course'
            });
            setShowInterestButtons(false);
            handleClose();
        } catch (error) {
            console.error('Error changing status to Not Interested:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBad = async () => {
        setIsSubmitting(true);
        try {
            await changeLeadStatus(studentData?.id, {
                newStatusId: studentData?.currentStatus?.id,
                statusCode: 'BAD_DATA',
                feedback: 'Bad data'
            });
            setShowInterestButtons(false);
            handleClose();
        } catch (error) {
            console.error('Error changing status to Bad:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInfoPanel = () => {
        setShowActionButtons(false);
        handleClose();
        if (onInfoPanelOpen) {
            onInfoPanelOpen();
        }
    };

    const handleScheduleFollowUp = () => {
        setShowActionButtons(false);
        handleClose();
        if (onScheduleOpen) {
            onScheduleOpen();
        }
    };

    const handleMarkAsNotConnected = async () => {
        setIsSubmitting(true);
        try {
            await changeLeadStatus(studentData?.id, {
                newStatusId: studentData?.currentStatus?.id,
                statusCode: 'NOT_CONNECTED_1',
                feedback: 'Marked as not connected'
            });
            setIsConnected(false);
            setShowInterestButtons(false);
            setShowActionButtons(false);
            handleClose();
        } catch (error) {
            console.error('Error marking as not connected:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMarkAsNotConnected2 = async () => {
        setIsSubmitting(true);
        try {
            await changeLeadStatus(studentData?.id, {
                newStatusId: studentData?.currentStatus?.id,
                statusCode: 'NOT_CONNECTED_2',
                feedback: 'Marked as not connected - 2'
            });
            setIsConnected(false);
            setShowInterestButtons(false);
            setShowActionButtons(false);
            handleClose();
        } catch (error) {
            console.error('Error marking as not connected - 2:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMarkAsNotConnected3 = async () => {
        setIsSubmitting(true);
        try {
            await changeLeadStatus(studentData?.id, {
                newStatusId: studentData?.currentStatus?.id,
                statusCode: 'NOT_CONNECTED_3',
                feedback: 'Marked as not connected - 3'
            });
            setIsConnected(false);
            setShowInterestButtons(false);
            setShowActionButtons(false);
            handleClose();
        } catch (error) {
            console.error('Error marking as not connected - 3:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFinallyNotConnected = async () => {
        setIsSubmitting(true);
        try {
            await changeLeadStatus(studentData?.id, {
                newStatusId: studentData?.currentStatus?.id,
                statusCode: 'FINALLY_NOT_CONNECTED',
                feedback: 'Finally not connected'
            });
            setIsConnected(false);
            setShowInterestButtons(false);
            setShowActionButtons(false);
            handleClose();
        } catch (error) {
            console.error('Error marking as finally not connected:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCompleteFollowup = async () => {
        if (onCompleteFollowup) {
            await onCompleteFollowup();
            setFollowupActionCompleted('completed');
        }
    };

    const handleCancelFollowup = async () => {
        if (onCancelFollowup) {
            await onCancelFollowup();
            setFollowupActionCompleted('cancelled');
        }
    };

    const handleFollowupNotConnected = async () => {
        if (onFollowupNotConnected) {
            await onFollowupNotConnected();
            setFollowupActionCompleted('not_connected');
        }
    };

    const handleRegisterLead = async () => {
        if (onRegisterLead) {
            await onRegisterLead();
            onClose();
        }
    };

    // Reset followup action state when modal closes
    const handleClose = () => {
        setFollowupActionCompleted(null);
        onClose();
    };

    // Determine which not connected button to show based on current status
    const getNotConnectedButton = () => {
        if (currentStatusCode === 'NOT_CONNECTED_1') {
            return (
                <CustomButton
                    variant="secondary"
                    onClick={handleMarkAsNotConnected2}
                    className="px-4 py-2"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Mark as not connected - 2'}
                </CustomButton>
            );
        } else if (currentStatusCode === 'NOT_CONNECTED_2') {
            return (
                <CustomButton
                    variant="secondary"
                    onClick={handleMarkAsNotConnected3}
                    className="px-4 py-2"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Mark as not connected - 3'}
                </CustomButton>
            );
        } else if (currentStatusCode === 'NOT_CONNECTED_3') {
            return (
                <CustomButton
                    variant="secondary"
                    onClick={handleFinallyNotConnected}
                    className="px-4 py-2"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Finally not connected'}
                </CustomButton>
            );
        } else {
            // Default case - initial button
            return (
                <CustomButton
                    variant="secondary"
                    onClick={handleMarkAsNotConnected}
                    className="px-4 py-2"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Mark as not connected'}
                </CustomButton>
            );
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-5">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Call Details
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-2xl text-gray-500 hover:text-red-500 transition-colors"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    {/* Lead Details */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 font-medium">Name</p>
                                <p className="text-sm text-gray-900 font-medium">
                                    {studentData?.fullName || 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 font-medium">Contact No</p>
                                <p className="text-sm text-gray-900 font-medium">
                                    {studentData?.phoneNumber || studentData?.mobile || 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 font-medium">Interested Course</p>
                                <p className="text-sm text-gray-900 font-medium">
                                    {studentData?.courseInterested || studentData?.course?.courseName || studentData?.interestedCourse || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t p-5">
                    {!isFinallyNotConnected && currentStatusCode !== 'FINALLY_NOT_CONNECTED' && (
                        <>
                            {/* Show connection buttons if not in follow-up status */}
                            {shouldShowConnectionButtons && !isConnected && (
                                <>
                                    {getNotConnectedButton()}

                                    <CustomButton
                                        variant="primary"
                                        onClick={handleMarkAsConnected}
                                        className="px-4 py-2"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Mark as Connected'}
                                    </CustomButton>
                                </>
                            )}

                            {/* Show interest buttons when connected */}
                            {isConnected && showInterestButtons && (
                                <>
                                    <CustomButton
                                        variant="primary"
                                        onClick={handleInterested}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Interested'}
                                    </CustomButton>
                                    <CustomButton
                                        variant="secondary"
                                        onClick={handleNotInterested}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Not Interested'}
                                    </CustomButton>
                                    <CustomButton
                                        variant="secondary"
                                        onClick={handleBad}
                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Bad'}
                                    </CustomButton>
                                </>
                            )}

                            {/* Show action buttons when interested */}
                            {showActionButtons && (
                                <>
                                    <CustomButton
                                        variant="primary"
                                        onClick={handleInfoPanel}
                                        className="px-4 py-2"
                                    >
                                        Info Panel
                                    </CustomButton>
                                    <CustomButton
                                        variant="secondary"
                                        onClick={handleScheduleFollowUp}
                                        className="px-4 py-2"
                                    >
                                        Schedule Follow Up
                                    </CustomButton>
                                </>
                            )}

                            {/* Show followup action buttons when followup is pending */}
                            {hasPendingFollowup && !followupActionCompleted && (
                                <>
                                    <CustomButton
                                        variant="primary"
                                        onClick={handleCancelFollowup}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Mark as Cancelled'}
                                    </CustomButton>
                                    <CustomButton
                                        variant="primary"
                                        onClick={handleCompleteFollowup}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Mark as Completed'}
                                    </CustomButton>
                                    <CustomButton
                                        variant="secondary"
                                        onClick={handleFollowupNotConnected}
                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Follow up Not Connected'}
                                    </CustomButton>
                                </>
                            )}

                            {/* Show followup completed action buttons */}
                            {followupActionCompleted === 'cancelled' && (
                                <>
                                    <CustomButton
                                        variant="primary"
                                        onClick={handleRegisterLead}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Registered'}
                                    </CustomButton>
                                    <CustomButton
                                        variant="secondary"
                                        onClick={handleScheduleFollowUp}
                                        className="px-4 py-2"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Schedule'}
                                    </CustomButton>
                                </>
                            )}

                            {followupActionCompleted === 'completed' && (
                                <>
                                    <CustomButton
                                        variant="primary"
                                        onClick={handleRegisterLead}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Registered'}
                                    </CustomButton>
                                    <CustomButton
                                        variant="secondary"
                                        onClick={handleScheduleFollowUp}
                                        className="px-4 py-2"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Schedule'}
                                    </CustomButton>
                                </>
                            )}

                            {followupActionCompleted === 'not_connected' && (
                                <>
                                    <CustomButton
                                        variant="secondary"
                                        onClick={handleScheduleFollowUp}
                                        className="px-4 py-2"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Schedule'}
                                    </CustomButton>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CallModal;

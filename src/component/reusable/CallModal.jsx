import React, { useState } from 'react';
import CustomButton from './CustomButton';

const CallModal = ({ isOpen, onClose, studentData, onScheduleOpen }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [showInterestButtons, setShowInterestButtons] = useState(false);

    if (!isOpen) return null;

    const handleMarkAsConnected = () => {
        setIsConnected(true);
        setShowInterestButtons(true);
    };

    const handleInterested = () => {
        setShowInterestButtons(false);
        onClose();
        if (onScheduleOpen) {
            onScheduleOpen();
        }
    };

    const handleNotInterested = () => {
        setShowInterestButtons(false);
        onClose();
    };

    const handleMarkAsNotConnected = () => {
        setIsConnected(false);
        setShowInterestButtons(false);
        onClose();
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
                        onClick={onClose}
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
                    <CustomButton
                        variant="secondary"
                        onClick={handleMarkAsNotConnected}
                        className="px-4 py-2"
                    >
                        Mark as not connected
                    </CustomButton>
                    
                    {!isConnected && (
                        <CustomButton
                            variant="primary"
                            onClick={handleMarkAsConnected}
                            className="px-4 py-2"
                        >
                            Mark as Connected
                        </CustomButton>
                    )}

                    {showInterestButtons && (
                        <>
                            <CustomButton
                                variant="primary"
                                onClick={handleInterested}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700"
                            >
                                Interested
                            </CustomButton>
                            <CustomButton
                                variant="secondary"
                                onClick={handleNotInterested}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
                            >
                                Not Interested
                            </CustomButton>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CallModal;

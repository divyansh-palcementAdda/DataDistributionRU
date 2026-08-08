import React from 'react';
import CustomButton from './CustomButton';

const CallModal = ({ isOpen, onClose, studentData }) => {
    if (!isOpen) return null;

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
                    {/* Student Avatar */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                            {studentData?.fullName 
                                ? studentData.fullName.substring(0, 2).toUpperCase() 
                                : 'NA'}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {studentData?.fullName || 'N/A'}
                            </h3>
                            <p className="text-sm text-gray-500">Student</p>
                        </div>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                                <p className="text-sm text-gray-900 font-medium">
                                    {studentData?.phoneNumber || studentData?.mobile || 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 font-medium">Email</p>
                                <p className="text-sm text-gray-900 font-medium">
                                    {studentData?.email || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t p-5">
                    <CustomButton
                        variant="secondary"
                        onClick={onClose}
                        className="px-4 py-2"
                    >
                        Close
                    </CustomButton>
                    {/* <CustomButton
                        variant="primary"
                        onClick={() => {
                            if (studentData?.phoneNumber || studentData?.mobile) {
                                window.location.href = `tel:${studentData.phoneNumber || studentData.mobile}`;
                            }
                        }}
                        className="bg-green-600 hover:bg-green-700 px-5 py-2 text-white flex items-center gap-2"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        Call Now
                    </CustomButton> */}
                </div>
            </div>
        </div>
    );
};

export default CallModal;
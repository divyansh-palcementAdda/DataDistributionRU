import React from 'react';
import CustomButton from './CustomButton';

const AccessDeniedModal = ({
    isOpen,
    onClose,
    onBackToDashboard,
    title = "Access Denied",
    message = "You don't have permission to access this resource. Please contact your administrator if you believe this is an error."
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay open z-[110]">
            <div className="modal relative z-[111]" style={{ maxWidth: '450px' }}>
                <div className="modal-header border-b border-gray-100 pb-3 mb-3">
                    <div className="modal-title text-red-600 flex items-center gap-2 font-semibold">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {title}
                    </div>
                    <CustomButton variant="ghost" className="btn-icon" onClick={onClose}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </CustomButton>
                </div>

                <div className="modal-body py-2">
                    <div className="text-gray-600 text-sm">
                        {message}
                    </div>
                </div>

                <div className="modal-footer pt-4 mt-2 border-t border-gray-100 flex justify-end gap-3" style={{ justifyContent: 'flex-end', gap: '12px' }}>
                    <CustomButton
                        onClick={onBackToDashboard}
                        className="bg-blue-600 hover:bg-blue-700 text-white border-transparent"
                        style={{ backgroundColor: '#2563eb', color: 'white', borderColor: '#2563eb' }}
                    >
                        Back to Dashboard
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

export default AccessDeniedModal;

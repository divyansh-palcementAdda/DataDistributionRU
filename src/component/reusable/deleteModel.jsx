import React from 'react';
import CustomButton from './CustomButton';

const DeleteModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Deletion",
    message = "Are you sure you want to delete this item? This action cannot be undone.",
    isLoading = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay open">
            <div className="modal" style={{ maxWidth: '400px' }}>
                <div className="modal-header border-b border-gray-100 pb-3 mb-3">
                    <div className="modal-title text-red-600 flex items-center gap-2 font-semibold">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                        </svg>
                        {title}
                    </div>
                    <CustomButton variant="ghost" className="btn-icon" onClick={onClose} disabled={isLoading}>
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
                    <CustomButton variant="secondary" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </CustomButton>
                    <CustomButton
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white border-transparent"
                        style={{ backgroundColor: '#dc2626', color: 'white', borderColor: '#dc2626' }}
                    >
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;

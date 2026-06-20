import React from 'react';
import CustomButton from '../CustomButton';

const ViewLeadSourceModal = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <div className="modal-overlay open">
            <div className="modal">
                <div className="modal-header">
                    <div className="modal-title">View Lead Source Details</div>
                    <CustomButton variant="ghost" className="btn-icon" onClick={onClose}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </CustomButton>
                </div>

                <div className="modal-body">
                    {data ? (
                        <div className="flex flex-col gap-4 text-sm" style={{ padding: '10px 0' }}>


                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Name</span>
                                <span className="font-medium text-gray-800">{data.name || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Description</span>
                                <span className="text-gray-800 p-3 bg-gray-50 rounded-md border border-gray-100 min-h-[60px]">
                                    {data.description || 'N/A'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-2 pt-4 border-t border-gray-100">
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Created At</span>
                                    <span className="text-gray-700">{formatDate(data.createdAt)}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Updated At</span>
                                    <span className="text-gray-700">{formatDate(data.updatedAt)}</span>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Status</span>
                                <div>
                                    {data.active ? (
                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Active</span>
                                    ) : (
                                        <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Inactive</span>
                                    )}
                                </div>
                            </div>
                        </div>

                    ) : (
                        <div className="text-center py-6 text-gray-500">
                            <p>No details available to display.</p>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <CustomButton variant="secondary" onClick={onClose}>
                        Close
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

export default ViewLeadSourceModal;

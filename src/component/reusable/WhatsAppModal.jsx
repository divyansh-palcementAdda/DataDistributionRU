import React, { useState } from 'react';
import CustomButton from './CustomButton';

const WhatsAppModal = ({ isOpen, onClose, studentData }) => {
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleSend = () => {
        if (studentData?.phoneNumber || studentData?.mobile) {
            const phone = studentData.phoneNumber || studentData.mobile;
            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl overflow-hidden">
                {/* Header - WhatsApp Green */}
                <div className="bg-[#128C7E] text-white p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                                {studentData?.fullName 
                                    ? studentData.fullName.substring(0, 2).toUpperCase() 
                                    : 'NA'}
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">
                                    {studentData?.fullName || 'N/A'}
                                </h3>
                                <p className="text-xs text-white/80">
                                    {studentData?.phoneNumber || studentData?.mobile || 'N/A'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Body - Chat Area */}
                <div className="bg-[#ECE5DD] p-4 min-h-[200px]">
                    {/* Chat Background Pattern */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#128C7E] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {studentData?.fullName 
                                    ? studentData.fullName.substring(0, 2).toUpperCase() 
                                    : 'NA'}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 font-medium mb-1">
                                    {studentData?.fullName || 'Student'}
                                </p>
                                <div className="bg-[#DCF8C6] rounded-lg p-3 max-w-[280px]">
                                    <p className="text-sm text-gray-800">
                                        Hi! I'm interested in learning more about your courses.
                                    </p>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">
                                    {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Student Info Card */}
                    <div className="mt-4 bg-white rounded-lg p-3 shadow-sm">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                                <span className="text-xs text-gray-600">
                                    {studentData?.phoneNumber || studentData?.mobile || 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                <span className="text-xs text-gray-600">
                                    {studentData?.email || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - Message Input */}
                <div className="bg-gray-100 p-3 border-t">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="w-full px-4 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-[#128C7E] text-sm"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && message.trim()) {
                                        handleSend();
                                    }
                                }}
                            />
                        </div>
                        <CustomButton
                            variant="primary"
                            onClick={handleSend}
                            disabled={!message.trim()}
                            className="bg-[#128C7E] hover:bg-[#075E54] p-2.5 rounded-full text-white flex items-center justify-center"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </CustomButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppModal;
import React from 'react';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    isLoading = false,
    variant = "danger",
    // Optional inline remark field
    showRemark = false,
    remarkValue = "",
    onRemarkChange = null,
    remarkPlaceholder = "Enter remark...",
    remarkLabel = "Remark",
    remarkError = "",
}) => {
    if (!isOpen) return null;

    const getConfirmButtonStyle = () => {
        if (variant === "danger") {
            return "bg-red-600 hover:bg-red-700 text-white";
        } else if (variant === "warning") {
            return "bg-amber-600 hover:bg-amber-700 text-white";
        } else {
            return "bg-blue-600 hover:bg-blue-700 text-white";
        }
    };

    const getIconColor = () => {
        if (variant === "danger") {
            return "text-red-600";
        } else if (variant === "warning") {
            return "text-amber-600";
        } else {
            return "text-blue-600";
        }
    };

    const getIcon = () => {
        if (variant === "danger") {
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            );
        } else if (variant === "warning") {
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
            );
        } else {
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
            );
        }
    };

    return (
        <div
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${variant === 'danger' ? 'bg-red-50 border border-red-100' : variant === 'warning' ? 'bg-amber-50 border border-amber-100' : 'bg-blue-50 border border-blue-100'} flex items-center justify-center ${getIconColor()} shadow-2xs`}>
                            {getIcon()}
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 leading-tight">
                                {title}
                            </h2>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
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
                <div className="p-6 space-y-4">
                    <div className="text-slate-600 text-sm">
                        {message}
                    </div>

                    {showRemark && (
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-700">
                                {remarkLabel}
                                <span className="text-rose-500 ml-0.5">*</span>
                            </label>
                            <textarea
                                rows={3}
                                value={remarkValue}
                                onChange={(e) => onRemarkChange && onRemarkChange(e.target.value)}
                                placeholder={remarkPlaceholder}
                                disabled={isLoading}
                                className={`w-full rounded-xl border px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:bg-slate-50
                                    ${remarkError
                                        ? 'border-rose-400 focus:ring-rose-300 bg-rose-50/30'
                                        : 'border-slate-200 focus:ring-blue-300 bg-white'
                                    }`}
                            />
                            {remarkError && (
                                <p className="text-xs text-rose-600 flex items-center gap-1">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {remarkError}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200 transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold ${getConfirmButtonStyle()} transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer`}
                    >
                        {isLoading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;

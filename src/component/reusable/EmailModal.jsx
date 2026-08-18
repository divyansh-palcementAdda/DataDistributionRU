import React, { useState } from 'react';
import CustomButton from './CustomButton';

const EmailModal = ({
  isOpen,
  onClose,
  studentData,
  courses = [],
  onSend, // async (payload) => response
}) => {
  const [courseId, setCourseId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [imageId, setImageId] = useState('');
  const [recipientOverride, setRecipientOverride] = useState('');
  const [customMessageOverride, setCustomMessageOverride] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setCourseId('');
    setTemplateId('');
    setImageId('');
    setRecipientOverride('');
    setCustomMessageOverride('');
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSend = async () => {
    if (!courseId) {
      setError('Course is required.');
      return;
    }
    if (!templateId) {
      setError('Template ID is required.');
      return;
    }
    setError('');
    setSending(true);
    try {
      const payload = {
        courseId,
        templateId,
        ...(imageId && { imageId }),
        ...(recipientOverride && { recipientOverride }),
        ...(customMessageOverride && { customMessageOverride }),
      };
      await onSend(payload);
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setError('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const email = studentData?.email || '';
  const initials = studentData?.fullName
    ? studentData.fullName.substring(0, 2).toUpperCase()
    : 'NA';

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-blue-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                {initials}
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">
                  {studentData?.fullName || 'N/A'}
                </h3>
                <p className="text-xs text-white/80">{email || 'No email'}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 bg-gray-50">

          {/* Success */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-sm text-green-700 font-medium">Email sent successfully!</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="text-xs text-red-600">{error}</span>
            </div>
          )}

          <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">

            {/* Course */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Select a course...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.courseName} ({c.courseCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Template ID */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Template ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                placeholder="Enter template ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Image ID */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Image ID <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={imageId}
                onChange={(e) => setImageId(e.target.value)}
                placeholder="Enter image ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Recipient Override */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Recipient Override <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="email"
                value={recipientOverride}
                onChange={(e) => setRecipientOverride(e.target.value)}
                placeholder={email || 'Enter alternate email...'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {email && (
                <p className="text-[10px] text-gray-400 mt-1">
                  Leave blank to send to lead's email: {email}
                </p>
              )}
            </div>

            {/* Custom Message Override */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Custom Message <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={customMessageOverride}
                onChange={(e) => setCustomMessageOverride(e.target.value)}
                placeholder="Override the template message..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-5 py-4 border-t border-gray-100 flex gap-3">
          <CustomButton
            variant="secondary"
            onClick={handleClose}
            className="flex-1 text-sm py-2"
          >
            Cancel
          </CustomButton>
          <CustomButton
            variant="primary"
            onClick={handleSend}
            disabled={sending || success}
            className="flex-1 text-sm py-2 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Send Email
              </>
            )}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;

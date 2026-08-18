import React, { useState } from 'react';
import CustomButton from './CustomButton';

const WhatsAppModal = ({
  isOpen,
  onClose,
  studentData,
  leadId,
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
      setError('Failed to send WhatsApp message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const phone = studentData?.phoneNumber || studentData?.mobile || '';
  const initials = studentData?.fullName
    ? studentData.fullName.substring(0, 2).toUpperCase()
    : 'NA';

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#128C7E] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                {initials}
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">
                  {studentData?.fullName || 'N/A'}
                </h3>
                <p className="text-xs text-white/80">{phone || 'N/A'}</p>
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
        <div className="p-5 space-y-4 bg-[#ECE5DD]">

          {/* Success State */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-sm text-green-700 font-medium">WhatsApp message sent successfully!</span>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#128C7E] focus:border-transparent bg-white"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#128C7E] focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#128C7E] focus:border-transparent"
              />
            </div>

            {/* Recipient Override */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Recipient Override <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={recipientOverride}
                onChange={(e) => setRecipientOverride(e.target.value)}
                placeholder={phone || 'Enter alternate phone number...'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#128C7E] focus:border-transparent"
              />
              {phone && (
                <p className="text-[10px] text-gray-400 mt-1">
                  Leave blank to send to lead's number: {phone}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#128C7E] focus:border-transparent resize-none"
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
            className="flex-1 text-sm py-2 bg-[#128C7E] hover:bg-[#075E54] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
                Send WhatsApp
              </>
            )}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppModal;

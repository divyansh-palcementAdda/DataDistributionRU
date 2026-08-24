import React, { useState, useEffect } from 'react';
import CustomButton from './CustomButton';
import { getCourseImages } from '../../Services/course/course';
import { getCourseTemplatesByCourseId } from '../../Services/templateManagement/template';

const EmailModal = ({
  isOpen,
  onClose,
  studentData,
  selectedCourse,
  onSend, // async (payload) => response
}) => {
  const [templateId, setTemplateId] = useState('');
  const [imageId, setImageId] = useState('');
  const [recipientOverride, setRecipientOverride] = useState('');
  const [customMessageOverride, setCustomMessageOverride] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [courseImages, setCourseImages] = useState([]);
  const [courseTemplates, setCourseTemplates] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  useEffect(() => {
    const fetchCourseImages = async () => {
      if (selectedCourse) {
        setImagesLoading(true);
        try {
          const res = await getCourseImages(selectedCourse, true);
          if (res?.success && res?.data) {
            setCourseImages(res.data);
          } else {
            setCourseImages([]);
          }
        } catch (err) {
          console.error('Failed to fetch course images', err);
          setCourseImages([]);
        } finally {
          setImagesLoading(false);
        }
      } else {
        setCourseImages([]);
      }
    };
    fetchCourseImages();
  }, [selectedCourse]);

  useEffect(() => {
    const fetchCourseTemplates = async () => {
      if (selectedCourse) {
        setTemplatesLoading(true);
        try {
          const res = await getCourseTemplatesByCourseId(selectedCourse);
          if (res?.success && res?.data) {
            setCourseTemplates(res.data);
          } else {
            setCourseTemplates([]);
          }
        } catch (err) {
          console.error('Failed to fetch course templates', err);
          setCourseTemplates([]);
        } finally {
          setTemplatesLoading(false);
        }
      } else {
        setCourseTemplates([]);
      }
    };
    fetchCourseTemplates();
  }, [selectedCourse]);

  if (!isOpen) return null;

  const resetForm = () => {
    setTemplateId('');
    setImageId('');
    setRecipientOverride('');
    setCustomMessageOverride('');
    setError('');
    setSuccess(false);
    setCourseImages([]);
    setCourseTemplates([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSend = async () => {
    if (!selectedCourse) {
      setError('Please select a course from the info panel first.');
      return;
    }
    if (!templateId) {
      setError('Please select an email template.');
      return;
    }
    setError('');
    setSending(true);
    try {
      const payload = {
        courseId: selectedCourse,
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

            {!selectedCourse && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-sm mb-2">No course selected</div>
                <div className="text-gray-500 text-xs">Please select a course from the info panel to view templates and images</div>
              </div>
            )}

            {/* Templates */}
            {selectedCourse && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Email Template <span className="text-red-500">*</span>
                </label>
                {templatesLoading ? (
                  <p className="text-[10px] text-gray-400">Loading templates...</p>
                ) : courseTemplates.length > 0 ? (
                  <div className="space-y-2">
                    {courseTemplates
                      .filter(template => template.channel?.toLowerCase() === 'email')
                      .map((template) => (
                      <div
                        key={template.id}
                        onClick={() => setTemplateId(template.id)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          templateId === template.id 
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-xs font-semibold text-gray-800">{template.name}</p>
                          {templateId === template.id && (
                            <div className="bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 mb-1">Subject: {template.subject}</p>
                        <p className="text-[9px] text-gray-400">Channel: {template.channel}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-400">No email templates available for this course</p>
                )}
              </div>
            )}

            {/* Course Images */}
            {selectedCourse && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Course Image <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                {imagesLoading ? (
                  <p className="text-[10px] text-gray-400">Loading images...</p>
                ) : courseImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {courseImages.map((img) => (
                      <div
                        key={img.id}
                        onClick={() => setImageId(img.id)}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          imageId === img.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={img.imageUrl}
                          alt={img.displayName}
                          className="w-full h-16 object-cover"
                        />
                        {imageId === img.id && (
                          <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-400">No images available for this course</p>
                )}
              </div>
            )}

            {/* Recipient Override - Hidden Field */}
            <input
              type="hidden"
              value={recipientOverride}
              onChange={(e) => setRecipientOverride(e.target.value)}
            />

            {/* Custom Message Override - Hidden Field */}
            <input
              type="hidden"
              value={customMessageOverride}
              onChange={(e) => setCustomMessageOverride(e.target.value)}
            />
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

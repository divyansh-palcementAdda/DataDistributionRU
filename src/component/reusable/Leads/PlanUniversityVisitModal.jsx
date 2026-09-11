import React, { useState, useEffect } from 'react';
import CustomButton from '../CustomButton';
import Toggle from '../custumToggle';
import { updateLead } from '../../../Services/lead/leadService';
import { useAppContext } from '../../../AppContext';

const PlanUniversityVisitModal = ({ isOpen, onClose, leadDetails, onSuccess }) => {
  const { showToast } = useAppContext();

  const [planningToVisit, setPlanningToVisit] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [visitRemarks, setVisitRemarks] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (isOpen && leadDetails) {
      setPlanningToVisit(Boolean(leadDetails.planningToVisitUniversity));
      setVisitDate(leadDetails.visitDate || '');
      setVisitTime(leadDetails.visitTime ? leadDetails.visitTime.substring(0, 5) : '');
      setVisitRemarks(leadDetails.visitRemarks || '');
      setErrors({});
      setApiError('');
    }
  }, [isOpen, leadDetails]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (planningToVisit) {
      if (!visitDate) {
        errs.visitDate = 'Visit date is required';
      }
      if (!visitTime) {
        errs.visitTime = 'Visit time is required';
      }
      if (!visitRemarks || !visitRemarks.trim()) {
        errs.visitRemarks = 'Remarks are required when planning a visit';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    const leadId = leadDetails?.id || leadDetails?.leadId;
    if (!leadId) {
      setApiError('Lead ID not found.');
      return;
    }

    setIsSaving(true);
    setApiError('');

    try {
      const payload = {
        fullName: leadDetails.fullName,
        phoneNumber: leadDetails.phoneNumber,
        alternatePhoneNumber: leadDetails.alternatePhoneNumber,
        email: leadDetails.email,
        city: leadDetails.city,
        state: leadDetails.state,
        country: leadDetails.country,
        preferredStudyState: leadDetails.preferredStudyState,
        preferredStudyCity: leadDetails.preferredStudyCity,
        leadSourceIds: leadDetails.leadSources?.map((s) => s.id) || [],
        sourceDetails: leadDetails.sourceDetails,
        interestedCourseIds: leadDetails.interestedCourses?.map((c) => c.id) || [],
        courseId: leadDetails.course?.id || '',
        registeredCourseId: leadDetails.registeredCourse?.id || leadDetails.course?.id || '',
        boardId: leadDetails.board?.id || '',
        gradeId: leadDetails.grade?.id || '',
        departmentId: leadDetails.department?.id || '',
        remarks: leadDetails.remarks,
        assignedToUserId: leadDetails.assignedTo?.id || '',
        statusId: leadDetails.currentStatus?.id || '',
        active: leadDetails.active !== undefined ? leadDetails.active : true,
        nextFollowUpDate: leadDetails.nextFollowUpDate || null,
        // Visit planning fields
        planningToVisitUniversity: planningToVisit,
        visitDate: planningToVisit && visitDate ? visitDate : null,
        visitTime: planningToVisit && visitTime ? (visitTime.length === 5 ? `${visitTime}:00` : visitTime) : null,
        visitRemarks: planningToVisit ? visitRemarks.trim() : null,
      };

      const response = await updateLead(leadId, payload);
      if (response?.data?.success || response?.status === 200) {
        if (showToast) {
          showToast('success', planningToVisit ? 'University visit plan saved successfully' : 'Visit plan updated');
        }
        if (onSuccess) {
          onSuccess(response?.data?.data || response?.data);
        }
        onClose();
      } else {
        setApiError(response?.data?.message || 'Failed to save university visit plan');
      }
    } catch (err) {
      console.error('Error updating university visit planning:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to save university visit plan';
      setApiError(msg);
      if (showToast) {
        showToast('error', msg);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: '520px' }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Plan University Visit
          </div>
          <CustomButton variant="ghost" className="btn-icon" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </CustomButton>
        </div>

        {/* Body */}
        <div className="modal-body space-y-4">
          {leadDetails && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm font-semibold text-gray-800">
                {leadDetails.fullName || 'Lead'}
              </div>
              <div className="text-xs text-gray-500 flex flex-wrap gap-2 mt-0.5">
                <span>{leadDetails.leadCode || 'N/A'}</span>
                <span>•</span>
                <span>{leadDetails.phoneNumber || 'N/A'}</span>
                {leadDetails.currentStatus?.name && (
                  <>
                    <span>•</span>
                    <span className="font-medium text-blue-600">{leadDetails.currentStatus.name}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Toggle Section */}
          <div className="flex items-center justify-between p-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
            <div>
              <div className="text-sm font-bold text-gray-800">Planning to Visit University</div>
              <div className="text-xs text-gray-500">Enable if the student intends to visit the campus</div>
            </div>
            <Toggle
              checked={planningToVisit}
              onChange={(val) => {
                setPlanningToVisit(val);
                if (!val) {
                  setErrors({});
                }
              }}
            />
          </div>

          {planningToVisit && (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Visit Date */}
                <div className="form-group">
                  <label className="form-label text-xs font-semibold text-gray-700 mb-1">
                    Visit Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`form-control text-sm w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.visitDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={visitDate}
                    onChange={(e) => {
                      setVisitDate(e.target.value);
                      if (errors.visitDate) setErrors((prev) => ({ ...prev, visitDate: null }));
                    }}
                  />
                  {errors.visitDate && (
                    <span className="text-[11px] text-red-500 mt-1 block">{errors.visitDate}</span>
                  )}
                </div>

                {/* Visit Time */}
                <div className="form-group">
                  <label className="form-label text-xs font-semibold text-gray-700 mb-1">
                    Visit Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    className={`form-control text-sm w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.visitTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={visitTime}
                    onChange={(e) => {
                      setVisitTime(e.target.value);
                      if (errors.visitTime) setErrors((prev) => ({ ...prev, visitTime: null }));
                    }}
                  />
                  {errors.visitTime && (
                    <span className="text-[11px] text-red-500 mt-1 block">{errors.visitTime}</span>
                  )}
                </div>
              </div>

              {/* Remarks */}
              <div className="form-group">
                <label className="form-label text-xs font-semibold text-gray-700 mb-1">
                  Remarks / Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="3"
                  className={`form-control text-sm w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.visitRemarks ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g. Student wants to visit campus with parents on Saturday morning..."
                  value={visitRemarks}
                  onChange={(e) => {
                    setVisitRemarks(e.target.value);
                    if (errors.visitRemarks) setErrors((prev) => ({ ...prev, visitRemarks: null }));
                  }}
                />
                {errors.visitRemarks && (
                  <span className="text-[11px] text-red-500 mt-1 block">{errors.visitRemarks}</span>
                )}
              </div>
            </div>
          )}

          {apiError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {apiError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <CustomButton variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </CustomButton>
          <CustomButton variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Visit Plan'}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default PlanUniversityVisitModal;

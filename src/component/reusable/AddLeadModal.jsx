import { useState } from 'react';
import CustomInput from './CustomInput';
import CustomButton from './CustomButton';
import { useAppContext } from '../../AppContext';
import { createLead } from '../../Services/lead/leadService';

const AddLeadModal = () => {
  const { isAddLeadModalOpen, closeAddLeadModal, showToast } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    alternatePhoneNumber: '',
    email: '',
    city: '',
    state: '',
    country: '',
    sourceDetails: '',
    courseInterested: '',
    remarks: '',
    nextFollowUpDate: '',
  });

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phoneNumber: '',
      alternatePhoneNumber: '',
      email: '',
      city: '',
      state: '',
      country: '',
      sourceDetails: '',
      courseInterested: '',
      remarks: '',
      nextFollowUpDate: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.phoneNumber) {
      showToast('Full Name and Phone Number are required!', 'error');
      return;
    }

    const payload = {
      ...formData,
      active: true,
      nextFollowUpDate: formData.nextFollowUpDate
        ? new Date(formData.nextFollowUpDate).toISOString()
        : new Date().toISOString(),
    };

    setLoading(true);
    try {
      const response = await createLead(payload);
      if (response?.status === 200 || response?.status === 201) {
        showToast('Lead added successfully!');
        resetForm();
        closeAddLeadModal();
      } else {
        const msg =
          response?.response?.data?.message ||
          response?.message ||
          'Failed to add lead. Please try again.';
        showToast(msg, 'error');
      }
    } catch (err) {
      showToast('Something went wrong!', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAddLeadModalOpen) return null;

  return (
    <div className="modal-overlay open">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Add New Lead</div>
          <CustomButton variant="ghost" className="btn-icon" onClick={closeAddLeadModal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </CustomButton>
        </div>

        <div className="modal-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CustomInput
              label="Full Name *"
              placeholder="Priya Kumar"
              value={formData.fullName}
              onChange={handleChange('fullName')}
            />
            <CustomInput
              label="Phone Number *"
              placeholder="+91 98765 43210"
              value={formData.phoneNumber}
              onChange={handleChange('phoneNumber')}
            />
            <CustomInput
              label="Alternate Phone"
              placeholder="+91 91234 56789"
              value={formData.alternatePhoneNumber}
              onChange={handleChange('alternatePhoneNumber')}
            />
            <CustomInput
              label="Email"
              placeholder="priya@gmail.com"
              value={formData.email}
              onChange={handleChange('email')}
            />
            <CustomInput
              label="City"
              placeholder="Bangalore"
              value={formData.city}
              onChange={handleChange('city')}
            />
            <CustomInput
              label="State"
              placeholder="Karnataka"
              value={formData.state}
              onChange={handleChange('state')}
            />
            <CustomInput
              label="Country"
              placeholder="India"
              value={formData.country}
              onChange={handleChange('country')}
            />
            <CustomInput
              label="Source Details"
              placeholder="e.g. Google Ads, Facebook"
              value={formData.sourceDetails}
              onChange={handleChange('sourceDetails')}
            />
            <CustomInput
              label="Course Interested"
              placeholder="e.g. Full Stack Development"
              value={formData.courseInterested}
              onChange={handleChange('courseInterested')}
            />
            <div>
              <label className="form-label">Next Follow-Up Date</label>
              <input
                type="datetime-local"
                className="form-control"
                value={formData.nextFollowUpDate}
                onChange={handleChange('nextFollowUpDate')}
              />
            </div>
          </div>

          <div className="form-group mt-3">
            <label className="form-label">Remarks</label>
            <textarea
              className="form-control"
              rows="2"
              placeholder="Initial remarks…"
              value={formData.remarks}
              onChange={handleChange('remarks')}
            />
          </div>
        </div>

        <div className="modal-footer">
          <CustomButton variant="secondary" onClick={closeAddLeadModal} disabled={loading}>
            Cancel
          </CustomButton>
          <CustomButton variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Adding...' : 'Add Lead'}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default AddLeadModal;
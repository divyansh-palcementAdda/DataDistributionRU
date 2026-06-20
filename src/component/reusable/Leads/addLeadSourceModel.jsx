import { useState, useEffect } from 'react';
import CustomInput from '../CustomInput';
import CustomButton from '../CustomButton';
import CustomToggle from '../custumToggle';
import { useAppContext } from '../../../AppContext';
import { createLeadSource, updateLeadSource } from '../../../Services/leadsource/leadSourceService';

const AddLeadSourceModal = ({ isOpen, onClose, editData }) => {
  const { showToast } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true,
  });

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleChange = (field) => (val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      active: true,
    });
  };

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          name: editData.name || '',
          description: editData.description || '',
          active: editData.active ?? true,
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, editData]);

  const handleSubmit = async () => {
    if (!formData.name) {
      showToast('Name is required!', 'error');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (editData) {
        response = await updateLeadSource(editData.id, formData);
      } else {
        response = await createLeadSource(formData);
      }
      
      if (response?.status === 200 || response?.status === 201 || response?.data?.success) {
        showToast(editData ? 'Lead Source updated successfully!' : 'Lead Source added successfully!');
        resetForm();
        if (onClose) onClose(true); // true = refresh list
      } else {
        const msg =
          response?.response?.data?.message ||
          response?.data?.message ||
          response?.message ||
          `Failed to ${editData ? 'update' : 'add'} lead source. Please try again.`;
        showToast(msg, 'error');
      }
    } catch (err) {
      showToast('Something went wrong!', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay open">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{editData ? 'Edit Lead Source' : 'Add New Lead Source'}</div>
          <CustomButton variant="ghost" className="btn-icon" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </CustomButton>
        </div>

        <div className="modal-body">
          <div className="grid grid-cols-1 gap-3">
            <CustomInput
              label="Name *"
              placeholder="e.g. WhatsApp"
              value={formData.name}
              onChange={handleChange('name')}
            />
            
            <div className="form-group mt-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Description of the lead source..."
                value={formData.description}
                onChange={handleChange('description')}
              />
            </div>

            <div className="form-group mt-3">
              <CustomToggle
                id="activeStatus"
                label="Active"
                checked={formData.active}
                onChange={handleToggleChange('active')}
                color="blue"
                size="md"
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <CustomButton variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </CustomButton>
          <CustomButton variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? (editData ? 'Updating...' : 'Adding...') : (editData ? 'Update Lead Source' : 'Add Lead Source')}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default AddLeadSourceModal;

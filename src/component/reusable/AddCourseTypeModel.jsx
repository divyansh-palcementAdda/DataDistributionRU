import React, { useState, useEffect } from 'react';
import CustomButton from './CustomButton';
import CustomInput from './CustomInput';
import { createCourseType, updateCourseType } from '../../Services/courseTypes/courseTypeService';
import { toast } from 'react-toastify';
import Toggle from './custumToggle';

const AddCourseModel = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData = null,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          description: initialData.description || '',
          status: initialData.status || 'ACTIVE'
        });
      } else {
        setFormData({
          name: '',
          description: '',
          status: 'ACTIVE'
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Course name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        setIsSubmitting(true);
        if (initialData && initialData.id) {
          await updateCourseType(initialData.id, formData);
          toast.success("Course type updated successfully!");
        } else {
          await createCourseType(formData);
          toast.success("Course type created successfully!");
        }
        onSubmit(formData);
      } catch (error) {
        toast.error(error.message || `Failed to ${initialData ? 'update' : 'create'} course type`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="modal-header border-b border-gray-100 pb-3 mb-4">
          <div className="modal-title flex items-center gap-2 font-semibold text-gray-800 text-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {initialData ? 'Edit Course' : 'Add New Course'}
          </div>
          <CustomButton variant="ghost" className="btn-icon" onClick={onClose} disabled={isLoading || isSubmitting}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </CustomButton>
        </div>

        <div className="modal-body py-2">
          <form id="addCourseForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <CustomInput
              label="Course Name"
              name="name"
              placeholder="Enter course name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-semibold text-gray-700 ml-1">Description</label>
              <textarea
                name="description"
                placeholder="Enter course description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`px-4 py-2 border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                }`}
              />
              {errors.description && <span className="text-xs text-red-500 mt-1 ml-1">{errors.description}</span>}
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-semibold text-gray-700 ml-1">Status</label>
              <div className="flex items-center gap-3 ml-1 mt-1">
                <Toggle
                  checked={formData.status === 'ACTIVE'}
                  onChange={() => {
                    setFormData(prev => ({
                      ...prev,
                      status: prev.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                    }));
                  }}
                />
                <span className={`text-sm font-medium ${formData.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-500'}`}>
                  {formData.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

          </form>
        </div>

        <div className="modal-footer pt-4 mt-4 border-t border-gray-100 flex justify-end gap-3" style={{ justifyContent: 'flex-end', gap: '12px' }}>
          <CustomButton variant="secondary" onClick={onClose} disabled={isLoading || isSubmitting}>
            Cancel
          </CustomButton>
          <CustomButton
            type="submit"
            form="addCourseForm"
            variant="primary"
            disabled={isLoading || isSubmitting}
          >
            {isSubmitting || isLoading ? 'Saving...' : 'Save Course'}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default AddCourseModel;

import React, { useEffect, useState } from 'react';
import CustomButton from '../CustomButton';
import CustomInput from '../CustomInput';
import { createRole, updateRole } from '../../../Services/role/roleService';

const AddEditRoleModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      name: initialData?.name || '',
      description: initialData?.description || '',
    });
    setErrors({});
    setSubmitError('');
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Role name is required';
    }

    if (!formData.description.trim()) {
      nextErrors.description = 'Description is required';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      setSubmitError('');

      const roleId = initialData?.id ?? initialData?._id ?? initialData?.roleId;
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      const response = roleId
        ? await updateRole(roleId, payload)
        : await createRole(payload);

      const isSuccess = response?.status >= 200 && response?.status < 300;

      if (!isSuccess) {
        const message =
          response?.response?.data?.message ||
          response?.response?.data?.error ||
          response?.message ||
          'Failed to save role.';
        setSubmitError(message);
        return;
      }

      const savedRole = response?.data?.data ?? response?.data ?? payload;
      await onSubmit?.(savedRole);
      onClose?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: '520px', width: '100%' }}>
        <div className="modal-header border-b border-gray-100 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11c1.657 0 3-1.567 3-3.5S17.657 4 16 4s-3 1.567-3 3.5S14.343 11 16 11Zm-8 0c1.657 0 3-1.567 3-3.5S9.657 4 8 4 5 5.567 5 7.5 6.343 11 8 11Zm0 2c-2.761 0-5 1.567-5 3.5V18h10v-1.5C13 14.567 10.761 13 8 13Zm8 0c-.53 0-1.03.084-1.5.233 1.29.943 2.122 2.284 2.122 3.767V18H21v-1.5c0-1.933-2.239-3.5-5-3.5Z" />
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {initialData ? 'Edit Role' : 'Add New Role'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {initialData ? 'Update the role name and description.' : 'Create a role for access and permissions.'}
              </p>
            </div>
          </div>

          <CustomButton variant="ghost" className="btn-icon" onClick={onClose} disabled={isLoading || isSubmitting}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </CustomButton>
        </div>

        <div className="modal-body py-2">
          <form id="addEditRoleForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
            {submitError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                {submitError}
              </div>
            )}

            <CustomInput
              label="Role Name"
              name="name"
              placeholder="Enter role name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-semibold text-gray-700 ml-1">Description</label>
              <textarea
                name="description"
                placeholder="Write a short description for this role"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`px-4 py-2 border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                }`}
              />
              {errors.description && (
                <span className="text-xs text-red-500 mt-1 ml-1">{errors.description}</span>
              )}
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white text-blue-600 flex items-center justify-center border border-blue-100 flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">Role summary</div>
                  <p className="text-xs text-gray-500 mt-1 leading-5">
                    Keep the name short and clear. Use the description to explain who should use this role and what it is for.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="modal-footer pt-4 mt-4 border-t border-gray-100 flex justify-end gap-3">
          <CustomButton variant="secondary" onClick={onClose} disabled={isLoading || isSubmitting}>
            Cancel
          </CustomButton>
          <CustomButton
            type="submit"
            form="addEditRoleForm"
            variant="primary"
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting ? 'Saving...' : initialData ? 'Update Role' : 'Save Role'}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default AddEditRoleModal;

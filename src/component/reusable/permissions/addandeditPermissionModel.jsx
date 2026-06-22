import { useState } from 'react';
import CustomButton from '../CustomButton';
import CustomInput from '../CustomInput';
import { createPermission, updatePermission } from '../../../Services/permissions/permissions';

const AddEditPermissionModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const modalKey = initialData?.id ?? initialData?._id ?? initialData?.permissionId ?? 'new';

  return (
    <AddEditPermissionForm
      key={modalKey}
      onClose={onClose}
      onSubmit={onSubmit}
      initialData={initialData}
      isLoading={isLoading}
    />
  );
};

const AddEditPermissionForm = ({
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || initialData?.permissionName || '',
    description: initialData?.description || '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

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
      nextErrors.name = 'Permission name is required';
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

      const permissionId = initialData?.id ?? initialData?._id ?? initialData?.permissionId;
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      const response = permissionId
        ? await updatePermission(permissionId, payload)
        : await createPermission(payload);

      const isSuccess = response?.status >= 200 && response?.status < 300;

      if (!isSuccess) {
        const message =
          response?.response?.data?.message ||
          response?.response?.data?.error ||
          response?.message ||
          'Failed to save permission.';
        setSubmitError(message);
        return;
      }

      const savedPermission = response?.data?.data ?? response?.data ?? payload;
      await onSubmit?.(savedPermission);
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2 4 5v6c0 5.25 3.44 9.74 8 11 4.56-1.26 8-5.75 8-11V5l-8-3Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-5" />
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {initialData ? 'Edit Permission' : 'Add New Permission'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {initialData ? 'Update the permission name and description.' : 'Create a permission for access control.'}
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
          <form id="addEditPermissionForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
            {submitError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                {submitError}
              </div>
            )}

            <CustomInput
              label="Permission Name"
              name="name"
              placeholder="Enter permission name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-semibold text-gray-700 ml-1">Description</label>
              <textarea
                name="description"
                placeholder="Write a short description for this permission"
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
          </form>
        </div>

        <div className="modal-footer pt-4 mt-4 border-t border-gray-100 flex justify-end gap-3">
          <CustomButton variant="secondary" onClick={onClose} disabled={isLoading || isSubmitting}>
            Cancel
          </CustomButton>
          <CustomButton
            type="submit"
            form="addEditPermissionForm"
            variant="primary"
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting ? 'Saving...' : initialData ? 'Update Permission' : 'Save Permission'}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default AddEditPermissionModal;

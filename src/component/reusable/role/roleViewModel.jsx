import React, { useEffect, useState } from 'react';
import CustomButton from '../CustomButton';
import { getRoleById } from '../../../Services/role/roleService';

const RoleViewModal = ({
  isOpen,
  onClose,
  roleId,
}) => {
  const [roleDetails, setRoleDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !roleId) {
      setRoleDetails(null);
      setError('');
      return;
    }

    let cancelled = false;

    const fetchRole = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await getRoleById(roleId);
        const isSuccess = response?.status >= 200 && response?.status < 300;

        if (!isSuccess) {
          const message =
            response?.response?.data?.message ||
            response?.response?.data?.error ||
            response?.message ||
            'Failed to load role details.';
          if (!cancelled) setError(message);
          return;
        }

        const data = response?.data?.data ?? response?.data ?? null;

        if (!cancelled) {
          setRoleDetails(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || err?.message || 'Failed to load role details.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchRole();

    return () => {
      cancelled = true;
    };
  }, [isOpen, roleId]);

  if (!isOpen) return null;

  const currentRole = roleDetails || {};
  const statusLabel = currentRole.active ? 'Active' : 'Inactive';
  const statusClass = currentRole.active
    ? 'bg-green-50 text-green-700 border-green-100'
    : 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: '560px', width: '100%' }}>
        <div className="modal-header border-b border-gray-100 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z" />
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800">Role Details</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                View role information from the API.
              </p>
            </div>
          </div>

          <CustomButton variant="ghost" className="btn-icon" onClick={onClose} disabled={isLoading}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </CustomButton>
        </div>

        <div className="modal-body py-2">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-gray-500">Loading role details...</div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs font-medium text-gray-500">Role Name</div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    {currentRole.name || 'Unnamed role'}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs font-medium text-gray-500">Status</div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusClass}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-medium text-gray-500">Role ID</div>
                  <div className="mt-1 text-sm font-semibold text-gray-800 break-all">
                    {currentRole.id || roleId || 'N/A'}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-medium text-gray-500">Users</div>
                  <div className="mt-1 text-sm font-semibold text-gray-800">
                    {currentRole.userCount ?? 0}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-medium text-gray-500">Active</div>
                  <div className="mt-1 text-sm font-semibold text-gray-800">
                    {currentRole.active ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="text-xs font-medium text-gray-500">Description</div>
                <p className="mt-2 text-sm text-gray-700 leading-6">
                  {currentRole.description || 'No description available.'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer pt-4 mt-4 border-t border-gray-100 flex justify-end">
          <CustomButton variant="primary" onClick={onClose}>
            Close
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default RoleViewModal;

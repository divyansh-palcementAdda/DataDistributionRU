import { useEffect, useState } from 'react';
import CustomButton from '../CustomButton';
import { getPermissionById } from '../../../Services/permissions/permissions';

const PermissionViewModal = ({
  isOpen,
  onClose,
  permissionId,
}) => {
  if (!isOpen) return null;

  return (
    <PermissionViewContent
      key={permissionId || 'empty'}
      onClose={onClose}
      permissionId={permissionId}
    />
  );
};

const PermissionViewContent = ({
  onClose,
  permissionId,
}) => {
  const [permissionDetails, setPermissionDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(permissionId));
  const [error, setError] = useState(permissionId ? '' : 'Permission id not found.');

  useEffect(() => {
    if (!permissionId) {
      return;
    }

    let cancelled = false;

    const fetchPermission = async () => {
      try {
        const response = await getPermissionById(permissionId);
        const isSuccess = response?.status >= 200 && response?.status < 300;

        if (!isSuccess) {
          const message =
            response?.response?.data?.message ||
            response?.response?.data?.error ||
            response?.message ||
            'Failed to load permission details.';
          if (!cancelled) setError(message);
          return;
        }

        const data = response?.data?.data ?? response?.data ?? null;

        if (!cancelled) {
          setPermissionDetails(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || err?.message || 'Failed to load permission details.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchPermission();

    return () => {
      cancelled = true;
    };
  }, [permissionId]);

  const currentPermission = permissionDetails || {};
  const permissionName = currentPermission.name || currentPermission.permissionName || 'Unnamed permission';
  const statusValue = currentPermission.active ?? currentPermission.enabled;
  const hasStatus = typeof statusValue === 'boolean';
  const statusClass = statusValue
    ? 'bg-green-50 text-green-700 border-green-100'
    : 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: '560px', width: '100%' }}>
        <div className="modal-header border-b border-gray-100 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2 4 5v6c0 5.25 3.44 9.74 8 11 4.56-1.26 8-5.75 8-11V5l-8-3Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-5" />
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800">Permission Details</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                View permission information from the API.
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
            <div className="py-8 text-center text-sm text-gray-500">Loading permission details...</div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs font-medium text-gray-500">Permission Name</div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    {permissionName}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs font-medium text-gray-500">Permission ID</div>
                  <div className="mt-1 text-sm font-semibold text-gray-800 break-all">
                    {currentPermission.id || currentPermission.permissionId || permissionId || 'N/A'}
                  </div>
                </div>
              </div>

              {hasStatus && (
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-medium text-gray-500">Status</div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusClass}`}>
                      {statusValue ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="text-xs font-medium text-gray-500">Description</div>
                <p className="mt-2 text-sm text-gray-700 leading-6">
                  {currentPermission.description || 'No description available.'}
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

export default PermissionViewModal;

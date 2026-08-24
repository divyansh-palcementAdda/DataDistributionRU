import React, { useEffect, useState } from 'react';
import CustomButton from '../CustomButton';

const ViewUserModal = ({
  isOpen,
  onClose,
  userData,
}) => {
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !userData) {
      setUserDetails(null);
      return;
    }

    setIsLoading(true);
    setUserDetails(userData);
    setIsLoading(false);
  }, [isOpen, userData]);

  if (!isOpen) return null;

  const currentUser = userDetails || {};
  const statusLabel = currentUser.active ? 'Active' : 'Inactive';
  const statusClass = currentUser.active
    ? 'bg-green-50 text-green-700 border-green-100'
    : 'bg-gray-100 text-gray-600 border-gray-200';

  const name = currentUser.name || (currentUser.firstName && currentUser.lastName ? `${currentUser.firstName} ${currentUser.lastName}` : currentUser.firstName) || 'Unknown';

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
              <h2 className="text-lg font-semibold text-gray-800">User Details</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                View user information.
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
            <div className="py-8 text-center text-sm text-gray-500">Loading user details...</div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs font-medium text-gray-500">Name</div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    {name}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-medium text-gray-500">Email</div>
                  <div className="mt-1 text-sm font-semibold text-gray-800 break-all">
                    {currentUser.email || 'N/A'}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-medium text-gray-500">Phone</div>
                  <div className="mt-1 text-sm font-semibold text-gray-800">
                    {currentUser.phone || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-medium text-gray-500">Username</div>
                  <div className="mt-1 text-sm font-semibold text-gray-800">
                    {currentUser.username || 'N/A'}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-medium text-gray-500">Department</div>
                  <div className="mt-1 text-sm font-semibold text-gray-800">
                    {currentUser.department || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-medium text-gray-500">Role</div>
                  <div className="mt-1 text-sm font-semibold text-gray-800">
                    {currentUser.roles && Array.isArray(currentUser.roles) ? currentUser.roles.join(', ').replace(/_/g, ' ') : 'User'}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-medium text-gray-500">User ID</div>
                  <div className="mt-1 text-sm font-semibold text-gray-800 break-all">
                    {currentUser.id || currentUser._id || currentUser.userId || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-medium text-gray-500">Account Locked</div>
                  <div className="mt-1 text-sm font-semibold text-gray-800">
                    {currentUser.locked ? 'Yes' : 'No'}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-medium text-gray-500">Email Verified</div>
                  <div className="mt-1 text-sm font-semibold text-gray-800">
                    {currentUser.emailVerified ? 'Yes' : 'No'}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-medium text-gray-500">Last Login</div>
                  <div className="mt-1 text-sm font-semibold text-gray-800">
                    {currentUser.lastLogin ? new Date(currentUser.lastLogin).toLocaleDateString() : (currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A')}
                  </div>
                </div>
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

export default ViewUserModal;

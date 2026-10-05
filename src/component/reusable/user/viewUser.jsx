import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../CustomButton';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiShield, 
  FiLayers, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiLock, 
  FiExternalLink,
  FiX
} from 'react-icons/fi';

const ViewUserModal = ({
  isOpen,
  onClose,
  userData,
}) => {
  const navigate = useNavigate();
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
  const userId = currentUser.id || currentUser._id || currentUser.userId;
  const statusLabel = currentUser.active ? 'Active' : 'Inactive';

  const name = currentUser.name || (currentUser.firstName && currentUser.lastName ? `${currentUser.firstName} ${currentUser.lastName}` : currentUser.firstName) || currentUser.username || 'Unknown User';

  const handleGoToDetailsPage = () => {
    if (userId) {
      onClose();
      navigate(`/counselor-details/${userId}`);
    }
  };

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: '620px', width: '100%', borderRadius: '16px' }}>
        {/* Modal Header */}
        <div className="modal-header border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 text-lg">
              <FiUser />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">User Quick Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of user permissions, account credentials, and assignments.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body py-2">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-slate-500">Loading user details...</div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Profile Bar */}
              <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-base shadow-sm">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">{name}</h3>
                    <div className="text-xs text-slate-400 mt-0.5 font-mono">ID: {userId || 'N/A'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                    currentUser.active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${currentUser.active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {statusLabel}
                  </span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Email */}
                <div className="rounded-xl border border-slate-200/80 p-3.5 bg-white">
                  <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-1">
                    <FiMail /> Email Address
                  </div>
                  <div className="text-slate-800 font-medium break-all">
                    {currentUser.email || 'N/A'}
                  </div>
                </div>

                {/* Phone */}
                <div className="rounded-xl border border-slate-200/80 p-3.5 bg-white">
                  <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-1">
                    <FiPhone /> Contact Number
                  </div>
                  <div className="text-slate-800 font-medium">
                    {currentUser.phone || currentUser.mobileNo || 'N/A'}
                  </div>
                </div>

                {/* Username */}
                <div className="rounded-xl border border-slate-200/80 p-3.5 bg-white">
                  <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-1">
                    <FiUser /> Username
                  </div>
                  <div className="text-slate-800 font-medium font-mono">
                    {currentUser.username ? `@${currentUser.username}` : 'N/A'}
                  </div>
                </div>

                {/* Department */}
                <div className="rounded-xl border border-slate-200/80 p-3.5 bg-white">
                  <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-1">
                    <FiLayers /> Department
                  </div>
                  <div className="text-slate-800 font-medium">
                    {currentUser.departments && currentUser.departments.length > 0
                      ? currentUser.departments.map(d => d.name || d.code).join(', ')
                      : currentUser.department || (currentUser.roles && (currentUser.roles.includes('ADMIN') || currentUser.roles.includes('SUPER_ADMIN')) ? 'System-Wide Access' : 'None assigned')}
                  </div>
                </div>

                {/* Role */}
                <div className="rounded-xl border border-slate-200/80 p-3.5 bg-white sm:col-span-2">
                  <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-1">
                    <FiShield /> Assigned Role(s)
                  </div>
                  <div className="text-slate-800 font-semibold mt-1 flex flex-wrap gap-1.5">
                    {currentUser.roles && Array.isArray(currentUser.roles) && currentUser.roles.length > 0 ? (
                      currentUser.roles.map((r, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {String(r).replace(/_/g, ' ')}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 font-normal">User</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Details */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Account Locked</div>
                  <div className="text-xs font-bold text-slate-800 mt-1">
                    {currentUser.locked ? 'Yes' : 'No'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Email Verified</div>
                  <div className="text-xs font-bold text-slate-800 mt-1">
                    {currentUser.emailVerified ? 'Yes' : 'No'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Last Active</div>
                  <div className="text-xs font-bold text-slate-800 mt-1 truncate">
                    {currentUser.lastLogin
                      ? new Date(currentUser.lastLogin).toLocaleDateString()
                      : currentUser.createdAt
                        ? new Date(currentUser.createdAt).toLocaleDateString()
                        : 'Never'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer border-none"
          >
            Close
          </button>

          {userId && (
            <CustomButton 
              variant="primary" 
              onClick={handleGoToDetailsPage}
              className="text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <FiExternalLink />
              Go to Full Detail Page
            </CustomButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;

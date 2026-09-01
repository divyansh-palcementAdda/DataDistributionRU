import React, { useState, useMemo } from 'react';
import CustomButton from '../CustomButton';

const UserSegregationAnalyticsModal = ({
  isOpen,
  onClose,
  data,
  loading,
  scopeTitle,
  onViewUserData
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const users = data?.users || [];
  const statusColumns = data?.statusColumns || [];

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.fullName?.toLowerCase().includes(term) ||
        u.username?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.department?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  if (!isOpen) return null;

  const getSentimentBadgeClass = (category) => {
    switch (category) {
      case 'POSITIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'NEGATIVE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'NEUTRAL':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-6xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <span>Scope</span>
              <span>•</span>
              <span className="text-white bg-white/20 px-2 py-0.5 rounded-md font-medium">{scopeTitle || 'Selected Segregation'}</span>
            </div>
            <h3 className="font-bold text-white text-xl flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              User Segregation Analytics
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all cursor-pointer"
            title="Close modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Toolbar & Search */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search user by name, email, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
              Total Active Users: <strong>{filteredUsers.length}</strong>
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50/50">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-gray-600">Loading user analytics...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-xl border border-dashed border-gray-300 p-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No User Analytics Found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'No users match your search criteria.' : 'No allocated leads for users under this scope.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-gray-100/90 text-gray-700 font-semibold border-b border-gray-200 sticky top-0 z-10 backdrop-blur-xs">
                    <tr>
                      <th className="py-3 px-4 min-w-[200px]">User</th>
                      <th className="py-3 px-3 text-center min-w-[80px]">Total Leads</th>
                      <th className="py-3 px-3 text-center min-w-[80px]">Allotted</th>
                      <th className="py-3 px-3 text-center min-w-[80px]">Availed</th>
                      {statusColumns.map((col) => (
                        <th key={col.statusId} className="py-3 px-3 text-center min-w-[100px]">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${getSentimentBadgeClass(
                              col.sentimentCategory
                            )}`}
                            title={`Status: ${col.name} (${col.code})`}
                          >
                            {col.name}
                          </span>
                        </th>
                      ))}
                      <th className="py-3 px-4 text-center min-w-[120px] sticky right-0 bg-gray-100">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.userId} className="hover:bg-blue-50/40 transition-colors">
                        {/* User Profile Info */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                              {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="truncate max-w-[220px]">
                              <div className="font-semibold text-gray-900 truncate" title={user.fullName}>
                                {user.fullName || user.username}
                              </div>
                              <div className="text-xs text-gray-500 truncate" title={user.email}>
                                {user.email || `@${user.username}`}
                              </div>
                              {user.department && (
                                <span className="inline-block mt-0.5 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                                  {user.department}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Totals */}
                        <td className="py-3 px-3 text-center font-bold text-gray-900 bg-gray-50/30">
                          {user.total}
                        </td>
                        <td className="py-3 px-3 text-center font-medium text-blue-700">
                          {user.allotted}
                        </td>
                        <td className="py-3 px-3 text-center font-medium text-emerald-700">
                          {user.availed}
                        </td>

                        {/* Dynamic Status Counts */}
                        {statusColumns.map((col) => {
                          const count =
                            user.statusCounts?.[col.code] ??
                            user.statusCounts?.[col.statusId] ??
                            0;
                          return (
                            <td
                              key={col.statusId}
                              className={`py-3 px-3 text-center font-medium ${
                                count > 0 ? 'text-gray-900 font-semibold' : 'text-gray-400 font-normal'
                              }`}
                            >
                              {count > 0 ? (
                                <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 font-bold text-xs">
                                  {count}
                                </span>
                              ) : (
                                '0'
                              )}
                            </td>
                          );
                        })}

                        {/* Actions */}
                        <td className="py-3 px-4 text-center sticky right-0 bg-white hover:bg-blue-50/40">
                          <button
                            onClick={() => onViewUserData(user)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs shadow-xs hover:shadow-sm transition-all cursor-pointer"
                            title="View all leads assigned to this user in this scope"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Data
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSegregationAnalyticsModal;

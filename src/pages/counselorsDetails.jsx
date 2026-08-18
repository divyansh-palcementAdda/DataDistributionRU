import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { getCounselorById } from '../Services/Counselors/counselors';

const CounselorDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useAppContext();

    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            const fetchDetails = async () => {
                setLoading(true);
                setError(null);
                try {
                    const res = await getCounselorById(id);
                    const data = res?.data?.data || res?.data || {};
                    setDetails(data);
                } catch (err) {
                    const msg = err?.message || 'Failed to fetch counselor details';
                    setError(msg);
                    showToast(msg, 'error');
                } finally {
                    setLoading(false);
                }
            };
            fetchDetails();
        }
    }, [id]);

    /* ── Color + Initials helpers ── */
    const getColor = (str = '') => {
        const colors = ['#7C3AED', '#0891B2', '#16A34A', '#EA580C', '#DB2777', '#0369A1', '#2563EB'];
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const getInitials = (first = '', last = '') => {
        if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
        if (first) return first.slice(0, 2).toUpperCase();
        return 'U';
    };

    const fullName = details
        ? (details.name || `${details.firstName || ''} ${details.lastName || ''}`.trim() || 'Unknown')
        : '';

    const isActive = details?.isActive !== false;

    return (
        <div className="block p-4 sm:p-6">
            {/* ── Page Header ── */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                        onClick={() => navigate('/counselors')}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">
                            Counselor Details
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            View comprehensive details for this counselor
                        </p>
                    </div>
                </div>
            </div>

            {/* ── States ── */}
            {loading ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-5xl">
                    <div className="flex items-center justify-center py-12 gap-3 text-gray-500">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            style={{ animation: 'spin 1s linear infinite' }}>
                            <path d="M21 12a9 9 0 11-6.219-8.56" />
                        </svg>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        Loading counselor details…
                    </div>
                </div>
            ) : error ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-5xl">
                    <div className="flex items-center justify-center py-12 text-red-500">{error}</div>
                </div>
            ) : details ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-5xl">

                    {/* ── Avatar + Name Header ── */}
                    <div className="flex flex-col sm:flex-row items-start gap-5 mb-8 pb-6 border-b border-gray-100">
                        <div
                            className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0"
                            style={{ backgroundColor: getColor(fullName) }}
                        >
                            {getInitials(details.firstName || fullName, details.lastName || '')}
                        </div>

                        <div className="flex-1">
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{fullName}</h2>
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${
                                    isActive
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                    {isActive ? 'Active' : 'Inactive'}
                                </span>
                                <span className="bg-gray-50 text-gray-500 text-[10px] font-medium px-2.5 py-1 rounded-full border border-gray-200">
                                    ID: {details?.id || 'N/A'}
                                </span>
                                {(details?.role?.name || details?.role) && (
                                    <span className="bg-blue-50 text-blue-600 text-[10px] font-medium px-2.5 py-1 rounded-full border border-blue-200">
                                        {details?.role?.name || details?.role}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Details Grid ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Email */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Email Address
                            </div>
                            <div className="text-sm font-semibold text-gray-800">
                                {details?.email || 'N/A'}
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Contact Number
                            </div>
                            <div className="text-sm font-semibold text-gray-800">
                                {details?.mobileNo || details?.phone || 'N/A'}
                            </div>
                        </div>

                        {/* Role */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Role
                            </div>
                            <div className="text-sm font-semibold text-gray-800">
                                {details?.role?.name || details?.role || 'N/A'}
                            </div>
                        </div>

                        {/* Username */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Username
                            </div>
                            <div className="text-sm font-semibold text-gray-800">
                                {details?.username || details?.userName || 'N/A'}
                            </div>
                        </div>

                        {/* Created At */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Created At
                            </div>
                            <div className="text-sm font-semibold text-gray-800">
                                {details?.createdAt
                                    ? new Date(details.createdAt).toLocaleString()
                                    : 'N/A'}
                            </div>
                        </div>

                        {/* Updated At */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Last Updated
                            </div>
                            <div className="text-sm font-semibold text-gray-800">
                                {details?.updatedAt
                                    ? new Date(details.updatedAt).toLocaleString()
                                    : 'N/A'}
                            </div>
                        </div>

                        {/* Address — full width if present */}
                        {details?.address && (
                            <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    Address
                                </div>
                                <div className="text-sm font-semibold text-gray-800 leading-relaxed">
                                    {details.address}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default CounselorDetails;

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import gradsService from '../Services/Grads/gradsService';

const GradesDetails = () => {
    const { navTo } = useAppContext();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            const fetchGradeDetails = async () => {
                setLoading(true);

                try {
                    const res = await gradsService.getGradeById(id);

                    // Map API response to UI format
                    const mappedData = {
                        id: res.data.id,
                        gradeName: res.data.name,
                        gradeCode: res.data.code,
                        description: res.data.description,
                        status: res.data.active ? "ACTIVE" : "INACTIVE",
                        displayOrder: res.data.displayOrder,
                        createdAt: res.data.createdAt,
                        updatedAt: res.data.updatedAt
                    };

                    setDetails(mappedData);
                } catch (err) {
                    console.error("Failed to fetch grade details", err);
                    setError(err.message || "An error occurred");
                } finally {
                    setLoading(false);
                }
            };

            fetchGradeDetails();
        }
    }, [id]);

    const goBack = () => {
        navTo('grades');
    };

    return (
        <div className="block p-4 sm:p-6" id="page-grade-detail">
            {/* Page Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                        onClick={goBack}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        >
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>

                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">
                            Grade Details
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            View comprehensive details for this grade
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Card */}
            {loading ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-5xl">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-gray-500">Loading grade details...</div>
                    </div>
                </div>
            ) : error ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-5xl">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-red-500">{error}</div>
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-5xl">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-start gap-5 mb-8 pb-6 border-b border-gray-100">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0">
                        {details?.gradeName
                            ? details.gradeName.substring(0, 2).toUpperCase()
                            : "GR"}
                    </div>

                    <div className="flex-1">
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                            {details?.gradeName || "N/A"}
                        </h2>

                        <div className="flex flex-wrap gap-2 items-center">
                            <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${details?.status === "ACTIVE"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                                    }`}
                            >
                                {details?.status || "UNKNOWN"}
                            </span>

                            <span className="bg-gray-50 text-gray-500 text-[10px] font-medium px-2.5 py-1 rounded-full border border-gray-200">
                                ID: {details?.id || "N/A"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Grade Code */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Grade Code
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                            {details?.gradeCode || "N/A"}
                        </div>
                    </div>

                    {/* Display Order */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Display Order
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                            {details?.displayOrder || "N/A"}
                        </div>
                    </div>

                    {/* Created Date */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Creation Date
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                            {details?.createdAt
                                ? new Date(details.createdAt).toLocaleString()
                                : "N/A"}
                        </div>
                    </div>

                    {/* Updated Date */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Last Updated
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                            {details?.updatedAt
                                ? new Date(details.updatedAt).toLocaleString()
                                : "N/A"}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Description
                        </div>
                        <div className="text-sm font-semibold text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {details?.description || "No description available."}
                        </div>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
};

export default GradesDetails;

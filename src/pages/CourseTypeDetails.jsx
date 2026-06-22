import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import CustomButton from '../component/reusable/CustomButton';
import { getCourseTypeById } from '../Services/courseTypes/courseTypeService';

const CourseTypeDetails = () => {
    const { id } = useParams();
    const { navTo } = useAppContext();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            const fetchDetails = async () => {
                setLoading(true);
                try {
                    const res = await getCourseTypeById(id);
                    if (res?.success) {
                        setDetails(res.data);
                    } else {
                        setError(res?.message || "Failed to load details");
                    }
                } catch (err) {
                    console.error("Failed to fetch course type details", err);
                    setError(err.message || "An error occurred");
                } finally {
                    setLoading(false);
                }
            };
            fetchDetails();
        }
    }, [id]);

    const goBack = () => {
        navTo('courses-types');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 font-medium">Loading details...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl relative flex justify-between items-center shadow-sm">
                    <span className="block sm:inline">{error}</span>
                    <button onClick={goBack} className="text-sm font-semibold underline hover:text-red-800">Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="block p-4 sm:p-6 p-0" id="page-course-type-detail">
            {/* Page Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                        onClick={goBack}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">Course Type Details</h1>
                        <p className="text-sm text-gray-500 mt-1">View comprehensive details for this course type</p>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-4xl">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-start gap-5 mb-8 pb-6 border-b border-gray-100">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0">
                        {details?.name ? details.name.substring(0, 2).toUpperCase() : 'CT'}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{details?.name || 'N/A'}</h2>
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${
                                details?.status === 'ACTIVE' 
                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                    : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                                {details?.status || 'UNKNOWN'}
                            </span>
                            <span className="bg-gray-50 text-gray-500 text-[10px] font-medium px-2.5 py-1 rounded-full border border-gray-200">
                                ID: {details?.id || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            Description
                        </div>
                        <div className="text-sm font-semibold text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {details?.description || 'No description provided.'}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            Creation Date
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                            {details?.createdAt ? new Date(details.createdAt).toLocaleString() : 'N/A'}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Last Updated
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                            {details?.updatedAt ? new Date(details.updatedAt).toLocaleString() : 'N/A'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseTypeDetails;

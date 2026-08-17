import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { getCourseById } from '../Services/course/course';
import CustomButton from '../component/reusable/CustomButton';
import ReusableTable from '../component/reusable/table';

const CourseDetails = () => {
    const { navTo } = useAppContext();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(null);
    const { id } = useParams();

    // ─── Tab config ────────────────────────────────────────────────────────────
    const tabs = [
        {
            key: 'image',
            label: 'Image Management',
            columns: [
                { key: 'id',        header: 'ID' },
                { key: 'imageName', header: 'Image Name' },
                { key: 'imageUrl',  header: 'URL' },
                { key: 'type',      header: 'Type' },
                { key: 'createdAt', header: 'Created At' },
            ],
            data: [],
            emptyMessage: 'No images found for this course.',
        },
        {
            key: 'template',
            label: 'Template Management',
            columns: [
                { key: 'id',           header: 'ID' },
                { key: 'templateName', header: 'Template Name' },
                { key: 'type',         header: 'Type' },
                { key: 'status',       header: 'Status' },
                { key: 'createdAt',    header: 'Created At' },
            ],
            data: [],
            emptyMessage: 'No templates found for this course.',
        },
        {
            key: 'usp',
            label: 'USP Management',
            columns: [
                { key: 'id',         header: 'ID' },
                { key: 'title',      header: 'Title' },
                { key: 'description',header: 'Description' },
                { key: 'order',      header: 'Order' },
                { key: 'status',     header: 'Status' },
            ],
            data: [],
            emptyMessage: 'No USPs found for this course.',
        },
        {
            key: 'communication',
            label: 'Communication Management',
            columns: [
                { key: 'id',      header: 'ID' },
                { key: 'type',    header: 'Type' },
                { key: 'message', header: 'Message' },
                { key: 'sentTo',  header: 'Sent To' },
                { key: 'sentAt',  header: 'Sent At' },
            ],
            data: [],
            emptyMessage: 'No communication records found for this course.',
        },
    ];


    useEffect(() => {
        if (id) {
            const fetchCourseDetails = async () => {
                setLoading(true);

                try {
                    const res = await getCourseById(id);

                    if (res?.success) {
                        setDetails(res.data);
                    } else {
                        setError(res?.message || "Failed to load course details");
                    }
                } catch (err) {
                    console.error("Failed to fetch course details", err);
                    setError(err.message || "An error occurred");
                } finally {
                    setLoading(false);
                }
            };

            fetchCourseDetails();
        }
    }, [id]);

    const goBack = () => {
        navTo('courses');
    };

    return (
        <div className="block p-4 sm:p-6" id="page-course-detail">
            {/* Page Header */}
            <div className="mb-6">
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
                            Course Details
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            View comprehensive details for this course
                        </p>
                    </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex flex-wrap gap-2 mt-3 ml-9">
                    {tabs.map((tab) => (
                        <CustomButton
                            key={tab.key}
                            variant={activeTab === tab.key ? 'primary' : 'outline'}
                            className="text-xs px-3 py-1.5"
                            onClick={() =>
                                setActiveTab((prev) => (prev === tab.key ? null : tab.key))
                            }
                        >
                            {tab.label}
                        </CustomButton>
                    ))}
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-5xl">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-start gap-5 mb-8 pb-6 border-b border-gray-100">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0">
                        {details?.courseName
                            ? details.courseName.substring(0, 2).toUpperCase()
                            : "CR"}
                    </div>

                    <div className="flex-1">
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                            {details?.courseName || "N/A"}
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

                    {/* Course Code */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Course Code
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                            {details?.courseCode || "N/A"}
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Duration
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                            {details?.duration || "N/A"}
                        </div>
                    </div>

                    {/* Fees */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Course Fees
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                            {details?.fees || "N/A"}
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

            {/* Tab Table Section */}
            {activeTab && (() => {
                const tab = tabs.find((t) => t.key === activeTab);
                if (!tab) return null;
                return (
                    <div className="mt-6 max-w-5xl">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-bold text-gray-800">{tab.label}</h3>
                            <CustomButton variant="primary" className="text-xs px-3 py-1.5">
                                + Add
                            </CustomButton>
                        </div>
                        <ReusableTable
                            columns={tab.columns}
                            data={tab.data}
                            emptyMessage={tab.emptyMessage}
                        />
                    </div>
                );
            })()}
        </div>
    );
};

export default CourseDetails;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../component/reusable/CustomButton';

import ReusableTable from '../component/reusable/table';
import Toggle from '../component/reusable/custumToggle';
import { getAllCourseType, toggleCourseStatus, deleteCourseType } from '../Services/courseTypes/courseTypeService';
import { toast } from 'react-toastify';
import AddCourseTypeModel from '../component/reusable/AddCourseTypeModel';
import DeleteModal from '../component/reusable/deleteModel';
import { usePermissions } from '../PermissionContext';
import * as XLSX from 'xlsx';

const CourseType = () => {
    const navigate = useNavigate();
    const { canCreate, canUpdate, canDelete, canRead, hasPermission } = usePermissions();
    const [courses, setCourses] = useState([]);

    // Helper function to check both COURSE_TYPE_READ and COURSE_TYPE_VIEW permissions
    const canReadCourseType = () => {
        return hasPermission('COURSE_TYPE_READ') || hasPermission('COURSE_TYPE_VIEW');
    };

    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [sortDirection, setSortDirection] = useState("asc");

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await getAllCourseType({
                page: currentPage - 1,
                size: rowsPerPage,
                search: debouncedSearch,
                sortBy,
                sortDirection,
            });

            if (res?.success && res?.data) {
                setCourses(res.data.content || []);
                setTotalPages(res.data.totalPages || 0);
                setTotalElements(res.data.totalElements || 0);
            } else {
                setCourses(res?.content || res?.data || res || []);
                setTotalPages(res?.totalPages || 0);
                setTotalElements(res?.totalElements || 0);
            }
        } catch (error) {
            toast.error(error.message || "Failed to fetch course types");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchCourses();
    }, [currentPage, rowsPerPage, debouncedSearch, sortBy, sortDirection]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const handleToggleStatus = async (id, currentStatus) => {
        if (!hasPermission('COURSE_TYPE_UPDATE')) {
            toast.error('You do not have permission to update course type status');
            return;
        }
        try {
            // Optimistic UI update could be placed here, but a refetch is safer
            await toggleCourseStatus(id);
            toast.success("Status updated successfully");
            fetchCourses();
        } catch (error) {
            toast.error(error.message || "Failed to update status");
        }
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;
        try {
            setIsDeleting(true);
            await deleteCourseType(itemToDelete.id);
            toast.success("Course type deleted successfully");
            fetchCourses();
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            toast.error(error.message || "Failed to delete course type");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSort = (columnKey, direction) => {
        setSortBy(columnKey);
        setSortDirection(direction);
        setCurrentPage(1);
    };

    const downloadExcel = () => {
        try {
            // Flatten the course types data for Excel export
            const excelData = courses.map((course, index) => {
                return {
                    'S.No': (currentPage - 1) * rowsPerPage + index + 1,
                    'Course Type': typeof course.name === 'object' ? course.name?.name || '-' : course.name || '-',
                    'Description': typeof course.description === 'object' ? course.description?.description || '-' : course.description || '-',
                    'Total Data': course.totalData ?? 0,
                    'Total Allotted Data': course.totalAllottedData ?? 0,
                    'Total Unallotted Data': course.totalUnallottedData ?? 0,
                    'Total Availed Data': course.totalAvailedData ?? 0,
                    'Status': course.status || 'INACTIVE',
                    'Created Date': course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A',
                    'Updated Date': course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'N/A'
                };
            });

            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            
            // Create workbook
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Course Types');
            
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const filename = `course_types_${timestamp}.xlsx`;
            
            // Download the file
            XLSX.writeFile(workbook, filename);
            
            toast.success('Excel file downloaded successfully');
        } catch (error) {
            console.error('Error downloading Excel:', error);
            toast.error('Failed to download Excel file');
        }
    };

    const allColumns = [
        {
            key: "sno",
            header: "S.no",
            sortable: false,
            render: (_, row, index) => (currentPage - 1) * rowsPerPage + index + 1
        },
        { key: "name", header: "Course Type", render: (value) => (typeof value === "object" && value !== null ? value?.name || "-" : value || "-") },
        {
            key: "totalData",
            header: "Total Data",
            render: (value) => (
                <span className="inline-flex items-center font-semibold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-full text-xs">
                    {value ?? 0}
                </span>
            )
        },
        {
            key: "totalAllottedData",
            header: "Total Allotted Data",
            permission: 'DATA_ALLOTTED_COLUMN_VIEW',
            render: (value) => (
                <span className="inline-flex items-center font-semibold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full text-xs">
                    {value ?? 0}
                </span>
            )
        },
        {
            key: "totalUnallottedData",
            header: "Total Unallotted Data",
            permission: 'DATA_UNALLOTTED_COLUMN_VIEW',
            render: (value) => (
                <span className="inline-flex items-center font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full text-xs">
                    {value ?? 0}
                </span>
            )
        },
        {
            key: "totalAvailedData",
            header: "Total Availed Data",
            permission: 'DATA_AVAILED_COLUMN_VIEW',
            render: (value) => (
                <span className="inline-flex items-center font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs">
                    {value ?? 0}
                </span>
            )
        },
        { key: "description", header: "Description", render: (value) => (typeof value === "object" && value !== null ? value?.description || "-" : value || "-") },
        {
            key: "status",
            header: "Status",
            permission: 'COURSE_TYPE_UPDATE',
            render: (status, row) => (
                <Toggle
                    checked={status === 'ACTIVE' || status === true}
                    onChange={() => handleToggleStatus(row.id, status)}
                />
            )
        }
    ];

    const columns = allColumns.filter(col => !col.permission || hasPermission(col.permission));

    return (
        <div className="block p-4 sm:p-6  p-0">
            {/* Page Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Category</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your Category catalog and parameters</p>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <input
                        type="text"
                        placeholder="Search course type..."
                        value={search}
                        onChange={handleSearch}
                        className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Download Excel */}
                    <button
                        className="flex items-center gap-1.5"
                        style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 16px', fontSize: '13px', borderRadius: '9999px', cursor: 'pointer', boxShadow: 'none', fontWeight: '600' }}
                        onClick={downloadExcel}
                        disabled={courses.length === 0}
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        Download
                    </button>

                    {hasPermission('COURSE_TYPE_CREATE') && (
                        <CustomButton
                            variant="primary"
                            onClick={() => { setEditData(null); setIsAddModalOpen(true); }}
                            className="text-sm py-2 px-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                            + Add Category Type
                        </CustomButton>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
                <ReusableTable
                    columns={columns}
                    data={courses}
                    isServerSide={true}
                    totalElements={totalElements}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setCurrentPage}
                    onRowsPerPageChange={setRowsPerPage}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    emptyMessage={loading ? "Loading..." : "No course types found"}
                    onView={canReadCourseType() ? (row) => navigate(`/course-types/${row.id}`) : undefined}
                    onEdit={hasPermission('COURSE_TYPE_UPDATE') ? (row) => {
                        setEditData(row);
                        setIsAddModalOpen(true);
                    } : undefined}
                    onDelete={hasPermission('COURSE_TYPE_DELETE') ? (row) => {
                        setItemToDelete(row);
                        setIsDeleteModalOpen(true);
                    } : undefined}
                />
            </div>

            <AddCourseTypeModel
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditData(null);
                }}
                initialData={editData}
                onSubmit={() => {
                    setIsAddModalOpen(false);
                    setEditData(null);
                    fetchCourses();
                }}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setItemToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Delete Course Type"
                message={`Are you sure you want to delete the course type "${itemToDelete?.name}"?`}
                isLoading={isDeleting}
            />
        </div>
    );
};

export default CourseType;

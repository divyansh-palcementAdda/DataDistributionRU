import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../component/reusable/CustomButton';

import ReusableTable from '../component/reusable/table';
import Toggle from '../component/reusable/custumToggle';
import { getAllCourseType, toggleCourseStatus, deleteCourseType } from '../Services/courseTypes/courseTypeService';
import { toast } from 'react-toastify';
import AddCourseTypeModel from '../component/reusable/AddCourseTypeModel';
import DeleteModal from '../component/reusable/deleteModel';

const CourseType = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);

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

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await getAllCourseType({
                page: currentPage - 1,
                size: rowsPerPage,
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
        fetchCourses();
    }, [currentPage, rowsPerPage]);

    const handleToggleStatus = async (id, currentStatus) => {
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

    const columns = [
        { key: "name", header: "Name" },
        { key: "description", header: "Description" },
        {
            key: "status",
            header: "Status",
            render: (status, row) => (
                <Toggle
                    checked={status === 'ACTIVE' || status === true}
                    onChange={() => handleToggleStatus(row.id, status)}
                />
            )
        }
    ];

    return (
        <div className="block p-4 sm:p-6  p-0">
            {/* Page Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Course Types</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your course types catalog and parameters</p>
                </div>
                <CustomButton variant="primary" onClick={() => { setEditData(null); setIsAddModalOpen(true); }} className="text-sm py-2 px-4 shadow-sm hover:shadow-md transition-shadow">
                    + Add Course Type
                </CustomButton>
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
                    emptyMessage={loading ? "Loading..." : "No course types found"}
                    onView={(row) => navigate(`/courses-types/${row.id}`)}
                    onEdit={(row) => {
                        setEditData(row);

                        setIsAddModalOpen(true);
                    }}
                    onDelete={(row) => {
                        setItemToDelete(row);
                        setIsDeleteModalOpen(true);
                    }}
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

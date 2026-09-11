import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../component/reusable/CustomButton';
import ReusableTable from '../component/reusable/table';
import Toggle from '../component/reusable/custumToggle';
import { getAllCourses, toggleCourseStatus, deleteCourse } from '../Services/course/course';
import { toast } from 'react-toastify';
import AddCourseModal from '../component/reusable/course/addCourseModel';
import DeleteModal from '../component/reusable/deleteModel';
import { usePermissions } from '../PermissionContext';
import * as XLSX from 'xlsx';

const Courses = () => {
  const navigate = useNavigate();
  const { canCreate, canUpdate, canDelete, canRead, hasPermission } = usePermissions();
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
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await getAllCourses({
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
      toast.error(error.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchCourses();
  }, [currentPage, rowsPerPage, debouncedSearch, sortBy, sortDirection]);

  const handleToggleStatus = async (id, currentStatus) => {
    if (!hasPermission('COURSE_UPDATE')) {
      toast.error('You do not have permission to update course status');
      return;
    }
    try {
      await toggleCourseStatus(id);
      toast.success("Status updated successfully");
      fetchCourses();
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeleting(true);
      await deleteCourse(itemToDelete.id);
      toast.success("Course deleted successfully");
      fetchCourses();
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete course");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSort = (columnKey, direction) => {
    setSortBy(columnKey);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  // Download Excel function
  const downloadExcel = async () => {
    try {
      // Fetch all data without pagination
      const allDataRes = await getAllCourses({
        page: 0,
        size: totalElements,
        search: debouncedSearch,
        sortBy,
        sortDirection,
      });
      
      const allCourses = allDataRes?.data?.content || allDataRes?.content || allDataRes || [];
      
      // Flatten the courses data for Excel export
      const excelData = allCourses.map((row, index) => {
        const courseName = typeof row.courseName === "object" && row.courseName !== null 
          ? row.courseName?.courseName || row.courseName?.name || "-" 
          : row.courseName || row.name || "-";
        
        const description = typeof row.description === "object" && row.description !== null 
          ? row.description?.description || "-" 
          : row.description || "-";

        return {
          'S.No': index + 1,
          'Course Name': courseName,
          'Description': description,
          'Status': row.status === 'ACTIVE' || row.status === true ? 'Active' : 'Inactive',
          'Created Date': row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'
        };
      });

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Courses');
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `courses_${timestamp}.xlsx`;
      
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
    { key: "courseName", header: "Name", render: (value) => (typeof value === "object" && value !== null ? value?.courseName || value?.name || "-" : value || "-") },
    { key: "description", header: "Description", render: (value) => (typeof value === "object" && value !== null ? value?.description || "-" : value || "-") },
    {
      key: "status",
      header: "Status",
      permission: 'COURSE_UPDATE',
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
    <div className="block p-4 sm:p-6 p-0" id="page-courses">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-sm text-gray-500 mt-1">Manage course catalog and enrollment data</p>
        </div>



        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={handleSearch}
            className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={downloadExcel}
            disabled={courses.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-full shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

          {hasPermission('COURSE_CREATE') && (
            <CustomButton
              variant="primary"
              onClick={() => { setEditData(null); setIsAddModalOpen(true); }}
              className="text-sm py-2 px-4 shadow-sm hover:shadow-md transition-shadow"
            >
              + Add Course
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
          emptyMessage={loading ? "Loading..." : "No courses found"}
          onView={hasPermission('COURSE_VIEW') ? (row) => navigate(`/course-details/${row.id}`) : undefined}
          onEdit={hasPermission('COURSE_UPDATE') ? (row) => {
            setEditData(row);
            setIsAddModalOpen(true);
          } : undefined}
          onDelete={hasPermission('COURSE_DELETE') ? (row) => {
            setItemToDelete(row);
            setIsDeleteModalOpen(true);
          } : undefined}
        />
      </div>

      <AddCourseModal
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
        title="Delete Course"
        message={`Are you sure you want to delete the course "${itemToDelete?.name}"?`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Courses;
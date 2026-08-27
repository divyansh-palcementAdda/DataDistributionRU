import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../component/reusable/CustomButton';
import ReusableTable from '../component/reusable/table';
import Toggle from '../component/reusable/custumToggle';
import { toast } from 'react-toastify';
import AddGradeModal from '../component/reusable/grade/addGradeModel';
import DeleteModal from '../component/reusable/deleteModel';
import gradsService from '../Services/Grads/gradsService';
import { usePermissions } from '../PermissionContext';

const Grades = () => {
  const navigate = useNavigate();
  const { canCreate, canUpdate, canDelete, canRead, hasPermission } = usePermissions();
  const [grades, setGrades] = useState([]);

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

  const fetchGrades = async () => {
    try {
      setLoading(true);
      
      
      const res = await gradsService.getAllGrades({
        page: currentPage - 1,
        size: rowsPerPage,
        search: debouncedSearch,
        sortBy,
        sortDirection,
      });


      // Map API response to UI format
      const mappedGrades = (res.data?.content || []).map(grade => ({
        id: grade.id,
        gradeName: grade.name,
        gradeCode: grade.code,
        description: grade.description,
        status: grade.active ? "ACTIVE" : "INACTIVE",
        displayOrder: grade.displayOrder
      }));

      setGrades(mappedGrades);
      setTotalPages(res.data?.totalPages || 0);
      setTotalElements(res.data?.totalElements || 0);
    } catch (error) {
      console.error("Error fetching grades:", error);
      toast.error(error.message || "Failed to fetch grades");
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
    fetchGrades();
  }, [currentPage, rowsPerPage, debouncedSearch, sortBy, sortDirection]);

  const handleToggleStatus = async (id, currentStatus) => {
    if (!hasPermission('GRADE_UPDATE')) {
      toast.error('You do not have permission to update grade status');
      return;
    }
    try {
      await gradsService.toggleGradeStatus(id);
      toast.success("Status updated successfully");
      fetchGrades();
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
      await gradsService.deleteGrade(itemToDelete.id);
      toast.success("Grade deleted successfully");
      fetchGrades();
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete grade");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSort = (columnKey, direction) => {
    setSortBy(columnKey);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  const columns = [
    {
      key: "sno",
      header: "S.no",
      sortable: false,
      render: (_, row, index) => (currentPage - 1) * rowsPerPage + index + 1
    },
    { key: "gradeName", header: "Name", render: (value) => (typeof value === "object" && value !== null ? value?.name || value?.gradeName || "-" : value || "-") },
    { key: "gradeCode", header: "Code", render: (value) => (typeof value === "object" && value !== null ? value?.code || value?.gradeCode || "-" : value || "-") },
    { key: "description", header: "Description", render: (value) => (typeof value === "object" && value !== null ? value?.description || "-" : value || "-") },
    {
      key: "status",
      header: "Status",
      render: (status, row) => (
        hasPermission('GRADE_UPDATE') ? (
          <Toggle
            checked={status === 'ACTIVE' || status === true}
            onChange={() => handleToggleStatus(row.id, status)}
          />
        ) : null
      )
    }
  ];

  return (
    <div className="block p-4 sm:p-6 p-0" id="page-grades">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
          <p className="text-sm text-gray-500 mt-1">Manage grade levels and academic standards</p>
        </div>

        <input
          type="text"
          placeholder="Search grades..."
          value={search}
          onChange={handleSearch}
          className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {hasPermission('GRADE_CREATE') && (
          <CustomButton
            variant="primary"
            onClick={() => { setEditData(null); setIsAddModalOpen(true); }}
            className="text-sm py-2 px-4 shadow-sm hover:shadow-md transition-shadow"
          >
            + Add Grade
          </CustomButton>
        )}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
        <ReusableTable
          columns={columns}
          data={grades}
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
          emptyMessage={loading ? "Loading..." : "No grades found"}
          onView={hasPermission('GRADE_VIEW') ? (row) => navigate(`/grade-details/${row.id}`) : undefined}
          onEdit={hasPermission('GRADE_UPDATE') ? (row) => {
            setEditData(row);
            setIsAddModalOpen(true);
          } : undefined}
          onDelete={hasPermission('GRADE_DELETE') ? (row) => {
            setItemToDelete(row);
            setIsDeleteModalOpen(true);
          } : undefined}
        />
      </div>

      <AddGradeModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditData(null);
        }}
        initialData={editData}
        onSubmit={() => {
          setIsAddModalOpen(false);
          setEditData(null);
          fetchGrades();
        }}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Grade"
        message={`Are you sure you want to delete the grade "${itemToDelete?.gradeName || itemToDelete?.name}"?`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Grades;

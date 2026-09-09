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
import * as XLSX from 'xlsx';

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
        name: grade.name,
        gradeName: grade.name,
        gradeCode: grade.code,
        description: grade.description,
        status: grade.active ? "ACTIVE" : "INACTIVE",
        active: grade.active,
        displayOrder: grade.displayOrder,
        totalData: grade.totalData ?? 0,
        totalAllottedData: grade.totalAllottedData ?? 0,
        totalUnallottedData: grade.totalUnallottedData ?? 0,
        totalAvailedData: grade.totalAvailedData ?? 0
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

  const downloadExcel = () => {
    try {
      // Flatten the grades data for Excel export
      const excelData = grades.map((grade, index) => {
        return {
          'S.No': (currentPage - 1) * rowsPerPage + index + 1,
          'Grade': typeof grade.name === 'object' ? grade.name?.name || grade.name?.gradeName || '-' : grade.name || grade.gradeName || '-',
          'Grade Code': grade.gradeCode || 'N/A',
          'Description': typeof grade.description === 'object' ? grade.description?.description || '-' : grade.description || '-',
          'Total Data': grade.totalData ?? 0,
          'Total Allotted Data': grade.totalAllottedData ?? 0,
          'Total Unallotted Data': grade.totalUnallottedData ?? 0,
          'Total Availed Data': grade.totalAvailedData ?? 0,
          'Status': grade.active ? 'Active' : 'Inactive',
          'Display Order': grade.displayOrder ?? 'N/A',
          'Created Date': grade.createdAt ? new Date(grade.createdAt).toLocaleDateString() : 'N/A',
          'Updated Date': grade.updatedAt ? new Date(grade.updatedAt).toLocaleDateString() : 'N/A'
        };
      });

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Grades');
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `grades_${timestamp}.xlsx`;
      
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
    { key: "name", header: "Grade", sortable: true, render: (value, row) => (typeof value === "object" && value !== null ? value?.name || value?.gradeName || "-" : value || row?.gradeName || "-") },
    {
      key: "totalData",
      header: "Total Data",
      sortable: true,
      render: (value) => (
        <span className="inline-flex items-center font-semibold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-full text-xs">
          {value ?? 0}
        </span>
      )
    },
    {
      key: "totalAllottedData",
      header: "Total Allotted Data",
      sortable: true,
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
      sortable: true,
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
      sortable: true,
      permission: 'DATA_AVAILED_COLUMN_VIEW',
      render: (value) => (
        <span className="inline-flex items-center font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs">
          {value ?? 0}
        </span>
      )
    },
    { key: "description", header: "Description", sortable: true, render: (value) => (typeof value === "object" && value !== null ? value?.description || "-" : value || "-") },
    {
      key: "status",
      header: "Status",
      sortable: true,
      permission: 'GRADE_UPDATE',
      render: (status, row) => (
        <Toggle
          checked={row.active === true || status === 'ACTIVE'}
          onChange={() => handleToggleStatus(row.id, status)}
        />
      )
    }
  ];

  const columns = allColumns.filter(col => !col.permission || hasPermission(col.permission));

  return (
    <div className="block p-4 sm:p-6 p-0" id="page-grades">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
          <p className="text-sm text-gray-500 mt-1">Manage grade levels and academic standards</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search grades..."
            value={search}
            onChange={handleSearch}
            className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Download Excel */}
          <button
            className="flex items-center gap-1.5"
            style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 16px', fontSize: '13px', borderRadius: '9999px', cursor: 'pointer', boxShadow: 'none', fontWeight: '600' }}
            onClick={downloadExcel}
            disabled={grades.length === 0}
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

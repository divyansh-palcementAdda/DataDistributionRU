import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../component/reusable/CustomButton';
import ReusableTable from '../component/reusable/table';
import Toggle from '../component/reusable/custumToggle';
import { toast } from 'react-toastify';
import AddBoardModal from '../component/reusable/board/addBoardModel';
import DeleteModal from '../component/reusable/deleteModel';
import { getAllBoards, deleteBoard, toggleBoardStatus } from '../Services/Boards/boardsService';
import { usePermissions } from '../PermissionContext';
import * as XLSX from 'xlsx';

const Boards = () => {
  const navigate = useNavigate();
  const { canCreate, canUpdate, canDelete, canRead, hasPermission } = usePermissions();
  const [boards, setBoards] = useState([]);

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

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const res = await getAllBoards({
        page: currentPage - 1,
        size: rowsPerPage,
        search: debouncedSearch,
        sortBy,
        sortDirection,
      });

      setBoards(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 0);
      setTotalElements(res.data?.totalElements || 0);
    } catch (error) {
      toast.error(error.message || "Failed to fetch boards");
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
    fetchBoards();
  }, [currentPage, rowsPerPage, debouncedSearch, sortBy, sortDirection]);

  const handleToggleStatus = async (id, currentStatus) => {
    if (!hasPermission('BOARD_UPDATE')) {
      toast.error('You do not have permission to update board status');
      return;
    }
    try {
      const response = await toggleBoardStatus(id);
      if (response.success) {
        toast.success("Status updated successfully");
        fetchBoards();
      } else {
        toast.error(response.message || "Failed to update status");
      }
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
      const response = await deleteBoard(itemToDelete.id);
      if (response.success) {
        toast.success("Board deleted successfully");
        fetchBoards();
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
      } else {
        toast.error(response.message || "Failed to delete board");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete board");
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
      // Flatten the boards data for Excel export
      const excelData = boards.map((board, index) => {
        return {
          'S.No': (currentPage - 1) * rowsPerPage + index + 1,
          'Board': typeof board.name === 'object' ? board.name?.name || '-' : board.name || '-',
          'Description': typeof board.description === 'object' ? board.description?.description || '-' : board.description || '-',
          'Total Data': board.totalData ?? 0,
          'Total Allotted Data': board.totalAllottedData ?? 0,
          'Total Unallotted Data': board.totalUnallottedData ?? 0,
          'Total Availed Data': board.totalAvailedData ?? 0,
          'Status': board.active ? 'Active' : 'Inactive',
          'Created Date': board.createdAt ? new Date(board.createdAt).toLocaleDateString() : 'N/A',
          'Updated Date': board.updatedAt ? new Date(board.updatedAt).toLocaleDateString() : 'N/A'
        };
      });

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Boards');
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `boards_${timestamp}.xlsx`;
      
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
    { key: "name", header: "Board", sortable: true, render: (value) => (typeof value === "object" && value !== null ? value?.name || "-" : value || "-") },
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
      permission: 'BOARD_UPDATE',
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
    <div className="block p-4 sm:p-6 p-0" id="page-boards">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Specialization</h1>
          <p className="text-sm text-gray-500 mt-1">Manage education boards and affiliations</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search boards..."
            value={search}
            onChange={handleSearch}
            className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Download Excel */}
          <button
            className="flex items-center gap-1.5"
            style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 16px', fontSize: '13px', borderRadius: '9999px', cursor: 'pointer', boxShadow: 'none', fontWeight: '600' }}
            onClick={downloadExcel}
            disabled={boards.length === 0}
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

          {hasPermission('BOARD_CREATE') && (
            <CustomButton
              variant="primary"
              onClick={() => { setEditData(null); setIsAddModalOpen(true); }}
              className="text-sm py-2 px-4 shadow-sm hover:shadow-md transition-shadow"
            >
              + Add Board
            </CustomButton>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
        <ReusableTable
          columns={columns}
          data={boards}
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
          emptyMessage={loading ? "Loading..." : "No boards found"}
          onView={hasPermission('BOARD_VIEW') ? (row) => navigate(`/board-details/${row.id}`) : undefined}
          onEdit={hasPermission('BOARD_UPDATE') ? (row) => {
            setEditData(row);
            setIsAddModalOpen(true);
          } : undefined}
          onDelete={hasPermission('BOARD_DELETE') ? (row) => {
            setItemToDelete(row);
            setIsDeleteModalOpen(true);
          } : undefined}
        />
      </div>

      <AddBoardModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditData(null);
        }}
        initialData={editData}
        onSubmit={() => {
          setIsAddModalOpen(false);
          setEditData(null);
          fetchBoards();
        }}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Board"
        message={`Are you sure you want to delete the board "${itemToDelete?.name}"?`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Boards;

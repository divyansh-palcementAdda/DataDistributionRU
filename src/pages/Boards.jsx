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

  const columns = [
    {
      key: "sno",
      header: "S.no",
      sortable: false,
      render: (_, row, index) => (currentPage - 1) * rowsPerPage + index + 1
    },
    { key: "name", header: "Name", render: (value) => (typeof value === "object" && value !== null ? value?.name || "-" : value || "-") },
    { key: "description", header: "Description", render: (value) => (typeof value === "object" && value !== null ? value?.description || "-" : value || "-") },
    {
      key: "status",
      header: "Status",
      render: (status, row) => (
        hasPermission('BOARD_UPDATE') ? (
          <Toggle
            checked={row.active === true || status === 'ACTIVE'}
            onChange={() => handleToggleStatus(row.id, status)}
          />
        ) : null
      )
    }
  ];

  return (
    <div className="block p-4 sm:p-6 p-0" id="page-boards">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Specialization</h1>
          <p className="text-sm text-gray-500 mt-1">Manage education boards and affiliations</p>
        </div>

        <input
          type="text"
          placeholder="Search boards..."
          value={search}
          onChange={handleSearch}
          className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';
import CustomButton from '../component/reusable/CustomButton';
import ReusableTable from '../component/reusable/table';
import Toggle from '../component/reusable/custumToggle';
import { getAllLeadStatus, toggleLeadStatusStatus, deleteLeadStatus, updateLeadStatus } from '../Services/leadStatus/leadStatusService';
import { toast } from 'react-toastify';
import AddLeadStatusModal from '../component/reusable/leadStatus/addLeadStatusModel';
import DeleteModal from '../component/reusable/deleteModel';
import { usePermissions } from '../PermissionContext';

const LeadStatus = () => {
  const navigate = useNavigate();
  const { canCreate, canUpdate, canDelete, canRead, hasPermission } = usePermissions();
  const [leadStatuses, setLeadStatuses] = useState([]);

  // Helper function to check both LEAD_STATUS_READ and LEAD_STATUS_VIEW permissions
  const canReadLeadStatus = () => {
    return hasPermission('LEAD_STATUS_READ') || hasPermission('LEAD_STATUS_VIEW');
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
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("ASC");

  const fetchLeadStatuses = async () => {
    try {
      setLoading(true);
      const res = await getAllLeadStatus({
        page: currentPage - 1,
        size: rowsPerPage,
        search: debouncedSearch,
        sortBy: sortBy,
        sortDirection: sortDirection,
      });

      if (res?.success && res?.data) {
        setLeadStatuses(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      } else {
        setLeadStatuses(res?.content || res?.data || res || []);
        setTotalPages(res?.totalPages || 0);
        setTotalElements(res?.totalElements || 0);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch lead statuses");
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
    fetchLeadStatuses();
  }, [currentPage, rowsPerPage, debouncedSearch, sortBy, sortDirection]);

  const handleToggleStatus = async (id, currentStatus) => {
    if (!hasPermission('LEAD_STATUS_UPDATE')) {
      toast.error('You do not have permission to update lead status');
      return;
    }
    try {
      await toggleLeadStatusStatus(id);
      toast.success("Status updated successfully");
      fetchLeadStatuses();
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleToggleFollowUpStatus = async (id, currentFollowUpStatus, row, newStatus) => {
    console.log('Toggle clicked:', { id, currentFollowUpStatus, newStatus, row });
    if (!hasPermission('LEAD_STATUS_UPDATE')) {
      toast.error('You do not have permission to update lead status');
      return;
    }
    try {
      console.log('Calling API with:', { name: row.name, followUpStatus: newStatus });
      await updateLeadStatus(id, { name: row.name, followUpStatus: newStatus });
      toast.success("Follow up status updated successfully");
      fetchLeadStatuses();
    } catch (error) {
      console.error('Error updating follow up status:', error);
      toast.error(error.message || "Failed to update follow up status");
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (columnKey, direction) => {
    setSortBy(columnKey);
    setSortDirection(direction.toUpperCase());
    setCurrentPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeleting(true);
      await deleteLeadStatus(itemToDelete.id);
      toast.success("Lead status deleted successfully");
      console.log('test')
      fetchLeadStatuses();
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete lead status");
    } finally {
      setIsDeleting(false);
    }
  };

  const allColumns = [
    {
      key: "sNo",
      header: "S.No",
      sortable: false,
      render: (value, row, index) => (
        <span className="font-medium">{(currentPage - 1) * rowsPerPage + index + 1}</span>
      )
    },
    {
      key: "name",
      header: "Status Name",
      render: (value) => (typeof value === "object" && value !== null ? value?.name || value?.code || "-" : value || "-"),
    },
    {
      key: "code",
      header: "Code",
      render: (value) => (typeof value === "object" && value !== null ? value?.code || value?.name || "-" : value || "-"),
    },
    {
      key: "description",
      header: "Description",
      render: (value) => (typeof value === "object" && value !== null ? value?.description || "-" : value || "-"),
    },
    {
      key: "active",
      header: "Status",
      permission: 'LEAD_STATUS_UPDATE',
      render: (active, row) => (
        <Toggle
          checked={active === true || row.status === 'ACTIVE'}
          onChange={() => handleToggleStatus(row.id, row.status)}
        />
      )
    },
   {
  key: "followUpStatus",
  header: "Follow Up Status",
  permission: 'LEAD_STATUS_UPDATE',
  render: (followUpStatus, row) => (
    <Toggle
      checked={row.followUpStatus === true}
      onChange={() =>
        handleToggleFollowUpStatus(
          row.id,
          row.followUpStatus,
          row,
          !row.followUpStatus
        )
      }
    />
  )
}
  ];

  const columns = allColumns.filter(col => !col.permission || hasPermission(col.permission));

  return (
    <div className="block p-4 sm:p-6 p-0" id="page-lead-status">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Status</h1>
          <p className="text-sm text-gray-500 mt-1">Manage lead status configurations</p>
        </div>



        <input
          type="text"
          placeholder="Search lead statuses..."
          value={search}
          onChange={handleSearch}
          className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {hasPermission('LEAD_STATUS_CREATE') && (
          <CustomButton
            variant="primary"
            onClick={() => { setEditData(null); setIsAddModalOpen(true); }}
            className="text-sm py-2 px-4 shadow-sm hover:shadow-md transition-shadow"
          >
            + Add Lead Status
          </CustomButton>
        )}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
        <ReusableTable
          columns={columns}
          data={leadStatuses}
          isServerSide={true}
          totalElements={totalElements}
          totalPages={totalPages}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          sortBy={sortBy}
          sortDirection={sortDirection.toLowerCase()}
          onSort={handleSort}
          emptyMessage={loading ? "Loading..." : "No lead statuses found"}
          actions={(row) => (
            <div className="flex justify-center items-center gap-3">
              {canReadLeadStatus() && (
                <button
                  className="text-gray-500 hover:text-gray-700 transition bg-transparent border-none cursor-pointer"
                  title="View"
                  onClick={() => navigate(`/lead-status-details/${row.id}`)}
                >
                  <FiEye size={18} />
                </button>
              )}
              {hasPermission('LEAD_STATUS_UPDATE') && (
                <button
                  className="text-gray-500 hover:text-gray-700 transition bg-transparent border-none cursor-pointer"
                  title="Edit"
                  onClick={() => {
                    setEditData(row);
                    setIsAddModalOpen(true);
                  }}
                >
                  <FiEdit size={18} />
                </button>
              )}
              {hasPermission('LEAD_STATUS_DELETE') && (
                <button
                  className="text-gray-500 hover:text-red-600 transition bg-transparent border-none cursor-pointer"
                  title="Delete"
                  onClick={() => {
                    setItemToDelete(row);
                    setIsDeleteModalOpen(true);
                  }}
                >
                  <FiTrash2 size={18} />
                </button>
              )}
            </div>
          )}
        />
      </div>

      <AddLeadStatusModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditData(null);
        }}
        initialData={editData}
        onSubmit={() => {
          setIsAddModalOpen(false);
          setEditData(null);
          fetchLeadStatuses();
        }}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Lead Status"
        message={`Are you sure you want to delete the lead status "${itemToDelete?.name}"?`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default LeadStatus;

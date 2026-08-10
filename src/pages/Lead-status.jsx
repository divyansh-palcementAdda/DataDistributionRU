import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';
import CustomButton from '../component/reusable/CustomButton';
import ReusableTable from '../component/reusable/table';
import Toggle from '../component/reusable/custumToggle';
import { getAllLeadStatus, toggleLeadStatusStatus, deleteLeadStatus } from '../Services/leadStatus/leadStatusService';
import { toast } from 'react-toastify';
import AddLeadStatusModal from '../component/reusable/leadStatus/addLeadStatusModel';
import DeleteModal from '../component/reusable/deleteModel';

const LeadStatus = () => {
  const navigate = useNavigate();
  const [leadStatuses, setLeadStatuses] = useState([
    {
      id: 1,
      statusName: "Connected",
      totalCount: 45,
      leadSourceName: "Website",
      color: "#10B981",
      status: "ACTIVE"
    },
    {
      id: 2,
      statusName: "Not Connected",
      totalCount: 32,
      leadSourceName: "Referral",
      color: "#EF4444",
      status: "ACTIVE"
    },
    {
      id: 3,
      statusName: "Interested",
      totalCount: 28,
      leadSourceName: "LinkedIn",
      color: "#3B82F6",
      status: "ACTIVE"
    },
    {
      id: 4,
      statusName: "Not Interested",
      totalCount: 15,
      leadSourceName: "Cold Call",
      color: "#F59E0B",
      status: "INACTIVE"
    },
    {
      id: 5,
      statusName: "Follow-up Required",
      totalCount: 23,
      leadSourceName: "Email Campaign",
      color: "#8B5CF6",
      status: "ACTIVE"
    },
    {
      id: 6,
      statusName: "Converted",
      totalCount: 18,
      leadSourceName: "Website",
      color: "#10B981",
      status: "ACTIVE"
    },
    {
      id: 7,
      statusName: "Lost",
      totalCount: 12,
      leadSourceName: "Referral",
      color: "#6B7280",
      status: "INACTIVE"
    },
    {
      id: 8,
      statusName: "Qualified",
      totalCount: 35,
      leadSourceName: "LinkedIn",
      color: "#06B6D4",
      status: "ACTIVE"
    }
  ]);

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

  const fetchLeadStatuses = async () => {
    try {
      setLoading(true);
      const res = await getAllLeadStatus({
        page: currentPage - 1,
        size: rowsPerPage,
        search: debouncedSearch,
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
  }, [currentPage, rowsPerPage, debouncedSearch]);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await toggleLeadStatusStatus(id);
      toast.success("Status updated successfully");
      fetchLeadStatuses();
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
      await deleteLeadStatus(itemToDelete.id);
      toast.success("Lead status deleted successfully");
      fetchLeadStatuses();
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete lead status");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: "sNo",
      header: "S.No",
      render: (value, row, index) => (
        <span className="font-medium">{(currentPage - 1) * rowsPerPage + index + 1}</span>
      )
    },
    { key: "statusName", header: "Status Name" },
    { key: "totalCount", header: "Total Count" },
    { key: "leadSourceName", header: "Lead source Name" },
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

        <CustomButton variant="primary" onClick={() => { setEditData(null); setIsAddModalOpen(true); }} className="text-sm py-2 px-4 shadow-sm hover:shadow-md transition-shadow">
          + Add Lead Status
        </CustomButton>
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
          emptyMessage={loading ? "Loading..." : "No lead statuses found"}
          actions={(row) => (
            <div className="flex justify-center items-center gap-3">
              <button
                className="text-gray-500 hover:text-gray-700 transition bg-transparent border-none cursor-pointer"
                title="View"
                onClick={() => navigate(`/lead-status-details/${row.id}`)}
              >
                <FiEye size={18} />
              </button>
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
        message={`Are you sure you want to delete the lead status "${itemToDelete?.statusName}"?`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default LeadStatus;

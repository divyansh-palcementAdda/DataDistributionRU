import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../component/reusable/CustomButton';
import ReusableTable from '../component/reusable/table';
import Toggle from '../component/reusable/custumToggle';
import { getAllLeadStatus, toggleLeadStatusStatus, deleteLeadStatus } from '../Services/leadStatus/leadStatusService';
import { toast } from 'react-toastify';
import AddLeadStatusModal from '../component/reusable/leadStatus/addLeadStatusModel';
import DeleteModal from '../component/reusable/deleteModel';

const LeadStatus = () => {
  const navigate = useNavigate();
  const [leadStatuses, setLeadStatuses] = useState([]);

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
      key: "statusName", 
      header: "Status Name",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: row.color || '#3B82F6' }}
          />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    { key: "description", header: "Description" },
    {
      key: "color",
      header: "Color",
      render: (color) => (
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded border border-gray-200" 
            style={{ backgroundColor: color }}
          />
          <span className="text-xs text-gray-500">{color}</span>
        </div>
      )
    },
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
          <p className="text-sm text-gray-500 mt-1">Manage lead status configurations (Connected, Not Connected, Interested, Not Interested, etc.)</p>
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
          onView={(row) => navigate(`/lead-status-details/${row.id}`)}
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

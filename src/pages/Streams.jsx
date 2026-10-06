import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../component/reusable/CustomButton';
import ReusableTable from '../component/reusable/table';
import Toggle from '../component/reusable/custumToggle';
import { toast } from 'react-toastify';
import AddStreamModal from '../component/reusable/stream/AddStreamModal';
import DeleteModal from '../component/reusable/deleteModel';
import { getAllStreams, deleteStream, toggleStreamStatus } from '../Services/streams/streamService';
import { usePermissions } from '../PermissionContext';
import * as XLSX from 'xlsx';

const Streams = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [streams, setStreams] = useState([]);

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

  const canCreateStream = hasPermission('STREAM_CREATE');
  const canUpdateStream = hasPermission('STREAM_UPDATE');
  const canDeleteStream = hasPermission('STREAM_DELETE');
  const canViewStream = hasPermission('STREAM_VIEW') || hasPermission('STREAM_READ');

  const fetchStreams = async () => {
    try {
      setLoading(true);
      const res = await getAllStreams({
        page: currentPage - 1,
        size: rowsPerPage,
        search: debouncedSearch,
        sortBy,
        sortDirection,
      });

      setStreams(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 0);
      setTotalElements(res.data?.totalElements || 0);
    } catch (error) {
      toast.error(error.message || "Failed to fetch streams");
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
    fetchStreams();
  }, [currentPage, rowsPerPage, debouncedSearch, sortBy, sortDirection]);

  const handleToggleStatus = async (id) => {
    if (!canUpdateStream) {
      toast.error('You do not have permission to update stream status');
      return;
    }
    try {
      const response = await toggleStreamStatus(id);
      if (response.success || response.data) {
        toast.success("Stream status updated successfully");
        fetchStreams();
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
      const response = await deleteStream(itemToDelete.id);
      if (response.success || response.data !== undefined) {
        toast.success("Stream deleted successfully");
        fetchStreams();
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
      } else {
        toast.error(response.message || "Failed to delete stream");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete stream");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSort = (columnKey, direction) => {
    setSortBy(columnKey);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  const downloadExcel = async () => {
    try {
      const res = await getAllStreams({
        page: 0,
        size: 10000,
        search: debouncedSearch,
        sortBy,
        sortDirection,
      });

      const allStreams = res.data?.content || [];

      const excelData = allStreams.map((item, index) => ({
        'S.No': index + 1,
        'Stream': item.name || '-',
        'Code': item.code || '-',
        'Description': item.description || '-',
        'Total Data': item.totalData ?? 0,
        'Total Allotted Data': item.totalAllottedData ?? 0,
        'Total Unallotted Data': item.totalUnallottedData ?? 0,
        'Total Availed Data': item.totalAvailedData ?? 0,
        'Status': item.active ? 'Active' : 'Inactive',
        'Created Date': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A',
        'Updated Date': item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Streams');

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `streams_${timestamp}.xlsx`;

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
      header: "S.No",
      sortable: false,
      render: (_, row, index) => (currentPage - 1) * rowsPerPage + index + 1
    },
    {
      key: "name",
      header: "Stream",
      sortable: true,
      render: (value, row) => (
        <span
          className={canViewStream ? "text-indigo-600 font-semibold cursor-pointer hover:underline" : "font-semibold text-gray-900"}
          onClick={() => {
            if (canViewStream) navigate(`/stream-details/${row.id}`);
          }}
        >
          {value || "-"}
        </span>
      )
    },
    {
      key: "code",
      header: "Code",
      sortable: true,
      render: (value) => value ? (
        <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
          {value}
        </span>
      ) : "-"
    },
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
    {
      key: "description",
      header: "Description",
      sortable: true,
      render: (value) => (
        <span className="text-gray-600 text-sm max-w-xs truncate block" title={value || ""}>
          {value || "-"}
        </span>
      )
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      permission: 'STREAM_UPDATE',
      render: (status, row) => (
        <Toggle
          checked={row.active === true || status === 'ACTIVE'}
          onChange={() => handleToggleStatus(row.id)}
        />
      )
    }
  ];

  const columns = allColumns.filter(col => !col.permission || hasPermission(col.permission));

  return (
    <div className="block p-4 sm:p-6" id="page-streams">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Streams</h1>
          <p className="text-sm text-gray-500 mt-1">Manage academic streams and affiliations (Science, Commerce, Arts, etc.)</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search streams..."
            value={search}
            onChange={handleSearch}
            className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />

          <button
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all"
            onClick={downloadExcel}
            disabled={totalElements === 0}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export Excel
          </button>

          {canCreateStream && (
            <CustomButton
              variant="primary"
              onClick={() => {
                setEditData(null);
                setIsAddModalOpen(true);
              }}
            >
              + Add Stream
            </CustomButton>
          )}
        </div>
      </div>

      {/* Streams Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
        <ReusableTable
          columns={columns}
          data={streams}
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
          emptyMessage={loading ? "Loading..." : "No streams found"}
          onView={canViewStream ? (row) => navigate(`/stream-details/${row.id}`) : undefined}
          onEdit={canUpdateStream ? (row) => {
            setEditData(row);
            setIsAddModalOpen(true);
          } : undefined}
          onDelete={canDeleteStream ? (row) => {
            setItemToDelete(row);
            setIsDeleteModalOpen(true);
          } : undefined}
        />
      </div>

      {/* Add / Edit Modal */}
      <AddStreamModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditData(null);
        }}
        onSubmit={() => {
          setIsAddModalOpen(false);
          setEditData(null);
          fetchStreams();
        }}
        initialData={editData}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete Stream"
        message={`Are you sure you want to delete stream "${itemToDelete?.name}"? Leads referencing this stream will retain their historical records.`}
      />
    </div>
  );
};

export default Streams;

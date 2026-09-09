import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../component/reusable/CustomButton';
import ReusableTable from '../component/reusable/table';
import Toggle from '../component/reusable/custumToggle';
import { getAllPrograms, toggleProgramActive, deleteProgram } from '../Services/program/programService';
import { toast } from 'react-toastify';
import AddProgramModal from '../component/reusable/program/AddProgramModal';
import MapCoursesModal from '../component/reusable/program/MapCoursesModal';
import DeleteModal from '../component/reusable/deleteModel';
import { usePermissions } from '../PermissionContext';
import { FiBookOpen, FiPlus, FiSearch, FiLayers } from 'react-icons/fi';

const Programs = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const canReadProgram = () => {
    return hasPermission('PROGRAM_VIEW') || hasPermission('PROGRAM_READ');
  };

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mapCoursesTarget, setMapCoursesTarget] = useState(null);

  // Search and Sort
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('DESC');

  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllPrograms({
        page: currentPage - 1,
        size: rowsPerPage,
        search: debouncedSearch,
        sortBy,
        sortDirection: sortDirection ? sortDirection.toUpperCase() : 'DESC',
      });

      if (res?.success && res?.data) {
        setPrograms(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      } else if (res?.content) {
        setPrograms(res.content || []);
        setTotalPages(res.totalPages || 0);
        setTotalElements(res.totalElements || 0);
      } else {
        setPrograms(res?.data || []);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch programs');
    } finally {
      setLoading(false);
    }
  }, [currentPage, rowsPerPage, debouncedSearch, sortBy, sortDirection]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const handleToggleStatus = async (id) => {
    if (!hasPermission('PROGRAM_UPDATE')) {
      toast.error('You do not have permission to update program status');
      return;
    }
    try {
      await toggleProgramActive(id);
      toast.success('Program status updated successfully');
      fetchPrograms();
    } catch (error) {
      toast.error(error.message || 'Failed to update program status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeleting(true);
      await deleteProgram(itemToDelete.id);
      toast.success('Program deleted successfully');
      fetchPrograms();
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error(error.message || 'Failed to delete program');
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
      key: 'sno',
      header: 'S.No',
      sortable: false,
      render: (_, row, index) => (currentPage - 1) * rowsPerPage + index + 1,
    },
    {
      key: 'name',
      header: 'Program Name',
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{value || '-'}</span>
          {row?.code && (
            <span className="text-[11px] font-mono text-gray-500 font-medium">
              Code: {row.code}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Code',
      sortable: true,
      render: (value) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-blue-50 text-blue-700 border border-blue-100">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'totalCourses',
      header: 'Mapped Courses',
      render: (value, row) => {
        const count = value ?? (row?.courses?.length || 0);
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMapCoursesTarget(row);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-100"
            title="Click to manage courses"
          >
            <FiLayers className="w-3 h-3" />
            <span>{count} {count === 1 ? 'Course' : 'Courses'}</span>
          </button>
        );
      },
    },
    {
      key: 'description',
      header: 'Description',
      render: (value) => (
        <span className="text-xs text-gray-600 line-clamp-1 max-w-xs" title={value}>
          {value || '—'}
        </span>
      ),
    },
    ...(hasPermission('PROGRAM_UPDATE') ? [{
      key: 'status',
      header: 'Status',
      render: (status, row) => (
        <Toggle
          checked={status === 'ACTIVE' || status === true}
          onChange={() => handleToggleStatus(row.id)}
        />
      ),
    }] : []),
  ];

  return (
    <div className="block p-4 sm:p-6" id="page-programs">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {totalElements} total
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage university programs/schools and their course mappings
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search programs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {hasPermission('PROGRAM_CREATE') && (
            <CustomButton
              variant="primary"
              onClick={() => {
                setEditData(null);
                setIsAddModalOpen(true);
              }}
              className="text-sm py-2 px-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Program</span>
            </CustomButton>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
        <ReusableTable
          columns={columns}
          data={programs}
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
          emptyMessage={loading ? 'Loading programs...' : 'No programs found'}
          onView={canReadProgram() ? (row) => navigate(`/program-details/${row.id}`) : undefined}
          onEdit={hasPermission('PROGRAM_UPDATE') ? (row) => {
            setEditData(row);
            setIsAddModalOpen(true);
          } : undefined}
          onDelete={hasPermission('PROGRAM_DELETE') ? (row) => {
            setItemToDelete(row);
            setIsDeleteModalOpen(true);
          } : undefined}
        />
      </div>

      {/* Add / Edit Program Modal */}
      <AddProgramModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditData(null);
        }}
        initialData={editData}
        onSubmit={() => {
          setIsAddModalOpen(false);
          setEditData(null);
          fetchPrograms();
        }}
      />

      {/* Map Courses Modal */}
      <MapCoursesModal
        isOpen={Boolean(mapCoursesTarget)}
        onClose={() => setMapCoursesTarget(null)}
        program={mapCoursesTarget}
        onSuccess={() => fetchPrograms()}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Program"
        message={`Are you sure you want to delete the program "${itemToDelete?.name}"? Mapped course associations will also be unlinked.`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Programs;

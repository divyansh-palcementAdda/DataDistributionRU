import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProgramById, toggleProgramActive, mapCoursesToProgram } from '../Services/program/programService';
import { toast } from 'react-toastify';
import CustomButton from '../component/reusable/CustomButton';
import Toggle from '../component/reusable/custumToggle';
import AddProgramModal from '../component/reusable/program/AddProgramModal';
import MapCoursesModal from '../component/reusable/program/MapCoursesModal';
import { usePermissions } from '../PermissionContext';
import {
  FiArrowLeft,
  FiBookOpen,
  FiLayers,
  FiEdit2,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiTrash2,
  FiExternalLink,
  FiPlus
} from 'react-icons/fi';
import * as XLSX from 'xlsx';

const formatDate = (iso) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return iso;
  }
};

const ProgramDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const fetchProgram = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getProgramById(id);
      if (res?.success && res?.data) {
        setProgram(res.data);
      } else if (res?.data) {
        setProgram(res.data);
      } else {
        setProgram(res);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch program details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProgram();
  }, [fetchProgram]);

  const handleToggleStatus = async () => {
    if (!hasPermission('PROGRAM_UPDATE')) {
      toast.error('You do not have permission to update program status');
      return;
    }
    try {
      await toggleProgramActive(id);
      toast.success('Program status updated successfully');
      fetchProgram();
    } catch (error) {
      toast.error(error.message || 'Failed to update program status');
    }
  };

  const handleRemoveCourse = async (courseIdToRemove) => {
    if (!hasPermission('PROGRAM_UPDATE')) {
      toast.error('You do not have permission to modify mapped courses');
      return;
    }
    const currentCourseIds = (program.courses || []).map(c => c.id);
    const updatedIds = currentCourseIds.filter(cId => cId !== courseIdToRemove);

    try {
      const res = await mapCoursesToProgram(id, updatedIds);
      if (res?.success === false) {
        toast.error(res?.message || 'Failed to remove course');
        return;
      }
      toast.success('Course removed from program');
      fetchProgram();
    } catch (err) {
      toast.error(err.message || 'Failed to remove course');
    }
  };

  // Download Excel function
  const downloadExcel = () => {
    try {
      const programCourses = program.courses || [];
      if (programCourses.length === 0) {
        toast.warning('No courses to download');
        return;
      }

      // Flatten the courses data for Excel export
      const excelData = programCourses.map((course, index) => {
        return {
          'S.No': index + 1,
          'Program Name': program.name || 'N/A',
          'Program Code': program.code || 'N/A',
          'Course Name': course.name || course.courseName || 'N/A',
          'Course Code': course.code || 'N/A',
          'Course Type': course.courseTypeName || course.courseType?.name || 'N/A',
          'Course ID': course.id || 'N/A'
        };
      });

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Program Courses');
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `program_courses_${program.code || 'program'}_${timestamp}.xlsx`;
      
      // Download the file
      XLSX.writeFile(workbook, filename);
      
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Error downloading Excel:', error);
      toast.error('Failed to download Excel file');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 font-medium text-sm">Loading program details...</div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800">Program Not Found</h2>
        <p className="text-sm text-gray-500 mt-2">The requested program could not be found.</p>
        <CustomButton variant="secondary" onClick={() => navigate('/programs')} className="mt-4">
          Back to Programs
        </CustomButton>
      </div>
    );
  }

  const courses = program.courses || [];
  const isActive = program.status === 'ACTIVE' || program.status === true;

  return (
    <div className="block p-4 sm:p-6 max-w-7xl mx-auto" id="page-program-details">
      {/* Top navigation */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/programs')}
          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-sm transition-all"
        >
          <FiArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900">{program.name}</h1>
            <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              {program.code}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full ${
              isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}>
              {isActive ? <FiCheckCircle className="w-3 h-3" /> : <FiXCircle className="w-3 h-3" />}
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Created on {formatDate(program.createdAt)} {program.updatedAt && `· Last updated ${formatDate(program.updatedAt)}`}
          </p>
        </div>
      </div>

      {/* Main Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* Info Card 1 */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Program Overview</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <FiBookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900 mb-1">{program.name}</div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {program.description || 'No description provided for this program.'}
            </p>
          </div>
          {hasPermission('PROGRAM_UPDATE') && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
              >
                <FiEdit2 className="w-3.5 h-3.5" />
                <span>Edit Program Info</span>
              </button>
            </div>
          )}
        </div>

        {/* Info Card 2 */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Course Statistics</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FiLayers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-indigo-600">
              {courses.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Active mapped courses under this program/school
            </div>
          </div>
          {hasPermission('PROGRAM_UPDATE') && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setIsMapModalOpen(true)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
              >
                <FiPlus className="w-3.5 h-3.5" />
                <span>Manage Course Mapping</span>
              </button>
            </div>
          )}
        </div>

        {/* Info Card 3 */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status & Availability</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <FiCalendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-gray-900">Program Availability</div>
              <div className="text-xs text-gray-500 mt-0.5">Toggle to enable or disable new lead allocation</div>
            </div>
            {hasPermission('PROGRAM_UPDATE') && (
              <Toggle
                checked={isActive}
                onChange={handleToggleStatus}
              />
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
            Internal ID: <span className="font-mono text-[11px] text-gray-600">{program.id}</span>
          </div>
        </div>
      </div>

      {/* Mapped Courses Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-900 text-base">Mapped Courses</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              {courses.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadExcel}
              disabled={courses.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Download
            </button>
            {hasPermission('PROGRAM_UPDATE') && (
              <CustomButton
                variant="primary"
                onClick={() => setIsMapModalOpen(true)}
                className="text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <FiPlus className="w-3.5 h-3.5" />
                <span>Map More Courses</span>
              </CustomButton>
            )}
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-3">
              <FiLayers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">No Courses Mapped</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              This program currently has no active mapped courses. Click 'Map More Courses' to link courses.
            </p>
            {hasPermission('PROGRAM_UPDATE') && (
              <CustomButton
                variant="primary"
                onClick={() => setIsMapModalOpen(true)}
                className="text-xs mt-4"
              >
                Map Courses Now
              </CustomButton>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 text-gray-600 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">S.No</th>
                  <th className="px-6 py-3">Course Name</th>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Course Type</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {courses.map((course, idx) => {
                  const cName = course.name || course.courseName || `Course #${course.id}`;
                  const cCode = course.code || '—';
                  const cType = course.courseTypeName || course.courseType?.name || '—';

                  return (
                    <tr key={course.id || idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 text-xs font-medium text-gray-500">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900 block">{cName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                          {cCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">{cType}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/course-details/${course.id}`)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Course Details"
                          >
                            <FiExternalLink className="w-4 h-4" />
                          </button>
                          {hasPermission('PROGRAM_UPDATE') && (
                            <button
                              onClick={() => handleRemoveCourse(course.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Unmap Course from Program"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddProgramModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={program}
        onSubmit={() => {
          setIsEditModalOpen(false);
          fetchProgram();
        }}
      />

      <MapCoursesModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        program={program}
        onSuccess={() => fetchProgram()}
      />
    </div>
  );
};

export default ProgramDetails;

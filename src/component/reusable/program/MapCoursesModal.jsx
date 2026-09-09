import React, { useState, useEffect } from 'react';
import CustomButton from '../CustomButton';
import { mapCoursesToProgram } from '../../../Services/program/programService';
import { getCoursesDropdown } from '../../../Services/drop-down/dropDownService';
import { toast } from 'react-toastify';
import { FiBookOpen, FiX, FiCheck, FiSearch } from 'react-icons/fi';

const MapCoursesModal = ({
  isOpen,
  onClose,
  program,
  onSuccess
}) => {
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen && program) {
      const existing = program.courses ? program.courses.map(c => c.id) : [];
      setSelectedCourseIds(existing);
      setSearch('');
      fetchCourses();
    }
  }, [isOpen, program]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await getCoursesDropdown();
      if (res?.success && Array.isArray(res?.data)) {
        setAvailableCourses(res.data);
      } else if (Array.isArray(res?.data)) {
        setAvailableCourses(res.data);
      } else if (Array.isArray(res)) {
        setAvailableCourses(res);
      }
    } catch (err) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !program) return null;

  const handleToggle = (id) => {
    setSelectedCourseIds(prev =>
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredCourses.map(c => c.id);
    const allSelected = filteredIds.every(id => selectedCourseIds.includes(id));
    if (allSelected) {
      setSelectedCourseIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedCourseIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleSave = async () => {
    if (selectedCourseIds.length === 0) {
      toast.warn("At least one course must be selected to map");
      return;
    }
    try {
      setSubmitting(true);
      const res = await mapCoursesToProgram(program.id, selectedCourseIds);
      if (res?.success === false) {
        toast.error(res?.message || 'Failed to update mapped courses');
        return;
      }
      toast.success('Courses mapped successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to map courses');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCourses = availableCourses.filter(c =>
    (c.name || c.courseName || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.code || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="modal-overlay open z-50">
      <div className="modal max-w-lg w-full mx-4 overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="modal-header border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FiBookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Manage Courses</h2>
              <p className="text-xs text-gray-500">
                Program: <span className="font-semibold text-gray-700">{program.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-700">
              Selected Courses: {selectedCourseIds.length}
            </span>
            {filteredCourses.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Select/Deselect Filtered
              </button>
            )}
          </div>

          <div className="relative mb-3">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search available courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="border border-gray-200 rounded-xl max-h-60 overflow-y-auto divide-y divide-gray-100 bg-gray-50/50">
            {loading ? (
              <div className="text-center py-8 text-xs text-gray-400">Loading courses...</div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">No courses match your search</div>
            ) : (
              filteredCourses.map(c => {
                const isSelected = selectedCourseIds.includes(c.id);
                const name = c.name || c.courseName || `Course #${c.id}`;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleToggle(c.id)}
                    className={`flex items-center justify-between p-2.5 px-3.5 cursor-pointer transition-colors text-xs ${
                      isSelected ? 'bg-indigo-50/70 text-indigo-950 font-medium' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                        isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && <FiCheck className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{name}</span>
                    </div>
                    {c.code && (
                      <span className="text-[10px] text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200 font-mono">
                        {c.code}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="modal-footer border-t border-gray-100 px-6 py-4 bg-gray-50/50 flex justify-end gap-3">
          <CustomButton
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
            className="text-xs px-4 py-2"
          >
            Cancel
          </CustomButton>
          <CustomButton
            variant="primary"
            onClick={handleSave}
            disabled={submitting || loading}
            className="text-xs px-4 py-2 font-medium"
          >
            {submitting ? 'Saving...' : 'Save Mapping'}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default MapCoursesModal;

import React, { useState, useEffect } from 'react';
import CustomButton from '../CustomButton';
import CustomInput from '../CustomInput';
import Toggle from '../custumToggle';
import { createProgram, updateProgram } from '../../../Services/program/programService';
import { getCoursesDropdown } from '../../../Services/drop-down/dropDownService';
import { toast } from 'react-toastify';
import { FiBookOpen, FiX, FiCheck } from 'react-icons/fi';

const AddProgramModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData = null,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'ACTIVE',
    courseIds: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          code: initialData.code || '',
          description: initialData.description || '',
          status: initialData.status || 'ACTIVE',
          courseIds: initialData.courses ? initialData.courses.map(c => c.id) : (initialData.courseIds || [])
        });
      } else {
        setFormData({
          name: '',
          code: '',
          description: '',
          status: 'ACTIVE',
          courseIds: []
        });
      }
      setCourseSearch('');
      setErrors({});
    }
  }, [isOpen, initialData]);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const res = await getCoursesDropdown();
      if (res?.success && Array.isArray(res?.data)) {
        setAvailableCourses(res.data);
      } else if (Array.isArray(res?.data)) {
        setAvailableCourses(res.data);
      } else if (Array.isArray(res)) {
        setAvailableCourses(res);
      }
    } catch (err) {
      console.error("Failed to fetch courses for dropdown", err);
    } finally {
      setLoadingCourses(false);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleToggleCourse = (courseId) => {
    setFormData(prev => {
      const exists = prev.courseIds.includes(courseId);
      const updated = exists
        ? prev.courseIds.filter(id => id !== courseId)
        : [...prev.courseIds, courseId];
      return { ...prev, courseIds: updated };
    });
  };

  const handleSelectAllFilteredCourses = () => {
    const filteredIds = filteredCourses.map(c => c.id);
    const allSelected = filteredIds.every(id => formData.courseIds.includes(id));
    if (allSelected) {
      setFormData(prev => ({
        ...prev,
        courseIds: prev.courseIds.filter(id => !filteredIds.includes(id))
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        courseIds: Array.from(new Set([...prev.courseIds, ...filteredIds]))
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Program name is required';
    if (!formData.code.trim()) newErrors.code = 'Program code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        setIsSubmitting(true);
        const payload = {
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          description: formData.description.trim() || null,
          status: formData.status,
          courseIds: formData.courseIds
        };

        if (initialData && initialData.id) {
          const res = await updateProgram(initialData.id, payload);
          if (res?.success === false) {
            toast.error(res?.message || "Failed to update program");
            return;
          }
          toast.success("Program updated successfully!");
        } else {
          const res = await createProgram(payload);
          if (res?.success === false) {
            toast.error(res?.message || "Failed to create program");
            return;
          }
          toast.success("Program created successfully!");
        }
        onSubmit();
      } catch (error) {
        toast.error(error.message || `Failed to ${initialData ? 'update' : 'create'} program`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const filteredCourses = availableCourses.filter(c =>
    (c.name || c.courseName || '').toLowerCase().includes(courseSearch.toLowerCase()) ||
    (c.code || '').toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <div className="modal-overlay open z-50">
      <div className="modal max-w-xl w-full mx-4 overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="modal-header border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <FiBookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">
                {initialData ? 'Edit Program' : 'Add New Program'}
              </h2>
              <p className="text-xs text-gray-500">
                {initialData ? 'Update program details and mapped courses' : 'Create a university program / school and map courses'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading || isSubmitting}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body px-6 py-5 max-h-[70vh] overflow-y-auto">
          <form id="addProgramForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomInput
                label="Program Name"
                name="name"
                placeholder="e.g. School of Engineering"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />

              <CustomInput
                label="Program Code"
                name="code"
                placeholder="e.g. SOE"
                value={formData.code}
                onChange={handleChange}
                error={errors.code}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-semibold text-gray-700">Description</label>
              <textarea
                name="description"
                placeholder="Enter program description or overview..."
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="px-3.5 py-2 text-sm border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none border-gray-300 bg-white"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <span className="text-sm font-semibold text-gray-800">Status</span>
                <p className="text-xs text-gray-500">Active programs can be assigned leads and courses</p>
              </div>
              <div className="flex items-center gap-3">
                <Toggle
                  checked={formData.status === 'ACTIVE'}
                  onChange={() => {
                    setFormData(prev => ({
                      ...prev,
                      status: prev.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                    }));
                  }}
                />
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  formData.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                }`}>
                  {formData.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Mapped Courses Selection */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-gray-800">Map Courses</label>
                  <span className="text-xs text-gray-500 ml-2">
                    ({formData.courseIds.length} selected)
                  </span>
                </div>
                {filteredCourses.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllFilteredCourses}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Toggle All Filtered
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Search courses to map..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="border border-gray-200 rounded-xl max-h-48 overflow-y-auto p-2 divide-y divide-gray-100 bg-gray-50/50">
                {loadingCourses ? (
                  <div className="text-center py-4 text-xs text-gray-400">Loading courses...</div>
                ) : filteredCourses.length === 0 ? (
                  <div className="text-center py-4 text-xs text-gray-400">No courses available</div>
                ) : (
                  filteredCourses.map(course => {
                    const isSelected = formData.courseIds.includes(course.id);
                    const name = course.name || course.courseName || `Course #${course.id}`;
                    return (
                      <div
                        key={course.id}
                        onClick={() => handleToggleCourse(course.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                          isSelected ? 'bg-blue-50/80 text-blue-900 font-medium' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'
                          }`}>
                            {isSelected && <FiCheck className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{name}</span>
                          {course.code && (
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                              {course.code}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="modal-footer border-t border-gray-100 px-6 py-4 bg-gray-50/50 flex justify-end gap-3">
          <CustomButton
            variant="secondary"
            onClick={onClose}
            disabled={isLoading || isSubmitting}
            className="text-xs px-4 py-2"
          >
            Cancel
          </CustomButton>
          <CustomButton
            type="submit"
            form="addProgramForm"
            variant="primary"
            disabled={isLoading || isSubmitting}
            className="text-xs px-4 py-2 font-medium"
          >
            {isSubmitting || isLoading ? 'Saving...' : initialData ? 'Update Program' : 'Create Program'}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default AddProgramModal;

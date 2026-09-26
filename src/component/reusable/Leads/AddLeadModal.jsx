import { useState, useEffect, useRef, useMemo } from 'react';
import CustomInput from '../CustomInput';
import { useAppContext } from '../../../AppContext';
import { usePermissions } from '../../../PermissionContext';
import { canEditLeadField } from '../../../config/leadFieldPermissions';
import { createLead, updateLead } from '../../../Services/lead/leadService';
import { getCountries, getStates, getCities } from '../../../Services/location/locationService';
import {
  getLeadSourcesDropdown,
  getProgramsDropdown,
  getCoursesDropdown,
  getGradesDropdown,
  getBoardsDropdown,
  getLeadStatusesDropdown,
  getUsersDropdown,
  getCourseTypesDropdown,
  getDepartmentsDropdown,
  getStatesDropdown,
  getCitiesDropdown
} from '../../../Services/drop-down/dropDownService';

// Reusable unified Select Field matching CustomInput
const SelectField = ({ label, readOnly, children, disabled, value, onChange, loading: isLoading, loadingText, className = '' }) => (
  <div className={`flex flex-col gap-1 w-full ${className}`}>
    {label && (
      <label className="text-xs font-semibold text-gray-700 ml-0.5 flex items-center justify-between">
        <span>{label}</span>
        {readOnly && <span className="text-[10px] text-gray-400 font-normal">🔒 Read-only</span>}
      </label>
    )}
    <div className="relative w-full">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3.5 py-2 text-sm rounded-[8px] border transition-all outline-none cursor-pointer appearance-none bg-white pr-9 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 ${
          !value ? 'text-gray-400' : 'text-gray-800 font-medium'
        } ${disabled ? 'opacity-60 pointer-events-none bg-gray-50 border-gray-200' : 'border-gray-300 hover:border-gray-400'}`}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
    {isLoading && <span className="text-[10px] text-blue-600 ml-0.5">{loadingText || 'Loading...'}</span>}
  </div>
);

const AddLeadModal = () => {
  const { isAddLeadModalOpen, closeAddLeadModal, showToast, editLeadData, triggerLeadRefresh } = useAppContext();
  const { hasPermission } = usePermissions();

  const isEditMode = Boolean(editLeadData);

  const isLeadRegisteredAndVerified = useMemo(() => {
    if (!editLeadData) return false;
    const status = (editLeadData.registrationStatus || editLeadData.registration_status || '')?.toUpperCase();
    return Boolean(
      status === 'COMPLETED_MATCHED' ||
      status === 'MANUALLY_APPROVED' ||
      status === 'VERIFIED' ||
      status === 'REGISTERED_VERIFIED' ||
      status === 'APPROVED' ||
      editLeadData.isRegistrationVerified ||
      editLeadData.registrationVerified
    );
  }, [editLeadData]);

  const isFieldVisible = (fieldKey) => {
    // Registered Course field rules:
    // - Remove completely from Add Lead modal (!isEditMode)
    // - While editing, only show if lead is registered and verified AND has edit permission
    if (fieldKey === 'course') {
      if (!isEditMode) return false;
      return canEditLeadField(hasPermission, 'course') && isLeadRegisteredAndVerified;
    }

    if (!isEditMode) return true;
    // In edit mode: hide fields if user lacks edit permission (do not show read-only fields)
    return canEditLeadField(hasPermission, fieldKey);
  };

  const isFieldDisabled = (fieldKey, defaultDisabled = false) => {
    if (!isEditMode) return defaultDisabled;
    if (defaultDisabled) return true;
    return !canEditLeadField(hasPermission, fieldKey);
  };

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    alternatePhoneNumber: '',
    email: '',
    city: '',
    state: '',
    country: '',
    preferredStudyState: '',
    preferredStudyCity: '',
    leadSourceIds: [],
    sourceDetails: '',
    interestedCourseIds: [],
    courseId: '',
    registeredCourseId: '',
    boardId: '',
    gradeId: '',
    programId: '',
    courseTypeId: '',
    departmentId: '',
    remarks: '',
    assignedToUserId: '',
    statusId: '', // Will be set to "raw" when leadStatuses load
    active: true,
    nextFollowUpDate: '',
  });

  const [dropdownStates, setDropdownStates] = useState({
    course: false,
    leadSources: false,
    interestedCourses: false,
  });

  const [searchTerms, setSearchTerms] = useState({
    course: '',
    leadSources: '',
    interestedCourses: '',
  });

  const courseDropdownRef = useRef(null);
  const leadSourcesDropdownRef = useRef(null);
  const interestedCoursesDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target)) {
        setDropdownStates(prev => ({ ...prev, course: false }));
      }
      if (leadSourcesDropdownRef.current && !leadSourcesDropdownRef.current.contains(event.target)) {
        setDropdownStates(prev => ({ ...prev, leadSources: false }));
      }
      if (interestedCoursesDropdownRef.current && !interestedCoursesDropdownRef.current.contains(event.target)) {
        setDropdownStates(prev => ({ ...prev, interestedCourses: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [leadSources, setLeadSources] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [preferredStates, setPreferredStates] = useState([]);
  const [preferredCities, setPreferredCities] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [boards, setBoards] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leadStatuses, setLeadStatuses] = useState([]);
  const [users, setUsers] = useState([]);
  const [locationLoading, setLocationLoading] = useState({
    countries: false,
    states: false,
    cities: false,
  });
  const [preferredLocationLoading, setPreferredLocationLoading] = useState({
    states: false,
    cities: false,
  });
  const [dropdownLoading, setDropdownLoading] = useState({
    programs: false,
    courses: false,
    grades: false,
    boards: false,
    courseTypes: false,
    departments: false,
    leadStatuses: false,
    users: false,
  });

  useEffect(() => {
    const fetchLeadSources = async () => {
      try {
        const res = await getLeadSourcesDropdown();
        if (res?.success && res?.data) {
          setLeadSources(res.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch lead sources:', err);
      }
    };

    const fetchCountries = async () => {
      setLocationLoading((prev) => ({ ...prev, countries: true }));
      try {
        const res = await getCountries();
        if (res?.data?.error === false && res?.data?.data) {
          setCountries(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch countries:', err);
      } finally {
        setLocationLoading((prev) => ({ ...prev, countries: false }));
      }
    };

    const fetchPrograms = async () => {
      setDropdownLoading((prev) => ({ ...prev, programs: true }));
      try {
        const res = await getProgramsDropdown();
        if (res?.success && res?.data) {
          setPrograms(res.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch programs:', err);
      } finally {
        setDropdownLoading((prev) => ({ ...prev, programs: false }));
      }
    };

    const fetchCourses = async (progId = formData.programId) => {
      setDropdownLoading((prev) => ({ ...prev, courses: true }));
      try {
        const res = await getCoursesDropdown(formData.courseTypeId || '', progId || '');
        if (res?.success && res?.data) {
          setCourses(res.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setDropdownLoading((prev) => ({ ...prev, courses: false }));
      }
    };

    const fetchGrades = async () => {
      setDropdownLoading((prev) => ({ ...prev, grades: true }));
      try {
        const res = await getGradesDropdown();
        if (res?.success && res?.data) {
          setGrades(res.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch grades:', err);
      } finally {
        setDropdownLoading((prev) => ({ ...prev, grades: false }));
      }
    };

    const fetchBoards = async () => {
      setDropdownLoading((prev) => ({ ...prev, boards: true }));
      try {
        const res = await getBoardsDropdown();
        if (res?.success && res?.data) {
          setBoards(res.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch boards:', err);
      } finally {
        setDropdownLoading((prev) => ({ ...prev, boards: false }));
      }
    };

    const fetchLeadStatuses = async () => {
      setDropdownLoading((prev) => ({ ...prev, leadStatuses: true }));
      try {
        const res = await getLeadStatusesDropdown();
        if (res?.success && res?.data) {
          setLeadStatuses(res.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch lead statuses:', err);
      } finally {
        setDropdownLoading((prev) => ({ ...prev, leadStatuses: false }));
      }
    };

    const fetchUsers = async () => {
      setDropdownLoading((prev) => ({ ...prev, users: true }));
      try {
        const res = await getUsersDropdown();
        if (res?.success && res?.data) {
          setUsers(res.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setDropdownLoading((prev) => ({ ...prev, users: false }));
      }
    };

    const fetchCourseTypes = async () => {
      setDropdownLoading((prev) => ({ ...prev, courseTypes: true }));
      try {
        const res = await getCourseTypesDropdown();
        if (res?.success && res?.data) {
          setCourseTypes(res.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch course types:', err);
      } finally {
        setDropdownLoading((prev) => ({ ...prev, courseTypes: false }));
      }
    };

    const fetchDepartments = async () => {
      setDropdownLoading((prev) => ({ ...prev, departments: true }));
      try {
        const res = await getDepartmentsDropdown();
        if (res?.success && res?.data) {
          setDepartments(res.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch departments:', err);
      } finally {
        setDropdownLoading((prev) => ({ ...prev, departments: false }));
      }
    };

    const fetchPreferredStates = async () => {
      setPreferredLocationLoading((prev) => ({ ...prev, states: true }));
      try {
        const res = await getStatesDropdown();
        if (res?.success && res?.data) {
          setPreferredStates(res.data || []);
        } else {
          setPreferredStates([]);
        }
      } catch (err) {
        console.error('Failed to fetch preferred states:', err);
        setPreferredStates([]);
      } finally {
        setPreferredLocationLoading((prev) => ({ ...prev, states: false }));
      }
    };
    
    if (isAddLeadModalOpen) {
      fetchLeadSources();
      fetchCountries();
      fetchPreferredStates();
      fetchPrograms();
      fetchCourses();
      fetchGrades();
      fetchBoards();
      fetchLeadStatuses();
      fetchUsers();
      fetchCourseTypes();
      fetchDepartments();
      if (!editLeadData) {
        setStates([]);
        setCities([]);
        setPreferredCities([]);
      }
    }
  }, [isAddLeadModalOpen, editLeadData]);

  useEffect(() => {
    if (editLeadData) {
      const { 
        fullName, phoneNumber, alternatePhoneNumber, email, city, state, country, 
        preferredStudyState, preferredStudyCity,
        leadSourceIds, sourceDetails, interestedCourseIds,
        courseId, registeredCourseId, boardId, gradeId, programId, courseTypeId, departmentId, remarks, 
        assignedToUserId, statusId, active, nextFollowUpDate 
      } = editLeadData;

      const editProgramId = editLeadData.program?.id || editLeadData.programId || programId || '';

      // Convert all IDs to strings so they match HTML <select> / <option value="..."> comparisons
      const toStr = (v) => (v !== undefined && v !== null && v !== '') ? String(v) : '';
      const toStrArr = (arr) => Array.isArray(arr) ? arr.map(toStr).filter(Boolean) : [];

      setFormData({
        fullName: fullName || '',
        phoneNumber: phoneNumber || '',
        alternatePhoneNumber: alternatePhoneNumber || '',
        email: email || '',
        city: city || '',
        state: state || '',
        country: country || '',
        preferredStudyState: preferredStudyState || '',
        preferredStudyCity: preferredStudyCity || '',
        leadSourceIds: toStrArr(leadSourceIds),
        sourceDetails: sourceDetails || '',
        interestedCourseIds: toStrArr(interestedCourseIds),
        courseId: toStr(courseId),
        registeredCourseId: toStr(registeredCourseId),
        boardId: toStr(boardId),
        gradeId: toStr(gradeId),
        programId: toStr(editProgramId),
        courseTypeId: toStr(courseTypeId),
        departmentId: toStr(departmentId),
        remarks: remarks || '',
        assignedToUserId: toStr(assignedToUserId),
        statusId: toStr(statusId),
        active: active !== undefined ? active : true,
        nextFollowUpDate: nextFollowUpDate ? (typeof nextFollowUpDate === 'string' ? nextFollowUpDate.slice(0, 10) : new Date(nextFollowUpDate).toLocaleDateString('en-CA')) : '',
      });

      if (editProgramId) {
        getCoursesDropdown(toStr(courseTypeId), toStr(editProgramId)).then(res => {
          if (res?.success && res?.data) {
            setCourses(res.data || []);
          }
        });
      }

      const fetchEditLocationData = async () => {
        if (editLeadData?.country) {
          setLocationLoading((prev) => ({ ...prev, states: true }));
          try {
            const res = await getStates(editLeadData.country);
            if (res?.data?.error === false && res?.data?.data?.states) {
              setStates(res.data.data.states);
            }
          } catch (err) {
            console.error('Failed to fetch states for edit:', err);
          } finally {
            setLocationLoading((prev) => ({ ...prev, states: false }));
          }
        }

        if (editLeadData?.country && editLeadData?.state) {
          setLocationLoading((prev) => ({ ...prev, cities: true }));
          try {
            const res = await getCities(editLeadData.country, editLeadData.state);
            if (res?.data?.error === false && res?.data?.data) {
              setCities(res.data.data);
            }
          } catch (err) {
            console.error('Failed to fetch cities for edit:', err);
          } finally {
            setLocationLoading((prev) => ({ ...prev, cities: false }));
          }
        }

        if (editLeadData?.preferredStudyState) {
          setPreferredLocationLoading((prev) => ({ ...prev, cities: true }));
          try {
            const res = await getCitiesDropdown(editLeadData.preferredStudyState);
            if (res?.success && res?.data) {
              setPreferredCities(res.data || []);
            }
          } catch (err) {
            console.error('Failed to fetch preferred cities for edit:', err);
          } finally {
            setPreferredLocationLoading((prev) => ({ ...prev, cities: false }));
          }
        }
      };

      fetchEditLocationData();
    } else {
      // Set default status to "raw" for new leads
      const rawStatus = leadStatuses.find(status => 
        status.name?.toLowerCase() === 'raw' || 
        status.name?.toLowerCase() === 'main raw'
      );
      
      setFormData({
        fullName: '',
        phoneNumber: '',
        alternatePhoneNumber: '',
        email: '',
        city: '',
        state: '',
        country: '',
        preferredStudyState: '',
        preferredStudyCity: '',
        leadSourceIds: [],
        sourceDetails: '',
        interestedCourseIds: [],
        courseId: '',
        registeredCourseId: '',
        boardId: '',
        gradeId: '',
        courseTypeId: '',
        departmentId: '',
        remarks: '',
        assignedToUserId: '',
        statusId: rawStatus ? String(rawStatus.id) : '',
        active: true,
        nextFollowUpDate: '',
      });
      setPreferredCities([]);
    }
  }, [editLeadData]);

  useEffect(() => {
    const fetchStates = async () => {
      if (!formData.country) {
        setStates([]);
        setCities([]);
        return;
      }

      setLocationLoading((prev) => ({ ...prev, states: true }));
      try {
        const res = await getStates(formData.country);
        if (res?.data?.error === false && res?.data?.data?.states) {
          setStates(res.data.data.states);
        } else {
          setStates([]);
        }
      } catch (err) {
        console.error('Failed to fetch states:', err);
        setStates([]);
      } finally {
        setLocationLoading((prev) => ({ ...prev, states: false }));
      }
    };

    fetchStates();
  }, [formData.country]);

  useEffect(() => {
    const fetchCities = async () => {
      if (!formData.country || !formData.state) {
        setCities([]);
        return;
      }

      setLocationLoading((prev) => ({ ...prev, cities: true }));
      try {
        const res = await getCities(formData.country, formData.state);
        if (res?.data?.error === false && res?.data?.data) {
          setCities(res.data.data);
        } else {
          setCities([]);
        }
      } catch (err) {
        console.error('Failed to fetch cities:', err);
        setCities([]);
      } finally {
        setLocationLoading((prev) => ({ ...prev, cities: false }));
      }
    };

    fetchCities();
  }, [formData.country, formData.state]);

  useEffect(() => {
    const fetchPreferredCities = async () => {
      if (!formData.preferredStudyState) {
        setPreferredCities([]);
        return;
      }

      setPreferredLocationLoading((prev) => ({ ...prev, cities: true }));
      try {
        const res = await getCitiesDropdown(formData.preferredStudyState);
        if (res?.success && res?.data) {
          setPreferredCities(res.data || []);
        } else {
          setPreferredCities([]);
        }
      } catch (err) {
        console.error('Failed to fetch preferred cities:', err);
        setPreferredCities([]);
      } finally {
        setPreferredLocationLoading((prev) => ({ ...prev, cities: false }));
      }
    };

    fetchPreferredCities();
  }, [formData.preferredStudyState]);

  // Set default status to "raw" when leadStatuses are loaded and it's a new lead
  useEffect(() => {
    if (!editLeadData && leadStatuses.length > 0 && !formData.statusId) {
      const rawStatus = leadStatuses.find(status => 
        status.name?.toLowerCase() === 'raw' || 
        status.name?.toLowerCase() === 'main raw'
      );
      if (rawStatus) {
        setFormData(prev => ({ ...prev, statusId: String(rawStatus.id) }));
      }
    }
  }, [leadStatuses, editLeadData, formData.statusId]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    
    if (field === 'country') {
      setFormData((prev) => ({ ...prev, country: value, state: '', city: '' }));
    } else if (field === 'state') {
      setFormData((prev) => ({ ...prev, state: value, city: '' }));
    } else if (field === 'preferredStudyState') {
      setFormData((prev) => ({ ...prev, preferredStudyState: value, preferredStudyCity: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const resetForm = () => {
    // Set default status to "raw" when resetting form
    const rawStatus = leadStatuses.find(status => 
      status.name?.toLowerCase() === 'raw' || 
      status.name?.toLowerCase() === 'main raw'
    );
    
    setFormData({
      fullName: '',
      phoneNumber: '',
      alternatePhoneNumber: '',
      email: '',
      city: '',
      state: '',
      country: '',
      preferredStudyState: '',
      preferredStudyCity: '',
      leadSourceIds: [],
      sourceDetails: '',
      interestedCourseIds: [],
      courseId: '',
      registeredCourseId: '',
      boardId: '',
      gradeId: '',
      programId: '',
      courseTypeId: '',
      departmentId: '',
      remarks: '',
      assignedToUserId: '',
      statusId: rawStatus ? String(rawStatus.id) : '',
      active: true,
      nextFollowUpDate: '',
    });
    setStates([]);
    setCities([]);
    setPreferredCities([]);
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.phoneNumber) {
      showToast('Full Name and Phone Number are required!', 'error');
      return;
    }

    const payload = {
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      alternatePhoneNumber: formData.alternatePhoneNumber,
      email: formData.email,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      preferredStudyState: formData.preferredStudyState || null,
      preferredStudyCity: formData.preferredStudyCity || null,
      leadSourceIds: formData.leadSourceIds,
      sourceDetails: formData.sourceDetails,
      interestedCourseIds: formData.interestedCourseIds,
      courseId: formData.courseId,
      registeredCourseId: formData.registeredCourseId,
      boardId: formData.boardId,
      gradeId: formData.gradeId,
      programId: formData.programId || null,
      courseTypeId: formData.courseTypeId,
      departmentId: formData.departmentId,
      remarks: formData.remarks,
      assignedToUserId: formData.assignedToUserId,
      statusId: formData.statusId,
      active: formData.active,
      nextFollowUpDate: formData.nextFollowUpDate ? `${formData.nextFollowUpDate}T00:00:00` : null,
    };

    setLoading(true);
    try {
      let response;
      if (editLeadData) {
        response = await updateLead(editLeadData?.id ?? editLeadData?.leadId, payload);
      } else {
        response = await createLead(payload);
      }
      if (response?.status === 200 || response?.status === 201) {
        showToast(editLeadData ? 'Lead updated successfully!' : 'Lead added successfully!');
        resetForm();
        closeAddLeadModal();
        triggerLeadRefresh(); // 🔄 Leads page ko refresh signal bhejo
      } else {
        const msg =
          response?.response?.data?.message ||
          response?.message ||
          'Failed to submit lead. Please try again.';
        showToast(msg, 'error');
      }
    } catch {
      showToast('Something went wrong!', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isAddLeadModalOpen && !loading) {
        closeAddLeadModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddLeadModalOpen, loading, closeAddLeadModal]);

  if (!isAddLeadModalOpen) return null;

  const dropdownStyles = `
    .custom-dropdown-container {
      position: relative;
      width: 100%;
    }
    
    .custom-dropdown-header {
      padding: 8px 12px;
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 38px;
      height: 38px;
      font-size: 14px;
      color: #1e293b;
      transition: all 0.15s ease;
    }
    
    .custom-dropdown-header:hover {
      border-color: #94A3B8;
    }
    
    .custom-dropdown-header:focus-within {
      border-color: #2563EB;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
    }
    
    .custom-dropdown-arrow {
      font-size: 11px;
      color: #94A3B8;
      display: flex;
      align-items: center;
      transition: transform 0.15s;
    }
    
    .custom-dropdown-content {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.06);
      z-index: 1000;
      margin-top: 4px;
      max-height: 280px;
      overflow: hidden;
    }
    
    .custom-dropdown-search {
      padding: 8px 10px;
      border-bottom: 1px solid #F1F5F9;
      background: #F8FAFC;
    }
    
    .custom-search-input {
      width: 100%;
      padding: 6px 10px;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      font-size: 13px;
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.15s;
    }
    
    .custom-search-input:focus {
      border-color: #2563EB;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
    }
    
    .custom-dropdown-options {
      max-height: 220px;
      overflow-y: auto;
    }
    
    .custom-dropdown-option {
      padding: 8px 12px;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: background 0.15s;
      border-bottom: 1px solid #F8FAFC;
      font-size: 13px;
    }
    
    .custom-dropdown-option:last-child {
      border-bottom: none;
    }
    
    .custom-dropdown-option:hover {
      background: #F1F5F9;
    }
    
    .custom-dropdown-option.selected {
      background: #EFF6FF;
      color: #1D4ED8;
      font-weight: 500;
    }
    
    .custom-dropdown-option input[type="checkbox"] {
      margin-right: 8px;
      cursor: pointer;
      width: 15px;
      height: 15px;
      accent-color: #2563EB;
    }
    
    .custom-option-label {
      cursor: pointer;
      flex: 1;
      font-size: 13px;
    }
    
    .custom-no-options {
      padding: 12px;
      text-align: center;
      color: #94A3B8;
      font-size: 13px;
    }
  `;

  return (
    <>
      <style>{dropdownStyles}</style>
      <div
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        onClick={closeAddLeadModal}
      >
        <div
          className="w-full max-w-4xl max-h-[92vh] rounded-2xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
                {editLeadData ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    {editLeadData ? 'Edit Lead' : 'Add New Lead'}
                  </h2>
                  {editLeadData?.leadCode && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {editLeadData.leadCode}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editLeadData ? 'Update candidate information, course preferences and allocation' : 'Enter lead contact information and assign counselor'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeAddLeadModal}
              disabled={loading}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
              aria-label="Close modal"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Section 1: Candidate Contact Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-blue-600">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Candidate Information</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                {isFieldVisible('fullName') && (
                  <CustomInput
                    label={
                      <span className="flex items-center justify-between">
                        <span>Full Name *</span>
                        {isEditMode && !canEditLeadField(hasPermission, 'fullName') && (
                          <span className="text-[10px] text-gray-400 font-normal">🔒 Read-only</span>
                        )}
                      </span>
                    }
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={handleChange('fullName')}
                    disabled={isFieldDisabled('fullName')}
                  />
                )}
                {isFieldVisible('phoneNumber') && (
                  <CustomInput
                    label={
                      <span className="flex items-center justify-between">
                        <span>Phone Number *</span>
                        {isEditMode && !canEditLeadField(hasPermission, 'phoneNumber') && (
                          <span className="text-[10px] text-gray-400 font-normal">🔒 Read-only</span>
                        )}
                      </span>
                    }
                    placeholder="Mobile number"
                    value={formData.phoneNumber}
                    onChange={handleChange('phoneNumber')}
                    disabled={isFieldDisabled('phoneNumber')}
                  />
                )}
                {isFieldVisible('alternatePhoneNumber') && (
                  <CustomInput
                    label={
                      <span className="flex items-center justify-between">
                        <span>Alternate Phone</span>
                        {isEditMode && !canEditLeadField(hasPermission, 'alternatePhoneNumber') && (
                          <span className="text-[10px] text-gray-400 font-normal">🔒 Read-only</span>
                        )}
                      </span>
                    }
                    placeholder="Alt phone number"
                    value={formData.alternatePhoneNumber}
                    onChange={handleChange('alternatePhoneNumber')}
                    disabled={isFieldDisabled('alternatePhoneNumber')}
                  />
                )}
                {isFieldVisible('email') && (
                  <CustomInput
                    label={
                      <span className="flex items-center justify-between">
                        <span>Email</span>
                        {isEditMode && !canEditLeadField(hasPermission, 'email') && (
                          <span className="text-[10px] text-gray-400 font-normal">🔒 Read-only</span>
                        )}
                      </span>
                    }
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChange={handleChange('email')}
                    disabled={isFieldDisabled('email')}
                  />
                )}
              </div>
            </div>

            {/* Section 2: Current Location */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-blue-600">
                  <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Current Location</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {isFieldVisible('country') && (
                  <SelectField
                    label="Country"
                    readOnly={isEditMode && !canEditLeadField(hasPermission, 'country')}
                    value={formData.country}
                    onChange={handleChange('country')}
                    disabled={isFieldDisabled('country', locationLoading.countries)}
                    loading={locationLoading.countries}
                    loadingText="Loading countries..."
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.iso2} value={country.country}>
                        {country.country}
                      </option>
                    ))}
                  </SelectField>
                )}
                {isFieldVisible('state') && (
                  <SelectField
                    label="State"
                    readOnly={isEditMode && !canEditLeadField(hasPermission, 'state')}
                    value={formData.state}
                    onChange={handleChange('state')}
                    disabled={isFieldDisabled('state', !formData.country || locationLoading.states)}
                    loading={locationLoading.states}
                    loadingText="Loading states..."
                  >
                    <option value="">Select State</option>
                    {states.length > 0 ? (
                      states.map((state) => (
                        <option key={state.state_code} value={state.name}>
                          {state.name}
                        </option>
                      ))
                    ) : (
                      formData.country && !locationLoading.states && <option disabled>No states found</option>
                    )}
                  </SelectField>
                )}
                {isFieldVisible('city') && (
                  <SelectField
                    label="City"
                    readOnly={isEditMode && !canEditLeadField(hasPermission, 'city')}
                    value={formData.city}
                    onChange={handleChange('city')}
                    disabled={isFieldDisabled('city', !formData.state || locationLoading.cities)}
                    loading={locationLoading.cities}
                    loadingText="Loading cities..."
                  >
                    <option value="">Select City</option>
                    {cities.length > 0 ? (
                      cities.map((city, index) => (
                        <option key={index} value={city}>
                          {city}
                        </option>
                      ))
                    ) : (
                      formData.state && !locationLoading.cities && <option disabled>No cities found</option>
                    )}
                  </SelectField>
                )}
              </div>
            </div>

            {/* Section 3: Preferred Location (if visible) */}
            {isFieldVisible('preferredLocation') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-blue-600">
                      <circle cx="12" cy="12" r="10" />
                      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                    </svg>
                    <span>Preferred Place to Study</span>
                  </div>
                  {isEditMode && !canEditLeadField(hasPermission, 'preferredLocation') && (
                    <span className="text-[10px] text-gray-400 font-normal">🔒 Read-only</span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <SelectField
                      label="Preferred State"
                      value={formData.preferredStudyState}
                      onChange={handleChange('preferredStudyState')}
                      disabled={isFieldDisabled('preferredLocation', preferredLocationLoading.states)}
                      loading={preferredLocationLoading.states}
                      loadingText="Loading states..."
                    >
                      <option value="">Select Preferred State</option>
                      {preferredStates.map((st) => (
                        <option key={st.id || st.code || st.name} value={st.name}>
                          {st.name}
                        </option>
                      ))}
                    </SelectField>
                  </div>
                  <div>
                    <SelectField
                      label="Preferred City"
                      value={formData.preferredStudyCity}
                      onChange={handleChange('preferredStudyCity')}
                      disabled={isFieldDisabled('preferredLocation', !formData.preferredStudyState || preferredLocationLoading.cities)}
                      loading={preferredLocationLoading.cities}
                      loadingText="Loading cities..."
                    >
                      <option value="">Select Preferred City</option>
                      {preferredCities.length > 0 ? (
                        preferredCities.map((ct) => (
                          <option key={ct.id || ct.code || ct.name} value={ct.name}>
                            {ct.name}
                          </option>
                        ))
                      ) : (
                        formData.preferredStudyState && !preferredLocationLoading.cities && (
                          <option disabled>No cities found</option>
                        )
                      )}
                    </SelectField>
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: Academic & Course Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-blue-600">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                <span>Academic & Course Selection</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {isFieldVisible('program') && (
                  <SelectField
                    label="Program"
                    readOnly={isEditMode && !canEditLeadField(hasPermission, 'program')}
                    value={formData.programId || ''}
                    disabled={isFieldDisabled('program', dropdownLoading.programs)}
                    onChange={async (e) => {
                      const selectedProgramId = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        programId: selectedProgramId,
                        courseId: '',
                        registeredCourseId: '',
                        interestedCourseIds: [],
                      }));
                      setDropdownLoading((prev) => ({ ...prev, courses: true }));
                      try {
                        const res = await getCoursesDropdown(formData.courseTypeId || '', selectedProgramId || '');
                        if (res?.success && res?.data) {
                          setCourses(res.data || []);
                        }
                      } catch (err) {
                        console.error('Failed to fetch courses for program:', err);
                      } finally {
                        setDropdownLoading((prev) => ({ ...prev, courses: false }));
                      }
                    }}
                    loading={dropdownLoading.programs}
                    loadingText="Loading programs..."
                  >
                    <option value="">Select Program</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.code ? `(${p.code})` : ''}
                      </option>
                    ))}
                  </SelectField>
                )}

                {isFieldVisible('course') && (
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-xs font-semibold text-gray-700 ml-0.5 flex items-center justify-between">
                      <span>Registered Course</span>
                      {isEditMode && !canEditLeadField(hasPermission, 'course') && (
                        <span className="text-[10px] text-gray-400 font-normal">🔒 Read-only</span>
                      )}
                    </label>
                    <div className="custom-dropdown-container" ref={courseDropdownRef}>
                      <div 
                        className={`custom-dropdown-header ${isFieldDisabled('course') ? 'opacity-60 pointer-events-none bg-gray-50' : ''}`}
                        onClick={() => {
                          if (isFieldDisabled('course')) return;
                          setDropdownStates(prev => ({ ...prev, course: !prev.course }));
                        }}
                      >
                        <span className={!(formData.registeredCourseId || formData.courseId) ? 'text-gray-400' : 'text-gray-800 font-medium'}>
                          {(formData.registeredCourseId || formData.courseId)
                            ? (courses.find(c => String(c.id) === String(formData.registeredCourseId || formData.courseId))?.name ||
                               courses.find(c => String(c.id) === String(formData.registeredCourseId || formData.courseId))?.courseName ||
                               'Select Registered Course')
                            : 'Select Registered Course'
                          }
                        </span>
                        <span className="custom-dropdown-arrow">▼</span>
                      </div>
                      {dropdownStates.course && !isFieldDisabled('course') && (
                        <div className="custom-dropdown-content">
                          <div className="custom-dropdown-search">
                            <input
                              type="text"
                              placeholder="Search registered courses..."
                              value={searchTerms.course}
                              onChange={(e) => setSearchTerms(prev => ({ ...prev, course: e.target.value }))}
                              className="custom-search-input"
                            />
                          </div>
                          <div className="custom-dropdown-options">
                            {courses
                              .filter(course => 
                                (course.name || course.courseName || '')
                                  .toLowerCase()
                                  .includes(searchTerms.course.toLowerCase())
                              )
                              .map((course) => (
                              <div 
                                key={course.id} 
                                className={`custom-dropdown-option ${String(formData.registeredCourseId || formData.courseId) === String(course.id) ? 'selected' : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  id={`custom-course-${course.id}`}
                                  value={course.id}
                                  checked={String(formData.registeredCourseId || formData.courseId) === String(course.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData((prev) => ({
                                        ...prev,
                                        courseId: String(course.id),
                                        registeredCourseId: String(course.id),
                                      }));
                                    } else {
                                      setFormData((prev) => ({
                                        ...prev,
                                        courseId: '',
                                        registeredCourseId: '',
                                      }));
                                    }
                                  }}
                                />
                                <label htmlFor={`custom-course-${course.id}`} className="custom-option-label">
                                  {course.name || course.courseName}
                                </label>
                              </div>
                            ))}
                            {courses.filter(course => 
                              (course.name || course.courseName || '')
                                .toLowerCase()
                                .includes(searchTerms.course.toLowerCase())
                            ).length === 0 && (
                              <div className="custom-no-options">No registered courses found</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {dropdownLoading.courses && <small className="text-muted ml-0.5 text-[10px]">Loading courses...</small>}
                  </div>
                )}

                {isFieldVisible('interestedCourses') && (
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-xs font-semibold text-gray-700 ml-0.5 flex items-center justify-between">
                      <span>Interested Courses</span>
                      {isEditMode && !canEditLeadField(hasPermission, 'interestedCourses') && (
                        <span className="text-[10px] text-gray-400 font-normal">🔒 Read-only</span>
                      )}
                    </label>
                    <div className="custom-dropdown-container" ref={interestedCoursesDropdownRef}>
                      <div 
                        className={`custom-dropdown-header ${isFieldDisabled('interestedCourses') ? 'opacity-60 pointer-events-none bg-gray-50' : ''}`}
                        onClick={() => {
                          if (isFieldDisabled('interestedCourses')) return;
                          setDropdownStates(prev => ({ ...prev, interestedCourses: !prev.interestedCourses }));
                        }}
                      >
                        <span className={formData.interestedCourseIds.length === 0 ? 'text-gray-400' : 'text-gray-800 font-medium'}>
                          {formData.interestedCourseIds.length > 0 
                            ? `${formData.interestedCourseIds.length} course(s) selected`
                            : 'Select Interested Courses'
                          }
                        </span>
                        <span className="custom-dropdown-arrow">▼</span>
                      </div>
                      {dropdownStates.interestedCourses && !isFieldDisabled('interestedCourses') && (
                        <div className="custom-dropdown-content">
                          <div className="custom-dropdown-search">
                            <input
                              type="text"
                              placeholder="Search courses..."
                              value={searchTerms.interestedCourses}
                              onChange={(e) => setSearchTerms(prev => ({ ...prev, interestedCourses: e.target.value }))}
                              className="custom-search-input"
                            />
                          </div>
                          <div className="custom-dropdown-options">
                            {courses
                              .filter(course => 
                                (course.name || course.courseName || '')
                                  .toLowerCase()
                                  .includes(searchTerms.interestedCourses.toLowerCase())
                              )
                              .map((course) => (
                              <div 
                                key={course.id} 
                                className={`custom-dropdown-option ${formData.interestedCourseIds.includes(String(course.id)) ? 'selected' : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  id={`custom-interested-course-${course.id}`}
                                  value={course.id}
                                  checked={formData.interestedCourseIds.includes(String(course.id))}
                                  onChange={(e) => {
                                    const cid = String(course.id);
                                    if (e.target.checked) {
                                      setFormData((prev) => ({
                                        ...prev,
                                        interestedCourseIds: [...prev.interestedCourseIds, cid],
                                      }));
                                    } else {
                                      setFormData((prev) => ({
                                        ...prev,
                                        interestedCourseIds: prev.interestedCourseIds.filter((id) => id !== cid),
                                      }));
                                    }
                                  }}
                                />
                                <label htmlFor={`custom-interested-course-${course.id}`} className="custom-option-label">
                                  {course.name || course.courseName}
                                </label>
                              </div>
                            ))}
                            {courses.filter(course => 
                              (course.name || course.courseName || '')
                                .toLowerCase()
                                .includes(searchTerms.interestedCourses.toLowerCase())
                            ).length === 0 && (
                              <div className="custom-no-options">No courses found</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {dropdownLoading.courses && <small className="text-muted ml-0.5 text-[10px]">Loading courses...</small>}
                  </div>
                )}

                {isFieldVisible('courseType') && (
                  <SelectField
                    label="Category"
                    readOnly={isEditMode && !canEditLeadField(hasPermission, 'courseType')}
                    value={formData.courseTypeId}
                    onChange={handleChange('courseTypeId')}
                    disabled={isFieldDisabled('courseType', dropdownLoading.courseTypes)}
                    loading={dropdownLoading.courseTypes}
                    loadingText="Loading categories..."
                  >
                    <option value="">Select Category</option>
                    {courseTypes.length > 0 ? courseTypes.map((ct) => (
                      <option key={ct.id} value={String(ct.id)}>
                        {ct.name}
                      </option>
                    )) : <option disabled>No categories available</option>}
                  </SelectField>
                )}

                {isFieldVisible('grade') && (
                  <SelectField
                    label="Grade"
                    readOnly={isEditMode && !canEditLeadField(hasPermission, 'grade')}
                    value={formData.gradeId}
                    onChange={handleChange('gradeId')}
                    disabled={isFieldDisabled('grade', dropdownLoading.grades)}
                    loading={dropdownLoading.grades}
                    loadingText="Loading grades..."
                  >
                    <option value="">Select Grade</option>
                    {grades.length > 0 ? grades.map((grade) => (
                      <option key={grade.id} value={String(grade.id)}>
                        {grade.name}
                      </option>
                    )) : <option disabled>No grades available</option>}
                  </SelectField>
                )}

                {isFieldVisible('board') && (
                  <SelectField
                    label="Board"
                    readOnly={isEditMode && !canEditLeadField(hasPermission, 'board')}
                    value={formData.boardId}
                    onChange={handleChange('boardId')}
                    disabled={isFieldDisabled('board', dropdownLoading.boards)}
                    loading={dropdownLoading.boards}
                    loadingText="Loading boards..."
                  >
                    <option value="">Select Board</option>
                    {boards.length > 0 ? boards.map((board) => (
                      <option key={board.id} value={String(board.id)}>
                        {board.name}
                      </option>
                    )) : <option disabled>No boards available</option>}
                  </SelectField>
                )}
              </div>
            </div>

            {/* Section 5: Assignment, Status & Remarks */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-blue-600">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                <span>Assignment & Status</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {isFieldVisible('leadSources') && (
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-xs font-semibold text-gray-700 ml-0.5 flex items-center justify-between">
                      <span>Lead Sources</span>
                      {isEditMode && !canEditLeadField(hasPermission, 'leadSources') && (
                        <span className="text-[10px] text-gray-400 font-normal">🔒 Read-only</span>
                      )}
                    </label>
                    <div className="custom-dropdown-container" ref={leadSourcesDropdownRef}>
                      <div 
                        className={`custom-dropdown-header ${isFieldDisabled('leadSources') ? 'opacity-60 pointer-events-none bg-gray-50' : ''}`}
                        onClick={() => {
                          if (isFieldDisabled('leadSources')) return;
                          setDropdownStates(prev => ({ ...prev, leadSources: !prev.leadSources }));
                        }}
                      >
                        <span className={formData.leadSourceIds.length === 0 ? 'text-gray-400' : 'text-gray-800 font-medium'}>
                          {formData.leadSourceIds.length > 0 
                            ? `${formData.leadSourceIds.length} source(s) selected`
                            : 'Select Lead Sources'
                          }
                        </span>
                        <span className="custom-dropdown-arrow">▼</span>
                      </div>
                      {dropdownStates.leadSources && !isFieldDisabled('leadSources') && (
                        <div className="custom-dropdown-content">
                          <div className="custom-dropdown-search">
                            <input
                              type="text"
                              placeholder="Search lead sources..."
                              value={searchTerms.leadSources}
                              onChange={(e) => setSearchTerms(prev => ({ ...prev, leadSources: e.target.value }))}
                              className="custom-search-input"
                            />
                          </div>
                          <div className="custom-dropdown-options">
                            {leadSources
                              .filter(source => 
                                source.name?.toLowerCase().includes(searchTerms.leadSources.toLowerCase())
                              )
                              .map((source) => (
                              <div 
                                key={source.id} 
                                className={`custom-dropdown-option ${formData.leadSourceIds.includes(String(source.id)) ? 'selected' : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  id={`custom-source-${source.id}`}
                                  value={source.id}
                                  checked={formData.leadSourceIds.includes(String(source.id))}
                                  onChange={(e) => {
                                    const sid = String(source.id);
                                    if (e.target.checked) {
                                      setFormData((prev) => ({
                                        ...prev,
                                        leadSourceIds: [...prev.leadSourceIds, sid],
                                      }));
                                    } else {
                                      setFormData((prev) => ({
                                        ...prev,
                                        leadSourceIds: prev.leadSourceIds.filter((id) => id !== sid),
                                      }));
                                    }
                                  }}
                                />
                                <label htmlFor={`custom-source-${source.id}`} className="custom-option-label">
                                  {source.name}
                                </label>
                              </div>
                            ))}
                            {leadSources.filter(source => 
                              source.name?.toLowerCase().includes(searchTerms.leadSources.toLowerCase())
                            ).length === 0 && (
                              <div className="custom-no-options">No lead sources found</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {isFieldVisible('department') && (
                  <SelectField
                    label="Department"
                    readOnly={isEditMode && !canEditLeadField(hasPermission, 'department')}
                    value={formData.departmentId}
                    onChange={handleChange('departmentId')}
                    disabled={isFieldDisabled('department', dropdownLoading.departments)}
                    loading={dropdownLoading.departments}
                    loadingText="Loading departments..."
                  >
                    <option value="">Select Department</option>
                    {departments.length > 0 ? departments.map((dept) => (
                      <option key={dept.id} value={String(dept.id)}>
                        {dept.name}
                      </option>
                    )) : <option disabled>No departments available</option>}
                  </SelectField>
                )}

                {isFieldVisible('assignedTo') && (
                  <SelectField
                    label="Assigned To"
                    readOnly={isEditMode && !canEditLeadField(hasPermission, 'assignedTo')}
                    value={formData.assignedToUserId}
                    onChange={handleChange('assignedToUserId')}
                    disabled={isFieldDisabled('assignedTo', dropdownLoading.users)}
                    loading={dropdownLoading.users}
                    loadingText="Loading users..."
                  >
                    <option value="">Select User</option>
                    {users
                      .filter((user) => user.username !== 'admin' && user.username !== 'superadmin')
                      .map((user) => (
                      <option key={user.id} value={String(user.id)}>
                        {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username}
                      </option>
                    ))}
                  </SelectField>
                )}

                {isFieldVisible('currentStatus') && (
                  <SelectField
                    label="Status"
                    value={formData.statusId}
                    onChange={handleChange('statusId')}
                    disabled={true}
                    loading={dropdownLoading.leadStatuses}
                    loadingText="Loading statuses..."
                  >
                    <option value="">Select Status</option>
                    {leadStatuses.length > 0 ? leadStatuses.map((status) => (
                      <option key={status.id} value={String(status.id)}>
                        {status.name}
                      </option>
                    )) : <option disabled>No statuses available</option>}
                  </SelectField>
                )}

                {isFieldVisible('nextFollowUpDate') && (
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-xs font-semibold text-gray-700 ml-0.5 flex items-center justify-between">
                      <span>Next Follow-Up Date</span>
                      {isEditMode && !canEditLeadField(hasPermission, 'nextFollowUpDate') && (
                        <span className="text-[10px] text-gray-400 font-normal">🔒 Read-only</span>
                      )}
                    </label>
                    <input
                      type="date"
                      name="nextFollowUpDate"
                      value={formData.nextFollowUpDate}
                      onChange={handleChange('nextFollowUpDate')}
                      disabled={isFieldDisabled('nextFollowUpDate')}
                      className={`w-full px-3.5 py-2 text-sm rounded-[8px] border transition-all outline-none cursor-pointer bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 ${
                        isFieldDisabled('nextFollowUpDate') ? 'opacity-60 pointer-events-none bg-gray-50 border-gray-200' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                  </div>
                )}
              </div>

              {isFieldVisible('remarks') && (
                <div className="flex flex-col gap-1 w-full pt-1">
                  <label className="text-xs font-semibold text-gray-700 ml-0.5 flex items-center justify-between">
                    <span>Remarks</span>
                    {isEditMode && !canEditLeadField(hasPermission, 'remarks') && (
                      <span className="text-[10px] text-gray-400 font-normal">🔒 Read-only</span>
                    )}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter additional remarks or conversation notes..."
                    value={formData.remarks}
                    onChange={handleChange('remarks')}
                    disabled={isFieldDisabled('remarks')}
                    className={`w-full px-3.5 py-2 text-sm rounded-[8px] border transition-all outline-none resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 ${
                      isFieldDisabled('remarks') ? 'opacity-60 pointer-events-none bg-gray-50 border-gray-200' : 'border-gray-300 hover:border-gray-400 bg-white placeholder:text-gray-400'
                    }`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer (Fixed) */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between flex-shrink-0">
            <span className="text-[11px] text-slate-400">
              Press ESC to cancel
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={closeAddLeadModal}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-xs hover:shadow transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>{editLeadData ? 'Updating...' : 'Adding...'}</span>
                  </>
                ) : (
                  <span>{editLeadData ? 'Update Lead' : 'Add Lead'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddLeadModal;
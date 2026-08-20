import { useState, useEffect, useRef } from 'react';
import CustomInput from '../CustomInput';
import CustomButton from '../CustomButton';
import { useAppContext } from '../../../AppContext';
import { createLead, updateLead } from '../../../Services/lead/leadService';
import { getAllLeadSource } from '../../../Services/leadsource/leadSourceService';
import { getCountries, getStates, getCities } from '../../../Services/location/locationService';
import { getAllCourses } from '../../../Services/course/course';
import gradsService from '../../../Services/Grads/gradsService';
import { getAllBoards } from '../../../Services/Boards/boardsService';
import { getAllLeadStatus } from '../../../Services/leadStatus/leadStatusService';
import { getAllUser } from '../../../Services/user/user';

const AddLeadModal = () => {
  const { isAddLeadModalOpen, closeAddLeadModal, showToast, editLeadData } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    alternatePhoneNumber: '',
    email: '',
    city: '',
    state: '',
    country: '',
    leadSourceIds: [],
    sourceDetails: '',
    interestedCourseIds: [],
    courseId: '',
    registeredCourseId: '',
    boardId: '',
    gradeId: '',
    remarks: '',
    assignedToUserId: '',
    statusId: '',
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
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [boards, setBoards] = useState([]);
  const [leadStatuses, setLeadStatuses] = useState([]);
  const [users, setUsers] = useState([]);
  const [locationLoading, setLocationLoading] = useState({
    countries: false,
    states: false,
    cities: false,
  });
  const [dropdownLoading, setDropdownLoading] = useState({
    courses: false,
    grades: false,
    boards: false,
    leadStatuses: false,
    users: false,
  });

  useEffect(() => {
    const fetchLeadSources = async () => {
      try {
        const res = await getAllLeadSource({ size: 100 });
        if (res?.data?.success) {
          setLeadSources(res.data.data?.content || []);
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

    const fetchCourses = async () => {
      setDropdownLoading((prev) => ({ ...prev, courses: true }));
      try {
        const res = await getAllCourses({ size: 100 });
        console.log('Courses API response:', res);
        if (res?.success && res?.data?.content) {
          setCourses(res.data.content || []);
        } else if (res?.data?.success && res?.data?.data?.content) {
          setCourses(res.data.data.content || []);
        } else if (Array.isArray(res?.data)) {
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
        const res = await gradsService.getAllGrades({ size: 100 });
        console.log('Grades API response:', res);
        if (res?.success && res?.data?.content) {
          setGrades(res.data.content || []);
        } else if (res?.data?.success && res?.data?.data?.content) {
          setGrades(res.data.data.content || []);
        } else if (Array.isArray(res?.data)) {
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
        const res = await getAllBoards({ size: 100 });
        console.log('Boards API response:', res);
        if (res?.success && res?.data?.content) {
          setBoards(res.data.content || []);
        } else if (res?.data?.success && res?.data?.data?.content) {
          setBoards(res.data.data.content || []);
        } else if (Array.isArray(res?.data)) {
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
        const res = await getAllLeadStatus({ size: 100 });
        console.log('Lead Statuses API response:', res);
        if (res?.success) {
          setLeadStatuses(res.data?.content || []);
        } else if (res?.data) {
          setLeadStatuses(res.data || []);
        } else if (Array.isArray(res)) {
          setLeadStatuses(res || []);
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
        const res = await getAllUser({ size: 100 });
        if (res?.data?.success) {
          setUsers(res.data.data?.content || []);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setDropdownLoading((prev) => ({ ...prev, users: false }));
      }
    };
    
    if (isAddLeadModalOpen) {
      fetchLeadSources();
      fetchCountries();
      fetchCourses();
      fetchGrades();
      fetchBoards();
      fetchLeadStatuses();
      fetchUsers();
      if (!editLeadData) {
        setStates([]);
        setCities([]);
      }
    }
  }, [isAddLeadModalOpen, editLeadData]);

  useEffect(() => {
    if (editLeadData) {
      const { 
        fullName, phoneNumber, alternatePhoneNumber, email, city, state, country, 
        leadSourceIds, sourceDetails, interestedCourseIds,
        courseId, registeredCourseId, boardId, gradeId, remarks, 
        assignedToUserId, statusId, active, nextFollowUpDate 
      } = editLeadData;
      setFormData({
        fullName: fullName || '',
        phoneNumber: phoneNumber || '',
        alternatePhoneNumber: alternatePhoneNumber || '',
        email: email || '',
        city: city || '',
        state: state || '',
        country: country || '',
        leadSourceIds: leadSourceIds || [],
        sourceDetails: sourceDetails || '',
        interestedCourseIds: interestedCourseIds || [],
        courseId: courseId || '',
        registeredCourseId: registeredCourseId || '',
        boardId: boardId || '',
        gradeId: gradeId || '',
        remarks: remarks || '',
        assignedToUserId: assignedToUserId || '',
        statusId: statusId || '',
        active: active !== undefined ? active : true,
        nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate).toISOString().slice(0, 16) : '',
      });

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
      };

      fetchEditLocationData();
    } else {
      setFormData({
        fullName: '',
        phoneNumber: '',
        alternatePhoneNumber: '',
        email: '',
        city: '',
        state: '',
        country: '',
        leadSourceIds: [],
        sourceDetails: '',
        interestedCourseIds: [],
        courseId: '',
        registeredCourseId: '',
        boardId: '',
        gradeId: '',
        remarks: '',
        assignedToUserId: '',
        statusId: '',
        active: true,
        nextFollowUpDate: '',
      });
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

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    
    if (field === 'country') {
      setFormData((prev) => ({ ...prev, country: value, state: '', city: '' }));
    } else if (field === 'state') {
      setFormData((prev) => ({ ...prev, state: value, city: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phoneNumber: '',
      alternatePhoneNumber: '',
      email: '',
      city: '',
      state: '',
      country: '',
      leadSourceIds: [],
      sourceDetails: '',
      interestedCourseIds: [],
      courseId: '',
      registeredCourseId: '',
      boardId: '',
      gradeId: '',
      remarks: '',
      assignedToUserId: '',
      statusId: '',
      active: true,
      nextFollowUpDate: '',
    });
    setStates([]);
    setCities([]);
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
      leadSourceIds: formData.leadSourceIds,
      sourceDetails: formData.sourceDetails,
      interestedCourseIds: formData.interestedCourseIds,
      courseId: formData.courseId,
      registeredCourseId: formData.registeredCourseId,
      boardId: formData.boardId,
      gradeId: formData.gradeId,
      remarks: formData.remarks,
      assignedToUserId: formData.assignedToUserId,
      statusId: formData.statusId,
      active: formData.active,
      nextFollowUpDate: formData.nextFollowUpDate
        ? new Date(formData.nextFollowUpDate).toISOString()
        : new Date().toISOString(),
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
      } else {
        const msg =
          response?.response?.data?.message ||
          response?.message ||
          'Failed to submit lead. Please try again.';
        showToast(msg, 'error');
      }
    } catch (err) {
      showToast('Something went wrong!', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAddLeadModalOpen) return null;

  const dropdownStyles = `
    .custom-dropdown-container {
      position: relative;
      width: 100%;
    }
    
    .custom-dropdown-header {
      padding: 8px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 38px;
    }
    
    .custom-dropdown-header:hover {
      border-color: #999;
    }
    
    .custom-dropdown-arrow {
      font-size: 12px;
      color: #666;
    }
    
    .custom-dropdown-content {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 1000;
      margin-top: 4px;
      max-height: 300px;
      overflow: hidden;
    }
    
    .custom-dropdown-search {
      padding: 8px;
      border-bottom: 1px solid #eee;
    }
    
    .custom-search-input {
      width: 100%;
      padding: 6px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }
    
    .custom-search-input:focus {
      outline: none;
      border-color: #4a90e2;
    }
    
    .custom-dropdown-options {
      max-height: 250px;
      overflow-y: auto;
    }
    
    .custom-dropdown-option {
      padding: 10px 12px;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: background 0.2s;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .custom-dropdown-option:last-child {
      border-bottom: none;
    }
    
    .custom-dropdown-option:hover {
      background: #e8f4fd;
    }
    
    .custom-dropdown-option.selected {
      background: #d0e8f7;
    }
    
    .custom-dropdown-option input[type="checkbox"] {
      margin-right: 8px;
      cursor: pointer;
      width: 16px;
      height: 16px;
      accent-color: #4a90e2;
    }
    
    .custom-option-label {
      cursor: pointer;
      flex: 1;
      font-size: 14px;
    }
    
    .custom-no-options {
      padding: 12px;
      text-align: center;
      color: #999;
      font-size: 14px;
    }
  `;

  return (
    <>
      <style>{dropdownStyles}</style>
      <div className="modal-overlay open">
        <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{editLeadData ? 'Edit Lead' : 'Add New Lead'}</div>
          <CustomButton variant="ghost" className="btn-icon" onClick={closeAddLeadModal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </CustomButton>
        </div>

        <div className="modal-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CustomInput
              label="Full Name *"
              placeholder="Priya Kumar"
              value={formData.fullName}
              onChange={handleChange('fullName')}
            />
            <CustomInput
              label="Phone Number *"
              placeholder="+91 98765 43210"
              value={formData.phoneNumber}
              onChange={handleChange('phoneNumber')}
            />
            <CustomInput
              label="Alternate Phone"
              placeholder="+91 91234 56789"
              value={formData.alternatePhoneNumber}
              onChange={handleChange('alternatePhoneNumber')}
            />
            <CustomInput
              label="Email"
              placeholder="priya@gmail.com"
              value={formData.email}
              onChange={handleChange('email')}
            />
            <div>
              <label className="form-label">Country</label>
              <select
                className="form-control"
                value={formData.country}
                onChange={handleChange('country')}
                disabled={locationLoading.countries}
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.iso2} value={country.country}>
                    {country.country}
                  </option>
                ))}
              </select>
              {locationLoading.countries && <small className="text-muted">Loading countries...</small>}
            </div>
            <div>
              <label className="form-label">State</label>
              <select
                className="form-control"
                value={formData.state}
                onChange={handleChange('state')}
                disabled={!formData.country || locationLoading.states}
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
              </select>
              {locationLoading.states && <small className="text-muted">Loading states...</small>}
            </div>
            <div>
              <label className="form-label">City</label>
              <select
                className="form-control"
                value={formData.city}
                onChange={handleChange('city')}
                disabled={!formData.state || locationLoading.cities}
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
              </select>
              {locationLoading.cities && <small className="text-muted">Loading cities...</small>}
            </div>
            <div>
              <label className="form-label">Lead Sources</label>
              <div className="custom-dropdown-container" ref={leadSourcesDropdownRef}>
                <div 
                  className="custom-dropdown-header"
                  onClick={() => setDropdownStates(prev => ({ ...prev, leadSources: !prev.leadSources }))}
                >
                  {formData.leadSourceIds.length > 0 
                    ? `${formData.leadSourceIds.length} source(s) selected`
                    : 'Select Lead Sources'
                  }
                  <span className="custom-dropdown-arrow">▼</span>
                </div>
                {dropdownStates.leadSources && (
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
                          className={`custom-dropdown-option ${formData.leadSourceIds.includes(source.id) ? 'selected' : ''}`}
                        >
                          <input
                            type="checkbox"
                            id={`custom-source-${source.id}`}
                            value={source.id}
                            checked={formData.leadSourceIds.includes(source.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  leadSourceIds: [...prev.leadSourceIds, source.id],
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  leadSourceIds: prev.leadSourceIds.filter((id) => id !== source.id),
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
            <CustomInput
              label="Source Details"
              placeholder="Additional source details..."
              value={formData.sourceDetails}
              onChange={handleChange('sourceDetails')}
            />
            <div>
              <label className="form-label">Interested Courses</label>
              <div className="custom-dropdown-container" ref={interestedCoursesDropdownRef}>
                <div 
                  className="custom-dropdown-header"
                  onClick={() => setDropdownStates(prev => ({ ...prev, interestedCourses: !prev.interestedCourses }))}
                >
                  {formData.interestedCourseIds.length > 0 
                    ? `${formData.interestedCourseIds.length} course(s) selected`
                    : 'Select Interested Courses'
                  }
                  <span className="custom-dropdown-arrow">▼</span>
                </div>
                {dropdownStates.interestedCourses && (
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
                          course.courseName?.toLowerCase().includes(searchTerms.interestedCourses.toLowerCase())
                        )
                        .map((course) => (
                        <div 
                          key={course.id} 
                          className={`custom-dropdown-option ${formData.interestedCourseIds.includes(course.id) ? 'selected' : ''}`}
                        >
                          <input
                            type="checkbox"
                            id={`custom-interested-course-${course.id}`}
                            value={course.id}
                            checked={formData.interestedCourseIds.includes(course.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  interestedCourseIds: [...prev.interestedCourseIds, course.id],
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  interestedCourseIds: prev.interestedCourseIds.filter((id) => id !== course.id),
                                }));
                              }
                            }}
                          />
                          <label htmlFor={`custom-interested-course-${course.id}`} className="custom-option-label">
                            {course.courseName}
                          </label>
                        </div>
                      ))}
                      {courses.filter(course => 
                        course.courseName?.toLowerCase().includes(searchTerms.interestedCourses.toLowerCase())
                      ).length === 0 && (
                        <div className="custom-no-options">No courses found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {dropdownLoading.courses && <small className="text-muted">Loading courses...</small>}
            </div>
            <div>
              <label className="form-label">Course</label>
              <div className="custom-dropdown-container" ref={courseDropdownRef}>
                <div 
                  className="custom-dropdown-header"
                  onClick={() => setDropdownStates(prev => ({ ...prev, course: !prev.course }))}
                >
                  {formData.courseId 
                    ? courses.find(c => c.id === formData.courseId)?.courseName || 'Select Course'
                    : 'Select Course'
                  }
                  <span className="custom-dropdown-arrow">▼</span>
                </div>
                {dropdownStates.course && (
                  <div className="custom-dropdown-content">
                    <div className="custom-dropdown-search">
                      <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerms.course}
                        onChange={(e) => setSearchTerms(prev => ({ ...prev, course: e.target.value }))}
                        className="custom-search-input"
                      />
                    </div>
                    <div className="custom-dropdown-options">
                      {courses
                        .filter(course => 
                          course.courseName?.toLowerCase().includes(searchTerms.course.toLowerCase())
                        )
                        .map((course) => (
                        <div 
                          key={course.id} 
                          className={`custom-dropdown-option ${formData.courseId === course.id ? 'selected' : ''}`}
                        >
                          <input
                            type="checkbox"
                            id={`custom-course-${course.id}`}
                            value={course.id}
                            checked={formData.courseId === course.id}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  courseId: course.id,
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  courseId: '',
                                }));
                              }
                            }}
                          />
                          <label htmlFor={`custom-course-${course.id}`} className="custom-option-label">
                            {course.courseName}
                          </label>
                        </div>
                      ))}
                      {courses.filter(course => 
                        course.courseName?.toLowerCase().includes(searchTerms.course.toLowerCase())
                      ).length === 0 && (
                        <div className="custom-no-options">No courses found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {dropdownLoading.courses && <small className="text-muted">Loading courses...</small>}
            </div>
            <div>
              <label className="form-label">Grade</label>
              <select
                className="form-control"
                value={formData.gradeId}
                onChange={handleChange('gradeId')}
                disabled={dropdownLoading.grades}
              >
                <option value="">Select Grade</option>
                {grades.length > 0 ? grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name}
                  </option>
                )) : <option disabled>No grades available</option>}
              </select>
              {dropdownLoading.grades && <small className="text-muted">Loading grades...</small>}
            </div>
            <div>
              <label className="form-label">Board</label>
              <select
                className="form-control"
                value={formData.boardId}
                onChange={handleChange('boardId')}
                disabled={dropdownLoading.boards}
              >
                <option value="">Select Board</option>
                {boards.length > 0 ? boards.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.name}
                  </option>
                )) : <option disabled>No boards available</option>}
              </select>
              {dropdownLoading.boards && <small className="text-muted">Loading boards...</small>}
            </div>
            <div>
              <label className="form-label">Assigned To</label>
              <select
                className="form-control"
                value={formData.assignedToUserId}
                onChange={handleChange('assignedToUserId')}
                disabled={dropdownLoading.users}
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName || user.username}
                  </option>
                ))}
              </select>
              {dropdownLoading.users && <small className="text-muted">Loading users...</small>}
            </div>
            <div>
              <label className="form-label">Status</label>
              <select
                className="form-control"
                value={formData.statusId}
                onChange={handleChange('statusId')}
                disabled={dropdownLoading.leadStatuses}
              >
                <option value="">Select Status</option>
                {leadStatuses.length > 0 ? leadStatuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                )) : <option disabled>No statuses available</option>}
              </select>
              {dropdownLoading.leadStatuses && <small className="text-muted">Loading statuses...</small>}
            </div>
            <div>
              <label className="form-label">Next Follow-Up Date</label>
              <input
                type="datetime-local"
                className="form-control"
                value={formData.nextFollowUpDate}
                onChange={handleChange('nextFollowUpDate')}
              />
            </div>
          </div>

          <div className="form-group mt-3">
            <label className="form-label">Remarks</label>
            <textarea
              className="form-control"
              rows="2"
              placeholder="Initial remarks…"
              value={formData.remarks}
              onChange={handleChange('remarks')}
            />
          </div>
        </div>

        <div className="modal-footer">
          <CustomButton variant="secondary" onClick={closeAddLeadModal} disabled={loading}>
            Cancel
          </CustomButton>
          <CustomButton variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? (editLeadData ? 'Updating...' : 'Adding...') : (editLeadData ? 'Update Lead' : 'Add Lead')}
          </CustomButton>
        </div>
      </div>
    </div>
    </>
  );
};

export default AddLeadModal;
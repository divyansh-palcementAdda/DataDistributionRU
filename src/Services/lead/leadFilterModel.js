// src/Services/lead/leadFilterModel.js

/**
 * Canonical default filter model for Leads.
 * Every filter property is explicitly declared here.
 */
export const DEFAULT_LEAD_FILTERS = {
  search: '',
  leadSourceIds: [],
  courseIds: [],
  interestedCourseIds: [],
  registeredCourseId: null,
  courseTypeIds: [],
  departmentIds: [],
  assignedUserIds: [],
  boardIds: [],
  gradeIds: [],
  statusIds: [],
  leadStatusHistoryIds: [],
  allotted: null, // true | false | null
  multiSource: null, // true | false | null
  availed: null, // true | false | null
  availedByUserId: null,
  availedByUserIds: [],
  availedFrom: '',
  availedTo: '',
  startDate: '',
  endDate: '',
  updatedFrom: '',
  updatedTo: '',
};

/**
 * Convert the canonical filter model into clean query parameters for API calls
 * (used by Leads table, all card counts, and export).
 */
export const buildLeadQueryParams = (filters = {}) => {
  const params = {};

  if (filters.search && filters.search.trim()) {
    params.search = filters.search.trim();
  }

  // Lead Sources
  if (Array.isArray(filters.leadSourceIds) && filters.leadSourceIds.length > 0) {
    params.leadSourceIds = filters.leadSourceIds;
    if (filters.leadSourceIds.length === 1) {
      params.leadSourceId = filters.leadSourceIds[0];
      params.sourceId = filters.leadSourceIds[0];
    }
  }

  // Course Types / Category
  if (Array.isArray(filters.courseTypeIds) && filters.courseTypeIds.length > 0) {
    params.courseTypeIds = filters.courseTypeIds;
    if (filters.courseTypeIds.length === 1) {
      params.courseTypeId = filters.courseTypeIds[0];
    }
  }

  // Courses (Interested / General)
  if (Array.isArray(filters.courseIds) && filters.courseIds.length > 0) {
    params.courseIds = filters.courseIds;
    if (filters.courseIds.length === 1) {
      params.courseId = filters.courseIds[0];
    }
  }

  if (Array.isArray(filters.interestedCourseIds) && filters.interestedCourseIds.length > 0) {
    params.interestedCourseIds = filters.interestedCourseIds;
  }

  if (filters.registeredCourseId) {
    params.registeredCourseId = filters.registeredCourseId;
  }

  // Departments
  if (Array.isArray(filters.departmentIds) && filters.departmentIds.length > 0) {
    params.departmentIds = filters.departmentIds;
    if (filters.departmentIds.length === 1) {
      params.departmentId = filters.departmentIds[0];
    }
  }

  // Assigned Users / Counselors
  if (Array.isArray(filters.assignedUserIds) && filters.assignedUserIds.length > 0) {
    params.assignedUserIds = filters.assignedUserIds;
    if (filters.assignedUserIds.length === 1) {
      params.assignedUserId = filters.assignedUserIds[0];
    }
  }

  // Boards
  if (Array.isArray(filters.boardIds) && filters.boardIds.length > 0) {
    params.boardIds = filters.boardIds;
    if (filters.boardIds.length === 1) {
      params.boardId = filters.boardIds[0];
    }
  }

  // Grades
  if (Array.isArray(filters.gradeIds) && filters.gradeIds.length > 0) {
    params.gradeIds = filters.gradeIds;
    if (filters.gradeIds.length === 1) {
      params.gradeId = filters.gradeIds[0];
    }
  }

  // Current Status
  if (Array.isArray(filters.statusIds) && filters.statusIds.length > 0) {
    params.statusIds = filters.statusIds;
    if (filters.statusIds.length === 1) {
      params.statusId = filters.statusIds[0];
    }
  }

  // Historical Status (crucial distinction from current status)
  if (Array.isArray(filters.leadStatusHistoryIds) && filters.leadStatusHistoryIds.length > 0) {
    params.leadStatusHistoryIds = filters.leadStatusHistoryIds;
    if (filters.leadStatusHistoryIds.length === 1) {
      params.leadStatusHistoryId = filters.leadStatusHistoryIds[0];
    }
  }

  // Allocation
  if (filters.allotted === true) {
    params.allotted = true;
  } else if (filters.allotted === false) {
    params.allotted = false;
    params.unallotted = true;
  }

  // Multi Source
  if (filters.multiSource === true) {
    params.multiSource = true;
  } else if (filters.multiSource === false) {
    params.multiSource = false;
  }

  // Availed
  if (filters.availed === true) {
    params.availed = true;
    params.isAvailed = true;
  } else if (filters.availed === false) {
    params.availed = false;
    params.isAvailed = false;
  }

  if (filters.availedByUserId) {
    params.availedByUserId = filters.availedByUserId;
  }

  if (Array.isArray(filters.availedByUserIds) && filters.availedByUserIds.length > 0) {
    params.availedByUserIds = filters.availedByUserIds;
  }

  // Dates
  if (filters.availedFrom) params.availedFrom = filters.availedFrom;
  if (filters.availedTo) params.availedTo = filters.availedTo;
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  if (filters.updatedFrom) params.updatedFrom = filters.updatedFrom;
  if (filters.updatedTo) params.updatedTo = filters.updatedTo;

  return params;
};

/**
 * Helper to parse comma-separated or repeated URL param into an array of IDs
 */
const parseArrayParam = (searchParams, ...keys) => {
  const set = new Set();
  for (const key of keys) {
    const all = searchParams.getAll(key);
    for (const val of all) {
      if (!val) continue;
      val.split(',').forEach(item => {
        const trimmed = item.trim();
        if (trimmed) set.add(trimmed);
      });
    }
  }
  return Array.from(set);
};

/**
 * Parse filters from URL query parameters (or navigation state fallback).
 */
export const parseFiltersFromSearchParams = (searchParams, state = null) => {
  const filters = { ...DEFAULT_LEAD_FILTERS };

  if (searchParams && typeof searchParams.get === 'function') {
    // Search
    const q = searchParams.get('search');
    if (q) filters.search = q;

    // Lead Sources
    const sources = parseArrayParam(searchParams, 'leadSourceIds', 'leadSourceId', 'sourceId', 'sourceIds');
    if (sources.length > 0) filters.leadSourceIds = sources;

    // Course Types
    const courseTypes = parseArrayParam(searchParams, 'courseTypeIds', 'courseTypeId');
    if (courseTypes.length > 0) filters.courseTypeIds = courseTypes;

    // Courses
    const courses = parseArrayParam(searchParams, 'courseIds', 'courseId');
    if (courses.length > 0) filters.courseIds = courses;

    const interested = parseArrayParam(searchParams, 'interestedCourseIds');
    if (interested.length > 0) filters.interestedCourseIds = interested;

    const regCourse = searchParams.get('registeredCourseId');
    if (regCourse) filters.registeredCourseId = regCourse;

    // Departments
    const depts = parseArrayParam(searchParams, 'departmentIds', 'departmentId');
    if (depts.length > 0) filters.departmentIds = depts;

    // Users
    const users = parseArrayParam(searchParams, 'assignedUserIds', 'assignedUserId', 'userId');
    if (users.length > 0) filters.assignedUserIds = users;

    // Boards & Grades
    const boards = parseArrayParam(searchParams, 'boardIds', 'boardId');
    if (boards.length > 0) filters.boardIds = boards;

    const grades = parseArrayParam(searchParams, 'gradeIds', 'gradeId');
    if (grades.length > 0) filters.gradeIds = grades;

    // Current Status
    const statuses = parseArrayParam(searchParams, 'statusIds', 'statusId', 'leadStatusId');
    if (statuses.length > 0) filters.statusIds = statuses;

    // Historical Status
    const histStatuses = parseArrayParam(searchParams, 'leadStatusHistoryIds', 'leadStatusHistoryId');
    if (histStatuses.length > 0) filters.leadStatusHistoryIds = histStatuses;

    // Allotted / Unallotted
    const allotted = searchParams.get('allotted');
    const unallotted = searchParams.get('unallotted');
    if (unallotted === 'true' || allotted === 'false') {
      filters.allotted = false;
    } else if (allotted === 'true') {
      filters.allotted = true;
    }

    // Multi Source
    const multi = searchParams.get('multiSource');
    if (multi === 'true') {
      filters.multiSource = true;
    } else if (multi === 'false') {
      filters.multiSource = false;
    }

    // Availed
    const availed = searchParams.get('availed') || searchParams.get('isAvailed');
    if (availed === 'true') {
      filters.availed = true;
    } else if (availed === 'false') {
      filters.availed = false;
    }

    const availedBy = searchParams.get('availedByUserId');
    if (availedBy) filters.availedByUserId = availedBy;

    // Dates
    const af = searchParams.get('availedFrom');
    if (af) filters.availedFrom = af;
    const at = searchParams.get('availedTo');
    if (at) filters.availedTo = at;

    const sd = searchParams.get('startDate') || searchParams.get('fromDate');
    if (sd) filters.startDate = sd;
    const ed = searchParams.get('endDate') || searchParams.get('toDate');
    if (ed) filters.endDate = ed;

    const uf = searchParams.get('updatedFrom');
    if (uf) filters.updatedFrom = uf;
    const ut = searchParams.get('updatedTo');
    if (ut) filters.updatedTo = ut;
  }

  // Handle location.state fallback
  if (state?.activeFilters && Array.isArray(state.activeFilters) && state.activeFilters.length > 0) {
    state.activeFilters.forEach(f => {
      if (f.type === 'courseType' && f.value) {
        if (!filters.courseTypeIds.includes(f.value)) filters.courseTypeIds.push(f.value);
      } else if (f.type === 'leadSource' && f.value) {
        if (!filters.leadSourceIds.includes(f.value)) filters.leadSourceIds.push(f.value);
      } else if (f.type === 'board' && f.value) {
        if (!filters.boardIds.includes(f.value)) filters.boardIds.push(f.value);
      } else if (f.type === 'grade' && f.value) {
        if (!filters.gradeIds.includes(f.value)) filters.gradeIds.push(f.value);
      } else if (f.type === 'course' && f.value) {
        if (!filters.courseIds.includes(f.value)) filters.courseIds.push(f.value);
      } else if (f.type === 'unallotted') {
        filters.allotted = false;
      } else if (f.type === 'allotted') {
        filters.allotted = true;
      } else if (f.type === 'availed') {
        filters.availed = true;
      } else if (f.type === 'multiSource') {
        filters.multiSource = true;
      } else if ((f.type === 'assignedUser' || f.type === 'user') && f.value) {
        if (!filters.assignedUserIds.includes(f.value)) filters.assignedUserIds.push(f.value);
      } else if (f.type === 'leadStatus' && f.value) {
        if (!filters.statusIds.includes(f.value)) filters.statusIds.push(f.value);
      } else if (f.type === 'leadStatusHistory' && f.value) {
        if (!filters.leadStatusHistoryIds.includes(f.value)) filters.leadStatusHistoryIds.push(f.value);
      }
    });
  }

  return filters;
};

/**
 * Write active filter values into URLSearchParams.
 */
export const syncFiltersToSearchParams = (filters) => {
  const params = new URLSearchParams();

  if (filters.search && filters.search.trim()) {
    params.set('search', filters.search.trim());
  }

  if (Array.isArray(filters.leadSourceIds) && filters.leadSourceIds.length > 0) {
    if (filters.leadSourceIds.length === 1) {
      params.set('leadSourceId', filters.leadSourceIds[0]);
    } else {
      filters.leadSourceIds.forEach(id => params.append('leadSourceIds', id));
    }
  }

  if (Array.isArray(filters.courseTypeIds) && filters.courseTypeIds.length > 0) {
    if (filters.courseTypeIds.length === 1) {
      params.set('courseTypeId', filters.courseTypeIds[0]);
    } else {
      filters.courseTypeIds.forEach(id => params.append('courseTypeIds', id));
    }
  }

  if (Array.isArray(filters.courseIds) && filters.courseIds.length > 0) {
    if (filters.courseIds.length === 1) {
      params.set('courseId', filters.courseIds[0]);
    } else {
      filters.courseIds.forEach(id => params.append('courseIds', id));
    }
  }

  if (Array.isArray(filters.interestedCourseIds) && filters.interestedCourseIds.length > 0) {
    filters.interestedCourseIds.forEach(id => params.append('interestedCourseIds', id));
  }

  if (filters.registeredCourseId) {
    params.set('registeredCourseId', filters.registeredCourseId);
  }

  if (Array.isArray(filters.departmentIds) && filters.departmentIds.length > 0) {
    if (filters.departmentIds.length === 1) {
      params.set('departmentId', filters.departmentIds[0]);
    } else {
      filters.departmentIds.forEach(id => params.append('departmentIds', id));
    }
  }

  if (Array.isArray(filters.assignedUserIds) && filters.assignedUserIds.length > 0) {
    if (filters.assignedUserIds.length === 1) {
      params.set('assignedUserId', filters.assignedUserIds[0]);
    } else {
      filters.assignedUserIds.forEach(id => params.append('assignedUserIds', id));
    }
  }

  if (Array.isArray(filters.boardIds) && filters.boardIds.length > 0) {
    if (filters.boardIds.length === 1) {
      params.set('boardId', filters.boardIds[0]);
    } else {
      filters.boardIds.forEach(id => params.append('boardIds', id));
    }
  }

  if (Array.isArray(filters.gradeIds) && filters.gradeIds.length > 0) {
    if (filters.gradeIds.length === 1) {
      params.set('gradeId', filters.gradeIds[0]);
    } else {
      filters.gradeIds.forEach(id => params.append('gradeIds', id));
    }
  }

  if (Array.isArray(filters.statusIds) && filters.statusIds.length > 0) {
    if (filters.statusIds.length === 1) {
      params.set('statusId', filters.statusIds[0]);
    } else {
      filters.statusIds.forEach(id => params.append('statusIds', id));
    }
  }

  if (Array.isArray(filters.leadStatusHistoryIds) && filters.leadStatusHistoryIds.length > 0) {
    if (filters.leadStatusHistoryIds.length === 1) {
      params.set('leadStatusHistoryId', filters.leadStatusHistoryIds[0]);
    } else {
      filters.leadStatusHistoryIds.forEach(id => params.append('leadStatusHistoryIds', id));
    }
  }

  if (filters.allotted === true) {
    params.set('allotted', 'true');
  } else if (filters.allotted === false) {
    params.set('allotted', 'false');
  }

  if (filters.multiSource === true) {
    params.set('multiSource', 'true');
  } else if (filters.multiSource === false) {
    params.set('multiSource', 'false');
  }

  if (filters.availed === true) {
    params.set('availed', 'true');
  } else if (filters.availed === false) {
    params.set('availed', 'false');
  }

  if (filters.availedByUserId) params.set('availedByUserId', filters.availedByUserId);
  if (filters.availedFrom) params.set('availedFrom', filters.availedFrom);
  if (filters.availedTo) params.set('availedTo', filters.availedTo);
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);
  if (filters.updatedFrom) params.set('updatedFrom', filters.updatedFrom);
  if (filters.updatedTo) params.set('updatedTo', filters.updatedTo);

  return params;
};

/**
 * Count active applied criteria (for badge counters).
 */
export const countActiveFilters = (filters) => {
  if (!filters) return 0;
  let count = 0;
  if (filters.search && filters.search.trim()) count++;
  if (filters.leadSourceIds?.length) count += filters.leadSourceIds.length;
  if (filters.courseTypeIds?.length) count += filters.courseTypeIds.length;
  if (filters.courseIds?.length) count += filters.courseIds.length;
  if (filters.interestedCourseIds?.length) count += filters.interestedCourseIds.length;
  if (filters.registeredCourseId) count++;
  if (filters.departmentIds?.length) count += filters.departmentIds.length;
  if (filters.assignedUserIds?.length) count += filters.assignedUserIds.length;
  if (filters.boardIds?.length) count += filters.boardIds.length;
  if (filters.gradeIds?.length) count += filters.gradeIds.length;
  if (filters.statusIds?.length) count += filters.statusIds.length;
  if (filters.leadStatusHistoryIds?.length) count += filters.leadStatusHistoryIds.length;
  if (filters.allotted !== null && filters.allotted !== undefined) count++;
  if (filters.multiSource !== null && filters.multiSource !== undefined) count++;
  if (filters.availed !== null && filters.availed !== undefined) count++;
  if (filters.availedByUserId) count++;
  if (filters.startDate || filters.endDate) count++;
  if (filters.updatedFrom || filters.updatedTo) count++;
  if (filters.availedFrom || filters.availedTo) count++;
  return count;
};

/**
 * Build descriptive badges/chips for display above the leads table.
 */
export const buildFilterChips = (filters, lookups = {}) => {
  const chips = [];
  if (!filters) return chips;

  const {
    sources = [],
    courseTypes = [],
    courses = [],
    departments = [],
    users = [],
    boards = [],
    grades = [],
    statuses = [],
  } = lookups;

  const findName = (list, id, nameKey = 'name') => {
    const item = list.find(x => String(x.id) === String(id));
    return item ? (item[nameKey] || item.code || id) : id;
  };

  if (filters.search && filters.search.trim()) {
    chips.push({
      key: 'search',
      value: filters.search.trim(),
      label: `Search: "${filters.search.trim()}"`,
    });
  }

  // Course Types / Categories
  (filters.courseTypeIds || []).forEach(id => {
    chips.push({
      key: 'courseTypeIds',
      value: id,
      label: `Category: ${findName(courseTypes, id)}`,
    });
  });

  // Sources
  (filters.leadSourceIds || []).forEach(id => {
    chips.push({
      key: 'leadSourceIds',
      value: id,
      label: `Source: ${findName(sources, id)}`,
    });
  });

  // Courses
  (filters.courseIds || []).forEach(id => {
    chips.push({
      key: 'courseIds',
      value: id,
      label: `Course: ${findName(courses, id, 'courseName')}`,
    });
  });

  // Interested Courses
  (filters.interestedCourseIds || []).forEach(id => {
    chips.push({
      key: 'interestedCourseIds',
      value: id,
      label: `Interested Course: ${findName(courses, id, 'courseName')}`,
    });
  });

  // Registered Course
  if (filters.registeredCourseId) {
    chips.push({
      key: 'registeredCourseId',
      value: filters.registeredCourseId,
      label: `Registered Course: ${findName(courses, filters.registeredCourseId, 'courseName')}`,
    });
  }

  // Departments
  (filters.departmentIds || []).forEach(id => {
    chips.push({
      key: 'departmentIds',
      value: id,
      label: `Department: ${findName(departments, id)}`,
    });
  });

  // Counselors / Users
  (filters.assignedUserIds || []).forEach(id => {
    const u = users.find(x => String(x.id) === String(id));
    const userName = u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || id : id;
    chips.push({
      key: 'assignedUserIds',
      value: id,
      label: `Counselor: ${userName}`,
    });
  });

  // Boards
  (filters.boardIds || []).forEach(id => {
    chips.push({
      key: 'boardIds',
      value: id,
      label: `Board: ${findName(boards, id)}`,
    });
  });

  // Grades
  (filters.gradeIds || []).forEach(id => {
    chips.push({
      key: 'gradeIds',
      value: id,
      label: `Grade: ${findName(grades, id)}`,
    });
  });

  // CURRENT Status
  (filters.statusIds || []).forEach(id => {
    chips.push({
      key: 'statusIds',
      value: id,
      label: `Current Status: ${findName(statuses, id)}`,
    });
  });

  // HISTORICAL Status — explicitly labeled "Historical Status"
  (filters.leadStatusHistoryIds || []).forEach(id => {
    chips.push({
      key: 'leadStatusHistoryIds',
      value: id,
      label: `Historical Status: ${findName(statuses, id)}`,
    });
  });

  // Allocation
  if (filters.allotted === true) {
    chips.push({
      key: 'allotted',
      value: true,
      label: 'Allocation: Allotted',
    });
  } else if (filters.allotted === false) {
    chips.push({
      key: 'allotted',
      value: false,
      label: 'Allocation: Unallocated',
    });
  }

  // Multi Source
  if (filters.multiSource === true) {
    chips.push({
      key: 'multiSource',
      value: true,
      label: 'Data: Multi Source',
    });
  } else if (filters.multiSource === false) {
    chips.push({
      key: 'multiSource',
      value: false,
      label: 'Data: Single Source',
    });
  }

  // Availed
  if (filters.availed === true) {
    chips.push({
      key: 'availed',
      value: true,
      label: 'Availed: Yes',
    });
  } else if (filters.availed === false) {
    chips.push({
      key: 'availed',
      value: false,
      label: 'Availed: No',
    });
  }

  // Created Date
  if (filters.startDate || filters.endDate) {
    const range = [filters.startDate, filters.endDate].filter(Boolean).join(' to ');
    chips.push({
      key: 'createdDateRange',
      value: range,
      label: `Created: ${range}`,
    });
  }

  // Updated Date
  if (filters.updatedFrom || filters.updatedTo) {
    const range = [filters.updatedFrom, filters.updatedTo].filter(Boolean).join(' to ');
    chips.push({
      key: 'updatedDateRange',
      value: range,
      label: `Updated: ${range}`,
    });
  }

  // Availed Date
  if (filters.availedFrom || filters.availedTo) {
    const range = [filters.availedFrom, filters.availedTo].filter(Boolean).join(' to ');
    chips.push({
      key: 'availedDateRange',
      value: range,
      label: `Availed Date: ${range}`,
    });
  }

  return chips;
};

/**
 * Pure helper to remove a specific filter chip from filter state
 */
export const removeFilterFromState = (filters, chipKey, chipValue) => {
  const next = { ...filters };

  switch (chipKey) {
    case 'search':
      next.search = '';
      break;
    case 'courseTypeIds':
      next.courseTypeIds = (next.courseTypeIds || []).filter(id => id !== chipValue);
      break;
    case 'leadSourceIds':
      next.leadSourceIds = (next.leadSourceIds || []).filter(id => id !== chipValue);
      break;
    case 'courseIds':
      next.courseIds = (next.courseIds || []).filter(id => id !== chipValue);
      break;
    case 'interestedCourseIds':
      next.interestedCourseIds = (next.interestedCourseIds || []).filter(id => id !== chipValue);
      break;
    case 'registeredCourseId':
      next.registeredCourseId = null;
      break;
    case 'departmentIds':
      next.departmentIds = (next.departmentIds || []).filter(id => id !== chipValue);
      break;
    case 'assignedUserIds':
      next.assignedUserIds = (next.assignedUserIds || []).filter(id => id !== chipValue);
      break;
    case 'boardIds':
      next.boardIds = (next.boardIds || []).filter(id => id !== chipValue);
      break;
    case 'gradeIds':
      next.gradeIds = (next.gradeIds || []).filter(id => id !== chipValue);
      break;
    case 'statusIds':
      next.statusIds = (next.statusIds || []).filter(id => id !== chipValue);
      break;
    case 'leadStatusHistoryIds':
      next.leadStatusHistoryIds = (next.leadStatusHistoryIds || []).filter(id => id !== chipValue);
      break;
    case 'allotted':
      next.allotted = null;
      break;
    case 'multiSource':
      next.multiSource = null;
      break;
    case 'availed':
      next.availed = null;
      break;
    case 'createdDateRange':
      next.startDate = '';
      next.endDate = '';
      break;
    case 'updatedDateRange':
      next.updatedFrom = '';
      next.updatedTo = '';
      break;
    case 'availedDateRange':
      next.availedFrom = '';
      next.availedTo = '';
      break;
    default:
      break;
  }

  return next;
};

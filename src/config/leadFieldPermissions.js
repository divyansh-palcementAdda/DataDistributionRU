/**
 * Single Canonical Lead Field Catalog & Permission Definitions
 * 
 * Every permission-controlled Lead field has:
 * - Independent READ (View) permission
 * - Independent WRITE (Edit) permission
 * 
 * Used across:
 * - Lead Detail (Field Visibility)
 * - Lead Edit Modal (Field Visibility + Read-Only / Editable)
 * - All Leads Table (Column Visibility)
 * - Lead Filter Drawer (Filter Visibility)
 * - Roles & Permissions Matrix UI (Admin Dynamic Configuration)
 */

export const LEAD_FIELD_CATEGORIES = {
  CONTACT: 'Contact Information',
  ACADEMIC: 'Academic & Course Information',
  SOURCE: 'Lead Source & Acquisition',
  BUSINESS: 'Department & Remarks',
  VISIT: 'Campus Visit Planning',
  ASSIGNMENT: 'Assignment & Allotment',
  STATUS: 'Status & Follow-up',
  AUDIT: 'System & Audit',
};

export const LEAD_FIELDS = [
  // ── Contact Information ──
  {
    key: 'fullName',
    label: 'Full Name',
    category: LEAD_FIELD_CATEGORIES.CONTACT,
    readPermission: 'LEAD_FIELD_FULL_NAME_READ',
    writePermission: 'LEAD_FIELD_FULL_NAME_WRITE',
    description: 'Lead full name',
  },
  {
    key: 'phoneNumber',
    label: 'Primary Phone Number',
    category: LEAD_FIELD_CATEGORIES.CONTACT,
    readPermission: 'LEAD_FIELD_PHONE_NUMBER_READ',
    writePermission: 'LEAD_FIELD_PHONE_NUMBER_WRITE',
    description: 'Primary contact phone number',
  },
  {
    key: 'alternatePhoneNumber',
    label: 'Alternate Phone Number',
    category: LEAD_FIELD_CATEGORIES.CONTACT,
    readPermission: 'LEAD_FIELD_ALTERNATE_PHONE_READ',
    writePermission: 'LEAD_FIELD_ALTERNATE_PHONE_WRITE',
    description: 'Secondary contact phone number',
  },
  {
    key: 'email',
    label: 'Email Address',
    category: LEAD_FIELD_CATEGORIES.CONTACT,
    readPermission: 'LEAD_FIELD_EMAIL_READ',
    writePermission: 'LEAD_FIELD_EMAIL_WRITE',
    description: 'Primary email address',
  },
  {
    key: 'city',
    label: 'City',
    category: LEAD_FIELD_CATEGORIES.CONTACT,
    readPermission: 'LEAD_FIELD_CITY_READ',
    writePermission: 'LEAD_FIELD_CITY_WRITE',
    description: 'Current residence city',
  },
  {
    key: 'state',
    label: 'State',
    category: LEAD_FIELD_CATEGORIES.CONTACT,
    readPermission: 'LEAD_FIELD_STATE_READ',
    writePermission: 'LEAD_FIELD_STATE_WRITE',
    description: 'Current residence state',
  },
  {
    key: 'country',
    label: 'Country',
    category: LEAD_FIELD_CATEGORIES.CONTACT,
    readPermission: 'LEAD_FIELD_COUNTRY_READ',
    writePermission: 'LEAD_FIELD_COUNTRY_WRITE',
    description: 'Current residence country',
  },
  {
    key: 'preferredLocation',
    label: 'Preferred Study Location',
    category: LEAD_FIELD_CATEGORIES.CONTACT,
    readPermission: 'LEAD_FIELD_PREFERRED_LOCATION_READ',
    writePermission: 'LEAD_FIELD_PREFERRED_LOCATION_WRITE',
    description: 'Preferred study state and city',
  },

  // ── Academic & Course Information ──
  {
    key: 'program',
    label: 'Program / School',
    category: LEAD_FIELD_CATEGORIES.ACADEMIC,
    readPermission: 'LEAD_FIELD_PROGRAM_READ',
    writePermission: 'LEAD_FIELD_PROGRAM_WRITE',
    description: 'Academic program or school',
  },
  {
    key: 'courseType',
    label: 'Course Type / Category',
    category: LEAD_FIELD_CATEGORIES.ACADEMIC,
    readPermission: 'LEAD_FIELD_COURSE_TYPE_READ',
    writePermission: 'LEAD_FIELD_COURSE_TYPE_WRITE',
    description: 'Course type (e.g. UG, PG)',
  },
  {
    key: 'course',
    label: 'Registered Course',
    category: LEAD_FIELD_CATEGORIES.ACADEMIC,
    readPermission: 'LEAD_FIELD_COURSE_READ',
    writePermission: 'LEAD_FIELD_COURSE_WRITE',
    description: 'Primary registered course',
  },
  {
    key: 'interestedCourses',
    label: 'Interested Courses',
    category: LEAD_FIELD_CATEGORIES.ACADEMIC,
    readPermission: 'LEAD_FIELD_INTERESTED_COURSES_READ',
    writePermission: 'LEAD_FIELD_INTERESTED_COURSES_WRITE',
    description: 'Multiple interested courses list',
  },
  {
    key: 'board',
    label: 'Education Board',
    category: LEAD_FIELD_CATEGORIES.ACADEMIC,
    readPermission: 'LEAD_FIELD_BOARD_READ',
    writePermission: 'LEAD_FIELD_BOARD_WRITE',
    description: 'Education board (e.g. CBSE, ICSE)',
  },
  {
    key: 'grade',
    label: 'Grade / Class',
    category: LEAD_FIELD_CATEGORIES.ACADEMIC,
    readPermission: 'LEAD_FIELD_GRADE_READ',
    writePermission: 'LEAD_FIELD_GRADE_WRITE',
    description: 'Academic grade or class level',
  },

  // ── Lead Source & Acquisition ──
  {
    key: 'leadSources',
    label: 'Lead Source & Multi Source',
    category: LEAD_FIELD_CATEGORIES.SOURCE,
    readPermission: 'LEAD_FIELD_LEAD_SOURCE_READ',
    writePermission: 'LEAD_FIELD_LEAD_SOURCE_WRITE',
    description: 'Primary and historical lead sources, multi-source records',
  },
  {
    key: 'sourceDetails',
    label: 'Source Details / Campaign',
    category: LEAD_FIELD_CATEGORIES.SOURCE,
    readPermission: 'LEAD_FIELD_SOURCE_DETAILS_READ',
    writePermission: 'LEAD_FIELD_SOURCE_DETAILS_WRITE',
    description: 'Specific campaign, sub-source or UT-level details',
  },

  // ── Business & Remarks ──
  {
    key: 'department',
    label: 'Department',
    category: LEAD_FIELD_CATEGORIES.BUSINESS,
    readPermission: 'LEAD_FIELD_DEPARTMENT_READ',
    writePermission: 'LEAD_FIELD_DEPARTMENT_WRITE',
    description: 'Assigned academic or operational department',
  },
  {
    key: 'remarks',
    label: 'Remarks & Notes',
    category: LEAD_FIELD_CATEGORIES.BUSINESS,
    readPermission: 'LEAD_FIELD_REMARKS_READ',
    writePermission: 'LEAD_FIELD_REMARKS_WRITE',
    description: 'Lead remarks, notes, and counselor observations',
  },

  // ── Campus Visit Planning ──
  {
    key: 'visitPlanning',
    label: 'University Visit Planning',
    category: LEAD_FIELD_CATEGORIES.VISIT,
    readPermission: 'LEAD_FIELD_VISIT_PLANNING_READ',
    writePermission: 'LEAD_FIELD_VISIT_PLANNING_WRITE',
    description: 'Campus visit status, scheduled date, time, and visit remarks',
  },

  // ── Assignment & Allotment ──
  {
    key: 'assignedTo',
    label: 'Assigned Counselor / Allotment',
    category: LEAD_FIELD_CATEGORIES.ASSIGNMENT,
    readPermission: 'LEAD_FIELD_ASSIGNED_TO_READ',
    writePermission: 'LEAD_FIELD_ASSIGNED_TO_WRITE',
    description: 'Assigned user / counselor and allotment metadata',
  },
  {
    key: 'isAvailed',
    label: 'Availed Status & Details',
    category: LEAD_FIELD_CATEGORIES.ASSIGNMENT,
    readPermission: 'LEAD_FIELD_AVAILED_READ',
    writePermission: 'LEAD_FIELD_AVAILED_WRITE',
    description: 'Availed status, availed timestamp, and availed by user',
  },

  // ── Status & Follow-up ──
  {
    key: 'currentStatus',
    label: 'Lead Status',
    category: LEAD_FIELD_CATEGORIES.STATUS,
    readPermission: 'LEAD_FIELD_CURRENT_STATUS_READ',
    writePermission: 'LEAD_FIELD_CURRENT_STATUS_WRITE',
    description: 'Current sales/operational lead status',
  },
  {
    key: 'statusHistory',
    label: 'Lead Status History',
    category: LEAD_FIELD_CATEGORIES.STATUS,
    readPermission: 'LEAD_FIELD_STATUS_HISTORY_READ',
    writePermission: null, // System-managed transition log
    description: 'Historical progression of lead status changes',
  },
  {
    key: 'nextFollowUpDate',
    label: 'Scheduled Follow-up',
    category: LEAD_FIELD_CATEGORIES.STATUS,
    readPermission: 'LEAD_FIELD_FOLLOW_UP_READ',
    writePermission: 'LEAD_FIELD_FOLLOW_UP_WRITE',
    description: 'Next follow-up date and reminder schedule',
  },

  // ── System & Audit ──
  {
    key: 'leadCode',
    label: 'Lead Code',
    category: LEAD_FIELD_CATEGORIES.AUDIT,
    readPermission: 'LEAD_FIELD_LEAD_CODE_READ',
    writePermission: null, // System-generated unique identifier
    description: 'System unique lead identifier code',
  },
  {
    key: 'auditInfo',
    label: 'Audit & Creator Metadata',
    category: LEAD_FIELD_CATEGORIES.AUDIT,
    readPermission: 'LEAD_FIELD_AUDIT_INFO_READ',
    writePermission: null, // System-managed audit fields
    description: 'Created by, created date, and last modified timestamps',
  },
];

// Fast lookup map by key
export const LEAD_FIELDS_BY_KEY = LEAD_FIELDS.reduce((acc, field) => {
  acc[field.key] = field;
  return acc;
}, {});

/**
 * Checks if current user can view a lead field.
 * If no read permission is registered or user has read permission, returns true.
 */
export const canViewLeadField = (hasPermission, fieldKey) => {
  if (typeof hasPermission !== 'function') return true;
  const def = LEAD_FIELDS_BY_KEY[fieldKey];
  if (!def || !def.readPermission) return true;
  return hasPermission(def.readPermission);
};

/**
 * Checks if current user can edit a lead field.
 * Requires BOTH view permission AND write permission.
 */
export const canEditLeadField = (hasPermission, fieldKey) => {
  if (typeof hasPermission !== 'function') return true;
  const def = LEAD_FIELDS_BY_KEY[fieldKey];
  if (!def) return true;
  if (!def.writePermission) return false; // System-managed field
  return canViewLeadField(hasPermission, fieldKey) && hasPermission(def.writePermission);
};

/**
 * Checks if field is completely hidden from UI.
 */
export const isLeadFieldHidden = (hasPermission, fieldKey) => {
  return !canViewLeadField(hasPermission, fieldKey);
};

/**
 * Returns fields grouped by category.
 */
export const getLeadFieldsByCategory = () => {
  const grouped = {};
  Object.values(LEAD_FIELD_CATEGORIES).forEach(cat => {
    grouped[cat] = [];
  });
  LEAD_FIELDS.forEach(field => {
    if (grouped[field.category]) {
      grouped[field.category].push(field);
    }
  });
  return grouped;
};

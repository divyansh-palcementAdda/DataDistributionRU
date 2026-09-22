import React from 'react';
import { FiCopy, FiCalendar } from 'react-icons/fi';

/**
 * Returns distinct styling tokens (bg, text, border, dot) based on status name.
 */
export const getLeadStatusStyle = (statusName) => {
  if (!statusName || typeof statusName !== 'string') {
    return {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
      dot: 'bg-slate-400',
    };
  }
  const s = statusName.trim().toLowerCase();

  // Connected / Contacted / In Touch
  if (s.includes('connect') || s.includes('contact') || s.includes('in touch')) {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
    };
  }

  // Raw / Fresh / New / Uncontacted
  if (s.includes('raw') || s.includes('fresh') || s.includes('new') || s.includes('uncontacted')) {
    return {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200',
      dot: 'bg-sky-500',
    };
  }

  // Registered / Enrolled / Admitted / Converted
  if (s.includes('regist') || s.includes('enroll') || s.includes('admit') || s.includes('convert')) {
    return {
      bg: 'bg-teal-50',
      text: 'text-teal-800 font-bold',
      border: 'border-teal-300',
      dot: 'bg-teal-500',
    };
  }

  // Counseling / Counseling Follow-up
  if (s.includes('counsel')) {
    return {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      dot: 'bg-purple-500',
    };
  }

  // Form Follow-up / Application
  if (s.includes('form') || s.includes('applica')) {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
    };
  }

  // General Follow-up / Callback / Pending
  if (s.includes('follow') || s.includes('pending') || s.includes('call')) {
    return {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      dot: 'bg-orange-500',
    };
  }

  // Not Interested / Lost / Junk / Rejected / Dropped / Close
  if (s.includes('not interest') || s.includes('lost') || s.includes('junk') || s.includes('reject') || s.includes('drop') || s.includes('close')) {
    return {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      dot: 'bg-rose-500',
    };
  }

  // Visit / Campus
  if (s.includes('visit') || s.includes('walkin') || s.includes('campus')) {
    return {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      dot: 'bg-indigo-500',
    };
  }

  // Warm / Hot / Interested
  if (s.includes('hot') || s.includes('interest')) {
    return {
      bg: 'bg-pink-50',
      text: 'text-pink-700',
      border: 'border-pink-200',
      dot: 'bg-pink-500',
    };
  }

  // Cold / Inactive
  if (s.includes('cold') || s.includes('inactive')) {
    return {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      dot: 'bg-blue-400',
    };
  }

  return {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  };
};

/**
 * Renders Lead Info cell with Full Name on top and Lead ID badge cleanly below name.
 */
export const renderLeadInfoCell = (row, onLeadClick, showToast) => {
  const nameValue = typeof row?.fullName === 'object'
    ? row?.fullName?.name || row?.fullName?.firstName || 'N/A'
    : row?.fullName || 'N/A';

  const leadCodeValue = row?.leadCode;
  let displayLeadCode = '';
  if (typeof leadCodeValue === 'object' && leadCodeValue !== null) {
    displayLeadCode = leadCodeValue?.code || leadCodeValue?.name || '';
  } else if (typeof leadCodeValue === 'string') {
    displayLeadCode = leadCodeValue;
  }

  const handleCopyId = (e) => {
    e.stopPropagation();
    if (displayLeadCode) {
      navigator.clipboard.writeText(displayLeadCode);
      if (showToast) showToast('Lead ID copied to clipboard!');
    }
  };

  return (
    <div className="flex flex-col items-start gap-1 py-0.5">
      <span
        className={`font-semibold text-slate-900 text-[13.5px] leading-tight transition-colors ${
          onLeadClick ? 'hover:text-indigo-600 cursor-pointer' : ''
        }`}
        onClick={() => onLeadClick && onLeadClick(row)}
        title={onLeadClick ? 'Click to view lead details' : undefined}
      >
        {nameValue}
      </span>

      {displayLeadCode && displayLeadCode !== 'N/A' && (
        <div className="inline-flex items-center">
          <span
            onClick={handleCopyId}
            className="inline-flex items-center gap-1 font-mono text-[10.5px] font-semibold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100/90 px-1.5 py-0.5 rounded border border-indigo-100/90 shadow-2xs transition-all cursor-pointer group/leadid"
            title="Click to copy Lead ID"
          >
            <span className="text-[8.5px] uppercase font-bold tracking-wider px-1 py-0.2 rounded bg-indigo-200/50 text-indigo-800">
              ID
            </span>
            <span>{displayLeadCode}</span>
            <FiCopy className="opacity-0 group-hover/leadid:opacity-100 transition-opacity text-[10px] text-indigo-500 ml-0.5" />
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Renders Course cell with support for multiple interested courses (+N badge).
 */
export const renderCourseCell = (row) => {
  let courses = [];
  if (Array.isArray(row?.interestedCourses) && row.interestedCourses.length > 0) {
    courses = row.interestedCourses
      .map((c) => (typeof c === 'object' && c !== null ? c.courseName || c.name || '' : String(c)))
      .filter(Boolean);
  } else if (row?.course && typeof row.course === 'object') {
    const name = row.course.courseName || row.course.name;
    if (name) courses.push(name);
  } else if (typeof row?.course === 'string' && row.course.trim()) {
    courses.push(row.course.trim());
  }

  if (courses.length === 0) {
    return <span className="text-slate-400 text-xs italic">N/A</span>;
  }

  const primaryCourse = courses[0];
  const hasMultipleCourses = courses.length > 1;

  if (!hasMultipleCourses) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100/80 shadow-2xs">
        {primaryCourse}
      </span>
    );
  }

  const extraCount = courses.length - 1;
  const allCoursesText = courses.join(', ');

  return (
    <div className="flex items-center gap-1.5 flex-wrap" title={`Interested in: ${allCoursesText}`}>
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100/80 shadow-2xs">
        {primaryCourse}
      </span>
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 cursor-pointer hover:bg-amber-100 hover:border-amber-300 transition-all shadow-2xs"
        title={`All Courses: ${allCoursesText}`}
      >
        <span>+{extraCount}</span>
        <span className="text-[9.5px] uppercase font-semibold">More</span>
      </span>
    </div>
  );
};

/**
 * Renders Source cell with distinct Multi-Source badge when lead is multi-source.
 */
export const renderSourceCell = (row) => {
  const sources = Array.isArray(row?.leadSources) && row.leadSources.length > 0
    ? row.leadSources.map((s) => (typeof s === 'object' ? s.name || s.code : s)).filter(Boolean)
    : row?.sourceDetails
    ? [row.sourceDetails]
    : row?.source
    ? [typeof row.source === 'object' ? row.source?.name : row.source]
    : [];

  const isMulti = Boolean(
    row?.isMultiSource === true ||
    row?.multiSource === true ||
    sources.length > 1
  );

  if (sources.length === 0) {
    return <span className="text-slate-400 text-xs italic">N/A</span>;
  }

  const primarySource = sources[0];

  if (!isMulti) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
        {primarySource}
      </span>
    );
  }

  const extraCount = sources.length > 1 ? sources.length - 1 : 1;
  const allSourcesTooltip = sources.length > 0 ? sources.join(', ') : 'Multiple Sources';

  return (
    <div className="flex flex-col gap-1 items-start" title={allSourcesTooltip}>
      {sources.length > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {primarySource}
        </span>
      )}
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs hover:bg-purple-100 transition-colors cursor-pointer"
        title={`Multi-Source Lead: ${allSourcesTooltip}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
        <span>Multi-Source</span>
        {sources.length > 1 && (
          <span className="text-purple-600 text-[10px]">+{extraCount}</span>
        )}
      </span>
    </div>
  );
};

/**
 * Renders Lead Status cell with distinct semantic color badges and dot indicators.
 */
export const renderStatusCell = (value, row) => {
  const statusValue = value || row?.currentStatus;
  let displayValue = 'N/A';
  if (typeof statusValue === 'object' && statusValue !== null) {
    displayValue = statusValue?.name || statusValue?.code || 'N/A';
  } else if (typeof statusValue === 'string') {
    displayValue = statusValue;
  }

  const style = getLeadStatusStyle(displayValue);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-2xs whitespace-nowrap ${style.bg} ${style.text} ${style.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
      {displayValue}
    </span>
  );
};

/**
 * Renders Counselor cell with highlighted initials avatar & styling for allotted vs unallotted.
 */
export const renderCounselorCell = (row) => {
  const name =
    typeof row?.assignedTo === 'object' && row?.assignedTo !== null
      ? `${row.assignedTo.firstName || ''} ${row.assignedTo.lastName || ''}`.trim() ||
        row.assignedTo.name ||
        row.assignedTo.username ||
        ''
      : typeof row?.assignedTo === 'string'
      ? row.assignedTo.trim()
      : '';

  const isUnassigned =
    !name ||
    name.toLowerCase() === 'not allotted' ||
    name.toLowerCase() === 'unassigned' ||
    name.toLowerCase() === 'unallocated';

  if (isUnassigned) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50/90 text-amber-700 border border-amber-200/80 shadow-2xs whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        Not Allotted
      </span>
    );
  }

  // Generate initials (e.g. AS, HD, LC)
  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'C';

  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs shrink-0 ring-1 ring-indigo-200">
        {initials}
      </div>
      <span className="font-semibold text-slate-800 hover:text-indigo-600 transition-colors text-xs whitespace-nowrap">
        {name}
      </span>
    </div>
  );
};

/**
 * Renders Follow-Up Date cell with formatted date and icon.
 */
export const renderFollowUpCell = (row) => {
  const followUpDate = row?.nextFollowUpDate;
  if (followUpDate) {
    try {
      const d = new Date(followUpDate);
      if (!isNaN(d.getTime())) {
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap">
            <FiCalendar className="text-[11px] text-slate-400" />
            {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        );
      }
    } catch (e) {
      return 'Invalid Date';
    }
  }
  return <span className="text-slate-400 text-xs font-medium">None</span>;
};

/**
 * Renders Created By cell.
 */
export const renderCreatedByCell = (value, row) => {
  const createdByValue = value || row?.createdBy;
  let name = 'N/A';
  if (typeof createdByValue === 'object' && createdByValue !== null) {
    name =
      `${createdByValue.firstName || ''} ${createdByValue.lastName || ''}`.trim() ||
      createdByValue.username ||
      'N/A';
  } else if (typeof createdByValue === 'string') {
    name = createdByValue;
  }
  return <span className="text-slate-600 text-xs font-medium">{name}</span>;
};

/**
 * Renders Lead Date cell with formatted date and Availed / Unavailed badge (100% non-PII).
 */
export const renderLeadDateCell = (row) => {
  const dateVal = row?.createdAt || row?.createdDate;
  if (!dateVal) {
    return <span className="text-slate-400 text-xs italic">-</span>;
  }
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return <span className="text-slate-400 text-xs italic">-</span>;

    const formattedDate = d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const isAvailed = Boolean(row?.isAvailed || row?.availed);

    return (
      <div className="flex flex-col items-start gap-1 py-0.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 whitespace-nowrap">
          <FiCalendar className="text-[11px] text-slate-400 shrink-0" />
          <span>{formattedDate}</span>
        </span>
        {isAvailed ? (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Availed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
            Unavailed
          </span>
        )}
      </div>
    );
  } catch (e) {
    return <span className="text-slate-400 text-xs italic">-</span>;
  }
};

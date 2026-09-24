import { useState, useMemo } from 'react';

/**
 * CallerInfoPanel
 * 
 * Reusable Caller Guidance & Info Panel component.
 * Displays course-specific Renaissance University information,
 * talking points, USPs, job opportunities, and competitor comparison table.
 * 
 * Complies with field-level RBAC: unpermitted fields returned as null from the backend
 * are completely omitted (not rendered as empty or N/A).
 * 
 * @param {Object} props
 * @param {Object} props.guidance - CourseInfoPanelResponseDTO
 * @param {Array} props.availableCourses - List of interested courses [{id, name, courseCode}]
 * @param {string} props.selectedCourseId - Currently selected course id
 * @param {Function} props.onSelectCourse - Callback when user switches course tab
 * @param {boolean} props.loading - Loading state
 */
const CallerInfoPanel = ({
  guidance,
  availableCourses = [],
  selectedCourseId,
  onSelectCourse,
  loading = false,
  error = null,
}) => {
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Helper to split newline or semicolon-delimited string into list items
  const parseList = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return val
      .split(/[\n;•]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  // Check which competitor columns have at least one visible data point among all competitors
  const visibleCompetitorColumns = useMemo(() => {
    if (!guidance || !Array.isArray(guidance.competitors) || guidance.competitors.length === 0) {
      return [];
    }

    const columns = [
      { key: 'branches', label: 'Branches' },
      { key: 'courseFeePerYear', label: 'Fee / Year' },
      { key: 'duration', label: 'Duration' },
      { key: 'odds', label: 'Odds / Acceptance' },
      { key: 'eligibility', label: 'Eligibility' },
      { key: 'hostel', label: 'Hostel' },
      { key: 'distanceFromCity', label: 'Distance from City' },
      { key: 'registrationFee', label: 'Reg. Fee' },
      { key: 'averagePlacements', label: 'Avg Placement' },
      { key: 'highestPlacement', label: 'Highest Placement' },
    ];

    return columns.filter((col) => {
      return guidance.competitors.some((comp) => {
        if (col.key === 'branches') {
          return Array.isArray(comp.branches) && comp.branches.length > 0;
        }
        return comp.comparison && comp.comparison[col.key] != null && comp.comparison[col.key] !== '';
      });
    });
  }, [guidance]);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[300px] text-gray-400">
        <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <span className="text-xs font-medium">Loading caller guidance & course info...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* 1. Multi-course Tabs (if more than 1 interested course) */}
      {availableCourses && availableCourses.length > 0 && (
        <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1 flex-shrink-0">
            Courses:
          </span>
          {availableCourses.map((crs) => {
            const isSelected = String(crs.id) === String(selectedCourseId);
            return (
              <button
                key={crs.id}
                type="button"
                onClick={() => onSelectCourse && onSelectCourse(crs.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200/80 text-gray-700'
                }`}
              >
                <span>🎓</span>
                <span>{crs.courseName || crs.name || 'Course'}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Guidance Scroll Area */}
      <div className="p-4 overflow-y-auto flex-1 space-y-4">
        {error ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
            <span className="text-base">ℹ️</span>
            <div>
              <p className="font-semibold">{error}</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Guidance details for this course can be configured in Course Management.
              </p>
            </div>
          </div>
        ) : !guidance ? (
          <div className="p-8 text-center text-xs text-gray-400 bg-white border border-gray-200/80 rounded-xl">
            <span className="text-2xl block mb-2">📋</span>
            No guidance profile found for the selected course.
          </div>
        ) : (
          <>
            {/* Header: Course Overview Card */}
            <div className="bg-gradient-to-br from-white to-blue-50/40 border border-blue-100 rounded-xl p-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100/80 pb-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900 tracking-tight">
                      {guidance.courseName || guidance.course?.courseName || 'Course Guidance'}
                    </h3>
                    {guidance.academicSession && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        Session: {guidance.academicSession}
                      </span>
                    )}
                  </div>
                  {guidance.school && (
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      🏫 {guidance.school}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Renaissance University
                  </span>
                </div>
              </div>

              {/* Quick Metrics Grid (Only permitted/non-null fields render) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {guidance.courseFee != null && (
                  <div className="bg-white/80 p-2.5 rounded-lg border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                      Course Fee
                    </span>
                    <span className="text-xs font-bold text-blue-700 mt-0.5 block">
                      {guidance.courseFee}
                    </span>
                  </div>
                )}
                {guidance.duration != null && (
                  <div className="bg-white/80 p-2.5 rounded-lg border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                      Duration
                    </span>
                    <span className="text-xs font-semibold text-gray-800 mt-0.5 block">
                      {guidance.duration}
                    </span>
                  </div>
                )}
                {guidance.eligibility != null && (
                  <div className="bg-white/80 p-2.5 rounded-lg border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                      Eligibility
                    </span>
                    <span className="text-xs font-medium text-gray-800 mt-0.5 block line-clamp-2" title={guidance.eligibility}>
                      {guidance.eligibility}
                    </span>
                  </div>
                )}
                {guidance.hostelFee != null && (
                  <div className="bg-white/80 p-2.5 rounded-lg border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                      Hostel Fee
                    </span>
                    <span className="text-xs font-semibold text-gray-800 mt-0.5 block">
                      {guidance.hostelFee}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CALLER GUIDANCE / PITCH NOTES (High Priority for Phone Calls) */}
            {guidance.callerGuidance != null && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200 rounded-xl p-4 shadow-2xs relative">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎙️</span>
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Caller Pitch Notes & Talking Points
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(guidance.callerGuidance, 'callerGuidance')}
                    className="text-[11px] font-semibold text-amber-800 hover:text-amber-900 bg-amber-100/80 hover:bg-amber-200 px-2 py-0.5 rounded transition-colors flex items-center gap-1"
                    title="Copy talking points to clipboard"
                  >
                    {copiedKey === 'callerGuidance' ? '✓ Copied' : '📋 Copy Pitch'}
                  </button>
                </div>
                <div className="text-xs text-amber-950 font-normal leading-relaxed whitespace-pre-line pl-1">
                  {guidance.callerGuidance}
                </div>
              </div>
            )}

            {/* COURSE DETAILS */}
            {guidance.courseDetails != null && (
              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span>📖</span> Course Details & Curriculum
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                  {guidance.courseDetails}
                </p>
              </div>
            )}

            {/* JOB OPPORTUNITIES */}
            {guidance.jobOpportunities != null && (
              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <span>💼</span> Job Opportunities & Career Roles
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {parseList(guidance.jobOpportunities).map((job, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {job}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* TWO-COLUMN GRID: Course USPs & Renaissance University USPs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Course Specialities / USPs */}
              {guidance.courseSpecialities != null && (
                <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs flex flex-col">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                    <span>✨</span> Course Specialities & Highlights
                  </h4>
                  <ul className="text-xs text-gray-700 space-y-2 flex-1">
                    {parseList(guidance.courseSpecialities).map((usp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold mt-0.5">•</span>
                        <span>{usp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Renaissance University USPs */}
              {guidance.renaissanceUniversityUsps != null && (
                <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs flex flex-col">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                    <span>🏛️</span> Renaissance University USPs
                  </h4>
                  <ul className="text-xs text-gray-700 space-y-2 flex-1">
                    {parseList(guidance.renaissanceUniversityUsps).map((usp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold mt-0.5">•</span>
                        <span>{usp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* HOW WE ARE DIFFERENT */}
            {guidance.howWeAreDifferent != null && (
              <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/30 border border-indigo-100 rounded-xl p-4 shadow-2xs">
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <span>🚀</span> How We Are Different (Competitive Edge)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {parseList(guidance.howWeAreDifferent).map((diff, idx) => (
                    <div
                      key={idx}
                      className="bg-white/90 p-2.5 rounded-lg border border-indigo-100/80 text-xs text-indigo-950 font-medium flex items-start gap-2"
                    >
                      <span className="text-indigo-600 font-bold">✓</span>
                      <span>{diff}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* COMPETITOR COMPARISON TABLE */}
            {Array.isArray(guidance.competitors) && guidance.competitors.length > 0 && visibleCompetitorColumns.length > 0 && (
              <div className="bg-white border border-gray-200/90 rounded-xl shadow-2xs overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚖️</span>
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Competitor College Comparison
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">
                    {guidance.competitors.length} {guidance.competitors.length === 1 ? 'College' : 'Colleges'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/70 text-[10px] font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        <th className="py-2.5 px-3.5 font-bold min-w-[140px]">College</th>
                        {visibleCompetitorColumns.map((col) => (
                          <th key={col.key} className="py-2.5 px-3 font-semibold whitespace-nowrap">
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {/* Renaissance University benchmark row */}
                      <tr className="bg-blue-50/50 font-semibold text-blue-950">
                        <td className="py-2.5 px-3.5 border-r border-blue-100">
                          <span className="inline-flex items-center gap-1.5 font-bold text-blue-700">
                            ★ Renaissance University
                          </span>
                        </td>
                        {visibleCompetitorColumns.map((col) => {
                          let val = '-';
                          if (col.key === 'branches') val = 'Indore Campus';
                          else if (col.key === 'courseFeePerYear') val = guidance.courseFee || '-';
                          else if (col.key === 'duration') val = guidance.duration || '-';
                          else if (col.key === 'eligibility') val = guidance.eligibility || '-';
                          else if (col.key === 'hostel') val = guidance.hostelFee || '-';
                          return (
                            <td key={col.key} className="py-2.5 px-3 whitespace-nowrap text-blue-900 font-medium">
                              {val}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Competitor rows */}
                      {guidance.competitors.map((comp) => {
                        const branchesText = Array.isArray(comp.branches)
                          ? comp.branches.map((b) => b.branchName).filter(Boolean).join(', ')
                          : '';

                        return (
                          <tr key={comp.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3.5 font-semibold text-gray-900 border-r border-gray-100">
                              {comp.collegeName}
                            </td>
                            {visibleCompetitorColumns.map((col) => {
                              let cellValue = '-';
                              if (col.key === 'branches') {
                                cellValue = branchesText || '-';
                              } else if (comp.comparison && comp.comparison[col.key] != null && comp.comparison[col.key] !== '') {
                                cellValue = comp.comparison[col.key];
                              }

                              return (
                                <td key={col.key} className="py-2.5 px-3 whitespace-nowrap text-gray-700">
                                  {cellValue}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CallerInfoPanel;

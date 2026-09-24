import React, { useState, useEffect, useCallback } from 'react';
import {
  getInfoPanelByCourse,
  createInfoPanel,
  updateInfoPanel,
  deleteInfoPanel,
  addCompetitor,
  updateCompetitor,
  deleteCompetitor,
  reorderCompetitors
} from '../../../Services/infoPanel/infoPanelService';
import CustomButton from '../CustomButton';
import CustomInput from '../CustomInput';

/**
 * AdminInfoPanelEditor
 * 
 * Comprehensive Admin management screen for Course Info Panel,
 * Caller Guidance notes, RU USPs, and Competitor Comparison colleges.
 */
const AdminInfoPanelEditor = ({ courseId, courseDetails, showToast }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [infoPanel, setInfoPanel] = useState(null);
  const [academicSession, setAcademicSession] = useState('2026-27');

  // Primary Course Guidance Form
  const [form, setForm] = useState({
    school: '',
    courseName: '',
    courseFee: '',
    duration: '',
    eligibility: '',
    hostelFee: '',
    jobOpportunities: '',
    courseDetails: '',
    courseSpecialities: '',
    renaissanceUniversityUsps: '',
    howWeAreDifferent: '',
    callerGuidance: '',
    active: true,
  });

  // Competitor Modal State
  const [isCompetitorModalOpen, setIsCompetitorModalOpen] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState(null);
  const [competitorForm, setCompetitorForm] = useState({
    collegeName: '',
    branches: '',
    courseFeePerYear: '',
    duration: '',
    odds: '',
    eligibility: '',
    hostel: '',
    distanceFromCity: '',
    registrationFee: '',
    averagePlacements: '',
    highestPlacement: '',
    active: true,
  });
  const [competitorSaving, setCompetitorSaving] = useState(false);

  // Load Info Panel data for selected course and session
  const fetchPanel = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const res = await getInfoPanelByCourse(courseId, academicSession);
      const data = res?.data || res;
      if (data && data.id) {
        setInfoPanel(data);
        setForm({
          school: data.school || '',
          courseName: data.courseName || courseDetails?.courseName || '',
          courseFee: data.courseFee || '',
          duration: data.duration || '',
          eligibility: data.eligibility || '',
          hostelFee: data.hostelFee || '',
          jobOpportunities: data.jobOpportunities || '',
          courseDetails: data.courseDetails || '',
          courseSpecialities: data.courseSpecialities || '',
          renaissanceUniversityUsps: data.renaissanceUniversityUsps || '',
          howWeAreDifferent: data.howWeAreDifferent || '',
          callerGuidance: data.callerGuidance || '',
          active: data.active ?? true,
        });
      } else {
        setInfoPanel(null);
        setForm({
          school: '',
          courseName: courseDetails?.courseName || '',
          courseFee: courseDetails?.fees ? `₹${courseDetails.fees}` : '',
          duration: courseDetails?.duration || '',
          eligibility: '',
          hostelFee: '',
          jobOpportunities: '',
          courseDetails: courseDetails?.description || '',
          courseSpecialities: '',
          renaissanceUniversityUsps: '',
          howWeAreDifferent: '',
          callerGuidance: '',
          active: true,
        });
      }
    } catch (err) {
      console.warn('No existing info panel found for course', err);
      setInfoPanel(null);
    } finally {
      setLoading(false);
    }
  }, [courseId, academicSession, courseDetails]);

  useEffect(() => {
    fetchPanel();
  }, [fetchPanel]);

  const handleInputChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
  };

  // Save / Update Info Panel
  const handleSavePanel = async () => {
    setSaving(true);
    try {
      const payload = {
        courseId,
        academicSession,
        school: form.school,
        courseName: form.courseName || courseDetails?.courseName,
        courseFee: form.courseFee,
        duration: form.duration,
        eligibility: form.eligibility,
        hostelFee: form.hostelFee,
        jobOpportunities: form.jobOpportunities,
        courseDetails: form.courseDetails,
        courseSpecialities: form.courseSpecialities,
        renaissanceUniversityUsps: form.renaissanceUniversityUsps,
        howWeAreDifferent: form.howWeAreDifferent,
        callerGuidance: form.callerGuidance,
        active: form.active,
      };

      let res;
      if (infoPanel && infoPanel.id) {
        res = await updateInfoPanel(infoPanel.id, payload);
      } else {
        res = await createInfoPanel(payload);
      }

      showToast?.('Caller Guidance & Info Panel saved successfully!', 'success');
      await fetchPanel();
    } catch (err) {
      console.error('Error saving info panel', err);
      showToast?.(err?.message || 'Failed to save Info Panel', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Competitor Modal Handlers
  const handleOpenAddCompetitor = () => {
    if (!infoPanel || !infoPanel.id) {
      showToast?.('Please save the course information first before adding competitors.', 'warning');
      return;
    }
    setEditingCompetitor(null);
    setCompetitorForm({
      collegeName: '',
      branches: '',
      courseFeePerYear: '',
      duration: '',
      odds: '',
      eligibility: '',
      hostel: '',
      distanceFromCity: '',
      registrationFee: '',
      averagePlacements: '',
      highestPlacement: '',
      active: true,
    });
    setIsCompetitorModalOpen(true);
  };

  const handleOpenEditCompetitor = (comp) => {
    setEditingCompetitor(comp);
    const branchesStr = Array.isArray(comp.branches)
      ? comp.branches.map(b => b.branchName).filter(Boolean).join(', ')
      : '';

    setCompetitorForm({
      collegeName: comp.collegeName || '',
      branches: branchesStr,
      courseFeePerYear: comp.comparison?.courseFeePerYear || '',
      duration: comp.comparison?.duration || '',
      odds: comp.comparison?.odds || '',
      eligibility: comp.comparison?.eligibility || '',
      hostel: comp.comparison?.hostel || '',
      distanceFromCity: comp.comparison?.distanceFromCity || '',
      registrationFee: comp.comparison?.registrationFee || '',
      averagePlacements: comp.comparison?.averagePlacements || '',
      highestPlacement: comp.comparison?.highestPlacement || '',
      active: comp.active ?? true,
    });
    setIsCompetitorModalOpen(true);
  };

  const handleSaveCompetitor = async () => {
    if (!competitorForm.collegeName.trim()) {
      showToast?.('Competitor college name is required.', 'error');
      return;
    }

    setCompetitorSaving(true);
    try {
      const branchesArr = competitorForm.branches
        .split(',')
        .map(b => b.trim())
        .filter(b => b.length > 0);

      const payload = {
        collegeName: competitorForm.collegeName.trim(),
        active: competitorForm.active,
        branches: branchesArr,
        comparison: {
          courseFeePerYear: competitorForm.courseFeePerYear,
          duration: competitorForm.duration,
          odds: competitorForm.odds,
          eligibility: competitorForm.eligibility,
          hostel: competitorForm.hostel,
          distanceFromCity: competitorForm.distanceFromCity,
          registrationFee: competitorForm.registrationFee,
          averagePlacements: competitorForm.averagePlacements,
          highestPlacement: competitorForm.highestPlacement,
        },
      };

      if (editingCompetitor) {
        await updateCompetitor(infoPanel.id, editingCompetitor.id, payload);
        showToast?.('Competitor updated successfully!', 'success');
      } else {
        await addCompetitor(infoPanel.id, payload);
        showToast?.('Competitor college added successfully!', 'success');
      }

      setIsCompetitorModalOpen(false);
      await fetchPanel();
    } catch (err) {
      console.error('Failed to save competitor', err);
      showToast?.(err?.message || 'Failed to save competitor.', 'error');
    } finally {
      setCompetitorSaving(false);
    }
  };

  const handleDeleteCompetitor = async (competitorId) => {
    if (!window.confirm('Are you sure you want to remove this competitor college?')) return;
    try {
      await deleteCompetitor(infoPanel.id, competitorId);
      showToast?.('Competitor deleted successfully!', 'success');
      await fetchPanel();
    } catch (err) {
      console.error('Failed to delete competitor', err);
      showToast?.(err?.message || 'Failed to delete competitor.', 'error');
    }
  };

  const handleMoveCompetitor = async (index, direction) => {
    if (!infoPanel || !Array.isArray(infoPanel.competitors)) return;
    const comps = [...infoPanel.competitors];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= comps.length) return;

    const temp = comps[index];
    comps[index] = comps[targetIdx];
    comps[targetIdx] = temp;

    const ids = comps.map(c => c.id);
    try {
      await reorderCompetitors(infoPanel.id, ids);
      await fetchPanel();
    } catch (err) {
      console.error('Failed to reorder competitors', err);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-gray-400 flex flex-col items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
        Loading Caller Guidance & Info Panel configuration...
      </div>
    );
  }

  return (
    <div className="mt-6 max-w-5xl space-y-6">
      {/* 1. Header Toolbar */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>📋</span> Caller Guidance & Info Panel Management
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure course talking points, USPs, and competitor comparison data for counselors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Academic Session Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-gray-600">Academic Session:</span>
            <select
              value={academicSession}
              onChange={(e) => setAcademicSession(e.target.value)}
              className="border border-gray-300 rounded-lg px-2.5 py-1.5 font-bold text-blue-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="2026-27">2026-27</option>
              <option value="2027-28">2027-28</option>
              <option value="2028-29">2028-29</option>
            </select>
          </div>

          <CustomButton
            variant="primary"
            onClick={handleSavePanel}
            disabled={saving}
            className="text-xs px-4 py-2 font-semibold shadow-xs"
          >
            {saving ? 'Saving...' : infoPanel ? 'Save Changes' : 'Create Info Panel'}
          </CustomButton>
        </div>
      </div>

      {/* 2. Renaissance University & Course Overview Fields */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-5">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center gap-2">
          <span>🏛️</span> Renaissance University Course Information
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-semibold text-gray-700 mb-1 block">Course Name</label>
            <input
              type="text"
              value={form.courseName}
              onChange={(e) => handleInputChange('courseName', e.target.value)}
              placeholder="e.g. BBA"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 mb-1 block">School / Faculty</label>
            <input
              type="text"
              value={form.school}
              onChange={(e) => handleInputChange('school', e.target.value)}
              placeholder="e.g. School of Commerce and Management"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 mb-1 block">Course Fee (Session Fee)</label>
            <input
              type="text"
              value={form.courseFee}
              onChange={(e) => handleInputChange('courseFee', e.target.value)}
              placeholder="e.g. ₹1,20,000 / year"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 mb-1 block">Duration</label>
            <input
              type="text"
              value={form.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              placeholder="e.g. 3 Years (6 Semesters)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 mb-1 block">Eligibility</label>
            <input
              type="text"
              value={form.eligibility}
              onChange={(e) => handleInputChange('eligibility', e.target.value)}
              placeholder="e.g. 10+2 with min 50% in any stream"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 mb-1 block">Hostel Fee</label>
            <input
              type="text"
              value={form.hostelFee}
              onChange={(e) => handleInputChange('hostelFee', e.target.value)}
              placeholder="e.g. ₹85,000 / year (Food + Stay)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
        </div>

        {/* 3. Structured Guidance, USPs & Pitch Notes */}
        <div className="pt-4 border-t border-gray-100 space-y-4">
          <div>
            <label className="font-semibold text-amber-900 mb-1 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <span>🎙️</span> Caller Pitch Notes & Talking Points (Visible to Counselors)
              </span>
              <span className="text-[11px] text-gray-400 font-normal">Use clear paragraphs or bullet points</span>
            </label>
            <textarea
              rows={4}
              value={form.callerGuidance}
              onChange={(e) => handleInputChange('callerGuidance', e.target.value)}
              placeholder="Key talking points for callers when pitching this course to a student or parent..."
              className="w-full border border-amber-200 rounded-lg p-3 text-xs focus:ring-2 focus:ring-amber-500/20 outline-none bg-amber-50/30"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 mb-1 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <span>📖</span> Course Details & Curriculum
              </span>
            </label>
            <textarea
              rows={3}
              value={form.courseDetails}
              onChange={(e) => handleInputChange('courseDetails', e.target.value)}
              placeholder="Detailed syllabus highlights, practical exposure, certifications..."
              className="w-full border border-gray-300 rounded-lg p-3 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 mb-1 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <span>💼</span> Job Opportunities & Career Roles (Separate by commas or newlines)
              </span>
            </label>
            <textarea
              rows={2}
              value={form.jobOpportunities}
              onChange={(e) => handleInputChange('jobOpportunities', e.target.value)}
              placeholder="Business Analyst, Marketing Specialist, HR Manager, Financial Consultant..."
              className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 mb-1 block text-xs">
                ✨ Course Specialities / USPs (One per line)
              </label>
              <textarea
                rows={3}
                value={form.courseSpecialities}
                onChange={(e) => handleInputChange('courseSpecialities', e.target.value)}
                placeholder="Industry aligned syllabus&#10;Live client projects&#10;Foreign language electives..."
                className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 mb-1 block text-xs">
                🏛️ Renaissance University USPs (One per line)
              </label>
              <textarea
                rows={3}
                value={form.renaissanceUniversityUsps}
                onChange={(e) => handleInputChange('renaissanceUniversityUsps', e.target.value)}
                placeholder="UGC recognized university&#10;100% placement track record&#10;Top tier corporate tie-ups..."
                className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-gray-700 mb-1 block text-xs">
              🚀 How We Are Different (Key Differentiators - One per line)
            </label>
            <textarea
              rows={2}
              value={form.howWeAreDifferent}
              onChange={(e) => handleInputChange('howWeAreDifferent', e.target.value)}
              placeholder="Direct mentorship from startup founders&#10;Zero extra charge for specialization modules&#10;Comprehensive internship support from semester 4..."
              className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. Competitor College Comparison Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <span>⚖️</span> Competitor College Comparison Matrix
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Add competitor institutions (e.g. Prestige, Medicaps, Sage) to compare against RU.
            </p>
          </div>

          <CustomButton
            variant="secondary"
            onClick={handleOpenAddCompetitor}
            disabled={!infoPanel}
            className="text-xs px-3 py-1.5 font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg"
          >
            + Add Competitor College
          </CustomButton>
        </div>

        {infoPanel && Array.isArray(infoPanel.competitors) && infoPanel.competitors.length > 0 ? (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <th className="py-2.5 px-3">Order</th>
                  <th className="py-2.5 px-3">College Name</th>
                  <th className="py-2.5 px-3">Branches</th>
                  <th className="py-2.5 px-3">Fee / Year</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Hostel</th>
                  <th className="py-2.5 px-3">Avg Placement</th>
                  <th className="py-2.5 px-3">Highest Placement</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {infoPanel.competitors.map((comp, idx) => {
                  const branchesText = Array.isArray(comp.branches)
                    ? comp.branches.map(b => b.branchName).filter(Boolean).join(', ')
                    : '-';

                  return (
                    <tr key={comp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-gray-400">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveCompetitor(idx, -1)}
                            disabled={idx === 0}
                            className="p-0.5 hover:text-blue-600 disabled:opacity-30"
                            title="Move Up"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveCompetitor(idx, 1)}
                            disabled={idx === infoPanel.competitors.length - 1}
                            className="p-0.5 hover:text-blue-600 disabled:opacity-30"
                            title="Move Down"
                          >
                            ▼
                          </button>
                          <span>{idx + 1}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-gray-900">
                        {comp.collegeName}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600 max-w-[140px] truncate" title={branchesText}>
                        {branchesText}
                      </td>
                      <td className="py-2.5 px-3 text-gray-700 font-medium">
                        {comp.comparison?.courseFeePerYear || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600">
                        {comp.comparison?.duration || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600">
                        {comp.comparison?.hostel || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-gray-700 font-semibold">
                        {comp.comparison?.averagePlacements || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-700 font-bold">
                        {comp.comparison?.highestPlacement || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCompetitor(comp)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <span className="text-gray-300">·</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCompetitor(comp.id)}
                            className="text-xs font-semibold text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-gray-400 bg-slate-50 border border-dashed border-gray-200 rounded-lg">
            No competitor colleges configured yet for this course. Click &quot;+ Add Competitor College&quot; above.
          </div>
        )}
      </div>

      {/* 5. Competitor Add / Edit Modal */}
      {isCompetitorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h4 className="text-sm font-bold text-gray-900">
                {editingCompetitor ? 'Edit Competitor College' : 'Add Competitor College'}
              </h4>
              <button
                type="button"
                onClick={() => setIsCompetitorModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold w-6 h-6 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="font-semibold text-gray-700 mb-1 block">College Name *</label>
                <input
                  type="text"
                  value={competitorForm.collegeName}
                  onChange={(e) => setCompetitorForm(prev => ({ ...prev, collegeName: e.target.value }))}
                  placeholder="e.g. Prestige Institute of Management"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-gray-700 mb-1 block">
                  Branches / Campus Locations (Comma-separated)
                </label>
                <input
                  type="text"
                  value={competitorForm.branches}
                  onChange={(e) => setCompetitorForm(prev => ({ ...prev, branches: e.target.value }))}
                  placeholder="e.g. Indore, Bhopal, Gwalior"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 mb-1 block">Course Fee - Per Year</label>
                <input
                  type="text"
                  value={competitorForm.courseFeePerYear}
                  onChange={(e) => setCompetitorForm(prev => ({ ...prev, courseFeePerYear: e.target.value }))}
                  placeholder="e.g. ₹1,45,000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 mb-1 block">Duration</label>
                <input
                  type="text"
                  value={competitorForm.duration}
                  onChange={(e) => setCompetitorForm(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g. 3 Years"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 mb-1 block">Odds / Admission Criteria</label>
                <input
                  type="text"
                  value={competitorForm.odds}
                  onChange={(e) => setCompetitorForm(prev => ({ ...prev, odds: e.target.value }))}
                  placeholder="e.g. Entrance Test + Interview"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 mb-1 block">Eligibility</label>
                <input
                  type="text"
                  value={competitorForm.eligibility}
                  onChange={(e) => setCompetitorForm(prev => ({ ...prev, eligibility: e.target.value }))}
                  placeholder="e.g. 10+2 with min 50%"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 mb-1 block">Hostel Facility / Fee</label>
                <input
                  type="text"
                  value={competitorForm.hostel}
                  onChange={(e) => setCompetitorForm(prev => ({ ...prev, hostel: e.target.value }))}
                  placeholder="e.g. ₹95,000 / year"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 mb-1 block">Distance From City</label>
                <input
                  type="text"
                  value={competitorForm.distanceFromCity}
                  onChange={(e) => setCompetitorForm(prev => ({ ...prev, distanceFromCity: e.target.value }))}
                  placeholder="e.g. 18 km from city center"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 mb-1 block">Registration Fee</label>
                <input
                  type="text"
                  value={competitorForm.registrationFee}
                  onChange={(e) => setCompetitorForm(prev => ({ ...prev, registrationFee: e.target.value }))}
                  placeholder="e.g. ₹1,500"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 mb-1 block">Average Placements</label>
                <input
                  type="text"
                  value={competitorForm.averagePlacements}
                  onChange={(e) => setCompetitorForm(prev => ({ ...prev, averagePlacements: e.target.value }))}
                  placeholder="e.g. ₹4.2 LPA"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-gray-700 mb-1 block">Highest Placement</label>
                <input
                  type="text"
                  value={competitorForm.highestPlacement}
                  onChange={(e) => setCompetitorForm(prev => ({ ...prev, highestPlacement: e.target.value }))}
                  placeholder="e.g. ₹12.5 LPA"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsCompetitorModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-gray-600 hover:text-gray-800 font-semibold"
              >
                Cancel
              </button>
              <CustomButton
                variant="primary"
                onClick={handleSaveCompetitor}
                disabled={competitorSaving}
                className="text-xs px-4 py-2 font-semibold"
              >
                {competitorSaving ? 'Saving...' : editingCompetitor ? 'Update Competitor' : 'Add Competitor'}
              </CustomButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInfoPanelEditor;

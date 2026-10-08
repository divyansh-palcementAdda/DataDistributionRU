import { useState, useEffect, useRef } from 'react';
import { FiUploadCloud, FiX, FiFile, FiAlertCircle, FiDownload, FiCheck, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import CustomButton from '../CustomButton';
import {
  getCourseTypesDropdown,
  getProgramsDropdown,
  getGradesDropdown,
  getBoardsDropdown,
  getStreamsDropdown,
  getLeadSourcesDropdown,
  getLeadStatusesDropdown,
  getDepartmentsDropdown,
  getUsersDropdown
} from '../../../Services/drop-down/dropDownService';
import axiosInstance from '../../../axiosInstance/axios';

const LEAD_TARGET_FIELDS = [
  { key: 'fullName', label: 'Full Name / Name', aliases: ['full name', 'name', 'student name', 'candidate name', 'fullname', 'student', 'candidatename', 'studentname'] },
  { key: 'phoneNumber', label: 'Mobile / Phone Number', aliases: ['phone number', 'phone', 'mobile', 'mobile number', 'contact', 'contact number', 'contact no', 'phonenumber', 'mobilenumber', 'contactno'] },
  { key: 'alternatePhoneNumber', label: 'Alternate Phone Number', aliases: ['alternate phone number', 'alternate phone', 'alt phone', 'alternate mobile', 'alt mobile', 'altphone'] },
  { key: 'email', label: 'Email Address', aliases: ['email', 'email id', 'email address', 'mail', 'emailid'] },
  { key: 'course', label: 'Interested Course', aliases: ['interested course', 'course', 'course interested', 'course name', 'course code', 'courseinterested', 'interestedcourse'] },
  { key: 'program', label: 'Program / School', aliases: ['program', 'school', 'faculty', 'institute', 'program name', 'program code', 'programs'] },
  { key: 'courseType', label: 'Course Type (UG/PG)', aliases: ['course type', 'coursetype', 'type of course', 'degree type', 'course_type'] },
  { key: 'leadSource', label: 'Lead Source', aliases: ['lead source', 'source', 'leadsource', 'source name', 'lead_source'] },
  { key: 'sourceDetails', label: 'Source Details', aliases: ['source details', 'sourcedetails', 'source note', 'campaign', 'event', 'source_details'] },
  { key: 'board', label: 'Board', aliases: ['board', 'education board', 'board name'] },
  { key: 'grade', label: 'Grade / Class', aliases: ['grade', 'class', 'standard', 'grade name'] },
  { key: 'stream', label: 'Stream', aliases: ['stream', 'stream name', 'discipline'] },
  { key: 'department', label: 'Department', aliases: ['department', 'dept', 'department name', 'dept name'] },
  { key: 'city', label: 'City', aliases: ['city', 'town'] },
  { key: 'state', label: 'State', aliases: ['state', 'province'] },
  { key: 'country', label: 'Country', aliases: ['country', 'nation'] },
  { key: 'remarks', label: 'Remarks / Notes', aliases: ['remarks', 'remark', 'notes', 'note', 'comment', 'comments'] },
];

/**
 * BulkUploadModal
 * Props:
 *   isOpen   {boolean}  - controls visibility
 *   onClose  {function} - called when modal should close
 *   onSuccess {function} - called after successful upload (optional)
 */
const BulkUploadModal = ({ isOpen, onClose, onSuccess }) => {
  /* ── file state ── */
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  /* ── column mapping state ── */
  const [detectedHeaders, setDetectedHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [isMappingExpanded, setIsMappingExpanded] = useState(true);

  /* ── filter dropdowns ── */
  const [filters, setFilters] = useState({
    programId: '',
    courseTypeId: '',
    streamId: '',
    gradeId: '',
    boardId: '',
    leadSourceId: '',
    statusId: '',
    departmentId: '',
    assignedToUserId: '',
  });

  /* ── data lists ── */
  const [programs, setPrograms] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);
  const [streams, setStreams] = useState([]);
  const [grades, setGrades] = useState([]);
  const [boards, setBoards] = useState([]);
  const [leadSources, setLeadSources] = useState([]);
  const [leadStatuses, setLeadStatuses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  /* ── ui state ── */
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [error, setError] = useState('');

  /* ── fetch master data when modal opens ── */
  useEffect(() => {
    if (!isOpen) return;
    resetState();
    fetchMasterData();
  }, [isOpen]);

  const resetState = () => {
    setFile(null);
    setDetectedHeaders([]);
    setColumnMapping({});
    setIsMappingExpanded(true);
    setError('');
    setFilters({
      programId: '',
      courseTypeId: '',
      streamId: '',
      gradeId: '',
      boardId: '',
      leadSourceId: '',
      statusId: '',
      departmentId: '',
      assignedToUserId: '',
    });
  };

  const fetchMasterData = async () => {
    setDataLoading(true);
    try {
      const [progRes, ctRes, streamRes, gradeRes, boardRes, lsRes, lsStatusRes, deptRes, userRes] = await Promise.allSettled([
        getProgramsDropdown(),
        getCourseTypesDropdown(),
        getStreamsDropdown(),
        getGradesDropdown(),
        getBoardsDropdown(),
        getLeadSourcesDropdown(),
        getLeadStatusesDropdown(),
        getDepartmentsDropdown(),
        getUsersDropdown(),
      ]);

      /* programs */
      if (progRes.status === 'fulfilled') {
        const d = progRes.value;
        setPrograms(d?.data || []);
      }

      /* course types */
      if (ctRes.status === 'fulfilled') {
        const d = ctRes.value;
        setCourseTypes(d?.data || []);
      }

      /* streams */
      if (streamRes.status === 'fulfilled') {
        const d = streamRes.value;
        setStreams(d?.data || []);
      }

      /* grades */
      if (gradeRes.status === 'fulfilled') {
        const d = gradeRes.value;
        setGrades(d?.data || []);
      }

      /* boards */
      if (boardRes.status === 'fulfilled') {
        const d = boardRes.value;
        setBoards(d?.data || []);
      }

      /* lead sources */
      if (lsRes.status === 'fulfilled') {
        const d = lsRes.value;
        setLeadSources(d?.data || []);
      }

      /* lead statuses */
      if (lsStatusRes.status === 'fulfilled') {
        const d = lsStatusRes.value;
        setLeadStatuses(d?.data || []);
      }

      /* departments */
      if (deptRes.status === 'fulfilled') {
        const d = deptRes.value;
        setDepartments(d?.data || []);
      }

      /* users */
      if (userRes.status === 'fulfilled') {
        const d = userRes.value;
        setUsers(d?.data || []);
      }
    } catch (err) {
      console.error('Failed to load master data', err);
    } finally {
      setDataLoading(false);
    }
  };

  /* ── file helpers ── */
  const parseFileHeaders = (fileObj) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) return;
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        if (!rows || rows.length === 0) {
          setDetectedHeaders([]);
          setColumnMapping({});
          return;
        }
        const rawHeaders = (rows[0] || [])
          .map((h) => String(h || '').trim())
          .filter(Boolean);
        setDetectedHeaders(rawHeaders);

        // Auto match headers based on field definitions and aliases
        const initialMap = {};
        rawHeaders.forEach((col) => {
          const norm = col.toLowerCase().replace(/[^a-z0-9]/g, '');
          const matched = LEAD_TARGET_FIELDS.find((field) => {
            const normKey = field.key.toLowerCase().replace(/[^a-z0-9]/g, '');
            const normLabel = field.label.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (norm === normKey || norm === normLabel) return true;
            return field.aliases.some((alias) => alias.toLowerCase().replace(/[^a-z0-9]/g, '') === norm);
          });
          initialMap[col] = matched ? matched.key : '';
        });
        setColumnMapping(initialMap);
      } catch (err) {
        console.warn('Failed to parse Excel file headers for preview', err);
      }
    };
    reader.readAsArrayBuffer(fileObj);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) validateAndSetFile(selected);
  };

  const validateAndSetFile = (f) => {
    const allowed = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!allowed.includes(f.type) && !f.name.match(/\.(xlsx|xls)$/i)) {
      setError('Only Excel files (.xlsx, .xls) are accepted.');
      return;
    }
    setError('');
    setFile(f);
    parseFileHeaders(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) validateAndSetFile(dropped);
  };

  /* ── submit ── */
  const handleUpload = async () => {
    if (!file) {
      setError('Please select an Excel file to upload.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      /* Build column mapping JSON array */
      const mappingArray = Object.entries(columnMapping)
        .filter(([_, targetField]) => Boolean(targetField))
        .map(([excelColumn, targetField]) => ({
          excelColumn,
          targetField,
        }));

      /* Dev-mode structured logging: LEAD BULK MAPPING */
      if (import.meta.env?.DEV) {
        console.group('LEAD BULK MAPPING');
        mappingArray.forEach((m) => {
          console.log(`Excel Column: ${m.excelColumn}\nTarget Field: ${m.targetField}\n`);
        });
        console.groupEnd();
      }

      if (mappingArray.length > 0) {
        formData.append('mapping', JSON.stringify(mappingArray));
      }

      /* build query params – only include filled ones */
      const params = {};
      if (filters.programId)        params.programId        = filters.programId;
      if (filters.courseTypeId)     params.courseTypeId     = filters.courseTypeId;
      if (filters.streamId)         params.streamId         = filters.streamId;
      if (filters.gradeId)          params.gradeId          = filters.gradeId;
      if (filters.boardId)          params.boardId          = filters.boardId;
      if (filters.leadSourceId)     params.leadSourceId     = filters.leadSourceId;
      if (filters.statusId)         params.statusId         = filters.statusId;
      if (filters.departmentId)     params.departmentId     = filters.departmentId;
      if (filters.assignedToUserId) params.assignedToUserId = filters.assignedToUserId;

      /* Dev-mode end-to-end trace for Course Type (spec §21) */
      if (import.meta.env?.DEV) {
        console.group('IMPORT_START — Master-Data Filters');
        console.log('COURSE_TYPE_TRACE');
        console.log('  selectedCourseTypeId (filters.courseTypeId):', filters.courseTypeId || 'null');
        console.log('  params.courseTypeId sent to API            :', params.courseTypeId || 'null (not included in request)');
        console.log('  programId  :', params.programId || 'null');
        console.log('  streamId   :', params.streamId || 'null');
        console.log('  gradeId    :', params.gradeId || 'null');
        console.log('  boardId    :', params.boardId || 'null');
        console.log('  statusId   :', params.statusId || 'null');
        console.log('  departmentId:', params.departmentId || 'null');
        console.log('  assignedTo :', params.assignedToUserId || 'null');
        console.groupEnd();
      }

      const response = await axiosInstance.post('/api/leads/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        params,
      });

      onSuccess?.(response?.data?.message);
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Bulk upload failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── download template ── */
  const handleDownloadTemplate = async () => {
    setTemplateLoading(true);
    try {
      const response = await axiosInstance.get('/api/leads/bulk-upload/template', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads-bulk-upload-template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download template. Please try again.');
    } finally {
      setTemplateLoading(false);
    }
  };

  if (!isOpen) return null;
  const SelectField = ({ label, value, onChange, options, placeholder, valueKey = 'id', labelKey = 'name' }) => (
    <div className="form-group">
      <label className="form-label" style={{ fontWeight: 600, color: 'var(--gray-700)', fontSize: 12 }}>
        {label}
        <span style={{ marginLeft: 4, fontSize: 10, color: 'var(--gray-400)', fontWeight: 400 }}>(optional)</span>
      </label>
      <select
        className="form-control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ fontSize: 13 }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt[valueKey]} value={opt[valueKey]}>
            {opt[labelKey] || opt.name || opt.fullName || `${opt.firstName || ''} ${opt.lastName || ''}`.trim() || opt.username}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="modal-overlay open">
      <div
        className="modal"
        style={{ maxWidth: 560, width: '95%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* ── Header ── */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--primary-light, #e8f5e9)',
              }}
            >
              <FiUploadCloud size={16} style={{ color: 'var(--primary, #22c55e)' }} />
            </span>
            <div>
              <div className="modal-title" style={{ lineHeight: 1.2 }}>Bulk Upload Leads</div>
              <p style={{ fontSize: 11, color: 'var(--gray-400)', margin: 0, fontWeight: 400 }}>
                Upload an Excel file with optional master-data filters
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CustomButton
              variant="secondary"
              onClick={handleDownloadTemplate}
              disabled={loading || templateLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '5px 10px' }}
            >
              {templateLoading ? (
                <svg
                  width="13" height="13" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ animation: 'spin 0.8s linear infinite' }}
                >
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
              ) : (
                <FiDownload size={13} />
              )}
              {templateLoading ? 'Downloading…' : 'Download Template'}
            </CustomButton>
            <CustomButton variant="ghost" className="btn-icon" onClick={onClose} disabled={loading}>
              <FiX size={16} />
            </CustomButton>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>

          {/* File drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? 'var(--primary, #22c55e)' : file ? 'var(--primary, #22c55e)' : 'var(--gray-300, #d1d5db)'}`,
              borderRadius: 10,
              padding: '20px 16px',
              textAlign: 'center',
              cursor: file ? 'default' : 'pointer',
              background: isDragging
                ? 'var(--primary-light, #f0fdf4)'
                : file
                ? 'var(--primary-light, #f0fdf4)'
                : 'var(--gray-50, #f9fafb)',
              transition: 'all 0.2s',
              marginBottom: 16,
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {file ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 36, height: 36, borderRadius: 8,
                    background: 'var(--primary, #22c55e)', flexShrink: 0,
                  }}
                >
                  <FiFile size={18} color="#fff" />
                </span>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>
                    {file.name}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--gray-500)' }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setDetectedHeaders([]);
                    setColumnMapping({});
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  style={{
                    marginLeft: 'auto', background: 'none', border: 'none',
                    cursor: 'pointer', color: 'var(--gray-400)', padding: 4,
                    display: 'flex', alignItems: 'center',
                  }}
                  title="Remove file"
                >
                  <FiX size={16} />
                </button>
              </div>
            ) : (
              <>
                <FiUploadCloud size={28} style={{ color: 'var(--gray-400)', marginBottom: 6 }} />
                <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>
                  Drag & drop your Excel file here
                </p>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--gray-400)' }}>
                  or <span style={{ color: 'var(--primary, #22c55e)', fontWeight: 600 }}>browse</span> — .xlsx / .xls only
                </p>
              </>
            )}
          </div>

          {/* Error banner */}
          {error && (
            <div
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                padding: '10px 12px', borderRadius: 8, marginBottom: 14,
                background: '#fef2f2', border: '1px solid #fecaca',
              }}
            >
              <FiAlertCircle size={15} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 12, color: '#dc2626' }}>{error}</span>
            </div>
          )}

          {/* Column Mapping Section */}
          {file && detectedHeaders.length > 0 && (
            <div
              style={{
                marginBottom: 16,
                border: '1px solid var(--gray-200, #e5e7eb)',
                borderRadius: 8,
                overflow: 'hidden',
                background: '#fff',
              }}
            >
              <div
                onClick={() => setIsMappingExpanded(!isMappingExpanded)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'var(--gray-50, #f9fafb)',
                  cursor: 'pointer',
                  userSelect: 'none',
                  borderBottom: isMappingExpanded ? '1px solid var(--gray-200, #e5e7eb)' : 'none',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--gray-700)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Column Mapping
                  </span>
                  <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--gray-500)' }}>
                    ({detectedHeaders.length} Excel column{detectedHeaders.length > 1 ? 's' : ''} detected)
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--primary, #16a34a)',
                      fontWeight: 600,
                      background: '#f0fdf4',
                      padding: '2px 8px',
                      borderRadius: 12,
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    {Object.values(columnMapping).filter(Boolean).length} mapped
                  </span>
                  {isMappingExpanded ? (
                    <FiChevronUp size={16} color="var(--gray-500)" />
                  ) : (
                    <FiChevronDown size={16} color="var(--gray-500)" />
                  )}
                </div>
              </div>

              {isMappingExpanded && (
                <div style={{ padding: '12px 14px', maxHeight: 220, overflowY: 'auto' }}>
                  <p style={{ margin: '0 0 10px', fontSize: 11, color: 'var(--gray-500)', lineHeight: 1.4 }}>
                    Select how each Excel column maps to Lead fields. All fields are optional. Leave unmapped or blank to skip.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {detectedHeaders.map((header) => {
                      const mappedField = columnMapping[header] || '';
                      return (
                        <div
                          key={header}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 10,
                            padding: '6px 10px',
                            background: mappedField ? '#fafafa' : '#fff',
                            border: `1px solid ${mappedField ? 'var(--primary, #22c55e)' : 'var(--gray-200, #e5e7eb)'}`,
                            borderRadius: 6,
                            transition: 'border-color 0.2s',
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: 'var(--gray-800)',
                                wordBreak: 'break-word',
                              }}
                            >
                              {header}
                            </span>
                          </div>
                          <span style={{ color: 'var(--gray-400)', fontSize: 12, flexShrink: 0 }}>→</span>
                          <div style={{ width: '55%' }}>
                            <select
                              className="form-control"
                              value={mappedField}
                              onChange={(e) =>
                                setColumnMapping((prev) => ({
                                  ...prev,
                                  [header]: e.target.value,
                                }))
                              }
                              style={{
                                fontSize: 12,
                                padding: '4px 8px',
                                height: 32,
                                borderColor: mappedField ? 'var(--primary, #22c55e)' : 'var(--gray-300)',
                              }}
                            >
                              <option value="">— Skip / Do not map —</option>
                              {LEAD_TARGET_FIELDS.map((f) => (
                                <option key={f.key} value={f.key}>
                                  {f.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section label */}
          <div style={{ marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Master-data filters
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--gray-400)' }}>
              All fields are optional — leave blank to skip
            </p>
          </div>

          {dataLoading ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--gray-400)', fontSize: 13 }}>
              Loading options…
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 14px' }}>

              {/* Program */}
              <SelectField
                label="Program"
                placeholder="— Program / School —"
                value={filters.programId}
                onChange={(v) => setFilters((p) => ({ ...p, programId: v }))}
                options={programs}
                labelKey="name"
              />

              {/* Course Type */}
              <SelectField
                label="Course Type"
                placeholder="— Course Type —"
                value={filters.courseTypeId}
                onChange={(v) => setFilters((p) => ({ ...p, courseTypeId: v }))}
                options={courseTypes}
                labelKey="name"
              />

              {/* Board */}
              <SelectField
                label="Board"
                placeholder="— Board —"
                value={filters.boardId}
                onChange={(v) => setFilters((p) => ({ ...p, boardId: v }))}
                options={boards}
                labelKey="name"
              />

              {/* Stream */}
              <SelectField
                label="Stream"
                placeholder="— Stream —"
                value={filters.streamId}
                onChange={(v) => setFilters((p) => ({ ...p, streamId: v }))}
                options={streams}
                labelKey="name"
              />

              {/* Grade */}
              <SelectField
                label="Grade"
                placeholder="— Grade —"
                value={filters.gradeId}
                onChange={(v) => setFilters((p) => ({ ...p, gradeId: v }))}
                options={grades}
                labelKey="name"
              />

              {/* Lead Source (single) */}
              <SelectField
                label="Lead Source"
                placeholder="— Lead Source —"
                value={filters.leadSourceId}
                onChange={(v) => setFilters((p) => ({ ...p, leadSourceId: v }))}
                options={leadSources}
                labelKey="name"
              />

              {/* Status */}
              <SelectField
                label="Lead Status"
                placeholder="— Status —"
                value={filters.statusId}
                onChange={(v) => setFilters((p) => ({ ...p, statusId: v }))}
                options={leadStatuses}
                labelKey="name"
              />

              {/* Department */}
              <SelectField
                label="Department"
                placeholder="— Department —"
                value={filters.departmentId}
                onChange={(v) => setFilters((p) => ({ ...p, departmentId: v }))}
                options={departments}
                labelKey="name"
              />

              {/* Assigned To User — full width */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--gray-700)', fontSize: 12 }}>
                  Assign To
                  <span style={{ marginLeft: 4, fontSize: 10, color: 'var(--gray-400)', fontWeight: 400 }}>(optional)</span>
                </label>
                <select
                  className="form-control"
                  value={filters.assignedToUserId}
                  onChange={(e) => setFilters((p) => ({ ...p, assignedToUserId: e.target.value }))}
                  style={{ fontSize: 13 }}
                >
                  <option value="">— Select User —</option>
                  {users.map((u) => (
                    <option key={u.id || u.userId} value={u.id || u.userId}>
                      {u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="modal-footer">
          <CustomButton variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </CustomButton>
          <CustomButton variant="primary" onClick={handleUpload} disabled={loading || !file}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg
                  width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ animation: 'spin 0.8s linear infinite' }}
                >
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                Uploading…
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiUploadCloud size={14} />
                Upload
              </span>
            )}
          </CustomButton>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default BulkUploadModal;

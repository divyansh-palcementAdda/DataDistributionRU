import { useState, useEffect, useRef } from 'react';
import { FiUploadCloud, FiX, FiFile, FiAlertCircle, FiDownload } from 'react-icons/fi';
import CustomButton from '../CustomButton';
import { getAllCourseType } from '../../../Services/courseTypes/courseTypeService';
import { getAllCourses } from '../../../Services/course/course';
import gradsService from '../../../Services/Grads/gradsService';
import { getAllBoards } from '../../../Services/Boards/boardsService';
import { getAllLeadSource } from '../../../Services/leadsource/leadSourceService';
import { getAllLeadStatus } from '../../../Services/leadStatus/leadStatusService';
import { getAllDepartments } from '../../../Services/department/departmentService';
import { getAllUser } from '../../../Services/user/user';
import axiosInstance from '../../../axiosInstance/axios';

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

  /* ── filter dropdowns ── */
  const [filters, setFilters] = useState({
    courseTypeId: '',
    gradeId: '',
    boardId: '',
    leadSourceId: '',
    statusId: '',
    departmentId: '',
    assignedToUserId: '',
  });

  /* ── data lists ── */
  const [courseTypes, setCourseTypes] = useState([]);
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
    setError('');
    setFilters({
      courseTypeId: '',
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
      const [ctRes, gradeRes, boardRes, lsRes, lsStatusRes, deptRes, userRes] = await Promise.allSettled([
        getAllCourseType({ size: 100 }),
        gradsService.getAllGrades({ size: 100 }),
        getAllBoards({ size: 100 }),
        getAllLeadSource({ size: 100 }),
        getAllLeadStatus({ size: 100 }),
        getAllDepartments({ size: 100 }),
        getAllUser({ size: 100 }),
      ]);

      /* course types */
      if (ctRes.status === 'fulfilled') {
        const d = ctRes.value;
        setCourseTypes(d?.data?.content || d?.content || []);
      }

      /* grades */
      if (gradeRes.status === 'fulfilled') {
        const d = gradeRes.value;
        setGrades(d?.data?.content || d?.content || []);
      }

      /* boards */
      if (boardRes.status === 'fulfilled') {
        const d = boardRes.value;
        setBoards(d?.data?.content || d?.content || []);
      }

      /* lead sources */
      if (lsRes.status === 'fulfilled') {
        const d = lsRes.value;
        setLeadSources(d?.data?.data?.content || d?.data?.content || d?.content || []);
      }

      /* lead statuses */
      if (lsStatusRes.status === 'fulfilled') {
        const d = lsStatusRes.value;
        setLeadStatuses(d?.data?.content || d?.content || []);
      }

      /* departments */
      if (deptRes.status === 'fulfilled') {
        const d = deptRes.value;
        setDepartments(d?.data?.content || d?.content || []);
      }

      /* users */
      if (userRes.status === 'fulfilled') {
        const d = userRes.value;
        setUsers(d?.data?.data?.content || d?.data?.content || []);
      }
    } catch (err) {
      console.error('Failed to load master data', err);
    } finally {
      setDataLoading(false);
    }
  };

  /* ── file helpers ── */
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

      /* build query params – only include filled ones */
      const params = {};
      if (filters.courseTypeId)    params.courseTypeId      = filters.courseTypeId;
      if (filters.gradeId)         params.gradeId           = filters.gradeId;
      if (filters.boardId)         params.boardId           = filters.boardId;
      if (filters.leadSourceId)    params.leadSourceId      = filters.leadSourceId;
      if (filters.statusId)        params.statusId          = filters.statusId;
      if (filters.departmentId)    params.departmentId      = filters.departmentId;
      if (filters.assignedToUserId) params.assignedToUserId = filters.assignedToUserId;

      await axiosInstance.post('/api/leads/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        params,
      });

      onSuccess?.();
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
            {opt[labelKey] || opt.courseName || opt.firstName + ' ' + (opt.lastName || '')}
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
                  onClick={(e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
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

              {/* Course Type */}
              <SelectField
                label="Course Type"
                placeholder="— Course Type —"
                value={filters.courseTypeId}
                onChange={(v) => setFilters((p) => ({ ...p, courseTypeId: v }))}
                options={courseTypes}
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

              {/* Board */}
              <SelectField
                label="Board"
                placeholder="— Board —"
                value={filters.boardId}
                onChange={(v) => setFilters((p) => ({ ...p, boardId: v }))}
                options={boards}
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
                      {u.firstName} {u.lastName || ''}
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

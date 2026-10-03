import React, { useState, useRef } from 'react';
import {
  FiUploadCloud,
  FiX,
  FiFile,
  FiAlertCircle,
  FiCheckCircle,
  FiDownload,
  FiRefreshCw,
  FiInfo,
  FiLayers
} from 'react-icons/fi';
import CustomButton from '../CustomButton';
import {
  downloadInfoPanelTemplate,
  validateInfoPanelBulkUpload,
  bulkUploadInfoPanel,
  downloadInfoPanelErrorFile
} from '../../../Services/infoPanel/infoPanelService';

/**
 * CourseInfoPanelBulkUploadModal
 * 
 * Production-ready bulk upload dialog for Course Info Panel and Competitor Comparisons.
 * Supports:
 * - Predefined multi-sheet Excel template download
 * - Pre-import validation & error detection
 * - Live interactive preview summary (Total, Valid, Errors, New vs Updates)
 * - Row-level error list and downloadable Error Sheet with original data
 * - Safe import execution with real-time feedback
 * - Dynamic RBAC compliance
 */
const CourseInfoPanelBulkUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // States: 'select' | 'validating' | 'preview' | 'importing' | 'completed'
  const [step, setStep] = useState('select');
  const [errorMsg, setErrorMsg] = useState('');
  const [templateLoading, setTemplateLoading] = useState(false);
  const [downloadingErrors, setDownloadingErrors] = useState(false);

  // Preview & Result data
  const [previewData, setPreviewData] = useState(null);
  const [resultData, setResultData] = useState(null);

  if (!isOpen) return null;

  const resetModal = () => {
    setFile(null);
    setStep('select');
    setErrorMsg('');
    setPreviewData(null);
    setResultData(null);
  };

  const handleClose = () => {
    if (step === 'validating' || step === 'importing') return;
    resetModal();
    onClose();
  };

  const validateAndSetFile = (selected) => {
    setErrorMsg('');
    const ext = selected.name.toLowerCase();
    if (!ext.endsWith('.xlsx') && !ext.endsWith('.xls')) {
      setErrorMsg('Invalid file format. Please upload an Excel file (.xlsx or .xls).');
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 10 MB limit.');
      return;
    }
    setFile(selected);
    setStep('select');
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) validateAndSetFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const selected = e.dataTransfer.files?.[0];
    if (selected) validateAndSetFile(selected);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Download official Excel template from backend
  const handleDownloadTemplate = async () => {
    setTemplateLoading(true);
    try {
      await downloadInfoPanelTemplate();
    } catch (err) {
      setErrorMsg(typeof err === 'string' ? err : err?.message || 'Failed to download official template');
    } finally {
      setTemplateLoading(false);
    }
  };

  // Download error sheet for current importId
  const handleDownloadErrorFile = async (importId) => {
    if (!importId) return;
    setDownloadingErrors(true);
    try {
      await downloadInfoPanelErrorFile(importId);
    } catch (err) {
      setErrorMsg(typeof err === 'string' ? err : err?.message || 'Failed to download error sheet');
    } finally {
      setDownloadingErrors(false);
    }
  };

  // Step: Validate file
  const handleValidate = async () => {
    if (!file) return;
    setStep('validating');
    setErrorMsg('');
    try {
      const res = await validateInfoPanelBulkUpload(file);
      const data = res?.data || res;
      setPreviewData(data);
      setStep('preview');
    } catch (err) {
      setErrorMsg(typeof err === 'string' ? err : err?.message || 'Validation failed. Please check the Excel format.');
      setStep('select');
    }
  };

  // Step: Confirm and execute import
  const handleConfirmImport = async () => {
    if (!file) return;
    setStep('importing');
    setErrorMsg('');
    try {
      const res = await bulkUploadInfoPanel(file);
      const data = res?.data || res;
      setResultData(data);
      setStep('completed');
    } catch (err) {
      setErrorMsg(typeof err === 'string' ? err : err?.message || 'Import execution failed. Please check your data.');
      setStep('preview');
    }
  };

  const handleFinish = () => {
    handleClose();
    if (onSuccess) onSuccess();
  };

  return (
    <div
      className="modal-overlay open"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="modal-container"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* ── Modal Header ── */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to right, #f8fafc, #f1f5f9)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)'
              }}
            >
              <FiLayers size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                Bulk Upload Course Info Panel
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                Import Renaissance University course data & competitor comparisons by Course Name
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={step === 'validating' || step === 'importing'}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s'
            }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* ── Modal Body ── */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>

          {/* Global Error Banner */}
          {errorMsg && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                marginBottom: '20px',
                color: '#b91c1c',
                fontSize: '13px'
              }}
            >
              <FiAlertCircle size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '2px' }}>Upload Notice</strong>
                {errorMsg}
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────
              STEP 1: Select File & Download Template
             ──────────────────────────────────────────────────────── */}
          {step === 'select' && (
            <div>
              {/* Template Download Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #eff6ff, #f8fafc)',
                  border: '1px solid #bfdbfe',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  marginBottom: '22px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      backgroundColor: '#dbeafe',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <FiDownload size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1e3a8a' }}>
                      Official Course Info Panel Template
                    </h4>
                    <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#475569' }}>
                      Pre-formatted with <strong>Sheet 1: Course Info</strong>, <strong>Sheet 2: Other Colleges</strong>, and instructions
                    </p>
                  </div>
                </div>

                <CustomButton
                  variant="primary"
                  onClick={handleDownloadTemplate}
                  disabled={templateLoading}
                  style={{
                    fontSize: '13px',
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <FiDownload size={14} />
                  {templateLoading ? 'Downloading…' : 'Download Template'}
                </CustomButton>
              </div>

              {/* Upload Drag & Drop Box */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                style={{
                  border: isDragging ? '2px dashed #2563eb' : '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  backgroundColor: isDragging ? '#eff6ff' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '18px'
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: isDragging ? '#dbeafe' : '#f1f5f9',
                    color: isDragging ? '#2563eb' : '#64748b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px'
                  }}
                >
                  <FiUploadCloud size={28} />
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
                  Click to browse or drag and drop your completed Excel file
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  Supported formats: <strong>.xlsx, .xls</strong> (Max file size: 10 MB)
                </p>
              </div>

              {/* Selected File Card */}
              {file && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '6px',
                        backgroundColor: '#e2e8f0',
                        color: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FiFile size={18} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                        {file.name}
                      </p>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <FiX size={18} />
                  </button>
                </div>
              )}

              {/* Info Note */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  marginTop: '16px',
                  fontSize: '12px',
                  color: '#64748b',
                  backgroundColor: '#f8fafc',
                  padding: '10px 14px',
                  borderRadius: '8px'
                }}
              >
                <FiInfo size={16} style={{ marginTop: '1px', flexShrink: 0, color: '#3b82f6' }} />
                <span>
                  <strong>Tip:</strong> You will be shown a full preview summary and validation check of your data before anything is saved to the database.
                </span>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────
              STEP: Validating Loading State
             ──────────────────────────────────────────────────────── */}
          {step === 'validating' && (
            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
              <div
                style={{
                  display: 'inline-block',
                  width: '46px',
                  height: '46px',
                  border: '3px solid #e2e8f0',
                  borderTopColor: '#2563eb',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  marginBottom: '16px'
                }}
              />
              <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>
                Validating Excel Workbook…
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Checking course names, academic sessions, competitors, and duplicate rows against master records.
              </p>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────
              STEP 2: Preview Summary & Errors
             ──────────────────────────────────────────────────────── */}
          {step === 'preview' && previewData && (
            <div>
              {/* Stat Cards Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '12px',
                  marginBottom: '20px'
                }}
              >
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Rows</span>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                    {previewData.totalRows || 0}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#166534', textTransform: 'uppercase' }}>Valid Rows</span>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#15803d', marginTop: '4px' }}>
                    {previewData.validRows || 0}
                  </div>
                </div>

                <div style={{ backgroundColor: previewData.errorRows > 0 ? '#fef2f2' : '#f8fafc', border: previewData.errorRows > 0 ? '1px solid #fecaca' : '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: previewData.errorRows > 0 ? '#b91c1c' : '#64748b', textTransform: 'uppercase' }}>Errors</span>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: previewData.errorRows > 0 ? '#dc2626' : '#64748b', marginTop: '4px' }}>
                    {previewData.errorRows || 0}
                  </div>
                </div>

                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#1e40af', textTransform: 'uppercase' }}>New Records</span>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#2563eb', marginTop: '4px' }}>
                    {previewData.newRecords || 0}
                  </div>
                </div>

                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#92400e', textTransform: 'uppercase' }}>To Update</span>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#d97706', marginTop: '4px' }}>
                    {previewData.recordsToUpdate || 0}
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              {previewData.errorRows === 0 ? (
                <div
                  style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '10px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '20px',
                    color: '#15803d',
                    fontSize: '13px'
                  }}
                >
                  <FiCheckCircle size={20} />
                  <span>
                    <strong>All {previewData.validRows} rows are valid!</strong> Ready to import into Course Info Panel and Competitor records.
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: '#fff7ed',
                    border: '1px solid #fed7aa',
                    borderRadius: '10px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    marginBottom: '20px',
                    color: '#9a3412',
                    fontSize: '13px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FiAlertCircle size={20} style={{ color: '#ea580c' }} />
                    <span>
                      Found <strong>{previewData.errorRows} errors</strong>. Valid rows ({previewData.validRows}) can still be imported, or you can download the error sheet to fix and re-upload.
                    </span>
                  </div>

                  {previewData.errorFileAvailable && (
                    <button
                      onClick={() => handleDownloadErrorFile(previewData.importId)}
                      disabled={downloadingErrors}
                      style={{
                        padding: '6px 14px',
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <FiDownload size={13} />
                      {downloadingErrors ? 'Downloading…' : 'Download Error Sheet'}
                    </button>
                  )}
                </div>
              )}

              {/* Errors List Table (if errors exist) */}
              {previewData.errors && previewData.errors.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Row Validation Errors ({previewData.errors.length})
                  </h4>
                  <div
                    style={{
                      maxHeight: '220px',
                      overflowY: 'auto',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  >
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                      <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0 }}>
                        <tr>
                          <th style={{ padding: '8px 12px', color: '#475569', fontWeight: 600 }}>Sheet</th>
                          <th style={{ padding: '8px 12px', color: '#475569', fontWeight: 600 }}>Row</th>
                          <th style={{ padding: '8px 12px', color: '#475569', fontWeight: 600 }}>Course</th>
                          <th style={{ padding: '8px 12px', color: '#475569', fontWeight: 600 }}>College</th>
                          <th style={{ padding: '8px 12px', color: '#475569', fontWeight: 600 }}>Error Code</th>
                          <th style={{ padding: '8px 12px', color: '#475569', fontWeight: 600 }}>Message</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.errors.map((err, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                            <td style={{ padding: '8px 12px', color: '#334155' }}>{err.sheetName}</td>
                            <td style={{ padding: '8px 12px', color: '#334155', fontWeight: 600 }}>{err.rowNumber}</td>
                            <td style={{ padding: '8px 12px', color: '#334155' }}>{err.courseName || '-'}</td>
                            <td style={{ padding: '8px 12px', color: '#334155' }}>{err.collegeName || '-'}</td>
                            <td style={{ padding: '8px 12px' }}>
                              <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                                {err.errorCode}
                              </span>
                            </td>
                            <td style={{ padding: '8px 12px', color: '#b91c1c' }}>{err.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ────────────────────────────────────────────────────────
              STEP: Importing Progress State
             ──────────────────────────────────────────────────────── */}
          {step === 'importing' && (
            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
              <div
                style={{
                  display: 'inline-block',
                  width: '46px',
                  height: '46px',
                  border: '3px solid #e2e8f0',
                  borderTopColor: '#16a34a',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  marginBottom: '16px'
                }}
              />
              <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>
                Executing Safe Batch Import…
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Creating missing records and updating matched course info panels and competitor comparisons.
              </p>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────
              STEP 3: Import Result Summary
             ──────────────────────────────────────────────────────── */}
          {step === 'completed' && resultData && (
            <div>
              <div
                style={{
                  textAlign: 'center',
                  padding: '20px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px'
                  }}
                >
                  <FiCheckCircle size={30} />
                </div>
                <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#166534' }}>
                  Import Completed Successfully!
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#15803d' }}>
                  {resultData.message || 'The Course Info Panel and competitor comparisons have been updated.'}
                </p>
              </div>

              {/* Summary Stats Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '12px',
                  marginBottom: '20px'
                }}
              >
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Processed</span>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                    {resultData.totalRows || 0}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#166534', textTransform: 'uppercase' }}>Imported</span>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#15803d', marginTop: '4px' }}>
                    {resultData.successfulRows || 0}
                  </div>
                </div>

                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#1e40af', textTransform: 'uppercase' }}>Created Panels</span>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#2563eb', marginTop: '4px' }}>
                    {resultData.createdRecords || 0}
                  </div>
                </div>

                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#92400e', textTransform: 'uppercase' }}>Updated Panels</span>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#d97706', marginTop: '4px' }}>
                    {resultData.updatedRecords || 0}
                  </div>
                </div>

                <div style={{ backgroundColor: resultData.failedRows > 0 ? '#fef2f2' : '#f8fafc', border: resultData.failedRows > 0 ? '1px solid #fecaca' : '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: resultData.failedRows > 0 ? '#b91c1c' : '#64748b', textTransform: 'uppercase' }}>Skipped</span>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: resultData.failedRows > 0 ? '#dc2626' : '#64748b', marginTop: '4px' }}>
                    {resultData.failedRows || 0}
                  </div>
                </div>
              </div>

              {resultData.errorFileAvailable && (
                <div
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '10px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <span style={{ fontSize: '13px', color: '#b91c1c' }}>
                    Some rows could not be imported. Download the error report to inspect details.
                  </span>
                  <button
                    onClick={() => handleDownloadErrorFile(resultData.importId)}
                    disabled={downloadingErrors}
                    style={{
                      padding: '6px 14px',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FiDownload size={13} />
                    {downloadingErrors ? 'Downloading…' : 'Download Error Sheet'}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* ── Modal Footer ── */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px'
          }}
        >
          {step === 'select' && (
            <>
              <CustomButton variant="secondary" onClick={handleClose}>
                Cancel
              </CustomButton>
              <CustomButton
                variant="primary"
                onClick={handleValidate}
                disabled={!file}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FiRefreshCw size={14} />
                Validate Workbook
              </CustomButton>
            </>
          )}

          {step === 'preview' && (
            <>
              <CustomButton
                variant="secondary"
                onClick={() => setStep('select')}
              >
                Back / Choose Another File
              </CustomButton>
              <CustomButton
                variant="primary"
                onClick={handleConfirmImport}
                disabled={!previewData || previewData.validRows === 0}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FiUploadCloud size={15} />
                Confirm Import ({previewData?.validRows || 0} valid rows)
              </CustomButton>
            </>
          )}

          {step === 'completed' && (
            <CustomButton variant="primary" onClick={handleFinish} style={{ minWidth: '100px' }}>
              Done
            </CustomButton>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CourseInfoPanelBulkUploadModal;

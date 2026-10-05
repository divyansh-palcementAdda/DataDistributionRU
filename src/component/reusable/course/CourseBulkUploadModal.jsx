import React, { useState, useRef } from 'react';
import {
  FiUploadCloud,
  FiX,
  FiFile,
  FiAlertCircle,
  FiCheckCircle,
  FiDownload,
  FiRefreshCw,
  FiLayers,
  FiCheck,
  FiPlusCircle,
  FiEdit3
} from 'react-icons/fi';
import CustomButton from '../CustomButton';
import {
  downloadCourseTemplate,
  validateCourseBulkUpload,
  bulkUploadCourses,
  downloadCourseErrorFile
} from '../../../Services/course/course';

const CourseBulkUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Steps: 'select' | 'validating' | 'preview' | 'importing' | 'completed'
  const [step, setStep] = useState('select');
  const [errorMsg, setErrorMsg] = useState('');
  const [templateLoading, setTemplateLoading] = useState(false);
  const [downloadingErrors, setDownloadingErrors] = useState(false);

  // Data states
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

  const handleDownloadTemplate = async () => {
    try {
      setTemplateLoading(true);
      await downloadCourseTemplate();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to download course bulk upload template.');
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!file) return;
    try {
      setStep('validating');
      setErrorMsg('');
      const res = await validateCourseBulkUpload(file);
      const data = res?.data || res;
      setPreviewData(data);
      setStep('preview');
    } catch (err) {
      setErrorMsg(err.message || 'Validation failed. Please ensure the Excel file matches the required template.');
      setStep('select');
    }
  };

  const handleExecuteImport = async () => {
    if (!file) return;
    try {
      setStep('importing');
      setErrorMsg('');
      const res = await bulkUploadCourses(file);
      const data = res?.data || res;
      setResultData(data);
      setStep('completed');
    } catch (err) {
      setErrorMsg(err.message || 'Bulk upload failed. Please review errors and try again.');
      setStep('preview');
    }
  };

  const handleDownloadErrorSheet = async (importId) => {
    if (!importId) return;
    try {
      setDownloadingErrors(true);
      await downloadCourseErrorFile(importId);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to download error sheet.');
    } finally {
      setDownloadingErrors(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20">
              <FiLayers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bulk Upload Courses</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Import or update university courses in bulk using an Excel spreadsheet
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={step === 'validating' || step === 'importing'}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {errorMsg && (
            <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 animate-shake">
              <FiAlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
              <div className="text-sm font-medium flex-1">{errorMsg}</div>
              <button onClick={() => setErrorMsg('')} className="text-red-400 hover:text-red-600">
                <FiX className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 1: Select File */}
          {(step === 'select' || step === 'validating') && (
            <div className="space-y-6">
              {/* Template Download Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <FiDownload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Download Excel Template</h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Use the official course template with predefined headers and sample entries.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  disabled={templateLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 font-medium text-xs rounded-xl shadow-xs hover:shadow transition-all disabled:opacity-50"
                >
                  {templateLoading ? (
                    <>
                      <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <FiDownload className="w-3.5 h-3.5" />
                      Download Template (.xlsx)
                    </>
                  )}
                </button>
              </div>

              {/* Drag & Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/60 scale-[1.01]'
                    : file
                    ? 'border-emerald-400 bg-emerald-50/30'
                    : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {file ? (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 shadow-inner">
                      <FiFile className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(file.size / 1024).toFixed(1)} KB • Ready to validate
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="mt-3 text-xs text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1"
                    >
                      <FiX className="w-3.5 h-3.5" /> Remove File
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                      <FiUploadCloud className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      Drag and drop your course Excel sheet here
                    </p>
                    <p className="text-xs text-gray-500 mt-1">or click to browse from your computer</p>
                    <span className="mt-3 inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[11px] font-medium">
                      Supports .xlsx, .xls (up to 10 MB)
                    </span>
                  </div>
                )}
              </div>

              {/* Instructions Pill */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-xs text-gray-600 space-y-1.5">
                <div className="font-semibold text-gray-800 flex items-center gap-1.5 mb-1">
                  <FiCheck className="text-blue-600" /> Key Features & Guidelines:
                </div>
                <p>• Mandatory columns: <strong>Course Name</strong>, <strong>Course Code</strong>, <strong>Course Type</strong>, <strong>Duration</strong>, <strong>Fees</strong>.</p>
                <p>• Existing courses matching the code or name will be updated; new courses will be created.</p>
                <p>• If a Course Type doesn&apos;t exist yet, it will be automatically created with active status.</p>
              </div>
            </div>
          )}

          {/* STEP 2: Preview Dashboard */}
          {(step === 'preview' || step === 'importing') && previewData && (
            <div className="space-y-6">
              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-center">
                  <span className="text-xs font-medium text-gray-500">Total Rows</span>
                  <div className="text-xl font-bold text-gray-900 mt-1">{previewData.totalRows}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                  <span className="text-xs font-medium text-emerald-700">Valid Courses</span>
                  <div className="text-xl font-bold text-emerald-800 mt-1">{previewData.validRows}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-center">
                  <span className="text-xs font-medium text-blue-700">New Courses</span>
                  <div className="text-xl font-bold text-blue-800 mt-1 flex items-center justify-center gap-1">
                    <FiPlusCircle className="w-4 h-4" />
                    {previewData.newCourses || 0}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-100 text-center">
                  <span className="text-xs font-medium text-purple-700">Updates</span>
                  <div className="text-xl font-bold text-purple-800 mt-1 flex items-center justify-center gap-1">
                    <FiEdit3 className="w-4 h-4" />
                    {previewData.updateCourses || 0}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-center">
                  <span className="text-xs font-medium text-red-700">Errors</span>
                  <div className="text-xl font-bold text-red-800 mt-1">{previewData.errorRows}</div>
                </div>
              </div>

              {/* Error Notice & Download Error Sheet */}
              {previewData.errorRows > 0 && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-amber-800 text-xs">
                    <FiAlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      Found <strong>{previewData.errorRows} row(s)</strong> with errors. Invalid rows will be skipped during import.
                    </span>
                  </div>
                  {previewData.errorFileAvailable && (
                    <button
                      type="button"
                      onClick={() => handleDownloadErrorSheet(previewData.importId)}
                      disabled={downloadingErrors}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-xs shadow-xs transition-colors disabled:opacity-50"
                    >
                      <FiDownload className="w-3.5 h-3.5" />
                      {downloadingErrors ? 'Downloading...' : 'Download Error Sheet'}
                    </button>
                  )}
                </div>
              )}

              {/* Preview Table */}
              {previewData.rows && previewData.rows.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 font-semibold text-xs text-gray-700">
                    Courses to Import ({previewData.rows.length})
                  </div>
                  <div className="max-h-60 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-gray-100 text-gray-600 sticky top-0">
                        <tr>
                          <th className="py-2 px-3">#</th>
                          <th className="py-2 px-3">Course Name</th>
                          <th className="py-2 px-3">Code</th>
                          <th className="py-2 px-3">Type</th>
                          <th className="py-2 px-3">Duration</th>
                          <th className="py-2 px-3">Fees</th>
                          <th className="py-2 px-3">Status</th>
                          <th className="py-2 px-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {previewData.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="py-2 px-3 text-gray-400">{row.rowNumber}</td>
                            <td className="py-2 px-3 font-medium text-gray-900">{row.courseName}</td>
                            <td className="py-2 px-3 font-mono text-gray-600">{row.courseCode}</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium text-[11px]">
                                {row.courseTypeName}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-gray-600">{row.duration} {row.durationUnit}</td>
                            <td className="py-2 px-3 text-gray-900 font-medium">₹{row.fees?.toLocaleString()}</td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                row.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                              }`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              {row.isUpdate ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                                  <FiEdit3 className="w-3 h-3" /> Update
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                  <FiPlusCircle className="w-3 h-3" /> New
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Error Rows Table if any */}
              {previewData.errors && previewData.errors.length > 0 && (
                <div className="border border-red-200 rounded-xl overflow-hidden bg-red-50/20">
                  <div className="bg-red-100/50 px-4 py-2 border-b border-red-200 font-semibold text-xs text-red-800">
                    Row Validation Errors ({previewData.errors.length})
                  </div>
                  <div className="max-h-40 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-red-50 text-red-700 sticky top-0">
                        <tr>
                          <th className="py-2 px-3">Row</th>
                          <th className="py-2 px-3">Course / Code</th>
                          <th className="py-2 px-3">Error Code</th>
                          <th className="py-2 px-3">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-100 text-red-900">
                        {previewData.errors.map((err, idx) => (
                          <tr key={idx} className="hover:bg-red-50/60">
                            <td className="py-1.5 px-3 font-semibold">{err.rowNumber}</td>
                            <td className="py-1.5 px-3">{err.courseName || err.courseCode || '-'}</td>
                            <td className="py-1.5 px-3 font-mono text-[11px] text-red-700">{err.errorCode}</td>
                            <td className="py-1.5 px-3">{err.errorMessage}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Completed Screen */}
          {step === 'completed' && resultData && (
            <div className="py-8 flex flex-col items-center text-center space-y-4 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <FiCheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Bulk Upload Successful!</h3>
              <p className="text-sm text-gray-500 max-w-md">
                Course records have been saved into the university course catalog.
              </p>

              {/* Results Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg mt-4">
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <span className="text-xs text-gray-500">Total Rows</span>
                  <div className="text-lg font-bold text-gray-800">{resultData.totalRows}</div>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <span className="text-xs text-emerald-700">Created</span>
                  <div className="text-lg font-bold text-emerald-800">{resultData.createdRecords || 0}</div>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
                  <span className="text-xs text-purple-700">Updated</span>
                  <div className="text-lg font-bold text-purple-800">{resultData.updatedRecords || 0}</div>
                </div>
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                  <span className="text-xs text-red-700">Failed</span>
                  <div className="text-lg font-bold text-red-800">{resultData.failedRows || 0}</div>
                </div>
              </div>

              {resultData.errorFileAvailable && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadErrorSheet(resultData.importId)}
                    disabled={downloadingErrors}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold shadow-xs transition-colors"
                  >
                    <FiDownload className="w-4 h-4 text-amber-600" />
                    {downloadingErrors ? 'Downloading...' : 'Download Error Report'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          {step === 'select' && (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <CustomButton
                variant="primary"
                onClick={handleValidate}
                disabled={!file}
                className="text-sm py-2 px-5 shadow-sm"
              >
                Validate & Preview
              </CustomButton>
            </>
          )}

          {step === 'validating' && (
            <div className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 font-medium py-1">
              <FiRefreshCw className="w-4 h-4 animate-spin" />
              Validating Excel spreadsheet...
            </div>
          )}

          {step === 'preview' && (
            <>
              <button
                type="button"
                onClick={() => setStep('select')}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                ← Back / Re-upload
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <CustomButton
                  variant="primary"
                  onClick={handleExecuteImport}
                  disabled={!previewData?.canImport}
                  className="text-sm py-2 px-5 shadow-sm bg-blue-600 hover:bg-blue-700"
                >
                  Import {previewData?.validRows || 0} Course(s)
                </CustomButton>
              </div>
            </>
          )}

          {step === 'importing' && (
            <div className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 font-medium py-1">
              <FiRefreshCw className="w-4 h-4 animate-spin" />
              Importing courses into database...
            </div>
          )}

          {step === 'completed' && (
            <div className="w-full flex justify-end">
              <CustomButton
                variant="primary"
                onClick={() => {
                  handleClose();
                  if (onSuccess) onSuccess();
                }}
                className="text-sm py-2 px-6 shadow-sm"
              >
                Done
              </CustomButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseBulkUploadModal;

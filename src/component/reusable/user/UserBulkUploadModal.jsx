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
  FiUserPlus,
  FiShield
} from 'react-icons/fi';
import CustomButton from '../CustomButton';
import {
  downloadUserTemplate,
  validateUserBulkUpload,
  bulkUploadUsers,
  downloadUserErrorFile
} from '../../../Services/user/user';

const UserBulkUploadModal = ({ isOpen, onClose, onSuccess }) => {
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
      await downloadUserTemplate();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to download user bulk upload template.');
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!file) {
      setErrorMsg('Please select an Excel file to validate.');
      return;
    }
    setErrorMsg('');
    setStep('validating');
    try {
      const res = await validateUserBulkUpload(file);
      const data = res?.data || res;
      setPreviewData(data);
      setStep('preview');
    } catch (err) {
      setStep('select');
      setErrorMsg(err.message || err.error || 'Failed to validate Excel file.');
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setErrorMsg('');
    setStep('importing');
    try {
      const res = await bulkUploadUsers(file);
      const data = res?.data || res;
      setResultData(data);
      setStep('completed');
    } catch (err) {
      setStep('preview');
      setErrorMsg(err.message || err.error || 'Failed to execute bulk user import.');
    }
  };

  const handleDownloadErrors = async (importId) => {
    if (!importId) return;
    try {
      setDownloadingErrors(true);
      await downloadUserErrorFile(importId);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to download error report.');
    } finally {
      setDownloadingErrors(false);
    }
  };

  const handleFinish = () => {
    resetModal();
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-800 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
              <FiUserPlus className="text-xl" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Bulk Upload Users</h2>
              <p className="text-xs text-indigo-100/90 mt-0.5">
                Import user accounts and automatically map them to departments by Department Name
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={step === 'validating' || step === 'importing'}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Step Progress Pills */}
        <div className="px-6 py-2.5 bg-gray-50 border-b border-gray-200/80 flex items-center justify-between text-xs font-semibold text-gray-500">
          <div className={`flex items-center gap-1.5 ${step === 'select' ? 'text-indigo-600 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'select' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1</span>
            Select File
          </div>
          <div className="h-0.5 w-8 bg-gray-200" />
          <div className={`flex items-center gap-1.5 ${step === 'validating' || step === 'preview' ? 'text-indigo-600 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'preview' || step === 'validating' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</span>
            Validation & Preview
          </div>
          <div className="h-0.5 w-8 bg-gray-200" />
          <div className={`flex items-center gap-1.5 ${step === 'completed' ? 'text-emerald-600 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'completed' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}>3</span>
            Completed
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Global Error Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs">
              <FiAlertCircle className="text-base shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 font-medium">{errorMsg}</div>
              <button onClick={() => setErrorMsg('')} className="text-rose-500 hover:text-rose-700">
                <FiX />
              </button>
            </div>
          )}

          {/* STEP 1: SELECT FILE */}
          {step === 'select' && (
            <div className="space-y-4">
              {/* Template Download Card */}
              <div className="p-4 bg-gradient-to-r from-indigo-50/70 to-purple-50/70 border border-indigo-100 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-lg border border-indigo-100 shadow-xs text-indigo-600">
                    <FiLayers className="text-xl" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Official User Excel Template</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Download pre-formatted Excel template with instructions and department name mapping column.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  disabled={templateLoading}
                  className="px-3 py-1.5 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-700 font-semibold text-xs shadow-xs hover:shadow transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  <FiDownload className={`text-xs ${templateLoading ? 'animate-bounce' : ''}`} />
                  {templateLoading ? 'Downloading...' : 'Download Template'}
                </button>
              </div>

              {/* Drag and Drop Box */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${isDragging
                    ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
                    : file
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-gray-300 hover:border-indigo-400 bg-gray-50/50 hover:bg-gray-50'
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className={`p-3.5 rounded-full ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {file ? <FiFile className="text-2xl" /> : <FiUploadCloud className="text-2xl" />}
                  </div>

                  {file ? (
                    <div>
                      <p className="text-xs font-bold text-gray-800">{file.name}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {(file.size / 1024).toFixed(1)} KB • Click or drop to replace
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-gray-800">
                        Drop your User Excel file here, or <span className="text-indigo-600 underline">browse</span>
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Supports standard Excel workbooks (.xlsx, .xls) up to 10 MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Department Name Notice Banner */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-blue-950 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-blue-800">
                  <FiShield className="text-xs shrink-0" />
                  Department Mapping by Name Only:
                </div>
                <p className="text-[11px] text-blue-900/90 leading-relaxed">
                  Enter the exact <strong>Department Name</strong> configured in Department Management (e.g. <em>Computer Science & Engineering</em>).
                  Department IDs or UUIDs are <strong>not required</strong> and must not be used.
                  Departments are not auto-created; rows with unrecognized department names will be rejected.
                </p>
              </div>
            </div>
          )}

          {/* STEP: VALIDATING */}
          {step === 'validating' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <FiRefreshCw className="text-3xl text-indigo-600 animate-spin" />
              <div className="text-center">
                <h3 className="text-sm font-bold text-gray-800">Validating User Accounts & Department Mappings...</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Checking emails, usernames, system roles, and matching department names against database.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW */}
          {step === 'preview' && previewData && (
            <div className="space-y-4">
              {/* Summary KPIs */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase">Total Rows</span>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">{previewData.totalRows}</p>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase">Valid Rows</span>
                  <p className="text-lg font-bold text-emerald-700 mt-0.5">{previewData.validRows}</p>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <span className="text-[11px] font-semibold text-rose-700 uppercase">Error Rows</span>
                  <p className="text-lg font-bold text-rose-700 mt-0.5">{previewData.errorRows}</p>
                </div>
              </div>

              {/* Error Notice & Download Error Sheet */}
              {previewData.errorRows > 0 && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-rose-800 text-xs">
                    <FiAlertCircle className="text-base shrink-0 text-rose-600" />
                    <span>
                      <strong>{previewData.errorRows} row(s)</strong> have validation errors and will be skipped.
                    </span>
                  </div>
                  {previewData.errorFileAvailable && (
                    <button
                      type="button"
                      onClick={() => handleDownloadErrors(previewData.importId)}
                      disabled={downloadingErrors}
                      className="px-2.5 py-1 bg-white hover:bg-rose-50 border border-rose-300 rounded-lg text-rose-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs shrink-0"
                    >
                      <FiDownload className="text-xs" />
                      {downloadingErrors ? 'Downloading...' : 'Download Error Sheet'}
                    </button>
                  )}
                </div>
              )}

              {/* Row Errors Table */}
              {previewData.errors && previewData.errors.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-700 flex justify-between">
                    <span>Validation Issues ({previewData.errors.length})</span>
                    <span className="text-gray-400 font-normal">Issues details</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 text-xs">
                    {previewData.errors.map((err, idx) => (
                      <div key={idx} className="p-2.5 hover:bg-rose-50/30 flex items-start justify-between gap-2">
                        <div>
                          <span className="inline-block px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px] mr-1.5">
                            Row {err.rowNumber}
                          </span>
                          <strong className="text-gray-800">{err.name || err.email || err.username || 'Row'}</strong>
                          {err.field && <span className="text-gray-500"> ({err.field})</span>}
                          <p className="text-rose-600 text-[11px] mt-0.5">{err.errorMessage}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono shrink-0">{err.errorCode}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Valid Rows Preview Table */}
              {previewData.rows && previewData.rows.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-700 flex justify-between">
                    <span>Ready for Import ({previewData.rows.length})</span>
                    <span className="text-emerald-600 font-semibold">User & department mappings</span>
                  </div>
                  <div className="max-h-44 overflow-y-auto divide-y divide-gray-100 text-xs">
                    {previewData.rows.map((r, idx) => (
                      <div key={idx} className="p-2.5 hover:bg-indigo-50/20 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 font-mono text-[11px] w-6">#{r.rowNumber}</span>
                          <div>
                            <span className="font-semibold text-gray-900">{r.firstName} {r.lastName}</span>
                            <span className="text-gray-500 text-[11px] ml-1.5">({r.email})</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-[10px] font-semibold">
                            {r.roleName}
                          </span>
                          {r.departmentName && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-semibold">
                              {r.departmentName}
                            </span>
                          )}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${r.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            {r.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP: IMPORTING */}
          {step === 'importing' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <FiRefreshCw className="text-3xl text-emerald-600 animate-spin" />
              <div className="text-center">
                <h3 className="text-sm font-bold text-gray-800">Creating User Accounts & Mapping Departments...</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Persisting credentials, hashing passwords, and linking users to department entities.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: COMPLETED */}
          {step === 'completed' && resultData && (
            <div className="space-y-4 py-3">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                  <FiCheckCircle className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">Bulk User Import Completed!</h3>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    {resultData.message || 'User records have been created and mapped to departments.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase">Total Rows</span>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">{resultData.totalRows}</p>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase">Created Users</span>
                  <p className="text-lg font-bold text-emerald-700 mt-0.5">{resultData.createdRecords}</p>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <span className="text-[11px] font-semibold text-rose-700 uppercase">Failed Rows</span>
                  <p className="text-lg font-bold text-rose-700 mt-0.5">{resultData.failedRows}</p>
                </div>
              </div>

              {resultData.importId && (
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                  <span className="font-semibold text-slate-500">Import ID:</span>
                  <span className="font-mono font-medium text-slate-900 select-all">{resultData.importId}</span>
                </div>
              )}

              {resultData.failedRows > 0 && resultData.errorFileAvailable && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-rose-800 text-xs">
                    <FiAlertCircle className="text-base shrink-0 text-rose-600" />
                    <span>Download error report containing rows that failed validation.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadErrors(resultData.importId)}
                    disabled={downloadingErrors}
                    className="px-2.5 py-1.5 bg-white hover:bg-rose-50 border border-rose-300 rounded-lg text-rose-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                  >
                    <FiDownload className="text-xs" />
                    {downloadingErrors ? 'Downloading...' : 'Download Error Sheet'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div>
            {step === 'preview' && (
              <button
                type="button"
                onClick={() => setStep('select')}
                className="text-xs text-gray-600 hover:text-gray-900 font-semibold"
              >
                ← Back / Choose another file
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step === 'select' && (
              <>
                <CustomButton variant="ghost" onClick={handleClose}>
                  Cancel
                </CustomButton>
                <CustomButton
                  variant="primary"
                  onClick={handleValidate}
                  disabled={!file}
                  className="shadow-sm"
                >
                  Validate & Preview
                </CustomButton>
              </>
            )}

            {step === 'preview' && (
              <>
                <CustomButton variant="ghost" onClick={handleClose}>
                  Cancel
                </CustomButton>
                <CustomButton
                  variant="primary"
                  onClick={handleImport}
                  disabled={!previewData?.canImport}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5"
                >
                  <FiCheck className="text-sm" />
                  Import {previewData?.validRows || 0} User(s)
                </CustomButton>
              </>
            )}

            {step === 'completed' && (
              <CustomButton variant="primary" onClick={handleFinish} className="shadow-sm">
                Done
              </CustomButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBulkUploadModal;

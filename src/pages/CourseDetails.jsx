import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { getCourseById } from '../Services/course/course';
import {
    getCourseImages,
    uploadCourseImage,
    updateCourseImage,
    deleteCourseImage,
} from '../Services/imageManagement/imageService';
import {
    getCourseTemplatesByCourseId,
    createCourseTemplate,
    updateCourseTemplate,
    deleteCourseTemplate,
} from '../Services/templateManagement/template';
import {
    addUsp,
    getUsps,
    updateUsp,
    deleteUsp,
} from '../Services/USP-Management/uspService';
import {
    getCommunicationConfig,
    updateCommunicationConfig,
} from '../Services/Communication-Management/CommunicationService';
import CustomButton from '../component/reusable/CustomButton';
import CustomInput from '../component/reusable/CustomInput';
import ReusableTable from '../component/reusable/table';
import DeleteModal from '../component/reusable/deleteModel';

// ─── Upload / Edit Image Modal ─────────────────────────────────────────────────
const ImageModal = ({ isOpen, onClose, onSuccess, courseId, editData = null }) => {
    const fileInputRef = useRef(null);
    const [form, setForm] = useState({ displayName: '', displayOrder: '', active: true });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const isEdit = Boolean(editData);

    useEffect(() => {
        if (isOpen) {
            if (isEdit) {
                setForm({
                    displayName: editData.displayName || '',
                    displayOrder: editData.displayOrder ?? '',
                    active: editData.active ?? true,
                });
                // Prepend base URL if relative path
                const base = (import.meta.env.VITE_BASE_URL || '').replace(/^"+|"+$/g, '').replace(/\/$/, '');
                const url = editData.imageUrl || null;
                if (url) {
                    setPreview(url.startsWith('http') ? url : `${base}${url}`);
                } else {
                    setPreview(null);
                }
            } else {
                setForm({ displayName: '', displayOrder: '', active: true });
                setPreview(null);
            }
            setFile(null);
            setError('');
        }
    }, [isOpen, isEdit, editData]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;
        setFile(selected);
        setPreview(URL.createObjectURL(selected));
    };

    const handleSubmit = async () => {
        if (!isEdit && !file) { setError('Please select an image file.'); return; }
        setSaving(true);
        setError('');
        try {
            if (isEdit) {
                const res = await updateCourseImage(editData.id, {
                    displayName: form.displayName,
                    displayOrder: form.displayOrder !== '' ? Number(form.displayOrder) : undefined,
                    active: form.active,
                });
                if (res?.success !== false) { onSuccess(); onClose(); }
                else setError(res?.message || 'Update failed.');
            } else {
                const res = await uploadCourseImage(courseId, file, {
                    displayName: form.displayName,
                    displayOrder: form.displayOrder,
                });
                if (res?.success !== false) { onSuccess(); onClose(); }
                else setError(res?.message || 'Upload failed.');
            }
        } catch (err) {
            setError(typeof err === 'string' ? err : err?.message || 'Something went wrong.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay open z-[110]">
            <div className="modal relative z-[111]" style={{ maxWidth: '460px', width: '100%' }}>
                {/* Header */}
                <div className="modal-header border-b border-gray-100 pb-3 mb-3 flex items-center justify-between">
                    <span className="modal-title font-semibold text-gray-800">
                        {isEdit ? 'Edit Image' : 'Upload Image'}
                    </span>
                    <CustomButton variant="ghost" className="btn-icon" onClick={onClose} disabled={saving}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </CustomButton>
                </div>

                {/* Body */}
                <div className="modal-body py-2 flex flex-col gap-4">
                    {/* File picker — only for upload */}
                    {!isEdit && (
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Image File <span className="text-red-500">*</span></label>
                            <div
                                className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center cursor-pointer hover:border-blue-400 transition"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {preview ? (
                                    <img src={preview} alt="preview" className="mx-auto max-h-32 object-contain rounded-lg" />
                                ) : (
                                    <div className="text-gray-400 text-sm">
                                        <svg className="mx-auto mb-2" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                                            <polyline points="21 15 16 10 5 21" />
                                        </svg>
                                        Click to select an image
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </div>
                            {file && <p className="text-xs text-gray-500 mt-1">{file.name}</p>}
                        </div>
                    )}

                    {/* Edit: show existing image preview */}
                    {isEdit && preview && (
                        <div className="flex justify-center">
                            <img src={preview} alt="current" className="max-h-28 object-contain rounded-lg border border-gray-200" />
                        </div>
                    )}

                    <CustomInput
                        label="Display Name"
                        placeholder="Enter display name"
                        value={form.displayName}
                        onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
                    />

                    <CustomInput
                        label="Display Order"
                        type="number"
                        placeholder="e.g. 1"
                        value={form.displayOrder}
                        onChange={(e) => setForm((p) => ({ ...p, displayOrder: e.target.value }))}
                    />

                    {isEdit && (
                        <div className="flex items-center gap-2">
                            <input
                                id="img-active"
                                type="checkbox"
                                checked={form.active}
                                onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                                className="w-4 h-4 accent-blue-600"
                            />
                            <label htmlFor="img-active" className="text-sm font-semibold text-gray-700 select-none cursor-pointer">
                                Active
                            </label>
                        </div>
                    )}

                    {error && <p className="text-xs text-red-500">{error}</p>}
                </div>

                {/* Footer */}
                <div className="modal-footer pt-4 mt-2 border-t border-gray-100 flex justify-end gap-3">
                    <CustomButton variant="secondary" onClick={onClose} disabled={saving}>Cancel</CustomButton>
                    <CustomButton variant="primary" onClick={handleSubmit} disabled={saving}>
                        {saving ? (isEdit ? 'Saving…' : 'Uploading…') : (isEdit ? 'Save Changes' : 'Upload')}
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

// ─── Template Modal ────────────────────────────────────────────────────────────
const CHANNEL_OPTIONS = ['email', 'whatsapp', 'sms'];

const TemplateModal = ({ isOpen, onClose, onSuccess, courseId, editData = null }) => {
    const [form, setForm] = useState({
        name: '',
        subject: '',
        content: '',
        channel: 'email',
        active: true,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const isEdit = Boolean(editData);

    useEffect(() => {
        if (isOpen) {
            if (isEdit) {
                setForm({
                    name: editData.name || '',
                    subject: editData.subject || '',
                    content: editData.content || '',
                    channel: editData.channel || 'email',
                    active: editData.active ?? true,
                });
            } else {
                setForm({ name: '', subject: '', content: '', channel: 'email', active: true });
            }
            setError('');
        }
    }, [isOpen, isEdit, editData]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!form.name.trim()) { setError('Template name is required.'); return; }
        if (!form.content.trim()) { setError('Content is required.'); return; }
        setSaving(true);
        setError('');
        try {
            if (isEdit) {
                const res = await updateCourseTemplate(editData.id, {
                    name: form.name,
                    subject: form.subject,
                    content: form.content,
                    channel: form.channel,
                    active: form.active,
                    courseId,
                });
                if (res?.success !== false) { onSuccess(); onClose(); }
                else setError(res?.message || 'Update failed.');
            } else {
                const res = await createCourseTemplate({
                    name: form.name,
                    subject: form.subject,
                    content: form.content,
                    channel: form.channel,
                    courseId,
                    active: form.active,
                });
                if (res?.success !== false) { onSuccess(); onClose(); }
                else setError(res?.message || 'Create failed.');
            }
        } catch (err) {
            setError(typeof err === 'string' ? err : err?.message || 'Something went wrong.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay open z-[110]">
            <div className="modal relative z-[111]" style={{ maxWidth: '500px', width: '100%' }}>
                {/* Header */}
                <div className="modal-header border-b border-gray-100 pb-3 mb-3 flex items-center justify-between">
                    <span className="modal-title font-semibold text-gray-800">
                        {isEdit ? 'Edit Template' : 'Add Template'}
                    </span>
                    <CustomButton variant="ghost" className="btn-icon" onClick={onClose} disabled={saving}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </CustomButton>
                </div>

                {/* Body */}
                <div className="modal-body py-2 flex flex-col gap-4">
                    <CustomInput
                        label="Template Name"
                        placeholder="Enter template name"
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        required
                    />

                    {/* Channel */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                            Channel <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={form.channel}
                            onChange={(e) => setForm((p) => ({ ...p, channel: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white capitalize"
                        >
                            {CHANNEL_OPTIONS.map((ch) => (
                                <option key={ch} value={ch} className="capitalize">{ch.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    {/* Subject — only relevant for email */}
                    {form.channel === 'email' && (
                        <CustomInput
                            label="Subject"
                            placeholder="Enter email subject"
                            value={form.subject}
                            onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                        />
                    )}

                    {/* Content */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                            Content <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={5}
                            placeholder="Enter template content…"
                            value={form.content}
                            onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                        />
                    </div>

                    {/* Active toggle */}
                    <div className="flex items-center gap-2">
                        <input
                            id="tpl-active"
                            type="checkbox"
                            checked={form.active}
                            onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                            className="w-4 h-4 accent-blue-600"
                        />
                        <label htmlFor="tpl-active" className="text-sm font-semibold text-gray-700 select-none cursor-pointer">
                            Active
                        </label>
                    </div>

                    {error && <p className="text-xs text-red-500">{error}</p>}
                </div>

                {/* Footer */}
                <div className="modal-footer pt-4 mt-2 border-t border-gray-100 flex justify-end gap-3">
                    <CustomButton variant="secondary" onClick={onClose} disabled={saving}>Cancel</CustomButton>
                    <CustomButton variant="primary" onClick={handleSubmit} disabled={saving}>
                        {saving ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Create')}
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

// ─── USP Modal ────────────────────────────────────────────────────────────────
const UspModal = ({ isOpen, onClose, onSuccess, courseId, editData = null }) => {
    const [form, setForm] = useState({
        content: '',
        displayOrder: '',
        active: true,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const isEdit = Boolean(editData);

    useEffect(() => {
        if (isOpen) {
            if (isEdit) {
                setForm({
                    content: editData.content || '',
                    displayOrder: editData.displayOrder ?? '',
                    active: editData.active ?? true,
                });
            } else {
                setForm({ content: '', displayOrder: '', active: true });
            }
            setError('');
        }
    }, [isOpen, isEdit, editData]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!form.content.trim()) { setError('Content is required.'); return; }
        setSaving(true);
        setError('');
        try {
            if (isEdit) {
                const res = await updateUsp(editData.id, {
                    content: form.content,
                    displayOrder: form.displayOrder !== '' ? Number(form.displayOrder) : undefined,
                    active: form.active,
                });
                if (res?.success !== false) { onSuccess(); onClose(); }
                else setError(res?.message || 'Update failed.');
            } else {
                const res = await addUsp(courseId, {
                    content: form.content,
                    displayOrder: form.displayOrder !== '' ? Number(form.displayOrder) : undefined,
                    active: form.active,
                });
                if (res?.success !== false) { onSuccess(); onClose(); }
                else setError(res?.message || 'Create failed.');
            }
        } catch (err) {
            setError(typeof err === 'string' ? err : err?.message || 'Something went wrong.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay open z-[110]">
            <div className="modal relative z-[111]" style={{ maxWidth: '460px', width: '100%' }}>
                {/* Header */}
                <div className="modal-header border-b border-gray-100 pb-3 mb-3 flex items-center justify-between">
                    <span className="modal-title font-semibold text-gray-800">
                        {isEdit ? 'Edit USP' : 'Add USP'}
                    </span>
                    <CustomButton variant="ghost" className="btn-icon" onClick={onClose} disabled={saving}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </CustomButton>
                </div>

                {/* Body */}
                <div className="modal-body py-2 flex flex-col gap-4">
                    {/* Content */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                            Content <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            placeholder="Enter USP content…"
                            value={form.content}
                            onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                        />
                    </div>

                    <CustomInput
                        label="Display Order"
                        type="number"
                        placeholder="e.g. 1"
                        value={form.displayOrder}
                        onChange={(e) => setForm((p) => ({ ...p, displayOrder: e.target.value }))}
                    />

                    {/* Active toggle */}
                    <div className="flex items-center gap-2">
                        <input
                            id="usp-active"
                            type="checkbox"
                            checked={form.active}
                            onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                            className="w-4 h-4 accent-blue-600"
                        />
                        <label htmlFor="usp-active" className="text-sm font-semibold text-gray-700 select-none cursor-pointer">
                            Active
                        </label>
                    </div>

                    {error && <p className="text-xs text-red-500">{error}</p>}
                </div>

                {/* Footer */}
                <div className="modal-footer pt-4 mt-2 border-t border-gray-100 flex justify-end gap-3">
                    <CustomButton variant="secondary" onClick={onClose} disabled={saving}>Cancel</CustomButton>
                    <CustomButton variant="primary" onClick={handleSubmit} disabled={saving}>
                        {saving ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Create')}
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

// ─── Communication Management Tab ────────────────────────────────────────────
const COMM_CHANNELS = [
    { key: 'infoPanel', label: 'Info Panel' },
    { key: 'email',     label: 'Email' },
    { key: 'whatsapp',  label: 'WhatsApp' },
];

// Small helper: select box for templates / images
const SelectField = ({ label, value, onChange, options, placeholder = 'None', valueKey = 'id', labelKey }) => (
    <div>
        <label className="text-xs font-semibold text-gray-600 mb-1 block">{label}</label>
        <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value || null)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt[valueKey]} value={opt[valueKey]}>
                    {labelKey ? opt[labelKey] : opt[valueKey]}
                </option>
            ))}
        </select>
    </div>
);

const CommunicationTab = ({ courseId, templates, images }) => {
    const BASE_URL = (import.meta.env.VITE_BASE_URL || '').replace(/^"+|"+$/g, '').replace(/\/$/, '');

    const [config, setConfig]       = useState(null);
    const [loading, setLoading]     = useState(false);
    const [saving, setSaving]       = useState(false);
    const [error, setError]         = useState('');
    const [success, setSuccess]     = useState('');

    // Local selections: { infoPanel: { templateId, imageId }, email: {...}, whatsapp: {...} }
    const [selections, setSelections] = useState({
        infoPanel: { templateId: null, imageId: null },
        email:     { templateId: null, imageId: null },
        whatsapp:  { templateId: null, imageId: null },
    });

    // Fetch existing config
    const fetchConfig = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await getCommunicationConfig(courseId);
            const data = res?.data ?? res;
            setConfig(data);
            if (data) {
                setSelections({
                    infoPanel: {
                        templateId: data.infoPanelTemplateId ?? data.infoPanelTemplate?.id ?? null,
                        imageId:    data.infoPanelImageId    ?? data.infoPanelImage?.id    ?? null,
                    },
                    email: {
                        templateId: data.emailTemplateId ?? data.emailTemplate?.id ?? null,
                        imageId:    data.emailImageId    ?? data.emailImage?.id    ?? null,
                    },
                    whatsapp: {
                        templateId: data.whatsappTemplateId ?? data.whatsappTemplate?.id ?? null,
                        imageId:    data.whatsappImageId    ?? data.whatsappImage?.id    ?? null,
                    },
                });
            }
        } catch (err) {
            setError(err?.message || 'Failed to load communication config.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, [courseId]);

    const setChannel = (channel, field, val) =>
        setSelections((prev) => ({ ...prev, [channel]: { ...prev[channel], [field]: val } }));

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const payload = {
                ...(config?.id ? { id: config.id } : {}),
                courseId,
                infoPanelTemplateId: selections.infoPanel.templateId || null,
                infoPanelImageId:    selections.infoPanel.imageId    || null,
                emailTemplateId:     selections.email.templateId     || null,
                emailImageId:        selections.email.imageId        || null,
                whatsappTemplateId:  selections.whatsapp.templateId  || null,
                whatsappImageId:     selections.whatsapp.imageId     || null,
            };
            const res = await updateCommunicationConfig(courseId, payload);
            if (res?.success === false) {
                setError(res?.message || 'Failed to save.');
            } else {
                setSuccess('Communication config saved successfully.');
                // refresh
                const updated = res?.data ?? res;
                if (updated && typeof updated === 'object') setConfig(updated);
            }
        } catch (err) {
            setError(err?.message || 'Something went wrong.');
        } finally {
            setSaving(false);
        }
    };

    // Helpers to resolve the currently-selected template / image object for preview
    const getTemplate = (id) => templates.find((t) => t.id === id);
    const getImage    = (id) => {
        const img = images.find((i) => i.id === id);
        if (!img) return null;
        const url = img.imageUrl || '';
        return { ...img, resolvedUrl: url.startsWith('http') ? url : `${BASE_URL}${url}` };
    };

    // Filter templates by channel type where relevant
    const templatesForChannel = (channel) => {
        if (channel === 'infoPanel') return templates; // no channel filter for info panel
        return templates.filter((t) => !t.channel || t.channel === channel);
    };

    if (loading) return <div className="py-10 text-center text-gray-500 text-sm">Loading communication config…</div>;

    return (
        <div className="mt-6 max-w-5xl">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <h3 className="text-base font-bold text-gray-800">Communication Management</h3>
                <CustomButton
                    variant="primary"
                    className="text-xs px-3 py-1.5"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Saving…' : 'Save Config'}
                </CustomButton>
            </div>

            {error   && <p className="text-xs text-red-500 mb-3">{error}</p>}
            {success && <p className="text-xs text-green-600 mb-3">{success}</p>}

            {/* Channel cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {COMM_CHANNELS.map(({ key, label }) => {
                    const sel = selections[key];
                    const selectedTemplate = getTemplate(sel.templateId);
                    const selectedImage    = getImage(sel.imageId);

                    return (
                        <div key={key} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-4">
                            {/* Channel badge */}
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide
                                    ${key === 'email'     ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : key === 'whatsapp' ? 'bg-green-50 text-green-700 border-green-200'
                                    :                      'bg-purple-50 text-purple-700 border-purple-200'}`}>
                                    {label}
                                </span>
                            </div>

                            {/* Template selector */}
                            <SelectField
                                label="Template"
                                value={sel.templateId}
                                onChange={(val) => setChannel(key, 'templateId', val)}
                                options={templatesForChannel(key)}
                                placeholder="— Select template —"
                                labelKey="name"
                            />

                            {/* Template preview */}
                            {selectedTemplate && (
                                <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs text-gray-600 space-y-1">
                                    {selectedTemplate.subject && (
                                        <p><span className="font-semibold text-gray-700">Subject:</span> {selectedTemplate.subject}</p>
                                    )}
                                    <p className="line-clamp-3 whitespace-pre-wrap">{selectedTemplate.content}</p>
                                </div>
                            )}

                            {/* Image selector */}
                            <SelectField
                                label="Image"
                                value={sel.imageId}
                                onChange={(val) => setChannel(key, 'imageId', val)}
                                options={images}
                                placeholder="— Select image —"
                                labelKey="displayName"
                            />

                            {/* Image preview */}
                            {selectedImage && (
                                <div className="flex justify-center">
                                    <a href={selectedImage.resolvedUrl} target="_blank" rel="noreferrer">
                                        <img
                                            src={selectedImage.resolvedUrl}
                                            alt={selectedImage.displayName}
                                            className="max-h-24 object-contain rounded-lg border border-gray-200"
                                        />
                                    </a>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Current saved config summary */}
            {config && (
                <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Saved Configuration</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600">
                        {COMM_CHANNELS.map(({ key, label }) => {
                            const tplKey = `${key}Template`;
                            const imgKey = `${key}Image`;
                            const tpl = config[tplKey];
                            const img = config[imgKey];
                            return (
                                <div key={key} className="space-y-1">
                                    <p className="font-semibold text-gray-700">{label}</p>
                                    <p>Template: <span className="text-gray-500">{tpl?.name || '—'}</span></p>
                                    <p>Image: <span className="text-gray-500">{img?.displayName || '—'}</span></p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Main Component ─────────────────────────────────────────────────────────────
const CourseDetails = () => {
    const { navTo } = useAppContext();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(null);
    const { id } = useParams();

    // ─── Image Management state ─────────────────────────────────────────────
    const [images, setImages] = useState([]);
    const [imagesLoading, setImagesLoading] = useState(false);
    const [activeOnly, setActiveOnly] = useState(true);
    const [imageModal, setImageModal] = useState({ open: false, editData: null });
    const [deleteModal, setDeleteModal] = useState({ open: false, imageId: null });
    const [deleteLoading, setDeleteLoading] = useState(false);

    // ─── Template Management state ───────────────────────────────────────────
    const [templates, setTemplates] = useState([]);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [templateModal, setTemplateModal] = useState({ open: false, editData: null });
    const [templateDeleteModal, setTemplateDeleteModal] = useState({ open: false, templateId: null });
    const [templateDeleteLoading, setTemplateDeleteLoading] = useState(false);

    // ─── USP Management state ────────────────────────────────────────────────
    const [usps, setUsps] = useState([]);
    const [uspsLoading, setUspsLoading] = useState(false);
    const [uspActiveOnly, setUspActiveOnly] = useState(false);
    const [uspModal, setUspModal] = useState({ open: false, editData: null });
    const [uspDeleteModal, setUspDeleteModal] = useState({ open: false, uspId: null });
    const [uspDeleteLoading, setUspDeleteLoading] = useState(false);

    // ─── Tab config ─────────────────────────────────────────────────────────
    const tabs = [
        { key: 'image',         label: 'Image Management' },
        { key: 'template',      label: 'Template Management' },
        { key: 'usp',           label: 'USP Management' },
        { key: 'communication', label: 'Communication Management' },
    ];

    // ─── Image table columns ────────────────────────────────────────────────
    const BASE_URL = (import.meta.env.VITE_BASE_URL || '').replace(/^"+|"+$/g, '').replace(/\/$/, '');
    const getImageSrc = (url) => {
        if (!url) return null;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `${BASE_URL}${url}`;
    };

    const imageColumns = [
        {
            key: 'sno',
            header: 'S.No',
            render: (_val, _row, index) => index + 1,
        },
        { key: 'displayName',  header: 'Display Name' },
        {
            key: 'imageUrl',
            header: 'Image',
            render: (val) => {
                const src = getImageSrc(val);
                return src ? (
                    <a href={src} target="_blank" rel="noreferrer">
                        <img src={src} alt="course" className="w-12 h-10 object-cover rounded-lg border border-gray-200" />
                    </a>
                ) : '-';
            },
        },
        { key: 'displayOrder', header: 'Order' },
        {
            key: 'active',
            header: 'Status',
            render: (val) => (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${val ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {val ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'createdAt',
            header: 'Created At',
            render: (val) => (val ? new Date(val).toLocaleString() : '-'),
        },
    ];

    const templateColumns = [
        {
            key: 'sno',
            header: 'S.No',
            render: (_val, _row, index) => index + 1,
        },
        { key: 'name', header: 'Name' },
        {
            key: 'channel',
            header: 'Channel',
            render: (val) => (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase
                    ${val === 'email' ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : val === 'whatsapp' ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                    {val || '-'}
                </span>
            ),
        },
        { key: 'subject', header: 'Subject', render: (val) => val || '-' },
        {
            key: 'content',
            header: 'Content',
            render: (val) => val
                ? <span className="line-clamp-2 max-w-xs block text-gray-600">{val}</span>
                : '-',
        },
        {
            key: 'active',
            header: 'Status',
            render: (val) => (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${val ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {val ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'createdAt',
            header: 'Created At',
            render: (val) => (val ? new Date(val).toLocaleString() : '-'),
        },
    ];

    const uspColumns = [
        {
            key: 'sno',
            header: 'S.No',
            render: (_val, _row, index) => index + 1,
        },
        {
            key: 'content',
            header: 'Content',
            render: (val) => val
                ? <span className="line-clamp-2 max-w-sm block text-gray-600">{val}</span>
                : '-',
        },
        { key: 'displayOrder', header: 'Order', render: (val) => val ?? '-' },
        {
            key: 'active',
            header: 'Status',
            render: (val) => (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${val ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {val ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'createdAt',
            header: 'Created At',
            render: (val) => (val ? new Date(val).toLocaleString() : '-'),
        },
    ];

    // ─── Fetch course details ────────────────────────────────────────────────
    useEffect(() => {
        if (!id) return;
        const fetchCourseDetails = async () => {
            setLoading(true);
            try {
                const res = await getCourseById(id);
                if (res?.success) setDetails(res.data);
                else setError(res?.message || 'Failed to load course details');
            } catch (err) {
                console.error('Failed to fetch course details', err);
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };
        fetchCourseDetails();
    }, [id]);

    // ─── Fetch images when image tab is active ───────────────────────────────
    const fetchImages = async () => {
        if (!id) return;
        setImagesLoading(true);
        try {
            const res = await getCourseImages(id, activeOnly);
            // handle both array response and { data: [] } wrapper
            if (Array.isArray(res)) setImages(res);
            else if (Array.isArray(res?.data)) setImages(res.data);
            else setImages([]);
        } catch (err) {
            console.error('Failed to fetch images', err);
            setImages([]);
        } finally {
            setImagesLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'image') fetchImages();
    }, [activeTab, activeOnly]);

    // ─── Fetch templates when template tab is active ─────────────────────────
    const fetchTemplates = async () => {
        if (!id) return;
        setTemplatesLoading(true);
        try {
            const res = await getCourseTemplatesByCourseId(id);
            if (Array.isArray(res)) setTemplates(res);
            else if (Array.isArray(res?.data)) setTemplates(res.data);
            else setTemplates([]);
        } catch (err) {
            console.error('Failed to fetch templates', err);
            setTemplates([]);
        } finally {
            setTemplatesLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'template' || activeTab === 'communication') fetchTemplates();
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'communication') fetchImages();
    }, [activeTab]);

    // ─── Fetch USPs when usp tab is active ───────────────────────────────────
    const fetchUsps = async () => {
        if (!id) return;
        setUspsLoading(true);
        try {
            const res = await getUsps(id, uspActiveOnly);
            if (Array.isArray(res)) setUsps(res);
            else if (Array.isArray(res?.data)) setUsps(res.data);
            else setUsps([]);
        } catch (err) {
            console.error('Failed to fetch USPs', err);
            setUsps([]);
        } finally {
            setUspsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'usp') fetchUsps();
    }, [activeTab, uspActiveOnly]);

    // ─── Delete handler ──────────────────────────────────────────────────────
    // ─── Delete image handler ────────────────────────────────────────────────
    const handleDeleteImage = async () => {
        if (!deleteModal.imageId) return;
        setDeleteLoading(true);
        try {
            await deleteCourseImage(deleteModal.imageId);
            setDeleteModal({ open: false, imageId: null });
            fetchImages();
        } catch (err) {
            console.error('Delete failed', err);
        } finally {
            setDeleteLoading(false);
        }
    };

    // ─── Delete template handler ─────────────────────────────────────────────
    const handleDeleteTemplate = async () => {
        if (!templateDeleteModal.templateId) return;
        setTemplateDeleteLoading(true);
        try {
            await deleteCourseTemplate(templateDeleteModal.templateId);
            setTemplateDeleteModal({ open: false, templateId: null });
            fetchTemplates();
        } catch (err) {
            console.error('Template delete failed', err);
        } finally {
            setTemplateDeleteLoading(false);
        }
    };

    // ─── Delete USP handler ──────────────────────────────────────────────────
    const handleDeleteUsp = async () => {
        if (!uspDeleteModal.uspId) return;
        setUspDeleteLoading(true);
        try {
            await deleteUsp(uspDeleteModal.uspId);
            setUspDeleteModal({ open: false, uspId: null });
            fetchUsps();
        } catch (err) {
            console.error('USP delete failed', err);
        } finally {
            setUspDeleteLoading(false);
        }
    };

    const goBack = () => {
        navTo('courses');
    };

    return (
        <div className="block p-4 sm:p-6" id="page-course-detail">
            {/* Page Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3">
                    <button
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                        onClick={goBack}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        >
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>

                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">
                            Course Details
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            View comprehensive details for this course
                        </p>
                    </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex flex-wrap gap-2 mt-3 ml-9">
                    {tabs.map((tab) => (
                        <CustomButton
                            key={tab.key}
                            variant={activeTab === tab.key ? 'primary' : 'outline'}
                            className="text-xs px-3 py-1.5"
                            onClick={() =>
                                setActiveTab((prev) => (prev === tab.key ? null : tab.key))
                            }
                        >
                            {tab.label}
                        </CustomButton>
                    ))}
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-5xl">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-start gap-5 mb-8 pb-6 border-b border-gray-100">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0">
                        {details?.courseName
                            ? details.courseName.substring(0, 2).toUpperCase()
                            : "CR"}
                    </div>

                    <div className="flex-1">
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                            {details?.courseName || "N/A"}
                        </h2>

                        <div className="flex flex-wrap gap-2 items-center">
                            <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${details?.status === "ACTIVE"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                                    }`}
                            >
                                {details?.status || "UNKNOWN"}
                            </span>

                            <span className="bg-gray-50 text-gray-500 text-[10px] font-medium px-2.5 py-1 rounded-full border border-gray-200">
                                ID: {details?.id || "N/A"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Course Code */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Course Code
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                            {details?.courseCode || "N/A"}
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Duration
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                            {details?.duration || "N/A"}
                        </div>
                    </div>

                    {/* Fees */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Course Fees
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                            {details?.fees || "N/A"}
                        </div>
                    </div>

                    {/* Created Date */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Creation Date
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                            {details?.createdAt
                                ? new Date(details.createdAt).toLocaleString()
                                : "N/A"}
                        </div>
                    </div>

                    {/* Updated Date */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Last Updated
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                            {details?.updatedAt
                                ? new Date(details.updatedAt).toLocaleString()
                                : "N/A"}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Description
                        </div>
                        <div className="text-sm font-semibold text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {details?.description || "No description available."}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Table Section */}
            {activeTab && (() => {
                // ── Image Management ──────────────────────────────────────────
                if (activeTab === 'image') {
                    return (
                        <div className="mt-6 max-w-5xl">
                            {/* Section header */}
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                <h3 className="text-base font-bold text-gray-800">Image Management</h3>
                                <div className="flex items-center gap-3">
                                    <CustomButton
                                        variant="primary"
                                        className="text-xs px-3 py-1.5"
                                        onClick={() => setImageModal({ open: true, editData: null })}
                                    >
                                        + Upload Image
                                    </CustomButton>
                                </div>
                            </div>

                            {imagesLoading ? (
                                <div className="py-10 text-center text-gray-500 text-sm">Loading images…</div>
                            ) : (
                                <ReusableTable
                                    columns={imageColumns}
                                    data={images}
                                    emptyMessage="No images found for this course."
                                    onEdit={(row) => setImageModal({ open: true, editData: row })}
                                    onDelete={(row) => setDeleteModal({ open: true, imageId: row.id })}
                                />
                            )}
                        </div>
                    );
                }

                // ── USP Management ────────────────────────────────────────────
                if (activeTab === 'usp') {
                    return (
                        <div className="mt-6 max-w-5xl">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                <h3 className="text-base font-bold text-gray-800">USP Management</h3>
                                <div className="flex items-center gap-3">
                                    {/* Active Only toggle */}
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={uspActiveOnly}
                                            onChange={(e) => setUspActiveOnly(e.target.checked)}
                                            className="w-4 h-4 accent-blue-600"
                                        />
                                        <span className="text-xs font-medium text-gray-600">Active Only</span>
                                    </label>
                                    <CustomButton
                                        variant="primary"
                                        className="text-xs px-3 py-1.5"
                                        onClick={() => setUspModal({ open: true, editData: null })}
                                    >
                                        + Add USP
                                    </CustomButton>
                                </div>
                            </div>

                            {uspsLoading ? (
                                <div className="py-10 text-center text-gray-500 text-sm">Loading USPs…</div>
                            ) : (
                                <ReusableTable
                                    columns={uspColumns}
                                    data={usps}
                                    emptyMessage="No USPs found for this course."
                                    onEdit={(row) => setUspModal({ open: true, editData: row })}
                                    onDelete={(row) => setUspDeleteModal({ open: true, uspId: row.id })}
                                />
                            )}
                        </div>
                    );
                }

                // ── Communication Management ──────────────────────────────────
                if (activeTab === 'communication') {
                    return (
                        <CommunicationTab
                            courseId={id}
                            templates={templates}
                            images={images}
                        />
                    );
                }

                // ── Other tabs (placeholder) ──────────────────────────────────
                const tabMeta = tabs.find((t) => t.key === activeTab);
                if (!tabMeta) return null;

                // ── Template Management ───────────────────────────────────────
                if (activeTab === 'template') {
                    return (
                        <div className="mt-6 max-w-5xl">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                <h3 className="text-base font-bold text-gray-800">Template Management</h3>
                                <CustomButton
                                    variant="primary"
                                    className="text-xs px-3 py-1.5"
                                    onClick={() => setTemplateModal({ open: true, editData: null })}
                                >
                                    + Add Template
                                </CustomButton>
                            </div>

                            {templatesLoading ? (
                                <div className="py-10 text-center text-gray-500 text-sm">Loading templates…</div>
                            ) : (
                                <ReusableTable
                                    columns={templateColumns}
                                    data={templates}
                                    emptyMessage="No templates found for this course."
                                    onEdit={(row) => setTemplateModal({ open: true, editData: row })}
                                    onDelete={(row) => setTemplateDeleteModal({ open: true, templateId: row.id })}
                                />
                            )}
                        </div>
                    );
                }

                return (
                    <div className="mt-6 max-w-5xl">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-bold text-gray-800">{tabMeta.label}</h3>
                            <CustomButton variant="primary" className="text-xs px-3 py-1.5">
                                + Add
                            </CustomButton>
                        </div>
                        <ReusableTable
                            columns={[]}
                            data={[]}
                            emptyMessage={`No records found for ${tabMeta.label}.`}
                        />
                    </div>
                );
            })()}

            {/* Upload / Edit Image Modal */}
            <ImageModal
                isOpen={imageModal.open}
                onClose={() => setImageModal({ open: false, editData: null })}
                onSuccess={fetchImages}
                courseId={id}
                editData={imageModal.editData}
            />

            {/* Delete Confirmation Modal */}
            <DeleteModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, imageId: null })}
                onConfirm={handleDeleteImage}
                isLoading={deleteLoading}
                title="Delete Image"
                message="Are you sure you want to delete this image? This action cannot be undone."
            />

            {/* Add / Edit Template Modal */}
            <TemplateModal
                isOpen={templateModal.open}
                onClose={() => setTemplateModal({ open: false, editData: null })}
                onSuccess={fetchTemplates}
                courseId={id}
                editData={templateModal.editData}
            />

            {/* Delete Template Confirmation Modal */}
            <DeleteModal
                isOpen={templateDeleteModal.open}
                onClose={() => setTemplateDeleteModal({ open: false, templateId: null })}
                onConfirm={handleDeleteTemplate}
                isLoading={templateDeleteLoading}
                title="Delete Template"
                message="Are you sure you want to delete this template? This action cannot be undone."
            />

            {/* Add / Edit USP Modal */}
            <UspModal
                isOpen={uspModal.open}
                onClose={() => setUspModal({ open: false, editData: null })}
                onSuccess={fetchUsps}
                courseId={id}
                editData={uspModal.editData}
            />

            {/* Delete USP Confirmation Modal */}
            <DeleteModal
                isOpen={uspDeleteModal.open}
                onClose={() => setUspDeleteModal({ open: false, uspId: null })}
                onConfirm={handleDeleteUsp}
                isLoading={uspDeleteLoading}
                title="Delete USP"
                message="Are you sure you want to delete this USP? This action cannot be undone."
            />
        </div>
    );
};

export default CourseDetails;
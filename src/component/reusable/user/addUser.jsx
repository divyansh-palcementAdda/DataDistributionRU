import React, { useState, useEffect } from 'react';
import CustomButton from '../CustomButton';
import CustomInput from '../CustomInput';
import Toggle from '../custumToggle';
import { addUser, updateUser } from '../../../Services/user/user';
import { getRolesDropdown, getDepartmentsDropdown } from '../../../Services/drop-down/dropDownService';
import { useAppContext } from '../../../AppContext';

const HOD_ACCESS_TYPES = ['FULL_ACCESS', 'READ_ONLY', 'NO_ACCESS'];

const AddUserModal = ({ isOpen, onClose, onSuccess, initialData, defaultRole }) => {
    const { showToast } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const isEditMode = !!initialData;

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        departmentIds: [],
        hodAccessType: 'FULL_ACCESS',
        roles: defaultRole ? [defaultRole] : [],
        active: true,
        locked: false,
        emailVerified: true
    });

    // Populate form data when initialData changes (edit mode)
    useEffect(() => {
        if (initialData) {
            // departmentIds: support both array of UUIDs or array of objects
            const deptIds = Array.isArray(initialData.departmentIds)
                ? initialData.departmentIds
                : initialData.department
                    ? [initialData.department]
                    : [];

            setFormData({
                firstName: initialData.firstName || '',
                lastName: initialData.lastName || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                username: initialData.username || '',
                password: '',
                departmentIds: deptIds,
                hodAccessType: initialData.hodAccessType || 'FULL_ACCESS',
                roles: initialData.roles || (defaultRole ? [defaultRole] : []),
                active: initialData.active !== undefined ? initialData.active : true,
                locked: initialData.locked !== undefined ? initialData.locked : false,
                emailVerified: initialData.emailVerified !== undefined ? initialData.emailVerified : true
            });
        } else {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                username: '',
                password: '',
                departmentIds: [],
                hodAccessType: 'FULL_ACCESS',
                roles: defaultRole ? [defaultRole] : [],
                active: true,
                locked: false,
                emailVerified: true
            });
        }
    }, [initialData, defaultRole]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await getRolesDropdown();
                if (response?.data && Array.isArray(response.data)) {
                    const filtered = response.data.filter(
                        (role) => !['ADMIN', 'SUPER_ADMIN'].includes(role.name?.toUpperCase())
                    );
                    setRoles(filtered);
                    // Auto-select first role only if nothing is selected yet
                    setFormData(prev => ({
                        ...prev,
                        roles: prev.roles.length === 0 && filtered.length > 0 ? [filtered[0].name] : prev.roles
                    }));
                } else {
                    setRoles([]);
                }
            } catch (error) {
                console.error('Failed to fetch roles', error);
                setRoles([]);
            }
        };

        const fetchDepartments = async () => {
            try {
                const response = await getDepartmentsDropdown();
                const list = response?.data ?? [];
                setDepartments(Array.isArray(list) ? list : []);
            } catch (error) {
                console.error('Failed to fetch departments', error);
                setDepartments([]);
            }
        };

        if (isOpen) {
            fetchRoles();
            fetchDepartments();
        }
    }, [isOpen]);

    const handleRoleChange = (role) => {
        setFormData(prev => ({ ...prev, roles: [role] }));
    };

    // Department: single select stored as array of one UUID
    const handleDepartmentChange = (deptId) => {
        setFormData(prev => ({
            ...prev,
            departmentIds: deptId ? [deptId] : []
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.roles || formData.roles.length === 0 || !formData.roles[0]) {
            showToast('Please select a role', 'error');
            return;
        }

        try {
            setIsLoading(true);

            const jsonData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                username: formData.username,
                profileImage: null,
                departmentIds: formData.departmentIds,
                hodAccessType: formData.hodAccessType,
                roles: formData.roles,
                active: formData.active,
                locked: formData.locked,
                emailVerified: formData.emailVerified,
            };

            if (formData.password) {
                jsonData.password = formData.password;
            }

            if (isEditMode) {
                const userId = initialData?.id ?? initialData?._id ?? initialData?.userId;
                if (!userId) {
                    showToast('User ID not found', 'error');
                    return;
                }
                await updateUser(userId, jsonData);
                showToast('User updated successfully!', 'success');
            } else {
                jsonData.password = formData.password;
                await addUser(jsonData);
                showToast('User added successfully!', 'success');
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to save user', error);
            showToast(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} user`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay open">
            <div className="modal" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="modal-header border-b border-gray-100 pb-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        {isEditMode ? 'Edit User' : 'Add New User'}
                    </h2>
                    <CustomButton variant="ghost" className="btn-icon" onClick={onClose} disabled={isLoading}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </CustomButton>
                </div>

                <div className="modal-body">
                    <form id="addUserForm" onSubmit={handleSubmit} className="flex flex-col gap-4">

                        {/* Row 1: Name */}
                        <div className="grid grid-cols-2 gap-4">
                            <CustomInput
                                label="First Name"
                                value={formData.firstName}
                                onChange={(e) => handleChange('firstName', e.target.value)}
                                required
                            />
                            <CustomInput
                                label="Last Name"
                                value={formData.lastName}
                                onChange={(e) => handleChange('lastName', e.target.value)}
                                required
                            />
                        </div>

                        {/* Row 2: Email + Phone */}
                        <div className="grid grid-cols-2 gap-4">
                            <CustomInput
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                required
                            />
                            <CustomInput
                                label="Phone"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                            />
                        </div>

                        {/* Row 3: Username + Password */}
                        <div className="grid grid-cols-2 gap-4">
                            <CustomInput
                                label="Username"
                                value={formData.username}
                                onChange={(e) => handleChange('username', e.target.value)}
                                required
                            />
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700 ml-1">
                                    Password{' '}
                                    {isEditMode && (
                                        <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
                                    )}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        required={!isEditMode}
                                        placeholder={isEditMode ? 'Enter new password' : ''}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 w-full pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Row 4: Department + Role */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Department</label>
                                <select
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.departmentIds[0] || ''}
                                    onChange={(e) => handleDepartmentChange(e.target.value)}
                                >
                                    <option value="">
                                        {departments.length === 0 ? 'Loading departments...' : 'Select Department'}
                                    </option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Role</label>
                                <select
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.roles[0] || ''}
                                    onChange={(e) => handleRoleChange(e.target.value)}
                                >
                                    <option value="" disabled>Select Role</option>
                                    {Array.isArray(roles) && roles.length > 0 ? (
                                        roles.map((role) => (
                                            <option key={role.id} value={role.name}>
                                                {role.name}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>Loading roles...</option>
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* Row 5: HOD Access Type */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700 ml-1">HOD Access Type</label>
                            <select
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.hodAccessType}
                                onChange={(e) => handleChange('hodAccessType', e.target.value)}
                            >
                                {HOD_ACCESS_TYPES.map((type) => (
                                    <option key={type} value={type}>{type.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>

                        {/* Account Status Toggles */}
                        <div className="flex flex-col gap-3 mt-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="text-sm font-semibold text-gray-700 mb-1">Account Status</div>
                            <Toggle
                                label="Active Account"
                                checked={formData.active}
                                onChange={(val) => handleChange('active', val)}
                            />
                            <Toggle
                                label="Account Locked"
                                checked={formData.locked}
                                onChange={(val) => handleChange('locked', val)}
                            />
                            <Toggle
                                label="Email Verified"
                                checked={formData.emailVerified}
                                onChange={(val) => handleChange('emailVerified', val)}
                            />
                        </div>
                    </form>
                </div>

                <div className="modal-footer pt-4 mt-4 border-t border-gray-100 flex justify-end gap-3">
                    <CustomButton variant="secondary" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </CustomButton>
                    <CustomButton type="submit" form="addUserForm" variant="primary" disabled={isLoading}>
                        {isLoading ? 'Saving...' : isEditMode ? 'Update User' : 'Save User'}
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

export default AddUserModal;

import React, { useState, useEffect } from 'react';
import CustomButton from '../CustomButton';
import CustomInput from '../CustomInput';
import Toggle from '../custumToggle';
import { addUser, updateUser } from '../../../Services/user/user';
import { getAllRoles } from '../../../Services/role/roleService';
import { useAppContext } from '../../../AppContext';

const AddUserModal = ({ isOpen, onClose, onSuccess, initialData }) => {
    const { showToast } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [roles, setRoles] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const isEditMode = !!initialData;
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        department: '',
        roles: ['USER'],
        active: true,
        locked: false,
        emailVerified: false
    });

    // Populate form data when initialData changes (edit mode)
    useEffect(() => {
        if (initialData) {
            setFormData({
                firstName: initialData.firstName || '',
                lastName: initialData.lastName || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                username: initialData.username || '',
                password: '', // Don't pre-fill password in edit mode
                department: initialData.department || '',
                roles: initialData.roles || ['USER'],
                active: initialData.active !== undefined ? initialData.active : true,
                locked: initialData.locked !== undefined ? initialData.locked : false,
                emailVerified: initialData.emailVerified !== undefined ? initialData.emailVerified : false
            });
        } else {
            // Reset form when opening in add mode
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                username: '',
                password: '',
                department: '',
                roles: ['USER'],
                active: true,
                locked: false,
                emailVerified: false
            });
        }
    }, [initialData]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await getAllRoles();
                
                if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
                    setRoles(response.data.data);
                } else {
                    setRoles([]);
                }
            } catch (error) {
                console.error('Failed to fetch roles', error);
                setRoles([]);
            }
        };
        
        if (isOpen) {
            fetchRoles();
        }
    }, [isOpen]);

    const handleRoleChange = (role) => {
        setFormData(prev => ({
            ...prev,
            roles: [role]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            
            // Create JSON data object with profileImage set to null
            const jsonData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                username: formData.username,
                department: formData.department,
                active: formData.active,
                locked: formData.locked,
                emailVerified: formData.emailVerified,
                roles: formData.roles,
                profileImage: null
            };

            // Only include password if it's provided (for edit mode)
            if (formData.password) {
                jsonData.password = formData.password;
            }
            
            if (isEditMode) {
                // Update existing user
                const userId = initialData?.id ?? initialData?._id ?? initialData?.userId;
                if (!userId) {
                    showToast('User ID not found', 'error');
                    return;
                }
                await updateUser(userId, jsonData);
                showToast('User updated successfully!', 'success');
            } else {
                // Add new user
                jsonData.password = formData.password; // Password is required for new users
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
                    <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'Edit User' : 'Add New User'}</h2>
                    <CustomButton variant="ghost" className="btn-icon" onClick={onClose} disabled={isLoading}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </CustomButton>
                </div>

                <div className="modal-body">
                    <form id="addUserForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
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

                        <div className="grid grid-cols-2 gap-4">
                            <CustomInput 
                                label="Username" 
                                value={formData.username} 
                                onChange={(e) => handleChange('username', e.target.value)} 
                                required 
                            />
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700 ml-1">
                                    Password {isEditMode && <span className="text-gray-400 font-normal">(leave blank to keep current)</span>}
                                </label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        required={!isEditMode}
                                        placeholder={isEditMode ? "Enter new password" : ""}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 w-full pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                <line x1="1" y1="1" x2="23" y2="23"></line>
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <CustomInput 
                                label="Department" 
                                value={formData.department} 
                                onChange={(e) => handleChange('department', e.target.value)} 
                            />
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Role</label>
                                <select 
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.roles[0]}
                                    onChange={(e) => handleRoleChange(e.target.value)}
                                >
                                    {Array.isArray(roles) && roles.length > 0 ? (
                                        roles.map((role) => (
                                            <option key={role.id} value={role.name}>
                                                {role.name}
                                            </option>
                                        ))
                                    ) : (
                                        <>
                                            <option value="">Loading roles...</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>

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
                        {isLoading ? 'Saving...' : (isEditMode ? 'Update User' : 'Save User')}
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

export default AddUserModal;

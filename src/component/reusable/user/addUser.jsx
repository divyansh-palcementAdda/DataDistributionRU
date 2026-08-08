import React, { useState, useEffect } from 'react';
import CustomButton from '../CustomButton';
import CustomInput from '../CustomInput';
import Toggle from '../custumToggle';
import { addUser } from '../../../Services/user/user';
import { getAllRoles } from '../../../Services/role/roleService';
import { useAppContext } from '../../../AppContext';

const AddUserModal = ({ isOpen, onClose, onSuccess }) => {
    const { showToast } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [roles, setRoles] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        profileImage: null,
        department: '',
        roles: ['USER'],
        active: true,
        locked: false,
        emailVerified: false
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await getAllRoles();
                console.log('Roles response:', response);
                console.log('Response data:', response.data);
                
                if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
                    console.log('Setting roles:', response.data.data);
                    setRoles(response.data.data);
                } else {
                    console.log('No valid roles data found');
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

    const handleFileChange = (field, file) => {
        setFormData(prev => ({ ...prev, [field]: file }));
        
        // Create preview for image
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

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
            
            // Create FormData for file upload
            const formDataToSend = new FormData();
            formDataToSend.append('firstName', formData.firstName);
            formDataToSend.append('lastName', formData.lastName);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phone', formData.phone);
            formDataToSend.append('username', formData.username);
            formDataToSend.append('password', formData.password);
            formDataToSend.append('department', formData.department);
            formDataToSend.append('active', formData.active);
            formDataToSend.append('locked', formData.locked);
            formDataToSend.append('emailVerified', formData.emailVerified);
            
            // Add roles as array
            formData.roles.forEach(role => {
                formDataToSend.append('roles', role);
            });
            
            // Add profile image file if present
            if (formData.profileImage) {
                formDataToSend.append('profileImage', formData.profileImage);
            }
            
            await addUser(formDataToSend);
            showToast('User added successfully!', 'success');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to add user', error);
            showToast(error.response?.data?.message || 'Failed to add user', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay open">
            <div className="modal" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="modal-header border-b border-gray-100 pb-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Add New User</h2>
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
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700 ml-1">User Profile</label>
                                <div className="relative w-32 h-14">
                                    {imagePreview ? (
                                        <img 
                                            src={imagePreview} 
                                            alt="Profile Preview" 
                                            className="w-full h-full object-cover rounded-lg border-2 border-blue-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full border-2 border-dotted border-blue-500 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                                            Upload
                                        </div>
                                    )}
                                    <input 
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange('profileImage', e.target.files[0])}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div></div>
                        </div>

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
                            <CustomInput 
                                label="Password" 
                                type="password" 
                                value={formData.password} 
                                onChange={(e) => handleChange('password', e.target.value)} 
                                required 
                            />
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
                        {isLoading ? 'Saving...' : 'Save User'}
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

export default AddUserModal;

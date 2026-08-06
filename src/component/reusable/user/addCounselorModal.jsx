import React, { useState, useEffect } from 'react';
import CustomButton from '../CustomButton';
import CustomInput from '../CustomInput';
import Toggle from '../custumToggle';
import { addUser, updateUser } from '../../../Services/user/user';
import { useAppContext } from '../../../AppContext';

const COURSES = ['MBA', 'BBA', 'B.Com', 'B.Tech', 'B.Sc', 'M.Com', 'M.Tech', 'B.A', 'M.A', 'BCA', 'MCA'];

const AddCounselorModal = ({ isOpen, onClose, onSuccess, counselorData }) => {
    const { showToast } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('');
    const isEditMode = !!counselorData;
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        profileImage: '',
        department: '',
        roles: ['COUNSLER'],
        active: true,
        locked: false,
        emailVerified: false,
        assignedCourse: ''
    });

    // Populate form when counselorData is provided (edit mode)
    useEffect(() => {
        if (counselorData) {
            setFormData({
                firstName: counselorData.firstName || '',
                lastName: counselorData.lastName || '',
                email: counselorData.email || '',
                phone: counselorData.phone || counselorData.mobileNo || '',
                username: counselorData.username || '',
                password: '',
                profileImage: counselorData.profileImage || '',
                department: counselorData.department || '',
                roles: counselorData.roles || ['COUNSLER'],
                active: counselorData.isActive !== false,
                locked: counselorData.locked || false,
                emailVerified: counselorData.emailVerified || false,
                assignedCourse: counselorData.assignedCourse || ''
            });
            setSelectedCourse(counselorData.assignedCourse || '');
        } else {
            // Reset form for add mode
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                username: '',
                password: '',
                profileImage: '',
                department: '',
                roles: ['COUNSLER'],
                active: true,
                locked: false,
                emailVerified: false,
                assignedCourse: ''
            });
            setSelectedCourse('');
        }
    }, [counselorData, isOpen]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            
            if (isEditMode) {
                // Update existing counselor
                const updateData = { ...formData };
                if (!updateData.password) {
                    delete updateData.password; // Don't send empty password
                }
                await updateUser(counselorData.id, updateData);
                showToast('Counselor updated successfully!', 'success');
            } else {
                // Add new counselor
                await addUser(formData);
                showToast('Counselor added successfully!', 'success');
            }
            
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to save counselor', error);
            showToast(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} counselor`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay open">
            <div className="modal" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="modal-header border-b border-gray-100 pb-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'Edit Counselor' : 'Add New Counselor'}</h2>
                    <CustomButton variant="ghost" className="btn-icon" onClick={onClose} disabled={isLoading}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </CustomButton>
                </div>

                <div className="modal-body">
                    <form id="addCounselorForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                                required={!isEditMode}
                                placeholder={isEditMode ? "Leave blank to keep current password" : ""}
                            />
                        </div>

                        <CustomInput 
                            label="Department" 
                            value={formData.department} 
                            onChange={(e) => handleChange('department', e.target.value)} 
                        />

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Assign Course</label>
                            <select
                                className="form-control"
                                value={selectedCourse}
                                onChange={(e) => {
                                    setSelectedCourse(e.target.value);
                                    handleChange('assignedCourse', e.target.value);
                                }}
                            >
                                <option value="">Select Course</option>
                                {COURSES.map((course) => (
                                    <option key={course} value={course}>
                                        {course}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-3 mt-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="text-sm font-semibold text-gray-700 mb-1">Account Status</div>
                            <Toggle 
                                label="Active Account" 
                                checked={formData.active} 
                                onChange={(val) => handleChange('active', val)} 
                            />
                        </div>
                    </form>
                </div>

                <div className="modal-footer pt-4 mt-4 border-t border-gray-100 flex justify-end gap-3">
                    <CustomButton variant="secondary" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </CustomButton>
                    <CustomButton type="submit" form="addCounselorForm" variant="primary" disabled={isLoading}>
                        {isLoading ? 'Saving...' : (isEditMode ? 'Update Counselor' : 'Save Counselor')}
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

export default AddCounselorModal;
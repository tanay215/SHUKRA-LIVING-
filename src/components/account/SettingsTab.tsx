import React, { useState } from 'react';
import axios from 'axios';
import { AuthUtils } from '../../utils/auth';

interface SettingsTabProps {
    user: any;
    onUpdateUser: (user: any) => void;
}

const API_BASE_URL = 'http://localhost:30011/api';

const SettingsTab: React.FC<SettingsTabProps> = ({ user, onUpdateUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        address: {
            street: user?.address?.street || '',
            city: user?.address?.city || '',
            state: user?.address?.state || '',
            zipCode: user?.address?.zipCode || ''
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name.includes('address.')) {
            const addressField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: { ...prev.address, [addressField]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = AuthUtils.getToken();
            const response = await axios.put(`${API_BASE_URL}/users/profile`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onUpdateUser(response.data.user);
            setIsEditing(false);
            // Optional: Add a toast notification here
            alert('Profile updated successfully.');
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile.');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-3xl">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-serif text-[#2B1E16]">Account Settings</h2>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-[#C9A45C] hover:text-[#B08D45] text-sm font-medium transition-colors"
                    >
                        Edit Details
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-medium text-[#8A8A8A] uppercase tracking-wider mb-2">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full p-3 bg-[#F7F4EF] border-none rounded-lg text-[#2B1E16] focus:ring-1 focus:ring-[#C9A45C] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[#8A8A8A] uppercase tracking-wider mb-2">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full p-3 bg-[#F7F4EF] border-none rounded-lg text-[#2B1E16] focus:ring-1 focus:ring-[#C9A45C] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[#8A8A8A] uppercase tracking-wider mb-2">Email Address</label>
                        <input
                            type="email"
                            value={user?.email}
                            disabled
                            className="w-full p-3 bg-[#F7F4EF] border-none rounded-lg text-[#8A8A8A] cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[#8A8A8A] uppercase tracking-wider mb-2">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="w-full p-3 bg-[#F7F4EF] border-none rounded-lg text-[#2B1E16] focus:ring-1 focus:ring-[#C9A45C] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                        />
                    </div>

                    <div className="border-t border-[#F7F4EF] pt-6">
                        <h3 className="text-lg font-serif text-[#2B1E16] mb-4">Shipping Address</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-[#8A8A8A] uppercase tracking-wider mb-2">Street Address</label>
                                <input
                                    type="text"
                                    name="address.street"
                                    value={formData.address.street}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full p-3 bg-[#F7F4EF] border-none rounded-lg text-[#2B1E16] focus:ring-1 focus:ring-[#C9A45C] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-[#8A8A8A] uppercase tracking-wider mb-2">City</label>
                                    <input
                                        type="text"
                                        name="address.city"
                                        value={formData.address.city}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full p-3 bg-[#F7F4EF] border-none rounded-lg text-[#2B1E16] focus:ring-1 focus:ring-[#C9A45C] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[#8A8A8A] uppercase tracking-wider mb-2">State</label>
                                    <input
                                        type="text"
                                        name="address.state"
                                        value={formData.address.state}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full p-3 bg-[#F7F4EF] border-none rounded-lg text-[#2B1E16] focus:ring-1 focus:ring-[#C9A45C] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[#8A8A8A] uppercase tracking-wider mb-2">ZIP Code</label>
                                    <input
                                        type="text"
                                        name="address.zipCode"
                                        value={formData.address.zipCode}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full p-3 bg-[#F7F4EF] border-none rounded-lg text-[#2B1E16] focus:ring-1 focus:ring-[#C9A45C] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {isEditing && (
                    <div className="mt-6 flex justify-end gap-3 fade-in">
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(false);
                                setFormData({ // Reset form data
                                    firstName: user?.firstName || '',
                                    lastName: user?.lastName || '',
                                    phone: user?.phone || '',
                                    address: {
                                        street: user?.address?.street || '',
                                        city: user?.address?.city || '',
                                        state: user?.address?.state || '',
                                        zipCode: user?.address?.zipCode || ''
                                    }
                                });
                            }}
                            className="px-6 py-2 rounded-full border border-[#8A8A8A] text-[#8A8A8A] hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-2 rounded-full bg-[#2B1E16] text-[#F7F4EF] hover:bg-[#4A3B32] transition-colors shadow-lg"
                        >
                            Save Changes
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default SettingsTab;

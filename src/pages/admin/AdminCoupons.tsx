import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthUtils } from '../../utils/auth';
import { Plus, Trash2, Edit2, X, Check, Search } from 'lucide-react';

const API_BASE_URL = 'http://localhost:30011/api';

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    // const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        minOrderValue: 0,
        maxDiscountAmount: 0,
        expiryDate: '',
        usageLimitPerUser: 1,
        isActive: true
    });

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const token = AuthUtils.getToken();
            const response = await axios.get(`${API_BASE_URL}/admin/coupons`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCoupons(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch coupons:', err);
            // setError('Failed to fetch coupons');
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return;
        try {
            const token = AuthUtils.getToken();
            await axios.delete(`${API_BASE_URL}/admin/coupons/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCoupons();
        } catch (err) {
            alert('Failed to delete coupon');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = AuthUtils.getToken();
            const payload = {
                ...formData,
                maxDiscountAmount: formData.maxDiscountAmount || null
            };

            if (editingCoupon) {
                await axios.put(`${API_BASE_URL}/admin/coupons/${editingCoupon._id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_BASE_URL}/admin/coupons`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            setEditingCoupon(null);
            resetForm();
            fetchCoupons();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to save coupon');
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            description: '',
            discountType: 'percentage',
            discountValue: 0,
            minOrderValue: 0,
            maxDiscountAmount: 0,
            expiryDate: '',
            usageLimitPerUser: 1,
            isActive: true
        });
    };

    const openEditModal = (coupon: any) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            description: coupon.description || '',
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minOrderValue: coupon.minOrderValue || 0,
            maxDiscountAmount: coupon.maxDiscountAmount || 0,
            expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
            usageLimitPerUser: coupon.usageLimitPerUser,
            isActive: coupon.isActive
        });
        setShowModal(true);
    };

    const filteredCoupons = coupons.filter(c =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold font-heading text-primary">Coupons Management</h1>
                    <p className="text-gray-500">Create and manage discount codes</p>
                </div>
                <button
                    onClick={() => { resetForm(); setEditingCoupon(null); setShowModal(true); }}
                    className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition"
                >
                    <Plus size={20} />
                    Create Coupon
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search coupons..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-accent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Code</th>
                                <th className="p-4 font-semibold text-gray-600">Discount</th>
                                <th className="p-4 font-semibold text-gray-600">Expiry</th>
                                <th className="p-4 font-semibold text-gray-600">Status</th>
                                <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCoupons.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">No coupons found</td>
                                </tr>
                            ) : (
                                filteredCoupons.map(coupon => (
                                    <tr key={coupon._id} className="border-b hover:bg-gray-50 transition">
                                        <td className="p-4">
                                            <div className="font-bold text-primary">{coupon.code}</div>
                                            <div className="text-xs text-gray-500">{coupon.description}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                                                {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                                            </span>
                                            {coupon.minOrderValue > 0 && (
                                                <div className="text-xs text-gray-500 mt-1">Min Order: ₹{coupon.minOrderValue}</div>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm">
                                            {new Date(coupon.expiryDate).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            {coupon.isActive && new Date(coupon.expiryDate) > new Date() ? (
                                                <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                                    <Check size={14} /> Active
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-red-500 text-sm font-medium">
                                                    <X size={14} /> Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <button
                                                onClick={() => openEditModal(coupon)}
                                                className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon._id)}
                                                className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold text-primary">
                                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Coupon Code</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded uppercase"
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        required
                                        disabled={!!editingCoupon}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Expiry Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 border rounded"
                                        value={formData.expiryDate}
                                        onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Discount Type</label>
                                    <select
                                        className="w-full p-2 border rounded"
                                        value={formData.discountType}
                                        onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="flat">Flat Amount (₹)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Discount Value</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded"
                                        value={formData.discountValue}
                                        onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Min Order Value (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded"
                                        value={formData.minOrderValue}
                                        onChange={e => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Max Benefit (₹) (Optional)</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded"
                                        value={formData.maxDiscountAmount}
                                        onChange={e => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
                                        min="0"
                                        disabled={formData.discountType !== 'percentage'}
                                        placeholder={formData.discountType === 'flat' ? 'Not applicable' : ''}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-accent"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium">Active Coupon</label>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-accent transition mt-4"
                            >
                                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCoupons;

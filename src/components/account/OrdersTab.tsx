import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthUtils } from '../../utils/auth';

const API_BASE_URL = 'http://localhost:30011/api';

interface OrdersTabProps {
    // passing props if needed, simpler to fetch internally for now as per previous page logic
}

const OrdersTab: React.FC<OrdersTabProps> = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    useEffect(() => {
        loadUserOrders();
    }, []);

    const loadUserOrders = async () => {
        try {
            setLoading(true);
            const token = AuthUtils.getToken();
            if (!token) return;

            const response = await axios.get(`${API_BASE_URL}/users/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Sort by date desc
            const sortedOrders = response.data.sort((a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setOrders(sortedOrders);
            // Auto-expand the first order
            if (sortedOrders.length > 0) {
                setExpandedOrderId(sortedOrders[0]._id);
            }
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleOrder = (orderId: string) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Delivered':
                return 'bg-[#E8EFE9] text-[#2F5E3D]'; // Sage Green
            case 'Processing':
                return 'bg-[#EEEAE4] text-[#7A6C5D]'; // Warm Beige/Gray
            case 'Cancelled':
                return 'bg-red-50 text-red-700';
            default:
                return 'bg-[#FFF9EA] text-[#9C7B3F]'; // Default/Pending
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A45C]"></div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                <h3 className="text-lg font-serif text-[#2B1E16] mb-2">No Recent Orders</h3>
                <p className="text-[#8A8A8A] mb-6">You haven't placed any orders yet.</p>
                <button
                    onClick={() => navigate('/collection')}
                    className="text-[#C9A45C] hover:text-[#B08D45] font-medium transition-colors"
                >
                    Start Shopping &rarr;
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-serif text-[#2B1E16] mb-6">Recent Orders</h2>

            <div className="space-y-4">
                {orders.map((order) => {
                    const isExpanded = expandedOrderId === order._id;

                    return (
                        <div
                            key={order._id}
                            className={`bg-white rounded-2xl transition-all duration-300 overflow-hidden ${isExpanded ? 'shadow-md ring-1 ring-[#F7F4EF]' : 'shadow-sm hover:shadow-md'
                                }`}
                        >
                            <div
                                onClick={() => toggleOrder(order._id)}
                                className="p-6 cursor-pointer flex justify-between items-center bg-white"
                            >
                                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                                    <div>
                                        <p className="text-xs text-[#8A8A8A] uppercase tracking-wide">Order #</p>
                                        <p className="font-medium text-[#2B1E16]">#{order.trackingNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-[#8A8A8A] uppercase tracking-wide">Date</p>
                                        <p className="font-medium text-[#2B1E16]">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="hidden md:block">
                                        <p className="text-xs text-[#8A8A8A] uppercase tracking-wide">Total</p>
                                        <p className="font-medium text-[#2B1E16]">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div>
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(order.orderStatus)}`}
                                        >
                                            {order.orderStatus}
                                        </span>
                                    </div>
                                </div>

                                <div className="ml-4 text-[#8A8A8A]">
                                    {isExpanded ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            {/* Expanded Content */}
                            <div
                                className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100 border-t border-[#F7F4EF]' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="p-6 bg-[#FCFAF7]">
                                    <div className="space-y-4">
                                        {order.items?.map((item: any, idx: number) => (
                                            <div key={idx} className="flex gap-4 items-center">
                                                <div className="h-16 w-16 bg-white rounded-lg border border-[#F7F4EF] flex items-center justify-center overflow-hidden">
                                                    {/* Placeholder for product image if not available on item, using a generic icon or item.product.image if it exists */}
                                                    {item.product?.images?.[0] ? (
                                                        <img src={item.product.images[0]} alt={item.product.title} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs text-[#8A8A8A]">IMG</span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-[#2B1E16]">{item.product?.title || 'Product Name'}</h4>
                                                    <p className="text-xs text-[#8A8A8A]">Qty: {item.quantity} · ₹{item.price?.toLocaleString('en-IN')}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 flex justify-end items-center gap-4 pt-4 border-t border-[#EEEAE4]">
                                        <button
                                            onClick={() => navigate(`/order-tracking/${order.trackingNumber}`)}
                                            className="text-sm text-[#C9A45C] hover:text-[#B08D45] font-medium hover:underline transition-all"
                                        >
                                            Track Shipment
                                        </button>
                                        <span className="text-[#EEEAE4]">|</span>
                                        <button
                                            // View Details could link to existing detail logic if needed, or open modal
                                            // For now linking to same tracking page or just a placeholder
                                            onClick={() => navigate(`/order-tracking/${order.trackingNumber}`)}
                                            className="text-sm text-[#8A8A8A] hover:text-[#2B1E16] hover:underline transition-all"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrdersTab;

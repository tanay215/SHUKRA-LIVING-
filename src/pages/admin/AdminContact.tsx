
import { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthUtils } from '../../utils/auth';
import { Trash2, CheckCircle, Mail, Clock } from 'lucide-react';

const API_BASE_URL = 'http://localhost:30011/api';

const AdminContact = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const token = AuthUtils.getToken();
            const response = await axios.get(`${API_BASE_URL}/contacts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch messages:', err);
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchMessages();
    }, []);

    const markAsRead = async (id: string) => {
        try {
            const token = AuthUtils.getToken();
            await axios.put(`${API_BASE_URL}/contacts/${id}`, { status: 'Read' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(messages.map(m => m._id === id ? { ...m, status: 'Read' } : m));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        try {
            const token = AuthUtils.getToken();
            await axios.delete(`${API_BASE_URL}/contacts/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(messages.filter(m => m._id !== id));
        } catch (err) {
            alert('Failed to delete message');
        }
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold font-heading text-primary">Messages</h1>
                <p className="text-gray-500">View and manage customer inquiries</p>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="grid gap-4">
                    {messages.length === 0 ? (
                        <div className="text-center p-8 bg-white rounded-lg shadow text-gray-500">
                            No messages found
                        </div>
                    ) : (
                        messages.map(msg => (
                            <div key={msg._id} className={`bg-white p-6 rounded-lg shadow border-l-4 ${msg.status === 'New' ? 'border-accent' : 'border-gray-200'} transition-all hover:shadow-md`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-100 p-2 rounded-full">
                                            <Mail size={20} className="text-gray-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-primary">{msg.name}</h3>
                                            <a href={`mailto:${msg.email}`} className="text-sm text-accent hover:underline">{msg.email}</a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock size={14} />
                                        {new Date(msg.createdAt).toLocaleString()}
                                    </div>
                                </div>

                                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg mb-4 whitespace-pre-wrap">
                                    {msg.message}
                                </p>

                                <div className="flex justify-end gap-3">
                                    {msg.status === 'New' && (
                                        <button
                                            onClick={() => markAsRead(msg._id)}
                                            className="flex items-center gap-2 text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                                        >
                                            <CheckCircle size={16} /> Mark as Read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(msg._id)}
                                        className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminContact;

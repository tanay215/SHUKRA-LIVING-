import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthUtils } from '../../utils/auth';

const API_BASE_URL = 'http://localhost:30011/api';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [adminLoginData, setAdminLoginData] = useState({ adminId: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminLoginData.adminId || !adminLoginData.password) {
      alert('Please fill all fields');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/admin/login`, adminLoginData);
      
      // Store admin token directly in localStorage for compatibility
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('isAdmin', 'true');
      AuthUtils.setToken(response.data.token, 168); // 7 days expiry for admin
      AuthUtils.setAdmin(true);
      alert('Admin login successful!');
      navigate('/admin/dashboard');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Admin login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-8 border-t-4 border-red-600">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">🔐</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Access Portal</h2>
          <p className="text-gray-600 text-sm mt-2">Secure Administrative Dashboard</p>
        </div>
        
        <form onSubmit={handleAdminLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin ID</label>
            <input
              type="text"
              placeholder="Enter Admin ID"
              value={adminLoginData.adminId}
              onChange={(e) => setAdminLoginData({...adminLoginData, adminId: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter Password"
              value={adminLoginData.password}
              onChange={(e) => setAdminLoginData({...adminLoginData, password: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            onClick={() => navigate('/')} 
            className="text-gray-600 hover:text-gray-800 text-sm underline transition"
          >
            ← Back to Main Site
          </button>
        </div>
        
        <div className="mt-8 p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-xs text-red-700 text-center">
            🔒 This is a secure administrative area. Unauthorized access is prohibited and monitored.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
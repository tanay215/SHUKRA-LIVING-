import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:30011/api';

const SetCredentialsPage: React.FC = () => {
  const navigate = useNavigate();
  const [credentialsData, setCredentialsData] = useState({
    userId: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSetCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentialsData.userId || !credentialsData.password) {
      alert('Please fill all fields');
      return;
    }
    if (credentialsData.password.length !== 6) {
      alert('Password must be exactly 6 digits');
      return;
    }

    try {
      setIsLoading(true);
      const userId = sessionStorage.getItem('tempUserId');
      if (!userId) {
        alert('Session expired. Please start the signup process again.');
        navigate('/signup');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/auth/set-credentials`, {
        userId: userId,
        customUserId: credentialsData.userId,
        password: credentialsData.password
      });
      
      localStorage.setItem('token', response.data.token);
      sessionStorage.removeItem('tempUserId');
      navigate('/dashboard');
      alert('Account setup completed successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to set credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary/30 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-8">
        <h2 className="text-2xl font-heading text-accent mb-6 text-center">Set Your Credentials</h2>
        <p className="text-center mb-6 text-gray-600">Create your unique User ID and 6-digit password</p>
        <form onSubmit={handleSetCredentials} className="space-y-4">
          <input
            type="text"
            placeholder="Create User ID"
            value={credentialsData.userId}
            onChange={(e) => setCredentialsData({...credentialsData, userId: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
            required
          />
          <input
            type="password"
            placeholder="Create 6-digit Password"
            value={credentialsData.password}
            onChange={(e) => setCredentialsData({...credentialsData, password: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-accent text-center text-2xl tracking-widest"
            maxLength={6}
            required
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-accent text-white py-3 rounded-lg font-bold hover:bg-accent/90 transition disabled:opacity-50"
          >
            {isLoading ? 'Setting Up...' : 'Complete Setup'}
          </button>
        </form>
        <button onClick={() => navigate('/verify-otp')} className="w-full mt-4 text-accent hover:underline">
          Back to OTP Verification
        </button>
      </div>
    </div>
  );
};

export default SetCredentialsPage;
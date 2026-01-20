import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:30011/api';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [resetData, setResetData] = useState({
    email: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: '',
    resetToken: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: verify OTP, 2: set new password
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (location.state?.email && location.state?.resetToken) {
      setResetData(prev => ({
        ...prev,
        email: location.state.email,
        resetToken: location.state.resetToken
      }));
    }
  }, [location.state]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetData.resetCode) {
      alert('Please enter the reset code');
      return;
    }
    
    try {
      setIsLoading(true);
      await axios.post(`${API_BASE_URL}/auth/verify-reset-code`, {
        email: resetData.email,
        resetCode: resetData.resetCode,
        resetToken: resetData.resetToken
      });
      setStep(2);
      alert('Code verified! Now set your new password.');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Invalid reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading || isCompleted) return;
    
    if (!resetData.newPassword || !resetData.confirmPassword) {
      alert('Please fill all password fields');
      return;
    }
    if (resetData.newPassword !== resetData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (resetData.newPassword.length !== 6) {
      alert('Password must be exactly 6 digits');
      return;
    }
    
    setIsLoading(true);
    setIsCompleted(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        email: resetData.email,
        resetCode: resetData.resetCode,
        newPassword: resetData.newPassword,
        resetToken: resetData.resetToken
      });
      
      alert(`✅ SUCCESS!\nUser ID: ${response.data.userId}\nPassword: ${resetData.newPassword}`);
      window.location.replace('/login');
      
    } catch (error: any) {
      alert('❌ ' + (error.response?.data?.error || 'Reset failed'));
      setIsCompleted(false);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-primary/30 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-8">
        <h2 className="text-2xl font-heading text-accent mb-6 text-center">
          {step === 1 ? 'Verify Reset Code' : 'Set New Password'}
        </h2>
        <p className="text-center mb-6 text-gray-600">
          {step === 1 
            ? 'Enter the 6-digit code sent to your email' 
            : 'Create your new 6-digit password'
          }
        </p>
        {step === 1 ? (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">Email: {resetData.email}</p>
            </div>
            <input
              type="text"
              placeholder="Enter 6-digit reset code"
              value={resetData.resetCode}
              onChange={(e) => setResetData({...resetData, resetCode: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-accent text-center text-2xl tracking-widest"
              maxLength={6}
              required
            />
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-accent text-white py-3 rounded-lg font-bold hover:bg-accent/90 transition disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-green-600">✓ Code verified for {resetData.email}</p>
            </div>
            <input
              type="password"
              placeholder="New 6-digit Password"
              value={resetData.newPassword}
              onChange={(e) => setResetData({...resetData, newPassword: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-accent text-center text-2xl tracking-widest"
              maxLength={6}
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={resetData.confirmPassword}
              onChange={(e) => setResetData({...resetData, confirmPassword: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-accent text-center text-2xl tracking-widest"
              maxLength={6}
              required
            />
            <button 
              type="submit" 
              disabled={isLoading || isCompleted}
              className="w-full bg-accent text-white py-3 rounded-lg font-bold hover:bg-accent/90 transition disabled:opacity-50"
            >
              {isCompleted ? '✅ Redirecting to Login...' : isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}
        <button onClick={() => navigate('/login')} className="w-full mt-4 text-accent hover:underline">
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
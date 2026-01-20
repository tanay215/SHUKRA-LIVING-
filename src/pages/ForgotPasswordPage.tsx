import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:30011/api';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.replace('mailto:', '').trim();
    if (!cleanEmail) {
      alert('Please enter your email');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email: cleanEmail });
      alert('Password reset code sent to your email!');
      navigate('/reset-password', { state: { email: cleanEmail, resetToken: response.data.resetToken } });
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary/30 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-8">
        <h2 className="text-2xl font-heading text-accent mb-6 text-center">Forgot Password</h2>
        <p className="text-center mb-6 text-gray-600">Enter your email address to receive a password reset code</p>
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
            required
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-accent text-white py-3 rounded-lg font-bold hover:bg-accent/90 transition disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send Reset Code'}
          </button>
        </form>
        <button onClick={() => navigate('/login')} className="w-full mt-4 text-accent hover:underline">
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
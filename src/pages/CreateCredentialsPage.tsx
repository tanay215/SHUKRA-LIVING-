import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:30011/api';

const CreateCredentialsPage: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{userId?: string; password?: string; confirmPassword?: string}>({});

  const validateForm = () => {
    const newErrors: {userId?: string; password?: string; confirmPassword?: string} = {};
    
    if (!userId.trim()) {
      newErrors.userId = 'User ID is required';
    } else if (userId.length < 4) {
      newErrors.userId = 'User ID must be at least 4 characters';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length !== 6) {
      newErrors.password = 'Password must be exactly 6 digits';
    } else if (!/^\d{6}$/.test(password)) {
      newErrors.password = 'Password must contain only numbers';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const tempUserId = sessionStorage.getItem('tempUserId');
        if (!tempUserId) {
          alert('Session expired. Please start the signup process again.');
          navigate('/signup');
          return;
        }

        const response = await axios.post(`${API_BASE_URL}/auth/set-credentials`, {
          userId: tempUserId,
          customUserId: userId,
          password: password
        });
        
        localStorage.setItem('token', response.data.token);
        sessionStorage.removeItem('tempUserId');
        navigate('/dashboard');
        alert('Account setup completed successfully!');
      } catch (error: any) {
        alert(error.response?.data?.error || 'Failed to set credentials');
      }
    }
  };

  const handleUserIdChange = (value: string) => {
    setUserId(value);
    if (errors.userId) {
      setErrors(prev => ({ ...prev, userId: undefined }));
    }
  };

  const handlePasswordChange = (value: string) => {
    if (/^\d*$/.test(value) && value.length <= 6) {
      setPassword(value);
      if (errors.password) {
        setErrors(prev => ({ ...prev, password: undefined }));
      }
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    if (/^\d*$/.test(value) && value.length <= 6) {
      setConfirmPassword(value);
      if (errors.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: undefined }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-primary/30 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-accent p-6 flex items-center gap-4 text-white">
          <button onClick={() => navigate('/verify-otp')} className="hover:bg-white/20 p-2 rounded-full transition">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-xl font-heading">Create Login Credentials</h2>
            <p className="text-white/80 text-sm">Set up your User ID and Password</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-2" />
              User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => handleUserIdChange(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:border-accent outline-none"
              placeholder="Enter your unique User ID"
            />
            {errors.userId && <p className="text-red-500 text-xs mt-1">{errors.userId}</p>}
            <p className="text-xs text-gray-500 mt-1">This will be used to login to your account</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock size={16} className="inline mr-2" />
              6-Digit Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:border-accent outline-none pr-12"
                placeholder="Enter 6-digit password"
                maxLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-accent"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock size={16} className="inline mr-2" />
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:border-accent outline-none pr-12"
                placeholder="Confirm your password"
                maxLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-accent"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-accent text-white py-4 rounded-lg font-bold tracking-wide hover:bg-accent/90 transition shadow-lg"
          >
            CREATE ACCOUNT
          </button>

          <div className="text-xs text-gray-500 text-center">
            <p>• User ID must be unique and at least 4 characters</p>
            <p>• Password must be exactly 6 digits (numbers only)</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCredentialsPage;
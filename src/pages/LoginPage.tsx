import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Lock, Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { AuthUtils } from '../utils/auth';

const API_BASE_URL = 'http://localhost:30011/api';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [tempLoginData, setTempLoginData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userId.trim()) {
      setError('Please enter your User ID');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      // First verify credentials and send OTP
      const response = await axios.post(`${API_BASE_URL}/auth/login-verify`, {
        userId,
        password
      });

      setTempLoginData(response.data);
      setShowOtpStep(true);
      alert('OTP sent to your registered email!');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login-confirm`, {
        userId,
        otp,
        tempToken: tempLoginData?.tempToken
      });

      // Clear all previous auth data first
      AuthUtils.clearAuth();
      // Set new user token
      console.log('Setting new token:', response.data.token ? 'Present' : 'Missing');
      AuthUtils.setToken(response.data.token, 24);
      AuthUtils.setAdmin(false);

      // Verify token was set
      const storedToken = AuthUtils.getToken();
      console.log('Token stored in localStorage:', storedToken ? 'Yes' : 'No');

      alert('Login successful!');

      const searchParams = new URL(window.location.href).searchParams;
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl) {
        navigate(redirectUrl, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-primary text-cream flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image - Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop"
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary/90 to-transparent" />
      </div>

      <div className="bg-primary/40 backdrop-blur-xl w-full max-w-md rounded-2xl border border-white/10 shadow-2xl relative z-10 p-8 md:p-10">

        {/* Contact Us Button - Absolute Positioned */}
        <a
          href="mailto:contact@shukraliving.com"
          className="absolute top-4 right-4 text-xs font-light text-secondary hover:text-white transition-colors uppercase tracking-widest border border-secondary/30 px-3 py-1 rounded-full hover:bg-secondary/10"
        >
          Contact Us
        </a>

        <div className="text-center mb-10 pt-4">
          <div className="inline-block mb-4">
            <span className="text-3xl font-heading font-bold text-white tracking-[0.2em]">SHUKRA</span>
          </div>
          <h2 className="text-xl text-secondary font-light tracking-wide uppercase mb-2">Welcome Back</h2>
          <p className="text-gray-400 text-sm font-light">Sign in to access your dashboard</p>
        </div>

        {!showOtpStep ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-gray-400 ml-1">User ID</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full bg-black/20 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-accent focus:bg-black/40 transition-all font-light"
                  placeholder="Enter your User ID"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-gray-400 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg pl-12 pr-12 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-accent focus:bg-black/40 transition-all font-light"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-accent transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm text-center font-light">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent text-white py-4 rounded-lg font-bold tracking-widest uppercase text-xs hover:bg-white hover:text-primary transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? 'Verifying...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent/20">
                <Lock className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-heading font-medium text-white">Verification Required</h3>
              <p className="text-sm text-gray-400 mt-2 font-light">Enter the code sent to your email</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-gray-400 ml-1">OTP Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  if (error) setError('');
                }}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-accent focus:bg-black/40 transition-all font-light text-center text-2xl tracking-[0.5em]"
                placeholder="••••••"
                maxLength={6}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm text-center font-light">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowOtpStep(false);
                  setOtp('');
                  setError('');
                }}
                className="flex-1 border border-white/10 text-gray-300 py-3 rounded-lg font-medium tracking-wide hover:bg-white/5 transition text-xs uppercase"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-accent text-white py-3 rounded-lg font-bold tracking-widest text-xs hover:bg-white hover:text-primary transition-all duration-300 uppercase"
              >
                {isLoading ? 'Verifying...' : 'Confirm'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-8 space-y-4">
          <p className="text-xs text-gray-500 font-light">
            Don't have an account?{' '}
            <button onClick={() => navigate('/signup')} className="text-secondary hover:text-accent transition-colors font-medium ml-1">
              Create Account
            </button>
          </p>
          <p className="text-xs">
            <button onClick={() => navigate('/forgot-password')} className="text-gray-500 hover:text-gray-300 transition-colors">
              Forgot Password?
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
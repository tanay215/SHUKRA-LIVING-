import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Clock } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:30011/api';

const OTPVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 4) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 5) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOTP = async (otpValue: string) => {
    try {
      const userId = sessionStorage.getItem('tempUserId');
      if (!userId) {
        alert('Session expired. Please start the signup process again.');
        navigate('/signup');
        return;
      }

      await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
        userId,
        otp: otpValue
      });
      navigate('/set-credentials');
      alert('OTP verified successfully!');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Invalid OTP');
    }
  };

  const handleResend = async () => {
    if (timeLeft === 0) {
      try {
        const userId = sessionStorage.getItem('tempUserId');
        if (!userId) {
          alert('Session expired. Please start the signup process again.');
          navigate('/signup');
          return;
        }

        await axios.post(`${API_BASE_URL}/auth/resend-otp`, { userId });
        setTimeLeft(300);
        setOtp(['', '', '', '', '']);
        setError('');
        alert('OTP resent successfully!');
      } catch (error: any) {
        setError(error.response?.data?.error || 'Failed to resend OTP');
      }
    }
  };

  useEffect(() => {
    // Get email from session storage or redirect
    const storedEmail = sessionStorage.getItem('tempEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      navigate('/signup');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-primary/30 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-accent p-6 flex items-center gap-4 text-white">
          <button onClick={() => navigate('/signup')} className="hover:bg-white/20 p-2 rounded-full transition">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-xl font-heading">Verify Your Email</h2>
            <p className="text-white/80 text-sm">Enter the OTP sent to your email</p>
          </div>
        </div>

        <div className="p-8 text-center">
          <div className="mx-auto bg-primary w-16 h-16 rounded-full flex items-center justify-center text-accent mb-6 border border-accent">
            <Mail size={32} />
          </div>

          <p className="text-gray-600 mb-2">We've sent a 5-digit OTP to</p>
          <p className="font-bold text-accent mb-8">{email}</p>

          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-accent outline-none"
              />
            ))}
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
            <Clock size={16} />
            <span>Time remaining: {formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={handleResend}
            disabled={timeLeft > 0}
            className={`text-sm ${timeLeft > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-accent hover:underline cursor-pointer'}`}
          >
            {timeLeft > 0 ? 'Resend OTP' : 'Resend OTP'}
          </button>

          <p className="text-xs text-gray-500 mt-6">
            Didn't receive the code? Check your spam folder or try resending.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;
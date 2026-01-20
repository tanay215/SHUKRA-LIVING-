import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import { generateToken, authenticate, blacklistToken } from '../middleware/auth.js';
import { sendVerificationEmail, sendOTPEmail, sendPasswordResetEmail } from '../utils/email.js';

const router = express.Router();

// Generate 5-digit OTP
const generateOTP = () => Math.floor(10000 + Math.random() * 90000).toString();

// Generate unique OTP that doesn't exist in database
const generateUniqueOTP = async () => {
  let otp;
  let isUnique = false;
  
  while (!isUnique) {
    otp = generateOTP();
    const existingUser = await User.findOne({ 'otp.code': otp });
    if (!existingUser) {
      isUnique = true;
    }
  }
  
  return otp;
};

// Create account and send OTP
router.post('/create-account', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, city, state } = req.body;

    if (!firstName || !lastName || !email || !phone || !address || !city || !state) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email or phone' });
    }

    // Generate unique OTP
    const otp = await generateUniqueOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Create user with temporary password
    const tempUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password: 'temp123', // Will be updated after OTP verification
      address: {
        street: address,
        city,
        state,
        country: 'India'
      },
      otp: {
        code: otp,
        expiresAt: otpExpiry
      },
      isVerified: false
    });

    await tempUser.save();

    // Send OTP via email
    try {
      await sendOTPEmail(email, firstName, otp);
      console.log('✅ OTP email sent successfully to:', email);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      // Continue without failing the request - user can still proceed
    }

    res.json({ 
      message: 'Account created and OTP sent successfully', 
      userId: tempUser._id,
      email 
    });
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ error: 'User ID and OTP are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (!user.otp || !user.otp.code) {
      return res.status(400).json({ error: 'No OTP found for this user' });
    }

    // Check if OTP is expired
    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    await user.save();

    res.json({ 
      message: 'OTP verified successfully',
      verified: true,
      userId: user._id
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Set User ID and Password
router.post('/set-credentials', async (req, res) => {
  try {
    const { userId, customUserId, password } = req.body;

    if (!userId || !customUserId || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length !== 6) {
      return res.status(400).json({ error: 'Password must be exactly 6 digits' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Check if custom user ID already exists
    const existingUserId = await User.findOne({ userId: customUserId });
    if (existingUserId) {
      return res.status(400).json({ error: 'User ID already taken' });
    }

    // Update user with credentials
    user.userId = customUserId;
    user.password = password;
    user.isVerified = true;
    user.lastLogin = new Date();
    
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: 'Credentials set successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        userId: user.userId,
        address: user.address,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Set credentials error:', error);
    res.status(500).json({ error: 'Failed to set credentials' });
  }
});

// Login with OTP verification - Step 1: Verify credentials and send OTP
router.post('/login-verify', async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ error: 'User ID and password are required' });
    }

    const user = await User.findOne({ userId });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate OTP for login verification
    const otp = await generateUniqueOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    const tempToken = crypto.randomBytes(32).toString('hex');

    // Store OTP temporarily
    user.loginOtp = {
      code: otp,
      expiresAt: otpExpiry,
      tempToken
    };
    await user.save();

    // Send OTP via email
    try {
      await sendOTPEmail(user.email, user.firstName, otp);
      console.log('✅ Login OTP sent successfully to:', user.email);
    } catch (emailError) {
      console.error('❌ Login OTP email failed:', emailError);
    }

    res.json({
      message: 'OTP sent to your registered email',
      tempToken,
      email: user.email
    });
  } catch (error) {
    console.error('Login verify error:', error);
    res.status(500).json({ error: 'Login verification failed' });
  }
});

// Login with OTP verification - Step 2: Verify OTP and complete login
router.post('/login-confirm', async (req, res) => {
  try {
    const { userId, otp, tempToken } = req.body;

    if (!userId || !otp || !tempToken) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.loginOtp || !user.loginOtp.code) {
      return res.status(400).json({ error: 'No OTP found. Please restart login process.' });
    }

    // Check if OTP is expired
    if (new Date() > user.loginOtp.expiresAt) {
      return res.status(400).json({ error: 'OTP expired. Please restart login process.' });
    }

    if (user.loginOtp.code !== otp || user.loginOtp.tempToken !== tempToken) {
      return res.status(400).json({ error: 'Invalid OTP or session' });
    }

    // Clear login OTP and update last login
    user.loginOtp = undefined;
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        userId: user.userId,
        address: user.address,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login confirm error:', error);
    res.status(500).json({ error: 'Login confirmation failed' });
  }
});

// Legacy login (without OTP) - for backward compatibility
router.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ error: 'User ID and password are required' });
    }

    const user = await User.findOne({ userId });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        userId: user.userId,
        address: user.address,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify Email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

// Forgot Password - Send Reset Code
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Password reset request for:', email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(404).json({ error: 'User not found with this email' });
    }

    // Check daily reset limit (3 per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (user.passwordResetCount?.lastReset) {
      const lastResetDate = new Date(user.passwordResetCount.lastReset);
      lastResetDate.setHours(0, 0, 0, 0);
      
      if (lastResetDate.getTime() === today.getTime()) {
        if (user.passwordResetCount.count >= 3) {
          console.log('Daily reset limit exceeded for:', email);
          return res.status(429).json({ error: 'Daily password reset limit exceeded. Try again tomorrow.' });
        }
      } else {
        // Reset count for new day
        user.passwordResetCount = { count: 0, lastReset: new Date() };
      }
    } else {
      user.passwordResetCount = { count: 0, lastReset: new Date() };
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    user.resetPasswordCode = resetCode;
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    // Increment reset count
    user.passwordResetCount.count += 1;
    user.passwordResetCount.lastReset = new Date();
    
    await user.save();
    
    console.log('✅ Reset code generated:', { email, resetCode, resetToken });

    // Send reset code via email
    try {
      await sendOTPEmail(email, user.firstName, resetCode);
      console.log('✅ Reset code email sent successfully');
    } catch (emailError) {
      console.error('❌ Reset email failed:', emailError);
    }

    res.json({ 
      message: 'Reset code sent to your email',
      resetToken
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ error: 'Failed to send reset code' });
  }
});

// Verify Reset Code
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, resetCode, resetToken } = req.body;
    console.log('🔍 Verifying reset code:', { email, resetCode: resetCode?.substring(0,3) + '***' });

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found for verification:', email);
      return res.status(400).json({ error: 'User not found' });
    }

    if (!user.resetPasswordCode || !user.resetPasswordToken) {
      console.log('❌ No reset data found for user:', email);
      return res.status(400).json({ error: 'No reset code found. Please request a new one.' });
    }

    if (Date.now() > user.resetPasswordExpires) {
      console.log('❌ Reset code expired for user:', email);
      return res.status(400).json({ error: 'Reset code has expired. Please request a new one.' });
    }

    if (user.resetPasswordCode !== resetCode) {
      console.log('❌ Invalid reset code for user:', email);
      return res.status(400).json({ error: 'Invalid reset code' });
    }

    if (user.resetPasswordToken !== resetToken) {
      console.log('❌ Invalid reset token for user:', email);
      return res.status(400).json({ error: 'Invalid reset session' });
    }

    console.log('✅ Reset code verified successfully for:', email);
    res.json({ message: 'Reset code verified successfully' });
  } catch (error) {
    console.error('❌ Verify reset code error:', error);
    res.status(500).json({ error: 'Failed to verify reset code' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, resetCode, newPassword, resetToken } = req.body;
    console.log('🔄 Password reset attempt for:', email);

    if (!email || !resetCode || !newPassword || !resetToken) {
      console.log('❌ Missing required fields for password reset');
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword.length !== 6) {
      console.log('❌ Invalid password length for:', email);
      return res.status(400).json({ error: 'Password must be exactly 6 digits' });
    }

    const user = await User.findOne({
      email,
      resetPasswordCode: resetCode,
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('❌ Invalid reset data for password reset:', email);
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    // Clear reset data immediately to prevent reuse
    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log('✅ Password reset successful for:', email, 'User ID:', user.userId);
    res.json({ 
      message: 'Password reset successful! Please login with your User ID: ' + user.userId,
      userId: user.userId
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// Secure Logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    // Blacklist the current token
    blacklistToken(req.token);
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
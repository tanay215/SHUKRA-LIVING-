import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  secure: false,
  tls: {
    rejectUnauthorized: false
  }
});

// Test email configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

export const sendVerificationEmail = async (email, firstName, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify Your Shukra Living Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8B4513, #D2691E); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">SHUKRA LIVING</h1>
          <p style="color: white; margin: 10px 0 0 0;">Luxury is in each detail</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #8B4513;">Welcome, ${firstName}!</h2>
          <p>Thank you for joining Shukra Living. Please verify your email address to complete your registration.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #8B4513; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
          </div>
          <p style="color: #666; font-size: 14px;">If you didn't create this account, please ignore this email.</p>
        </div>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

export const sendOTPEmail = async (email, firstName, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Your Shukra Living Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8B4513, #D2691E); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">SHUKRA LIVING</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9; text-align: center;">
          <h2 style="color: #8B4513;">Verification Code</h2>
          <p>Hello ${firstName}, here's your verification code:</p>
          <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 10px; border: 2px solid #8B4513;">
            <h1 style="color: #8B4513; font-size: 36px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p style="color: #666;">This code expires in 10 minutes.</p>
        </div>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Reset Your Shukra Living Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8B4513, #D2691E); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">SHUKRA LIVING</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #8B4513;">Password Reset Request</h2>
          <p>Hello ${firstName}, you requested to reset your password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #8B4513; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};
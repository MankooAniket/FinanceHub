// backend/utils/emailService.js

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// ✅ Send OTP Email
const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: '"Finance Tracker" <noreply@financetracker.com>',
      to: email,
      subject: 'Verify Your Email - Finance Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Finance Tracker</h1>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Verify Your Email</h2>
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
              Thank you for signing up! Please use the following OTP code to verify your email address:
            </p>
            
            <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0;">
              <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #111827; font-family: monospace;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
              ⏱️ This code expires in <strong>10 minutes</strong>
            </p>
            
            <p style="color: #9ca3af; font-size: 14px;">
              🔒 If you didn't request this verification, please ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
              © 2024 Finance Tracker. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Email error:', error);
    throw new Error('Failed to send OTP email');
  }
};

// ✅ Send Password Reset Email
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const resetURL = `https://financehub-2.onrender.com/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: '"Finance Tracker" <noreply@financetracker.com>',
      to: email,
      subject: 'Password Reset Request - Finance Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetURL}" style="display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Reset Password
          </a>
          <p>Or copy this link: ${resetURL}</p>
          <p>This link expires in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Email error:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail,
};
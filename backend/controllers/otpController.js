const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User');


function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

async function sendOTPEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

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
             This code expires in <strong>10 minutes</strong>
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

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent to:', email);
  } catch (error) {
    console.error('Email error:', error);
    throw new Error('Failed to send OTP email');
  }
}

exports.requestOTP = async (req, res) => {
  try {
    const { email } = req.body;

    console.log('Requesting OTP for:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email required',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const otp = generateOTP();
    user.otpCode = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    console.log('🔢 OTP generated:', otp);


    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
    });
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message,
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log('🔍 Verifying OTP for:', email);

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP required',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.otpCode || !user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new one.',
      });
    }

    if (user.otpCode !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;

    await user.save();

    console.log(' User verified:', email);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
    });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    console.log('🔄 Resending OTP to:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email required',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const otp = generateOTP();
    user.otpCode = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    console.log('🔢 New OTP generated:', otp);

    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'New OTP sent to your email',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message,
    });
  }
};

module.exports = {
  requestOTP: exports.requestOTP,
  verifyOTP: exports.verifyOTP,
  resendOTP: exports.resendOTP,
};
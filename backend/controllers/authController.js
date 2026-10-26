const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log('Registration:', { username, email });


    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const existing = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: existing.email === email 
          ? 'Email already registered' 
          : 'Username already taken',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      isVerified: false, 
    });

    console.log('User created (unverified):', user._id);

    res.status(201).json({
      success: true,
      message: 'Account created! Please verify your email with OTP.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
      },
      requiresOTP: true,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login:', { email });

    
    const user = await User.findOne({ email });

    if (!user) {
      console.log(' User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(' Password mismatch');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isVerified) {
      console.log('User not verified');
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first',
        requiresVerification: true,
        email: user.email,
      });
    }


    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET,
      { expiresIn: '2d' }
    );

    console.log('Login successful:', user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; 

    await user.save();

    console.log('🔑 Password reset token:', resetToken);

    res.status(200).json({
      success: true,
      message: 'Password reset instructions sent to your email',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process request',
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password required',
      });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const Income = require('../models/Income');
    const Expense = require('../models/Expense');
    
    await Income.deleteMany({ user: userId });
    await Expense.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (username) user.username = username;
    if (email) user.email = email;
    
    await user.save();
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  deleteAccount,
  getProfile,
  updateProfile,
};
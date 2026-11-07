const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'funnelpro_super_secret_jwt_key_2026_production', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password, businessName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      businessName: businessName || `${name}'s Funnels`,
      role: 'user',
      emailVerified: true
    });

    const token = generateToken(user._id);

    const safeUser = { ...user };
    delete safeUser.password;

    res.status(201).json({
      success: true,
      token,
      user: safeUser
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    const safeUser = { ...user };
    delete safeUser.password;

    res.status(200).json({
      success: true,
      token,
      user: safeUser
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Demo Login (instant access for evaluation)
exports.demoLogin = async (req, res) => {
  try {
    let demoUser = await User.findOne({ email: 'demo@funnelpro.io' });

    if (!demoUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Password123!', salt);

      demoUser = await User.create({
        name: 'Alex Vance',
        email: 'demo@funnelpro.io',
        password: hashedPassword,
        businessName: 'Vance Growth Ventures',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        bio: '7-Figure Funnel Strategist & SaaS Entrepreneur',
        role: 'admin',
        emailVerified: true
      });
    }

    const token = generateToken(demoUser._id);
    const safeUser = { ...demoUser };
    delete safeUser.password;

    res.status(200).json({
      success: true,
      token,
      user: safeUser,
      message: 'Logged in as Demo User with full sample data'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get current logged in user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const safeUser = { ...user };
    delete safeUser.password;

    res.status(200).json({
      success: true,
      user: safeUser
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, businessName, bio, avatar, settings } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (businessName) user.businessName = businessName;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;
    if (settings) user.settings = { ...user.settings, ...settings };

    await user.save();

    const safeUser = { ...user };
    delete safeUser.password;

    res.status(200).json({
      success: true,
      user: safeUser,
      message: 'Profile updated successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Update password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account with that email was found' });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'funnelpro_super_secret_jwt_key_2026_production', {
      expiresIn: '1h'
    });

    res.status(200).json({
      success: true,
      message: 'Password reset link generated successfully',
      resetToken,
      resetUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide token and new password' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'funnelpro_super_secret_jwt_key_2026_production');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now login.'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }
};


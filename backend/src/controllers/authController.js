import { Op } from 'sequelize';
import User from '../models/User.js';
import { generateToken } from '../utils/helpers.js';

// Enhanced validation utilities
const validateEmail = (email) => {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 8;
};

export const register = async (req, res) => {
  try {
    const { email, password, name, phone, dateOfBirth, gender } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      email,
      password,
      name,
      phone: phone || null,
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
    });

    user.lastActive = new Date();
    user.isOnline = true;
    await user.save();

    const token = generateToken(user.id);

    res.status(201).json({ token, user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account deactivated' });
    }

    user.lastActive = new Date();
    user.isOnline = true;
    await user.save();

    const token = generateToken(user.id);

    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

export const socialLogin = async (req, res) => {
  try {
    const { email, name, provider, providerId } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required for social login' });
    }

    let user = await User.findOne({
      where: { [Op.or]: [{ email }] },
    });

    if (!user) {
      user = await User.create({
        email,
        name: name || 'User',
        password: Math.random().toString(36).slice(-12),
        isVerified: true,
      });
    }

    user.lastActive = new Date();
    user.isOnline = true;
    await user.save();

    const token = generateToken(user.id);
    res.json({ token, user });
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ message: 'Social login failed. Please try again.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.lastActive = new Date();
    user.isOnline = true;
    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user information' });
  }
};

export const logout = async (req, res) => {
  try {
    await User.update(
      { isOnline: false, lastActive: new Date() },
      { where: { id: req.userId } }
    );
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed. Please try again.' });
  }
};

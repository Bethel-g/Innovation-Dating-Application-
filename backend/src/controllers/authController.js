import { Op } from 'sequelize';
import User from '../models/User.js';
import { generateToken } from '../utils/helpers.js';

export const register = async (req, res) => {
  try {
    const { email, password, name, phone, dateOfBirth, gender } = req.body;

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

    const token = generateToken(user.id);

    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

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
    res.status(500).json({ message: error.message });
  }
};

export const socialLogin = async (req, res) => {
  try {
    const { email, name, provider, providerId } = req.body;

    let user = await User.findOne({
      where: { [Op.or]: [{ email }] },
    });

    if (!user) {
      user = await User.create({
        email,
        name,
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
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};

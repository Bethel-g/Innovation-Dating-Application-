import { Op } from 'sequelize';
import User from '../models/User.js';
import Report from '../models/Report.js';
import Follow from '../models/Follow.js';
import Post from '../models/Post.js';
import { calculateAge } from '../utils/helpers.js';
import { calculateInnovationScore, generatePersonalityProfile } from '../services/aiService.js';

export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'name', 'bio', 'dateOfBirth', 'gender', 'interestedIn', 'interests',
      'healthSpecialty', 'workSetting', 'innovationFocus', 'personalityTraits',
      'certifications', 'education', 'yearsOfExperience',
      'collaborationIntent', 'lookingForTeam', 'availableForProjects',
    ];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.healthSpecialty || updates.yearsOfExperience !== undefined) {
      const user = await User.findByPk(req.userId);
      const merged = { ...user.toJSON(), ...updates };
      updates.innovationScore = calculateInnovationScore(merged);
    }

    if (req.body.preferences) {
      const { ageRange, maxDistance, genderPreference } = req.body.preferences;
      if (ageRange?.min) updates.ageRangeMin = ageRange.min;
      if (ageRange?.max) updates.ageRangeMax = ageRange.max;
      if (maxDistance) updates.maxDistance = maxDistance;
      if (genderPreference) updates.genderPreference = genderPreference;
    }

    if (req.body.location) {
      if (req.body.location.coordinates) {
        updates.locationLng = req.body.location.coordinates[0];
        updates.locationLat = req.body.location.coordinates[1];
      }
      if (req.body.location.city) updates.locationCity = req.body.location.city;
      if (req.body.location.country) updates.locationCountry = req.body.location.country;
    }

    const [affected] = await User.update(updates, { where: { id: req.userId } });
    if (!affected) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await User.findByPk(req.userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'dailySwipes', 'maxDailySwipes', 'isActive'] },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [followersCount, followingCount, postCount, isFollowing] = await Promise.all([
      Follow.count({ where: { following: user.id } }),
      Follow.count({ where: { follower: user.id } }),
      Post.count({ where: { author: user.id, isDraft: false } }),
      Follow.findOne({ where: { follower: req.userId, following: user.id } }),
    ]);

    const personalityProfile = generatePersonalityProfile(user);

    res.json({
      ...user.toJSON(),
      followersCount,
      followingCount,
      postCount,
      isFollowing: !!isFollowing,
      personalityProfile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadPhotos = async (req, res) => {
  try {
    const files = req.files;
    if (!files?.length) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const newPhotos = files.map((file, index) => ({
      url: `/uploads/${file.filename}`,
      isPrimary: index === 0,
    }));

    const user = await User.findByPk(req.userId);
    const existingPhotos = user.photos || [];
    const photos = [...existingPhotos, ...newPhotos];

    await User.update({ photos }, { where: { id: req.userId } });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    const user = await User.findByPk(req.userId);
    const photos = (user.photos || []).filter(p => p._id !== photoId && p.id !== photoId);
    await User.update({ photos }, { where: { id: req.userId } });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const setPrimaryPhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const photos = (user.photos || []).map(p => ({
      ...p,
      isPrimary: (p._id || p.id) === photoId,
    }));

    await User.update({ photos }, { where: { id: req.userId } });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const { ageRange, maxDistance, genderPreference } = req.body;
    await User.update(
      {
        ageRangeMin: ageRange?.min ?? undefined,
        ageRangeMax: ageRange?.max ?? undefined,
        maxDistance: maxDistance ?? undefined,
        genderPreference: genderPreference ?? undefined,
      },
      { where: { id: req.userId } }
    );
    const user = await User.findByPk(req.userId);
    res.json({
      ageRange: { min: user.ageRangeMin, max: user.ageRangeMax },
      maxDistance: user.maxDistance,
      genderPreference: user.genderPreference,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, city, country } = req.body;
    await User.update(
      {
        locationLat: latitude ?? undefined,
        locationLng: longitude ?? undefined,
        locationCity: city ?? undefined,
        locationCountry: country ?? undefined,
      },
      { where: { id: req.userId } }
    );
    const user = await User.findByPk(req.userId);
    res.json({
      latitude: user.locationLat,
      longitude: user.locationLng,
      city: user.locationCity,
      country: user.locationCountry,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const completeOnboarding = async (req, res) => {
  try {
    await User.update({ onboardingComplete: true }, { where: { id: req.userId } });
    const user = await User.findByPk(req.userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNearbyUsers = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    const { maxDistance = 50 } = req.query;

    const nearby = await User.findAll({
      where: {
        id: { [Op.ne]: req.userId },
        isActive: true,
      },
      attributes: { exclude: ['password'] },
      limit: 50,
    });

    res.json(nearby);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reportUser = async (req, res) => {
  try {
    const { reportedUserId, reason, description } = req.body;

    if (req.userId === reportedUserId) {
      return res.status(400).json({ message: 'Cannot report yourself' });
    }

    const existing = await Report.findOne({
      where: { reporter: req.userId, reported: reportedUserId, status: 'pending' },
    });

    if (existing) {
      return res.status(400).json({ message: 'Already reported this user' });
    }

    const report = await Report.create({
      reporter: req.userId,
      reported: reportedUserId,
      reason,
      description,
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deactivateAccount = async (req, res) => {
  try {
    await User.update({ isActive: false }, { where: { id: req.userId } });
    res.json({ message: 'Account deactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

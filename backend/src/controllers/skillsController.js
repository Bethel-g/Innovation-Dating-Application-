import User from '../models/User.js';
import { endorseSkill as reputationEndorseSkill, getUserEndorsements as reputationGetUserEndorsements, addContribution } from './reputationController.js';

export const endorse = async (req, res) => {
  req.body = { ...req.body, userId: req.params.userId };
  return reputationEndorseSkill(req, res);
};

export const getEndorsements = async (req, res) => {
  return reputationGetUserEndorsements(req, res);
};

export const addSkill = async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill) return res.status(400).json({ message: 'Skill is required' });

    const user = await User.findByPk(req.userId);
    const skills = Array.isArray(user.skills) ? user.skills : [];
    if (!skills.includes(skill)) {
      skills.push(skill);
      await user.update({ skills });
      await addContribution(req.userId, 'skill_added');
    }

    res.json({ message: 'Skill added', skills });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeSkill = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    const skills = Array.isArray(user.skills) ? user.skills : [];
    const next = skills.filter(s => s !== req.params.skill);
    await user.update({ skills: next });

    res.json({ message: 'Skill removed', skills: next });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
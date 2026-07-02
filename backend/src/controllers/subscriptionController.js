import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import { createNotification } from '../services/notificationService.js';

const TIER_FEATURES = {
  free: {
    unlimitedSwipes: false,
    advancedFilters: false,
    profileBoost: false,
    incognitoMode: false,
    readReceipts: false,
    maxDailySwipes: 50,
  },
  premium: {
    unlimitedSwipes: true,
    advancedFilters: true,
    profileBoost: false,
    incognitoMode: false,
    readReceipts: true,
    maxDailySwipes: -1,
  },
  vip: {
    unlimitedSwipes: true,
    advancedFilters: true,
    profileBoost: true,
    incognitoMode: true,
    readReceipts: true,
    maxDailySwipes: -1,
  },
};

export const getCurrentSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: { user: req.userId, isActive: true },
    });
    const user = await User.findByPk(req.userId);

    res.json({
      tier: user.subscriptionTier,
      subscription: subscription || null,
      features: TIER_FEATURES[user.subscriptionTier] || TIER_FEATURES.free,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const upgradeSubscription = async (req, res) => {
  try {
    const { tier } = req.body;
    if (!['premium', 'vip'].includes(tier)) {
      return res.status(400).json({ message: 'Invalid tier' });
    }

    const user = await User.findByPk(req.userId);
    if (user.subscriptionTier === tier) {
      return res.status(400).json({ message: `Already on ${tier} plan` });
    }

    const existing = await Subscription.findOne({
      where: { user: req.userId, isActive: true },
    });

    if (existing) {
      existing.isActive = false;
      await existing.save();
    }

    const prices = { premium: 19.99, vip: 39.99 };

    const subscription = await Subscription.create({
      user: req.userId,
      tier,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      autoRenew: true,
      amount: prices[tier],
      features: TIER_FEATURES[tier],
    });

    user.subscriptionTier = tier;
    user.maxDailySwipes = TIER_FEATURES[tier].maxDailySwipes === -1 ? 999999 : TIER_FEATURES[tier].maxDailySwipes;
    await user.save();

    await createNotification({
      user: req.userId,
      type: 'subscription',
      title: 'Subscription Upgraded!',
      body: `You're now on the ${tier} plan! Enjoy your new features.`,
    });

    res.json({ subscription, features: TIER_FEATURES[tier] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const [affected] = await Subscription.update(
      { autoRenew: false },
      { where: { user: req.userId, isActive: true } }
    );

    if (!affected) return res.status(404).json({ message: 'No active subscription found' });

    const subscription = await Subscription.findOne({ where: { user: req.userId, isActive: true } });

    await createNotification({
      user: req.userId,
      type: 'subscription',
      title: 'Subscription Cancelled',
      body: 'Your subscription will end at the current billing period.',
    });

    res.json({ message: 'Subscription cancelled', subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubscriptionHistory = async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll({
      where: { user: req.userId },
      order: [['createdAt', 'DESC']],
    });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAvailablePlans = async (req, res) => {
  res.json({
    free: { name: 'Free', price: 0, features: TIER_FEATURES.free },
    premium: { name: 'Premium', price: 19.99, features: TIER_FEATURES.premium },
    vip: { name: 'VIP', price: 39.99, features: TIER_FEATURES.vip },
  });
};

import { Op } from 'sequelize';
import Notification from '../models/Notification.js';
import NotificationCampaign from '../models/NotificationCampaign.js';
import NotificationPreference from '../models/NotificationPreference.js';
import User from '../models/User.js';
import { jsonbContains } from '../utils/jsonContains.js';
import { NOTIFICATION_CHANNEL } from '../config/constants.js';

export const createNotification = async ({ user, type, title, body, data = {} }) => {
  try {
    const notification = await Notification.create({ user, type, title, body, data });

    if (global.io) {
      global.io.to(`user:${user}`).emit('notification', notification.toJSON());
    }

    return notification;
  } catch (error) {
    console.error('Notification creation failed:', error);
  }
};

export const isChannelEnabled = async (userId, channel, eventType) => {
  const prefs = await NotificationPreference.findAll({ where: { user: userId } });
  if (!prefs.length) return true;
  const match = prefs.find(p => p.channel === channel && p.eventType === eventType);
  return match ? match.enabled : true;
};

export const dispatch = async ({ user, type, title, body, data = {}, email = null }) => {
  const created = [];

  if (await isChannelEnabled(user, NOTIFICATION_CHANNEL.IN_APP, type)) {
    created.push(await createNotification({ user, type, title, body, data }));
  }

  if (email && await isChannelEnabled(user, NOTIFICATION_CHANNEL.EMAIL, type)) {
    const { sendEmail } = await import('./emailService.js');
    await sendEmail({ to: email, subject: title, text: body });
  }

  return created;
};

export const sendMatchNotification = async (user1Id, user2Id) => {
  const [user1, user2] = await Promise.all([
    User.findByPk(user1Id),
    User.findByPk(user2Id),
  ]);

  await Promise.all([
    createNotification({
      user: user1Id, type: 'new_match', title: 'New Match!',
      body: `You matched with ${user2.name}! Start a conversation.`,
      data: { matchedUserId: user2Id },
    }),
    createNotification({
      user: user2Id, type: 'new_match', title: 'New Match!',
      body: `You matched with ${user1.name}! Start a conversation.`,
      data: { matchedUserId: user1Id },
    }),
  ]);
};

export const sendLikeNotification = async (fromUserId, toUserId, type = 'profile_like') => {
  const fromUser = await User.findByPk(fromUserId);
  await createNotification({
    user: toUserId, type,
    title: type === 'super_like' ? 'Super Like!' : 'New Like',
    body: `${fromUser.name} ${type === 'super_like' ? 'super liked' : 'liked'} your profile!`,
    data: { likedByUserId: fromUserId },
  });
};

export const sendMessageNotification = async (matchId, senderId, receiverId, content) => {
  const sender = await User.findByPk(senderId);
  await createNotification({
    user: receiverId, type: 'new_message',
    title: `New message from ${sender.name}`,
    body: content.substring(0, 100),
    data: { matchId, senderId },
  });
};

export const sendSuggestionNotification = async (userId, suggestedUserId, score) => {
  const suggestedUser = await User.findByPk(suggestedUserId);
  await createNotification({
    user: userId, type: 'suggestion',
    title: 'High Compatibility Match!',
    body: `${suggestedUser.name} is a ${score}% match based on your interests!`,
    data: { suggestedUserId, compatibilityScore: score },
  });
};

export const processCampaign = async (campaignId) => {
  const campaign = await NotificationCampaign.findByPk(campaignId);
  if (!campaign || campaign.status !== 'scheduled') return;

  campaign.status = 'sending';
  await campaign.save();

  const where = {};
  const { targetAudience } = campaign;

  if (targetAudience?.gender?.length) where.gender = { [Op.in]: targetAudience.gender };
  if (targetAudience?.subscriptionTier?.length) where.subscriptionTier = { [Op.in]: targetAudience.subscriptionTier };
  if (targetAudience?.interests?.length) {
    where[Op.or] = targetAudience.interests.map(i => jsonbContains('interests', i));
  }
  if (targetAudience?.isVerified !== undefined) where.isVerified = targetAudience.isVerified;
  if (targetAudience?.location?.city) where.locationCity = targetAudience.location.city;
  if (targetAudience?.ageRange) {
    const minDate = new Date(); minDate.setFullYear(minDate.getFullYear() - targetAudience.ageRange.max);
    const maxDate = new Date(); maxDate.setFullYear(maxDate.getFullYear() - targetAudience.ageRange.min);
    where.dateOfBirth = { [Op.between]: [minDate, maxDate] };
  }

  const targetUsers = await User.findAll({ where, attributes: ['id'] });
  const notifications = targetUsers.map(u => ({
    user: u.id, type: 'admin', title: campaign.title, body: campaign.body, campaignId: campaign.id,
  }));

  await Notification.bulkCreate(notifications);
  campaign.sentCount = targetUsers.length;
  campaign.status = 'sent';
  await campaign.save();

  targetUsers.forEach(u => {
    if (global.io) {
      global.io.to(`user:${u.id}`).emit('notification', { title: campaign.title, body: campaign.body });
    }
  });
};

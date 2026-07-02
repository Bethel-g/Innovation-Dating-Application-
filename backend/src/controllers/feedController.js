import { Op, fn, col } from 'sequelize';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import Follow from '../models/Follow.js';
import { jsonbContains } from '../utils/jsonContains.js';
import User from '../models/User.js';

export const createPost = async (req, res) => {
  try {
    const post = await Post.create({ ...req.body, author: req.userId });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const following = await Follow.findAll({
      where: { follower: req.userId },
      attributes: ['following'],
    });
    const followingIds = following.map(f => f.following);
    followingIds.push(req.userId);

    const posts = await Post.findAll({
      where: { author: { [Op.in]: followingIds }, isDraft: false },
      order: [['createdAt', 'DESC']],
      offset: parseInt(offset),
      limit: parseInt(limit),
    });

    const authorIds = [...new Set(posts.map(p => p.author))];
    const authors = await User.findAll({
      where: { id: authorIds },
      attributes: ['id', 'name', 'photos', 'healthSpecialty', 'innovationFocus'],
    });
    const authorMap = Object.fromEntries(authors.map(a => [a.id, a.toJSON()]));

    const postIds = posts.map(p => p.id);
    const likes = await Like.findAll({ where: { targetType: 'post', targetId: postIds, user: req.userId } });
    const likedIds = new Set(likes.map(l => l.targetId));

    const enriched = posts.map(p => ({
      ...p.toJSON(),
      author: authorMap[p.author] || { id: p.author },
      isLikedByMe: likedIds.has(p.id),
    }));

    const total = await Post.count({ where: { author: { [Op.in]: followingIds }, isDraft: false } });

    res.json({ posts: enriched, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExploreFeed = async (req, res) => {
  try {
    const { page = 1, limit = 20, specialty, focus } = req.query;
    const offset = (page - 1) * limit;

    const userFilter = { isActive: true };
    if (specialty) userFilter.healthSpecialty = specialty;
    if (focus) userFilter.innovationFocus = focus;

    const users = await User.findAll({ where: userFilter, attributes: ['id'] });
    const userIds = users.map(u => u.id);

    const conditions = [{ author: { [Op.in]: userIds }, isDraft: false }];
    if (req.query.tag) conditions.push(jsonbContains('hashtags', req.query.tag));

    const posts = await Post.findAll({
      where: { [Op.and]: conditions },
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit),
    });

    const authorIds = [...new Set(posts.map(p => p.author))];
    const authors = await User.findAll({
      where: { id: authorIds },
      attributes: ['id', 'name', 'photos', 'healthSpecialty', 'innovationFocus'],
    });
    const authorMap = Object.fromEntries(authors.map(a => [a.id, a.toJSON()]));

    const postIds = posts.map(p => p.id);
    const likes = await Like.findAll({ where: { targetType: 'post', targetId: postIds, user: req.userId } });
    const likedIds = new Set(likes.map(l => l.targetId));

    const enriched = posts.map(p => ({
      ...p.toJSON(),
      author: authorMap[p.author] || { id: p.author },
      isLikedByMe: likedIds.has(p.id),
    }));

    const total = await Post.count({ where });

    res.json({ posts: enriched, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const targetUserId = req.params.userId || req.userId;

    const posts = await Post.findAll({
      where: { author: targetUserId, isDraft: false },
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });

    const postIds = posts.map(p => p.id);
    const likes = await Like.findAll({ where: { targetType: 'post', targetId: postIds, user: req.userId } });
    const likedIds = new Set(likes.map(l => l.targetId));

    const enriched = posts.map(p => ({
      ...p.toJSON(),
      isLikedByMe: likedIds.has(p.id),
    }));

    const total = await Post.count({ where: { author: targetUserId, isDraft: false } });
    res.json({ posts: enriched, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author !== req.userId) return res.status(403).json({ message: 'Not authorized' });

    await post.update(req.body);
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author !== req.userId) return res.status(403).json({ message: 'Not authorized' });

    await Comment.destroy({ where: { post: post.id } });
    await Like.destroy({ where: { targetType: 'post', targetId: post.id } });
    await post.destroy();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const existing = await Like.findOne({ where: { user: req.userId, targetType: 'post', targetId: req.params.id } });
    if (existing) {
      await existing.destroy();
      await post.decrement('likeCount');
      return res.json({ liked: false, likeCount: post.likeCount - 1 });
    }

    await Like.create({ user: req.userId, targetType: 'post', targetId: req.params.id });
    await post.increment('likeCount');
    res.json({ liked: true, likeCount: post.likeCount + 1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { post: req.params.id, parentComment: null },
      order: [['createdAt', 'ASC']],
    });

    const userIds = [...new Set(comments.map(c => c.author))];
    const users = await User.findAll({
      where: { id: userIds },
      attributes: ['id', 'name', 'photos'],
    });
    const userMap = Object.fromEntries(users.map(u => [u.id, u.toJSON()]));

    const enriched = comments.map(c => ({
      ...c.toJSON(),
      author: userMap[c.author] || { id: c.author },
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await Comment.create({
      post: req.params.postId,
      author: req.userId,
      content: req.body.content,
      parentComment: req.body.parentComment || null,
    });
    await post.increment('commentCount');

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author !== req.userId) return res.status(403).json({ message: 'Not authorized' });

    await Post.decrement('commentCount', { where: { id: comment.post } });
    await Like.destroy({ where: { targetType: 'comment', targetId: comment.id } });
    await comment.destroy();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const followUser = async (req, res) => {
  try {
    const targetId = req.params.userId;
    if (targetId === req.userId) return res.status(400).json({ message: 'Cannot follow yourself' });

    const target = await User.findByPk(targetId);
    if (!target) return res.status(404).json({ message: 'User not found' });

    const existing = await Follow.findOne({ where: { follower: req.userId, following: targetId } });
    if (existing) {
      await existing.destroy();
      return res.json({ following: false });
    }

    await Follow.create({ follower: req.userId, following: targetId });
    res.json({ following: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const targetId = req.params.userId || req.userId;
    const follows = await Follow.findAll({ where: { following: targetId } });
    const userIds = follows.map(f => f.follower);

    const users = await User.findAll({
      where: { id: userIds },
      attributes: ['id', 'name', 'photos', 'healthSpecialty'],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const targetId = req.params.userId || req.userId;
    const follows = await Follow.findAll({ where: { follower: targetId } });
    const userIds = follows.map(f => f.following);

    const users = await User.findAll({
      where: { id: userIds },
      attributes: ['id', 'name', 'photos', 'healthSpecialty'],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFollowCounts = async (req, res) => {
  try {
    const targetId = req.params.userId || req.userId;
    const [followers, following] = await Promise.all([
      Follow.count({ where: { following: targetId } }),
      Follow.count({ where: { follower: targetId } }),
    ]);
    res.json({ followers, following });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

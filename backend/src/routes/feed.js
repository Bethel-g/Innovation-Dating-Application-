import express from 'express';
import {
  createPost, getFeed, getExploreFeed, getUserPosts,
  updatePost, deletePost, likePost,
  getPostComments, addComment, deleteComment,
  followUser, getFollowers, getFollowing, getFollowCounts,
} from '../controllers/feedController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', createPost);
router.get('/feed', getFeed);
router.get('/explore', getExploreFeed);
router.get('/user/:userId?', getUserPosts);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.post('/:id/like', likePost);

router.get('/:id/comments', getPostComments);
router.post('/:postId/comments', addComment);
router.delete('/comments/:commentId', deleteComment);

router.post('/follow/:userId', followUser);
router.get('/follow/followers/:userId?', getFollowers);
router.get('/follow/following/:userId?', getFollowing);
router.get('/follow/counts/:userId?', getFollowCounts);

export default router;

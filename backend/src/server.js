import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';

import connectDB, { isDBReady } from './config/db.js';
import { setupSocket } from './socket/index.js';
import './models/User.js';
import './models/Match.js';
import './models/Message.js';
import './models/Notification.js';
import './models/NotificationCampaign.js';
import './models/Report.js';
import './models/Subscription.js';
import './models/Admin.js';
import './models/Post.js';
import './models/Comment.js';
import './models/Like.js';
import './models/Follow.js';
import './models/Project.js';
import './models/ProjectMember.js';
import './models/Community.js';
import './models/CommunityMember.js';
import './models/Task.js';
import './models/Idea.js';
import './models/Badge.js';
import './models/Contribution.js';
import './models/Endorsement.js';
import './models/Review.js';
import './models/GroupMessage.js';
import './models/ActivityLog.js';
import './models/SharedFile.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import matchRoutes from './routes/matches.js';
import chatRoutes from './routes/chat.js';
import notificationRoutes from './routes/notifications.js';
import subscriptionRoutes from './routes/subscriptions.js';
import adminRoutes from './routes/admin.js';
import feedRoutes from './routes/feed.js';
import User from './models/User.js';
import projectRoutes from './routes/projects.js';
import communityRoutes from './routes/communities.js';
import taskRoutes from './routes/tasks.js';
import ideaRoutes from './routes/ideas.js';
import reputationRoutes from './routes/reputation.js';
import groupRoutes from './routes/groups.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use((req, res, next) => {
  if (!isDBReady()) {
    if (req.path === '/api/health') {
      return res.json({ status: 'degraded', db: 'disconnected' });
    }
    return res.status(503).json({ message: 'Database not connected.' });
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/reputation', reputationRoutes);
app.use('/api/groups', groupRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: isDBReady() ? 'ok' : 'degraded',
    db: isDBReady() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

setupSocket(io);

// Reset daily swipes at midnight every day
cron.schedule('0 0 * * *', async () => {
  try {
    await User.update({ dailySwipes: 0 }, { where: {} });
    console.log('Daily swipes reset at', new Date().toISOString());
  } catch (err) {
    console.error('Failed to reset daily swipes:', err.message);
  }
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log('Database connected');
  })
  .catch((err) => {
    console.warn('Warning: Database connection failed — server still running, but routes will return 503');
  })
  .finally(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`DB status: ${isDBReady() ? 'connected' : 'disconnected'}`);
    });
  });

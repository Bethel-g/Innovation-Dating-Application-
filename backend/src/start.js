import dotenv from 'dotenv';
dotenv.config();

const args = process.argv.slice(2);

if (args.includes('--seed')) {
  // Load all models so they register with Sequelize before sync
  await import('./models/User.js');
  await import('./models/Match.js');
  await import('./models/Message.js');
  await import('./models/Notification.js');
  await import('./models/NotificationCampaign.js');
  await import('./models/Report.js');
  await import('./models/Subscription.js');
  await import('./models/Admin.js');
  await import('./models/Post.js');
  await import('./models/Comment.js');
  await import('./models/Like.js');
  await import('./models/Follow.js');
  await import('./models/Project.js');
  await import('./models/ProjectMember.js');
  await import('./models/Community.js');
  await import('./models/CommunityMember.js');

  const { default: connectDB } = await import('./config/db.js');
  await connectDB();
  const { default: seed } = await import('./seed.js');
  await seed();
  console.log('Seed complete. Exiting.');
  process.exit(0);
} else {
  await import('./server.js');
}

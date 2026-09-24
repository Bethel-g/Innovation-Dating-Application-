import dotenv from 'dotenv';
dotenv.config();

const args = process.argv.slice(2);

(async () => {
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
    await import('./models/Task.js');
    await import('./models/Idea.js');
    await import('./models/Badge.js');
    await import('./models/Contribution.js');
    await import('./models/Endorsement.js');
    await import('./models/Review.js');
    await import('./models/GroupMessage.js');
    await import('./models/ActivityLog.js');
    await import('./models/SharedFile.js');
    await import('./models/VerificationRequest.js');
    await import('./models/Bookmark.js');
    await import('./models/NotificationPreference.js');
    await import('./models/Organization.js');
    await import('./models/Opportunity.js');
    await import('./models/OpportunityApplication.js');
    await import('./models/TeamRole.js');
    await import('./models/RoleApplication.js');
    await import('./models/Team.js');
    await import('./models/TeamMember.js');
    await import('./models/Connection.js');
    await import('./models/MentorshipSession.js');
    await import('./models/IdeaComment.js');
    await import('./models/Job.js');
    await import('./models/JobApplication.js');
    await import('./models/JobSave.js');
    await import('./models/Event.js');
    await import('./models/EventRegistration.js');
    await import('./models/associations.js');

    const { default: connectDB } = await import('./config/db.js');
    await connectDB();
    const { default: seed } = await import('./seed.js');
    await seed();
    console.log('Seed complete. Exiting.');
    process.exit(0);
  } else {
    const serverModule = await import('./server.js');
    const http = serverModule.default || serverModule.httpServer || serverModule.server;
    if (http && typeof http.listen === 'function') {
      if (process.env.NODE_ENV !== 'test') {
        http.listen(process.env.PORT || 5000, () => {
          console.log('Server running');
        });
      }
    }
  }
})();

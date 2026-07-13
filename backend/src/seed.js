import User from './models/User.js';
import Follow from './models/Follow.js';
import Post from './models/Post.js';
import Project from './models/Project.js';
import ProjectMember from './models/ProjectMember.js';
import Community from './models/Community.js';
import CommunityMember from './models/CommunityMember.js';

const seed = async () => {
  console.log('Seeding database...');

  const users = [
    {
      email: 'admin@innovationdating.com',
      password: 'admin123',
      name: 'Platform Admin',
      role: 'admin',
      headline: 'Platform Administrator & Community Manager',
      isVerified: true,
      isActive: true,
      onboardingComplete: true,
      permissions: {
        userManagement: true, contentModeration: true, analytics: true,
        adminManagement: true, notificationManagement: true, subscriptionManagement: true,
      },
      skills: ['community_management', 'product_management', 'data_analysis'],
      intents: ['mentor', 'collaborate'],
      experienceLevel: 'senior',
      yearsOfExperience: 12,
    },
    {
      email: 'sarah@example.com',
      password: 'password123',
      name: 'Sarah Chen',
      role: 'user',
      headline: 'Full-Stack Developer & AI Enthusiast',
      isVerified: true,
      isActive: true,
      onboardingComplete: true,
      bio: 'Full-stack developer passionate about AI and building products that make a difference. Open to collaboration on interesting projects.',
      skills: ['javascript', 'python', 'react', 'nodejs', 'typescript', 'machine_learning', 'postgresql'],
      primarySkills: ['react', 'python', 'typescript'],
      secondarySkills: ['machine_learning', 'nodejs', 'postgresql'],
      intents: ['collaborate', 'get_hired'],
      interests: ['ai', 'open_source', 'startup_ideas', 'hiking', 'photography'],
      experienceLevel: 'mid',
      yearsOfExperience: 6,
      locationLat: 37.7749,
      locationLng: -122.4194,
      locationCity: 'San Francisco',
      locationCountry: 'United States',
      availableForProjects: true,
      lookingForTeam: true,
      githubUrl: 'https://github.com/sarahchen',
      personalityTraits: ['analytical', 'creative', 'collaborative'],
      education: { degree: 'BS Computer Science', school: 'UC Berkeley', year: 2018 },
    },
    {
      email: 'marcus@example.com',
      password: 'password123',
      name: 'Marcus Johnson',
      role: 'user',
      headline: 'Product Manager & Startup Founder | HealthTech',
      isVerified: true,
      isActive: true,
      onboardingComplete: true,
      bio: 'Digital health entrepreneur with a passion for building products that improve lives. Founded a telemedicine platform serving 50K+ patients.',
      skills: ['product_management', 'business_development', 'startup', 'fundraising', 'strategy', 'healthcare'],
      primarySkills: ['product_management', 'business_development', 'startup'],
      secondarySkills: ['fundraising', 'strategy', 'healthcare'],
      intents: ['hire', 'collaborate'],
      interests: ['healthtech', 'startup_ideas', 'digital_therapeutics', 'cooking', 'hiking'],
      experienceLevel: 'senior',
      yearsOfExperience: 10,
      locationLat: 37.7749,
      locationLng: -122.4194,
      locationCity: 'San Francisco',
      locationCountry: 'United States',
      lookingForTeam: true,
      availableForProjects: true,
      personalityTraits: ['visionary', 'collaborative', 'strategic'],
      education: { degree: 'MPH', school: 'Johns Hopkins', year: 2016 },
    },
    {
      email: 'priya@example.com',
      password: 'password123',
      name: 'Priya Patel',
      role: 'user',
      headline: 'UX Designer & Researcher | Neuroscience Background',
      isVerified: true,
      isActive: true,
      onboardingComplete: true,
      bio: 'UX designer with a PhD in Neuroscience. I bridge the gap between human cognition and digital experiences.',
      skills: ['ui_design', 'ux_design', 'figma', 'user_research', 'prototyping', 'design_systems', 'data_analysis'],
      primarySkills: ['ux_design', 'figma', 'user_research'],
      secondarySkills: ['prototyping', 'design_systems', 'data_analysis'],
      intents: ['collaborate', 'learn'],
      interests: ['neuroscience', 'mental_health', 'wearable_tech', 'meditation', 'photography'],
      experienceLevel: 'senior',
      yearsOfExperience: 5,
      locationLat: 37.7749,
      locationLng: -122.4194,
      locationCity: 'San Francisco',
      locationCountry: 'United States',
      availableForProjects: true,
      lookingForTeam: true,
      portfolioUrls: ['https://priyapatel.design'],
      personalityTraits: ['analytical', 'empathetic', 'creative'],
      education: { degree: 'PhD Neuroscience', school: 'UC Berkeley', year: 2021 },
    },
    {
      email: 'alex@example.com',
      password: 'password123',
      name: 'Alex Rivera',
      role: 'user',
      headline: 'AI Engineer & Digital Therapeutics Founder',
      isVerified: true,
      isActive: true,
      onboardingComplete: true,
      bio: 'AI engineer turned entrepreneur. Building mental health tools using NLP and computer vision.',
      skills: ['python', 'machine_learning', 'deep_learning', 'nlp', 'computer_vision', 'react', 'aws'],
      primarySkills: ['python', 'machine_learning', 'deep_learning'],
      secondarySkills: ['nlp', 'computer_vision', 'aws'],
      intents: ['hire', 'collaborate', 'mentor'],
      interests: ['ai', 'mental_health', 'digital_therapeutics', 'music', 'cycling'],
      experienceLevel: 'senior',
      yearsOfExperience: 12,
      locationLat: 40.7128,
      locationLng: -74.0060,
      locationCity: 'New York',
      locationCountry: 'United States',
      lookingForTeam: true,
      availableForProjects: true,
      isMentor: true,
      mentorExpertise: ['machine_learning', 'ai', 'startup'],
      personalityTraits: ['empathetic', 'visionary', 'innovative'],
      education: { degree: 'MD', school: 'Columbia University', year: 2014 },
    },
    {
      email: 'emma@example.com',
      password: 'password123',
      name: 'Emma Watson',
      role: 'user',
      headline: 'MedTech Engineer & Hardware Prototyper',
      isVerified: true,
      isActive: true,
      onboardingComplete: true,
      bio: 'Biomedical engineer specializing in wearable biosensors. I turn concepts into working prototypes.',
      skills: ['embedded_systems', 'python', 'data_analysis', 'iot', 'hardware_design', 'flutter'],
      primarySkills: ['embedded_systems', 'iot', 'hardware_design'],
      secondarySkills: ['python', 'data_analysis', 'flutter'],
      intents: ['collaborate', 'get_hired'],
      interests: ['medtech', 'biosensors', 'wearable_tech', 'swimming', 'robotics'],
      experienceLevel: 'mid',
      yearsOfExperience: 7,
      locationLat: 37.7749,
      locationLng: -122.4194,
      locationCity: 'San Francisco',
      locationCountry: 'United States',
      availableForProjects: true,
      personalityTraits: ['detail_oriented', 'creative', 'pragmatic'],
      certifications: ['Biomedical Engineering', 'ISO 13485 Lead Auditor'],
      education: { degree: 'MEng', school: 'MIT', year: 2017 },
    },
    {
      email: 'james@example.com',
      password: 'password123',
      name: 'James Kim',
      role: 'user',
      headline: 'Data Scientist & Health Equity Researcher',
      isVerified: true,
      isActive: true,
      onboardingComplete: true,
      bio: 'Data scientist focused on using analytics to improve healthcare access for underserved communities.',
      skills: ['python', 'data_science', 'statistics', 'machine_learning', 'sql', 'research', 'data_visualization'],
      primarySkills: ['data_science', 'statistics', 'machine_learning'],
      secondarySkills: ['python', 'sql', 'data_visualization'],
      intents: ['collaborate', 'learn'],
      interests: ['public_health', 'health_equity', 'data_science', 'volunteering', 'cooking'],
      experienceLevel: 'senior',
      yearsOfExperience: 9,
      locationLat: 40.7128,
      locationLng: -74.0060,
      locationCity: 'New York',
      locationCountry: 'United States',
      availableForProjects: true,
      personalityTraits: ['analytical', 'empathetic', 'big_picture'],
      certifications: ['Certified Health Equity Specialist'],
      education: { degree: 'DrPH', school: 'Harvard', year: 2019 },
    },
  ];

  for (const userData of users) {
    await User.destroy({ where: { email: userData.email } });
    const user = await User.create(userData);
    const pwOk = await user.comparePassword(userData.password);
    console.log(`${userData.email} / ${userData.password} — role: ${user.role} — password: ${pwOk ? 'OK' : 'FAIL'}`);
  }

  const allUsers = await User.findAll({ where: { isActive: true }, attributes: ['id', 'email'] });

  const followPairs = [
    ['sarah@example.com', 'marcus@example.com'],
    ['sarah@example.com', 'emma@example.com'],
    ['marcus@example.com', 'sarah@example.com'],
    ['marcus@example.com', 'priya@example.com'],
    ['priya@example.com', 'marcus@example.com'],
    ['priya@example.com', 'alex@example.com'],
    ['emma@example.com', 'sarah@example.com'],
    ['james@example.com', 'alex@example.com'],
    ['alex@example.com', 'james@example.com'],
  ];

  const emailToId = Object.fromEntries(allUsers.map(u => [u.email, u.id]));

  for (const [followerEmail, followingEmail] of followPairs) {
    await Follow.findOrCreate({
      where: { follower: emailToId[followerEmail], following: emailToId[followingEmail] },
    });
  }
  console.log('Follows created');

  const postsData = [
    { email: 'sarah@example.com', content: 'Just deployed my latest project — an AI-powered code review assistant built with React + Python. Open to contributors! #opensource #react #python', type: 'achievement', hashtags: ['opensource', 'react', 'python'] },
    { email: 'marcus@example.com', content: 'Looking for a technical co-founder for my HealthTech platform. We have 50K users and FDA approval pending. Stack: React Native + Node.js. #HealthTech #Startup #CoFounder', type: 'idea', hashtags: ['HealthTech', 'Startup', 'CoFounder'] },
    { email: 'priya@example.com', content: 'New research: How cognitive load theory applies to modern UI design. Key takeaway — less is always more when it comes to user interfaces. #UXDesign #Research #DesignThinking', type: 'article', hashtags: ['UXDesign', 'Research', 'DesignThinking'] },
    { email: 'emma@example.com', content: 'Tested our new biosensor prototype today — real-time lactate monitoring during exercise. Accuracy is at 94%! Looking for beta testers. #Medtech #Biosensors #Hardware', type: 'project_update', hashtags: ['Medtech', 'Biosensors', 'Hardware'] },
    { email: 'alex@example.com', content: 'What do you think is the biggest unmet need in mental health tech right now? We are building our next product and want to hear from the community. #MentalHealth #DigitalTherapeutics', type: 'question', hashtags: ['MentalHealth', 'DigitalTherapeutics'] },
    { email: 'james@example.com', content: 'New report: Telemedicine adoption in rural areas increased 300% since 2020. But connectivity remains the barrier. How can we solve this? #HealthEquity #Telemedicine', type: 'article', hashtags: ['HealthEquity', 'Telemedicine'] },
  ];

  for (const postData of postsData) {
    await Post.create({
      author: emailToId[postData.email],
      content: postData.content,
      type: postData.type,
      hashtags: postData.hashtags,
    });
  }
  console.log('Posts created');

  const projectsData = [
    {
      title: 'AI-Powered Code Review Assistant',
      tagline: 'Automated code review with contextual suggestions',
      description: 'Building an AI tool that reviews PRs and provides contextual suggestions based on your codebase patterns.',
      problemStatement: 'Code reviews are time-consuming and often miss subtle bugs or style inconsistencies.',
      proposedSolution: 'An AI-powered GitHub bot that learns your codebase patterns and provides contextual, actionable review comments.',
      innovationFocus: 'ai_diagnostics',
      status: 'open',
      rolesNeeded: ['ML Engineer', 'Frontend Developer', 'DevOps Engineer'],
      skillsNeeded: ['python', 'machine_learning', 'react', 'devops', 'nlp'],
      stage: 'prototype',
      isLookingForCoFounder: true,
    },
    {
      title: 'Telehealth Platform for Rural Communities',
      tagline: 'Bringing specialist care to underserved rural areas',
      description: 'Building a low-bandwidth telemedicine platform optimized for rural areas with intermittent connectivity.',
      problemStatement: 'Rural communities have 40% fewer specialists per capita. Travel distances make in-person care difficult.',
      proposedSolution: 'An offline-first telemedicine app that syncs when connectivity is available, with AI-assisted triage.',
      innovationFocus: 'telemedicine_platform',
      status: 'open',
      rolesNeeded: ['Full-Stack Developer', 'UX Designer', 'Community Health Liaison'],
      skillsNeeded: ['react', 'nodejs', 'ux_design', 'offline_first', 'healthcare'],
      stage: 'mvp',
      isLookingForCoFounder: true,
      isLookingForInvestor: true,
    },
    {
      title: 'Mental Health Support Platform',
      tagline: 'Anonymous peer support for professionals',
      description: 'Creating a safe, anonymous space for professionals to connect, share experiences, and access mental health resources.',
      problemStatement: 'Professional burnout rates exceed 50%. Stigma prevents many from seeking help.',
      proposedSolution: 'An anonymous peer-matching platform with licensed therapists on standby and AI-moderated support groups.',
      innovationFocus: 'digital_therapeutics',
      status: 'open',
      rolesNeeded: ['Clinical Psychologist', 'React Native Developer', 'Community Manager'],
      skillsNeeded: ['react_native', 'community_management', 'mental_health', 'nodejs'],
      stage: 'idea',
      isLookingForCoFounder: false,
      isLookingForInvestor: true,
    },
  ];

  const sarahId = emailToId['sarah@example.com'];
  for (const projData of projectsData) {
    const project = await Project.create({ ...projData, author: sarahId });
    await ProjectMember.create({
      project: project.id,
      user: sarahId,
      role: 'lead',
      status: 'approved',
      joinedAt: new Date(),
    });
  }
  console.log('Projects created');

  const communitiesData = [
    {
      name: 'AI & Machine Learning Engineers',
      description: 'A community for AI/ML practitioners to share research, projects, and collaboration opportunities.',
      innovationFocus: 'ai_diagnostics',
      visibility: 'public',
      tags: ['AI', 'machine_learning', 'deep_learning', 'data_science'],
      rules: ['No spam', 'Share your projects', 'Be respectful'],
    },
    {
      name: 'Product Builders Collective',
      description: 'For founders, product managers, and builders. Share ideas, find co-founders, and get feedback.',
      innovationFocus: 'digital_therapeutics',
      visibility: 'public',
      tags: ['product_management', 'startup', 'founders', 'building'],
      rules: ['No self-promotion without context', 'Be constructive'],
    },
    {
      name: 'Design & UX Community',
      description: 'A space for designers to share work, get feedback, and discuss design systems and user research.',
      innovationFocus: 'health_equity',
      visibility: 'public',
      tags: ['ui_design', 'ux_design', 'figma', 'design_systems'],
      rules: ['Be respectful of diverse perspectives', 'Focus on actionable feedback'],
    },
  ];

  for (const commData of communitiesData) {
    const community = await Community.create({ ...commData, author: sarahId });
    await CommunityMember.create({
      community: community.id,
      user: sarahId,
      role: 'admin',
      status: 'approved',
      joinedAt: new Date(),
    });
    await community.increment('memberCount');
  }
  console.log('Communities created');

  console.log('\n=== SEED COMPLETE ===');
  console.log('Portal: http://localhost:5173');
  console.log('  Admin:         admin@innovationdating.com   / admin123');
  console.log('  Developer:     sarah@example.com       / password123');
  console.log('  PM/Founder:    marcus@example.com      / password123');
  console.log('  UX Designer:   priya@example.com       / password123');
  console.log('  AI Engineer:   alex@example.com        / password123');
  console.log('  MedTech:       emma@example.com        / password123');
  console.log('  DataScientist: james@example.com       / password123');
  console.log(`\n${followPairs.length} follows, ${postsData.length} posts, ${projectsData.length} projects, ${communitiesData.length} communities created`);
};

export default seed;

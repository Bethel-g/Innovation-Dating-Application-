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
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Super Admin',
      role: 'admin',
      isVerified: true,
      isActive: true,
      onboardingComplete: true,
      permissions: {
        userManagement: true, contentModeration: true, analytics: true,
        adminManagement: true, notificationManagement: true, subscriptionManagement: true,
      },
    },
    {
      email: 'sarah@example.com',
      password: 'password123',
      name: 'Dr. Sarah Chen',
      role: 'user',
      isVerified: true,
      isActive: true,
      onboardingComplete: true,
      dateOfBirth: '1992-03-12',
      gender: 'female',
      interestedIn: ['male'],
      bio: 'Cardiologist passionate about AI-assisted diagnostics. Building the future of preventive cardiac care.',
      interests: ['ai_diagnostics', 'health_analytics', 'medtech', 'running', 'yoga'],
      locationLat: 37.7749,
      locationLng: -122.4194,
      locationCity: 'San Francisco',
      locationCountry: 'United States',
      healthSpecialty: 'cardiology',
      workSetting: 'hospital',
      innovationFocus: 'ai_diagnostics',
      personalityTraits: ['analytical', 'visionary', 'disciplined'],
      certifications: ['Board Certified Cardiology', 'AI in Healthcare Certificate'],
      education: { degree: 'MD', school: 'Stanford University', year: 2018 },
      yearsOfExperience: 8,
      collaborationIntent: 'dating',
      availableForProjects: true,
    },
    {
      email: 'marcus@example.com',
      password: 'password123',
      name: 'Marcus Johnson',
      role: 'user',
      isVerified: true,
      isActive: true,
      onboardingComplete: true,
      dateOfBirth: '1990-07-25',
      gender: 'male',
      interestedIn: ['female'],
      bio: 'Digital health entrepreneur. Founded a telemedicine platform serving 50K+ patients. Looking for a co-founder who shares the vision.',
      interests: ['telemedicine', 'digital_therapeutics', 'health_analytics', 'cooking', 'hiking'],
      locationLat: 37.7749,
      locationLng: -122.4194,
      locationCity: 'San Francisco',
      locationCountry: 'United States',
      healthSpecialty: 'public_health',
      workSetting: 'startup',
      innovationFocus: 'telemedicine_platform',
      personalityTraits: ['creative', 'collaborative', 'big_picture'],
      certifications: ['Public Health MBA'],
      education: { degree: 'MPH', school: 'Johns Hopkins', year: 2016 },
      yearsOfExperience: 10,
      collaborationIntent: 'co_founder',
      lookingForTeam: true,
      availableForProjects: true,
    },
    {
      email: 'priya@example.com',
      password: 'password123',
      name: 'Priya Patel',
      role: 'user',
      isVerified: true,
      isActive: true,
      onboardingComplete: true,
      dateOfBirth: '1994-11-03',
      gender: 'female',
      interestedIn: ['male', 'female'],
      bio: 'Neuroscience researcher exploring brain-computer interfaces. Also a meditation enthusiast.',
      interests: ['neurology', 'mental_health', 'wearable_tech', 'meditation', 'photography'],
      locationLat: 37.7749,
      locationLng: -122.4194,
      locationCity: 'San Francisco',
      locationCountry: 'United States',
      healthSpecialty: 'neurology',
      workSetting: 'research_lab',
      innovationFocus: 'wearable_tech',
      personalityTraits: ['analytical', 'empathetic', 'independent'],
      certifications: ['PhD Neuroscience'],
      education: { degree: 'PhD', school: 'UC Berkeley', year: 2021 },
      yearsOfExperience: 5,
      collaborationIntent: 'networking',
      availableForProjects: true,
      lookingForTeam: true,
    },
    {
      email: 'alex@example.com',
      password: 'password123',
      name: 'Alex Rivera',
      role: 'user',
      isVerified: true,
      isActive: true,
      onboardingComplete: true,
      dateOfBirth: '1988-09-18',
      gender: 'male',
      interestedIn: ['female'],
      bio: 'Psychiatrist turned digital therapeutics founder. Building mental health tools for healthcare workers.',
      interests: ['psychiatry', 'mental_health', 'digital_therapeutics', 'music', 'cycling'],
      locationLat: 40.7128,
      locationLng: -74.0060,
      locationCity: 'New York',
      locationCountry: 'United States',
      healthSpecialty: 'psychiatry',
      workSetting: 'startup',
      innovationFocus: 'digital_therapeutics',
      personalityTraits: ['empathetic', 'visionary', 'collaborative'],
      certifications: ['Board Certified Psychiatry', 'Digital Health Innovation'],
      education: { degree: 'MD', school: 'Columbia University', year: 2014 },
      yearsOfExperience: 12,
      collaborationIntent: 'open',
      lookingForTeam: true,
      availableForProjects: true,
    },
    {
      email: 'emma@example.com',
      password: 'password123',
      name: 'Emma Watson',
      role: 'user',
      isVerified: true,
      isActive: true,
      onboardingComplete: true,
      dateOfBirth: '1993-04-08',
      gender: 'female',
      interestedIn: ['male'],
      bio: 'Medtech engineer specializing in wearable biosensors. Developed a continuous glucose monitor prototype.',
      interests: ['medtech', 'biosensors', 'wearable_tech', 'swimming', 'robotics'],
      locationLat: 37.7749,
      locationLng: -122.4194,
      locationCity: 'San Francisco',
      locationCountry: 'United States',
      healthSpecialty: 'medtech',
      workSetting: 'medtech_company',
      innovationFocus: 'biosensors',
      personalityTraits: ['detail_oriented', 'creative', 'pragmatic'],
      certifications: ['Biomedical Engineering', 'ISO 13485 Lead Auditor'],
      education: { degree: 'MEng', school: 'MIT', year: 2017 },
      yearsOfExperience: 7,
      collaborationIntent: 'dating',
      availableForProjects: false,
    },
    {
      email: 'james@example.com',
      password: 'password123',
      name: 'James Kim',
      role: 'user',
      isVerified: true,
      isActive: true,
      onboardingComplete: true,
      dateOfBirth: '1989-12-01',
      gender: 'male',
      interestedIn: ['female'],
      bio: 'Health equity researcher focused on bringing healthcare access to underserved communities.',
      interests: ['public_health', 'health_equity', 'epidemiology', 'volunteering', 'cooking'],
      locationLat: 40.7128,
      locationLng: -74.0060,
      locationCity: 'New York',
      locationCountry: 'United States',
      healthSpecialty: 'public_health',
      workSetting: 'nonprofit_health',
      innovationFocus: 'health_equity',
      personalityTraits: ['empathetic', 'collaborative', 'big_picture'],
      certifications: ['Certified Health Equity Specialist'],
      education: { degree: 'DrPH', school: 'Harvard', year: 2019 },
      yearsOfExperience: 9,
      collaborationIntent: 'networking',
      availableForProjects: true,
    },
  ];

  for (const userData of users) {
    await User.destroy({ where: { email: userData.email } });
    const user = await User.create(userData);
    const pwOk = await user.comparePassword(userData.password);
    console.log(`${userData.email} / ${userData.password} — role: ${user.role} — password: ${pwOk ? 'OK' : 'FAIL'}`);
  }

  const allUsers = await User.findAll({ where: { role: 'user' }, attributes: ['id', 'email'] });

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
    { email: 'sarah@example.com', content: 'Just published my research on AI-assisted ECG interpretation. The future of cardiology is here! #AIHealthcare #Cardiology', type: 'achievement', hashtags: ['AIHealthcare', 'Cardiology'] },
    { email: 'marcus@example.com', content: 'Looking for a tech co-founder for my telemedicine platform. We have 50K users and FDA approval pending. DM me if interested! #HealthTech #Startup', type: 'idea', hashtags: ['HealthTech', 'Startup'] },
    { email: 'priya@example.com', content: 'Fascinating talk today on how wearables can detect early signs of neurological disorders. The data is incredibly promising. #Neuroscience #WearableTech', type: 'article', hashtags: ['Neuroscience', 'WearableTech'] },
    { email: 'emma@example.com', content: 'Tested our new biosensor prototype today — real-time lactate monitoring during exercise. Accuracy is at 94%! #Medtech #Biosensors', type: 'project_update', hashtags: ['Medtech', 'Biosensors'] },
    { email: 'alex@example.com', content: 'What do you think is the biggest unmet need in mental health tech right now? I am brainstorming our next product. #MentalHealth #DigitalTherapeutics', type: 'question', hashtags: ['MentalHealth', 'DigitalTherapeutics'] },
    { email: 'james@example.com', content: 'New report: Telemedicine adoption in rural areas increased 300% since 2020. But connectivity remains the barrier. #HealthEquity #Telemedicine', type: 'article', hashtags: ['HealthEquity', 'Telemedicine'] },
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
      title: 'AI-Powered Cardiac Risk Prediction',
      tagline: 'Using machine learning to predict heart attacks 48 hours in advance',
      description: 'Developing a deep learning model that analyzes ECG, wearable data, and patient history to predict acute cardiac events before they happen.',
      problemStatement: '60% of heart attack patients show warning signs in the 48 hours prior, but current monitoring misses them.',
      proposedSolution: 'A continuous monitoring platform using existing wearable devices with AI-powered anomaly detection.',
      innovationFocus: 'ai_diagnostics',
      status: 'open',
      rolesNeeded: ['ML Engineer', 'Clinical Trial Coordinator', 'Data Scientist'],
      skillsNeeded: ['machine_learning', 'python', 'clinical_research', 'data_analysis', 'ecg_analysis'],
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
      skillsNeeded: ['react', 'nodejs', 'offline_first_design', 'healthcare_ux', 'community_outreach'],
      stage: 'mvp',
      isLookingForCoFounder: true,
      isLookingForInvestor: true,
    },
    {
      title: 'Mental Health Support for Healthcare Workers',
      tagline: 'Anonymous peer support platform for burned-out clinicians',
      description: 'Creating a safe, anonymous space for healthcare workers to connect, share experiences, and access mental health resources.',
      problemStatement: 'Healthcare worker burnout rates exceed 50%. Stigma prevents many from seeking help.',
      proposedSolution: 'An anonymous peer-matching platform with licensed therapists on standby and AI-moderated support groups.',
      innovationFocus: 'digital_therapeutics',
      status: 'open',
      rolesNeeded: ['Clinical Psychologist', 'React Native Developer', 'Community Manager'],
      skillsNeeded: ['mental_health', 'mobile_development', 'community_management', 'crisis_intervention'],
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
      name: 'AI in Healthcare Innovators',
      description: 'A community for healthcare professionals and AI researchers collaborating on diagnostic and treatment innovations.',
      innovationFocus: 'ai_diagnostics',
      visibility: 'public',
      tags: ['AI', 'machine_learning', 'diagnostics', 'healthcare_innovation'],
      rules: ['No spam', 'Respect patient privacy', 'Cite sources for clinical claims'],
    },
    {
      name: 'Digital Therapeutics Collective',
      description: 'Building the future of prescription digital therapeutics. For founders, clinicians, and researchers in the DTx space.',
      innovationFocus: 'digital_therapeutics',
      visibility: 'public',
      tags: ['DTx', 'digital_therapeutics', 'mental_health', 'clinical_trials'],
      rules: ['No self-promotion without context', 'Clinical discussions must be evidence-based'],
    },
    {
      name: 'Health Equity & Access',
      description: 'A space dedicated to making healthcare accessible for all. Discuss barriers, solutions, and community-driven initiatives.',
      innovationFocus: 'health_equity',
      visibility: 'public',
      tags: ['health_equity', 'accessibility', 'social_determinants', 'community_health'],
      rules: ['Be respectful of diverse perspectives', 'Focus on actionable solutions'],
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
  console.log('  Admin:       admin@example.com   / admin123');
  console.log('  Cardiologist: sarah@example.com   / password123');
  console.log('  Entrepreneur: marcus@example.com  / password123');
  console.log('  Researcher:   priya@example.com   / password123');
  console.log('  Psychiatrist: alex@example.com    / password123');
  console.log('  Engineer:     emma@example.com    / password123');
  console.log('  Researcher:   james@example.com   / password123');
  console.log(`\n${followPairs.length} follows, ${postsData.length} posts, ${projectsData.length} projects, ${communitiesData.length} communities created`);
};

export default seed;

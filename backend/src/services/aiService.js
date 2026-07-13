const icebreakerCategories = {
  skill_based: [
    "I see you're skilled in {skill} — what's the most interesting project you've built with it?",
    "What {skill} tip would you give someone just starting out?",
    "How did you get into {skill}? Self-taught or formal learning?",
  ],
  intent: [
    "I see we both want to {intent} — what kind of collaboration are you looking for?",
    "What does {intent} mean to you?",
  ],
  common_interest: [
    "I see you're into {interest}! How did you get started?",
    "What's your favorite {interest} resource or community?",
  ],
  project_collab: [
    "What project are you working on that excites you right now?",
    "If we collaborated, what problem would you want to tackle together?",
    "What's a professional skill you're currently learning?",
  ],
  experience: [
    "What's the best professional advice you've received?",
    "If you could work on any problem in the world, what would it be?",
  ],
};

export const generateIcebreakerPrompt = (user1, user2) => {
  const prompts = [];

  const skills1 = [...(user1.primarySkills || []), ...(user1.secondarySkills || []), ...(user1.skills || [])];
  const skills2 = [...(user2.primarySkills || []), ...(user2.secondarySkills || []), ...(user2.skills || [])];
  const commonSkills = skills1.filter(s => skills2.includes(s));

  if (commonSkills.length > 0) {
    icebreakerCategories.skill_based.forEach(p => {
      prompts.push({ prompt: p.replace('{skill}', commonSkills[0].replace(/_/g, ' ')), category: 'skill_based' });
    });
  }

  const intents1 = user1.intents || [];
  const intents2 = user2.intents || [];
  const commonIntents = intents1.filter(i => intents2.includes(i));
  if (commonIntents.length > 0) {
    icebreakerCategories.intent.forEach(p => {
      prompts.push({ prompt: p.replace('{intent}', commonIntents[0].replace(/_/g, ' ')), category: 'intent' });
    });
  }

  const common = user1.interests?.filter(i => user2.interests?.includes(i)) || [];
  if (common.length > 0) {
    icebreakerCategories.common_interest.forEach(p => {
      prompts.push({ prompt: p.replace('{interest}', common[0].replace(/_/g, ' ')), category: 'common_interest' });
    });
  }

  icebreakerCategories.project_collab.forEach(p => {
    prompts.push({ prompt: p, category: 'project_collab' });
  });

  icebreakerCategories.experience.forEach(p => {
    prompts.push({ prompt: p, category: 'experience' });
  });

  prompts.push(
    { prompt: 'What skill are you most proud of developing?', category: 'personal' },
    { prompt: 'What tech trend excites you most right now?', category: 'personal' },
    { prompt: 'If you could build any product, what would it be?', category: 'personal' },
    { prompt: 'What does "professional growth" mean to you?', category: 'personal' },
  );

  return prompts[Math.floor(Math.random() * prompts.length)];
};

export const calculateInnovationScore = (user) => {
  let score = 0;

  if (user.innovationFocus) score += 20;
  if (user.healthSpecialty) score += 10;
  if ((user.certifications || []).length > 0) score += 10;
  if ((user.education || []).length > 1) score += 10;
  if (user.yearsOfExperience >= 3) score += 10;
  if (user.yearsOfExperience >= 7) score += 5;
  if (user.availableForProjects) score += 10;
  if (user.lookingForTeam) score += 10;
  if ((user.personalityTraits || []).includes('visionary') || (user.personalityTraits || []).includes('creative')) score += 10;
  if ((user.skills || []).length > 5) score += 5;
  if ((user.primarySkills || []).length > 2) score += 5;
  if (user.githubUrl || user.websiteUrl) score += 5;

  return Math.min(score, 100);
};

export const generatePersonalityProfile = (user) => {
  const traits = user.personalityTraits || [];
  const descriptions = {
    analytical: 'Data-driven thinker who loves solving complex problems',
    empathetic: 'Deeply attuned to others needs and perspectives',
    creative: 'Thinks outside the box and brings fresh ideas',
    disciplined: 'Structured approach with strong follow-through',
    collaborative: 'Thrives in team environments and shared goals',
    independent: 'Self-motivated and works best autonomously',
    adventurous: 'Embraces new challenges and takes calculated risks',
    cautious: 'Careful decision-maker who weighs all options',
    visionary: 'Sees the big picture and future possibilities',
    pragmatic: 'Focuses on practical, implementable solutions',
    detail_oriented: 'Meticulous attention to detail and precision',
    big_picture: 'Connects dots across disciplines and domains',
    innovative: 'Constantly seeks new and better ways of doing things',
    strategic: 'Thinks several steps ahead to achieve goals',
    adaptable: 'Quickly adjusts to changing circumstances',
  };

  return {
    topTraits: traits.slice(0, 3).map(t => ({ trait: t, description: descriptions[t] || '' })),
    summary: traits.length > 0
      ? `A ${traits.slice(0, 3).join(', ')} professional focused on building and innovating.`
      : 'A professional exploring their path and looking for meaningful connections.',
  };
};

export const calculateBehavioralScore = (interactions) => {
  if (!interactions?.length) return 50;
  let score = 50;
  const likeRate = interactions.filter(i => i.action === 'like').length / interactions.length;
  if (likeRate > 0.5) score += 10;
  if (likeRate > 0.7) score += 5;
  const messageRate = interactions.filter(i => i.action === 'message').length / interactions.length;
  if (messageRate > 0.3) score += 15;
  if (messageRate > 0.5) score += 10;
  return Math.min(score, 100);
};

export const generateMatchInsight = (user1, user2, compatibilityScore) => {
  const skills1 = [...(user1.primarySkills || []), ...(user1.secondarySkills || []), ...(user1.skills || [])];
  const skills2 = [...(user2.primarySkills || []), ...(user2.secondarySkills || []), ...(user2.skills || [])];
  const commonSkills = skills1.filter(s => skills2.includes(s));
  const commonInterests = user1.interests?.filter(i => user2.interests?.includes(i)) || [];

  let insight = '';
  if (commonSkills.length >= 3 && commonInterests.length >= 2) {
    insight = `Strong match! You share ${commonSkills.length} skills and have aligned interests.`;
  } else if (commonSkills.length >= 2) {
    insight = `Great skill overlap — you both know ${commonSkills.slice(0, 2).join(' and ')}.`;
  } else if (compatibilityScore > 70) {
    insight = 'Strong compatibility with complementary professional profiles.';
  } else if (compatibilityScore > 50) {
    insight = 'Good potential — your different backgrounds could spark innovation.';
  } else {
    insight = 'Interesting pairing — diverse perspectives often lead to the best collaborations.';
  }

  const uniqueToUser1 = skills1.filter(s => !skills2.includes(s));
  const uniqueToUser2 = skills2.filter(s => !skills1.includes(s));

  return {
    insight,
    commonSkills: commonSkills.slice(0, 5),
    commonInterests,
    uniqueToUser1: uniqueToUser1.slice(0, 3),
    uniqueToUser2: uniqueToUser2.slice(0, 3),
    score: compatibilityScore,
    icebreaker: generateIcebreakerPrompt(user1, user2),
  };
};

export const calculateReputationScore = (user) => {
  let score = 0;
  score += Math.min(user.endorsementCount * 5, 25);
  if (user.isMentor) score += 15;
  if (user.isVerified) score += 10;
  score += Math.min(user.mentorshipCount * 10, 20);
  score += Math.min((user.skills || []).length * 2, 10);
  score += Math.min(user.profileCompleteness * 0.2, 10);
  return Math.min(score, 100);
};

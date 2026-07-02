const icebreakerCategories = {
  health_specialty: [
    "What inspired you to pursue {specialty}?",
    "What's the most exciting breakthrough in {specialty} right now?",
    "If you could solve one problem in {specialty}, what would it be?",
  ],
  innovation: [
    "What health-tech innovation are you most excited about?",
    "If you had unlimited funding, what would you build?",
    "What's a healthcare problem that tech hasn't solved yet?",
  ],
  common_interest: [
    "I see you both love {interest}! How did you get into it?",
    "What's your favorite {interest} experience?",
  ],
  project_collab: [
    "What project are you working on that excites you?",
    "If we collaborated, what problem would you want to tackle together?",
  ],
  work_setting: [
    "What's the best part about working in {setting}?",
    "How has working in {setting} shaped your perspective?",
  ],
};

export const generateIcebreakerPrompt = (user1, user2) => {
  const prompts = [];

  if (user1.healthSpecialty && user2.healthSpecialty) {
    const specialty = user1.healthSpecialty === user2.healthSpecialty
      ? user1.healthSpecialty
      : 'healthcare';
    icebreakerCategories.health_specialty.forEach(p => {
      prompts.push({ prompt: p.replace('{specialty}', specialty.replace(/_/g, ' ')), category: 'health_specialty' });
    });
  }

  if (user1.innovationFocus && user2.innovationFocus) {
    icebreakerCategories.innovation.forEach(p => {
      prompts.push({ prompt: p, category: 'innovation' });
    });
  }

  const common = user1.interests?.filter(i => user2.interests?.includes(i)) || [];
  if (common.length > 0) {
    icebreakerCategories.common_interest.forEach(p => {
      prompts.push({ prompt: p.replace('{interest}', common[0]), category: 'common_interest' });
    });
  }

  if (user1.workSetting || user2.workSetting) {
    const setting = (user1.workSetting || user2.workSetting).replace(/_/g, ' ');
    icebreakerCategories.work_setting.forEach(p => {
      prompts.push({ prompt: p.replace('{setting}', setting), category: 'work_setting' });
    });
  }

  icebreakerCategories.project_collab.forEach(p => {
    prompts.push({ prompt: p, category: 'project_collab' });
  });

  prompts.push(
    { prompt: 'What health innovation would make the biggest impact in the next 5 years?', category: 'innovation' },
    { prompt: 'What is a skill you have that surprises people?', category: 'personal' },
    { prompt: 'If you could shadow any healthcare professional for a day, who would it be?', category: 'health_specialty' },
    { prompt: 'What does "innovation in healthcare" mean to you?', category: 'innovation' },
  );

  return prompts[Math.floor(Math.random() * prompts.length)];
};

export const calculateInnovationScore = (user) => {
  let score = 0;

  if (user.innovationFocus) score += 20;
  if (user.healthSpecialty) score += 15;
  if ((user.certifications || []).length > 0) score += 10;
  if ((user.education || []).length > 1) score += 10;
  if (user.yearsOfExperience >= 3) score += 10;
  if (user.yearsOfExperience >= 7) score += 5;
  if (user.availableForProjects) score += 10;
  if (user.lookingForTeam) score += 10;
  if ((user.personalityTraits || []).includes('visionary') || (user.personalityTraits || []).includes('creative')) score += 10;

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
  };

  return {
    topTraits: traits.slice(0, 3).map(t => ({ trait: t, description: descriptions[t] || '' })),
    summary: traits.length > 0
      ? `A ${traits.slice(0, 3).join(', ')} innovator focused on healthcare transformation.`
      : 'An innovator exploring their path in healthcare.',
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
  const commonInterests = user1.interests?.filter(i => user2.interests?.includes(i)) || [];
  const uniqueToUser1 = user1.interests?.filter(i => !user2.interests?.includes(i)) || [];
  const uniqueToUser2 = user2.interests?.filter(i => !user1.interests?.includes(i)) || [];

  const sameSpecialty = user1.healthSpecialty && user1.healthSpecialty === user2.healthSpecialty;
  const sameFocus = user1.innovationFocus && user1.innovationFocus === user2.innovationFocus;

  let insight = '';
  if (sameSpecialty && sameFocus) insight = 'Perfect health-innovation match! Same specialty and vision.';
  else if (sameSpecialty) insight = 'Shared medical specialty — great foundation for collaboration.';
  else if (sameFocus) insight = 'Aligned innovation focus — exciting potential to build together.';
  else if (compatibilityScore > 70) insight = 'Strong compatibility with complementary health expertise.';
  else if (compatibilityScore > 50) insight = 'Good potential — you share meaningful interests.';
  else insight = 'Interesting pairing — your different backgrounds could spark something new.';

  return {
    insight,
    commonInterests,
    uniqueToUser1,
    uniqueToUser2,
    score: compatibilityScore,
    icebreaker: generateIcebreakerPrompt(user1, user2),
  };
};

const flaggedKeywords = [
  'spam', 'scam', 'fake', 'buy', 'sell', 'money', 'bank',
  'credit card', 'password', 'login',
];

const inappropriateKeywords = [
  'explicit', 'nsfw', 'adult content',
];

export const moderateContent = (content) => {
  if (!content) return { isClean: true, flags: [] };

  const lowerContent = content.toLowerCase();
  const flags = [];

  for (const keyword of flaggedKeywords) {
    if (lowerContent.includes(keyword)) {
      flags.push({ type: 'flagged', keyword, severity: 'medium' });
    }
  }

  for (const keyword of inappropriateKeywords) {
    if (lowerContent.includes(keyword)) {
      flags.push({ type: 'inappropriate', keyword, severity: 'high' });
    }
  }

  return {
    isClean: flags.length === 0,
    flags,
    score: flags.length > 0 ? Math.min(flags.length * 20, 100) : 0,
  };
};

export const analyzeUserBehavior = (user) => {
  const flags = [];
  const score = { total: 0, categories: {} };

  if (user.dailySwipes > 100) {
    flags.push('excessive_swiping');
    score.categories.swiping = 30;
  }

  if (user.createdAt) {
    const daysSinceCreation = (Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 1) {
      score.categories.age = 50;
    }
  }

  score.total = Object.values(score.categories).reduce((a, b) => a + b, 0);
  return { flags, score, requiresReview: score.total > 60 };
};

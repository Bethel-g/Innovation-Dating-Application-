export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  SUPPORT: 'support',
};

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  MODERATOR: 'moderator',
  SUPPORT_AGENT: 'support_agent',
};

export const MATCH_STATUS = {
  PENDING: 'pending',
  LIKED: 'liked',
  SUPER_LIKED: 'super_liked',
  MATCHED: 'matched',
  BLOCKED: 'blocked',
};

export const REPORT_REASONS = [
  'fake_profile',
  'harassment',
  'inappropriate_content',
  'spam',
  'underage',
  'other',
];

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
  VIP: 'vip',
};

export const INTEREST_CATEGORIES = [
  'travel', 'music', 'fitness', 'cooking', 'reading',
  'gaming', 'photography', 'art', 'dancing', 'hiking',
  'movies', 'technology', 'sports', 'yoga', 'volunteering',
];

export const HEALTH_SPECIALTIES = [
  'general_medicine', 'cardiology', 'neurology', 'pediatrics',
  'oncology', 'psychiatry', 'orthopedics', 'dermatology',
  'emergency_medicine', 'public_health', 'nursing', 'pharmacy',
  'dental', 'nutrition', 'physical_therapy', 'mental_health',
  'epidemiology', 'biotechnology', 'medtech', 'telemedicine',
  'health_informatics', 'alternative_medicine', 'research',
  'health_administration',
];

export const WORK_SETTINGS = [
  'hospital', 'clinic', 'private_practice', 'research_lab',
  'university', 'startup', 'pharma_company', 'govt_health',
  'nonprofit_health', 'telehealth', 'medtech_company',
  'consulting', 'independent',
];

export const INNOVATION_FOCUS = [
  'ai_diagnostics', 'digital_therapeutics', 'wearable_tech',
  'telemedicine_platform', 'mental_health_app', 'health_analytics',
  'drug_discovery', 'personalized_medicine', 'remote_monitoring',
  'health_equity', 'preventive_care', 'biosensors',
  'healthcare_accessibility', 'medical_devices',
  'elderly_care_tech', 'pediatric_innovation',
];

export const PERSONALITY_TRAITS = [
  'analytical', 'empathetic', 'creative', 'disciplined',
  'collaborative', 'independent', 'adventurous', 'cautious',
  'visionary', 'pragmatic', 'detail_oriented', 'big_picture',
];

export const PROJECT_STATUS = {
  DRAFT: 'draft',
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const PROJECT_ROLES = [
  'lead', 'contributor', 'advisor', 'investor', 'mentor',
];

export const COMMUNITY_VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  INVITE_ONLY: 'invite_only',
};

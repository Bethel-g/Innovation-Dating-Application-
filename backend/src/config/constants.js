export const USER_ROLES = {
  USER: 'user',
  DOMAIN_EXPERT: 'domain_expert',
  TECHNICAL_BUILDER: 'technical_builder',
  ECOSYSTEM_BUILDER: 'ecosystem_builder',
  INVESTOR: 'investor',
  MENTOR: 'mentor',
  COMPANY: 'company',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  SUPPORT: 'support',
};

export const USER_ROLE_VALUES = Object.values(USER_ROLES);

// Roles that can create/publish ideas on the platform
export const IDEA_AUTHOR_ROLES = [USER_ROLES.DOMAIN_EXPERT, USER_ROLES.TECHNICAL_BUILDER, USER_ROLES.USER];

// Roles with administrative access
export const ADMIN_ROLES = [USER_ROLES.ADMIN, USER_ROLES.MODERATOR, USER_ROLES.SUPPORT];

export const SKILL_CATEGORIES = {
  TECH: 'tech',
  DESIGN: 'design',
  BUSINESS: 'business',
  MARKETING: 'marketing',
  SCIENCE: 'science',
  OTHER: 'other',
};

export const PROFICIENCY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
};

export const INTENTS = {
  HIRE: 'hire',
  GET_HIRED: 'get_hired',
  COLLABORATE: 'collaborate',
  LEARN: 'learn',
  MENTOR: 'mentor',
};

export const EXPERIENCE_LEVEL = {
  STUDENT: 'student',
  JUNIOR: 'junior',
  MID: 'mid',
  SENIOR: 'senior',
  LEAD: 'lead',
  EXECUTIVE: 'c-level',
  VP: 'vp',
  FREELANCE: 'freelance',
};

export const CONNECTION_STATE = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  BLOCKED: 'blocked',
};

export const IDEA_STATUS = {
  OPEN: 'open',
  IN_DISCUSSION: 'in_discussion',
  TEAM_FORMED: 'team_formed',
  CLOSED: 'closed',
  // Legacy values retained for backward compatibility with existing rows
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const IDEA_STAGE = {
  CONCEPT: 'concept',
  PROTOTYPE: 'prototype',
  MVP: 'mvp',
  PRODUCTION: 'production',
};

export const IDEA_STAGE_VALUES = Object.values(IDEA_STAGE);

export const PROJECT_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  CLOSED: 'closed',
};

export const PROJECT_ROLES = [
  'lead',
  'contributor',
  'cofounder',
  'developer',
  'designer',
  'researcher',
  'advisor',
  'investor',
];

export const COMMUNITY_VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  INVITE_ONLY: 'invite_only',
};

export const SESSION_STATUS = {
  BOOKED: 'booked',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const REPUTATION_LEVELS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
};

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
  VIP: 'vip',
};

export const USER_VERIFICATION_STATUS = {
  UNVERIFIED: 'unverified',
  EMAIL: 'email',
  PHONE: 'phone',
  ID: 'id',
  FULL: 'full',
};

// Backward-compat arrays for User model ENUMs
export const HEALTH_SPECIALTIES = [
  'cardiology', 'neurology', 'psychiatry', 'oncology', 'public_health',
  'nursing', 'biotechnology', 'medtech', 'telemedicine', 'health_informatics',
  'general_medicine', 'emergency_medicine', 'mental_health', 'epidemiology',
  'health_administration', 'research', 'pharmacy', 'pediatrics', 'surgery',
  'dermatology', 'orthopedics', 'opthalmology', 'radiology', 'other',
];

export const WORK_SETTINGS = [
  'hospital', 'startup', 'research_lab', 'medtech_company', 'nonprofit_health',
  'telemedicine', 'pharma', 'government_health', 'university', 'consulting',
  'clinic', 'remote', 'hybrid', 'other',
];

export const INNOVATION_FOCUS = [
  'ai_diagnostics', 'telemedicine_platform', 'digital_therapeutics',
  'health_equity', 'biosensors', 'wearable_tech', 'mental_health',
  'health_analytics', 'medtech', 'biotechnology', 'preventive_care',
  'patient_experience', 'health_informatics', 'other',
];

export const PERSONALITY_TRAITS = [
  'analytical', 'empathetic', 'creative', 'disciplined', 'collaborative',
  'independent', 'adventurous', 'cautious', 'visionary', 'pragmatic',
  'detail_oriented', 'big_picture', 'innovative', 'strategic', 'adaptable',
];

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  DONE: 'done',
  BLOCKED: 'blocked',
};

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const BADGE_TYPES = {
  TOP_DEVELOPER: 'top_developer',
  HEALTHCARE_EXPERT: 'healthcare_expert',
  INNOVATOR: 'innovator',
  COLLABORATOR: 'collaborator',
  MENTOR: 'mentor',
  EARLY_ADOPTER: 'early_adopter',
  COMMUNITY_BUILDER: 'community_builder',
  PROBLEM_SOLVER: 'problem_solver',
  FIRST_PROJECT: 'first_project',
  TEN_PROJECTS: 'ten_projects',
  SKILL_MASTER: 'skill_master',
  HELPFUL_REVIEW: 'helpful_review',
};

export const CONTRIBUTION_TYPES = {
  PROJECT_CREATE: 'project_create',
  PROJECT_COMPLETE: 'project_complete',
  TASK_COMPLETE: 'task_complete',
  REVIEW_GIVEN: 'review_given',
  ENDORSEMENT_GIVEN: 'endorsement_given',
  POST_CREATED: 'post_created',
  COMMENT_ADDED: 'comment_added',
  IDEA_SHARED: 'idea_shared',
  COMMUNITY_JOINED: 'community_joined',
  HELP_GIVEN: 'help_given',
};

export const CONTRIBUTION_POINTS = {
  project_create: 50,
  project_complete: 200,
  task_complete: 25,
  review_given: 10,
  endorsement_given: 5,
  post_created: 10,
  comment_added: 5,
  idea_shared: 15,
  community_joined: 10,
  help_given: 15,
};

export const IDEA_CATEGORIES = [
  'healthcare', 'ai', 'fintech', 'education', 'environment',
  'social_impact', 'gaming', 'ecommerce', 'saas', 'iot',
  'blockchain', 'cybersecurity', 'robotics', 'other',
];

// Professional skills taxonomy
export const PROFESSIONAL_SKILLS = {
  tech: [
    'javascript', 'python', 'typescript', 'react', 'nodejs', 'nextjs',
    'graphql', 'docker', 'kubernetes', 'aws', 'gcp', 'azure',
    'sql', 'mongodb', 'redis', 'machine_learning', 'deep_learning',
    'data_science', 'devops', 'ci_cd', 'blockchain', 'web3',
    'rust', 'go', 'java', 'csharp', 'swift', 'kotlin',
    'flutter', 'react_native', 'vue', 'angular', 'svelte',
    'tailwind', 'sass', 'rest_api', 'microservices', 'system_design',
  ],
  design: [
    'ui_design', 'ux_design', 'figma', 'sketch', 'adobe_xd',
    'photoshop', 'illustrator', 'prototyping', 'wireframing',
    'design_systems', 'user_research', 'accessibility', 'motion_design',
    'graphic_design', 'brand_design', 'interaction_design',
  ],
  business: [
    'product_management', 'project_management', 'agile', 'scrum',
    'business_development', 'sales', 'marketing', 'growth_hacking',
    'strategy', 'consulting', 'operations', 'finance', 'fundraising',
    'venture_capital', 'startup', 'leadership', 'negotiation',
  ],
  marketing: [
    'seo', 'sem', 'social_media', 'content_marketing', 'email_marketing',
    'analytics', 'ppc', 'brand_strategy', 'public_relations',
    'influencer_marketing', 'copywriting', 'growth_marketing',
    'market_research', 'crm', 'marketing_automation',
  ],
  science: [
    'research', 'data_analysis', 'statistics', 'clinical_research',
    'biotechnology', 'bioinformatics', 'chemistry', 'physics',
    'neuroscience', 'epidemiology', 'pharmacology', 'genomics',
  ],
};

// ---------------------------------------------------------------------------
// InnoConnect-specific taxonomies
// ---------------------------------------------------------------------------

export const ORG_TYPES = {
  HUB: 'hub',
  INCUBATOR: 'incubator',
  ACCELERATOR: 'accelerator',
  COMPANY: 'company',
  NGO: 'ngo',
  GOVERNMENT: 'government',
  UNIVERSITY: 'university',
};

export const ORG_TYPE_VALUES = Object.values(ORG_TYPES);

export const ORG_VERIFICATION_STATUS = {
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

export const VERIFICATION_REQUEST_TYPE = {
  PROFESSIONAL: 'professional',
  CREDENTIAL: 'credential',
  ORGANIZATION: 'organization',
};

export const VERIFICATION_REQUEST_STATUS = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const OPPORTUNITY_TYPE = {
  GRANT: 'grant',
  INCUBATION: 'incubation',
  ACCELERATOR: 'accelerator',
  CALL_FOR_INNOVATION: 'call_for_innovation',
  EVENT: 'event',
  FUNDING: 'funding',
};

export const OPPORTUNITY_TYPE_VALUES = Object.values(OPPORTUNITY_TYPE);

export const OPPORTUNITY_STATUS = {
  DRAFT: 'draft',
  OPEN: 'open',
  CLOSING_SOON: 'closing_soon',
  CLOSED: 'closed',
};

export const OPPORTUNITY_STATUS_VALUES = Object.values(OPPORTUNITY_STATUS);

export const OPPORTUNITY_APPLICANT_TYPE = {
  USER: 'user',
  TEAM: 'team',
  IDEA: 'idea',
};

export const TEAM_ROLE_TYPE = {
  COFOUNDER: 'cofounder',
  ENGINEER: 'engineer',
  DESIGNER: 'designer',
  RESEARCHER: 'researcher',
  CLINICAL: 'clinical',
  DOMAIN_ADVISOR: 'domain_advisor',
  INVESTOR: 'investor',
  BUSINESS: 'business',
  OTHER: 'other',
};

export const TEAM_ROLE_TYPE_VALUES = Object.values(TEAM_ROLE_TYPE);

export const TEAM_ROLE_STATUS = {
  OPEN: 'open',
  FILLED: 'filled',
  REMOVED: 'removed',
};

export const APPLICATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  WITHDRAWN: 'withdrawn',
};

export const BOOKMARK_TARGET_TYPE = {
  IDEA: 'idea',
  USER: 'user',
  OPPORTUNITY: 'opportunity',
};

export const NOTIFICATION_CHANNEL = {
  IN_APP: 'in_app',
  EMAIL: 'email',
};

export const NOTIFICATION_EVENT_TYPES = [
  'connection_request',
  'connection_accepted',
  'idea_interest',
  'idea_interest_accepted',
  'role_application',
  'role_application_accepted',
  'role_application_declined',
  'team_formed',
  'new_opportunity',
  'opportunity_application',
  'opportunity_application_accepted',
  'comment',
  'reaction',
  'mention',
  'new_message',
  'verification_status',
  'admin_action',
];

export const REACTION_TYPES = {
  LIKE: 'like',
  CELEBRATE: 'celebrate',
  INSIGHTFUL: 'insightful',
};

export const REACTION_TYPE_VALUES = Object.values(REACTION_TYPES);

export const SECTORS = [
  'healthcare', 'agriculture', 'education', 'fintech', 'environment',
  'energy', 'transport', 'logistics', 'government_services', 'manufacturing',
  'construction', 'retail', 'media', 'telecom', 'ai_ml', 'social_impact',
  'tourism', 'other',
];

export const SECTOR_VALUES = SECTORS;

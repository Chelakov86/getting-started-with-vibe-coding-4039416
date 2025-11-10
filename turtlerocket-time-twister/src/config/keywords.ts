/**
 * Keyword-Based Cognitive Load Classification System
 * 
 * Classification Strategy:
 * - HEAVY: Tasks requiring high cognitive effort, deep focus, decision-making, or intense collaboration
 * - LIGHT: Low-effort activities, breaks, personal time, or routine admin tasks
 * - MEDIUM: Events not matching HEAVY or LIGHT (default fallback)
 * 
 * Matching Logic:
 * - Case-insensitive partial word matching (e.g., "meeting" matches "meetings", "Meeting")
 * - Priority: HEAVY keywords checked first, then LIGHT keywords
 * - First match determines classification
 * 
 * Design Principles:
 * - Keywords are mutually exclusive between HEAVY and LIGHT
 * - Keywords focus on root words for better partial matching
 * - Organized by category for maintainability
 */

/**
 * Heavy Cognitive Load Keywords
 * Events requiring significant mental effort, focus, and energy
 */
export const HEAVY_KEYWORDS = [
  // Meetings & Collaboration (High Intensity)
  'meeting',
  'interview',
  'presentation',
  'demo',
  'pitch',
  'negotiation',
  'brainstorm',
  'workshop',
  'retrospective',
  'retro',
  'planning',
  'sprint planning',
  'standup',
  'stand-up',
  'sync',
  'all-hands',
  'town hall',
  
  // Reviews & Analysis
  'review',
  'code review',
  'design review',
  'performance review',
  'audit',
  'assessment',
  'evaluation',
  'analysis',
  'deep dive',
  
  // Decision Making & Strategy
  'strategy',
  'strategic',
  'decision',
  'prioritization',
  'roadmap',
  'architecture',
  'design session',
  
  // Training & Learning (High Intensity)
  'training',
  'onboarding',
  'certification',
  'exam',
  'learning session',
  'tutorial',
  
  // Problem Solving & Development
  'debugging',
  'troubleshooting',
  'incident',
  'postmortem',
  'post-mortem',
  'research',
  'investigation',
  'implementation',
  
  // Client & Stakeholder Management
  'client',
  'customer',
  'stakeholder',
  'executive',
  'board',
  'investor',
] as const;

/**
 * Light Cognitive Load Keywords
 * Low-effort activities, breaks, and routine tasks
 */
export const LIGHT_KEYWORDS = [
  // Breaks & Personal Time
  'lunch',
  'break',
  'coffee',
  'tea',
  'snack',
  'breakfast',
  'dinner',
  'meal',
  'rest',
  'personal',
  'break time',
  'time off',
  
  // Social & Casual
  'social',
  'happy hour',
  'team building',
  'celebration',
  'birthday',
  'party',
  'casual',
  'chat',
  'watercooler',
  'informal',
  
  // Administrative (Routine)
  'admin',
  'administrative',
  'calendar',
  'scheduling',
  'logistics',
  'setup',
  'cleanup',
  'organize',
  
  // Passive Activities
  'fyi',
  'info',
  'information',
  'announcement',
  'update',
  'status update',
  'reminder',
  'notification',
  
  // Low-Effort Communication
  'check-in',
  'touch base',
  'quick sync',
  'office hours',
  'availability',
  'optional',
  
  // Wellness & Fitness
  'exercise',
  'workout',
  'gym',
  'walk',
  'yoga',
  'meditation',
  'wellness',
] as const;

/**
 * Keyword Categories
 * Organized grouping for better maintainability and future customization
 */
export const KEYWORD_CATEGORIES = {
  heavy: {
    meetings: ['meeting', 'interview', 'presentation', 'demo', 'pitch', 'negotiation'],
    collaboration: ['brainstorm', 'workshop', 'retrospective', 'retro', 'planning'],
    reviews: ['review', 'code review', 'design review', 'performance review', 'audit'],
    strategy: ['strategy', 'strategic', 'decision', 'prioritization', 'roadmap'],
    problemSolving: ['debugging', 'troubleshooting', 'incident', 'postmortem', 'research'],
    stakeholders: ['client', 'customer', 'stakeholder', 'executive', 'board'],
  },
  light: {
    breaks: ['lunch', 'break', 'coffee', 'tea', 'snack', 'breakfast', 'dinner', 'meal'],
    social: ['social', 'happy hour', 'team building', 'celebration', 'birthday'],
    administrative: ['admin', 'administrative', 'calendar', 'scheduling', 'logistics'],
    passive: ['fyi', 'info', 'information', 'announcement', 'update', 'reminder'],
    wellness: ['exercise', 'workout', 'gym', 'walk', 'yoga', 'meditation'],
  },
} as const;

/**
 * Configuration for keyword matching behavior
 */
export const KEYWORD_MATCHING_CONFIG = {
  /**
   * Case-insensitive matching enabled
   * "Meeting", "MEETING", and "meeting" will all match
   */
  caseInsensitive: true,
  
  /**
   * Partial word matching enabled
   * "meeting" will match "meetings", "Meeting Time", etc.
   */
  partialMatch: true,
  
  /**
   * Priority order for classification
   * HEAVY keywords are checked first, then LIGHT
   * If no match, defaults to MEDIUM
   */
  priorityOrder: ['heavy', 'light'] as const,
} as const;

/**
 * Type guard to check if a keyword exists in HEAVY_KEYWORDS
 */
export type HeavyKeyword = typeof HEAVY_KEYWORDS[number];

/**
 * Type guard to check if a keyword exists in LIGHT_KEYWORDS
 */
export type LightKeyword = typeof LIGHT_KEYWORDS[number];

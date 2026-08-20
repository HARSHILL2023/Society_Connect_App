export const COLORS = {
  // Backgrounds
  background: '#090D16',
  surface: '#111827',
  surfaceLight: '#1F2937',
  surfaceElevated: '#1E293B',
  border: '#273549',
  borderLight: '#374151',

  // Primary Brand Colors
  primary: '#4F46E5', // Modern Indigo
  primaryLight: '#6366F1',
  primaryDark: '#3730A3',
  primaryGlow: 'rgba(99, 102, 241, 0.18)',

  // Secondary Accents
  accent: '#06B6D4', // Cyan
  accentGlow: 'rgba(6, 182, 212, 0.15)',

  // Semantic Status Colors
  pending: '#F59E0B',      // Amber
  pendingBg: 'rgba(245, 158, 11, 0.12)',
  inProgress: '#3B82F6',   // Blue
  inProgressBg: 'rgba(59, 130, 246, 0.12)',
  resolved: '#10B981',     // Emerald
  resolvedBg: 'rgba(16, 185, 129, 0.12)',
  danger: '#EF4444',       // Red
  dangerBg: 'rgba(239, 68, 68, 0.12)',

  // Priority Colors
  priorityLow: '#10B981',
  priorityMedium: '#F59E0B',
  priorityHigh: '#F97316',
  priorityUrgent: '#EF4444',

  // Text
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textDisabled: '#475569',

  // System
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 9999,
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 17,
    fontWeight: '600',
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '600',
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
  },
  captionBold: {
    fontSize: 13,
    fontWeight: '600',
  },
  small: {
    fontSize: 11,
    fontWeight: '500',
  },
};

export const CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Security',
  'Cleaning',
  'Carpentry',
  'Elevator',
  'Gardening',
  'Others',
];

export const STATUSES = ['Pending', 'In Progress', 'Resolved'];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

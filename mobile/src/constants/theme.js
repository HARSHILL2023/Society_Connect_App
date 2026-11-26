// Design tokens — "White Smoke & Charcoal"
// Light, calm, borderless. Depth comes from soft shadows and filled surfaces.

export const COLORS = {
  // Canvas & surfaces
  background: '#F4F4F5', // white smoke
  surface: '#FFFFFF',
  surfaceLight: '#FAFAFA',
  surfaceElevated: '#EFEFF1', // filled tiles, inputs, chips
  surfaceMuted: '#E8E8EB',
  hairline: '#ECECEF',

  // Borders are intentionally gone — kept as transparent tokens so any
  // legacy `borderWidth: 1` renders nothing.
  border: 'transparent',
  borderLight: 'transparent',

  // Brand — charcoal black
  primary: '#1C1C1E',
  primaryLight: '#2C2C2F',
  primaryDark: '#000000',
  primaryGlow: 'rgba(28, 28, 30, 0.06)',
  primarySoft: '#E8E8EA',

  // Status — muted, readable on white smoke
  pending: '#B45309',
  pendingBg: '#FBF1E3',
  inProgress: '#1D4ED8',
  inProgressBg: '#E9EFFC',
  resolved: '#15803D',
  resolvedBg: '#E8F3EC',
  danger: '#B91C1C',
  dangerBg: '#FBEAEA',
  dangerSoft: '#F6D9D9',

  // Priority
  priorityLow: '#15803D',
  priorityMedium: '#B45309',
  priorityHigh: '#C2410C',
  priorityUrgent: '#B91C1C',

  // Text
  text: '#18181B',
  textSecondary: '#5A5A62',
  textMuted: '#8A8A94',
  textDisabled: '#B4B4BC',

  // System
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(24, 24, 27, 0.35)',
  overlayStrong: 'rgba(24, 24, 27, 0.55)',
};

// Soft elevation, no borders.
export const SHADOWS = {
  card: {
    shadowColor: '#18181B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  subtle: {
    shadowColor: '#18181B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  floating: {
    shadowColor: '#18181B',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 12,
  },
  bar: {
    shadowColor: '#18181B',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 10,
  },
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
  xs: 8,
  sm: 12,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
  full: 9999,
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 27,
    fontWeight: '700',
    letterSpacing: -0.7,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  h3: {
    fontSize: 16.5,
    fontWeight: '600',
    letterSpacing: -0.2,
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

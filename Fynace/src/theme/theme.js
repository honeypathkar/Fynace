export const palette = {
  primary: '#000000', // Black
  onPrimary: '#FFFFFF',
  primaryContainer: '#000000', 
  onPrimaryContainer: '#FFFFFF',
  secondary: '#d3d3ff', // Lavender/Light blue
  onSecondary: '#000000',
  background: '#000000', // Absolute Black
  surface: '#000000', // Absolute Black
  surfaceVariant: '#121212', 
  outline: '#1A1A1A',
  success: '#22C55E',
  warning: '#FACC15',
  error: '#EF4444',
  text: '#FFFFFF', 
  subtext: '#808080', 
  placeholder: '#333333',
  border: '#121212',
  chartActive: '#d3d3ff',
  chartInactive: '#1A1A1A',
  chartTrack: '#121212',
  indicator: '#333333',
  divider: '#1A1A1A',
};

export const spacing = [0, 4, 8, 12, 16, 20, 24, 32];

export const typography = {
  family: {
    regular: 'System',
    medium: 'System',
    light: 'System',
    thin: 'System',
  },
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 20,
    xl: 24,
    display: 32,
  },
};

export const categoryConfigs = {
  travel:        { emoji: '✈️',  color: '#FF40B3' },
  flight:        { emoji: '✈️',  color: '#FF40B3' },
  food:          { emoji: '🍔',  color: '#6060FF' },
  dining:        { emoji: '🍽️',  color: '#6060FF' },
  restaurant:    { emoji: '🍽️',  color: '#6060FF' },
  cafe:          { emoji: '☕',  color: '#6060FF' },
  grocery:       { emoji: '🍎',  color: '#22C55E' },
  groceries:     { emoji: '🛒',  color: '#22C55E' },
  shopping:      { emoji: '🛍️',  color: '#d3d3ff' },
  clothes:       { emoji: '👗',  color: '#d3d3ff' },
  transport:     { emoji: '🚗',  color: '#FACC15' },
  taxi:          { emoji: '🚕',  color: '#FACC15' },
  auto:          { emoji: '🛺',  color: '#FACC15' },
  ride:          { emoji: '🚕',  color: '#FACC15' },
  fuel:          { emoji: '⛽',  color: '#FACC15' },
  health:        { emoji: '💊',  color: '#10B981' },
  medical:       { emoji: '🏥',  color: '#10B981' },
  fitness:       { emoji: '🏋️',  color: '#10B981' },
  gym:           { emoji: '🏋️',  color: '#10B981' },
  workout:       { emoji: '💪',  color: '#10B981' },
  electronics:   { emoji: '💻',  color: '#60A5FA' },
  gadgets:       { emoji: '📱',  color: '#60A5FA' },
  entertainment: { emoji: '🎬',  color: '#A855F7' },
  movies:        { emoji: '🎥',  color: '#A855F7' },
  bills:         { emoji: '🧾',  color: '#F97316' },
  utilities:     { emoji: '⚡',  color: '#F97316' },
  rent:          { emoji: '🏠',  color: '#EF4444' },
  salary:        { emoji: '💼',  color: '#22C55E' },
  stationary:    { emoji: '📝',  color: '#A855F7' },
  education:     { emoji: '📚',  color: '#A855F7' },
  school:        { emoji: '🏫',  color: '#A855F7' },
  investment:    { emoji: '📈',  color: '#FF40B3' },
  invest:        { emoji: '📈',  color: '#FF40B3' },
  savings:       { emoji: '🏦',  color: '#60A5FA' },
  other:         { emoji: '💰',  color: '#808080' },
};

export const paletteColors = ['#FF40B3', '#6060FF', '#22C55E', '#d3d3ff', '#FACC15', '#A855F7', '#60A5FA'];

export const themeAssets = {
  palette,
  spacing,
  typography,
  categoryConfigs,
  paletteColors,
};

export default {
  palette,
  spacing,
  typography,
  categoryConfigs,
  paletteColors,
  themeAssets,
};

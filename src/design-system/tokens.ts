// Professional Design System Tokens
// Replaces scattered magic numbers with systematic design tokens

export const DESIGN_TOKENS = {
  // Spacing Scale (rem units)
  spacing: {
    none: '0',
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    '3xl': '3rem',    // 48px
    '4xl': '4rem',    // 64px
    '5xl': '6rem',    // 96px
  },

  // Typography Scale
  typography: {
    scale: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeights: {
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    }
  },

  // Color System - Semantic and Accessible
  colors: {
    // Primary Palette (Indian Flag Inspired)
    primary: {
      50: '#fff7ed',   // Saffron tint
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',  // Primary Saffron
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
    
    // Secondary Palette (Ashoka Chakra Blue)
    secondary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',  // Primary Blue
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },

    // Success (Green from flag)
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',  // Primary Green
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },

    // Neutral Scale
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',   // Navy for text
      800: '#1e293b',
      900: '#0f172a',
    },

    // Semantic Colors
    semantic: {
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      success: '#22c55e',
    }
  },

  // Border Radius
  borderRadius: {
    none: '0',
    xs: '0.125rem',   // 2px
    sm: '0.25rem',    // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // Shadows
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },

  // Animations
  animations: {
    durations: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easings: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
  },

  // Breakpoints
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-Index Scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    dropdown: 1000,
    sticky: 1010,
    modal: 1020,
    popover: 1030,
    tooltip: 1040,
    notification: 1050,
  }
} as const;

// Utility Types
export type SpacingToken = keyof typeof DESIGN_TOKENS.spacing;
export type ColorToken = keyof typeof DESIGN_TOKENS.colors;
export type TypographyToken = keyof typeof DESIGN_TOKENS.typography.scale;

// Component Tokens
export const COMPONENT_TOKENS = {
  button: {
    sizes: {
      xs: {
        padding: `${DESIGN_TOKENS.spacing.xs} ${DESIGN_TOKENS.spacing.sm}`,
        fontSize: DESIGN_TOKENS.typography.scale.xs,
        minHeight: '2rem',
      },
      sm: {
        padding: `${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.md}`,
        fontSize: DESIGN_TOKENS.typography.scale.sm,
        minHeight: '2.25rem',
      },
      md: {
        padding: `${DESIGN_TOKENS.spacing.md} ${DESIGN_TOKENS.spacing.lg}`,
        fontSize: DESIGN_TOKENS.typography.scale.base,
        minHeight: '2.5rem',
      },
      lg: {
        padding: `${DESIGN_TOKENS.spacing.lg} ${DESIGN_TOKENS.spacing.xl}`,
        fontSize: DESIGN_TOKENS.typography.scale.lg,
        minHeight: '3rem',
      },
    },
    variants: {
      primary: {
        backgroundColor: DESIGN_TOKENS.colors.primary[500],
        color: 'white',
        borderColor: DESIGN_TOKENS.colors.primary[500],
      },
      secondary: {
        backgroundColor: DESIGN_TOKENS.colors.secondary[500],
        color: 'white',
        borderColor: DESIGN_TOKENS.colors.secondary[500],
      },
      outline: {
        backgroundColor: 'transparent',
        color: DESIGN_TOKENS.colors.neutral[700],
        borderColor: DESIGN_TOKENS.colors.neutral[300],
      }
    }
  },

  card: {
    padding: DESIGN_TOKENS.spacing.xl,
    borderRadius: DESIGN_TOKENS.borderRadius.lg,
    shadow: DESIGN_TOKENS.shadows.md,
    backgroundColor: 'white',
  },

  input: {
    padding: `${DESIGN_TOKENS.spacing.md} ${DESIGN_TOKENS.spacing.lg}`,
    borderRadius: DESIGN_TOKENS.borderRadius.md,
    borderColor: DESIGN_TOKENS.colors.neutral[300],
    fontSize: DESIGN_TOKENS.typography.scale.base,
    minHeight: '2.5rem',
  }
};

// Responsive Utilities
export const RESPONSIVE = {
  // Mobile-first media queries
  up: (breakpoint: keyof typeof DESIGN_TOKENS.breakpoints) => 
    `@media (min-width: ${DESIGN_TOKENS.breakpoints[breakpoint]})`,
    
  down: (breakpoint: keyof typeof DESIGN_TOKENS.breakpoints) => 
    `@media (max-width: ${DESIGN_TOKENS.breakpoints[breakpoint]})`,
    
  only: (breakpoint: keyof typeof DESIGN_TOKENS.breakpoints) => {
    const breakpoints = Object.keys(DESIGN_TOKENS.breakpoints);
    const index = breakpoints.indexOf(breakpoint);
    const nextBreakpoint = breakpoints[index + 1] as keyof typeof DESIGN_TOKENS.breakpoints;
    
    if (nextBreakpoint) {
      return `@media (min-width: ${DESIGN_TOKENS.breakpoints[breakpoint]}) and (max-width: ${DESIGN_TOKENS.breakpoints[nextBreakpoint]})`;
    }
    return `@media (min-width: ${DESIGN_TOKENS.breakpoints[breakpoint]})`;
  }
};

// Professional Mobile Optimization Constants
export const MOBILE_OPTIMIZATION = {
  touchTargetMinSize: '44px',  // iOS HIG minimum
  safeAreaPadding: 'max(env(safe-area-inset-left), 16px)',
  containerMaxWidth: 'min(100vw, 1200px)',
  mobileBreakpoint: '768px',
  
  // Performance budgets
  performance: {
    maxBundleSize: '500kb',
    maxImageSize: '100kb',
    maxFirstContentfulPaint: '1.5s',
    maxTimeToInteractive: '3s',
  }
};
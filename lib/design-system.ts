/**
 * Design System - Color Palette & Typography
 * Based on typography-preview.html
 *
 * Use these constants throughout the application for consistent styling
 */

// ==================== COLOR PALETTE ====================

export const COLORS = {
  // Primary Colors
  primary: {
    DEFAULT: '#8B5CF6',      // Primary Purple
    dark: '#6D28D9',         // Dark Purple
    light: '#A78BFA',        // Secondary Purple
    lighter: '#C4B5FD',      // Light Purple
    lightest: '#EDE9FE',     // Lightest Purple
  },

  // Accent Colors
  accent: {
    pink: '#EC4899',         // Accent Pink
    pinkLight: '#FCD6F5',    // Light Pink
  },

  // Neutral Colors
  neutral: {
    dark: '#1F2937',         // Dark text
    grayDark: '#4B5563',     // Dark gray text
    grayMedium: '#9CA3AF',   // Medium gray text
    grayLight: '#E5E7EB',    // Light gray borders/backgrounds
    white: '#FFFFFF',        // White
  },

  // Status Colors (keeping existing for alerts/status)
  status: {
    success: '#22C55E',
    successLight: '#DCFCE7',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
  }
} as const

// ==================== TAILWIND CLASSES ====================

/**
 * Pre-defined Tailwind classes for common use cases
 * Use these instead of inline colors for consistency
 */
export const tw = {
  // Backgrounds
  bg: {
    primary: 'bg-[#8B5CF6]',
    primaryLight: 'bg-[#EDE9FE]',
    primaryGradient: 'bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9]',
    accentGradient: 'bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#8B5CF6]',
    card: 'bg-white',
    cardGradient: 'bg-gradient-to-br from-[#EDE9FE] to-[#FCD6F5]/50',
  },

  // Text Colors
  text: {
    primary: 'text-[#8B5CF6]',
    primaryDark: 'text-[#6D28D9]',
    dark: 'text-[#1F2937]',
    gray: 'text-[#4B5563]',
    grayLight: 'text-[#9CA3AF]',
    accent: 'text-[#EC4899]',
    white: 'text-white',
  },

  // Borders
  border: {
    primary: 'border-[#8B5CF6]',
    primaryLight: 'border-[#C4B5FD]',
    gray: 'border-[#E5E7EB]',
  },

  // Buttons - RECOMMENDED: Use <Button> component with variant prop instead
  // Example: <Button variant="default">Text</Button>  ✅
  //          <Button variant="secondary">Text</Button>  ✅
  //          <Button variant="outline">Text</Button>  ✅
  button: {
    primary: 'bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white hover:from-[#6D28D9] hover:to-[#6D28D9]',
    secondary: 'bg-[#A78BFA] text-white hover:bg-[#8B5CF6]',
    outline: 'border-2 border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white',
    accent: 'bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#8B5CF6] text-white hover:from-[#6D28D9] hover:via-[#EC4899] hover:to-[#6D28D9]',
    ghost: 'text-[#8B5CF6] hover:bg-[#EDE9FE]',
  },

  // Badges
  badge: {
    primary: 'bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white',
    secondary: 'bg-[#EDE9FE] text-[#6D28D9]',
    accent: 'bg-[#FCD6F5] text-[#EC4899]',
    outline: 'border-2 border-[#A78BFA] text-[#A78BFA] bg-transparent',
  },

  // Cards
  card: {
    default: 'bg-white border border-[#E5E7EB] hover:border-[#8B5CF6]',
    gradient: 'bg-gradient-to-br from-[#EDE9FE] to-[#FCD6F5]/50 border border-[#8B5CF6]/30',
    highlight: 'bg-gradient-to-br from-[#EDE9FE] via-[#C4B5FD]/30 to-[#A78BFA]/20 border-2 border-[#8B5CF6]',
  },

  // Icons
  icon: {
    primary: 'text-[#8B5CF6]',
    primaryDark: 'text-[#6D28D9]',
    accent: 'text-[#EC4899]',
    bg: 'bg-[#EDE9FE] p-3 rounded-lg',
    bgAccent: 'bg-[#FCD6F5] p-3 rounded-lg',
  }
} as const

// ==================== TYPOGRAPHY ====================

/**
 * Typography scale based on design system
 */
export const typography = {
  h1: 'text-5xl font-extrabold leading-tight',        // 48px / 800
  h2: 'text-4xl font-bold leading-tight',             // 36px / 700
  h3: 'text-3xl font-semibold leading-snug',          // 28px / 600
  h4: 'text-2xl font-semibold leading-snug',          // 22px / 600
  h5: 'text-xl font-semibold leading-normal',         // 18px / 600
  h6: 'text-lg font-semibold leading-normal',         // 16px / 600

  bodyLarge: 'text-lg leading-relaxed',               // 18px / 1.7
  body: 'text-base leading-normal',                   // 16px / 1.6
  bodySmall: 'text-sm leading-normal',                // 14px / 1.5
  caption: 'text-xs leading-snug',                    // 12px / 1.4

  // Special
  gradient: 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent font-extrabold',
} as const

// ==================== CHART COLORS ====================

/**
 * Colors for charts (Pie, Bar, Line, etc.)
 */
export const CHART_COLORS = [
  '#8B5CF6',  // Primary Purple
  '#A78BFA',  // Secondary Purple
  '#C4B5FD',  // Light Purple
  '#EC4899',  // Accent Pink
  '#EDE9FE',  // Lightest Purple
] as const

// ==================== HELPER FUNCTIONS ====================

/**
 * Get status-based colors for usage indicators
 */
export const getUsageColor = (status: string) => {
  switch (status) {
    case 'exceeded':
    case 'at_limit':
      return { bg: 'bg-red-100', text: 'text-red-700', progress: 'bg-red-500', border: 'border-red-300' }
    case 'approaching_limit':
      return { bg: 'bg-orange-100', text: 'text-orange-700', progress: 'bg-orange-500', border: 'border-orange-300' }
    case 'unlimited':
      return { bg: 'bg-blue-100', text: 'text-blue-700', progress: 'bg-blue-500', border: 'border-blue-300' }
    default:
      return { bg: 'bg-[#EDE9FE]', text: 'text-[#6D28D9]', progress: 'bg-[#8B5CF6]', border: 'border-[#C4B5FD]' }
  }
}

/**
 * Get booking status colors
 */
export const getBookingStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return { bg: 'bg-[#EDE9FE]', text: 'text-[#6D28D9]', border: 'border-[#C4B5FD]' }
    case 'completed':
      return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' }
    case 'cancelled':
      return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' }
    case 'pending':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' }
    case 'no-show':
      return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' }
    default:
      return { bg: 'bg-[#EDE9FE]', text: 'text-[#6D28D9]', border: 'border-[#C4B5FD]' }
  }
}

/**
 * Get payment status colors
 */
export const getPaymentStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'completed':
      return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' }
    case 'pending':
      return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' }
    case 'failed':
    case 'cancelled':
      return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' }
    case 'refunded':
      return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' }
    default:
      return { bg: 'bg-[#EDE9FE]', text: 'text-[#6D28D9]', border: 'border-[#C4B5FD]' }
  }
}

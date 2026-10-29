/**
 * My Community — Design Tokens Partagés (Web Next.js & Mobile Flutter)
 * Charte Graphique Officielle v1.0 — Direction "Premium & Connected"
 */

export const colors = {
  brand: {
    primary: '#3730A3', // Indigo profond - Identité, navigation, boutons principaux
    secondary: '#7C3AED', // Violet lumineux - Découverte, accents et éléments actifs
    accent: '#F97373', // Corail - Interactions, réactions et éléments expressifs
    deep: '#171638', // Indigo nuit - Supports de marque et fonds sombres
  },
  functional: {
    success: '#15803D',
    warning: '#B45309',
    error: '#B91C1C',
  },
  neutral: {
    light: {
      canvas: '#F5F5FA',
      surface: '#FFFFFF',
      surfaceSubtle: '#EEEDF5',
      textPrimary: '#17172A',
      textSecondary: '#55556B',
      border: '#D9D8E5',
      disabled: '#77778A',
    },
    dark: {
      canvas: '#11111B',
      surface: '#1B1B2B',
      surfaceSubtle: '#28283B',
      textPrimary: '#F4F4FA',
      textSecondary: '#C1C0D4',
      border: '#414158',
    },
  },
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
  12: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const typography = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  scale: {
    pageTitle: { fontSize: '32px', lineHeight: '40px', fontWeight: 700 },
    sectionTitle: { fontSize: '24px', lineHeight: '32px', fontWeight: 600 },
    postTitle: { fontSize: '18px', lineHeight: '26px', fontWeight: 600 },
    body: { fontSize: '15px', lineHeight: '24px', fontWeight: 400 },
    metadata: { fontSize: '13px', lineHeight: '18px', fontWeight: 400 },
    button: { fontSize: '15px', lineHeight: '22px', fontWeight: 600 },
  },
} as const;

export const layout = {
  contentMaxWidth: 1280,
  feedMaxWidth: 680,
  sidebarWidth: 240,
  asideWidth: 320,
  controlHeight: 44,
  mobileGutter: 16,
  desktopGutter: 24,
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

/**
 * Formatage monétaire officiel en Franc CFA (XOF)
 * E.g. formatXOF(15000) => "15 000 FCFA"
 */
export function formatXOF(amount: number): string {
  const formatted = new Intl.NumberFormat('fr-BJ', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
  return `${formatted} FCFA`;
}

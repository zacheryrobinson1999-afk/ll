/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#E9EDF0',
    tint: '#F7BE21',
    background: '#0B1014',
    foreground: '#E9EDF0',
    card: '#131B21',
    cardForeground: '#E9EDF0',
    primary: '#F7BE21',
    primaryForeground: '#151A1E',
    secondary: '#1C2730',
    secondaryForeground: '#D6DEE3',
    muted: '#172129',
    mutedForeground: '#91A1AA',
    accent: '#1B9AAA',
    accentForeground: '#EAFBFC',
    destructive: '#E36B55',
    destructiveForeground: '#FFF5F2',
    border: '#29363F',
    input: '#22313A',
    success: '#67C587',
    warning: '#F7BE21',
    surfaceRaised: '#1A252D',
    canvasLine: '#20303A',
    overlay: '#0E151A',
  },
  dark: {
    text: '#E9EDF0',
    tint: '#F7BE21',
    background: '#0B1014',
    foreground: '#E9EDF0',
    card: '#131B21',
    cardForeground: '#E9EDF0',
    primary: '#F7BE21',
    primaryForeground: '#151A1E',
    secondary: '#1C2730',
    secondaryForeground: '#D6DEE3',
    muted: '#172129',
    mutedForeground: '#91A1AA',
    accent: '#1B9AAA',
    accentForeground: '#EAFBFC',
    destructive: '#E36B55',
    destructiveForeground: '#FFF5F2',
    border: '#29363F',
    input: '#22313A',
    success: '#67C587',
    warning: '#F7BE21',
    surfaceRaised: '#1A252D',
    canvasLine: '#20303A',
    overlay: '#0E151A',
  },
  radius: 12,
};

export default colors;

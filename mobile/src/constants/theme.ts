/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#3d2b1f',
    background: '#fdf6f0',
    backgroundElement: '#ffffff',
    backgroundSelected: '#f9ede5',
    textSecondary: '#9a7060',
    border: '#f0e4db',
    accentStart: '#c9956c',
    accentEnd: '#b07d62',
  },
  dark: {
    text: '#fdf6f0',
    background: '#241812',
    backgroundElement: '#3d2b1f',
    backgroundSelected: '#4a3527',
    textSecondary: '#c9a090',
    border: '#5c4535',
    accentStart: '#c9956c',
    accentEnd: '#b07d62',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Icon-chip backgrounds for feature cards, matching the web dashboard. Constant across themes. */
export const SectionColors = {
  starter: '#f9ede5',
  bake: '#f0e8f0',
  recipes: '#fde8e8',
  discard: '#fef3e2',
} as const;

/** Brand type family: Playfair Display for headings, Lora for body — matches the web app. */
export const BrandFonts = {
  heading: 'PlayfairDisplay_700Bold',
  headingSemiBold: 'PlayfairDisplay_600SemiBold',
  body: 'Lora_400Regular',
  bodyItalic: 'Lora_400Regular_Italic',
  bodySemiBold: 'Lora_600SemiBold',
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

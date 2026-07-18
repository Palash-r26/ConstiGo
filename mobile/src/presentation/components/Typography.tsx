import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

interface TypographyProps extends TextProps {
  variant?: 'h1Black' | 'h1' | 'h2' | 'bodyLarge' | 'bodyMedium' | 'bodyDefault' | 'bodyBold' | 'bodySemiBold' | 'bodySmall';
  className?: string;
  color?: string;
  children: React.ReactNode;
}

// CRITICAL Android font rules:
//  1. `fontWeight` is IGNORED once a custom `fontFamily` is set — worse, setting BOTH
//     can break resolution and fall back to the thin system font (the "grey, not bold" bug).
//     => We NEVER set fontWeight; the weight is baked into the font file we pick.
//  2. NativeWind arbitrary classes like font-['Outfit-Black'] are unreliable in release
//     builds. => We set `fontFamily` via a plain StyleSheet (always applied).
//  3. COLOR must NOT live in the StyleSheet. An inline `style` always beats a NativeWind
//     `className`, so a baked-in color here silently kills every `text-white` / `text-primary`
//     / `text-text-secondary` class the screens set (red buttons showing black text, etc).
//     => We keep ONLY fontFamily + fontSize here; color comes from className, the `color`
//        prop, or the DEFAULT_COLOR fallback below.
const DEFAULT_COLOR = '#182F4B';
const styles = StyleSheet.create({
  h1Black: { fontFamily: 'BalooBhai2-ExtraBold', fontSize: 32 },
  h1: { fontFamily: 'BalooBhai2-Bold', fontSize: 30 },
  h2: { fontFamily: 'BalooBhai2-Bold', fontSize: 24 },
  bodyLarge: { fontFamily: 'Montserrat-Bold', fontSize: 18 },
  bodyMedium: { fontFamily: 'Montserrat-SemiBold', fontSize: 16 },
  bodyDefault: { fontFamily: 'Montserrat-Medium', fontSize: 16 },
  bodyBold: { fontFamily: 'Montserrat-Bold', fontSize: 16 },
  bodySemiBold: { fontFamily: 'Montserrat-SemiBold', fontSize: 16 },
  bodySmall: { fontFamily: 'Montserrat-Medium', fontSize: 14 },
});

// Detect whether the screen already provides a text color via className (text-white,
// text-primary, text-red-500, text-[#...] …). If so we let the class own the color and
// don't inject a default that would fight it.
const hasColorClass = (cn: string) => /(?:^|\s)(?:text-(?:white|black|primary|accent|success|red|gray|neutral|slate|zinc|green|blue|yellow|amber|orange)|text-text-|text-\[)/.test(cn);

export const Typography = ({ variant = 'bodyDefault', className = '', style, color, children, ...props }: TypographyProps) => {
  // Priority (low -> high): default color -> style prop -> explicit color prop.
  // If a color class is present, we skip the default so className controls the color.
  const defaultColor = !color && !hasColorClass(className) ? { color: DEFAULT_COLOR } : undefined;
  return (
    <Text
      style={[styles[variant], defaultColor, style, color ? { color } : undefined]}
      className={className}
      {...props}
    >
      {children}
    </Text>
  );
};

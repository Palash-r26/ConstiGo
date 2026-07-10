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
// Size + default color stay in `className` (reliable core utilities, overridable per-screen).
const styles = StyleSheet.create({
  h1Black: { fontFamily: 'BalooBhai2-ExtraBold', fontSize: 30, color: '#000000' },
  h1: { fontFamily: 'BalooBhai2-Bold', fontSize: 30, color: '#000000' },
  h2: { fontFamily: 'BalooBhai2-Bold', fontSize: 24, color: '#000000' },
  bodyLarge: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#000000' },
  bodyMedium: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#000000' },
  bodyDefault: { fontFamily: 'Montserrat-Medium', fontSize: 16, color: '#000000' },
  bodyBold: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#000000' },
  bodySemiBold: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#000000' },
  bodySmall: { fontFamily: 'Montserrat-Medium', fontSize: 14, color: '#1C1C1C' }, // darker than #8A8A8E
});

export const Typography = ({ variant = 'bodyDefault', className = '', style, color, children, ...props }: TypographyProps) => {
  return (
    <Text
      style={[styles[variant], style, color ? { color } : undefined]}
      className={className}
      {...props}
    >
      {children}
    </Text>
  );
};

import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

export interface TypographyProps extends TextProps {
  variant?: 'h1Black' | 'h1' | 'h2' | 'bodyLarge' | 'bodyMedium' | 'bodyDefault' | 'bodyBold' | 'bodySemiBold' | 'bodySmall';
  className?: string;
  color?: string;
  children?: React.ReactNode;
}

const DEFAULT_COLOR = '#111827';
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

const hasColorClass = (cn: string) => /(?:^|\s)(?:text-(?:white|black|primary|accent|success|red|gray|neutral|slate|zinc|green|blue|yellow|amber|orange)|text-text-|text-\[)/.test(cn);

export const Typography = ({ variant = 'bodyDefault', className = '', style, color, children, ...props }: TypographyProps) => {
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

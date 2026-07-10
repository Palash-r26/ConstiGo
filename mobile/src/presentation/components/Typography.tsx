import React from 'react';
import { Text, TextProps } from 'react-native';

interface TypographyProps extends TextProps {
  variant?: 'h1Black' | 'h1' | 'h2' | 'bodyLarge' | 'bodyMedium' | 'bodyDefault' | 'bodyBold' | 'bodySemiBold' | 'bodySmall';
  className?: string;
  children: React.ReactNode;
}

export const Typography = ({ variant = 'bodyDefault', className = '', children, ...props }: TypographyProps) => {
  // NOTE: Android ignores `fontWeight` once a custom `fontFamily` is set, so
  // we must reference the exact weighted .ttf file by name (matching the files
  // in android/app/src/main/assets/fonts/) instead of combining font-outfit + font-bold.
  let baseStyle = 'text-text-primary ';

  switch (variant) {
    case 'h1Black':
      baseStyle += "text-black text-3xl font-['Outfit-Black'] ";
      break;
    case 'h1':
      baseStyle += "text-3xl font-['Outfit-Bold'] ";
      break;
    case 'h2':
      baseStyle += "text-2xl font-['Outfit-SemiBold'] ";
      break;
    case 'bodyLarge':
      baseStyle += "text-lg font-['Outfit-Medium'] ";
      break;
    case 'bodyMedium':
      baseStyle += "text-base font-['Outfit-Medium'] ";
      break;
    case 'bodyDefault':
      baseStyle += "text-base font-['Outfit-Regular'] ";
      break;
    case 'bodyBold':
      baseStyle += "text-base font-['Outfit-Bold'] ";
      break;
    case 'bodySemiBold':
      baseStyle += "text-base font-['Outfit-SemiBold'] ";
      break;
    case 'bodySmall':
      baseStyle += "text-sm font-['Outfit-Regular'] text-text-secondary ";
      break;
  }

  return (
    <Text className={`${baseStyle} ${className}`} {...props}>
      {children}
    </Text>
  );
};

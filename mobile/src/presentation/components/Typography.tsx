import React from 'react';
import { Text, TextProps } from 'react-native';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'bodyLarge' | 'bodyDefault' | 'bodySmall';
  className?: string;
  children: React.ReactNode;
}

export const Typography = ({ variant = 'bodyDefault', className = '', children, ...props }: TypographyProps) => {
  let baseStyle = 'font-outfit text-text-primary ';

  switch (variant) {
    case 'h1':
      baseStyle += 'text-3xl font-bold ';
      break;
    case 'h2':
      baseStyle += 'text-2xl font-semibold ';
      break;
    case 'bodyLarge':
      baseStyle += 'text-lg font-medium ';
      break;
    case 'bodyDefault':
      baseStyle += 'text-base font-normal ';
      break;
    case 'bodySmall':
      baseStyle += 'text-sm font-normal text-text-secondary ';
      break;
  }

  return (
    <Text className={`${baseStyle} ${className}`} {...props}>
      {children}
    </Text>
  );
};

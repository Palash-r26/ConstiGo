import React from 'react';
import { TouchableOpacity, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { Typography } from './Typography';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'link' | 'outline';
  isLoading?: boolean;
  className?: string;
  textClassName?: string;
}

export const Button = ({
  title,
  variant = 'primary',
  isLoading = false,
  className = '',
  textClassName = '',
  disabled,
  ...props
}: ButtonProps) => {
  let baseContainerStyle = 'items-center justify-center ';
  let baseTextStyle = '';
  let textVariant: any = 'bodyMedium';
  let explicitColor = '';

  switch (variant) {
    case 'primary':
      baseContainerStyle += 'bg-primary rounded-full py-4 px-6 ';
      baseTextStyle += 'text-lg ';
      textVariant = 'bodyLarge';
      explicitColor = '#182F4B';
      break;
    case 'link':
      baseContainerStyle += 'py-2 ';
      baseTextStyle += 'text-base ';
      textVariant = 'bodyBold';
      explicitColor = '#182F4B'; // text-accent
      break;
    case 'outline':
      baseContainerStyle += 'bg-transparent border border-primary rounded-full py-4 px-6 ';
      baseTextStyle += 'text-lg ';
      textVariant = 'bodyLarge';
      explicitColor = '#C89338'; // text-primary
      break;
  }

  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      className={`${baseContainerStyle} ${isDisabled ? 'opacity-70' : ''} ${className}`}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' ? '#182F4B' : '#C89338'} />
      ) : (
        <Typography 
          variant={textVariant} 
          className={`${baseTextStyle} ${textClassName}`}
          color={explicitColor || undefined}
        >
          {title}
        </Typography>
      )}
    </TouchableOpacity>
  );
};

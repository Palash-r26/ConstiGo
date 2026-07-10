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
      explicitColor = '#FFFFFF';
      break;
    case 'link':
      baseContainerStyle += 'py-2 ';
      baseTextStyle += 'text-base ';
      textVariant = 'bodyBold';
      explicitColor = '#FF4B3A'; // text-accent
      break;
    case 'outline':
      baseContainerStyle += 'bg-transparent border border-primary rounded-full py-4 px-6 ';
      baseTextStyle += 'text-lg ';
      textVariant = 'bodyLarge';
      explicitColor = '#9C101A'; // text-primary
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
        <ActivityIndicator color={variant === 'primary' ? '#FFF' : '#9C101A'} />
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

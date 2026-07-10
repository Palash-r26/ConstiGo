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
  // Use exact font file name — Android ignores fontWeight on custom fontFamily.
  let baseTextStyle = "font-['Outfit-Medium'] ";

  switch (variant) {
    case 'primary':
      baseContainerStyle += 'bg-primary rounded-full py-4 px-6 ';
      baseTextStyle += 'text-white text-lg ';
      break;
    case 'link':
      baseContainerStyle += 'py-2 ';
      baseTextStyle = "font-['Outfit-Bold'] text-accent text-base ";
      break;
    case 'outline':
      baseContainerStyle += 'bg-transparent border border-primary rounded-full py-4 px-6 ';
      baseTextStyle += 'text-primary text-lg ';
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
        <Typography className={`${baseTextStyle} ${textClassName}`}>{title}</Typography>
      )}
    </TouchableOpacity>
  );
};

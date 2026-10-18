import React from 'react';
import { Image, ImageProps } from 'react-native';

interface LogoProps extends Omit<ImageProps, 'source'> {
  variant?: 'color' | 'white';
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { width: 140, height: 43 },
  md: { width: 200, height: 61 },
  lg: { width: 260, height: 79 },
};

const UPWARD_OFFSETS = {
  sm: -4,
  md: -6,
  lg: -8,
};

export const Logo = ({ variant = 'color', size = 'md', style, ...props }: LogoProps) => {
  const source =
    variant === 'white'
      ? require('../../assets/images/logo_white.png')
      : require('../../assets/images/logo.png');

  return (
    <Image
      source={source}
      style={[
        SIZES[size],
        { transform: [{ translateY: UPWARD_OFFSETS[size] }] },
        style,
      ]}
      resizeMode="contain"
      {...props}
    />
  );
};

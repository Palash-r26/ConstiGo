import React from 'react';
import { Image, ImageProps } from 'react-native';

interface LogoProps extends Omit<ImageProps, 'source'> {
  variant?: 'color' | 'white';
  size?: 'sm' | 'md' | 'lg';
}

// Aspect ratio of the logo image is ~1264x386 (≈ 3.27 : 1)
const SIZES = {
  sm: { width: 140, height: 43 },
  md: { width: 200, height: 61 },
  lg: { width: 260, height: 79 },
};

export const Logo = ({ variant = 'color', size = 'md', style, ...props }: LogoProps) => {
  const source =
    variant === 'white'
      ? require('../assets/images/logo_white.png')
      : require('../assets/images/logo.png');

  return (
    <Image
      source={source}
      style={[SIZES[size], style]}
      resizeMode="contain"
      {...props}
    />
  );
};

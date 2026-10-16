import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  ImageProps,
  ImageSourcePropType,
  StyleProp,
  ImageStyle,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { normalizeImageUrl } from '../utils/imageUtils';

export interface SafeImageProps extends Omit<ImageProps, 'source'> {
  source?: ImageSourcePropType | { uri?: string | null } | null;
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  fallbackIconName?: string;
  fallbackIconSize?: number;
  fallbackIconColor?: string;
  fallbackBackgroundColor?: string;
  fallbackComponent?: React.ReactNode;
  borderRadius?: number;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  source,
  uri,
  style,
  containerStyle,
  resizeMode = 'cover',
  fallbackIconName = 'box',
  fallbackIconSize = 28,
  fallbackIconColor = '#9CA3AF',
  fallbackBackgroundColor = '#F3F4F6',
  fallbackComponent,
  borderRadius,
  onError,
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);

  // Derive resolved URI or local source
  let resolvedSource: ImageSourcePropType | null = null;

  if (uri) {
    const cleanUri = normalizeImageUrl(uri);
    if (cleanUri) {
      resolvedSource = { uri: cleanUri };
    }
  } else if (source) {
    if (typeof source === 'object' && source !== null && 'uri' in source) {
      const cleanUri = normalizeImageUrl((source as { uri?: string | null }).uri);
      if (cleanUri) {
        resolvedSource = { uri: cleanUri };
      }
    } else {
      // Local require source like require('../assets/logo.png') or number
      resolvedSource = source as ImageSourcePropType;
    }
  }

  // Reset error if source/uri changes
  const sourceKey = typeof resolvedSource === 'object' && resolvedSource && 'uri' in resolvedSource
    ? (resolvedSource as any).uri
    : typeof source === 'number'
    ? source
    : '';

  useEffect(() => {
    setHasError(false);
  }, [sourceKey]);

  // If no valid source or failed to load, render fallback
  if (!resolvedSource || hasError) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    return (
      <View
        style={[
          styles.fallbackContainer,
          { backgroundColor: fallbackBackgroundColor },
          borderRadius !== undefined ? { borderRadius } : null,
          style as ViewStyle,
          containerStyle,
        ]}
      >
        <Icon
          name={fallbackIconName}
          size={fallbackIconSize}
          color={fallbackIconColor}
        />
      </View>
    );
  }

  return (
    <Image
      source={resolvedSource}
      style={[
        borderRadius !== undefined ? { borderRadius } : null,
        style,
      ]}
      resizeMode={resizeMode}
      onError={(e) => {
        setHasError(true);
        if (onError) onError(e);
      }}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});

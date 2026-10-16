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

export const CONSTIGO_BASE_DOMAIN = 'https://constigo.in';

export function normalizeImageUrl(
  rawUrl?: string | null,
  baseDomain: string = CONSTIGO_BASE_DOMAIN
): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return null;
  }

  const trimmed = rawUrl.trim();
  if (
    trimmed === '' ||
    trimmed === 'null' ||
    trimmed === 'undefined' ||
    trimmed.toLowerCase() === '[object object]'
  ) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('file://') || trimmed.startsWith('content://')) {
    return trimmed;
  }

  const cleanBase = baseDomain.replace(/\/+$/, '');
  const cleanPath = trimmed.replace(/^\/+/, '');

  return `${cleanBase}/${cleanPath}`;
}

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
      resolvedSource = source as ImageSourcePropType;
    }
  }

  const sourceKey = typeof resolvedSource === 'object' && resolvedSource && 'uri' in resolvedSource
    ? (resolvedSource as any).uri
    : typeof source === 'number'
    ? source
    : '';

  useEffect(() => {
    setHasError(false);
  }, [sourceKey]);

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

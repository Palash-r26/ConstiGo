import React from 'react';
import { View, ViewProps, Platform, StatusBar, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ScreenWrapperProps extends ViewProps {
  children?: React.ReactNode;
  useSafeArea?: boolean;
  className?: string;
}

export const ScreenWrapper = ({ 
  children, 
  useSafeArea = true, 
  className = '', 
  style,
  ...props 
}: ScreenWrapperProps) => {
  const insets = useSafeAreaInsets();
  
  // Calculate top inset: prioritize insets.top from SafeAreaProvider,
  // with safe fallback to StatusBar.currentHeight or minimum 24dp on Android.
  const topInset = useSafeArea 
    ? Math.max(
        insets.top,
        Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 24) : 0
      )
    : 0;

  return (
    <View 
      className={`flex-1 bg-background ${className}`} 
      style={[
        styles.container,
        useSafeArea ? { paddingTop: topInset } : undefined,
        style,
      ]}
      {...props}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F8" />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

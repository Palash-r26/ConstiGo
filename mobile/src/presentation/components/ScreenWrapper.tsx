import React from 'react';
import { View, SafeAreaView, ViewProps, Platform, StatusBar } from 'react-native';

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
  useSafeArea?: boolean;
  className?: string;
}

export const ScreenWrapper = ({ children, useSafeArea = true, className = '', ...props }: ScreenWrapperProps) => {
  const Container = useSafeArea ? SafeAreaView : View;
  
  return (
    <Container 
      className={`flex-1 bg-background ${className}`} 
      style={Platform.OS === 'android' && useSafeArea ? { paddingTop: StatusBar.currentHeight } : undefined}
      {...props}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F8" />
      {children}
    </Container>
  );
};

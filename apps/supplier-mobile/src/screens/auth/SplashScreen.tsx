import React, { useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import { Logo } from '@constigo/shared';

export const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('SignIn');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View className="flex-1 bg-primary justify-center items-center">
      <StatusBar barStyle="light-content" backgroundColor="#8B0000" />
      <Logo variant="white" size="lg" />
    </View>
  );
};

import React, { useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import { Logo } from '../../components/Logo';

export const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    // Navigate to Welcome screen after 2.5 seconds
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View className="flex-1 bg-primary justify-center items-center">
      <StatusBar barStyle="light-content" backgroundColor="#DFA128" />
      <Logo variant="white" size="lg" />
    </View>
  );
};

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../../components/Typography';

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
      {/* Placeholder for the ConstiGo Logo */}
      <View className="items-center">
        <Typography className="text-white text-5xl font-bold font-outfit tracking-wider">
          ConstiGo
        </Typography>
        <View className="h-[1px] w-full bg-white my-2 opacity-50" />
        <Typography className="text-white text-xs font-medium tracking-widest">
          YOUR TRUSTED CONSTRUCTION PARTNER
        </Typography>
      </View>
    </View>
  );
};

import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { AuthInput } from '../../components/AuthInput';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/Feather';

export const ChangePasswordScreen = ({ navigation }: any) => {
  return (
    <ScreenWrapper className="px-6 bg-white">
      {/* Header */}
      <View className="flex-row items-center mt-4 mb-16">
        <TouchableOpacity onPress={() => navigation.goBack()} className="absolute z-10">
          <Icon name="chevron-left" size={28} color="#1C1C1C" />
        </TouchableOpacity>
        <View className="flex-1">
          <Typography variant="bodyBold" className="text-center text-xl text-black">Change Password</Typography>
        </View>
      </View>

      <View className="gap-y-4 mb-10">
        <AuthInput placeholder="Old Password" isPassword />
        <AuthInput placeholder="New Password" isPassword />
        <AuthInput placeholder="Confirm Password" isPassword />
      </View>

      <Button 
        title="Save Now" 
        onPress={() => navigation.navigate('SignIn')} 
      />
    </ScreenWrapper>
  );
};

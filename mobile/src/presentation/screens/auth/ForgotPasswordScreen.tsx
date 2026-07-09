import React from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/Feather';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  return (
    <ScreenWrapper className="px-6">
      {/* Header */}
      <View className="flex-row items-center mt-4 mb-16">
        <TouchableOpacity onPress={() => navigation.goBack()} className="absolute z-10">
          <Icon name="chevron-left" size={28} color="#1C1C1C" />
        </TouchableOpacity>
        <View className="flex-1">
          <Typography variant="h2" className="text-center text-xl">Forgot Password</Typography>
        </View>
      </View>

      <View className="items-center mb-10 px-4">
        <Typography variant="bodyDefault" className="text-center text-text-secondary">
          We will send a mail to the Email address you registered to regain your password
        </Typography>
      </View>

      {/* OTP Input Placeholder */}
      <View className="flex-row justify-center gap-x-4 mb-8">
        {[9, 8, '', ''].map((digit, index) => (
          <View key={index} className="w-16 h-16 bg-input-bg rounded-2xl justify-center items-center">
            <Typography variant="h1" className="text-3xl text-text-primary">{digit}</Typography>
          </View>
        ))}
      </View>

      <View className="flex-row justify-center items-center mb-10">
        <Typography variant="bodyDefault">I didn't receive code. </Typography>
        <Button 
          variant="link" 
          title="Resend Code" 
          onPress={() => {}} 
          className="py-0"
        />
      </View>

      <Button 
        title="Verify Now" 
        onPress={() => navigation.navigate('ChangePassword')} 
      />
    </ScreenWrapper>
  );
};

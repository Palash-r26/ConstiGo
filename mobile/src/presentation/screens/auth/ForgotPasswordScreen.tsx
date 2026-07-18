import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { AuthInput } from '../../components/AuthInput';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/Feather';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [identity, setIdentity] = React.useState('');

  return (
    <ScreenWrapper className="px-6 bg-white">
      {/* Header */}
      <View className="flex-row items-center mt-4 mb-16">
        <TouchableOpacity onPress={() => navigation.goBack()} className="absolute z-10 py-2">
          <Icon name="chevron-left" size={28} color="#182F4B" />
        </TouchableOpacity>
        <View className="flex-1">
          <Typography variant="bodyBold" className="text-center text-xl text-[#182F4B]">Forgot Password</Typography>
        </View>
      </View>

      <View className="items-center mb-10 px-4">
        <Typography variant="bodySmall" className="text-sm text-text-secondary text-center leading-5">
          Enter your registered email address or phone number to receive a password reset link.
        </Typography>
      </View>

      <View className="gap-y-4 mb-8">
        <AuthInput 
          placeholder="email id or phone number" 
          leftIcon="mail" 
          value={identity}
          onChangeText={setIdentity}
          autoCapitalize="none"
        />
      </View>

      <Button 
        title="Send Code" 
        onPress={() => {
          // Placeholder for send code API call
          // After success, we would navigate to OTP verify screen or ChangePassword
          navigation.navigate('ChangePassword');
        }} 
        className="rounded-full shadow-md"
      />
    </ScreenWrapper>
  );
};

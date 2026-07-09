import React from 'react';
import { View } from 'react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Logo } from '../../components/Logo';

export const WelcomeScreen = ({ navigation }: any) => {
  return (
    <ScreenWrapper className="justify-center px-6">
      <View className="items-center mb-12">
        <Logo size="md" style={{ marginBottom: 32 }} />
        <Typography variant="h1" className="text-4xl text-center mb-4">
          Welcome Back!
        </Typography>
        <Typography variant="bodyDefault" className="text-center text-text-secondary px-4">
          Enter your credentials to access your dashboard
        </Typography>
      </View>

      <View className="gap-y-4 mb-8">
        <Button 
          title="Sign In as Buyer" 
          onPress={() => navigation.navigate('SignIn', { role: 'BUYER' })} 
        />
        <Button 
          title="Sign In as Supplier" 
          onPress={() => navigation.navigate('SignIn', { role: 'SUPPLIER' })} 
        />
      </View>

      <View className="flex-row justify-center items-center">
        <Typography variant="bodyDefault">Don't have an account? </Typography>
        <Button 
          variant="link" 
          title="Sign Up" 
          onPress={() => navigation.navigate('SignUp')} 
        />
      </View>
    </ScreenWrapper>
  );
};

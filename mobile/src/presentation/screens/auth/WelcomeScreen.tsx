import React from 'react';
import { View } from 'react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Logo } from '../../components/Logo';

export const WelcomeScreen = ({ navigation }: any) => {
  return (
    <ScreenWrapper className="justify-center px-6 bg-white">
      <View className="items-center mb-12">
        <Logo size="lg" style={{ marginBottom: 40 }} />
        <Typography variant="h1Black" className="text-4xl text-center mb-2 leading-tight" color="#182F4B">
          Welcome Back!
        </Typography>
        <Typography variant="bodySmall" className="text-sm text-text-secondary text-center px-4 leading-5">
          Enter your credentials to access your{'\n'}account and dashboard
        </Typography>
      </View>

      <View className="gap-y-4 mb-6 w-full px-2">
        <Button 
          title="Sign In as Buyer" 
          onPress={() => navigation.navigate('SignIn', { role: 'BUYER' })} 
          className="rounded-full shadow-md"
        />
        <Button 
          title="Sign In as Supplier" 
          onPress={() => navigation.navigate('SignIn', { role: 'SUPPLIER' })} 
          className="rounded-full shadow-md"
        />
        <Button 
          title="Sign Up as Worker" 
          onPress={() => navigation.navigate('WorkerSignUp')} 
          className="rounded-full shadow-md"
        />
      </View>
    </ScreenWrapper>
  );
};

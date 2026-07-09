import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { AuthInput } from '../../components/AuthInput';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/Feather';
import { apiClient } from '../../../infrastructure/api/client';
import { useAuthStore } from '../../../application/store/authStore';

export const SignUpScreen = ({ navigation, route }: any) => {
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const login = useAuthStore((state) => state.login);
  const { role } = route?.params || { role: 'BUYER' };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      const response = await apiClient.post('/auth/register', {
        firstName, lastName, email, phone, password, role
      });
      if (response.data.success) {
        await login(response.data.data, response.data.data.token);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center mt-4 mb-8">
          <TouchableOpacity onPress={() => navigation.goBack()} className="absolute z-10">
            <Icon name="chevron-left" size={28} color="#1C1C1C" />
          </TouchableOpacity>
          <View className="flex-1">
            <Typography variant="h2" className="text-center text-xl">Sign Up</Typography>
          </View>
        </View>

        <View className="gap-y-4 mb-10">
          {error ? <Typography className="text-red-500 text-center">{error}</Typography> : null}
          <AuthInput placeholder="First Name" value={firstName} onChangeText={setFirstName} />
          <AuthInput placeholder="Last Name" value={lastName} onChangeText={setLastName} />
          <AuthInput placeholder="Email Id" value={email} onChangeText={setEmail} autoCapitalize="none" />
          <AuthInput placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <AuthInput placeholder="Password" isPassword value={password} onChangeText={setPassword} />
          <AuthInput placeholder="Confirm Password" isPassword value={confirmPassword} onChangeText={setConfirmPassword} />
        </View>

        <Button 
          title="Sign Up" 
          onPress={handleRegister} 
          isLoading={isLoading}
          className="mb-8"
        />

        <View className="flex-row justify-center items-center">
          <Typography variant="bodyDefault">Already have an account? </Typography>
          <Button 
            variant="link" 
            title="Sign In" 
            onPress={() => navigation.navigate('Welcome')} 
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

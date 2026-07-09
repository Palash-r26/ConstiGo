import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { AuthInput } from '../../components/AuthInput';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Logo } from '../../components/Logo';
import Icon from 'react-native-vector-icons/Feather';
import { apiClient } from '../../../infrastructure/api/client';
import { useAuthStore } from '../../../application/store/authStore';

export const SignInScreen = ({ route, navigation }: any) => {
  const { role } = route.params || { role: 'BUYER' };
  const isSupplier = role === 'SUPPLIER';
  const [identity, setIdentity] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await apiClient.post('/auth/login', {
        identity,
        password,
        role,
      });
      if (response.data.success) {
        await login(response.data.data, response.data.data.token);
        // Navigation will be handled by RootNavigator reacting to the store changes
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper className="px-6">
      {/* Custom Header Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 mb-10">
        <Icon name="chevron-left" size={28} color="#1C1C1C" />
      </TouchableOpacity>

      <View className="items-center mb-10">
        <Logo size="md" style={{ marginBottom: 24 }} />
        {isSupplier ? (
          <>
            <Typography variant="h1" className="text-3xl text-center mb-2">
              SUPPLIER PORTAL
            </Typography>
            <Typography variant="bodyDefault" className="text-center text-text-secondary px-4">
              Log in to manage your inventory, view orders, and respond to quote requests
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="h1" className="text-4xl text-center mb-4">
              Welcome Back!
            </Typography>
            <Typography variant="bodyDefault" className="text-center text-text-secondary px-4">
              Enter your credentials to access your buyer dashboard
            </Typography>
          </>
        )}
      </View>

      <View className="gap-y-4 mb-4">
        {error ? <Typography className="text-red-500 text-center">{error}</Typography> : null}
        <AuthInput 
          placeholder="email id or phone number" 
          leftIcon="mail" 
          value={identity}
          onChangeText={setIdentity}
          autoCapitalize="none"
        />
        <AuthInput 
          placeholder="*******************" 
          isPassword 
          leftIcon="lock" 
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <View className="flex-row justify-between items-center mb-8 px-1">
        <View className="flex-row items-center">
          {/* Checkbox Placeholder */}
          <View className="w-5 h-5 rounded bg-primary justify-center items-center mr-2">
            <Icon name="check" size={14} color="#FFF" />
          </View>
          <Typography variant="bodySmall" className="text-text-primary">Remember me</Typography>
        </View>
        <Button 
          variant="link" 
          title="Forget Password ?" 
          onPress={() => navigation.navigate('ForgotPassword')}
          textClassName="text-sm font-normal"
          className="py-0"
        />
      </View>

      <Button 
        title={`Sign In as ${isSupplier ? 'Supplier' : 'Buyer'}`} 
        onPress={handleLogin} 
        isLoading={isLoading}
        className="mb-8"
      />

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

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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../../../application/utils/validators';

export const SignInScreen = ({ route, navigation }: any) => {
  const { role } = route.params || { role: 'BUYER' };
  const isSupplier = role === 'SUPPLIER';
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const login = useAuthStore((state) => state.login);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identity: '',
      password: '',
    }
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await apiClient.post('/auth/login', {
        ...data,
        role,
      });
      if (response.data.success) {
        await login(response.data.data, response.data.data.token);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper className="px-6 bg-white">
      {/* Custom Header Back Button */}
      <View className="flex-row items-center mt-4 mb-8">
        <TouchableOpacity onPress={() => navigation.goBack()} className="absolute z-10 py-2">
          <Icon name="chevron-left" size={28} color="#1C1C1C" />
        </TouchableOpacity>
        <View className="flex-1">
          <Typography variant="bodyBold" className="text-center text-xl text-black">Sign In</Typography>
        </View>
      </View>

      <View className="items-center mb-10">
        <Logo size="md" style={{ marginBottom: 24 }} />
        {isSupplier ? (
          <>
            <Typography variant="h1Black" className="text-3xl text-black text-center mb-2">
              SUPPLIER PORTAL
            </Typography>
            <Typography variant="bodySmall" className="text-sm text-text-secondary text-center px-4 leading-5">
              Log in to manage your inventory, view orders,{'\n'}and respond to quote requests
            </Typography>
          </>
        ) : (
          <>
            <Typography
              variant="h1Black"
              className="text-center mb-2"
              style={{ fontSize: 34, lineHeight: 40, letterSpacing: -0.5 }}
              color="#000000"
            >
              Welcome Back!
            </Typography>
            <Typography variant="bodySmall" className="text-sm text-text-secondary text-center px-4 leading-5">
              Enter your credentials to access your{'\n'}buyer dashboard
            </Typography>
          </>
        )}
      </View>

      <View className="gap-y-4 mb-4">
        {error ? <Typography className="text-red-500 text-center">{error}</Typography> : null}
        
        <Controller
          control={control}
          name="identity"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput 
              placeholder="email id or phone number" 
              leftIcon="mail" 
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.identity?.message}
              autoCapitalize="none"
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput 
              placeholder="*******************" 
              isPassword 
              leftIcon="lock" 
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
            />
          )}
        />
      </View>

      <View className="flex-row justify-between items-center mb-8 px-1">
        <View className="flex-row items-center">
          {/* Checkbox Placeholder */}
          <TouchableOpacity className="w-5 h-5 rounded-full bg-primary justify-center items-center mr-2">
            <Icon name="check" size={12} color="#12294A" />
          </TouchableOpacity>
          <Typography variant="bodySemiBold" className="text-xs text-text-primary">Remember me</Typography>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Typography variant="bodyBold" className="text-sm text-accent">Forget Password ?</Typography>
        </TouchableOpacity>
      </View>

      <Button 
        title={`Sign In as ${isSupplier ? 'Supplier' : 'Buyer'}`} 
        onPress={handleSubmit(handleLogin)} 
        isLoading={isLoading}
        className="mb-8 rounded-full shadow-md"
      />

      <View className="flex-row justify-center items-center">
        <Typography variant="bodyBold" className="text-black text-sm mr-1">Don't have an account?</Typography>
        <Button 
          variant="link" 
          title="Sign Up" 
          onPress={() => navigation.navigate('SignUp')} 
          textClassName="text-sm"
          className="py-0"
        />
      </View>
    </ScreenWrapper>
  );
};

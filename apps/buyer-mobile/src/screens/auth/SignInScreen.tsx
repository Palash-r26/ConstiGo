import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Typography, Button, AuthInput, ScreenWrapper, Logo, useAuthStore, loginSchema, LoginFormData } from '@constigo/shared';
import Icon from 'react-native-vector-icons/Feather';
import { checkBuyerLogin, isBuyerSuccess } from '../../services/api/buyerApi';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const SignInScreen = ({ navigation }: any) => {
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

      const response = await checkBuyerLogin({
        phone: data.identity,
        password: data.password,
      });

      console.log('[Buyer SignIn] Raw Response:', response);

      if (isBuyerSuccess(response)) {
        const buyerId = response?.buyerid || response?.data?.buyerid || response?.id || `CB_${data.identity}`;
        const buyerData = response?.data || {};
        await login({
          _id: String(buyerId),
          buyerid: String(buyerId),
          phone: data.identity,
          firstName: buyerData.fname || buyerData.firstName || '',
          lastName: buyerData.lname || buyerData.lastName || '',
          email: buyerData.email || '',
          role: 'BUYER',
        }, response?.token || 'buyer_session_token');
      } else {
        setError(response?.message || response?.error || 'Invalid phone or password');
      }
    } catch (err: any) {
      console.error('[Buyer SignIn] Error:', err);
      setError(err.message || err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper className="px-6 bg-white">
      <View className="items-center mb-10 mt-8">
        <Logo size="md" style={{ marginBottom: 24 }} />
        <Typography
          variant="h1Black"
          className="text-center mb-2"
          style={{ fontSize: 34, lineHeight: 40, letterSpacing: -0.5 }}
          color="#111827"
        >
          Welcome Back!
        </Typography>
        <Typography variant="bodySmall" className="text-sm text-text-secondary text-center px-4 leading-5">
          Enter your credentials to access your{'\n'}buyer dashboard
        </Typography>
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
          <TouchableOpacity className="w-5 h-5 rounded-full bg-primary justify-center items-center mr-2">
            <Icon name="check" size={12} color="#FFFFFF" />
          </TouchableOpacity>
          <Typography variant="bodySemiBold" className="text-xs text-text-primary">Remember me</Typography>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Typography variant="bodyBold" className="text-sm text-primary">Forget Password ?</Typography>
        </TouchableOpacity>
      </View>

      <Button 
        title="Sign In as Buyer" 
        onPress={handleSubmit(handleLogin)} 
        isLoading={isLoading}
        className="mb-8 rounded-full shadow-md"
      />

      <View className="flex-row justify-center items-center">
        <Typography variant="bodyBold" className="text-[#111827] text-sm mr-1">Don't have an account?</Typography>
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

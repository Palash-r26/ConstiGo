import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Typography, Button, AuthInput, ScreenWrapper, Logo, useAuthStore, loginSchema, LoginFormData } from '@constigo/shared';
import Icon from 'react-native-vector-icons/Feather';
import { checkVendorLogin, checkCompanyStatus } from '../../services/api/vendorApi';
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

      const response = await checkVendorLogin({
        phone: data.identity,
        password: data.password,
      });

      console.log('[Supplier SignIn] Raw Response:', response);

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true || (response && !response?.error);
      if (isSuccess) {
        const vendorId = response?.vendorid || response?.data?.vendorid || response?.vendor_id || `CV_${data.identity}`;
        
        let hasCompany = true;
        try {
          const companyCheck = await checkCompanyStatus(String(vendorId));
          console.log('[Supplier SignIn] Check Company Raw Response:', companyCheck);
          if (companyCheck) {
            hasCompany = companyCheck?.status === true || companyCheck?.status === 'success' || !!companyCheck?.data || !!companyCheck?.companyname;
          }
        } catch (compErr) {
          console.warn('[Supplier SignIn] Check company error:', compErr);
        }

        await login({
          _id: String(vendorId),
          vendorid: String(vendorId),
          phone: data.identity,
          hasCompany,
          role: 'SUPPLIER',
        }, response?.token || 'vendor_session_token');
      } else {
        setError(response?.message || response?.error || 'Invalid phone or password');
      }
    } catch (err: any) {
      console.error('[Supplier SignIn] Error:', err);
      setError(err.message || err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper className="px-6 bg-white">
      <View className="items-center mb-10 mt-8">
        <Logo size="md" style={{ marginBottom: 24 }} />
        <Typography variant="h1Black" className="text-3xl text-[#111827] text-center mb-2">
          SUPPLIER PORTAL
        </Typography>
        <Typography variant="bodySmall" className="text-sm text-text-secondary text-center px-4 leading-5">
          Log in to manage your inventory, view orders,{'\n'}and respond to customer requests
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
        title="Sign In as Supplier" 
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

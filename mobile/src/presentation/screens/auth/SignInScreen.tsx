import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { AuthInput } from '../../components/AuthInput';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Logo } from '../../components/Logo';
import Icon from 'react-native-vector-icons/Feather';
import { apiClient } from '../../../infrastructure/api/client';
import { checkVendorLogin, checkCompanyStatus } from '../../../infrastructure/api/vendorApi';
import { checkBuyerLogin, isBuyerSuccess } from '../../../infrastructure/api/buyerApi';
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

      if (isSupplier) {
        // Call REAL production PHP endpoint: https://constigo.in/app/vendor/checklogin.php
        const response = await checkVendorLogin({
          phone: data.identity,
          password: data.password,
        });

        // Defensive handling: log raw response
        console.log('[SignInScreen] Vendor Check Login Raw Response:', response);

        const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true || (response && !response?.error);
        if (isSuccess) {
          const vendorId = response?.vendorid || response?.data?.vendorid || response?.vendor_id || `CV_${data.identity}`;
          
          // Check Company API: https://constigo.in/app/vendor/check-company.php
          let hasCompany = true;
          try {
            const companyCheck = await checkCompanyStatus(String(vendorId));
            console.log('[SignInScreen] Check Company Raw Response:', companyCheck);
            if (companyCheck) {
              hasCompany = companyCheck?.status === true || companyCheck?.status === 'success' || !!companyCheck?.data || !!companyCheck?.companyname;
            }
          } catch (compErr) {
            console.warn('[SignInScreen] Check company tentative error:', compErr);
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
      } else {
        // Call REAL production PHP endpoint: https://constigo.in/app/buyer/checklogin.php
        const response = await checkBuyerLogin({
          phone: data.identity,
          password: data.password,
        });

        console.log('[SignInScreen] Buyer Check Login Raw Response:', response);

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
      }
    } catch (err: any) {
      console.error('[SignInScreen] Login Error:', err);
      setError(err.message || err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper className="px-6 bg-white">
      {/* Custom Header Back Button */}
      <View className="flex-row items-center mt-4 mb-8">
        <TouchableOpacity onPress={() => navigation.goBack()} className="absolute z-10 py-2">
          <Icon name="chevron-left" size={28} color="#111827" />
        </TouchableOpacity>
        <View className="flex-1">
          <Typography variant="bodyBold" className="text-center text-xl text-[#111827]">Sign In</Typography>
        </View>
      </View>

      <View className="items-center mb-10">
        <Logo size="md" style={{ marginBottom: 24 }} />
        {isSupplier ? (
          <>
            <Typography variant="h1Black" className="text-3xl text-[#111827] text-center mb-2">
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
              color="#111827"
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
          {/* Checkbox */}
          <TouchableOpacity className="w-5 h-5 rounded-full bg-primary justify-center items-center mr-2">
            <Icon name="check" size={12} color="#FFFFFF" />
          </TouchableOpacity>
          <Typography variant="bodySemiBold" className="text-xs text-text-primary">Remember me</Typography>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword', { role })}>
          <Typography variant="bodyBold" className="text-sm text-primary">Forget Password ?</Typography>
        </TouchableOpacity>
      </View>

      <Button 
        title={`Sign In as ${isSupplier ? 'Supplier' : 'Buyer'}`} 
        onPress={handleSubmit(handleLogin)} 
        isLoading={isLoading}
        className="mb-8 rounded-full shadow-md"
      />

      <View className="flex-row justify-center items-center">
        <Typography variant="bodyBold" className="text-[#111827] text-sm mr-1">Don't have an account?</Typography>
        <Button 
          variant="link" 
          title="Sign Up" 
          onPress={() => navigation.navigate('SignUp', { role })} 
          textClassName="text-sm"
          className="py-0"
        />
      </View>
    </ScreenWrapper>
  );
};

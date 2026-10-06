import React from 'react';
import { View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { AuthInput } from '../../components/AuthInput';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/Feather';
import { apiClient } from '../../../infrastructure/api/client';
import { registerVendor } from '../../../infrastructure/api/vendorApi';
import { registerBuyer, isBuyerSuccess } from '../../../infrastructure/api/buyerApi';
import { useAuthStore } from '../../../application/store/authStore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, SignUpFormData } from '../../../application/utils/validators';

export const SignUpScreen = ({ navigation, route }: any) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showPicker, setShowPicker] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<'BUYER' | 'SUPPLIER'>(
    (route?.params?.role?.toUpperCase() === 'SUPPLIER') ? 'SUPPLIER' : 'BUYER'
  );
  const login = useAuthStore((state) => state.login);

  const { control, handleSubmit, formState: { errors } } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    }
  });

  const handleRegister = async (data: SignUpFormData) => {
    try {
      setIsLoading(true);
      setError('');

      if (selectedRole === 'SUPPLIER') {
        // Call REAL production PHP endpoint: https://constigo.in/app/vendor/registration.php
        const response = await registerVendor({
          fname: data.firstName,
          lname: data.lastName,
          dob: data.dateOfBirth,
          email: data.email,
          phone: data.phone,
          password: data.password,
          confrimpassword: data.confirmPassword, // Exact param name required by PHP API
        });

        // Defensive handling: log raw response
        console.log('[SignUpScreen] Supplier Registration Raw Response:', response);

        const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true || (response && !response?.error);
        if (isSuccess) {
          const vendorId = response?.vendorid || response?.data?.vendorid || response?.vendor_id || `CV_${data.phone}`;
          await login({
            _id: String(vendorId),
            vendorid: String(vendorId),
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            role: 'SUPPLIER',
          }, response?.token || 'vendor_session_token');
        } else {
          setError(response?.message || response?.error || 'Registration failed. Please try again.');
        }
      } else {
        // Call REAL production PHP endpoint: https://constigo.in/app/buyer/registration.php
        const response = await registerBuyer({
          fname: data.firstName,
          lname: data.lastName,
          dob: data.dateOfBirth,
          email: data.email,
          phone: data.phone,
          password: data.password,
          confrimpassword: data.confirmPassword,
        });

        console.log('[SignUpScreen] Buyer Registration Raw Response:', response);

        if (isBuyerSuccess(response)) {
          const buyerId = response?.buyerid || response?.data?.buyerid || response?.id || `CB_${data.phone}`;
          await login({
            _id: String(buyerId),
            buyerid: String(buyerId),
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            role: 'BUYER',
          }, response?.token || 'buyer_session_token');
        } else {
          setError(response?.message || response?.error || 'Buyer registration failed. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('[SignUpScreen] Registration Error:', err);
      setError(err.message || err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center mt-4 mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()} className="absolute z-10">
            <Icon name="chevron-left" size={28} color="#111827" />
          </TouchableOpacity>
          <View className="flex-1">
            <Typography variant="h2" className="text-center text-xl text-[#111827]">Sign Up</Typography>
          </View>
        </View>

        {/* Role Selector */}
        <View className="flex-row bg-[#F0F2F5] rounded-full p-1 mb-6">
          <TouchableOpacity
            onPress={() => setSelectedRole('BUYER')}
            className={`flex-1 py-2.5 rounded-full items-center justify-center ${selectedRole === 'BUYER' ? 'bg-[#8B0000]' : ''}`}
          >
            <Typography
              variant="bodyBold"
              className="text-sm"
              color={selectedRole === 'BUYER' ? '#FFFFFF' : '#111827'}
            >
              Buyer Account
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedRole('SUPPLIER')}
            className={`flex-1 py-2.5 rounded-full items-center justify-center ${selectedRole === 'SUPPLIER' ? 'bg-[#8B0000]' : ''}`}
          >
            <Typography
              variant="bodyBold"
              className="text-sm"
              color={selectedRole === 'SUPPLIER' ? '#FFFFFF' : '#111827'}
            >
              Supplier Account
            </Typography>
          </TouchableOpacity>
        </View>

        <View className="gap-y-4 mb-10">
          {error ? <Typography className="text-red-500 text-center">{error}</Typography> : null}
          
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthInput fill="dark" placeholder="First Name" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.firstName?.message} />
            )}
          />
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthInput fill="dark" placeholder="Last Name" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.lastName?.message} />
            )}
          />
          {/* Date of Birth field (per Sign Up design) */}
          <Controller
            control={control}
            name="dateOfBirth"
            render={({ field: { onChange, value } }) => (
              <View className="mb-2">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowPicker(true)}
                  className={`flex-row items-center justify-between rounded-2xl px-5 py-4 ${errors.dateOfBirth ? 'bg-red-50 border border-red-500' : 'bg-[#E2E5EA]'}`}
                >
                  {/* Match AuthInput placeholder exactly: same font (Montserrat-Regular),
                      same size (text-base) and same placeholder color (#8A8A8E). */}
                  <Typography
                    style={{ fontFamily: 'Montserrat-Regular' }}
                    className="text-base"
                    color={errors.dateOfBirth ? '#EF4444' : value ? '#111827' : '#8A8A8E'}
                  >
                    {value || 'Date of Birth'}
                  </Typography>
                  <Icon name="calendar" size={20} color={errors.dateOfBirth ? '#EF4444' : '#8B0000'} />
                </TouchableOpacity>
                {errors.dateOfBirth ? (
                  <Typography variant="bodySmall" className="text-red-500 ml-2 mt-1">{errors.dateOfBirth.message}</Typography>
                ) : null}
                {showPicker && (
                  <DateTimePicker
                    value={value ? new Date(value) : new Date(2000, 0, 1)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    maximumDate={new Date()}
                    onChange={(event, selectedDate) => {
                      setShowPicker(Platform.OS === 'ios');
                      if (event.type === 'set' && selectedDate) {
                        const iso = selectedDate.toISOString().split('T')[0];
                        onChange(iso);
                      }
                    }}
                  />
                )}
              </View>
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthInput fill="dark" placeholder="Email Id" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} autoCapitalize="none" />
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthInput fill="dark" placeholder="Phone Number" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.phone?.message} keyboardType="phone-pad" />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthInput fill="dark" placeholder="Password" isPassword value={value} onChangeText={onChange} onBlur={onBlur} error={errors.password?.message} />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthInput fill="dark" placeholder="Confirm Password" isPassword value={value} onChangeText={onChange} onBlur={onBlur} error={errors.confirmPassword?.message} />
            )}
          />
        </View>

        <Button 
          title="Sign Up" 
          onPress={handleSubmit(handleRegister)} 
          isLoading={isLoading}
          className="mb-8"
        />

        <View className="flex-row justify-center items-center">
          <Typography variant="bodyBold" className="text-sm text-[#111827]">Already have an account? </Typography>
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

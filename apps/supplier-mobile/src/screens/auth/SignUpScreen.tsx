import React from 'react';
import { View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Typography, Button, AuthInput, ScreenWrapper, useAuthStore, signUpSchema, SignUpFormData } from '@constigo/shared';
import Icon from 'react-native-vector-icons/Feather';
import { registerVendor } from '../../services/api/vendorApi';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const SignUpScreen = ({ navigation }: any) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showPicker, setShowPicker] = React.useState(false);
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

      const response = await registerVendor({
        fname: data.firstName,
        lname: data.lastName,
        dob: data.dateOfBirth,
        email: data.email,
        phone: data.phone,
        password: data.password,
        confrimpassword: data.confirmPassword,
      });

      console.log('[Supplier SignUp] Raw Response:', response);

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true || (response && !response?.error);
      if (isSuccess) {
        const vendorId = response?.vendorid || response?.data?.vendorid || response?.vendor_id || `CV_${data.phone}`;
        await login({
          _id: String(vendorId),
          vendorid: String(vendorId),
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          hasCompany: false,
          role: 'SUPPLIER',
        }, response?.token || 'vendor_session_token');
      } else {
        setError(response?.message || response?.error || 'Supplier registration failed. Please try again.');
      }
    } catch (err: any) {
      console.error('[Supplier SignUp] Error:', err);
      setError(err.message || err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper className="px-6 bg-white">
      <View className="flex-row items-center mt-4 mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="absolute z-10 py-2">
          <Icon name="chevron-left" size={28} color="#111827" />
        </TouchableOpacity>
        <View className="flex-1">
          <Typography variant="bodyBold" className="text-center text-xl text-[#111827]">Supplier Sign Up</Typography>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="mb-6">
          <Typography variant="h1Black" className="text-3xl text-[#111827] text-center mb-1">
            Register as Supplier
          </Typography>
          <Typography variant="bodySmall" className="text-sm text-text-secondary text-center">
            Create an account to sell construction materials and reach thousands of buyers
          </Typography>
        </View>

        {error ? <Typography className="text-red-500 text-center mb-4">{error}</Typography> : null}

        <View className="gap-y-3 mb-6">
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthInput 
                placeholder="First name" 
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.firstName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthInput 
                placeholder="Last name" 
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.lastName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="dateOfBirth"
            render={({ field: { onChange, value } }) => (
              <View>
                <TouchableOpacity 
                  onPress={() => setShowPicker(true)}
                  activeOpacity={0.7}
                >
                  <View pointerEvents="none">
                    <AuthInput 
                      placeholder="Date of birth (DD-MM-YYYY)" 
                      value={value}
                      editable={false}
                      leftIcon="calendar"
                      error={errors.dateOfBirth?.message}
                    />
                  </View>
                </TouchableOpacity>

                {showPicker && (
                  <DateTimePicker
                    value={value ? new Date(value.split('-').reverse().join('-')) : new Date(2000, 0, 1)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    maximumDate={new Date()}
                    onChange={(event, selectedDate) => {
                      setShowPicker(Platform.OS === 'ios');
                      if (selectedDate) {
                        const day = String(selectedDate.getDate()).padStart(2, '0');
                        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                        const year = selectedDate.getFullYear();
                        onChange(`${day}-${month}-${year}`);
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
              <AuthInput 
                placeholder="Email id" 
                leftIcon="mail" 
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthInput 
                placeholder="Phone number" 
                leftIcon="phone" 
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phone?.message}
                keyboardType="phone-pad"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthInput 
                placeholder="Password" 
                isPassword 
                leftIcon="lock" 
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthInput 
                placeholder="Confirm password" 
                isPassword 
                leftIcon="lock" 
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
              />
            )}
          />
        </View>

        <Button 
          title="Register as Supplier" 
          onPress={handleSubmit(handleRegister)} 
          isLoading={isLoading}
          className="mb-6 rounded-full shadow-md"
        />

        <View className="flex-row justify-center items-center">
          <Typography variant="bodyBold" className="text-[#111827] text-sm mr-1">Already registered?</Typography>
          <Button 
            variant="link" 
            title="Sign In" 
            onPress={() => navigation.navigate('SignIn')} 
            textClassName="text-sm"
            className="py-0"
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

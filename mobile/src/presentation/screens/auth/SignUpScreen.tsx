import React from 'react';
import { View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { AuthInput } from '../../components/AuthInput';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/Feather';
import { apiClient } from '../../../infrastructure/api/client';
import { useAuthStore } from '../../../application/store/authStore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, SignUpFormData } from '../../../application/utils/validators';

export const SignUpScreen = ({ navigation, route }: any) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showPicker, setShowPicker] = React.useState(false);
  const login = useAuthStore((state) => state.login);
  const { role } = route?.params || { role: 'BUYER' };

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
      const response = await apiClient.post('/auth/register', {
        ...data,
        role
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
                  <Typography className={value ? 'text-base text-text-primary' : 'text-base text-text-secondary'}>
                    {value || 'Date of Birth'}
                  </Typography>
                  <Icon name="calendar" size={20} color="#9C101A" />
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
          <Typography variant="bodyBold" className="text-sm text-black">Already have an account? </Typography>
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

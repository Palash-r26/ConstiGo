import React, { useState } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { Typography, Button, AuthInput, ScreenWrapper, changePasswordSchema } from '@constigo/shared';
import Icon from 'react-native-vector-icons/Feather';
import { changeVendorPassword } from '../../services/api/vendorApi';

export const ChangePasswordScreen = ({ route, navigation }: any) => {
  const initialPhone = route?.params?.phone || '';

  const [phone, setPhone] = useState(initialPhone);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChangePassword = async () => {
    setFieldErrors({});
    setServerError('');

    const validation = changePasswordSchema.safeParse({
      phone: phone.trim(),
      newPassword,
      confirmPassword,
    });

    if (!validation.success) {
      const formatted = validation.error.format();
      setFieldErrors({
        phone: formatted.phone?._errors[0] || '',
        newPassword: formatted.newPassword?._errors[0] || '',
        confirmPassword: formatted.confirmPassword?._errors[0] || '',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await changeVendorPassword({
        phone: phone.trim(),
        newpassword: newPassword,
        confirmpassword: confirmPassword,
      });

      console.log('[Supplier ChangePassword] Raw Response:', response);

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true || (response && !response?.error);
      if (isSuccess) {
        Alert.alert(
          'Password Changed',
          'Your supplier password has been successfully updated. Please sign in with your new password.',
          [
            {
              text: 'Sign In Now',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'SignIn' }],
                });
              },
            },
          ]
        );
      } else {
        setServerError(response?.message || response?.error || 'Failed to update password. Please try again.');
      }
    } catch (err: any) {
      console.error('[Supplier ChangePassword] Error:', err);
      setServerError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper className="px-6 bg-white">
      <View className="flex-row items-center mt-4 mb-8">
        <TouchableOpacity onPress={() => navigation.goBack()} className="absolute z-10 py-2">
          <Icon name="chevron-left" size={28} color="#111827" />
        </TouchableOpacity>
        <View className="flex-1">
          <Typography variant="bodyBold" className="text-center text-xl text-[#111827]">
            Set New Password
          </Typography>
        </View>
      </View>

      <View className="items-center mb-8">
        <View className="w-16 h-16 rounded-full bg-red-50 justify-center items-center mb-4">
          <Icon name="lock" size={32} color="#8B0000" />
        </View>

        <Typography variant="h1Black" className="text-2xl text-[#111827] text-center mb-2">
          Supplier Credentials
        </Typography>

        <Typography variant="bodySmall" className="text-sm text-text-secondary text-center px-4 leading-5">
          Create a secure new password for your supplier portal account
        </Typography>
      </View>

      {serverError ? (
        <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
          <Typography variant="bodySmall" className="text-red-600 text-center">{serverError}</Typography>
        </View>
      ) : null}

      <View className="gap-y-4 mb-8">
        <AuthInput
          placeholder="Phone Number"
          leftIcon="phone"
          value={phone}
          onChangeText={(val) => {
            setPhone(val);
            if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
          }}
          error={fieldErrors.phone}
          keyboardType="phone-pad"
        />

        <AuthInput
          placeholder="New Password (min 6 characters)"
          isPassword
          leftIcon="lock"
          value={newPassword}
          onChangeText={(val) => {
            setNewPassword(val);
            if (fieldErrors.newPassword) setFieldErrors({ ...fieldErrors, newPassword: '' });
          }}
          error={fieldErrors.newPassword}
        />

        <AuthInput
          placeholder="Confirm New Password"
          isPassword
          leftIcon="lock"
          value={confirmPassword}
          onChangeText={(val) => {
            setConfirmPassword(val);
            if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
          }}
          error={fieldErrors.confirmPassword}
        />
      </View>

      <Button
        title="Reset Password"
        onPress={handleChangePassword}
        isLoading={isLoading}
        className="rounded-full shadow-md"
      />
    </ScreenWrapper>
  );
};

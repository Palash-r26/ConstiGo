import React, { useState } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { AuthInput } from '../../components/AuthInput';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/Feather';
import { changeVendorPassword } from '../../../infrastructure/api/vendorApi';
import { changeBuyerPassword, isBuyerSuccess } from '../../../infrastructure/api/buyerApi';
import { changePasswordSchema } from '../../../application/utils/validators';

export const ChangePasswordScreen = ({ route, navigation }: any) => {
  const initialPhone = route?.params?.phone || '';
  const role = route?.params?.role || 'BUYER';
  const isSupplier = role === 'SUPPLIER';

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
      let response: any;
      if (isSupplier) {
        // Call REAL PHP production endpoint: https://constigo.in/app/vendor/changepassword.php
        response = await changeVendorPassword({
          phone: phone.trim(),
          newpassword: newPassword,
          confirmpassword: confirmPassword,
        });
      } else {
        // Call REAL PHP production endpoint: https://constigo.in/app/buyer/changepassword.php
        response = await changeBuyerPassword({
          phone: phone.trim(),
          newpassword: newPassword,
          confirmpassword: confirmPassword,
        });
      }

      console.log('[ChangePasswordScreen] Change Password Raw Response:', response);

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true || (response && !response?.error);
      if (isSuccess) {
        Alert.alert(
          'Password Changed',
          'Your password has been successfully reset. Please sign in with your new password.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('SignIn', { role }),
            },
          ]
        );
      } else {
        setServerError(response?.message || response?.error || 'Failed to change password. Please try again.');
      }
    } catch (err: any) {
      console.error('[ChangePasswordScreen] Change Password Error:', err);
      setServerError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper className="px-6 bg-white">
      {/* Header */}
      <View className="flex-row items-center mt-4 mb-12">
        <TouchableOpacity onPress={() => navigation.goBack()} className="absolute z-10 py-2">
          <Icon name="chevron-left" size={28} color="#111827" />
        </TouchableOpacity>
        <View className="flex-1">
          <Typography variant="bodyBold" className="text-center text-xl text-[#111827]">
            Change Password
          </Typography>
        </View>
      </View>

      <View className="items-center mb-8 px-4">
        <Typography variant="bodySmall" className="text-sm text-text-secondary text-center leading-5">
          Enter your phone number and new password below to reset your credentials.
        </Typography>
      </View>

      {serverError ? (
        <Typography className="text-red-500 text-center mb-4 text-sm">{serverError}</Typography>
      ) : null}

      <View className="gap-y-4 mb-10">
        {!initialPhone ? (
          <AuthInput
            placeholder="Phone Number"
            leftIcon="phone"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
            }}
            error={fieldErrors.phone}
            keyboardType="phone-pad"
            maxLength={10}
          />
        ) : null}
        <AuthInput
          placeholder="New Password"
          isPassword
          leftIcon="lock"
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            if (fieldErrors.newPassword) setFieldErrors({ ...fieldErrors, newPassword: '' });
          }}
          error={fieldErrors.newPassword}
        />
        <AuthInput
          placeholder="Confirm Password"
          isPassword
          leftIcon="lock"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
          }}
          error={fieldErrors.confirmPassword}
        />
      </View>

      <Button
        title="Save Now"
        onPress={handleChangePassword}
        isLoading={isLoading}
        className="rounded-full shadow-md"
      />
    </ScreenWrapper>
  );
};

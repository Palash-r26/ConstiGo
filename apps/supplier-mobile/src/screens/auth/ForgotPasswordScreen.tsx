import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Typography, Button, AuthInput, ScreenWrapper, forgotSendOtpSchema, forgotVerifyOtpSchema } from '@constigo/shared';
import Icon from 'react-native-vector-icons/Feather';
import {
  sendForgotOtp,
  verifyForgotOtp,
} from '../../services/api/vendorApi';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [step, setStep] = useState<'SEND_OTP' | 'VERIFY_OTP'>('SEND_OTP');
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSendOtp = async () => {
    setFieldErrors({});
    setServerError('');
    setSuccessMessage('');

    const validation = forgotSendOtpSchema.safeParse({ phone: phone.trim() });
    if (!validation.success) {
      const formatted = validation.error.format();
      setFieldErrors({ phone: formatted.phone?._errors[0] || 'Invalid phone number' });
      return;
    }

    try {
      setIsLoading(true);
      const response = await sendForgotOtp(phone.trim());
      console.log('[Supplier ForgotPassword] Send OTP Raw Response:', response);

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true || (response && !response?.error);
      if (isSuccess) {
        setSuccessMessage('OTP sent successfully to your registered supplier phone number.');
        setStep('VERIFY_OTP');
      } else {
        setServerError(response?.message || response?.error || 'Failed to send OTP. Please verify your phone number.');
      }
    } catch (err: any) {
      console.error('[Supplier ForgotPassword] Send OTP Error:', err);
      setServerError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setFieldErrors({});
    setServerError('');

    const validation = forgotVerifyOtpSchema.safeParse({ phone: phone.trim(), otp: otp.trim() });
    if (!validation.success) {
      const formatted = validation.error.format();
      setFieldErrors({
        phone: formatted.phone?._errors[0] || '',
        otp: formatted.otp?._errors[0] || 'Enter a valid 4-digit OTP',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await verifyForgotOtp(
        phone.trim(),
        otp.trim()
      );
      console.log('[Supplier ForgotPassword] Verify OTP Raw Response:', response);

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true || (response && !response?.error);
      if (isSuccess) {
        navigation.navigate('ChangePassword', {
          phone: phone.trim(),
        });
      } else {
        setServerError(response?.message || response?.error || 'Invalid OTP. Please check and try again.');
      }
    } catch (err: any) {
      console.error('[Supplier ForgotPassword] Verify OTP Error:', err);
      setServerError(err.message || 'OTP verification failed. Please try again.');
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
            {step === 'SEND_OTP' ? 'Forgot Password' : 'Enter OTP'}
          </Typography>
        </View>
      </View>

      <View className="items-center mb-8">
        <View className="w-16 h-16 rounded-full bg-red-50 justify-center items-center mb-4">
          <Icon name={step === 'SEND_OTP' ? 'smartphone' : 'shield'} size={32} color="#8B0000" />
        </View>

        <Typography variant="h1Black" className="text-2xl text-[#111827] text-center mb-2">
          Supplier Account Recovery
        </Typography>

        <Typography variant="bodySmall" className="text-sm text-text-secondary text-center px-4 leading-5">
          {step === 'SEND_OTP'
            ? 'Enter your registered phone number below to receive a password reset OTP'
            : `We have sent a 4-digit verification OTP to +91 ${phone}`}
        </Typography>
      </View>

      {serverError ? (
        <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
          <Typography variant="bodySmall" className="text-red-600 text-center">{serverError}</Typography>
        </View>
      ) : null}

      {successMessage ? (
        <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4">
          <Typography variant="bodySmall" className="text-emerald-700 text-center">{successMessage}</Typography>
        </View>
      ) : null}

      <View className="gap-y-4 mb-6">
        <AuthInput
          placeholder="Registered Phone Number"
          leftIcon="phone"
          value={phone}
          onChangeText={(val) => {
            setPhone(val);
            if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
          }}
          error={fieldErrors.phone}
          keyboardType="phone-pad"
          editable={step === 'SEND_OTP'}
        />

        {step === 'VERIFY_OTP' && (
          <AuthInput
            placeholder="Enter 4-digit OTP"
            leftIcon="key"
            value={otp}
            onChangeText={(val) => {
              setOtp(val);
              if (fieldErrors.otp) setFieldErrors({ ...fieldErrors, otp: '' });
            }}
            error={fieldErrors.otp}
            keyboardType="number-pad"
            maxLength={6}
          />
        )}
      </View>

      {step === 'SEND_OTP' ? (
        <Button
          title="Send OTP"
          onPress={handleSendOtp}
          isLoading={isLoading}
          className="mb-4 rounded-full shadow-md"
        />
      ) : (
        <View className="gap-y-3">
          <Button
            title="Verify & Continue"
            onPress={handleVerifyOtp}
            isLoading={isLoading}
            className="rounded-full shadow-md"
          />

          <Button
            variant="outline"
            title="Resend OTP"
            onPress={handleSendOtp}
            disabled={isLoading}
            className="rounded-full"
          />
        </View>
      )}

      <View className="flex-row justify-center items-center mt-6">
        <Typography variant="bodyBold" className="text-[#111827] text-sm mr-1">Remember your password?</Typography>
        <Button
          variant="link"
          title="Sign In"
          onPress={() => navigation.navigate('SignIn')}
          textClassName="text-sm"
          className="py-0"
        />
      </View>
    </ScreenWrapper>
  );
};

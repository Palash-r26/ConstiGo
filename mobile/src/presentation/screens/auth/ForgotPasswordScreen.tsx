import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { AuthInput } from '../../components/AuthInput';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/Feather';
import { sendForgotOtp, verifyForgotOtp } from '../../../infrastructure/api/vendorApi';
import { forgotSendOtpSchema, forgotVerifyOtpSchema } from '../../../application/utils/validators';

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
      // Call REAL PHP production endpoint: https://constigo.in/app/vendor/forgot_sendotp.php
      const response = await sendForgotOtp(phone.trim());
      console.log('[ForgotPasswordScreen] Send OTP Raw Response:', response);

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true || (response && !response?.error);
      if (isSuccess) {
        setSuccessMessage('OTP sent successfully to your registered phone number.');
        setStep('VERIFY_OTP');
      } else {
        setServerError(response?.message || response?.error || 'Failed to send OTP. Please verify your phone number.');
      }
    } catch (err: any) {
      console.error('[ForgotPasswordScreen] Send OTP Error:', err);
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
      // Call REAL PHP production endpoint: https://constigo.in/app/vendor/forgot_verifyotp.php
      const response = await verifyForgotOtp(phone.trim(), otp.trim());
      console.log('[ForgotPasswordScreen] Verify OTP Raw Response:', response);

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true || (response && !response?.error);
      if (isSuccess) {
        navigation.navigate('ChangePassword', { phone: phone.trim() });
      } else {
        setServerError(response?.message || response?.error || 'Invalid OTP. Please check and try again.');
      }
    } catch (err: any) {
      console.error('[ForgotPasswordScreen] Verify OTP Error:', err);
      setServerError(err.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper className="px-6 bg-white">
      {/* Header */}
      <View className="flex-row items-center mt-4 mb-16">
        <TouchableOpacity onPress={() => navigation.goBack()} className="absolute z-10 py-2">
          <Icon name="chevron-left" size={28} color="#182F4B" />
        </TouchableOpacity>
        <View className="flex-1">
          <Typography variant="bodyBold" className="text-center text-xl text-[#182F4B]">
            {step === 'SEND_OTP' ? 'Forgot Password' : 'Enter OTP'}
          </Typography>
        </View>
      </View>

      <View className="items-center mb-8 px-4">
        <Typography variant="bodySmall" className="text-sm text-text-secondary text-center leading-5">
          {step === 'SEND_OTP'
            ? 'Enter your registered phone number to receive a verification OTP.'
            : `Enter the 4-digit OTP sent to +91 ${phone}`}
        </Typography>
      </View>

      {serverError ? (
        <Typography className="text-red-500 text-center mb-4 text-sm">{serverError}</Typography>
      ) : null}

      {successMessage ? (
        <Typography className="text-green-600 text-center mb-4 text-sm">{successMessage}</Typography>
      ) : null}

      {step === 'SEND_OTP' ? (
        <>
          <View className="gap-y-4 mb-8">
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
          </View>

          <Button 
            title="Send OTP" 
            onPress={handleSendOtp} 
            isLoading={isLoading}
            className="rounded-full shadow-md"
          />
        </>
      ) : (
        <>
          <View className="gap-y-4 mb-8">
            <AuthInput 
              placeholder="Enter OTP" 
              leftIcon="lock" 
              value={otp}
              onChangeText={(text) => {
                setOtp(text);
                if (fieldErrors.otp) setFieldErrors({ ...fieldErrors, otp: '' });
              }}
              error={fieldErrors.otp}
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>

          <Button 
            title="Verify OTP" 
            onPress={handleVerifyOtp} 
            isLoading={isLoading}
            className="rounded-full shadow-md mb-4"
          />

          <TouchableOpacity
            onPress={() => {
              setFieldErrors({});
              setServerError('');
              setStep('SEND_OTP');
            }}
            className="py-2 items-center"
          >
            <Typography variant="bodySemiBold" className="text-accent text-sm">
              Change Phone Number
            </Typography>
          </TouchableOpacity>
        </>
      )}
    </ScreenWrapper>
  );
};

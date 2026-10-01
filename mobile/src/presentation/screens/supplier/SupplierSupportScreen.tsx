import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { SupplierTopHeader } from '../../components/SupplierTopHeader';
import { supportSchema } from '../../../application/utils/validators';
import { useAuthStore } from '../../../application/store/authStore';
import { submitVendorSupport } from '../../../infrastructure/api/vendorApi';

export const SupplierSupportScreen = ({ navigation }: any) => {
  const user = useAuthStore((state) => state.user);
  const vendorId = user?.vendorid || user?._id || 'CV290926162458';

  const [name, setName] = useState(
    user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : ''
  );
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleSubmit = async () => {
    setFieldErrors({});
    setServerError('');

    const formData = {
      name: name.trim(),
      phoneNumber: phoneNumber.replace(/\D/g, '').slice(-10),
      message: message.trim(),
    };

    const validation = supportSchema.safeParse(formData);
    if (!validation.success) {
      const formatted = validation.error.format();
      const errors: Record<string, string> = {};
      if (formatted.name?._errors[0]) errors.name = formatted.name._errors[0];
      if (formatted.phoneNumber?._errors[0]) errors.phoneNumber = formatted.phoneNumber._errors[0];
      if (formatted.message?._errors[0]) errors.message = formatted.message._errors[0];
      setFieldErrors(errors);
      return;
    }

    try {
      setIsLoading(true);
      // Call REAL PHP production endpoint: https://constigo.in/app/vendor/support.php
      const response = await submitVendorSupport({
        vendorid: vendorId,
        name: formData.name,
        phone: formData.phoneNumber,
        message: formData.message,
      });

      console.log('[SupplierSupportScreen] Support Submission Raw Response:', response);

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true || (response && !response?.error);
      if (isSuccess) {
        Alert.alert('Support Request Submitted', 'Our team will review your message and contact you shortly.');
        setMessage('');
      } else {
        setServerError(response?.message || response?.error || 'Failed to submit support request. Please try again.');
      }
    } catch (err: any) {
      console.error('[SupplierSupportScreen] Support Error:', err);
      setServerError(err.message || 'An error occurred while submitting your support request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper className="bg-[#F5F6FA]">
      <SupplierTopHeader
        onProfilePress={() => navigation?.navigate('Profile')}
        onNotificationPress={() => navigation?.navigate('Notifications')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleContainer}>
          <Typography variant="h1" style={styles.mainTitle}>
            Support
          </Typography>
          <Typography variant="bodySmall" style={styles.subtitle}>
            For more Queries
          </Typography>
        </View>

        {serverError ? (
          <Typography className="text-red-500 text-center mb-4 text-sm">{serverError}</Typography>
        ) : null}

        {/* Inputs */}
        <View style={styles.inputGroup}>
          <View>
            <View style={[styles.pillInputContainer, fieldErrors.name && styles.inputError]}>
              <TextInput
                style={styles.textInput}
                placeholder="Name"
                placeholderTextColor={fieldErrors.name ? '#EF4444' : '#9CA3AF'}
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                }}
              />
            </View>
            {fieldErrors.name ? (
              <Typography variant="bodySmall" style={styles.inlineErrorText}>
                {fieldErrors.name}
              </Typography>
            ) : null}
          </View>

          <View>
            <View style={[styles.pillInputContainer, fieldErrors.phoneNumber && styles.inputError]}>
              <TextInput
                style={styles.textInput}
                placeholder="Phone Number"
                placeholderTextColor={fieldErrors.phoneNumber ? '#EF4444' : '#9CA3AF'}
                keyboardType="phone-pad"
                maxLength={10}
                value={phoneNumber}
                onChangeText={(t) => {
                  setPhoneNumber(t);
                  if (fieldErrors.phoneNumber) setFieldErrors({ ...fieldErrors, phoneNumber: '' });
                }}
              />
            </View>
            {fieldErrors.phoneNumber ? (
              <Typography variant="bodySmall" style={styles.inlineErrorText}>
                {fieldErrors.phoneNumber}
              </Typography>
            ) : null}
          </View>

          <View>
            <View style={[styles.textAreaContainer, fieldErrors.message && styles.inputError]}>
              <TextInput
                style={styles.textAreaInput}
                placeholder="Message"
                placeholderTextColor={fieldErrors.message ? '#EF4444' : '#9CA3AF'}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={message}
                onChangeText={(t) => {
                  setMessage(t);
                  if (fieldErrors.message) setFieldErrors({ ...fieldErrors, message: '' });
                }}
              />
            </View>
            {fieldErrors.message ? (
              <Typography variant="bodySmall" style={styles.inlineErrorText}>
                {fieldErrors.message}
              </Typography>
            ) : null}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && { opacity: 0.7 }]}
          activeOpacity={0.85}
          disabled={isLoading}
          onPress={handleSubmit}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Typography variant="bodyBold" style={styles.submitButtonText}>
              Submit
            </Typography>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 26,
  },
  mainTitle: {
    fontSize: 26,
    color: '#0F172A',
    fontFamily: 'BalooBhai2-Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Montserrat-Medium',
    marginTop: 4,
    textAlign: 'center',
  },
  inputGroup: {
    gap: 16,
  },
  pillInputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  textAreaContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 16,
    height: 170,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inlineErrorText: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 12,
    fontFamily: 'Montserrat-Medium',
  },
  textInput: {
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'Montserrat-Medium',
    padding: 0,
  },
  textAreaInput: {
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'Montserrat-Medium',
    height: '100%',
    padding: 0,
  },
  submitButton: {
    backgroundColor: '#8B0000',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 36,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
});

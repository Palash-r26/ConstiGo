import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { SupplierTopHeader } from '../../components/SupplierTopHeader';
import { supportSchema } from '../../../application/utils/validators';

export const SupplierSupportScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = () => {
    setFieldErrors({});

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

    Alert.alert('Support Request Submitted', 'Our team will contact you shortly.');
    setName('');
    setPhoneNumber('');
    setMessage('');
  };

  return (
    <ScreenWrapper className="bg-[#F5F6FA]">
      <SupplierTopHeader
        onProfilePress={() => navigation?.navigate('Profile')}
        onNotificationPress={() => {}}
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
            For more Quaries
          </Typography>
        </View>

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
          style={styles.submitButton}
          activeOpacity={0.85}
          onPress={handleSubmit}
        >
          <Typography variant="bodyBold" style={styles.submitButtonText}>
            Submit
          </Typography>
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

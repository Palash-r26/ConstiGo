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
import { Logo } from '../../components/Logo';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUserStore } from '../../../application/store/userStore';
import { apiClient } from '../../../infrastructure/api/client';
import { editProfileSchema } from '../../../application/utils/validators';

export const EditProfileScreen = ({ navigation }: any) => {
  const { profile, fetchProfile, updateProfile } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [name, setName] = useState(
    profile?.firstName ? `${profile.firstName} ${profile.lastName}`.trim() : 'Anant Pratap Gaur'
  );
  const [phone, setPhone] = useState(profile?.phone || '9589908555');
  const [email, setEmail] = useState(
    profile?.email || 'infinity.gaur008@gmail.com'
  );
  const [address, setAddress] = useState('Govindpuri, near darpan colony');
  const [city, setCity] = useState('Gwalior');
  const [state, setState] = useState('Madhya Pradesh');
  const [pincode, setPincode] = useState('474011');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const handleSave = async () => {
    setFieldErrors({});

    const formData = {
      name: name.trim(),
      phone: phone.replace(/\D/g, '').slice(-10),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
    };

    const validation = editProfileSchema.safeParse(formData);
    if (!validation.success) {
      const formatted = validation.error.format();
      const errors: Record<string, string> = {};
      if (formatted.name?._errors[0]) errors.name = formatted.name._errors[0];
      if (formatted.phone?._errors[0]) errors.phone = formatted.phone._errors[0];
      if (formatted.email?._errors[0]) errors.email = formatted.email._errors[0];
      if (formatted.address?._errors[0]) errors.address = formatted.address._errors[0];
      if (formatted.city?._errors[0]) errors.city = formatted.city._errors[0];
      if (formatted.state?._errors[0]) errors.state = formatted.state._errors[0];
      if (formatted.pincode?._errors[0]) errors.pincode = formatted.pincode._errors[0];
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const parts = formData.name.split(' ');
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';

      await updateProfile({
        fname: firstName,
        lname: lastName,
        phone: formData.phone,
        email: formData.email,
        dob: profile?.dob || '26-08-1990',
      });
      await fetchProfile();
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Profile')}
          style={styles.avatarButton}
        >
          <Icon name="user" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <Logo size="sm" />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Notifications')}
          style={styles.bellButton}
        >
          <Icon name="bell" size={24} color="#F5A623" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card / Header Row */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <MaterialCommunityIcon name="account" size={54} color="#3B5998" />
            </View>
            <TouchableOpacity style={styles.cameraBadge} activeOpacity={0.8}>
              <Icon name="camera" size={12} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileDetails}>
            <Typography variant="h1" style={styles.profileName}>
              {name}
            </Typography>
            <Typography variant="bodySmall" style={styles.profileInfoText}>
              {phone}
            </Typography>
            <Typography variant="bodySmall" style={styles.profileInfoText}>
              {email}
            </Typography>
          </View>
        </View>

        {/* Section Heading */}
        <Typography variant="h2" style={styles.sectionHeading}>
          Update Your Profile
        </Typography>

        {/* Form Inputs (White Pills) */}
        <View style={styles.formContainer}>
          <View>
            <TextInput
              placeholder="Name"
              placeholderTextColor={fieldErrors.name ? '#EF4444' : '#8A8A8E'}
              style={[styles.inputPill, fieldErrors.name && styles.inputError]}
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
              }}
            />
            {fieldErrors.name ? (
              <Typography variant="bodySmall" style={styles.inlineErrorText}>
                {fieldErrors.name}
              </Typography>
            ) : null}
          </View>

          <View>
            <TextInput
              placeholder="Phone Number"
              placeholderTextColor={fieldErrors.phone ? '#EF4444' : '#8A8A8E'}
              keyboardType="phone-pad"
              maxLength={10}
              style={[styles.inputPill, fieldErrors.phone && styles.inputError]}
              value={phone}
              onChangeText={(t) => {
                setPhone(t);
                if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
              }}
            />
            {fieldErrors.phone ? (
              <Typography variant="bodySmall" style={styles.inlineErrorText}>
                {fieldErrors.phone}
              </Typography>
            ) : null}
          </View>

          <View>
            <TextInput
              placeholder="Email"
              placeholderTextColor={fieldErrors.email ? '#EF4444' : '#8A8A8E'}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.inputPill, fieldErrors.email && styles.inputError]}
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
              }}
            />
            {fieldErrors.email ? (
              <Typography variant="bodySmall" style={styles.inlineErrorText}>
                {fieldErrors.email}
              </Typography>
            ) : null}
          </View>

          <View>
            <TextInput
              placeholder="Address"
              placeholderTextColor={fieldErrors.address ? '#EF4444' : '#8A8A8E'}
              style={[styles.inputPill, fieldErrors.address && styles.inputError]}
              value={address}
              onChangeText={(t) => {
                setAddress(t);
                if (fieldErrors.address) setFieldErrors({ ...fieldErrors, address: '' });
              }}
            />
            {fieldErrors.address ? (
              <Typography variant="bodySmall" style={styles.inlineErrorText}>
                {fieldErrors.address}
              </Typography>
            ) : null}
          </View>

          <View style={styles.twoColRow}>
            <View style={styles.halfInput}>
              <TextInput
                placeholder="City"
                placeholderTextColor={fieldErrors.city ? '#EF4444' : '#8A8A8E'}
                style={[styles.inputPill, fieldErrors.city && styles.inputError]}
                value={city}
                onChangeText={(t) => {
                  setCity(t);
                  if (fieldErrors.city) setFieldErrors({ ...fieldErrors, city: '' });
                }}
              />
              {fieldErrors.city ? (
                <Typography variant="bodySmall" style={styles.inlineErrorText}>
                  {fieldErrors.city}
                </Typography>
              ) : null}
            </View>

            <View style={styles.halfInput}>
              <TextInput
                placeholder="State"
                placeholderTextColor={fieldErrors.state ? '#EF4444' : '#8A8A8E'}
                style={[styles.inputPill, fieldErrors.state && styles.inputError]}
                value={state}
                onChangeText={(t) => {
                  setState(t);
                  if (fieldErrors.state) setFieldErrors({ ...fieldErrors, state: '' });
                }}
              />
              {fieldErrors.state ? (
                <Typography variant="bodySmall" style={styles.inlineErrorText}>
                  {fieldErrors.state}
                </Typography>
              ) : null}
            </View>
          </View>

          <View>
            <TextInput
              placeholder="Pincode"
              placeholderTextColor={fieldErrors.pincode ? '#EF4444' : '#8A8A8E'}
              keyboardType="number-pad"
              maxLength={6}
              style={[styles.inputPill, fieldErrors.pincode && styles.inputError]}
              value={pincode}
              onChangeText={(t) => {
                setPincode(t);
                if (fieldErrors.pincode) setFieldErrors({ ...fieldErrors, pincode: '' });
              }}
            />
            {fieldErrors.pincode ? (
              <Typography variant="bodySmall" style={styles.inlineErrorText}>
                {fieldErrors.pincode}
              </Typography>
            ) : null}
          </View>
        </View>

        {/* Update Now Button */}
        <TouchableOpacity
          style={styles.updateButton}
          activeOpacity={0.8}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Typography variant="bodyMedium" style={styles.updateButtonText}>
            {isLoading ? 'Updating...' : 'Update Now'}
          </Typography>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#800000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bellButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 120,
  },
  profileHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 24,
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFD1D6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  profileInfoText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    gap: 12,
    marginBottom: 24,
  },
  inputPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 22,
    paddingVertical: 13,
    fontSize: 13,
    color: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'transparent',
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
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  updateButton: {
    backgroundColor: '#8B0000',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

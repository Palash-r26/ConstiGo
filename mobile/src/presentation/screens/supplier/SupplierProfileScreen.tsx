import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { SupplierTopHeader } from '../../components/SupplierTopHeader';
import Icon from 'react-native-vector-icons/Feather';
import { launchImageLibrary } from 'react-native-image-picker';
import { editProfileSchema } from '../../../application/utils/validators';

export const SupplierProfileScreen = ({ navigation }: any) => {
  const [name, setName] = useState('Vikas Pawar');
  const [phone, setPhone] = useState('9876543210');
  const [email, setEmail] = useState('vikas.pawar23@gmail.com');
  const [address, setAddress] = useState('584/96, Rajendra Park, Phase 2');
  const [city, setCity] = useState('Gurugram');
  const [state, setState] = useState('Haryana');
  const [pincode, setPincode] = useState('122002');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const handlePickAvatar = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (res) => {
      if (res.assets && res.assets.length > 0) {
        setAvatarUri(res.assets[0].uri || null);
      }
    });
  };

  const handleUpdate = () => {
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

    Alert.alert('Success', 'Profile updated successfully!');
  };

  return (
    <ScreenWrapper className="bg-[#F5F6FA]">
      <SupplierTopHeader
        onProfilePress={() => {}}
        onNotificationPress={() => {}}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Header Card */}
        <View style={styles.profileHeaderCard}>
          {/* Avatar with Pink Background & Camera Badge */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Icon name="user" size={44} color="#3B4252" />
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.cameraBadge}
              activeOpacity={0.8}
              onPress={handlePickAvatar}
            >
              <Icon name="camera" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* User Details */}
          <View style={styles.userInfoBlock}>
            <Typography variant="h2" style={styles.userName}>
              {name}
            </Typography>
            <Typography variant="bodySmall" style={styles.userPhone}>
              {phone}
            </Typography>
            <Typography variant="bodySmall" style={styles.userEmail}>
              {email}
            </Typography>
          </View>
        </View>

        {/* Section Heading */}
        <View style={styles.sectionHeadingContainer}>
          <Typography variant="h2" style={styles.sectionHeading}>
            Update Your Profile
          </Typography>
        </View>

        {/* Input Fields */}
        <View style={styles.inputGroup}>
          <View>
            <View style={[styles.pillInputContainer, fieldErrors.name && styles.inputError]}>
              <TextInput
                style={styles.textInput}
                placeholder="Full Name"
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
            <View style={[styles.pillInputContainer, fieldErrors.phone && styles.inputError]}>
              <TextInput
                style={styles.textInput}
                placeholder="Phone Number"
                placeholderTextColor={fieldErrors.phone ? '#EF4444' : '#9CA3AF'}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={(t) => {
                  setPhone(t);
                  if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
                }}
              />
            </View>
            {fieldErrors.phone ? (
              <Typography variant="bodySmall" style={styles.inlineErrorText}>
                {fieldErrors.phone}
              </Typography>
            ) : null}
          </View>

          <View>
            <View style={[styles.pillInputContainer, fieldErrors.email && styles.inputError]}>
              <TextInput
                style={styles.textInput}
                placeholder="Email ID"
                placeholderTextColor={fieldErrors.email ? '#EF4444' : '#9CA3AF'}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                }}
              />
            </View>
            {fieldErrors.email ? (
              <Typography variant="bodySmall" style={styles.inlineErrorText}>
                {fieldErrors.email}
              </Typography>
            ) : null}
          </View>

          <View>
            <View style={[styles.pillInputContainer, fieldErrors.address && styles.inputError]}>
              <TextInput
                style={styles.textInput}
                placeholder="Address"
                placeholderTextColor={fieldErrors.address ? '#EF4444' : '#9CA3AF'}
                value={address}
                onChangeText={(t) => {
                  setAddress(t);
                  if (fieldErrors.address) setFieldErrors({ ...fieldErrors, address: '' });
                }}
              />
            </View>
            {fieldErrors.address ? (
              <Typography variant="bodySmall" style={styles.inlineErrorText}>
                {fieldErrors.address}
              </Typography>
            ) : null}
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <View style={[styles.pillInputContainer, fieldErrors.city && styles.inputError]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="City"
                  placeholderTextColor={fieldErrors.city ? '#EF4444' : '#9CA3AF'}
                  value={city}
                  onChangeText={(t) => {
                    setCity(t);
                    if (fieldErrors.city) setFieldErrors({ ...fieldErrors, city: '' });
                  }}
                />
              </View>
              {fieldErrors.city ? (
                <Typography variant="bodySmall" style={styles.inlineErrorText}>
                  {fieldErrors.city}
                </Typography>
              ) : null}
            </View>

            <View style={styles.halfWidth}>
              <View style={[styles.pillInputContainer, fieldErrors.state && styles.inputError]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="State"
                  placeholderTextColor={fieldErrors.state ? '#EF4444' : '#9CA3AF'}
                  value={state}
                  onChangeText={(t) => {
                    setState(t);
                    if (fieldErrors.state) setFieldErrors({ ...fieldErrors, state: '' });
                  }}
                />
              </View>
              {fieldErrors.state ? (
                <Typography variant="bodySmall" style={styles.inlineErrorText}>
                  {fieldErrors.state}
                </Typography>
              ) : null}
            </View>
          </View>

          <View>
            <View style={[styles.pillInputContainer, fieldErrors.pincode && styles.inputError]}>
              <TextInput
                style={styles.textInput}
                placeholder="Pincode"
                placeholderTextColor={fieldErrors.pincode ? '#EF4444' : '#9CA3AF'}
                keyboardType="numeric"
                maxLength={6}
                value={pincode}
                onChangeText={(t) => {
                  setPincode(t);
                  if (fieldErrors.pincode) setFieldErrors({ ...fieldErrors, pincode: '' });
                }}
              />
            </View>
            {fieldErrors.pincode ? (
              <Typography variant="bodySmall" style={styles.inlineErrorText}>
                {fieldErrors.pincode}
              </Typography>
            ) : null}
          </View>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={styles.updateButton}
          activeOpacity={0.85}
          onPress={handleUpdate}
        >
          <Typography variant="bodyBold" style={styles.updateButtonText}>
            Update Now
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
  profileHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#FDC5C5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfoBlock: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    color: '#0F172A',
    fontFamily: 'BalooBhai2-Bold',
  },
  userPhone: {
    fontSize: 13,
    color: '#334155',
    fontFamily: 'Montserrat-Medium',
    marginTop: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Montserrat-Medium',
    marginTop: 1,
  },
  sectionHeadingContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 6,
  },
  sectionHeading: {
    fontSize: 18,
    color: '#0F172A',
    fontFamily: 'BalooBhai2-Bold',
  },
  inputGroup: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  pillInputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingVertical: 13,
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
  updateButton: {
    backgroundColor: '#8B0000',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
});

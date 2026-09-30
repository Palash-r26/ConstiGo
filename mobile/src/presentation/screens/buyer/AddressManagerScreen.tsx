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
import { addressManagerSchema } from '../../../application/utils/validators';

export const AddressManagerScreen = ({ navigation }: any) => {
  const { profile, fetchProfile } = useUserStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [flat, setFlat] = useState('');
  const [area, setArea] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const mockAddresses = [
    {
      _id: '1',
      name: 'Rashmi Singh',
      addressLine1: 'H.no 654/89 Rajan Garh, opp. post office, Mirzzapur',
      addressLine2: 'Uttar Pradesh 525412',
      location: 'Mirzzapur, Uttar Pradesh',
      country: 'India',
      phone: '+91 85025 55168',
      isDefault: true,
    },
    {
      _id: '2',
      name: 'Rashmi Singh',
      addressLine1: 'H.no 654/89 Rajan Garh, opp. post office, Mirzzapur',
      addressLine2: 'Uttar Pradesh 525412',
      location: 'Mirzzapur, Uttar Pradesh',
      country: 'India',
      phone: '+91 85025 55168',
      isDefault: false,
    },
  ];

  const handleSave = async () => {
    setFieldErrors({});

    const formData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.replace(/\D/g, '').slice(-10),
      flat: flat.trim(),
      area: area.trim(),
      pincode: pincode.trim(),
      city: city.trim(),
      state: state.trim(),
    };

    const validation = addressManagerSchema.safeParse(formData);
    if (!validation.success) {
      const formatted = validation.error.format();
      const errors: Record<string, string> = {};
      if (formatted.name?._errors[0]) errors.name = formatted.name._errors[0];
      if (formatted.email?._errors[0]) errors.email = formatted.email._errors[0];
      if (formatted.phone?._errors[0]) errors.phone = formatted.phone._errors[0];
      if (formatted.flat?._errors[0]) errors.flat = formatted.flat._errors[0];
      if (formatted.area?._errors[0]) errors.area = formatted.area._errors[0];
      if (formatted.pincode?._errors[0]) errors.pincode = formatted.pincode._errors[0];
      if (formatted.city?._errors[0]) errors.city = formatted.city._errors[0];
      if (formatted.state?._errors[0]) errors.state = formatted.state._errors[0];
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/users/me/address', {
        label: formData.name || 'Home',
        street: `${formData.flat}, ${formData.area}`,
        city: formData.city,
        state: formData.state,
        zipCode: formData.pincode,
        isDefault,
      });
      await fetchProfile();
      setIsAdding(false);
    } catch {
      setIsAdding(false);
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
        {/* Screen Title */}
        <Typography variant="h1" style={styles.pageTitle}>
          {isAdding ? 'Add Address' : 'Confirm Address'}
        </Typography>

        {isAdding ? (
          /* Page 10: Add Address Form */
          <View style={styles.formCard}>
            <View>
              <TextInput
                placeholder="Enter your Name"
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
                placeholder="Enter your Email"
                placeholderTextColor={fieldErrors.email ? '#EF4444' : '#8A8A8E'}
                style={[styles.inputPill, fieldErrors.email && styles.inputError]}
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {fieldErrors.email ? (
                <Typography variant="bodySmall" style={styles.inlineErrorText}>
                  {fieldErrors.email}
                </Typography>
              ) : null}
            </View>

            <View>
              <TextInput
                placeholder="Enter your Mobile Number"
                placeholderTextColor={fieldErrors.phone ? '#EF4444' : '#8A8A8E'}
                style={[styles.inputPill, fieldErrors.phone && styles.inputError]}
                value={phone}
                onChangeText={(t) => {
                  setPhone(t);
                  if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
                }}
                keyboardType="phone-pad"
                maxLength={10}
              />
              {fieldErrors.phone ? (
                <Typography variant="bodySmall" style={styles.inlineErrorText}>
                  {fieldErrors.phone}
                </Typography>
              ) : null}
            </View>

            <View>
              <TextInput
                placeholder="Enter your House, Building, Flat no."
                placeholderTextColor={fieldErrors.flat ? '#EF4444' : '#8A8A8E'}
                style={[styles.inputPill, fieldErrors.flat && styles.inputError]}
                value={flat}
                onChangeText={(t) => {
                  setFlat(t);
                  if (fieldErrors.flat) setFieldErrors({ ...fieldErrors, flat: '' });
                }}
              />
              {fieldErrors.flat ? (
                <Typography variant="bodySmall" style={styles.inlineErrorText}>
                  {fieldErrors.flat}
                </Typography>
              ) : null}
            </View>

            <View>
              <TextInput
                placeholder="Enter your Area, Street, Sector, Village"
                placeholderTextColor={fieldErrors.area ? '#EF4444' : '#8A8A8E'}
                style={[styles.inputPill, fieldErrors.area && styles.inputError]}
                value={area}
                onChangeText={(t) => {
                  setArea(t);
                  if (fieldErrors.area) setFieldErrors({ ...fieldErrors, area: '' });
                }}
              />
              {fieldErrors.area ? (
                <Typography variant="bodySmall" style={styles.inlineErrorText}>
                  {fieldErrors.area}
                </Typography>
              ) : null}
            </View>

            <View style={styles.twoColumnRow}>
              <View style={styles.halfInput}>
                <TextInput
                  placeholder="Pincode"
                  placeholderTextColor={fieldErrors.pincode ? '#EF4444' : '#8A8A8E'}
                  style={[styles.inputPill, fieldErrors.pincode && styles.inputError]}
                  value={pincode}
                  onChangeText={(t) => {
                    setPincode(t);
                    if (fieldErrors.pincode) setFieldErrors({ ...fieldErrors, pincode: '' });
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                {fieldErrors.pincode ? (
                  <Typography variant="bodySmall" style={styles.inlineErrorText}>
                    {fieldErrors.pincode}
                  </Typography>
                ) : null}
              </View>

              <View style={styles.halfInput}>
                <TextInput
                  placeholder="Town/City"
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
            </View>

            <View>
              <TextInput
                placeholder="Enter your State"
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

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsDefault(!isDefault)}
              style={styles.defaultCheckboxRow}
            >
              <MaterialCommunityIcon
                name={isDefault ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={22}
                color={isDefault ? '#48BB78' : '#8A8A8E'}
              />
              <Typography variant="bodyMedium" style={styles.defaultCheckboxText}>
                Make this my default address
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryActionButton}
              activeOpacity={0.8}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Typography variant="bodyMedium" style={styles.primaryActionText}>
                {isLoading ? 'Saving...' : 'Update Now'}
              </Typography>
            </TouchableOpacity>
          </View>
        ) : (
          /* Page 11: Confirm Address List */
          <View style={styles.addressListContainer}>
            {mockAddresses.map((addr) => (
              <View key={addr._id} style={styles.addressCard}>
                <Typography variant="h2" style={styles.addressCardName}>
                  {addr.name}
                </Typography>
                <Typography variant="bodySmall" style={styles.addressCardLine}>
                  {addr.addressLine1}
                </Typography>
                <Typography variant="bodySmall" style={styles.addressCardLine}>
                  {addr.addressLine2}
                </Typography>
                <Typography variant="bodySmall" style={styles.addressCardLine}>
                  {addr.location}
                </Typography>
                <Typography variant="bodySmall" style={styles.addressCardLine}>
                  {addr.country}
                </Typography>
                <Typography variant="bodySmall" style={styles.addressCardPhone}>
                  Phone number : {addr.phone}
                </Typography>

                <View style={styles.addressCardBottomRow}>
                  <View style={styles.addressActionButtons}>
                    <TouchableOpacity
                      style={styles.editButton}
                      activeOpacity={0.7}
                      onPress={() => setIsAdding(true)}
                    >
                      <Typography variant="bodySmall" style={styles.editButtonText}>
                        Edit
                      </Typography>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.removeButton}
                      activeOpacity={0.7}
                      onPress={() => {}}
                    >
                      <Typography variant="bodySmall" style={styles.removeButtonText}>
                        Remove
                      </Typography>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {}}
                    style={styles.setDefaultButton}
                  >
                    <Typography variant="bodySmall" style={styles.setDefaultText}>
                      Set as Default Address
                    </Typography>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addNewButton}
              activeOpacity={0.8}
              onPress={() => setIsAdding(true)}
            >
              <Icon name="plus" size={18} color="#8B0000" />
              <Typography variant="bodyMedium" style={styles.addNewButtonText}>
                Add New Address
              </Typography>
            </TouchableOpacity>
          </View>
        )}
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
    paddingTop: 8,
    paddingBottom: 120,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginVertical: 18,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputPill: {
    backgroundColor: '#F0F2F5',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 13,
    fontSize: 13,
    color: '#111827',
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
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  defaultCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
    paddingHorizontal: 4,
  },
  defaultCheckboxText: {
    fontSize: 13,
    color: '#8B0000',
    fontWeight: '500',
  },
  primaryActionButton: {
    backgroundColor: '#8B0000',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  addressListContainer: {
    gap: 16,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  addressCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  addressCardLine: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
  addressCardPhone: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    marginTop: 6,
    marginBottom: 12,
  },
  addressCardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  addressActionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#F0F2F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  editButtonText: {
    color: '#8A8A8E',
    fontSize: 11,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#8B0000',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  setDefaultButton: {
    paddingVertical: 4,
  },
  setDefaultText: {
    color: '#8B0000',
    fontSize: 11,
    fontWeight: '600',
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#8B0000',
    gap: 8,
    marginTop: 8,
  },
  addNewButtonText: {
    color: '#8B0000',
    fontSize: 14,
    fontWeight: '700',
  },
});

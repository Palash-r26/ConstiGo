import React from 'react';
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

export const AddressManagerScreen = ({ navigation }: any) => {
  const { profile, fetchProfile } = useUserStore();
  const [isAdding, setIsAdding] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Form State
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [flat, setFlat] = React.useState('');
  const [area, setArea] = React.useState('');
  const [pincode, setPincode] = React.useState('');
  const [city, setCity] = React.useState('');
  const [state, setState] = React.useState('');
  const [isDefault, setIsDefault] = React.useState(true);

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
    if (!flat || !city || !state || !pincode) {
      Alert.alert('Required', 'Please fill in all address details.');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/users/me/address', {
        label: name || 'Home',
        street: `${flat}, ${area}`,
        city,
        state,
        zipCode: pincode,
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
            <TextInput
              placeholder="Enter your Name"
              placeholderTextColor="#8A8A8E"
              style={styles.inputPill}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              placeholder="Enter your Email"
              placeholderTextColor="#8A8A8E"
              style={styles.inputPill}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <TextInput
              placeholder="Enter your Mobile Number"
              placeholderTextColor="#8A8A8E"
              style={styles.inputPill}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <TextInput
              placeholder="Enter your House, Building, Flat no."
              placeholderTextColor="#8A8A8E"
              style={styles.inputPill}
              value={flat}
              onChangeText={setFlat}
            />

            <TextInput
              placeholder="Enter your Area, Street, Sector, Villlage"
              placeholderTextColor="#8A8A8E"
              style={styles.inputPill}
              value={area}
              onChangeText={setArea}
            />

            <View style={styles.twoColumnRow}>
              <TextInput
                placeholder="Pincode"
                placeholderTextColor="#8A8A8E"
                style={[styles.inputPill, styles.halfInput]}
                value={pincode}
                onChangeText={setPincode}
                keyboardType="number-pad"
              />
              <TextInput
                placeholder="Town/City"
                placeholderTextColor="#8A8A8E"
                style={[styles.inputPill, styles.halfInput]}
                value={city}
                onChangeText={setCity}
              />
            </View>

            <TextInput
              placeholder="Enter your State"
              placeholderTextColor="#8A8A8E"
              style={styles.inputPill}
              value={state}
              onChangeText={setState}
            />

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
                Make this my defalut address
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

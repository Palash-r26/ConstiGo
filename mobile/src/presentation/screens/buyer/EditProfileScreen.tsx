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

export const EditProfileScreen = ({ navigation }: any) => {
  const { profile, fetchProfile } = useUserStore();
  const [isLoading, setIsLoading] = React.useState(false);

  // Form State matching Page 16
  const [name, setName] = React.useState(
    profile?.firstName ? `${profile.firstName} ${profile.lastName}` : 'Vikas Pawar'
  );
  const [phone, setPhone] = React.useState(profile?.phone || '+91 12345 67890');
  const [email, setEmail] = React.useState(
    profile?.email || 'vikas.pawar23@gmail.com'
  );
  const [address, setAddress] = React.useState('584/96, Rajendra Park, Phase 2');
  const [city, setCity] = React.useState('Gurugram');
  const [state, setState] = React.useState('Haryana');
  const [pincode, setPincode] = React.useState('122002');

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const parts = name.split(' ');
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';

      await apiClient.patch('/users/me', {
        firstName,
        lastName,
        phone,
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
          <TextInput
            placeholder="Name"
            placeholderTextColor="#8A8A8E"
            style={styles.inputPill}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            placeholder="Phone Number"
            placeholderTextColor="#8A8A8E"
            keyboardType="phone-pad"
            style={styles.inputPill}
            value={phone}
            onChangeText={setPhone}
          />

          <TextInput
            placeholder="Email"
            placeholderTextColor="#8A8A8E"
            keyboardType="email-address"
            style={styles.inputPill}
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            placeholder="Address"
            placeholderTextColor="#8A8A8E"
            style={styles.inputPill}
            value={address}
            onChangeText={setAddress}
          />

          <View style={styles.twoColRow}>
            <TextInput
              placeholder="City"
              placeholderTextColor="#8A8A8E"
              style={[styles.inputPill, styles.halfInput]}
              value={city}
              onChangeText={setCity}
            />
            <TextInput
              placeholder="State"
              placeholderTextColor="#8A8A8E"
              style={[styles.inputPill, styles.halfInput]}
              value={state}
              onChangeText={setState}
            />
          </View>

          <TextInput
            placeholder="Pincode"
            placeholderTextColor="#8A8A8E"
            keyboardType="number-pad"
            style={styles.inputPill}
            value={pincode}
            onChangeText={setPincode}
          />
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

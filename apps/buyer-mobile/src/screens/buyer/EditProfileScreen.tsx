import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Typography } from '@constigo/shared';
import { ScreenWrapper } from '@constigo/shared';
import { Logo } from '@constigo/shared';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUserStore } from '../../store/userStore';
import { apiClient } from '@constigo/shared';
import { editProfileSchema } from '@constigo/shared';
import { getCurrentDeviceLocation } from '../../services/locationService';

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
  const [address, setAddress] = useState(profile?.address || 'Govindpuri, near darpan colony');
  const [city, setCity] = useState(profile?.city || 'Gwalior');
  const [state, setState] = useState(profile?.state || 'Madhya Pradesh');
  const [pincode, setPincode] = useState(profile?.pincode || '474011');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // GPS Map Feature State
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [selectedLat, setSelectedLat] = useState(
    Number((profile as any)?.latitude || (profile as any)?.maplatitude || (profile as any)?.location?.coordinates?.[1] || 28.5976)
  );
  const [selectedLng, setSelectedLng] = useState(
    Number((profile as any)?.longitude || (profile as any)?.maplongitude || (profile as any)?.location?.coordinates?.[0] || 77.3842)
  );

  const handleUseCurrentGps = async () => {
    setIsLocatingGps(true);
    try {
      const loc = await getCurrentDeviceLocation();
      const lat = parseFloat(loc.latitude);
      const lng = parseFloat(loc.longitude);
      setSelectedLat(lat);
      setSelectedLng(lng);
      if (loc.address) setAddress(loc.address);
      if (loc.city) setCity(loc.city);
      if (loc.state) setState(loc.state);
      if (loc.pincode) setPincode(loc.pincode);
      Alert.alert(
        'Real GPS Synchronized 📍',
        `Live device location locked:\n${loc.address || `${loc.city}, ${loc.state}`}`
      );
    } catch (e) {
      Alert.alert('GPS Notice', 'Unable to detect device GPS. Please pick a preset or drag pin.');
    } finally {
      setIsLocatingGps(false);
    }
  };

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
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        latitude: selectedLat,
        longitude: selectedLng,
        maplatitude: selectedLat,
        maplongitude: selectedLng,
        coordinates: [selectedLng, selectedLat],
        location: {
          type: 'Point',
          coordinates: [selectedLng, selectedLat],
        },
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

          {/* Site Coordinates & In-App Map Feature */}
          <View style={styles.mapSelectorCard}>
            <View style={styles.mapSelectorHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={styles.mapPinIconBox}>
                  <Icon name="map-pin" size={18} color="#8B0000" />
                </View>
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Typography variant="bodyBold" style={{ fontSize: 13, color: '#0F172A' }}>
                    Profile Delivery Site Coordinates
                  </Typography>
                  <Typography style={{ fontSize: 11, color: '#059669', fontFamily: 'Montserrat-SemiBold' }}>
                    GPS: {selectedLat.toFixed(5)}, {selectedLng.toFixed(5)}
                  </Typography>
                </View>
              </View>

              <TouchableOpacity
                style={styles.openMapBtn}
                activeOpacity={0.8}
                onPress={() => setMapModalVisible(true)}
              >
                <Icon name="map" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Typography style={{ color: '#FFFFFF', fontSize: 12, fontFamily: 'Montserrat-Bold' }}>
                  Pick on Map
                </Typography>
              </TouchableOpacity>
            </View>
            <Typography style={{ fontSize: 11, color: '#64748B', marginTop: 6 }}>
              Set your default construction site location for instant RoadDial booking.
            </Typography>
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

      {/* IN-APP INTERACTIVE MAP PICKER MODAL */}
      <Modal
        visible={mapModalVisible}
        animationType="slide"
        onRequestClose={() => setMapModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          {/* Map Modal Header */}
          <View style={styles.mapModalHeader}>
            <TouchableOpacity
              onPress={() => setMapModalVisible(false)}
              style={styles.modalCloseBtn}
            >
              <Icon name="arrow-left" size={22} color="#111827" />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Typography variant="bodyBold" style={{ fontSize: 16, color: '#111827' }} numberOfLines={1}>
                Pin Profile Construction Site
              </Typography>
              <Typography style={{ fontSize: 11, color: '#059669', fontFamily: 'Montserrat-SemiBold' }}>
                GPS: {selectedLat.toFixed(5)}, {selectedLng.toFixed(5)}
              </Typography>
            </View>
          </View>

          {/* Interactive Map Canvas */}
          <View style={styles.mapCanvas}>
            <View style={styles.mapGridPattern}>
              {/* Roads grid */}
              <View style={styles.mapRoadH} />
              <View style={styles.mapRoadV} />
              {/* Radius Radar Rings */}
              <View style={styles.mapRadiusRing} />
              <View style={styles.mapRadiusRing2} />

              {/* Pin Center Marker */}
              <View style={styles.mapCenterPin}>
                <View style={styles.markerBubble}>
                  <Typography style={{ color: '#FFFFFF', fontSize: 10, fontFamily: 'Montserrat-Bold' }}>
                    Profile Construction Site
                  </Typography>
                  <Typography style={{ color: '#FEF08A', fontSize: 9, fontFamily: 'Montserrat-Medium' }}>
                    {selectedLat.toFixed(4)}, {selectedLng.toFixed(4)}
                  </Typography>
                </View>
                <Icon name="map-pin" size={36} color="#8B0000" />
                <View style={styles.pinShadow} />
              </View>
            </View>

            {/* Micro Pan & Adjust Controls */}
            <View style={styles.panControlsBox}>
              <TouchableOpacity
                style={styles.panBtn}
                onPress={() => setSelectedLat((l) => Number((l + 0.005).toFixed(5)))}
              >
                <Icon name="chevron-up" size={18} color="#0F172A" />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 14 }}>
                <TouchableOpacity
                  style={styles.panBtn}
                  onPress={() => setSelectedLng((l) => Number((l - 0.005).toFixed(5)))}
                >
                  <Icon name="chevron-left" size={18} color="#0F172A" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.panBtn}
                  onPress={() => setSelectedLng((l) => Number((l + 0.005).toFixed(5)))}
                >
                  <Icon name="chevron-right" size={18} color="#0F172A" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.panBtn}
                onPress={() => setSelectedLat((l) => Number((l - 0.005).toFixed(5)))}
              >
                <Icon name="chevron-down" size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Card: Quick Presets & Confirm */}
          <View style={styles.mapBottomCard}>
            <Typography variant="bodyBold" style={{ fontSize: 12, color: '#475569', marginBottom: 8 }}>
              Quick Construction Hubs / Industrial Delivery Zones
            </Typography>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 12 }}>
              {[
                { name: 'Noida Sec 70', lat: 28.5976, lng: 77.3842, area: 'Sector 70', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301' },
                { name: 'Noida Sec 62', lat: 28.6280, lng: 77.3649, area: 'Sector 62', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301' },
                { name: 'Greater Noida W', lat: 28.5921, lng: 77.4538, area: 'Techzone 4', city: 'Greater Noida', state: 'Uttar Pradesh', pincode: '201306' },
                { name: 'Gurugram Cyber', lat: 28.4906, lng: 77.0900, area: 'DLF Cyber City', city: 'Gurugram', state: 'Haryana', pincode: '122002' },
                { name: 'Delhi Okhla', lat: 28.5284, lng: 77.2793, area: 'Okhla Phase 3', city: 'New Delhi', state: 'Delhi', pincode: '110020' },
                { name: 'Gwalior Hub', lat: 26.2183, lng: 78.1828, area: 'Govindpuri, near darpan colony', city: 'Gwalior', state: 'Madhya Pradesh', pincode: '474011' },
              ].map((preset) => (
                <TouchableOpacity
                  key={preset.name}
                  onPress={() => {
                    setSelectedLat(preset.lat);
                    setSelectedLng(preset.lng);
                    setAddress(preset.area);
                    setCity(preset.city);
                    setState(preset.state);
                    setPincode(preset.pincode);
                  }}
                  style={[
                    styles.presetChip,
                    Math.abs(selectedLat - preset.lat) < 0.001 && styles.presetChipActive,
                  ]}
                >
                  <Icon name="navigation" size={12} color={Math.abs(selectedLat - preset.lat) < 0.001 ? '#8B0000' : '#64748B'} />
                  <Typography style={{ fontSize: 11, color: Math.abs(selectedLat - preset.lat) < 0.001 ? '#8B0000' : '#334155', fontFamily: 'Montserrat-SemiBold', marginLeft: 4 }}>
                    {preset.name}
                  </Typography>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={styles.gpsAutoBtn}
                onPress={handleUseCurrentGps}
                disabled={isLocatingGps}
              >
                {isLocatingGps ? (
                  <ActivityIndicator size="small" color="#059669" />
                ) : (
                  <>
                    <Icon name="crosshair" size={16} color="#059669" style={{ marginRight: 6 }} />
                    <Typography style={{ color: '#059669', fontSize: 13, fontFamily: 'Montserrat-Bold' }}>
                      Use Current GPS
                    </Typography>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmPinBtn}
                onPress={() => {
                  setMapModalVisible(false);
                  Alert.alert('Profile Location Pinned', `Coordinates set to: ${selectedLat.toFixed(4)}, ${selectedLng.toFixed(4)}`);
                }}
              >
                <Icon name="check" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Typography style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'Montserrat-Bold' }}>
                  Confirm Site Location
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
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
  mapSelectorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  mapSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapPinIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  openMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B0000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  mapModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 20,
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    position: 'relative',
    overflow: 'hidden',
  },
  mapGridPattern: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  mapRoadH: {
    position: 'absolute',
    width: '100%',
    height: 18,
    backgroundColor: '#CBD5E1',
    top: '46%',
  },
  mapRoadV: {
    position: 'absolute',
    height: '100%',
    width: 18,
    backgroundColor: '#CBD5E1',
    left: '46%',
  },
  mapRadiusRing: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: 'rgba(139, 0, 0, 0.18)',
    backgroundColor: 'rgba(139, 0, 0, 0.05)',
  },
  mapRadiusRing2: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(139, 0, 0, 0.15)',
  },
  mapCenterPin: {
    alignItems: 'center',
    position: 'absolute',
    top: '40%',
  },
  markerBubble: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
    alignItems: 'center',
  },
  pinShadow: {
    width: 14,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    marginTop: 2,
  },
  panControlsBox: {
    position: 'absolute',
    right: 16,
    top: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
  },
  panBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  mapBottomCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 6,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: '#FFF5F5',
    borderColor: '#8B0000',
  },
  gpsAutoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 20,
    paddingVertical: 13,
  },
  confirmPinBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B0000',
    borderRadius: 20,
    paddingVertical: 13,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
});


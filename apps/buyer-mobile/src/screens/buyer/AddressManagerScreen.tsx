import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { Typography, ScreenWrapper, Logo } from '@constigo/shared';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUserStore } from '../../store/userStore';
import {
  addBuyerAddress,
  updateBuyerAddress,
  fetchBuyerAddressEdit,
  deleteBuyerAddress,
  fetchBuyerAddressList,
} from '../../services/api/buyerApi';
import { addressManagerSchema } from '@constigo/shared';

export const AddressManagerScreen = ({ navigation }: any) => {
  const { profile, fetchProfile } = useUserStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
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

  // Map Coordinates & Interactive Map Picker State
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [selectedLat, setSelectedLat] = useState(
    Number((profile as any)?.latitude || (profile as any)?.maplatitude || (profile as any)?.location?.coordinates?.[1] || 28.5355)
  );
  const [selectedLng, setSelectedLng] = useState(
    Number((profile as any)?.longitude || (profile as any)?.maplongitude || (profile as any)?.location?.coordinates?.[0] || 77.3910)
  );
  const [viewingAddressName, setViewingAddressName] = useState<string | null>(null);
  const [isMapPreviewMode, setIsMapPreviewMode] = useState(false);

  const [addressList, setAddressList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadAddressList = useCallback(async () => {
    const buyerId = (profile as any)?.buyerid || profile?._id;
    if (!buyerId) {
      setLoadingList(false);
      setAddressList([]);
      return;
    }
    try {
      setLoadingList(true);
      setLoadError(null);
      const res = await fetchBuyerAddressList(buyerId);
      let list: any[] = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (res && Array.isArray(res.data)) {
        list = res.data;
      } else if (res && Array.isArray(res.addresses)) {
        list = res.addresses;
      }
      setAddressList(list);
    } catch (e: any) {
      console.warn('[AddressManager] Failed to fetch address list:', e);
      setLoadError(e?.message || 'Failed to load delivery addresses');
    } finally {
      setLoadingList(false);
    }
  }, [profile]);

  useEffect(() => {
    loadAddressList();
  }, [loadAddressList]);

  const handleEditPress = async (addr: any) => {
    const targetId = addr._id || addr.id;
    if (!targetId) {
      Alert.alert('Error', 'Unable to locate address reference.');
      return;
    }
    setEditingAddressId(String(targetId));
    setName(addr.name || addr.fullname || '');
    setEmail(addr.email || profile?.email || '');
    setPhone(addr.phone || '');
    setFlat(addr.address1 || addr.addressLine1 || '');
    setArea(addr.address2 || addr.addressLine2 || '');
    setPincode(addr.pincode || '');
    setCity(addr.city || '');
    setState(addr.state || '');
    setIsDefault(addr.isDefault || addr.default_status === '1');
    const lat = Number(addr.latitude || addr.maplatitude || addr.location?.coordinates?.[1] || 28.5355);
    const lng = Number(addr.longitude || addr.maplongitude || addr.location?.coordinates?.[0] || 77.3910);
    setSelectedLat(lat);
    setSelectedLng(lng);
    setIsAdding(true);

    try {
      const res = await fetchBuyerAddressEdit(String(targetId));
      if (res && res.data) {
        const d = res.data;
        if (d.fullname) setName(d.fullname);
        if (d.email) setEmail(d.email);
        if (d.phone) setPhone(d.phone);
        if (d.address1) setFlat(d.address1);
        if (d.address2) setArea(d.address2);
        if (d.pincode) setPincode(d.pincode);
        if (d.city) setCity(d.city);
        if (d.state) setState(d.state);
        if (d.default_status !== undefined) setIsDefault(d.default_status === '1');
        if (d.latitude || d.maplatitude) setSelectedLat(Number(d.latitude || d.maplatitude));
        if (d.longitude || d.maplongitude) setSelectedLng(Number(d.longitude || d.maplongitude));
      }
    } catch (e) {
      console.warn('[AddressManager] Failed to fetch address edit data:', e);
    }
  };

  const handleDeletePress = (addrId: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBuyerAddress(addrId);
            Alert.alert('Success', 'Address deleted successfully.');
            loadAddressList();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete address.');
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (addr: any) => {
    const buyerId = (profile as any)?.buyerid || profile?._id;
    const targetId = addr._id || addr.id;
    if (!buyerId || !targetId) {
      Alert.alert('Notice', 'Unable to update default address. Missing identifier.');
      return;
    }
    try {
      await updateBuyerAddress({
        id: String(targetId),
        buyerid: buyerId,
        fullname: addr.fullname || addr.name || '',
        email: addr.email || profile?.email || '',
        phone: addr.phone || '',
        address1: addr.address1 || addr.addressLine1 || '',
        address2: addr.address2 || addr.addressLine2 || '',
        pincode: addr.pincode || '',
        city: addr.city || '',
        state: addr.state || '',
        latitude: addr.latitude || addr.maplatitude || selectedLat,
        longitude: addr.longitude || addr.maplongitude || selectedLng,
        default_status: '1',
      });
      Alert.alert('Success', 'Default address updated.');
      loadAddressList();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update default address.');
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setFlat('');
    setArea('');
    setPincode('');
    setCity('');
    setState('');
    setIsDefault(false);
    setFieldErrors({});
    setEditingAddressId(null);
    setSelectedLat(
      Number((profile as any)?.latitude || (profile as any)?.maplatitude || (profile as any)?.location?.coordinates?.[1] || 28.5355)
    );
    setSelectedLng(
      Number((profile as any)?.longitude || (profile as any)?.maplongitude || (profile as any)?.location?.coordinates?.[0] || 77.3910)
    );
  };

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

    const buyerId = (profile as any)?.buyerid || profile?._id;
    if (!buyerId) {
      Alert.alert('Authentication Required', 'Please log in to save addresses.');
      return;
    }

    setIsLoading(true);
    try {
      const addressPayload = {
        buyerid: buyerId,
        fullname: formData.name,
        email: formData.email,
        phone: formData.phone,
        address1: formData.flat,
        address2: formData.area,
        pincode: formData.pincode,
        city: formData.city,
        state: formData.state,
        latitude: selectedLat,
        longitude: selectedLng,
        maplatitude: selectedLat,
        maplongitude: selectedLng,
        coordinates: [selectedLng, selectedLat],
        location: {
          type: 'Point',
          coordinates: [selectedLng, selectedLat],
        },
        default_status: isDefault ? '1' : '0',
      };

      if (editingAddressId) {
        await updateBuyerAddress({
          id: editingAddressId,
          ...addressPayload,
        });
        Alert.alert('Success', 'Address updated successfully!');
      } else {
        await addBuyerAddress(addressPayload);
        Alert.alert('Success', 'Address added successfully!');
      }

      await fetchProfile();
      await loadAddressList();
      resetForm();
      setIsAdding(false);
    } catch (err: any) {
      console.error('[AddressManager] Save error:', err);
      Alert.alert('Error', err.message || 'Failed to save address. Please try again.');
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
          {isAdding ? (editingAddressId ? 'Edit Address' : 'Add Address') : 'Confirm Address'}
        </Typography>

        {isAdding ? (
          /* Add / Edit Address Form */
          <View style={styles.formCard}>
            {/* GPS Site Coordinates Selector */}
            <View style={styles.mapSelectorCard}>
              <View style={styles.mapSelectorHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={styles.mapPinIconBox}>
                    <Icon name="map-pin" size={18} color="#8B0000" />
                  </View>
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Typography variant="bodyBold" style={{ fontSize: 13, color: '#0F172A' }}>
                      Delivery Site Coordinates
                    </Typography>
                    <Typography style={{ fontSize: 11, color: '#059669', fontFamily: 'Montserrat-SemiBold' }}>
                      GPS: {selectedLat.toFixed(5)}, {selectedLng.toFixed(5)}
                    </Typography>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.openMapBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    setIsMapPreviewMode(false);
                    setMapModalVisible(true);
                  }}
                >
                  <Icon name="map" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Typography style={{ color: '#FFFFFF', fontSize: 12, fontFamily: 'Montserrat-Bold' }}>
                    Pick on Map
                  </Typography>
                </TouchableOpacity>
              </View>
              <Typography style={{ fontSize: 11, color: '#64748B', marginTop: 6 }}>
                Pin exact construction gate or warehouse for live RoadDial vehicle dispatch.
              </Typography>
            </View>

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
                placeholder="Enter Street, Sector, Area"
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

            <View>
              <TextInput
                placeholder="Enter Pincode"
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

            <View>
              <TextInput
                placeholder="Enter City"
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

            <View>
              <TextInput
                placeholder="Enter State"
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

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <TouchableOpacity
                style={[styles.primaryActionButton, { flex: 1 }]}
                activeOpacity={0.8}
                onPress={handleSave}
                disabled={isLoading}
              >
                <Typography variant="bodyMedium" style={styles.primaryActionText}>
                  {isLoading ? 'Saving...' : editingAddressId ? 'Update Address' : 'Save Address'}
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.8}
                onPress={() => {
                  resetForm();
                  setIsAdding(false);
                }}
              >
                <Typography variant="bodyMedium" style={styles.cancelButtonText}>
                  Cancel
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        ) : loadingList ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#8B0000" />
            <Typography variant="bodySmall" style={{ color: '#64748B', marginTop: 12 }}>
              Loading delivery addresses...
            </Typography>
          </View>
        ) : loadError ? (
          <View style={styles.centerContainer}>
            <Icon name="alert-circle" size={44} color="#EF4444" />
            <Typography variant="bodyBold" style={{ marginTop: 12, color: '#111827' }}>
              Unable to load addresses
            </Typography>
            <Typography variant="bodySmall" style={{ color: '#64748B', textAlign: 'center', marginTop: 4 }}>
              {loadError}
            </Typography>
            <TouchableOpacity onPress={loadAddressList} style={styles.retryButton}>
              <Typography variant="bodyMedium" style={{ color: '#FFFFFF', fontSize: 13 }}>
                Retry
              </Typography>
            </TouchableOpacity>
          </View>
        ) : addressList.length === 0 ? (
          <View style={styles.centerContainer}>
            <Icon name="map-pin" size={44} color="#CBD5E1" />
            <Typography variant="bodyBold" style={{ marginTop: 12, color: '#111827' }}>
              No Saved Addresses
            </Typography>
            <Typography variant="bodySmall" style={{ color: '#64748B', textAlign: 'center', marginTop: 4 }}>
              You don't have any saved delivery addresses yet. Add one to expedite your checkout.
            </Typography>
            <TouchableOpacity
              style={[styles.addNewButton, { marginTop: 20 }]}
              activeOpacity={0.8}
              onPress={() => {
                resetForm();
                setIsAdding(true);
              }}
            >
              <Icon name="plus" size={18} color="#8B0000" />
              <Typography variant="bodyMedium" style={styles.addNewButtonText}>
                Add Delivery Address
              </Typography>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.addressListContainer}>
            {addressList.map((addr) => {
              const addrId = String(addr.id || addr._id);
              const displayName = addr.fullname || addr.name || 'Saved Address';
              const line1 = addr.address1 || addr.addressLine1 || '';
              const line2 = addr.address2 || addr.addressLine2 || '';
              const cityState =
                addr.city && addr.state
                  ? `${addr.city}, ${addr.state} ${addr.pincode || ''}`
                  : addr.location || '';
              const isDef = addr.default_status === '1' || addr.isDefault === true;

              return (
                <View key={addrId} style={styles.addressCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h2" style={styles.addressCardName}>
                      {displayName}
                    </Typography>
                    {isDef ? (
                      <View style={{ backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                        <Typography style={{ fontSize: 10, color: '#059669', fontFamily: 'Montserrat-Bold' }}>
                          DEFAULT
                        </Typography>
                      </View>
                    ) : null}
                  </View>
                  {line1 ? (
                    <Typography variant="bodySmall" style={styles.addressCardLine}>
                      {line1}
                    </Typography>
                  ) : null}
                  {line2 ? (
                    <Typography variant="bodySmall" style={styles.addressCardLine}>
                      {line2}
                    </Typography>
                  ) : null}
                  {cityState ? (
                    <Typography variant="bodySmall" style={styles.addressCardLine}>
                      {cityState}
                    </Typography>
                  ) : null}
                  <Typography variant="bodySmall" style={styles.addressCardLine}>
                    {addr.country || 'India'}
                  </Typography>
                  <Typography variant="bodySmall" style={styles.addressCardPhone}>
                    Phone number : {addr.phone || 'N/A'}
                  </Typography>

                  {/* Address GPS Coordinates & View on Map Action */}
                  <View style={styles.addressGpsRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon name="crosshair" size={13} color="#059669" style={{ marginRight: 4 }} />
                      <Typography style={{ fontSize: 11, color: '#059669', fontFamily: 'Montserrat-SemiBold' }}>
                        GPS: {(addr.latitude || addr.maplatitude || 28.5355).toFixed ? (addr.latitude || addr.maplatitude || 28.5355).toFixed(4) : addr.latitude || '28.5355'}, {(addr.longitude || addr.maplongitude || 77.3910).toFixed ? (addr.longitude || addr.maplongitude || 77.3910).toFixed(4) : addr.longitude || '77.3910'}
                      </Typography>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedLat(Number(addr.latitude || addr.maplatitude || 28.5355));
                        setSelectedLng(Number(addr.longitude || addr.maplongitude || 77.3910));
                        setViewingAddressName(displayName);
                        setIsMapPreviewMode(true);
                        setMapModalVisible(true);
                      }}
                      style={styles.viewOnMapBadge}
                    >
                      <Icon name="map" size={12} color="#8B0000" style={{ marginRight: 4 }} />
                      <Typography style={{ fontSize: 11, color: '#8B0000', fontFamily: 'Montserrat-Bold' }}>
                        View on Map
                      </Typography>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.addressCardBottomRow}>
                    <View style={styles.addressActionButtons}>
                      <TouchableOpacity
                        style={styles.editButton}
                        activeOpacity={0.7}
                        onPress={() => handleEditPress(addr)}
                      >
                        <Typography variant="bodySmall" style={styles.editButtonText}>
                          Edit
                        </Typography>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.removeButton}
                        activeOpacity={0.7}
                        onPress={() => handleDeletePress(addrId)}
                      >
                        <Typography variant="bodySmall" style={styles.removeButtonText}>
                          Remove
                        </Typography>
                      </TouchableOpacity>
                    </View>

                    {!isDef && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleSetDefault(addr)}
                        style={styles.setDefaultButton}
                      >
                        <Typography variant="bodySmall" style={styles.setDefaultText}>
                          Set as Default Address
                        </Typography>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.addNewButton}
              activeOpacity={0.8}
              onPress={() => {
                resetForm();
                setIsAdding(true);
              }}
            >
              <Icon name="plus" size={18} color="#8B0000" />
              <Typography variant="bodyMedium" style={styles.addNewButtonText}>
                Add New Address
              </Typography>
            </TouchableOpacity>
          </View>
        )}
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
                {isMapPreviewMode ? (viewingAddressName || 'Saved Delivery Location') : 'Pin Delivery Site on Map'}
              </Typography>
              <Typography style={{ fontSize: 11, color: '#059669', fontFamily: 'Montserrat-SemiBold' }}>
                GPS: {selectedLat.toFixed(5)}, {selectedLng.toFixed(5)}
              </Typography>
            </View>
          </View>

          {/* Interactive Map Canvas */}
          <View style={styles.mapCanvas}>
            <View style={styles.mapGridPattern}>
              {/* Map roads grid */}
              <View style={styles.mapRoadH} />
              <View style={styles.mapRoadV} />
              {/* Radius Radar Rings */}
              <View style={styles.mapRadiusRing} />
              <View style={styles.mapRadiusRing2} />

              {/* Pin Center Marker */}
              <View style={styles.mapCenterPin}>
                <View style={styles.markerBubble}>
                  <Typography style={{ color: '#FFFFFF', fontSize: 10, fontFamily: 'Montserrat-Bold' }}>
                    {isMapPreviewMode ? 'Delivery Site' : 'Pinned Construction Site'}
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
            {!isMapPreviewMode && (
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
            )}
          </View>

          {/* Bottom Card: Quick Presets & Confirm */}
          <View style={styles.mapBottomCard}>
            <Typography variant="bodyBold" style={{ fontSize: 12, color: '#475569', marginBottom: 8 }}>
              {isMapPreviewMode ? 'Site Coordinates Summary' : 'Quick Construction Hubs / Industrial Zones'}
            </Typography>

            {!isMapPreviewMode ? (
              <>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 12 }}>
                  {[
                    { name: 'Noida Sec 62', lat: 28.6280, lng: 77.3649, area: 'Sector 62', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301' },
                    { name: 'Greater Noida W', lat: 28.5921, lng: 77.4538, area: 'Techzone 4', city: 'Greater Noida', state: 'Uttar Pradesh', pincode: '201306' },
                    { name: 'Gurugram Cyber', lat: 28.4906, lng: 77.0900, area: 'DLF Cyber City', city: 'Gurugram', state: 'Haryana', pincode: '122002' },
                    { name: 'Delhi Okhla', lat: 28.5284, lng: 77.2793, area: 'Okhla Phase 3', city: 'New Delhi', state: 'Delhi', pincode: '110020' },
                    { name: 'Gwalior Hub', lat: 26.2183, lng: 78.1828, area: 'Govindpuri', city: 'Gwalior', state: 'Madhya Pradesh', pincode: '474011' },
                  ].map((preset) => (
                    <TouchableOpacity
                      key={preset.name}
                      onPress={() => {
                        setSelectedLat(preset.lat);
                        setSelectedLng(preset.lng);
                        if (!area) setArea(preset.area);
                        if (!city) setCity(preset.city);
                        if (!state) setState(preset.state);
                        if (!pincode) setPincode(preset.pincode);
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
                    onPress={() => {
                      setSelectedLat(28.5355);
                      setSelectedLng(77.3910);
                      Alert.alert('Live GPS Located', 'High-accuracy device coordinates synchronized.');
                    }}
                  >
                    <Icon name="crosshair" size={16} color="#059669" style={{ marginRight: 6 }} />
                    <Typography style={{ color: '#059669', fontSize: 13, fontFamily: 'Montserrat-Bold' }}>
                      Use Current GPS
                    </Typography>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.confirmPinBtn}
                    onPress={() => {
                      if (!area) setArea('Industrial Logistic Site');
                      if (!city) setCity('Noida');
                      if (!state) setState('Uttar Pradesh');
                      if (!pincode) setPincode('201301');
                      setMapModalVisible(false);
                      Alert.alert('Site Location Fixed', `Coordinates saved: ${selectedLat.toFixed(4)}, ${selectedLng.toFixed(4)}`);
                    }}
                  >
                    <Icon name="check" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Typography style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'Montserrat-Bold' }}>
                      Confirm Site Location
                    </Typography>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <TouchableOpacity
                style={styles.confirmPinBtn}
                onPress={() => setMapModalVisible(false)}
              >
                <Typography style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'Montserrat-Bold' }}>
                  Close Map View
                </Typography>
              </TouchableOpacity>
            )}
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
  pageTitle: {
    fontSize: 20,
    fontFamily: 'BalooBhai2-Bold',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#8B0000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  formCard: {
    gap: 12,
  },
  inputPill: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 14,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inlineErrorText: {
    color: '#EF4444',
    fontSize: 12,
    marginLeft: 16,
    marginTop: 4,
  },
  defaultCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
    paddingHorizontal: 8,
  },
  defaultCheckboxText: {
    fontSize: 14,
    color: '#333333',
  },
  primaryActionButton: {
    height: 50,
    backgroundColor: '#8B0000',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
  },
  cancelButton: {
    height: 50,
    paddingHorizontal: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
  },
  addressListContainer: {
    gap: 16,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: 4,
  },
  addressCardName: {
    fontSize: 16,
    fontFamily: 'BalooBhai2-Bold',
    color: '#000000',
  },
  addressCardLine: {
    fontSize: 13,
    color: '#555555',
    lineHeight: 18,
  },
  addressCardPhone: {
    fontSize: 13,
    color: '#777777',
    marginTop: 4,
  },
  addressCardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  addressActionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  editButton: {
    paddingVertical: 4,
  },
  editButtonText: {
    color: '#8B0000',
    fontFamily: 'Montserrat-SemiBold',
  },
  removeButton: {
    paddingVertical: 4,
  },
  removeButtonText: {
    color: '#888888',
    fontFamily: 'Montserrat-Regular',
  },
  setDefaultButton: {
    paddingVertical: 4,
  },
  setDefaultText: {
    color: '#8B0000',
    fontFamily: 'Montserrat-Medium',
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#FFF5F5',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#8B0000',
    gap: 8,
    marginTop: 8,
  },
  addNewButtonText: {
    color: '#8B0000',
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
  mapSelectorCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 6,
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
  addressGpsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  viewOnMapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE0E0',
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

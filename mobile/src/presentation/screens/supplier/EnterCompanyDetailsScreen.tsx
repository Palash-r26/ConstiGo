import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { SupplierTopHeader } from '../../components/SupplierTopHeader';
import Icon from 'react-native-vector-icons/Feather';
import { useAuthStore } from '../../../application/store/authStore';
import {
  fetchCompanyDetails,
  addCompanyDetails,
  updateCompanyDetails,
  VendorCompanyDetailsPayload,
} from '../../../infrastructure/api/vendorApi';
import { companyDetailsSchema } from '../../../application/utils/validators';

export const EnterCompanyDetailsScreen = ({ navigation, route }: any) => {
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const token = useAuthStore((state) => state.token);

  // Vendor ID resolution
  const vendorId = route?.params?.vendorid || user?.vendorid || user?._id || 'CV290926162458';

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [mobileNumber, setMobileNumber] = useState(user?.phone || '');
  const [emailId, setEmailId] = useState(user?.email || '');
  const [companyAddress, setCompanyAddress] = useState('');

  // Service Category state
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<{ [key: string]: boolean }>({
    Cement: false,
    Steel: false,
    Bricks: false,
    All: true,
  });

  // KYC State
  const [gstin, setGstin] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [pan, setPan] = useState('');
  const [bankAcc, setBankAcc] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [workingHrs, setWorkingHrs] = useState('');
  const [latitude, setLatitude] = useState('28.39473');
  const [longitude, setLongitude] = useState('77.02231');

  // Validation & UI state
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExistingRecord, setIsExistingRecord] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    const loadCompanyDetails = async () => {
      if (!vendorId) return;
      try {
        setIsFetching(true);
        // Call REAL PHP production endpoint: https://constigo.in/app/vendor/companydetailsfetch.php
        const response = await fetchCompanyDetails(vendorId);
        console.log('[EnterCompanyDetailsScreen] Company Details Fetch Raw Response:', response);

        const data = response?.data || response?.company || (typeof response === 'object' && response?.companyname ? response : null);
        if (data) {
          setIsExistingRecord(true);
          if (data.companyname) setCompanyName(data.companyname);
          if (data.companyphone) setMobileNumber(data.companyphone);
          if (data.companyemail) setEmailId(data.companyemail);
          if (data.companyaddress) setCompanyAddress(data.companyaddress);
          if (data.gst) setGstin(data.gst);
          if (data.adhaar || data.aadhaar) setAadhaar(data.adhaar || data.aadhaar);
          if (data.pan) setPan(data.pan);
          if (data.bankac) setBankAcc(data.bankac);
          if (data.ifsc) setIfsc(data.ifsc);
          if (data.emergencyphone) setEmergencyContact(data.emergencyphone);
          if (data.workinghours) setWorkingHrs(data.workinghours);
          if (data.maplatitude) setLatitude(String(data.maplatitude));
          if (data.maplongitude) setLongitude(String(data.maplongitude));
        }
      } catch (err: any) {
        console.warn('[EnterCompanyDetailsScreen] Fetch existing details notice:', err.message);
      } finally {
        setIsFetching(false);
      }
    };

    loadCompanyDetails();
  }, [vendorId]);

  const toggleCategory = (cat: string) => {
    if (cat === 'All') {
      const nextAll = !selectedCategories.All;
      setSelectedCategories({
        Cement: nextAll,
        Steel: nextAll,
        Bricks: nextAll,
        All: nextAll,
      });
    } else {
      const updated = {
        ...selectedCategories,
        [cat]: !selectedCategories[cat],
      };
      updated.All = updated.Cement && updated.Steel && updated.Bricks;
      setSelectedCategories(updated);
    }
  };

  const handleContinue = async () => {
    setStatusMessage(null);
    setFieldErrors({});

    const formData = {
      companyName: companyName.trim(),
      mobileNumber: mobileNumber.trim(),
      emailId: emailId.trim(),
      companyAddress: companyAddress.trim(),
      gstin: gstin.trim().toUpperCase(),
      aadhaar: aadhaar.trim(),
      pan: pan.trim().toUpperCase(),
      bankAcc: bankAcc.trim(),
      ifsc: ifsc.trim().toUpperCase(),
      emergencyContact: emergencyContact.trim(),
      workingHrs: workingHrs.trim(),
    };

    const validation = companyDetailsSchema.safeParse(formData);
    if (!validation.success) {
      const formatted = validation.error.format();
      const errors: Record<string, string> = {};
      if (formatted.companyName?._errors[0]) errors.companyName = formatted.companyName._errors[0];
      if (formatted.mobileNumber?._errors[0]) errors.mobileNumber = formatted.mobileNumber._errors[0];
      if (formatted.emailId?._errors[0]) errors.emailId = formatted.emailId._errors[0];
      if (formatted.companyAddress?._errors[0]) errors.companyAddress = formatted.companyAddress._errors[0];
      if (formatted.gstin?._errors[0]) errors.gstin = formatted.gstin._errors[0];
      if (formatted.aadhaar?._errors[0]) errors.aadhaar = formatted.aadhaar._errors[0];
      if (formatted.pan?._errors[0]) errors.pan = formatted.pan._errors[0];
      if (formatted.bankAcc?._errors[0]) errors.bankAcc = formatted.bankAcc._errors[0];
      if (formatted.ifsc?._errors[0]) errors.ifsc = formatted.ifsc._errors[0];
      if (formatted.emergencyContact?._errors[0]) errors.emergencyContact = formatted.emergencyContact._errors[0];
      if (formatted.workingHrs?._errors[0]) errors.workingHrs = formatted.workingHrs._errors[0];

      setFieldErrors(errors);
      setStatusMessage({ type: 'error', text: 'Please correct the highlighted errors before submitting.' });
      return;
    }

    try {
      setIsSaving(true);
      const activeCats = Object.entries(selectedCategories)
        .filter(([k, v]) => v && k !== 'All')
        .map(([k]) => k)
        .join(', ') || 'bike repair, car mechanic';

      const payload: VendorCompanyDetailsPayload = {
        vendorid: vendorId,
        companyname: formData.companyName,
        companyphone: formData.mobileNumber,
        companyemail: formData.emailId,
        companyaddress: formData.companyAddress,
        categories: activeCats,
        gst: formData.gstin,
        adhaar: formData.aadhaar,
        pan: formData.pan,
        bankac: formData.bankAcc,
        ifsc: formData.ifsc,
        emergencyphone: formData.emergencyContact,
        workinghours: formData.workingHrs,
        maplatitude: latitude,
        maplongitude: longitude,
      };

      let response;
      if (isExistingRecord) {
        response = await updateCompanyDetails(payload);
        console.log('[EnterCompanyDetailsScreen] Company Details Update Raw Response:', response);
      } else {
        response = await addCompanyDetails(payload);
        console.log('[EnterCompanyDetailsScreen] Company Details Add Raw Response:', response);
      }

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true || (response && !response?.error);
      if (isSuccess) {
        if (user && login && token) {
          await login({
            ...user,
            hasCompany: true,
            vendorid: vendorId,
          }, token);
        }
        if (navigation) {
          navigation.navigate('SupplierTabs');
        }
      } else {
        setStatusMessage({
          type: 'error',
          text: response?.message || response?.error || 'Failed to save company details. Please try again.',
        });
      }
    } catch (err: any) {
      console.error('[EnterCompanyDetailsScreen] Save Error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'An error occurred while saving company details.',
      });
    } finally {
      setIsSaving(false);
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
            Enter Your Company Details
          </Typography>
          <Typography variant="bodySmall" style={styles.subtitle}>
            Enter your credentials to register your profile
          </Typography>
        </View>

        {/* Company Details Inputs */}
        <View style={styles.inputGroup}>
          <View>
            <View style={[styles.pillInputContainer, fieldErrors.companyName && styles.inputError]}>
              <TextInput
                style={styles.textInput}
                placeholder="Company Name"
                placeholderTextColor={fieldErrors.companyName ? '#EF4444' : '#9CA3AF'}
                value={companyName}
                onChangeText={(t) => {
                  setCompanyName(t);
                  if (fieldErrors.companyName) setFieldErrors({ ...fieldErrors, companyName: '' });
                }}
              />
            </View>
            {fieldErrors.companyName ? (
              <Typography variant="bodySmall" style={styles.inlineErrorText}>
                {fieldErrors.companyName}
              </Typography>
            ) : null}
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <View style={[styles.pillInputContainer, fieldErrors.mobileNumber && styles.inputError]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Mobile Number"
                  placeholderTextColor={fieldErrors.mobileNumber ? '#EF4444' : '#9CA3AF'}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={mobileNumber}
                  onChangeText={(t) => {
                    setMobileNumber(t);
                    if (fieldErrors.mobileNumber) setFieldErrors({ ...fieldErrors, mobileNumber: '' });
                  }}
                />
              </View>
              {fieldErrors.mobileNumber ? (
                <Typography variant="bodySmall" style={styles.inlineErrorText}>
                  {fieldErrors.mobileNumber}
                </Typography>
              ) : null}
            </View>

            <View style={styles.halfWidth}>
              <View style={[styles.pillInputContainer, fieldErrors.emailId && styles.inputError]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Email ID"
                  placeholderTextColor={fieldErrors.emailId ? '#EF4444' : '#9CA3AF'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={emailId}
                  onChangeText={(t) => {
                    setEmailId(t);
                    if (fieldErrors.emailId) setFieldErrors({ ...fieldErrors, emailId: '' });
                  }}
                />
              </View>
              {fieldErrors.emailId ? (
                <Typography variant="bodySmall" style={styles.inlineErrorText}>
                  {fieldErrors.emailId}
                </Typography>
              ) : null}
            </View>
          </View>

          <View>
            <View style={[styles.pillInputContainer, fieldErrors.companyAddress && styles.inputError]}>
              <TextInput
                style={styles.textInput}
                placeholder="Company Address"
                placeholderTextColor={fieldErrors.companyAddress ? '#EF4444' : '#9CA3AF'}
                value={companyAddress}
                onChangeText={(t) => {
                  setCompanyAddress(t);
                  if (fieldErrors.companyAddress) setFieldErrors({ ...fieldErrors, companyAddress: '' });
                }}
              />
            </View>
            {fieldErrors.companyAddress ? (
              <Typography variant="bodySmall" style={styles.inlineErrorText}>
                {fieldErrors.companyAddress}
              </Typography>
            ) : null}
          </View>
        </View>

        {/* Map Preview Card */}
        <View style={styles.mapCard}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=60',
            }}
            style={styles.mapImage}
            resizeMode="cover"
          />
          <View style={styles.mapOverlay} />
          <TouchableOpacity
            style={styles.pinButton}
            activeOpacity={0.8}
            onPress={() => {}}
          >
            <Typography variant="bodySmall" style={styles.pinButtonText}>
              pin your location
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Service Category Accordion Card */}
        <View style={styles.categoryCard}>
          <TouchableOpacity
            style={styles.categoryHeader}
            onPress={() => setIsCategoryOpen(!isCategoryOpen)}
            activeOpacity={0.7}
          >
            <Typography variant="bodyMedium" style={styles.categoryTitle}>
              Select Your Service Category
            </Typography>
            <Icon
              name={isCategoryOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#4B5563"
            />
          </TouchableOpacity>

          {isCategoryOpen && (
            <>
              <View style={styles.divider} />
              <View style={styles.checkboxGrid}>
                {/* Row 1 */}
                <View style={styles.checkboxRow}>
                  <TouchableOpacity
                    style={styles.checkboxItem}
                    onPress={() => toggleCategory('Cement')}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selectedCategories.Cement && styles.checkboxChecked,
                      ]}
                    >
                      {selectedCategories.Cement && (
                        <Icon name="check" size={14} color="#8B0000" />
                      )}
                    </View>
                    <Typography variant="bodyDefault" style={styles.checkboxLabel}>
                      Cement
                    </Typography>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.checkboxItem}
                    onPress={() => toggleCategory('Steel')}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selectedCategories.Steel && styles.checkboxChecked,
                      ]}
                    >
                      {selectedCategories.Steel && (
                        <Icon name="check" size={14} color="#8B0000" />
                      )}
                    </View>
                    <Typography variant="bodyDefault" style={styles.checkboxLabel}>
                      Steel
                    </Typography>
                  </TouchableOpacity>
                </View>

                {/* Row 2 */}
                <View style={styles.checkboxRow}>
                  <TouchableOpacity
                    style={styles.checkboxItem}
                    onPress={() => toggleCategory('Bricks')}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selectedCategories.Bricks && styles.checkboxChecked,
                      ]}
                    >
                      {selectedCategories.Bricks && (
                        <Icon name="check" size={14} color="#8B0000" />
                      )}
                    </View>
                    <Typography variant="bodyDefault" style={styles.checkboxLabel}>
                      Bricks
                    </Typography>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.checkboxItem}
                    onPress={() => toggleCategory('All')}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selectedCategories.All && styles.checkboxChecked,
                      ]}
                    >
                      {selectedCategories.All && (
                        <Icon name="check" size={14} color="#8B0000" />
                      )}
                    </View>
                    <Typography variant="bodyDefault" style={styles.checkboxLabel}>
                      All
                    </Typography>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>

        {/* KYC Verification Section */}
        <View style={styles.kycSection}>
          <Typography variant="bodyMedium" style={styles.kycTitle}>
            KYC Verification
          </Typography>

          <View style={styles.inputGroup}>
            <View>
              <View style={[styles.pillInputContainer, fieldErrors.gstin && styles.inputError]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="GSTIN Number (15 digits/letters)"
                  placeholderTextColor={fieldErrors.gstin ? '#EF4444' : '#9CA3AF'}
                  autoCapitalize="characters"
                  maxLength={15}
                  value={gstin}
                  onChangeText={(t) => {
                    setGstin(t);
                    if (fieldErrors.gstin) setFieldErrors({ ...fieldErrors, gstin: '' });
                  }}
                />
              </View>
              {fieldErrors.gstin ? (
                <Typography variant="bodySmall" style={styles.inlineErrorText}>
                  {fieldErrors.gstin}
                </Typography>
              ) : null}
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <View style={[styles.pillInputContainer, fieldErrors.aadhaar && styles.inputError]}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Aadhaar No. (12 digits)"
                    placeholderTextColor={fieldErrors.aadhaar ? '#EF4444' : '#9CA3AF'}
                    keyboardType="numeric"
                    maxLength={12}
                    value={aadhaar}
                    onChangeText={(t) => {
                      setAadhaar(t);
                      if (fieldErrors.aadhaar) setFieldErrors({ ...fieldErrors, aadhaar: '' });
                    }}
                  />
                </View>
                {fieldErrors.aadhaar ? (
                  <Typography variant="bodySmall" style={styles.inlineErrorText}>
                    {fieldErrors.aadhaar}
                  </Typography>
                ) : null}
              </View>

              <View style={styles.halfWidth}>
                <View style={[styles.pillInputContainer, fieldErrors.pan && styles.inputError]}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="PAN No. (10 chars)"
                    placeholderTextColor={fieldErrors.pan ? '#EF4444' : '#9CA3AF'}
                    autoCapitalize="characters"
                    maxLength={10}
                    value={pan}
                    onChangeText={(t) => {
                      setPan(t);
                      if (fieldErrors.pan) setFieldErrors({ ...fieldErrors, pan: '' });
                    }}
                  />
                </View>
                {fieldErrors.pan ? (
                  <Typography variant="bodySmall" style={styles.inlineErrorText}>
                    {fieldErrors.pan}
                  </Typography>
                ) : null}
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <View style={[styles.pillInputContainer, fieldErrors.bankAcc && styles.inputError]}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Bank A/C No."
                    placeholderTextColor={fieldErrors.bankAcc ? '#EF4444' : '#9CA3AF'}
                    keyboardType="numeric"
                    value={bankAcc}
                    onChangeText={(t) => {
                      setBankAcc(t);
                      if (fieldErrors.bankAcc) setFieldErrors({ ...fieldErrors, bankAcc: '' });
                    }}
                  />
                </View>
                {fieldErrors.bankAcc ? (
                  <Typography variant="bodySmall" style={styles.inlineErrorText}>
                    {fieldErrors.bankAcc}
                  </Typography>
                ) : null}
              </View>

              <View style={styles.halfWidth}>
                <View style={[styles.pillInputContainer, fieldErrors.ifsc && styles.inputError]}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="IFSC Code"
                    placeholderTextColor={fieldErrors.ifsc ? '#EF4444' : '#9CA3AF'}
                    autoCapitalize="characters"
                    maxLength={11}
                    value={ifsc}
                    onChangeText={(t) => {
                      setIfsc(t);
                      if (fieldErrors.ifsc) setFieldErrors({ ...fieldErrors, ifsc: '' });
                    }}
                  />
                </View>
                {fieldErrors.ifsc ? (
                  <Typography variant="bodySmall" style={styles.inlineErrorText}>
                    {fieldErrors.ifsc}
                  </Typography>
                ) : null}
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 0.65 }}>
                <View style={[styles.pillInputContainer, fieldErrors.emergencyContact && styles.inputError]}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Emergency Contact"
                    placeholderTextColor={fieldErrors.emergencyContact ? '#EF4444' : '#9CA3AF'}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={emergencyContact}
                    onChangeText={(t) => {
                      setEmergencyContact(t);
                      if (fieldErrors.emergencyContact) setFieldErrors({ ...fieldErrors, emergencyContact: '' });
                    }}
                  />
                </View>
                {fieldErrors.emergencyContact ? (
                  <Typography variant="bodySmall" style={styles.inlineErrorText}>
                    {fieldErrors.emergencyContact}
                  </Typography>
                ) : null}
              </View>

              <View style={{ flex: 0.35 }}>
                <View style={[styles.pillInputContainer, fieldErrors.workingHrs && styles.inputError]}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Working Hrs."
                    placeholderTextColor={fieldErrors.workingHrs ? '#EF4444' : '#9CA3AF'}
                    value={workingHrs}
                    onChangeText={(t) => {
                      setWorkingHrs(t);
                      if (fieldErrors.workingHrs) setFieldErrors({ ...fieldErrors, workingHrs: '' });
                    }}
                  />
                </View>
                {fieldErrors.workingHrs ? (
                  <Typography variant="bodySmall" style={styles.inlineErrorText}>
                    {fieldErrors.workingHrs}
                  </Typography>
                ) : null}
              </View>
            </View>
          </View>
        </View>

        {statusMessage && (
          <Typography
            style={{
              color: statusMessage.type === 'error' ? '#EF4444' : '#10B981',
              textAlign: 'center',
              marginTop: 16,
              fontFamily: 'Montserrat-Medium',
              fontSize: 13,
            }}
          >
            {statusMessage.text}
          </Typography>
        )}

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, isSaving && { opacity: 0.7 }]}
          activeOpacity={0.85}
          disabled={isSaving}
          onPress={handleContinue}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Typography variant="bodyBold" style={styles.continueButtonText}>
              {isExistingRecord ? 'Update Details' : 'Continue'}
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
    paddingBottom: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 24,
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
    paddingVertical: 12,
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
  mapCard: {
    marginTop: 14,
    height: 140,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  pinButton: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    backgroundColor: '#8B0000',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  pinButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
  },
  categoryCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 14,
    color: '#334155',
    fontFamily: 'Montserrat-SemiBold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  checkboxGrid: {
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    borderColor: '#8B0000',
    backgroundColor: '#FFFFFF',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#475569',
    fontFamily: 'Montserrat-Medium',
  },
  kycSection: {
    marginTop: 20,
  },
  kycTitle: {
    fontSize: 15,
    color: '#8B0000',
    fontStyle: 'italic',
    fontFamily: 'Montserrat-Bold',
    marginBottom: 12,
    marginLeft: 4,
  },
  continueButton: {
    backgroundColor: '#8B0000',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
});

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
} from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { SupplierTopHeader } from '../../components/SupplierTopHeader';
import Icon from 'react-native-vector-icons/Feather';

export const EnterCompanyDetailsScreen = ({ navigation }: any) => {
  // Form State
  const [companyName, setCompanyName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailId, setEmailId] = useState('');
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

  const handleContinue = () => {
    if (navigation) {
      navigation.navigate('SupplierTabs');
    }
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
            Enter Your Company Details
          </Typography>
          <Typography variant="bodySmall" style={styles.subtitle}>
            Enter your credentials to register your profile
          </Typography>
        </View>

        {/* Company Details Inputs */}
        <View style={styles.inputGroup}>
          <View style={styles.pillInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Company Name"
              placeholderTextColor="#9CA3AF"
              value={companyName}
              onChangeText={setCompanyName}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.pillInputContainer, styles.halfWidth]}>
              <TextInput
                style={styles.textInput}
                placeholder="Mobile Number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={mobileNumber}
                onChangeText={setMobileNumber}
              />
            </View>
            <View style={[styles.pillInputContainer, styles.halfWidth]}>
              <TextInput
                style={styles.textInput}
                placeholder="Email ID"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={emailId}
                onChangeText={setEmailId}
              />
            </View>
          </View>

          <View style={styles.pillInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Company Address"
              placeholderTextColor="#9CA3AF"
              value={companyAddress}
              onChangeText={setCompanyAddress}
            />
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
          {/* Subtle map overlay grid lines */}
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
            <View style={styles.pillInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="GSTIN Number"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
                value={gstin}
                onChangeText={setGstin}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.pillInputContainer, styles.halfWidth]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Aadhaar No."
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={aadhaar}
                  onChangeText={setAadhaar}
                />
              </View>
              <View style={[styles.pillInputContainer, styles.halfWidth]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="PAN No."
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="characters"
                  value={pan}
                  onChangeText={setPan}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.pillInputContainer, styles.halfWidth]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Bank A/C No."
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={bankAcc}
                  onChangeText={setBankAcc}
                />
              </View>
              <View style={[styles.pillInputContainer, styles.halfWidth]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="IFSC Code"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="characters"
                  value={ifsc}
                  onChangeText={setIfsc}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.pillInputContainer, { flex: 0.65 }]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Emergency Contant Number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  value={emergencyContact}
                  onChangeText={setEmergencyContact}
                />
              </View>
              <View style={[styles.pillInputContainer, { flex: 0.35 }]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Working Hrs."
                  placeholderTextColor="#9CA3AF"
                  value={workingHrs}
                  onChangeText={setWorkingHrs}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.85}
          onPress={handleContinue}
        >
          <Typography variant="bodyBold" style={styles.continueButtonText}>
            Continue
          </Typography>
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

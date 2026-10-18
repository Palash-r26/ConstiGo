import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Typography, Button, AuthInput, ScreenWrapper } from '@constigo/shared';
import Icon from 'react-native-vector-icons/Feather';
import {
  fetchWorkerCategories,
  updateWorkerProfile,
  WorkerItem,
} from '../../services/api/workerApi';
import { DEFAULT_SKILL_OPTIONS, SkillOption } from '../auth/WorkerSignUpScreen';

export const WorkerEditProfileScreen = ({ navigation, route }: any) => {
  const initialWorker: WorkerItem = route?.params?.worker || {};

  const [name, setName] = useState(initialWorker.fullname || '');
  const [phone, setPhone] = useState(initialWorker.phone || '');
  const [city, setCity] = useState(initialWorker.location || '');
  const [serviceCharge, setServiceCharge] = useState(initialWorker.service_charge || '');
  const [visitingCharge, setVisitingCharge] = useState(initialWorker.visit_charge || '');

  // Extract initial categories array from comma-separated string
  const initialSelected = initialWorker.skill
    ? initialWorker.skill
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialSelected);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [skillOptions, setSkillOptions] = useState<SkillOption[]>(DEFAULT_SKILL_OPTIONS);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await fetchWorkerCategories();
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const apiOptions: SkillOption[] = res.data.map((catItem: any) => {
            const matched = DEFAULT_SKILL_OPTIONS.find(
              (o: SkillOption) => o.name.toLowerCase() === catItem.category.toLowerCase()
            );
            return {
              id: String(catItem.id),
              name: catItem.category,
              icon: matched ? matched.icon : 'tool',
              description: matched ? matched.description : `${catItem.category} services & work`,
            };
          });
          setSkillOptions(apiOptions);
        }
      } catch (e) {
        console.warn('[WorkerEditProfile] Failed to load categories from API, using fallback:', e);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const handleToggleSkill = (skillName: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(skillName)) {
        return prev.filter((s) => s !== skillName);
      } else {
        return [...prev, skillName];
      }
    });
    if (errors.category) setErrors({ ...errors, category: '' });
  };

  const handleRemoveSkill = (skillName: string) => {
    setSelectedCategories((prev) => prev.filter((s) => s !== skillName));
  };

  const handleSaveProfile = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = 'Full Name is required';
    if (!phone.trim() || !/^[6-9]\d{9}$/.test(phone.trim().replace(/\D/g, ''))) {
      newErrors.phone = 'Enter a valid 10-digit mobile number';
    }
    if (selectedCategories.length === 0) {
      newErrors.category = 'Please select at least one Trade / Skill';
    }
    if (!serviceCharge.trim()) {
      newErrors.serviceCharge = 'Daily service charge is required';
    }
    if (!visitingCharge.trim()) {
      newErrors.visitingCharge = 'Visiting charge is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const workerId = initialWorker.workerid || initialWorker.id || `CW_${phone.trim()}`;
      const skillsString = selectedCategories.join(', ');

      await updateWorkerProfile(workerId, {
        fullname: name.trim(),
        phone: phone.trim(),
        skill: skillsString,
        location: city.trim() || 'Indore, MP',
        service_charge: serviceCharge.trim(),
        visit_charge: visitingCharge.trim(),
      });

      Alert.alert(
        'Profile Updated! 🎉',
        `Your worker details and updated rates have been saved successfully.\nSkills: ${skillsString}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      console.error('[WorkerEditProfile] Save error:', err);
      Alert.alert('Error', err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper className="bg-white">
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
          <Icon name="arrow-left" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Typography variant="bodyBold" style={{ fontSize: 16, color: '#0F172A', marginLeft: 12 }}>
          Edit Worker Profile
        </Typography>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Form Fields */}
        <View className="gap-y-4 mb-8">
          {/* 1. Full Name */}
          <View>
            <Typography variant="bodyBold" style={styles.fieldLabel}>
              Full Name / Primary Contact
            </Typography>
            <AuthInput
              fill="dark"
              placeholder="Full Name"
              leftIcon="user"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              error={errors.name}
            />
          </View>

          {/* 2. Phone Number */}
          <View>
            <Typography variant="bodyBold" style={styles.fieldLabel}>
              Mobile Number (Contact for Bookings)
            </Typography>
            <AuthInput
              fill="dark"
              placeholder="10-Digit Mobile Number"
              leftIcon="phone"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (errors.phone) setErrors({ ...errors, phone: '' });
              }}
              error={errors.phone}
            />
          </View>

          {/* 3. Trades / Skills (Multi-select) */}
          <View>
            <Typography variant="bodyBold" style={styles.fieldLabel}>
              Trades & Skills (Multi-Select)
            </Typography>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowSkillModal(true)}
              style={[styles.dropdownTrigger, errors.category ? styles.dropdownError : null]}
            >
              <View className="flex-row items-center flex-1">
                <Icon name="tool" size={18} color="#8B0000" style={{ marginRight: 10 }} />
                <Typography
                  style={{
                    fontFamily: 'Montserrat-Regular',
                    fontSize: 14,
                    color: selectedCategories.length > 0 ? '#111827' : '#8A8A8E',
                  }}
                >
                  {selectedCategories.length > 0
                    ? `${selectedCategories.length} Trades Selected`
                    : 'Select Trades / Skills'}
                </Typography>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {selectedCategories.length > 0 && (
                  <View style={styles.countBadge}>
                    <Typography style={styles.countBadgeText}>{selectedCategories.length}</Typography>
                  </View>
                )}
                <Icon name="chevron-down" size={20} color="#8A8A8E" />
              </View>
            </TouchableOpacity>

            {/* Selected Trade Chips Cloud */}
            {selectedCategories.length > 0 && (
              <View style={styles.skillChipsContainer}>
                {selectedCategories.map((catName) => (
                  <View key={catName} style={styles.skillChip}>
                    <Icon name="check" size={12} color="#8B0000" style={{ marginRight: 4 }} />
                    <Typography style={styles.skillChipText}>{catName}</Typography>
                    <TouchableOpacity
                      onPress={() => handleRemoveSkill(catName)}
                      style={styles.chipRemoveBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Icon name="x" size={13} color="#8B0000" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity onPress={() => setShowSkillModal(true)} style={styles.addMoreChip}>
                  <Icon name="plus" size={13} color="#8B0000" style={{ marginRight: 3 }} />
                  <Typography style={styles.addMoreChipText}>Add / Change</Typography>
                </TouchableOpacity>
              </View>
            )}

            {errors.category ? (
              <Typography variant="bodySmall" className="text-red-500 ml-2 mt-1">
                {errors.category}
              </Typography>
            ) : null}
          </View>

          {/* 4. City / Work Location */}
          <View>
            <Typography variant="bodyBold" style={styles.fieldLabel}>
              Operating City / Base Location
            </Typography>
            <AuthInput
              fill="dark"
              placeholder="City / Base Location (e.g. Indore, MP)"
              leftIcon="map-pin"
              value={city}
              onChangeText={setCity}
            />
          </View>

          {/* 5. Service Charge */}
          <View>
            <Typography variant="bodyBold" style={styles.fieldLabel}>
              Daily Labor / Service Rate (₹ / Day)
            </Typography>
            <AuthInput
              fill="dark"
              placeholder="Daily Service Charge (e.g. 700)"
              leftIcon="dollar-sign"
              keyboardType="number-pad"
              value={serviceCharge}
              onChangeText={(text) => {
                setServiceCharge(text);
                if (errors.serviceCharge) setErrors({ ...errors, serviceCharge: '' });
              }}
              error={errors.serviceCharge}
            />
          </View>

          {/* 6. Visiting Charge */}
          <View>
            <Typography variant="bodyBold" style={styles.fieldLabel}>
              Visiting / Inspection Fee (₹)
            </Typography>
            <AuthInput
              fill="dark"
              placeholder="Visiting / Inspection Charge (e.g. 150)"
              leftIcon="check-circle"
              keyboardType="number-pad"
              value={visitingCharge}
              onChangeText={(text) => {
                setVisitingCharge(text);
                if (errors.visitingCharge) setErrors({ ...errors, visitingCharge: '' });
              }}
              error={errors.visitingCharge}
            />
          </View>
        </View>

        {/* Save Button */}
        <Button
          title="Save & Update Profile"
          onPress={handleSaveProfile}
          isLoading={isLoading}
          className="mb-6 rounded-full shadow-md"
        />

        {/* Trade / Skill Multi-Select Modal */}
        <Modal
          visible={showSkillModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSkillModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Typography variant="h2" style={{ fontSize: 18, color: '#111827' }}>
                    Select Trades / Skills
                  </Typography>
                  <Typography variant="bodySmall" style={{ color: '#6B7280', marginTop: 2 }}>
                    Tap to select multiple skills you offer ({selectedCategories.length} selected)
                  </Typography>
                </View>
                <TouchableOpacity onPress={() => setShowSkillModal(false)} style={styles.modalCloseBtn}>
                  <Icon name="x" size={20} color="#374151" />
                </TouchableOpacity>
              </View>

              {/* Action Toolbar */}
              <View style={styles.modalSubHeader}>
                <TouchableOpacity
                  onPress={() => setSelectedCategories(skillOptions.map((s) => s.name))}
                  style={styles.subActionBtn}
                >
                  <Typography style={styles.subActionText}>Select All</Typography>
                </TouchableOpacity>
                {selectedCategories.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSelectedCategories([])}
                    style={styles.subActionBtn}
                  >
                    <Typography style={[styles.subActionText, { color: '#EF4444' }]}>
                      Clear All
                    </Typography>
                  </TouchableOpacity>
                )}
              </View>

              {loadingCategories ? (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#8B0000" />
                  <Typography variant="bodySmall" style={{ color: '#6B7280', marginTop: 8 }}>
                    Loading skills...
                  </Typography>
                </View>
              ) : null}

              <FlatList
                data={skillOptions}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
                renderItem={({ item }) => {
                  const isSelected = selectedCategories.includes(item.name);
                  return (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleToggleSkill(item.name)}
                      style={[styles.skillItem, isSelected ? styles.skillItemSelected : null]}
                    >
                      <View
                        style={[
                          styles.skillIconBox,
                          isSelected ? styles.skillIconBoxSelected : null,
                        ]}
                      >
                        <Icon
                          name={item.icon || 'tool'}
                          size={20}
                          color={isSelected ? '#FFFFFF' : '#8B0000'}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Typography
                          variant="bodyBold"
                          style={{
                            fontSize: 15,
                            color: isSelected ? '#8B0000' : '#111827',
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Typography
                          variant="bodySmall"
                          style={{ color: '#6B7280', fontSize: 12, marginTop: 2 }}
                        >
                          {item.description}
                        </Typography>
                      </View>

                      {/* Checkbox indicator */}
                      <View style={[styles.checkboxBox, isSelected && styles.checkboxBoxSelected]}>
                        {isSelected && <Icon name="check" size={15} color="#FFFFFF" />}
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />

              {/* Modal Bottom Confirm Button */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.doneBtn}
                  activeOpacity={0.85}
                  onPress={() => setShowSkillModal(false)}
                >
                  <Icon name="check-circle" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Typography style={styles.doneBtnText}>
                    {selectedCategories.length > 0
                      ? `Confirm Selection (${selectedCategories.length} Skills)`
                      : 'Done'}
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fieldLabel: {
    fontSize: 12,
    color: '#334155',
    marginBottom: 6,
    marginLeft: 4,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  dropdownError: {
    borderColor: '#EF4444',
  },
  countBadge: {
    backgroundColor: '#8B0000',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Montserrat-Bold',
  },
  skillChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 2,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  skillChipText: {
    fontSize: 12,
    color: '#8B0000',
    fontFamily: 'Montserrat-SemiBold',
  },
  chipRemoveBtn: {
    marginLeft: 6,
    padding: 2,
  },
  addMoreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderStyle: 'dashed',
  },
  addMoreChipText: {
    fontSize: 12,
    color: '#8B0000',
    fontFamily: 'Montserrat-Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '80%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  modalSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  subActionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  subActionText: {
    fontSize: 12,
    color: '#8B0000',
    fontFamily: 'Montserrat-Bold',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  skillItemSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#8B0000',
  },
  skillIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  skillIconBoxSelected: {
    backgroundColor: '#8B0000',
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  checkboxBoxSelected: {
    backgroundColor: '#8B0000',
    borderColor: '#8B0000',
  },
  modalFooter: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  doneBtn: {
    flexDirection: 'row',
    backgroundColor: '#8B0000',
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
  },
});

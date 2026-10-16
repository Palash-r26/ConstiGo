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
import { Typography, Button, AuthInput, ScreenWrapper, Logo } from '@constigo/shared';
import Icon from 'react-native-vector-icons/Feather';
import {
  registerWorker,
  fetchWorkerCategories,
  isWorkerSuccess,
} from '../../services/api/workerApi';

export interface SkillOption {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const DEFAULT_SKILL_OPTIONS: SkillOption[] = [
  { id: 'plumber', name: 'Plumber', icon: 'tool', description: 'Pipe fittings, leak repairs & sanitary installations' },
  { id: 'mistry', name: 'Mistry / Mason', icon: 'home', description: 'Brickwork, plastering, foundation & civil work' },
  { id: 'electrician', name: 'Electrician', icon: 'zap', description: 'Wiring, switches, MCBs, lighting & load setup' },
  { id: 'carpenter', name: 'Carpenter', icon: 'box', description: 'Doors, windows, modular wood furniture & woodwork' },
  { id: 'painter', name: 'Painter', icon: 'edit-3', description: 'Wall painting, whitewashing, putty & texture' },
  { id: 'tiles', name: 'Tile & Marble Setter', icon: 'grid', description: 'Flooring tiles, wall tiles, granite & marble' },
  { id: 'welder', name: 'Welder / Fabricator', icon: 'shield', description: 'Iron gates, railings, grills & steel structure' },
  { id: 'helper', name: 'Labor / Helper', icon: 'users', description: 'Material shifting, loading, unloading & site support' },
  { id: 'pop', name: 'POP & False Ceiling', icon: 'layers', description: 'Gypsum, false ceiling, grid ceiling & molding' },
  { id: 'glass', name: 'Glass & Aluminium Worker', icon: 'maximize', description: 'Aluminium partitions, sliding windows & toughened glass' },
];

export const WorkerSignUpScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [serviceCharge, setServiceCharge] = useState('');
  const [visitingCharge, setVisitingCharge] = useState('');
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
          const apiOptions: SkillOption[] = res.data.map((catItem) => {
            const matched = DEFAULT_SKILL_OPTIONS.find(
              (o) => o.name.toLowerCase() === catItem.category.toLowerCase()
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
        console.warn('[WorkerSignUp] Failed to load worker categories from API, using fallback:', e);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const handleSelectSkill = (skill: SkillOption) => {
    setCategory(skill.name);
    setShowSkillModal(false);
    if (errors.category) setErrors({ ...errors, category: '' });
  };

  const handleRegister = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = 'Full Name is required';
    if (!phone.trim() || !/^[6-9]\d{9}$/.test(phone.trim().replace(/\D/g, ''))) {
      newErrors.phone = 'Enter a valid 10-digit mobile number';
    }
    if (!category.trim()) {
      newErrors.category = 'Please select your Trade / Skill';
    }
    if (!serviceCharge.trim()) {
      newErrors.serviceCharge = 'Service charge is required';
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
      const response = await registerWorker({
        fullname: name.trim(),
        phone: phone.trim(),
        skill: category.trim(),
        location: city.trim() || 'Indore',
        service_charge: serviceCharge.trim(),
        visit_charge: visitingCharge.trim(),
      });

      console.log('[WorkerSignUpScreen] Registration Response:', response);

      if (isWorkerSuccess(response)) {
        const workerId = response.workerid ? ` (ID: ${response.workerid})` : '';
        Alert.alert(
          'Registration Submitted! 🎉',
          `Welcome ${name}! Your worker profile (${category})${workerId} has been registered successfully. Contractors and suppliers can now connect with you directly.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        const errMsg = response.error || response.message || 'Worker registration failed. Please try again.';
        Alert.alert('Registration Failed', errMsg);
      }
    } catch (err: any) {
      console.error('[WorkerSignUpScreen] Error:', err);
      Alert.alert('Error', err.message || 'Worker registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper className="bg-white">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View className="flex-row items-center mt-4 mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()} className="absolute z-10 py-2">
            <Icon name="chevron-left" size={28} color="#111827" />
          </TouchableOpacity>
          <View className="flex-1">
            <Typography variant="h2" className="text-center text-xl text-[#111827]">
              Worker Registration
            </Typography>
          </View>
        </View>

        {/* Logo and Subtitle */}
        <View className="items-center mb-6">
          <Logo size="md" style={{ marginBottom: 16 }} />
          <Typography
            variant="h1Black"
            className="text-2xl text-center mb-1 text-[#111827]"
          >
            Sign Up as Worker
          </Typography>
          <Typography
            variant="bodySmall"
            className="text-xs text-text-secondary text-center px-4 leading-4"
          >
            Join ConstiGo to connect with top contractors, builders, and suppliers for site work
          </Typography>
        </View>

        {/* Form Fields */}
        <View className="gap-y-4 mb-8">
          {/* 1. Full Name */}
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

          {/* 2. Phone Number */}
          <AuthInput
            fill="dark"
            placeholder="Phone Number"
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

          {/* 3. Trade / Skill Dropdown Selector */}
          <View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowSkillModal(true)}
              style={[
                styles.dropdownTrigger,
                errors.category ? styles.dropdownError : null,
              ]}
            >
              <View className="flex-row items-center flex-1">
                <Icon
                  name="tool"
                  size={20}
                  color="#8B0000"
                  style={{ marginRight: 10 }}
                />
                <Typography
                  style={{
                    fontFamily: 'Montserrat-Regular',
                    fontSize: 16,
                    color: category ? '#111827' : '#8A8A8E',
                  }}
                >
                  {category || 'Select Trade / Skill (Dropdown)'}
                </Typography>
              </View>
              <Icon name="chevron-down" size={20} color="#8A8A8E" />
            </TouchableOpacity>
            {errors.category ? (
              <Typography variant="bodySmall" className="text-red-500 ml-2 mt-1">
                {errors.category}
              </Typography>
            ) : null}
          </View>

          {/* 4. City / Work Location */}
          <AuthInput
            fill="dark"
            placeholder="City / Work Location (e.g. Indore, MP)"
            leftIcon="map-pin"
            value={city}
            onChangeText={setCity}
          />

          {/* 5. Service Charge */}
          <AuthInput
            fill="dark"
            placeholder="Daily Service Charge (e.g. ₹ 700 / day)"
            leftIcon="dollar-sign"
            value={serviceCharge}
            onChangeText={(text) => {
              setServiceCharge(text);
              if (errors.serviceCharge) setErrors({ ...errors, serviceCharge: '' });
            }}
            error={errors.serviceCharge}
          />

          {/* 6. Visiting Charge */}
          <AuthInput
            fill="dark"
            placeholder="Visiting / Inspection Charge (e.g. ₹ 150)"
            leftIcon="check-circle"
            value={visitingCharge}
            onChangeText={(text) => {
              setVisitingCharge(text);
              if (errors.visitingCharge) setErrors({ ...errors, visitingCharge: '' });
            }}
            error={errors.visitingCharge}
          />
        </View>

        {/* Submit Button */}
        <Button
          title="Submit Worker Registration"
          onPress={handleRegister}
          isLoading={isLoading}
          className="mb-6 rounded-full shadow-md"
        />

        {/* Trade / Skill Selection Modal */}
        <Modal
          visible={showSkillModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSkillModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View>
                  <Typography variant="h2" style={{ fontSize: 18, color: '#111827' }}>
                    Select Your Trade / Skill
                  </Typography>
                  <Typography variant="bodySmall" style={{ color: '#6B7280', marginTop: 2 }}>
                    Choose the primary craft you offer
                  </Typography>
                </View>
                <TouchableOpacity
                  onPress={() => setShowSkillModal(false)}
                  style={styles.modalCloseBtn}
                >
                  <Icon name="x" size={20} color="#374151" />
                </TouchableOpacity>
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
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
                renderItem={({ item }) => {
                  const isSelected = category === item.name;
                  return (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleSelectSkill(item)}
                      style={[
                        styles.skillItem,
                        isSelected ? styles.skillItemSelected : null,
                      ]}
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
                      {isSelected ? (
                        <Icon name="check-circle" size={22} color="#8B0000" />
                      ) : (
                        <Icon name="chevron-right" size={18} color="#D1D5DB" />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 9999,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  dropdownError: {
    borderColor: '#EF4444',
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
    maxHeight: '75%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  skillItemSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
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
});

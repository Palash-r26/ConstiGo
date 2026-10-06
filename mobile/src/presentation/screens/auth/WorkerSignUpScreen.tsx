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
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { AuthInput } from '../../components/AuthInput';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Logo } from '../../components/Logo';
import Icon from 'react-native-vector-icons/Feather';
import {
  registerWorker,
  fetchWorkerCategories,
  isWorkerSuccess,
} from '../../../infrastructure/api/workerApi';

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
        // Call REAL PHP production endpoint: https://constigo.in/app/worker/categories_fetch.php
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
      newErrors.category = 'Please select your Trade / Skill from dropdown';
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
      // Call REAL PHP production endpoint: https://constigo.in/app/worker/registration.php
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
          `Welcome ${name}! Your worker profile (${category})${workerId} has been registered successfully. Contractors can now connect with you directly.`,
          [{ text: 'OK', onPress: () => navigation.navigate('Welcome') }]
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
            Join ConstiGo to connect with top contractors and builders for construction jobs
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
            placeholder="City / Work Location (e.g. Gurugram, Delhi NCR)"
            leftIcon="map-pin"
            value={city}
            onChangeText={setCity}
          />

          {/* 5. Service Charge */}
          <AuthInput
            fill="dark"
            placeholder="Service charge (e.g. ₹ 400 / service or ₹ 900 / day)"
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
            placeholder="Visiting charge (e.g. ₹ 150)"
            leftIcon="tag"
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
          title="Sign Up as Worker"
          onPress={handleRegister}
          isLoading={isLoading}
          className="mb-6 rounded-full shadow-md"
        />

        {/* Back to Sign In Link */}
        <View className="flex-row justify-center items-center">
          <Typography variant="bodyBold" className="text-sm text-[#111827]">
            Already have an account?{' '}
          </Typography>
          <Button
            variant="link"
            title="Sign In"
            onPress={() => navigation.navigate('Welcome')}
            textClassName="text-sm"
            className="py-0"
          />
        </View>
      </ScrollView>

      {/* Skill Dropdown Selection Modal */}
      <Modal
        visible={showSkillModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSkillModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowSkillModal(false)}
          />

          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Typography variant="h2" style={styles.modalTitle}>
                Select Trade / Skill
              </Typography>
              <TouchableOpacity
                onPress={() => setShowSkillModal(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Typography variant="bodySmall" style={styles.modalSubtitle}>
              Select your primary construction skill to list on the buyer portal
            </Typography>

            {/* Skill List */}
            {loadingCategories ? (
              <View style={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="small" color="#9C101A" />
                <Typography variant="bodySmall" style={{ marginTop: 8, color: '#64748B' }}>
                  Loading trade categories...
                </Typography>
              </View>
            ) : (
              <FlatList
                data={skillOptions}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24, gap: 10 }}
              renderItem={({ item }) => {
                const isSelected = category.toLowerCase() === item.name.toLowerCase();
                return (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => handleSelectSkill(item)}
                    style={[
                      styles.skillOptionCard,
                      isSelected && styles.skillOptionCardSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.skillIconWrapper,
                        isSelected && styles.skillIconWrapperSelected,
                      ]}
                    >
                      <Icon
                        name={item.icon}
                        size={20}
                        color={isSelected ? '#FFFFFF' : '#8B0000'}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Typography
                        variant="bodyBold"
                        style={[
                          styles.skillOptionName,
                          isSelected && styles.skillOptionNameSelected,
                        ]}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        variant="bodySmall"
                        style={styles.skillOptionDesc}
                        numberOfLines={1}
                      >
                        {item.description}
                      </Typography>
                    </View>

                    {isSelected ? (
                      <View style={styles.checkCircle}>
                        <Icon name="check" size={14} color="#FFFFFF" />
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              }}
            />
            )}
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F2F5',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  dropdownError: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 20,
    color: '#111827',
  },
  modalCloseButton: {
    padding: 6,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
  },
  skillOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  skillOptionCardSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#8B0000',
  },
  skillIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  skillIconWrapperSelected: {
    backgroundColor: '#8B0000',
  },
  skillOptionName: {
    fontSize: 15,
    color: '#111827',
  },
  skillOptionNameSelected: {
    color: '#8B0000',
  },
  skillOptionDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8B0000',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

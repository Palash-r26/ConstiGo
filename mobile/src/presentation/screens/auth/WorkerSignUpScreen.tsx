import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { AuthInput } from '../../components/AuthInput';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Logo } from '../../components/Logo';
import Icon from 'react-native-vector-icons/Feather';

export const WorkerSignUpScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [tradeSkill, setTradeSkill] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleRegister = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!phone.trim() || !/^[6-9]\d{9}$/.test(phone.trim())) {
      newErrors.phone = 'Enter a valid 10-digit mobile number';
    }
    if (!tradeSkill.trim()) newErrors.tradeSkill = 'Trade / Skill is required';
    if (!experienceYears.trim()) newErrors.experienceYears = 'Years of experience is required';
    if (!city.trim()) newErrors.city = 'City / Location is required';
    if (!password || password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      // Simulate registration flow or connect to backend worker endpoint
      setTimeout(() => {
        setIsLoading(false);
        Alert.alert(
          'Registration Submitted',
          'Thank you for registering as a ConstiGo Worker! Our team will verify your profile shortly.',
          [{ text: 'OK', onPress: () => navigation.navigate('Welcome') }]
        );
      }, 1000);
    } catch (err) {
      setIsLoading(false);
      Alert.alert('Error', 'Worker registration failed. Please try again.');
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
            <Icon name="chevron-left" size={28} color="#182F4B" />
          </TouchableOpacity>
          <View className="flex-1">
            <Typography variant="h2" className="text-center text-xl text-[#182F4B]">
              Worker Registration
            </Typography>
          </View>
        </View>

        {/* Logo and Subtitle */}
        <View className="items-center mb-6">
          <Logo size="md" style={{ marginBottom: 16 }} />
          <Typography
            variant="h1Black"
            className="text-2xl text-center mb-1 text-[#182F4B]"
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
          <AuthInput
            fill="dark"
            placeholder="Full Name"
            leftIcon="user"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (errors.fullName) setErrors({ ...errors, fullName: '' });
            }}
            error={errors.fullName}
          />

          <AuthInput
            fill="dark"
            placeholder="Phone Number"
            leftIcon="phone"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              if (errors.phone) setErrors({ ...errors, phone: '' });
            }}
            error={errors.phone}
          />

          <AuthInput
            fill="dark"
            placeholder="Trade / Skill (e.g. Mason, Electrician, Carpenter)"
            leftIcon="tool"
            value={tradeSkill}
            onChangeText={(text) => {
              setTradeSkill(text);
              if (errors.tradeSkill) setErrors({ ...errors, tradeSkill: '' });
            }}
            error={errors.tradeSkill}
          />

          <AuthInput
            fill="dark"
            placeholder="Years of Experience"
            leftIcon="briefcase"
            keyboardType="numeric"
            value={experienceYears}
            onChangeText={(text) => {
              setExperienceYears(text);
              if (errors.experienceYears) setErrors({ ...errors, experienceYears: '' });
            }}
            error={errors.experienceYears}
          />

          <AuthInput
            fill="dark"
            placeholder="City / Work Location"
            leftIcon="map-pin"
            value={city}
            onChangeText={(text) => {
              setCity(text);
              if (errors.city) setErrors({ ...errors, city: '' });
            }}
            error={errors.city}
          />

          <AuthInput
            fill="dark"
            placeholder="Password"
            leftIcon="lock"
            isPassword
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
            error={errors.password}
          />

          <AuthInput
            fill="dark"
            placeholder="Confirm Password"
            leftIcon="lock"
            isPassword
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
            }}
            error={errors.confirmPassword}
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
          <Typography variant="bodyBold" className="text-sm text-[#182F4B]">
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
    </ScreenWrapper>
  );
};

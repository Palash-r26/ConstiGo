import React from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/Feather';
import { useUserStore } from '../../../application/store/userStore';
import { apiClient } from '../../../infrastructure/api/client';
// import { launchImageLibrary } from 'react-native-image-picker';

export const EditProfileScreen = ({ navigation }: any) => {
  const { profile, fetchProfile } = useUserStore();
  const [isLoading, setIsLoading] = React.useState(false);

  // Form State
  const [firstName, setFirstName] = React.useState(profile?.firstName || '');
  const [lastName, setLastName] = React.useState(profile?.lastName || '');
  const [phone, setPhone] = React.useState(profile?.phone || '');
  const [profileImage, setProfileImage] = React.useState(profile?.profileImage || '');

  const handlePickImage = async () => {
    /*
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.5 });
    if (!result.didCancel && result.assets && result.assets.length > 0) {
      // Mock cloudinary upload for now
      setProfileImage(result.assets[0].uri || '');
    }
    */
    Alert.alert('Info', 'Image picker would open here');
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.patch('/users/me', {
        firstName, lastName, phone, profileImage
      });
      if (res.data.success) {
        await fetchProfile();
        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper className="bg-white">
      <View className="flex-row items-center px-6 py-4 mt-4 mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-left" size={24} color="#182F4B" />
        </TouchableOpacity>
        <Typography variant="h1Black" className="text-2xl text-[#182F4B]">Edit Profile</Typography>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, gap: 20 }} showsVerticalScrollIndicator={false}>
        <View className="items-center mt-4 mb-2">
          <View className="w-24 h-24 rounded-full bg-primary justify-center items-center relative mb-4">
            <Icon name="user" size={48} color="#182F4B" />
            <TouchableOpacity 
              onPress={handlePickImage}
              className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-sm shadow-gray-400"
            >
              <Icon name="camera" size={16} color="#C89338" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="gap-y-4">
          <View>
            <Typography variant="bodyMedium" className="mb-2 text-text-secondary">First Name</Typography>
            <TextInput 
              value={firstName} onChangeText={setFirstName} 
              className="bg-surface rounded-xl p-4 border border-gray-100 font-urbanist" 
            />
          </View>
          
          <View>
            <Typography variant="bodyMedium" className="mb-2 text-text-secondary">Last Name</Typography>
            <TextInput 
              value={lastName} onChangeText={setLastName} 
              className="bg-surface rounded-xl p-4 border border-gray-100 font-urbanist" 
            />
          </View>

          <View>
            <Typography variant="bodyMedium" className="mb-2 text-text-secondary">Phone Number</Typography>
            <TextInput 
              value={phone} onChangeText={setPhone} keyboardType="phone-pad"
              className="bg-surface rounded-xl p-4 border border-gray-100 font-urbanist" 
            />
          </View>

          <View>
            <Typography variant="bodyMedium" className="mb-2 text-text-secondary">Email Address (Locked)</Typography>
            <TextInput 
              value={profile?.email || ''} editable={false}
              className="bg-gray-100 rounded-xl p-4 border border-gray-200 font-urbanist text-gray-500" 
            />
          </View>
        </View>

        <Button 
          title={isLoading ? "Saving..." : "Save Changes"} 
          onPress={handleSave} 
          disabled={isLoading}
          className="mt-6"
        />
      </ScrollView>
    </ScreenWrapper>
  );
};

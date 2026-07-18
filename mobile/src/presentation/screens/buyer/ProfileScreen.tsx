import React from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Button } from '../../components/Button';
import Icon from 'react-native-vector-icons/Feather';
import { useAuthStore } from '../../../application/store/authStore';
import { useUserStore } from '../../../application/store/userStore';
import { useFocusEffect } from '@react-navigation/native';

export const ProfileScreen = ({ navigation }: any) => {
  const logout = useAuthStore((state) => state.logout);
  const { profile, isLoading, fetchProfile } = useUserStore();

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [])
  );

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScreenWrapper className="bg-white">
      {/* Header */}
      <View className="flex-row justify-center items-center px-6 py-4 mt-4 mb-6">
        <Typography variant="h2" className="text-xl">Profile</Typography>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="bg-surface rounded-3xl p-6 shadow-sm shadow-gray-200 mb-8 items-center border border-gray-100">
          <View className="w-24 h-24 rounded-full bg-primary justify-center items-center overflow-hidden mb-4">
            <Icon name="user" size={48} color="#182F4B" />
          </View>
          {isLoading ? (
            <ActivityIndicator size="small" color="#C89338" />
          ) : (
            <>
              <View className="items-center">
                <Typography variant="h2" className="mb-1">{profile ? `${profile.firstName} ${profile.lastName}` : 'User'}</Typography>
                <Typography variant="bodyMedium" className="text-text-secondary mb-1">{profile?.email || 'N/A'}</Typography>
                <Typography variant="bodyMedium" className="text-text-secondary">{profile?.phone || 'N/A'}</Typography>
                <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} className="mt-3 bg-gray-100 px-4 py-1.5 rounded-full">
                  <Typography variant="bodyBold" className="text-primary text-xs">Edit Profile</Typography>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Settings Options */}
        <View className="gap-y-4 mb-8">
          <TouchableOpacity 
            onPress={() => navigation.navigate('Settings')}
            className="flex-row items-center justify-between p-4 bg-surface rounded-2xl border border-gray-100 shadow-sm shadow-gray-100"
          >
            <View className="flex-row items-center">
              <Icon name="settings" size={24} color="#182F4B" className="mr-4" />
              <Typography variant="bodyMedium">Account Settings</Typography>
            </View>
            <Icon name="chevron-right" size={20} color="#8A8A8E" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => navigation.navigate('AddressManager')}
            className="flex-row items-center justify-between p-4 bg-surface rounded-2xl border border-gray-100 shadow-sm shadow-gray-100"
          >
            <View className="flex-row items-center">
              <Icon name="map-pin" size={24} color="#182F4B" className="mr-4" />
              <Typography variant="bodyMedium">Delivery Addresses</Typography>
            </View>
            <Icon name="chevron-right" size={20} color="#8A8A8E" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('MyOrders')}
            className="flex-row items-center justify-between p-4 bg-surface rounded-2xl border border-gray-100 shadow-sm shadow-gray-100"
          >
            <View className="flex-row items-center">
              <Icon name="file-text" size={24} color="#182F4B" className="mr-4" />
              <Typography variant="bodyMedium">My Orders</Typography>
            </View>
            <Icon name="chevron-right" size={20} color="#8A8A8E" />
          </TouchableOpacity>
        </View>

        <Button 
          title="Logout" 
          variant="outline"
          onPress={handleLogout} 
          className="mb-8 rounded-full"
        />
      </ScrollView>
    </ScreenWrapper>
  );
};

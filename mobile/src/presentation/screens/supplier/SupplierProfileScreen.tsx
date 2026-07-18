import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Button } from '../../components/Button';
import Icon from 'react-native-vector-icons/Feather';
import { useAuthStore } from '../../../application/store/authStore';

export const SupplierProfileScreen = ({ navigation }: any) => {
  const logout = useAuthStore((state) => state.logout);

  // Demo supplier data
  const supplier = {
    companyName: 'BuildCorp Supplies',
    owner: 'Raj Kumar',
    email: 'raj.kumar@buildcorp.com',
    phone: '+91 9876543210'
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScreenWrapper className="bg-white">
      {/* Header */}
      <View className="flex-row justify-center items-center px-6 py-4 mt-4 mb-6">
        <Typography variant="h2" className="text-xl">Business Profile</Typography>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="bg-surface rounded-3xl p-6 shadow-sm shadow-gray-200 mb-8 items-center border border-gray-100">
          <View className="w-24 h-24 rounded-full bg-primary justify-center items-center overflow-hidden mb-4">
            <Icon name="briefcase" size={48} color="#12294A" />
          </View>
          <Typography variant="h2" className="mb-1 text-center">{supplier.companyName}</Typography>
          <Typography variant="bodyMedium" className="text-text-secondary">{supplier.owner}</Typography>
          <Typography variant="bodyMedium" className="text-text-secondary">{supplier.email}</Typography>
          <Typography variant="bodyMedium" className="text-text-secondary">{supplier.phone}</Typography>
        </View>

        {/* Settings Options */}
        <View className="gap-y-4 mb-8">
          <TouchableOpacity className="flex-row items-center justify-between p-4 bg-surface rounded-2xl border border-gray-100 shadow-sm shadow-gray-100">
            <View className="flex-row items-center">
              <Icon name="settings" size={24} color="#1C1C1C" className="mr-4" />
              <Typography variant="bodyMedium">Business Settings</Typography>
            </View>
            <Icon name="chevron-right" size={20} color="#8A8A8E" />
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center justify-between p-4 bg-surface rounded-2xl border border-gray-100 shadow-sm shadow-gray-100">
            <View className="flex-row items-center">
              <Icon name="credit-card" size={24} color="#1C1C1C" className="mr-4" />
              <Typography variant="bodyMedium">Bank & Payments</Typography>
            </View>
            <Icon name="chevron-right" size={20} color="#8A8A8E" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between p-4 bg-surface rounded-2xl border border-gray-100 shadow-sm shadow-gray-100">
            <View className="flex-row items-center">
              <Icon name="bar-chart-2" size={24} color="#1C1C1C" className="mr-4" />
              <Typography variant="bodyMedium">Sales Reports</Typography>
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

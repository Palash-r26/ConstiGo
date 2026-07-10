import React from 'react';
import { View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Logo } from '../../components/Logo';
import Icon from 'react-native-vector-icons/Feather';
import { apiClient } from '../../../infrastructure/api/client';
import { useFocusEffect } from '@react-navigation/native';

export const InventoryDashboardScreen = ({ navigation }: any) => {
  const [inventory, setInventory] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchInventory = async () => {
    try {
      const response = await apiClient.get('/products/inventory');
      if (response.data.success) {
        setInventory(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchInventory();
    }, [])
  );

  const toggleAvailability = async (id: string) => {
    try {
      // Optimistic update
      setInventory((prev) => 
        prev.map((item) => 
          item._id === id ? { ...item, isAvailable: !item.isAvailable } : item
        )
      );
      await apiClient.patch(`/products/${id}/availability`);
    } catch (error) {
      console.error('Failed to toggle availability:', error);
      // Revert on failure
      fetchInventory();
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Top Header: avatar left, logo centered, bell right (per Supplier.pdf) */}
        <View className="flex-row justify-between items-center px-6 py-4">
          <View className="w-12 h-12 rounded-full bg-primary justify-center items-center overflow-hidden">
            <Icon name="user" size={24} color="#FFF" />
          </View>
          <Logo size="sm" />
          <TouchableOpacity>
            <Icon name="bell" size={24} color="#1C1C1C" />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View className="bg-surface mx-6 rounded-3xl p-6 shadow-sm shadow-gray-200 mb-6 mt-2">
          <Typography variant="h1" style={{ fontSize: 26 }} className="mb-2">My Inventory</Typography>
          <Typography variant="bodyDefault" className="text-text-secondary mb-6">
            Manage your material stock, pricing, and visibility
          </Typography>
          <Button 
            title="+ Add New Material" 
            onPress={() => navigation.navigate('AddMaterial')} 
          />
        </View>

        {/* Search & Filters */}
        <View className="bg-surface mx-6 rounded-3xl p-5 shadow-sm shadow-gray-200 mb-6">
          <View className="flex-row items-center bg-input-bg rounded-full px-5 py-3 mb-4">
            <Icon name="search" size={20} color="#8A8A8E" className="mr-2" />
            <Typography variant="bodyDefault" className="text-text-secondary flex-1">Search</Typography>
          </View>
          <View className="flex-row justify-between gap-x-2">
            <TouchableOpacity className="flex-1 bg-primary rounded-full py-2 items-center">
              <Typography variant="bodyMedium" className="text-white">All Items</Typography>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-input-bg rounded-full py-2 items-center">
              <Typography variant="bodyMedium" className="text-text-secondary">In stock</Typography>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-input-bg rounded-full py-2 items-center">
              <Typography variant="bodyMedium" className="text-text-secondary">out of stock</Typography>
            </TouchableOpacity>
          </View>
        </View>

        {/* Inventory List */}
        <View className="px-6 gap-y-4">
          {inventory.map((item) => (
            <View key={item._id} className="bg-surface rounded-3xl p-5 shadow-sm shadow-gray-200">
              <View className="flex-row gap-x-4 mb-4">
                <View className="w-20 h-20 bg-primary rounded-2xl opacity-80" />
                <View className="flex-1">
                  <View className="flex-row justify-between items-start">
                    <Typography variant="bodyBold" className="text-lg flex-1 leading-tight mb-1">{item.name}</Typography>
                    <Icon name="check-circle" size={18} color="#28A745" className="ml-2" />
                  </View>
                  <Typography variant="bodySmall" className="text-xs">Grade : {item.grade || 'Standard'}</Typography>
                </View>
              </View>

              <View className="flex-row gap-x-4 mb-4">
                <View className="flex-1 border border-gray-200 rounded-2xl p-3">
                  <Typography variant="bodySmall" className="text-[10px] text-text-secondary mb-1">Price per qty.</Typography>
                  <Typography variant="h2" style={{ fontSize: 18 }}>₹ {item.price}</Typography>
                </View>
                <View className="flex-1 border border-gray-200 rounded-2xl p-3">
                  <Typography variant="bodySmall" className="text-[10px] text-text-secondary mb-1">Stock qty.</Typography>
                  <Typography variant="h2" style={{ fontSize: 18 }}>{item.stockQty}</Typography>
                </View>
              </View>

              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Switch 
                    value={item.isAvailable}
                    onValueChange={() => toggleAvailability(item._id)} 
                    trackColor={{ false: "#D1D1D6", true: "#82C341" }}
                    thumbColor="#FFFFFF"
                  />
                  <Typography variant="bodyMedium" className="ml-2 text-text-primary text-xs">
                    Available in Market
                  </Typography>
                </View>
                <TouchableOpacity className="bg-primary rounded-full px-6 py-2">
                  <Typography variant="bodyMedium" className="text-white text-xs">Update</Typography>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
};

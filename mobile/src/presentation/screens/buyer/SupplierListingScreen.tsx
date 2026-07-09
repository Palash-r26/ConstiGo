import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/Feather';
import { apiClient } from '../../../infrastructure/api/client';

export const SupplierListingScreen = ({ route, navigation }: any) => {
  const { product } = route.params || {};
  const [suppliers, setSuppliers] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await apiClient.get(`/products${product ? `?keyword=${product.name}` : ''}`);
        if (response.data.success) {
          setSuppliers(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch suppliers:', error);
      }
    };
    fetchSuppliers();
  }, [product]);

  return (
    <ScreenWrapper>
      {/* Top Header */}
      <View className="flex-row justify-between items-center px-6 py-4 mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={28} color="#1C1C1C" />
        </TouchableOpacity>
        <View className="flex-row items-center gap-x-2">
          <Typography variant="h2" className="text-primary font-outfit text-xl">ConstiGo</Typography>
        </View>
        <TouchableOpacity>
          <Icon name="bell" size={24} color="#1C1C1C" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, gap: 16 }} showsVerticalScrollIndicator={false}>
        {suppliers.map((item) => (
          <TouchableOpacity 
            key={item._id} 
            onPress={() => navigation.navigate('SupplierDetails', { product: item })}
            className="bg-surface rounded-3xl p-5 shadow-sm shadow-gray-200"
          >
            <View className="flex-row gap-x-4 mb-4">
              <View className="w-20 h-20 bg-primary rounded-2xl" />
              <View className="flex-1 justify-center">
                <View className="flex-row items-start">
                  <Typography variant="bodyLarge" className="font-bold flex-1 leading-tight">
                    {item.supplier?.businessInfo?.companyName || `${item.supplier?.firstName} ${item.supplier?.lastName}`}
                  </Typography>
                  <Icon name="check-circle" size={16} color="#28A745" className="ml-2 mt-1" />
                </View>
                <View className="flex-row items-center mt-2 gap-x-4">
                  <View className="flex-row items-center">
                    <Icon name="map-pin" size={12} color="#FF4B3A" />
                    <Typography variant="bodySmall" className="ml-1 text-xs">2.5 km</Typography>
                  </View>
                  <View className="flex-row items-center">
                    <Icon name="star" size={12} color="#FFC107" />
                    <Typography variant="bodySmall" className="ml-1 text-xs">4.5 (120)</Typography>
                  </View>
                </View>
              </View>
            </View>

            <View className="h-[1px] bg-input-bg w-full mb-4" />

            <Typography variant="bodySmall" className="text-xs mb-1">Price per {item.unit || 'Unit'}</Typography>
            <View className="flex-row justify-between items-end mb-4">
              <View>
                <Typography variant="h1" className="text-2xl text-[#28A745]">₹ {item.price}</Typography>
                <Typography variant="bodySmall" className="text-[10px]">Product: {item.name}</Typography>
              </View>
              <TouchableOpacity className="bg-primary rounded-full px-6 py-2">
                <Typography className="text-white font-medium">Add to Cart</Typography>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-x-4">
              <TouchableOpacity className="flex-1 bg-input-bg rounded-full py-3 items-center">
                <Typography variant="bodySmall" className="font-medium text-[#1C1C1C]">More Details</Typography>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-input-bg rounded-full py-3 items-center">
                <Typography variant="bodySmall" className="font-medium text-[#1C1C1C]">Compare</Typography>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
};

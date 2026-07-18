import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Logo } from '../../components/Logo';
import Icon from 'react-native-vector-icons/Feather';
import { apiClient } from '../../../infrastructure/api/client';
import { useCartStore } from '../../../application/store/cartStore';

export const SupplierListingScreen = ({ route, navigation }: any) => {
  const { product } = route.params || {};
  const [suppliers, setSuppliers] = React.useState<any[]>([]);
  const { addToCart } = useCartStore();

  React.useEffect(() => {
    const fetchSuppliers = async () => {
      // Inject demo supplier data as requested
      const mockSuppliers = [
        { 
          _id: '1', 
          name: 'UltraTech Cement', 
          price: 350.00, 
          unit: 'bag',
          supplier: { businessInfo: { companyName: 'BuildCorp Supplies' }, firstName: 'Raj', lastName: 'Kumar' }
        },
        { 
          _id: '2', 
          name: 'Tata TMT Steel', 
          price: 5500.00, 
          unit: 'ton',
          supplier: { businessInfo: { companyName: 'Metro Steel Distributors' }, firstName: 'Amit', lastName: 'Singh' }
        },
      ];
      setSuppliers(mockSuppliers);
    };
    fetchSuppliers();
  }, [product]);

  return (
    <ScreenWrapper>
      {/* Top Header */}
      <View className="flex-row justify-between items-center px-6 py-4 mt-2 mb-2">
        <View className="w-12 h-12 rounded-full bg-primary justify-center items-center overflow-hidden">
          <Icon name="user" size={24} color="#182F4B" />
        </View>
        <Logo size="sm" />
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Icon name="bell" size={24} color="#F5A623" />
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
                  <Typography variant="bodyBold" className="text-lg flex-1 leading-tight">
                    {item.supplier?.businessInfo?.companyName || `${item.supplier?.firstName} ${item.supplier?.lastName}`}
                  </Typography>
                  <Icon name="check-circle" size={16} color="#28A745" className="ml-2 mt-1" />
                </View>
                <View className="flex-row items-center mt-2 gap-x-4">
                  <View className="flex-row items-center">
                    <Icon name="map-pin" size={12} color="#C89338" />
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
              <TouchableOpacity 
                className="bg-primary rounded-full px-6 py-2"
                onPress={() => {
                  addToCart(item._id, 1);
                  // Optional: show a toast or feedback
                }}
              >
                <Typography variant="bodyMedium" className="text-[#182F4B]">Add to Cart</Typography>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-x-4">
              <TouchableOpacity className="flex-1 bg-input-bg rounded-full py-3 items-center">
                <Typography variant="bodyMedium" className="text-text-primary text-sm">More Details</Typography>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-input-bg rounded-full py-3 items-center">
                <Typography variant="bodyMedium" className="text-text-primary text-sm">Compare</Typography>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
};

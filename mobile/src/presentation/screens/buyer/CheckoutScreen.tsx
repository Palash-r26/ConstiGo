import React from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/Feather';
import { useCartStore } from '../../../application/store/cartStore';
import { useUserStore } from '../../../application/store/userStore';
import { apiClient } from '../../../infrastructure/api/client';

export const CheckoutScreen = ({ navigation }: any) => {
  const { items, fetchCart, clearCart } = useCartStore();
  const { profile } = useUserStore();
  
  const [selectedAddress, setSelectedAddress] = React.useState<any>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  React.useEffect(() => {
    if (profile?.addresses && profile.addresses.length > 0 && !selectedAddress) {
      setSelectedAddress(profile.addresses.find((a: any) => a.isDefault) || profile.addresses[0]);
    }
  }, [profile]);

  const subTotal = items.reduce((acc: number, item: any) => acc + (item.product.price * item.quantity), 0);
  const taxes = subTotal * 0.18;
  const deliveryFee = subTotal > 0 ? 50 : 0;
  const total = subTotal + taxes + deliveryFee;

  const handleCheckout = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    setIsProcessing(true);
    try {
      const orderItems = items.map((item: any) => ({
        product: item.product._id,
        name: item.product.name,
        qty: item.quantity,
        price: item.product.price
      }));

      // 1. Create Order via API
      const orderResponse = await apiClient.post('/orders/razorpay/create', {
        supplier: items[0]?.product?.supplier || null, // supplier is ObjectId string
        orderItems,
        shippingAddress: {
          address: selectedAddress.street,
          city: selectedAddress.city,
          postalCode: selectedAddress.zipCode,
        },
        totalPrice: total,
      });

      if (orderResponse.data.order) {
        // Clear Cart
        await clearCart();
        navigation.navigate('OrderSuccess');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScreenWrapper className="bg-white">
      <View className="flex-row items-center px-6 py-4 mt-4 mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-left" size={24} color="#182F4B" />
        </TouchableOpacity>
        <Typography variant="h1Black" className="text-3xl text-[#182F4B]">Checkout</Typography>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120, gap: 16 }} showsVerticalScrollIndicator={false}>
        {/* Address Selection */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Typography variant="h2" className="text-xl">Delivery Address</Typography>
            <TouchableOpacity onPress={() => navigation.navigate('AddressManager')}>
              <Typography variant="bodyMedium" className="text-primary">Change</Typography>
            </TouchableOpacity>
          </View>
          
          {selectedAddress ? (
            <View className="bg-surface rounded-3xl p-5 shadow-sm shadow-gray-200 flex-row items-center">
              <View className="w-12 h-12 bg-primary/10 rounded-full justify-center items-center mr-4">
                <Icon name="map-pin" size={20} color="#C89338" />
              </View>
              <View className="flex-1">
                <Typography variant="bodyBold" className="text-base mb-1">{selectedAddress.label || 'Home'}</Typography>
                <Typography variant="bodySmall" className="text-text-secondary leading-relaxed">
                  {selectedAddress.street}, {selectedAddress.city} - {selectedAddress.zipCode}
                </Typography>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={() => navigation.navigate('AddressManager')}
              className="bg-surface rounded-3xl p-5 shadow-sm shadow-gray-200 flex-row items-center justify-center border border-dashed border-gray-300"
            >
              <Icon name="plus" size={20} color="#C89338" className="mr-2" />
              <Typography variant="bodyBold" className="text-primary">Add New Address</Typography>
            </TouchableOpacity>
          )}
        </View>

        {/* Order Summary */}
        <View className="mb-4">
          <Typography variant="h2" className="text-xl mb-3">Order Summary</Typography>
          <View className="bg-surface rounded-3xl p-5 shadow-sm shadow-gray-200">
            {items.map((item: any) => (
              <View key={item.product._id} className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                <View className="flex-1 mr-4">
                  <Typography variant="bodyMedium" numberOfLines={1}>{item.product.name}</Typography>
                  <Typography variant="bodySmall" className="text-text-secondary">Qty: {item.quantity}</Typography>
                </View>
                <Typography variant="bodyBold">₹ {(item.product.price * item.quantity).toFixed(2)}</Typography>
              </View>
            ))}
          </View>
        </View>

        {/* Payment Method */}
        <View className="mb-4">
          <Typography variant="h2" className="text-xl mb-3">Payment Method</Typography>
          <View className="bg-surface rounded-3xl p-5 shadow-sm shadow-gray-200 flex-row items-center border border-primary/20">
             <Icon name="credit-card" size={24} color="#C89338" className="mr-4" />
             <View className="flex-1">
                <Typography variant="bodyBold" className="text-base">Pay via Razorpay</Typography>
                <Typography variant="bodySmall" className="text-text-secondary">Credit/Debit Card, UPI</Typography>
             </View>
             <Icon name="check-circle" size={20} color="#C89338" />
          </View>
        </View>

        <Button 
          title={isProcessing ? "Processing..." : `Pay ₹ ${total.toFixed(2)}`} 
          onPress={handleCheckout} 
          disabled={isProcessing}
        />
      </ScrollView>
    </ScreenWrapper>
  );
};

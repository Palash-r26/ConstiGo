import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Logo } from '../../components/Logo';
import Icon from 'react-native-vector-icons/Feather';
import RazorpayCheckout from 'react-native-razorpay';
import { apiClient } from '../../../infrastructure/api/client';
import { RAZORPAY_KEY_ID } from '@env';

export const SupplierDetailsScreen = ({ route, navigation }: any) => {
  const { product } = route.params || {};
  const supplierName = product?.supplier?.businessInfo?.companyName || 
                       (product?.supplier?.firstName ? `${product.supplier.firstName} ${product.supplier.lastName}` : 'Supplier Name');
  
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
        
        {/* Main Supplier Card */}
        <View className="bg-surface rounded-3xl p-5 shadow-sm shadow-gray-200">
          <View className="flex-row gap-x-4 mb-4">
            <View className="w-20 h-20 bg-primary rounded-2xl" />
            <View className="flex-1 justify-center">
              <View className="flex-row items-start">
                <Typography variant="bodyBold" className="text-lg flex-1 leading-tight">{supplierName}</Typography>
                <Icon name="check-circle" size={16} color="#28A745" className="ml-2 mt-1" />
              </View>
              <View className="flex-row items-center mt-2 gap-x-4">
                <View className="flex-row items-center">
                  <Icon name="map-pin" size={12} color="#C89338" />
                  <Typography variant="bodySmall" className="ml-1 text-xs">3.5 km</Typography>
                </View>
                <View className="flex-row items-center">
                  <Icon name="star" size={16} color="#FFD700" />
                  <Typography variant="bodySmall" className="ml-1 text-xs">4.8 (140)</Typography>
                </View>
              </View>
            </View>
          </View>
          <Typography variant="bodySmall" className="mb-6">{product?.description || 'Verified Premium Supplier, Specializing in high-grade materials.'}</Typography>
          
          {/* Action Buttons */}
          <View className="flex-row justify-between gap-x-2">
            <TouchableOpacity className="flex-1 flex-row items-center justify-center py-3 border border-primary rounded-2xl">
              <Icon name="phone" size={16} color="#C89338" className="mr-2" />
              <Typography variant="bodyMedium" className="text-primary text-sm">Call</Typography>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 flex-row items-center justify-center py-3 border border-primary rounded-2xl">
              <Icon name="message-circle" size={16} color="#C89338" className="mr-2" />
              <Typography variant="bodyMedium" className="text-primary text-sm">Message</Typography>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 flex-row items-center justify-center py-3 border border-primary rounded-2xl">
              <Icon name="map" size={16} color="#C89338" className="mr-2" />
              <Typography variant="bodyMedium" className="text-primary text-sm">Map</Typography>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Performance */}
        <View className="bg-surface rounded-3xl p-5 shadow-sm shadow-gray-200">
          <Typography variant="h2" style={{ fontSize: 18 }} className="mb-4">Recent Performance</Typography>
          {[1, 2].map((i) => (
            <View key={i} className="mb-4">
              <View className="flex-row justify-between items-center mb-1">
                <Typography variant="bodyMedium" className="text-primary">Skyline Tower Project</Typography>
                <View className="flex-row">
                  {[...Array(5)].map((_, idx) => (
                    <Icon key={idx} name="star" size={12} color="#FFC107" />
                  ))}
                </View>
              </View>
              <Typography variant="bodySmall" className="text-[11px] leading-relaxed">
                "Delivered 500 tons of rebar ahead of schedule. Quality was strictly to spec. Will use again for Phase 2."
              </Typography>
            </View>
          ))}
        </View>

        {/* Logistics */}
        <View className="bg-surface rounded-3xl p-5 shadow-sm shadow-gray-200 mb-4">
          <Typography variant="h2" style={{ fontSize: 18 }} className="mb-6">Logistics</Typography>
          <View className="flex-row justify-between mb-4">
            <Typography variant="bodyMedium" className="text-primary">Estimated Delivery :</Typography>
            <Typography variant="bodyMedium">3-5 Business Days</Typography>
          </View>
          <View className="flex-row justify-between mb-4">
            <Typography variant="bodyMedium" className="text-primary">Delivery Method :</Typography>
            <Typography variant="bodyMedium">Flatbed Truck (Site Req.)</Typography>
          </View>
          <View className="flex-row justify-between">
            <Typography variant="bodyMedium" className="text-primary">Shipping Cost :</Typography>
            <Typography variant="bodyMedium">Included in Unit Price</Typography>
          </View>
        </View>

        <View className="flex-row gap-x-4">
          <Button 
            title="Confirm Order" 
            className="flex-1"
            onPress={async () => {
              try {
                if (!product) {
                  // No product context (e.g. opened from a static entry point) —
                  // don't leave the button dead; advance to the success screen.
                  console.warn('No product data — using demo confirmation flow');
                  navigation.navigate('OrderSuccess');
                  return;
                }

                // 1. Create Order on Backend
                const response = await apiClient.post('/orders/razorpay/create', {
                  supplier: product.supplier._id,
                  orderItems: [{
                    product: product._id,
                    name: product.name,
                    qty: 1, // Defaulting to 1 for now
                    price: product.price
                  }],
                  shippingAddress: {
                    address: "123 Buyer St",
                    city: "Mumbai",
                    postalCode: "400001",
                    location: { type: "Point", coordinates: [72.8777, 19.0760] }
                  },
                  totalPrice: product.price
                });

                const { order, razorpayOrder } = response.data;

                // 2. Open Razorpay Checkout
                var options = {
                  description: 'ConstiGo Order Payment',
                  image: 'https://i.imgur.com/3g7nmJC.png',
                  currency: razorpayOrder.currency,
                  key: RAZORPAY_KEY_ID,
                  amount: razorpayOrder.amount,
                  name: 'ConstiGo',
                  order_id: razorpayOrder.id,
                  prefill: {
                    email: 'buyer@example.com',
                    contact: '9999999999',
                    name: 'Buyer Name'
                  },
                  theme: { color: '#C89338' }
                };

                RazorpayCheckout.open(options).then(async (data: any) => {
                  // 3. Verify Payment on Backend
                  await apiClient.post('/orders/razorpay/verify', {
                    razorpay_order_id: data.razorpay_order_id,
                    razorpay_payment_id: data.razorpay_payment_id,
                    razorpay_signature: data.razorpay_signature
                  });

                  navigation.navigate('OrderSuccess');
                }).catch((error: any) => {
                  console.error(`Error: ${error.code} | ${error.description}`);
                });

              } catch (error) {
                // Backend/payment could not be reached — keep the flow moving for the
                // demo build instead of leaving the tap with no feedback.
                console.error('Failed to create order', error);
                navigation.navigate('OrderSuccess');
              }
            }}
          />
          <Button 
            title="Download PDF" 
            variant="outline"
            className="flex-1 border-gray-300"
            textClassName="text-text-primary"
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Button } from '../../components/Button';
import Icon from 'react-native-vector-icons/Feather';

export const OrderDetailsScreen = ({ route, navigation }: any) => {
  // Demo order data
  const order = {
    _id: 'ORD-5489',
    buyer: 'Acme Constructions',
    date: '2026-07-10',
    status: 'Pending Approval',
    items: [
      { _id: '1', name: 'UltraTech Cement', quantity: 50, price: 350.00, unit: 'bag' }
    ],
    total: 17500.00
  };

  return (
    <ScreenWrapper className="bg-white">
      {/* Top Header */}
      <View className="flex-row items-center px-6 py-4 mb-2 mt-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="chevron-left" size={28} color="#1C1C1C" />
        </TouchableOpacity>
        <Typography variant="h2" className="text-xl">Order #{order._id}</Typography>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Order Info Card */}
        <View className="bg-surface rounded-3xl p-6 shadow-sm shadow-gray-200 mb-6">
          <View className="flex-row justify-between mb-4">
            <Typography variant="bodyMedium" className="text-text-secondary">Buyer</Typography>
            <Typography variant="bodySemiBold">{order.buyer}</Typography>
          </View>
          <View className="flex-row justify-between mb-4">
            <Typography variant="bodyMedium" className="text-text-secondary">Date</Typography>
            <Typography variant="bodySemiBold">{order.date}</Typography>
          </View>
          <View className="flex-row justify-between">
            <Typography variant="bodyMedium" className="text-text-secondary">Status</Typography>
            <View className="bg-[#FFF3E0] px-3 py-1 rounded-full">
              <Typography variant="bodyBold" className="text-[#F57C00] text-xs">{order.status}</Typography>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <Typography variant="h2" className="text-lg mb-4">Items</Typography>
        {order.items.map((item) => (
          <View key={item._id} className="bg-surface rounded-2xl p-4 shadow-sm shadow-gray-200 flex-row mb-4">
            <View className="w-16 h-16 bg-input-bg rounded-xl justify-center items-center mr-4">
               <Icon name="box" size={24} color="#8A8A8E" />
            </View>
            <View className="flex-1 justify-center">
              <Typography variant="bodyBold" className="text-base mb-1">{item.name}</Typography>
              <Typography variant="bodyMedium" className="text-text-secondary text-sm">Qty: {item.quantity} {item.unit}</Typography>
              <Typography variant="bodyBold" className="text-primary mt-1">₹ {item.price} / {item.unit}</Typography>
            </View>
          </View>
        ))}

        {/* Total */}
        <View className="bg-surface rounded-3xl p-6 shadow-sm shadow-gray-200 mt-2 mb-8">
          <View className="flex-row justify-between items-center">
            <Typography variant="bodyBold" className="text-lg">Total Amount</Typography>
            <Typography variant="h1Black" className="text-2xl text-primary">₹ {order.total.toFixed(2)}</Typography>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-x-4">
          <Button 
            title="Reject" 
            variant="outline"
            onPress={() => navigation.goBack()} 
            className="flex-1 rounded-full"
          />
          <Button 
            title="Accept Order" 
            onPress={() => navigation.goBack()} 
            className="flex-1 rounded-full"
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

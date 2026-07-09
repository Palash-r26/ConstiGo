import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/Feather';

export const MyOrdersScreen = ({ navigation }: any) => {
  const orders = [
    { id: 1, buyerName: 'Vikas Pawaar', grade: 'Grade A : High Quality Cement', price: '385.00', qty: '20 Bags' },
    { id: 2, buyerName: 'Vikas Pawaar', grade: 'Grade A : High Quality Steel', price: '250.00', qty: '05 Bundle' },
  ];

  return (
    <ScreenWrapper>
      {/* Top Header */}
      <View className="flex-row justify-between items-center px-6 py-4 mb-2">
        <TouchableOpacity className="w-8 h-8 rounded-full bg-primary justify-center items-center">
          <Icon name="user" size={16} color="#FFF" />
        </TouchableOpacity>
        <View className="flex-row items-center gap-x-2">
          <Typography variant="h2" className="text-primary font-outfit text-xl">ConstiGo</Typography>
        </View>
        <TouchableOpacity>
          <Icon name="bell" size={24} color="#1C1C1C" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, gap: 16 }} showsVerticalScrollIndicator={false}>
        
        {/* Title Card */}
        <View className="bg-surface rounded-full py-4 items-center shadow-sm shadow-gray-200 mb-2 mt-2">
          <Typography variant="h1" className="text-2xl">My Orders</Typography>
        </View>

        {/* Order Cards */}
        {orders.map((order) => (
          <View key={order.id} className="bg-surface rounded-3xl p-5 shadow-sm shadow-gray-200">
            <View className="flex-row gap-x-4 mb-5">
              <View className="w-20 h-20 bg-primary rounded-2xl opacity-80" />
              <View className="flex-1 justify-center">
                <Typography variant="bodyLarge" className="font-bold mb-1">{order.buyerName}</Typography>
                <Typography variant="bodySmall" className="text-[11px] leading-relaxed text-text-secondary">{order.grade}</Typography>
              </View>
            </View>

            <View className="flex-row gap-x-4">
              <View className="flex-1 bg-input-bg rounded-2xl py-3 px-4">
                <Typography variant="h2" className="text-base leading-tight">₹ {order.price}</Typography>
                <Typography variant="bodySmall" className="text-[10px]">Price Per Bag</Typography>
              </View>
              <View className="flex-1 bg-input-bg rounded-2xl py-3 px-4">
                <Typography variant="h2" className="text-base leading-tight">{order.qty}</Typography>
                <Typography variant="bodySmall" className="text-[10px]">Total Stock Qty.</Typography>
              </View>
            </View>
          </View>
        ))}

      </ScrollView>
    </ScreenWrapper>
  );
};

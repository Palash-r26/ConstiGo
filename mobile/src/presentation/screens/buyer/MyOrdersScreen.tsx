import React from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/Feather';
import { apiClient } from '../../../infrastructure/api/client';
import { useFocusEffect } from '@react-navigation/native';

export const MyOrdersScreen = ({ navigation }: any) => {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [])
  );

  const fetchOrders = async () => {
    try {
      const res = await apiClient.get('/orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'text-orange-500 bg-orange-50';
      case 'ACCEPTED': return 'text-blue-500 bg-blue-50';
      case 'DISPATCHED': return 'text-purple-500 bg-purple-50';
      case 'DELIVERED': return 'text-green-500 bg-green-50';
      case 'CANCELLED': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <ScreenWrapper className="bg-white">
      <View className="flex-row items-center px-6 py-4 mt-4 mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-left" size={24} color="#1C1C1C" />
        </TouchableOpacity>
        <Typography variant="h1Black" className="text-3xl text-black">My Orders</Typography>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#DFA128" />
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Icon name="package" size={64} color="#E5E5EA" className="mb-4" />
          <Typography variant="h2" className="text-xl text-text-secondary">No orders yet</Typography>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, gap: 16 }} showsVerticalScrollIndicator={false}>
          {orders.map((order: any) => (
            <TouchableOpacity 
              key={order._id} 
              onPress={() => navigation.navigate('OrderDetails', { orderId: order._id })}
              className="bg-surface rounded-3xl p-5 shadow-sm shadow-gray-200"
            >
              <View className="flex-row justify-between items-center mb-3">
                <Typography variant="bodyBold" className="text-base">Order #{order._id.substring(0, 8).toUpperCase()}</Typography>
                <View className={`px-3 py-1 rounded-full ${getStatusColor(order.status).split(' ')[1]}`}>
                  <Typography variant="bodySmall" className={getStatusColor(order.status).split(' ')[0]}>{order.status}</Typography>
                </View>
              </View>
              
              <View className="border-t border-gray-100 py-3 mb-1">
                {order.orderItems.map((item: any, index: number) => (
                   <View key={index} className="flex-row justify-between items-center mb-1">
                     <Typography variant="bodyMedium" className="text-text-secondary flex-1" numberOfLines={1}>{item.qty}x {item.name}</Typography>
                     <Typography variant="bodyMedium" className="text-text-secondary">₹{item.price}</Typography>
                   </View>
                ))}
              </View>

              <View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
                <Typography variant="bodyMedium" className="text-text-secondary">Total Amount</Typography>
                <Typography variant="bodyBold" className="text-primary text-lg">₹ {order.totalPrice.toFixed(2)}</Typography>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </ScreenWrapper>
  );
};

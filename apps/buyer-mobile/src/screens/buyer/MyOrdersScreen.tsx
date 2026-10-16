import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Typography, ScreenWrapper, apiClient } from '@constigo/shared';
import Icon from 'react-native-vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';

export const MyOrdersScreen = ({ navigation }: any) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const res = await apiClient.get('/orders');
      if (res.data && res.data.success) {
        setOrders(res.data.data || []);
      } else if (Array.isArray(res.data)) {
        setOrders(res.data);
      } else {
        setOrders([]);
      }
    } catch (error: any) {
      console.warn('[BuyerMyOrders] Fetch orders failed:', error);
      setLoadError(error?.response?.data?.message || error?.message || 'Unable to retrieve your orders');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const getStatusColor = (status: string) => {
    switch (status) {
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
          <Icon name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Typography variant="h1Black" className="text-3xl text-[#111827]">My Orders</Typography>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#8B0000" />
          <Typography variant="bodySmall" style={{ color: '#64748B', marginTop: 12 }}>
            Loading your orders...
          </Typography>
        </View>
      ) : loadError ? (
        <View className="flex-1 justify-center items-center px-6">
          <Icon name="alert-circle" size={54} color="#EF4444" />
          <Typography variant="h2" style={{ marginTop: 14, color: '#111827' }}>
            Unable to load orders
          </Typography>
          <Typography variant="bodySmall" style={{ color: '#64748B', textAlign: 'center', marginTop: 4 }}>
            {loadError}
          </Typography>
          <TouchableOpacity
            onPress={fetchOrders}
            style={{ marginTop: 18, backgroundColor: '#8B0000', paddingHorizontal: 22, paddingVertical: 10, borderRadius: 20 }}
          >
            <Typography variant="bodyMedium" style={{ color: '#FFFFFF' }}>Retry</Typography>
          </TouchableOpacity>
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Icon name="package" size={64} color="#E5E5EA" />
          <Typography variant="h2" className="text-xl text-text-secondary" style={{ marginTop: 12 }}>
            No orders yet
          </Typography>
          <Typography variant="bodySmall" style={{ color: '#94A3B8', textAlign: 'center', marginTop: 4 }}>
            Your placed material and equipment orders will appear here.
          </Typography>
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
                <Typography variant="bodyBold" className="text-base">Order #{order._id ? order._id.substring(0, 8).toUpperCase() : 'N/A'}</Typography>
                <View className={`px-3 py-1 rounded-full ${getStatusColor(order.status).split(' ')[1]}`}>
                  <Typography variant="bodySmall" className={getStatusColor(order.status).split(' ')[0]}>{order.status}</Typography>
                </View>
              </View>
              
              <View className="border-t border-gray-100 py-3 mb-1">
                {(order.orderItems || []).map((item: any, index: number) => (
                  <View key={index} className="flex-row justify-between items-center mb-1">
                    <Typography variant="bodyMedium" className="text-text-secondary flex-1" numberOfLines={1}>{item.qty}x {item.name}</Typography>
                    <Typography variant="bodyMedium" className="text-text-secondary">₹ {Number(item.price || 0).toLocaleString('en-IN')}</Typography>
                  </View>
                ))}
              </View>

              <View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
                <Typography variant="bodyMedium" className="text-text-secondary">Total Amount</Typography>
                <Typography variant="bodyBold" className="text-primary text-lg">₹ {Number(order.totalPrice || 0).toLocaleString('en-IN')}</Typography>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </ScreenWrapper>
  );
};

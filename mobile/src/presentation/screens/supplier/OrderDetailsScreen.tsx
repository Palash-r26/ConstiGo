import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Button } from '../../components/Button';
import Icon from 'react-native-vector-icons/Feather';

export const OrderDetailsScreen = ({ route, navigation }: any) => {
  const incomingOrder = route?.params?.order;

  const [orderStatus, setOrderStatus] = useState<string>(
    incomingOrder?.status === 'accepted'
      ? 'Accepted'
      : incomingOrder?.status === 'declined'
      ? 'Declined'
      : 'Pending Approval'
  );

  const order = {
    _id: incomingOrder?._id || incomingOrder?.id || 'ORD-1092',
    buyer: incomingOrder?.buyerName || incomingOrder?.badge || 'Acme Constructions Ltd',
    date: incomingOrder?.date || 'Today, 11:30 AM',
    distance: incomingOrder?.distance || '3.5 km far',
    items: [
      {
        _id: '1',
        name: incomingOrder?.title || 'Jindal Red Bricks',
        subType: incomingOrder?.subType || 'Type I/II Red Clay',
        quantity: incomingOrder?.unitValue || '2000 Pcs',
        price: incomingOrder?.total ? incomingOrder.total : 20000,
        unit: incomingOrder?.unitLabel || 'Items',
      },
    ],
    total: incomingOrder?.total || 20000,
  };

  const handleAccept = () => {
    setOrderStatus('Accepted');
    Alert.alert(
      'Order Accepted! 🎉',
      `Order #${order._id} for ${order.buyer} has been confirmed. Buyer and dispatch team have been notified.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const handleReject = () => {
    Alert.alert(
      'Decline Order',
      `Are you sure you want to decline Order #${order._id}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => {
            setOrderStatus('Declined');
            Alert.alert('Order Declined', `Order #${order._id} has been declined.`, [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper className="bg-[#F8FAFC]">
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-6 py-4 mb-2 mt-2">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 bg-surface rounded-full justify-center items-center shadow-sm"
          activeOpacity={0.7}
        >
          <Icon name="chevron-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Typography variant="h2" className="text-lg">Order #{order._id}</Typography>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Order Info Card */}
        <View className="bg-surface rounded-3xl p-5 shadow-sm shadow-gray-200 mb-5 border border-gray-100">
          <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-100">
            <Typography variant="bodySmall" className="text-text-secondary">Buyer Name</Typography>
            <Typography variant="bodyBold" className="text-[#111827]">{order.buyer}</Typography>
          </View>
          <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-100">
            <Typography variant="bodySmall" className="text-text-secondary">Order Placed</Typography>
            <Typography variant="bodyMedium" className="text-[#334155]">{order.date}</Typography>
          </View>
          <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-100">
            <Typography variant="bodySmall" className="text-text-secondary">Delivery Distance</Typography>
            <Typography variant="bodyMedium" className="text-[#DC2626]">{order.distance}</Typography>
          </View>
          <View className="flex-row justify-between items-center">
            <Typography variant="bodySmall" className="text-text-secondary">Current Status</Typography>
            <View
              className={`px-3 py-1 rounded-full ${
                orderStatus === 'Accepted'
                  ? 'bg-emerald-50 border border-emerald-200'
                  : orderStatus === 'Declined'
                  ? 'bg-rose-50 border border-rose-200'
                  : 'bg-amber-50 border border-amber-200'
              }`}
            >
              <Typography
                style={{
                  fontSize: 11,
                  fontFamily: 'Montserrat-Bold',
                  color:
                    orderStatus === 'Accepted'
                      ? '#059669'
                      : orderStatus === 'Declined'
                      ? '#E11D48'
                      : '#D97706',
                }}
              >
                {orderStatus}
              </Typography>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <Typography variant="h2" style={{ fontSize: 16 }} className="mb-3">
          Ordered Materials
        </Typography>
        {order.items.map((item) => (
          <View key={item._id} className="bg-surface rounded-2xl p-4 shadow-sm shadow-gray-200 flex-row mb-4 border border-gray-100">
            <View className="w-14 h-14 bg-red-50 rounded-xl justify-center items-center mr-4 border border-red-100">
               <Icon name="box" size={24} color="#8B0000" />
            </View>
            <View className="flex-1 justify-center">
              <Typography variant="bodyBold" className="text-base text-[#111827] mb-0.5">{item.name}</Typography>
              <Typography variant="bodySmall" className="text-text-secondary text-xs mb-1">
                Quantity: {item.quantity}
              </Typography>
              <Typography variant="bodyBold" className="text-primary text-sm">
                Est. ₹ {item.price.toLocaleString('en-IN')}
              </Typography>
            </View>
          </View>
        ))}

        {/* Total Card */}
        <View className="bg-surface rounded-3xl p-5 shadow-sm shadow-gray-200 mt-2 mb-6 border border-gray-100">
          <View className="flex-row justify-between items-center">
            <Typography variant="bodyBold" className="text-base text-[#111827]">Total Order Value</Typography>
            <Typography variant="h1Black" className="text-2xl text-primary">₹ {order.total.toLocaleString('en-IN')}</Typography>
          </View>
        </View>

        {/* Action Buttons */}
        {orderStatus === 'Pending Approval' || orderStatus === 'pending' ? (
          <View className="flex-row gap-x-4">
            <TouchableOpacity
              onPress={handleReject}
              style={{
                flex: 1,
                borderRadius: 25,
                paddingVertical: 14,
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderWidth: 1.5,
                borderColor: '#FCA5A5',
              }}
              activeOpacity={0.8}
            >
              <Typography style={{ color: '#DC2626', fontFamily: 'Montserrat-Bold', fontSize: 14 }}>
                Decline Order
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAccept}
              style={{
                flex: 1,
                borderRadius: 25,
                paddingVertical: 14,
                alignItems: 'center',
                backgroundColor: '#8B0000',
                shadowColor: '#8B0000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
                elevation: 3,
              }}
              activeOpacity={0.85}
            >
              <Typography style={{ color: '#FFFFFF', fontFamily: 'Montserrat-Bold', fontSize: 14 }}>
                Accept Order
              </Typography>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              backgroundColor: '#8B0000',
              borderRadius: 25,
              paddingVertical: 14,
              alignItems: 'center',
            }}
            activeOpacity={0.85}
          >
            <Typography style={{ color: '#FFFFFF', fontFamily: 'Montserrat-Bold', fontSize: 14 }}>
              Back to Orders
            </Typography>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

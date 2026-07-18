import React from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/Feather';
import { apiClient } from '../../../infrastructure/api/client';

export const OrderDetailsScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params;
  const [order, setOrder] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const res = await apiClient.get(`/orders/${orderId}`);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const timelineSteps = ['PENDING', 'ACCEPTED', 'DISPATCHED', 'DELIVERED'];
  const currentStepIndex = timelineSteps.indexOf(order?.status);

  return (
    <ScreenWrapper className="bg-white">
      <View className="flex-row items-center px-6 py-4 mt-4 mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-left" size={24} color="#1C1C1C" />
        </TouchableOpacity>
        <Typography variant="h1Black" className="text-2xl text-black">Track Order</Typography>
      </View>

      {isLoading || !order ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#DFA128" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, gap: 24 }} showsVerticalScrollIndicator={false}>
          {/* Order Info */}
          <View className="bg-surface rounded-3xl p-5 shadow-sm shadow-gray-200">
             <Typography variant="bodyMedium" className="text-text-secondary mb-1">Order ID</Typography>
             <Typography variant="bodyBold" className="text-lg mb-4">#{order._id.toUpperCase()}</Typography>
             
             <Typography variant="bodyMedium" className="text-text-secondary mb-1">Delivery Address</Typography>
             <Typography variant="bodySemiBold">{order.shippingAddress.address}, {order.shippingAddress.city} - {order.shippingAddress.postalCode}</Typography>
          </View>

          {/* Timeline */}
          {order.status !== 'CANCELLED' ? (
            <View className="bg-surface rounded-3xl p-6 shadow-sm shadow-gray-200">
              <Typography variant="h2" className="text-xl mb-6">Order Status</Typography>
              
              <View className="ml-2">
                {timelineSteps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isLast = index === timelineSteps.length - 1;
                  return (
                    <View key={step} className="flex-row">
                      {/* Line & Dot */}
                      <View className="items-center mr-4">
                        <View className={`w-6 h-6 rounded-full justify-center items-center ${isCompleted ? 'bg-primary' : 'bg-gray-200'}`}>
                          {isCompleted && <Icon name="check" size={12} color="#12294A" />}
                        </View>
                        {!isLast && (
                          <View className={`w-[2px] h-12 ${isCompleted && index < currentStepIndex ? 'bg-primary' : 'bg-gray-200'}`} />
                        )}
                      </View>
                      
                      {/* Text */}
                      <View className="pt-1">
                        <Typography variant="bodyBold" className={isCompleted ? 'text-primary' : 'text-text-secondary'}>
                          {step === 'PENDING' ? 'Order Placed' : step === 'ACCEPTED' ? 'Order Accepted' : step === 'DISPATCHED' ? 'Out for Delivery' : 'Delivered'}
                        </Typography>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <View className="bg-red-50 rounded-3xl p-6 border border-red-200 items-center">
               <Icon name="x-circle" size={48} color="#DFA128" className="mb-2" />
               <Typography variant="h2" className="text-xl text-red-500">Order Cancelled</Typography>
            </View>
          )}

          {/* Items */}
          <View className="bg-surface rounded-3xl p-5 shadow-sm shadow-gray-200">
            <Typography variant="h2" className="text-xl mb-4">Items</Typography>
            {order.orderItems.map((item: any, index: number) => (
              <View key={index} className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                <View className="flex-1 mr-4">
                  <Typography variant="bodyMedium" numberOfLines={1}>{item.name}</Typography>
                  <Typography variant="bodySmall" className="text-text-secondary">Qty: {item.qty}</Typography>
                </View>
                <Typography variant="bodyBold">₹ {(item.price * item.qty).toFixed(2)}</Typography>
              </View>
            ))}
            <View className="flex-row justify-between items-center mt-2 pt-3 border-t border-gray-200">
              <Typography variant="bodyBold">Total Amount</Typography>
              <Typography variant="bodyBold" className="text-primary text-lg">₹ {order.totalPrice.toFixed(2)}</Typography>
            </View>
          </View>

        </ScrollView>
      )}
    </ScreenWrapper>
  );
};

import React from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/Feather';

export const NotificationsScreen = ({ navigation }: any) => {
  // Replace with API fetch
  const notifications = [
    { _id: '1', title: 'Order Confirmed', body: 'Your order for UltraTech Cement has been confirmed.', type: 'ORDER', isRead: false },
    { _id: '2', title: 'New Promo', body: 'Get 10% off on all steel products this weekend!', type: 'PROMO', isRead: true },
  ];

  const isLoading = false;

  return (
    <ScreenWrapper className="bg-white">
      <View className="flex-row items-center px-6 py-4 mt-4 mb-4">
        <Typography variant="h2" className="text-xl">Notifications</Typography>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#DFA128" />
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Icon name="bell" size={64} color="#8A8A8E" className="mb-4" />
          <Typography variant="h2" className="text-xl text-text-secondary">No notifications yet</Typography>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, gap: 16 }} showsVerticalScrollIndicator={false}>
          {notifications.map((item) => (
            <TouchableOpacity 
              key={item._id} 
              className={`rounded-3xl p-4 flex-row shadow-sm shadow-gray-200 ${item.isRead ? 'bg-surface' : 'bg-[#FFF5F5] border border-primary/20'}`}
            >
              <View className={`w-12 h-12 rounded-full justify-center items-center mr-4 ${item.isRead ? 'bg-input-bg' : 'bg-primary/10'}`}>
                 <Icon name={item.type === 'ORDER' ? 'package' : item.type === 'PROMO' ? 'tag' : 'info'} size={20} color={item.isRead ? "#8A8A8E" : "#DFA128"} />
              </View>
              <View className="flex-1 justify-center">
                <Typography variant="bodyBold" className={`text-base mb-1 ${item.isRead ? 'text-text-primary' : 'text-primary'}`}>{item.title}</Typography>
                <Typography variant="bodyMedium" className="text-text-secondary">{item.body}</Typography>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </ScreenWrapper>
  );
};

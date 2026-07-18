import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/Feather';
import { useUserStore } from '../../../application/store/userStore';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';

export const WishlistScreen = ({ navigation }: any) => {
  const { profile, fetchProfile, isLoading, toggleWishlist } = useUserStore();

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [])
  );

  const wishlistItems = profile?.wishlist || [];

  return (
    <ScreenWrapper className="bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 mt-4 mb-4">
        <Typography variant="h2" className="text-xl">My Favorites</Typography>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#DFA128" />
        </View>
      ) : wishlistItems.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Icon name="heart" size={64} color="#8A8A8E" className="mb-4" />
          <Typography variant="h2" className="text-xl text-text-secondary">Your wishlist is empty</Typography>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          <View className="flex-row flex-wrap justify-between gap-y-4">
            {wishlistItems.map((item: any) => (
              <TouchableOpacity 
                key={item._id} 
              onPress={() => navigation.navigate('SupplierListing', { product: item })}
              className="bg-surface rounded-3xl p-4 w-[48%] shadow-sm shadow-gray-200"
            >
              <View className="absolute right-4 top-4 z-10">
                <Icon name="heart" size={16} color="#DFA128" />
              </View>
              <View className="h-32 bg-input-bg rounded-2xl mb-3 justify-center items-center">
                 <Icon name="box" size={40} color="#8A8A8E" />
              </View>
              <Typography variant="bodySemiBold" className="mb-1" numberOfLines={1}>{item.name}</Typography>
              <View className="flex-row items-end mb-3">
                <Typography variant="bodyBold" className="text-primary">₹ {item.price} </Typography>
                <Typography variant="bodySmall" className="text-[10px]">per {item.unit}</Typography>
              </View>
              <View className="bg-primary rounded-full py-2 items-center">
                <Typography variant="bodyMedium" className="text-[#12294A] text-xs">Get Quotation</Typography>
              </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </ScreenWrapper>
  );
};

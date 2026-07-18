import React from 'react';
import { View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Logo } from '../../components/Logo';
import Icon from 'react-native-vector-icons/Feather';
import { apiClient } from '../../../infrastructure/api/client';
import { useFocusEffect } from '@react-navigation/native';

import { useHomeStore, Product } from '../../../application/store/homeStore';
import { useUserStore } from '../../../application/store/userStore';
import { ActivityIndicator } from 'react-native';

export const HomeDashboardScreen = ({ navigation }: any) => {
  const categories = ['All', 'Cement', 'Steel', 'Bricks', 'Sand'];
  const [activeCategory, setActiveCategory] = React.useState('All');
  
  const { products, trending, isLoading, fetchProducts } = useHomeStore();
  const { profile, toggleWishlist, fetchProfile } = useUserStore();

  useFocusEffect(
    React.useCallback(() => {
      fetchProducts();
      fetchProfile();
    }, [])
  );

  const isFavorited = (productId: string) => {
    if (!profile || !profile.wishlist) return false;
    return profile.wishlist.some((item: any) => item._id === productId || item === productId);
  };

  const filteredTrending = activeCategory === 'All' 
    ? trending 
    : trending.filter((item: Product) => item.category === activeCategory); // Note: Need actual category name matching in a real app, currently mock filtered.

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Top Header: avatar left, logo centered, notifications right */}
        <View className="flex-row justify-between items-center px-6 py-4 mt-2">
          <View className="w-12 h-12 rounded-full bg-primary justify-center items-center overflow-hidden">
            <Icon name="user" size={24} color="#12294A" />
          </View>
          <Logo size="sm" />
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Icon name="bell" size={24} color="#F5A623" />
          </TouchableOpacity>
        </View>

        {/* Hero Text */}
        <View className="px-6 mb-5 mt-3">
          <Typography
            variant="h1Black"
            className="text-black"
            style={{ fontSize: 28, lineHeight: 34, letterSpacing: -0.5 }}
          >
            Build your dream project with ease
          </Typography>
        </View>

        {/* Search Bar */}
        <View className="px-6 mb-6 flex-row gap-x-3">
          <TouchableOpacity 
            onPress={() => navigation.navigate('Search')}
            className="flex-1 flex-row items-center bg-surface rounded-full px-5 py-3 shadow-sm shadow-gray-200"
          >
            <Icon name="search" size={20} color="#8A8A8E" className="mr-2" />
            <Typography variant="bodyDefault" className="text-text-secondary flex-1">Search</Typography>
          </TouchableOpacity>
          <TouchableOpacity className="w-12 h-12 bg-primary rounded-full justify-center items-center shadow-sm">
            <Icon name="sliders" size={20} color="#12294A" />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }} className="mb-8">
          {categories.map((cat, index) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity 
                key={cat}
                onPress={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full ${isActive ? 'bg-primary' : 'bg-surface shadow-sm shadow-gray-100'}`}
              >
                <Typography variant="bodyMedium" className={isActive ? "text-[#12294A]" : "text-text-secondary"}>
                  {cat}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {isLoading ? (
          <ActivityIndicator size="large" color="#DFA128" />
        ) : (
          <>
            {/* Trending Materials */}
            <View className="px-6 mb-3 flex-row justify-between items-center">
              <Typography variant="h2" style={{ fontSize: 18 }}>Trending Materials</Typography>
              <TouchableOpacity><Typography variant="bodySmall" className="text-primary text-xs">See All</Typography></TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }} className="mb-8">
              {filteredTrending.map((item: Product) => (
                <TouchableOpacity 
                  key={item._id} 
                  onPress={() => navigation.navigate('SupplierListing', { product: item })}
                  className="bg-surface rounded-3xl p-4 w-44 shadow-sm shadow-gray-200"
                >
                  <TouchableOpacity className="absolute right-4 top-4 z-10" onPress={() => toggleWishlist(item._id)}>
                    <Icon name="heart" size={16} color={isFavorited(item._id) ? "#DFA128" : "#8A8A8E"} />
                  </TouchableOpacity>
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
            </ScrollView>

            {/* Best In Deals */}
            <View className="px-6 mb-3 flex-row justify-between items-center">
              <Typography variant="h2" style={{ fontSize: 18 }}>Best In Deals</Typography>
              <TouchableOpacity><Typography variant="bodySmall" className="text-primary text-xs">See All</Typography></TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }} className="mb-8">
              {products.slice(0, 5).map((item: Product) => (
                <TouchableOpacity 
                  key={`best-${item._id}`} 
                  onPress={() => navigation.navigate('SupplierListing', { product: item })}
                  className="bg-surface rounded-3xl p-4 w-44 shadow-sm shadow-gray-200"
                >
                  <TouchableOpacity className="absolute right-4 top-4 z-10" onPress={() => toggleWishlist(item._id)}>
                    <Icon name="heart" size={16} color={isFavorited(item._id) ? "#DFA128" : "#8A8A8E"} />
                  </TouchableOpacity>
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
            </ScrollView>
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

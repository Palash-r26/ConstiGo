import React from 'react';
import { View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Logo } from '../../components/Logo';
import Icon from 'react-native-vector-icons/Feather';
import { apiClient } from '../../../infrastructure/api/client';
import { useFocusEffect } from '@react-navigation/native';
import MapboxGL from '@maplibre/maplibre-react-native';
import { OLA_MAPS_API_KEY } from '@env';

MapboxGL.setAccessToken(null); // MapLibre doesn't strictly need this unless using Mapbox hosted tiles

export const HomeDashboardScreen = ({ navigation }: any) => {
  const categories = ['All', 'Cement', 'Steel', 'Bricks'];
  const [trending, setTrending] = React.useState<any[]>([]);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products');
      if (response.data.success) {
        setTrending(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch trending materials:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchProducts();
    }, [])
  );

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Top Header: avatar left, logo centered, bell right (per Buyer.pdf) */}
        <View className="flex-row justify-between items-center px-6 py-4">
          <View className="w-12 h-12 rounded-full bg-primary justify-center items-center overflow-hidden">
            <Icon name="user" size={24} color="#FFF" />
          </View>
          <Logo size="sm" />
          <TouchableOpacity>
            <Icon name="bell" size={24} color="#1C1C1C" />
          </TouchableOpacity>
        </View>

        {/* Hero Text */}
        <View className="px-6 mb-6 mt-4">
          <Typography variant="h1" className="text-4xl leading-tight">
            Build your dream project with ease
          </Typography>
        </View>

        {/* Search Bar */}
        <View className="px-6 mb-6 flex-row gap-x-3">
          <View className="flex-1 flex-row items-center bg-surface rounded-full px-5 py-3 shadow-sm shadow-gray-200">
            <Icon name="search" size={20} color="#8A8A8E" className="mr-2" />
            <Typography variant="bodyDefault" className="text-text-secondary flex-1">Search</Typography>
          </View>
          <TouchableOpacity className="w-12 h-12 bg-primary rounded-full justify-center items-center shadow-sm">
            <Icon name="sliders" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }} className="mb-8">
          {categories.map((cat, index) => {
            const isActive = index === 0;
            return (
              <TouchableOpacity 
                key={cat} 
                className={`px-6 py-2 rounded-full ${isActive ? 'bg-primary' : 'bg-surface shadow-sm shadow-gray-100'}`}
              >
                <Typography className={isActive ? 'text-white font-medium' : 'text-text-secondary font-medium'}>
                  {cat}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Trending Materials */}
        <View className="px-6 mb-4 flex-row justify-between items-center">
          <Typography variant="h2" className="text-xl">Trending Materials</Typography>
          <TouchableOpacity><Typography variant="bodySmall" className="text-primary">See All</Typography></TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }} className="mb-8">
          {trending.map((item) => (
            <TouchableOpacity 
              key={item._id} 
              onPress={() => navigation.navigate('SupplierListing', { product: item })}
              className="bg-surface rounded-3xl p-4 w-44 shadow-sm shadow-gray-200"
            >
              <View className="absolute right-4 top-4 z-10">
                <Icon name="heart" size={16} color="#FF4B3A" />
              </View>
              <View className="h-32 bg-input-bg rounded-2xl mb-3 justify-center items-center">
                 <Icon name="box" size={40} color="#8A8A8E" />
              </View>
              <Typography variant="bodyDefault" className="font-semibold mb-1" numberOfLines={1}>{item.name}</Typography>
              <View className="flex-row items-end mb-3">
                <Typography variant="bodyDefault" className="text-primary font-bold">₹ {item.price} </Typography>
                <Typography variant="bodySmall" className="text-[10px]">per {item.unit}</Typography>
              </View>
              <View className="bg-primary rounded-full py-2 items-center">
                <Typography variant="bodySmall" className="text-white font-medium text-xs">Get Quotation</Typography>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>


        {/* Geospatial Search Map */}
        <View className="px-6 mb-4">
          <Typography variant="h2" className="text-xl mb-4">Suppliers Near You</Typography>
          <View className="h-64 rounded-3xl overflow-hidden shadow-sm shadow-gray-200 border border-gray-100">
            <MapboxGL.MapView style={{ flex: 1 }} logoEnabled={false} attributionEnabled={false}>
              <MapboxGL.Camera
                zoomLevel={12}
                centerCoordinate={[72.8777, 19.0760]} // Default to Mumbai
                animationMode="flyTo"
                animationDuration={2000}
              />
              <MapboxGL.RasterSource 
                id="ola-maps-source" 
                tileUrlTemplates={[
                  `https://api.olamaps.io/tiles/vector/v1/data/{z}/{x}/{y}.pbf?api_key=${OLA_MAPS_API_KEY}`
                ]}
                tileSize={256}
              >
                <MapboxGL.RasterLayer id="ola-maps-layer" sourceID="ola-maps-source" />
              </MapboxGL.RasterSource>

              {/* Sample Supplier Marker */}
              <MapboxGL.PointAnnotation id="supplier-1" coordinate={[72.8777, 19.0760]}>
                <View className="w-8 h-8 bg-primary rounded-full items-center justify-center border-2 border-white">
                  <Icon name="map-pin" size={16} color="white" />
                </View>
              </MapboxGL.PointAnnotation>

            </MapboxGL.MapView>
          </View>
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
};

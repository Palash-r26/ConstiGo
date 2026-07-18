import React from 'react';
import { View, ScrollView, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/Feather';
import { useHomeStore, Product } from '../../../application/store/homeStore';

export const SearchScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { products, isLoading, fetchProducts } = useHomeStore();

  React.useEffect(() => {
    // Initial fetch if needed, but homeStore might already have products
    // Debounce can be implemented here if fetching from API based on query
  }, []);

  const filteredProducts = products.filter((p: Product) => {
    const catName = typeof p.category === 'object' ? (p.category as any).name : p.category;
    return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           catName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <ScreenWrapper className="bg-white">
      <View className="px-6 py-4 mt-4">
        <Typography variant="h1Black" className="text-3xl text-[#182F4B] mb-4">Search</Typography>
        <View className="flex-row items-center bg-surface rounded-full px-5 py-3 shadow-sm shadow-gray-200">
          <Icon name="search" size={20} color="#8A8A8E" className="mr-2" />
          <TextInput
            placeholder="Search materials, suppliers..."
            className="flex-1 text-text-primary"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8A8A8E"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="x" size={20} color="#182F4B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#C89338" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, gap: 16 }} showsVerticalScrollIndicator={false}>
          {filteredProducts.length === 0 ? (
            <View className="items-center mt-10">
              <Icon name="search" size={48} color="#E5E5EA" className="mb-4" />
              <Typography variant="bodyMedium" className="text-text-secondary text-center">
                No materials found for "{searchQuery}"
              </Typography>
            </View>
          ) : (
            filteredProducts.map((item: Product) => (
              <TouchableOpacity 
                key={item._id} 
                onPress={() => navigation.navigate('SupplierListing', { product: item })}
                className="bg-surface rounded-3xl p-4 shadow-sm shadow-gray-200 flex-row items-center"
              >
                <View className="w-16 h-16 bg-input-bg rounded-2xl justify-center items-center mr-4">
                   <Icon name="box" size={24} color="#8A8A8E" />
                </View>
                <View className="flex-1">
                  <Typography variant="bodySemiBold" className="mb-1" numberOfLines={1}>{item.name}</Typography>
                  <Typography variant="bodySmall" className="text-text-secondary mb-1">
                    {typeof item.category === 'object' ? (item.category as any).name : item.category}
                  </Typography>
                  <View className="flex-row items-end">
                    <Typography variant="bodyBold" className="text-primary">₹ {item.price} </Typography>
                    <Typography variant="bodySmall" className="text-[10px]">per {item.unit}</Typography>
                  </View>
                </View>
                <Icon name="chevron-right" size={20} color="#8A8A8E" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </ScreenWrapper>
  );
};

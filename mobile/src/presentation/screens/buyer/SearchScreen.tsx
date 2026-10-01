import React from 'react';
import { View, ScrollView, TextInput, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/Feather';
import { useHomeStore, Product } from '../../../application/store/homeStore';

const SERVICE_WORKERS = [
  {
    _id: 'w1',
    name: 'Ramesh Sharma',
    category: 'Plumber',
    rating: '4.8 (95)',
    distance: '1.8 km',
    serviceCharge: '₹ 400 / service',
    visitingCharge: '₹ 150',
    experience: '8 yrs exp',
  },
  {
    _id: 'w2',
    name: 'Manoj Kumar (Mistry)',
    category: 'Mistry / Mason',
    rating: '4.9 (132)',
    distance: '2.4 km',
    serviceCharge: '₹ 900 / day',
    visitingCharge: '₹ 200',
    experience: '12 yrs exp',
  },
  {
    _id: 'w3',
    name: 'Sunil Verma',
    category: 'Electrician',
    rating: '4.7 (80)',
    distance: '3.1 km',
    serviceCharge: '₹ 350 / service',
    visitingCharge: '₹ 100',
    experience: '6 yrs exp',
  },
  {
    _id: 'w4',
    name: 'Irfan Khan',
    category: 'Carpenter',
    rating: '4.8 (64)',
    distance: '2.9 km',
    serviceCharge: '₹ 800 / day',
    visitingCharge: '₹ 200',
    experience: '10 yrs exp',
  },
  {
    _id: 'w5',
    name: 'Rajesh Painter',
    category: 'Painter',
    rating: '4.6 (52)',
    distance: '3.5 km',
    serviceCharge: '₹ 750 / day',
    visitingCharge: '₹ 150',
    experience: '7 yrs exp',
  },
];

export const SearchScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { products, isLoading } = useHomeStore();

  const filteredProducts = products.filter((p: Product) => {
    const catName = typeof p.category === 'object' ? (p.category as any).name : p.category;
    return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           catName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredWorkers = SERVICE_WORKERS.filter((w) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return w.name.toLowerCase().includes(q) || w.category.toLowerCase().includes(q);
  });

  return (
    <ScreenWrapper className="bg-white">
      <View className="px-6 py-4 mt-4">
        <Typography variant="h1Black" className="text-3xl text-[#111827] mb-4">Search</Typography>
        <View className="flex-row items-center bg-surface rounded-full px-5 py-3 shadow-sm shadow-gray-200 border border-gray-100">
          <Icon name="search" size={20} color="#6B7280" className="mr-2" />
          <TextInput
            placeholder="Search materials, services, workers..."
            className="flex-1 text-text-primary"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8A8A8E"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="x" size={20} color="#111827" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#8B0000" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, gap: 16 }} showsVerticalScrollIndicator={false}>
          {filteredWorkers.length > 0 && (
            <View className="mb-2">
              <Typography variant="h2" style={{ fontSize: 16 }} className="mb-3">
                Services & Workers
              </Typography>
              <View className="gap-y-3">
                {filteredWorkers.map((worker) => (
                  <View key={worker._id} className="bg-surface rounded-2xl p-4 shadow-sm shadow-gray-200 flex-row items-center justify-between">
                    <View className="flex-1">
                      <Typography variant="bodyBold" className="text-sm text-[#111827]">{worker.name}</Typography>
                      <Typography variant="bodySmall" className="text-xs text-primary">{worker.category} • {worker.serviceCharge}</Typography>
                      <Typography style={{ fontSize: 10, color: '#8A8A8E' }}>Visiting: {worker.visitingCharge}</Typography>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        const phone = (worker as any).phone || '+91 98765 43210';
                        const phoneUrl = `tel:${phone.replace(/\s+/g, '')}`;
                        Linking.openURL(phoneUrl).catch(() => {});
                      }}
                      className="bg-primary rounded-full px-4 py-1.5 flex-row items-center"
                    >
                      <Icon name="phone" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Typography variant="bodyMedium" className="text-white text-xs">Call</Typography>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {filteredProducts.length === 0 && filteredWorkers.length === 0 ? (
            <View className="items-center mt-10">
              <Icon name="search" size={48} color="#E5E5EA" className="mb-4" />
              <Typography variant="bodyMedium" className="text-text-secondary text-center">
                {searchQuery ? `No results found for "${searchQuery}"` : "Search for construction materials or service workers"}
              </Typography>
            </View>
          ) : (
            <>
              {filteredProducts.length > 0 && (
                <Typography variant="h2" style={{ fontSize: 16 }} className="mb-1">
                  Materials
                </Typography>
              )}
              {filteredProducts.map((item: Product) => (
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
              ))}
            </>
          )}
        </ScrollView>
      )}
    </ScreenWrapper>
  );
};

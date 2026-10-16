import React from 'react';
import { View, ScrollView, TextInput, ActivityIndicator, TouchableOpacity, Linking, Alert } from 'react-native';
import { Typography, ScreenWrapper, SafeImage } from '@constigo/shared';
import Icon from 'react-native-vector-icons/Feather';
import { useHomeStore, Product } from '../../store/homeStore';
import { fetchBuyerWorkers } from '../../services/api/buyerApi';
import { fetchWorkers } from '../../services/api/workerApi';

export interface SearchWorkerItem {
  _id: string;
  name: string;
  category: string;
  phone: string;
  serviceCharge: string;
  visitingCharge: string;
}

export const SearchScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { products, isLoading } = useHomeStore();
  const [liveWorkers, setLiveWorkers] = React.useState<SearchWorkerItem[]>([]);
  const [loadingWorkers, setLoadingWorkers] = React.useState(false);

  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setLiveWorkers([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoadingWorkers(true);
        let res: any;
        try {
          res = await fetchBuyerWorkers(searchQuery.trim());
        } catch {
          res = await fetchWorkers(searchQuery.trim());
        }

        if (res && res.data && Array.isArray(res.data)) {
          const mapped: SearchWorkerItem[] = res.data.map((item: any, idx: number) => ({
            _id: String(item.workerid || item.id || `w_${idx}`),
            name: item.fullname || 'Verified Worker',
            category: item.skill || 'Skilled Labor',
            phone: item.phone || '',
            serviceCharge: item.service_charge ? `₹ ${item.service_charge}` : '₹ 500 / day',
            visitingCharge: item.visit_charge ? `₹ ${item.visit_charge}` : '₹ 150',
          }));
          setLiveWorkers(mapped);
        } else {
          setLiveWorkers([]);
        }
      } catch (err) {
        console.warn('[SearchScreen] Worker search error:', err);
        setLiveWorkers([]);
      } finally {
        setLoadingWorkers(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const filteredProducts = products.filter((p: Product) => {
    if (!searchQuery.trim()) return true;
    const catName = typeof p.category === 'object' ? (p.category as any).name : p.category;
    return (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      catName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleCallWorker = (phone: string, workerName: string) => {
    if (!phone || !phone.trim()) {
      Alert.alert('Contact Worker', `No contact number is currently listed for ${workerName}.`);
      return;
    }
    const phoneUrl = `tel:${phone.replace(/\s+/g, '')}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Phone Call', `Call worker at: ${phone}`);
        }
      })
      .catch(() => {
        Alert.alert('Phone Call', `Call worker at: ${phone}`);
      });
  };

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
          {loadingWorkers ? (
            <View className="py-2 flex-row items-center justify-center">
              <ActivityIndicator size="small" color="#8B0000" />
              <Typography variant="bodySmall" className="text-text-secondary ml-2">Searching workers...</Typography>
            </View>
          ) : liveWorkers.length > 0 ? (
            <View className="mb-2">
              <Typography variant="h2" style={{ fontSize: 16 }} className="mb-3">
                Services & Workers ({liveWorkers.length})
              </Typography>
              <View className="gap-y-3">
                {liveWorkers.map((worker) => (
                  <View key={worker._id} className="bg-surface rounded-2xl p-4 shadow-sm shadow-gray-200 flex-row items-center justify-between border border-gray-100">
                    <View className="flex-1 mr-3">
                      <Typography variant="bodyBold" className="text-sm text-[#111827]">{worker.name}</Typography>
                      <Typography variant="bodySmall" className="text-xs text-primary">{worker.category} • {worker.serviceCharge}</Typography>
                      <Typography style={{ fontSize: 10, color: '#8A8A8E' }}>Visiting: {worker.visitingCharge}</Typography>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleCallWorker(worker.phone, worker.name)}
                      className="bg-primary rounded-full px-4 py-1.5 flex-row items-center"
                      activeOpacity={0.8}
                    >
                      <Icon name="phone" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Typography variant="bodyMedium" className="text-white text-xs">Call</Typography>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {filteredProducts.length === 0 && liveWorkers.length === 0 && !loadingWorkers ? (
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
                  Materials ({filteredProducts.length})
                </Typography>
              )}
              {filteredProducts.map((item: Product) => (
                <TouchableOpacity 
                  key={item._id} 
                  onPress={() => navigation.navigate('SupplierListing', { product: item })}
                  className="bg-surface rounded-3xl p-4 shadow-sm shadow-gray-200 flex-row items-center border border-gray-100"
                  activeOpacity={0.85}
                >
                  <SafeImage
                    uri={item.images && item.images[0] ? item.images[0] : item.productimage}
                    style={{ width: 64, height: 64, borderRadius: 16, marginRight: 16 }}
                    resizeMode="cover"
                    fallbackIconName="box"
                    fallbackIconSize={26}
                  />
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

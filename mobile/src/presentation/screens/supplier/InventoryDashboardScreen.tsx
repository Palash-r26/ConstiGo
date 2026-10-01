import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Logo } from '../../components/Logo';
import Icon from 'react-native-vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../../application/store/authStore';
import {
  fetchVendorAllProducts,
  fetchVendorAvailableProducts,
  fetchVendorUnavailableProducts,
  updateVendorProduct,
  deleteVendorProduct,
} from '../../../infrastructure/api/vendorApi';

export const InventoryDashboardScreen = ({ navigation }: any) => {
  const user = useAuthStore((state) => state.user);
  const vendorId = user?.vendorid || user?._id || 'CV290926162458';

  const [inventory, setInventory] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'AVAILABLE' | 'UNAVAILABLE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchInventory = async (filter = activeFilter) => {
    try {
      setIsLoading(true);
      let response;
      if (filter === 'AVAILABLE') {
        // Call REAL PHP production endpoint: https://constigo.in/app/vendor/product_available.php
        response = await fetchVendorAvailableProducts(vendorId);
      } else if (filter === 'UNAVAILABLE') {
        // Call REAL PHP production endpoint: https://constigo.in/app/vendor/product_unavailable.php
        response = await fetchVendorUnavailableProducts(vendorId);
      } else {
        // Call REAL PHP production endpoint: https://constigo.in/app/vendor/products_all_list.php
        response = await fetchVendorAllProducts(vendorId);
      }

      console.log(`[InventoryDashboard] Products List Raw Response (${filter}):`, response);

      // TODO: Confirm exact response array schema from backend (e.g. response.data or raw array)
      let list: any[] = [];
      if (Array.isArray(response)) {
        list = response;
      } else if (response && Array.isArray(response.data)) {
        list = response.data;
      } else if (response && Array.isArray(response.products)) {
        list = response.products;
      }

      setInventory(list);
    } catch (error) {
      console.error('[InventoryDashboard] Failed to fetch inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInventory(activeFilter);
    }, [activeFilter, vendorId])
  );

  const handleFilterChange = (filter: 'ALL' | 'AVAILABLE' | 'UNAVAILABLE') => {
    setActiveFilter(filter);
    fetchInventory(filter);
  };

  const toggleAvailability = async (item: any) => {
    const productId = item.productid || item.id || item._id;
    const isCurrentlyAvailable =
      item.product_status === 'available' || item.isAvailable === true;
    const nextStatus = isCurrentlyAvailable ? 'unavailable' : 'available';

    try {
      // Optimistic update
      setInventory((prev) =>
        prev.map((p) => {
          const id = p.productid || p.id || p._id;
          if (id === productId) {
            return {
              ...p,
              product_status: nextStatus,
              productStatus: nextStatus === 'available' ? 'in_stock' : 'out_of_stock',
              isAvailable: !isCurrentlyAvailable,
            };
          }
          return p;
        })
      );

      // Call REAL PHP production endpoint: https://constigo.in/app/vendor/product_update.php
      await updateVendorProduct({
        vendorid: vendorId,
        productid: productId,
        productname: item.productname || item.name || '',
        productcategory: item.productcategory || item.category || '',
        stock: String(item.stock || item.stockQty || '1'),
        product_description: item.product_description || item.description || '',
        product_price: String(item.product_price || item.price || '0'),
        discount_price: String(item.discount_price || '0'),
        product_status: nextStatus,
        productStatus: nextStatus === 'available' ? 'in_stock' : 'out_of_stock',
        delivery_available: item.delivery_available || 'yes',
        warranty_details: item.warranty_details || '1 Year Product Warranty',
      });
    } catch (error) {
      console.error('[InventoryDashboard] Failed to toggle availability:', error);
      fetchInventory(activeFilter);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product from your inventory?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Call REAL PHP production endpoint: https://constigo.in/app/vendor/product_delete.php
              await deleteVendorProduct(vendorId, productId);
              setInventory((prev) =>
                prev.filter((p) => (p.productid || p.id || p._id) !== productId)
              );
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete product.');
            }
          },
        },
      ]
    );
  };

  const filteredInventory = inventory.filter((item) => {
    const name = item.productname || item.name || '';
    const category = item.productcategory || item.category || '';
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View className="flex-row justify-between items-center px-6 py-4">
          <TouchableOpacity
            onPress={() => navigation?.navigate('Profile')}
            className="w-12 h-12 rounded-full bg-primary justify-center items-center overflow-hidden"
          >
            <Icon name="user" size={24} color="#182F4B" />
          </TouchableOpacity>
          <Logo size="sm" />
          <TouchableOpacity>
            <Icon name="bell" size={24} color="#182F4B" />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View className="bg-surface mx-6 rounded-3xl p-6 shadow-sm shadow-gray-200 mb-6 mt-2">
          <Typography variant="h1" style={{ fontSize: 26 }} className="mb-2">
            My Inventory
          </Typography>
          <Typography variant="bodyDefault" className="text-text-secondary mb-6">
            Manage your material stock, pricing, and visibility
          </Typography>
          <Button 
            title="+ Add New Product" 
            onPress={() => navigation.navigate('AddProduct')} 
          />
        </View>

        {/* Search & Filters */}
        <View className="bg-surface mx-6 rounded-3xl p-5 shadow-sm shadow-gray-200 mb-6">
          <View className="flex-row items-center bg-input-bg rounded-full px-5 py-3 mb-4">
            <Icon name="search" size={20} color="#8A8A8E" className="mr-2" />
            <TextInput
              placeholder="Search products..."
              placeholderTextColor="#8A8A8E"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-sm text-text-primary p-0"
              style={{ fontFamily: 'Montserrat-Medium' }}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="x" size={16} color="#8A8A8E" />
              </TouchableOpacity>
            ) : null}
          </View>

          <View className="flex-row justify-between gap-x-2">
            <TouchableOpacity
              onPress={() => handleFilterChange('ALL')}
              className={`flex-1 rounded-full py-2.5 items-center ${activeFilter === 'ALL' ? 'bg-primary' : 'bg-input-bg'}`}
            >
              <Typography
                variant="bodyMedium"
                className={activeFilter === 'ALL' ? 'text-white' : 'text-text-secondary'}
              >
                All Items
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleFilterChange('AVAILABLE')}
              className={`flex-1 rounded-full py-2.5 items-center ${activeFilter === 'AVAILABLE' ? 'bg-primary' : 'bg-input-bg'}`}
            >
              <Typography
                variant="bodyMedium"
                className={activeFilter === 'AVAILABLE' ? 'text-white' : 'text-text-secondary'}
              >
                In stock
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleFilterChange('UNAVAILABLE')}
              className={`flex-1 rounded-full py-2.5 items-center ${activeFilter === 'UNAVAILABLE' ? 'bg-primary' : 'bg-input-bg'}`}
            >
              <Typography
                variant="bodyMedium"
                className={activeFilter === 'UNAVAILABLE' ? 'text-white' : 'text-text-secondary'}
              >
                Out of stock
              </Typography>
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading Spinner */}
        {isLoading ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#8B0000" />
            <Typography variant="bodySmall" className="text-text-secondary mt-3">
              Loading inventory...
            </Typography>
          </View>
        ) : filteredInventory.length === 0 ? (
          <View className="py-12 items-center justify-center px-6">
            <Icon name="package" size={48} color="#D1D5DB" />
            <Typography variant="h2" className="text-lg text-text-primary mt-4 text-center">
              No Products Found
            </Typography>
            <Typography variant="bodySmall" className="text-text-secondary text-center mt-1">
              Tap "+ Add New Product" to list your first item.
            </Typography>
          </View>
        ) : (
          /* Inventory List */
          <View className="px-6 gap-y-4">
            {filteredInventory.map((item, index) => {
              const productId = item.productid || item.id || item._id || `item_${index}`;
              const name = item.productname || item.name || 'Unnamed Product';
              const price = item.product_price || item.price || '0';
              const stock = item.stock || item.stockQty || '0';
              const isStockIn =
                item.productStatus === 'in_stock' ||
                item.product_status === 'available' ||
                item.isAvailable === true ||
                (!item.productStatus && item.product_status !== 'unavailable' && typeof item.stock === 'number' && item.stock > 0);

              return (
                <View key={productId} className="bg-surface rounded-3xl p-5 shadow-sm shadow-gray-200">
                  <View className="flex-row gap-x-4 mb-4">
                    {item.productimage || item.image ? (
                      <Image
                        source={{ uri: item.productimage || item.image }}
                        className="w-20 h-20 rounded-2xl bg-gray-100"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-20 h-20 bg-[#F3E8E8] rounded-2xl items-center justify-center">
                        <Icon name="box" size={28} color="#8B0000" />
                      </View>
                    )}

                    <View className="flex-1">
                      <View className="flex-row justify-between items-start">
                        <Typography variant="bodyBold" className="text-lg flex-1 leading-tight mb-1">
                          {name}
                        </Typography>
                        <TouchableOpacity
                          onPress={() => handleDeleteProduct(productId)}
                          className="p-1"
                        >
                          <Icon name="trash-2" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                      <Typography variant="bodySmall" className="text-xs text-text-secondary">
                        Category : {item.productcategory || item.category || 'General'}
                      </Typography>
                      
                      {/* Product Status Badge */}
                      <View className="flex-row items-center mt-1">
                        <View className={`px-2.5 py-0.5 rounded-full flex-row items-center ${isStockIn ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'}`}>
                          <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isStockIn ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <Typography
                            style={{
                              fontSize: 10,
                              fontFamily: 'Montserrat-SemiBold',
                              color: isStockIn ? '#059669' : '#E11D48',
                            }}
                          >
                            {isStockIn ? 'In Stock' : 'Out of Stock'}
                          </Typography>
                        </View>
                      </View>

                      {item.warranty_details ? (
                        <Typography variant="bodySmall" className="text-[11px] text-accent mt-1">
                          {item.warranty_details}
                        </Typography>
                      ) : null}
                    </View>
                  </View>

                  <View className="flex-row gap-x-4 mb-4">
                    <View className="flex-1 border border-gray-200 rounded-2xl p-3">
                      <Typography variant="bodySmall" className="text-[10px] text-text-secondary mb-1">
                        Price per qty.
                      </Typography>
                      <Typography variant="h2" style={{ fontSize: 18 }}>
                        ₹ {price}
                      </Typography>
                    </View>
                    <View className="flex-1 border border-gray-200 rounded-2xl p-3">
                      <Typography variant="bodySmall" className="text-[10px] text-text-secondary mb-1">
                        Stock qty.
                      </Typography>
                      <Typography variant="h2" style={{ fontSize: 18 }}>
                        {stock}
                      </Typography>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <Switch 
                        value={isStockIn}
                        onValueChange={() => toggleAvailability(item)} 
                        trackColor={{ false: "#D1D1D6", true: "#82C341" }}
                        thumbColor="#FFFFFF"
                      />
                      <Typography variant="bodyMedium" className="ml-2 text-text-primary text-xs">
                        {isStockIn ? 'In Stock' : 'Out of Stock'}
                      </Typography>
                    </View>

                    <TouchableOpacity
                      onPress={() => navigation.navigate('AddProduct', { product: item })}
                      className="bg-primary rounded-full px-6 py-2"
                    >
                      <Typography variant="bodyMedium" className="text-white text-xs">
                        Update
                      </Typography>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

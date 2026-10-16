import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Typography, ScreenWrapper, SafeImage, useAuthStore } from '@constigo/shared';
import { SupplierTopHeader } from '../../components/SupplierTopHeader';
import Icon from 'react-native-vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import {
  fetchVendorAllProducts,
  fetchVendorAvailableProducts,
  fetchVendorUnavailableProducts,
  updateVendorProduct,
  deleteVendorProduct,
} from '../../services/api/vendorApi';

export const InventoryDashboardScreen = ({ navigation }: any) => {
  const user = useAuthStore((state) => state.user);
  const vendorId = user?.vendorid || user?._id;

  const [inventory, setInventory] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'AVAILABLE' | 'UNAVAILABLE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchInventory = async (filter = activeFilter) => {
    if (!vendorId) {
      setIsLoading(false);
      setInventory([]);
      setLoadError('Please log in with your supplier account to manage inventory.');
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);
      let response;
      if (filter === 'AVAILABLE') {
        response = await fetchVendorAvailableProducts(vendorId);
      } else if (filter === 'UNAVAILABLE') {
        response = await fetchVendorUnavailableProducts(vendorId);
      } else {
        response = await fetchVendorAllProducts(vendorId);
      }

      let list: any[] = [];
      if (Array.isArray(response)) {
        list = response;
      } else if (response && Array.isArray(response.data)) {
        list = response.data;
      } else if (response && Array.isArray(response.products)) {
        list = response.products;
      }

      setInventory(list);
    } catch (error: any) {
      console.error('[InventoryDashboard] Failed to fetch inventory:', error);
      setLoadError(error?.message || 'Failed to load inventory from server');
      setInventory([]);
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

      await updateVendorProduct({
        id: productId,
        product_status: nextStatus,
        productname: item.productname || item.name,
        category: item.productcategory || item.category,
        price: item.product_price || item.price,
        stock: item.stock || item.stockQty,
      });
    } catch (err) {
      console.warn('[InventoryDashboard] Status update failed:', err);
      Alert.alert('Notice', 'Unable to synchronize availability change to server.');
      fetchInventory();
    }
  };

  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to remove this item from your active inventory catalogue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVendorProduct(productId);
              setInventory((prev) =>
                prev.filter((p) => (p.productid || p.id || p._id) !== productId)
              );
              Alert.alert('Success', 'Product deleted successfully.');
            } catch (err: any) {
              console.warn('[InventoryDashboard] Delete product error:', err);
              Alert.alert('Error', err?.message || 'Could not delete product.');
            }
          },
        },
      ]
    );
  };

  const filteredInventory = inventory.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const name = (item.productname || item.name || '').toLowerCase();
    const cat = (item.productcategory || item.category || '').toLowerCase();
    return name.includes(q) || cat.includes(q);
  });

  return (
    <ScreenWrapper>
      {/* Top Header */}
      <SupplierTopHeader navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Banner / CTA */}
        <View style={styles.heroCard}>
          <Typography variant="h1" style={styles.heroTitle}>
            Manage Your Inventory
          </Typography>
          <Typography variant="bodyMedium" style={styles.heroSubtitle}>
            Update your stock levels, availability, and pricing in real time.
          </Typography>

          <TouchableOpacity
            style={styles.addProductButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AddProduct')}
          >
            <Icon name="plus" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Typography variant="bodyBold" style={styles.addProductButtonText}>
              Add New Product
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Site Labor & Workers Hub Quick Access */}
        <TouchableOpacity
          style={styles.workersHubCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Workers')}
        >
          <View style={styles.workersHubLeft}>
            <View style={styles.workersHubBadge}>
              <Icon name="users" size={12} color="#8B0000" style={{ marginRight: 4 }} />
              <Typography style={styles.workersHubBadgeText}>SITE LABOR & WORKERS</Typography>
            </View>
            <Typography variant="bodyBold" style={styles.workersHubTitle}>
              Need Helpers for Material Shifting?
            </Typography>
            <Typography style={styles.workersHubDesc}>
              Find & call verified site helpers, masons, and fabricators
            </Typography>
          </View>
          <View style={styles.workersHubArrow}>
            <Icon name="arrow-right" size={18} color="#8B0000" />
          </View>
        </TouchableOpacity>

        {/* Search & Filters */}
        <View style={styles.filterCard}>
          {/* Search Input */}
          <View style={styles.searchBar}>
            <Icon name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search products..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="x" size={16} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Sleek Compact Filter Chips */}
          <View style={styles.chipsContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleFilterChange('ALL')}
              style={[
                styles.chip,
                activeFilter === 'ALL' ? styles.activeChip : styles.inactiveChip,
              ]}
            >
              <Typography
                style={[
                  styles.chipText,
                  activeFilter === 'ALL' ? styles.activeChipText : styles.inactiveChipText,
                ]}
                numberOfLines={1}
              >
                All Items
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleFilterChange('AVAILABLE')}
              style={[
                styles.chip,
                activeFilter === 'AVAILABLE' ? styles.activeChip : styles.inactiveChip,
              ]}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: activeFilter === 'AVAILABLE' ? '#86EFAC' : '#10B981' },
                ]}
              />
              <Typography
                style={[
                  styles.chipText,
                  activeFilter === 'AVAILABLE' ? styles.activeChipText : styles.inactiveChipText,
                ]}
                numberOfLines={1}
              >
                In Stock
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleFilterChange('UNAVAILABLE')}
              style={[
                styles.chip,
                activeFilter === 'UNAVAILABLE' ? styles.activeChip : styles.inactiveChip,
              ]}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: activeFilter === 'UNAVAILABLE' ? '#FCA5A5' : '#EF4444' },
                ]}
              />
              <Typography
                style={[
                  styles.chipText,
                  activeFilter === 'UNAVAILABLE' ? styles.activeChipText : styles.inactiveChipText,
                ]}
                numberOfLines={1}
              >
                Out of Stock
              </Typography>
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading / Error / Empty States */}
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#8B0000" />
            <Typography variant="bodySmall" style={styles.loadingText}>
              Loading inventory...
            </Typography>
          </View>
        ) : loadError ? (
          <View style={styles.centerContainer}>
            <Icon name="alert-circle" size={44} color="#EF4444" />
            <Typography variant="bodyBold" style={{ marginTop: 12, color: '#111827' }}>
              Unable to load inventory
            </Typography>
            <Typography variant="bodySmall" style={{ color: '#64748B', textAlign: 'center', marginTop: 4 }}>
              {loadError}
            </Typography>
            <TouchableOpacity onPress={() => fetchInventory(activeFilter)} style={styles.retryButton}>
              <Typography variant="bodyMedium" style={{ color: '#FFFFFF', fontSize: 13 }}>
                Retry
              </Typography>
            </TouchableOpacity>
          </View>
        ) : filteredInventory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Icon name="package" size={40} color="#94A3B8" />
            </View>
            <Typography variant="h2" style={styles.emptyTitle}>
              No Products Found
            </Typography>
            <Typography variant="bodySmall" style={styles.emptySubtitle}>
              Tap "+ Add New Product" to list your first item.
            </Typography>
          </View>
        ) : (
          /* Inventory List */
          <View style={styles.listContainer}>
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
              const imgUri = item.productimage || item.image || (Array.isArray(item.images) && item.images[0]);

              return (
                <View key={productId} style={styles.productCard}>
                  <View style={styles.productHeaderRow}>
                    <View style={styles.productImageWrapper}>
                      {imgUri ? (
                        <SafeImage
                          uri={imgUri}
                          style={styles.productImage}
                          fallbackIconName="box"
                        />
                      ) : (
                        <View style={styles.productImagePlaceholder}>
                          <Icon name="box" size={26} color="#8B0000" />
                        </View>
                      )}
                    </View>

                    <View style={styles.productDetailsBlock}>
                      <View style={styles.productTitleRow}>
                        <Typography variant="bodyBold" style={styles.productName} numberOfLines={2}>
                          {name}
                        </Typography>
                        <TouchableOpacity
                          onPress={() => handleDeleteProduct(productId)}
                          style={styles.deleteIconButton}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Icon name="trash-2" size={17} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                      <Typography variant="bodySmall" style={styles.categoryText}>
                        Category : {item.productcategory || item.category || 'General'}
                      </Typography>
                      
                      {/* Product Status Badge */}
                      <View style={styles.statusBadgeRow}>
                        <View style={[styles.statusBadge, isStockIn ? styles.badgeInStock : styles.badgeOutOfStock]}>
                          <View style={[styles.badgeDot, { backgroundColor: isStockIn ? '#059669' : '#E11D48' }]} />
                          <Typography
                            style={{
                              fontSize: 11,
                              fontFamily: 'Montserrat-SemiBold',
                              color: isStockIn ? '#059669' : '#E11D48',
                            }}
                          >
                            {isStockIn ? 'In Stock' : 'Out of Stock'}
                          </Typography>
                        </View>
                      </View>

                      {item.warranty_details ? (
                        <Typography variant="bodySmall" style={styles.warrantyText}>
                          {item.warranty_details}
                        </Typography>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                      <Typography variant="bodySmall" style={styles.statLabel}>
                        Price per qty.
                      </Typography>
                      <Typography variant="h2" style={styles.statValue}>
                        ₹ {price}
                      </Typography>
                    </View>
                    <View style={styles.statBox}>
                      <Typography variant="bodySmall" style={styles.statLabel}>
                        Stock qty.
                      </Typography>
                      <Typography variant="h2" style={styles.statValue}>
                        {stock}
                      </Typography>
                    </View>
                  </View>

                  <View style={styles.cardActionRow}>
                    <View style={styles.switchRow}>
                      <Switch 
                        value={isStockIn}
                        onValueChange={() => toggleAvailability(item)} 
                        trackColor={{ false: "#E2E8F0", true: "#86EFAC" }}
                        thumbColor={isStockIn ? "#16A34A" : "#94A3B8"}
                      />
                      <Typography variant="bodyMedium" style={styles.switchLabel}>
                        {isStockIn ? 'In Stock' : 'Out of Stock'}
                      </Typography>
                    </View>

                    <TouchableOpacity
                      onPress={() => navigation.navigate('AddProduct', { product: item })}
                      style={styles.updateCardButton}
                      activeOpacity={0.85}
                    >
                      <Typography variant="bodyMedium" style={styles.updateCardButtonText}>
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

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 110,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  heroTitle: {
    fontSize: 22,
    color: '#0F172A',
    fontFamily: 'BalooBhai2-Bold',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Montserrat-Medium',
    marginBottom: 18,
  },
  addProductButton: {
    backgroundColor: '#8B0000',
    borderRadius: 25,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  addProductButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
  },
  filterCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1E293B',
    fontFamily: 'Montserrat-Medium',
    padding: 0,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeChip: {
    backgroundColor: '#8B0000',
    borderColor: '#8B0000',
  },
  inactiveChip: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  chipText: {
    fontSize: 12,
  },
  activeChipText: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  inactiveChipText: {
    color: '#64748B',
    fontFamily: 'Montserrat-Medium',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  loadingText: {
    color: '#64748B',
    marginTop: 12,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#8B0000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  listContainer: {
    marginHorizontal: 20,
    gap: 16,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  productHeaderRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  productImageWrapper: {
    width: 76,
    height: 76,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 14,
  },
  productImage: {
    width: 76,
    height: 76,
    borderRadius: 16,
  },
  productImagePlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  productDetailsBlock: {
    flex: 1,
  },
  productTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 15,
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
    lineHeight: 20,
  },
  deleteIconButton: {
    padding: 2,
  },
  categoryText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeInStock: {
    backgroundColor: '#ECFDF5',
  },
  badgeOutOfStock: {
    backgroundColor: '#FEF2F2',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  warrantyText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 2,
    fontFamily: 'Montserrat-Medium',
  },
  statValue: {
    fontSize: 17,
    color: '#0F172A',
    fontFamily: 'BalooBhai2-Bold',
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    marginLeft: 8,
    fontSize: 12,
    color: '#334155',
    fontFamily: 'Montserrat-SemiBold',
  },
  updateCardButton: {
    backgroundColor: '#8B0000',
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 8,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  updateCardButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
  },
  workersHubCard: {
    backgroundColor: '#FEF2F2',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workersHubLeft: {
    flex: 1,
    marginRight: 10,
  },
  workersHubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  workersHubBadgeText: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    color: '#8B0000',
    letterSpacing: 0.5,
  },
  workersHubTitle: {
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 2,
  },
  workersHubDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  workersHubArrow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
});

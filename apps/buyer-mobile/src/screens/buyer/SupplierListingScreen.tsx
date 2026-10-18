import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Typography, ScreenWrapper, Logo, SafeImage } from '@constigo/shared';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCartStore } from '../../store/cartStore';
import { fetchBuyerProductDetails } from '../../services/api/buyerApi';

export const SupplierListingScreen = ({ route, navigation }: any) => {
  const { product } = route.params || {};
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { addToCart } = useCartStore();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    const prodId = product?.productid || product?._id || product?.id;
    try {
      let apiDetails: any = null;
      if (prodId) {
        try {
          const res = await fetchBuyerProductDetails(prodId);
          if (res && (res.data || res.product)) {
            apiDetails = res.data || res.product;
          }
        } catch (apiErr) {
          console.warn('[SupplierListingScreen] Details API call error:', apiErr);
        }
      }

      const current = apiDetails || product;
      if (current) {
        const supplierName =
          current.supplier?.businessInfo?.companyName ||
          current.supplier?.name ||
          current.vendorName ||
          current.business_name ||
          'Verified ConstiGo Merchant';

        const unitPriceNum = Number(current.product_price || current.price || 0);
        const unitStr = current.unit || 'Unit';
        const isAvail =
          current.product_status === 'available' ||
          current.isAvailable === true ||
          current.productStatus === 'in_stock' ||
          Number(current.stock || current.stockQty || 1) > 0;

        const mainSupplier = {
          _id: current.productid || current._id || current.id || '1',
          name: supplierName,
          distance: current.distance || '2.5 km',
          rating: current.rating || '4.8 (Verified)',
          unitPrice: `₹ ${unitPriceNum.toFixed(2)}`,
          priceColor: '#00B14F',
          estTotal: `Est. total: ₹ ${(unitPriceNum * 10).toFixed(2)} (10 ${unitStr})`,
          unitLabel: `Price per ${unitStr}`,
          isAvailable: isAvail,
          product: current,
          productimage: current.productimage || (current.images && current.images[0]),
        };

        setSuppliers([mainSupplier]);
      } else {
        setSuppliers([]);
      }
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load supplier details');
    } finally {
      setIsLoading(false);
    }
  }, [product]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <ScreenWrapper>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Profile')}
          style={styles.avatarButton}
        >
          <Icon name="user" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <Logo size="sm" />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Notifications')}
          style={styles.bellButton}
        >
          <Icon name="bell" size={24} color="#F5A623" />
        </TouchableOpacity>
      </View>

      {/* Supplier List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#8B0000" />
            <Typography variant="bodySmall" style={{ color: '#64748B', marginTop: 12 }}>
              Loading verified suppliers...
            </Typography>
          </View>
        ) : loadError ? (
          <View style={styles.centerContainer}>
            <Icon name="alert-circle" size={44} color="#EF4444" />
            <Typography variant="bodyBold" style={{ marginTop: 12, color: '#111827' }}>
              Unable to load suppliers
            </Typography>
            <Typography variant="bodySmall" style={{ color: '#64748B', textAlign: 'center', marginTop: 4 }}>
              {loadError}
            </Typography>
            <TouchableOpacity onPress={loadData} style={styles.retryButton}>
              <Typography variant="bodyMedium" style={{ color: '#FFFFFF', fontSize: 13 }}>
                Retry
              </Typography>
            </TouchableOpacity>
          </View>
        ) : suppliers.length === 0 ? (
          <View style={styles.centerContainer}>
            <Icon name="package" size={44} color="#CBD5E1" />
            <Typography variant="bodyBold" style={{ marginTop: 12, color: '#111827' }}>
              No Suppliers Listed
            </Typography>
            <Typography variant="bodySmall" style={{ color: '#64748B', textAlign: 'center', marginTop: 4 }}>
              There are currently no active suppliers listed for this item.
            </Typography>
          </View>
        ) : (
          suppliers.map((item) => (
            <View key={item._id} style={styles.card}>
              {/* Card Header: Product/Cement bag container + Info */}
              <View style={styles.cardHeader}>
                <View style={styles.productIconContainer}>
                  {item.productimage ? (
                    <SafeImage
                      uri={item.productimage}
                      style={{ width: 60, height: 60, borderRadius: 12 }}
                      fallbackIconName="box"
                    />
                  ) : (
                    <>
                      <MaterialCommunityIcon name="sack" size={32} color="#D29A5C" />
                      <View style={styles.shovelIconBadge}>
                        <MaterialCommunityIcon name="shovel" size={14} color="#8E7092" />
                      </View>
                    </>
                  )}
                </View>

                <View style={styles.headerInfo}>
                  <View style={styles.titleRow}>
                    <Typography variant="bodyBold" style={styles.supplierTitle}>
                      {item.name}
                    </Typography>
                    <View style={styles.verifiedBadge}>
                      <MaterialCommunityIcon name="check-circle" size={16} color="#00B14F" />
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Icon name="map-pin" size={12} color="#E05656" />
                      <Typography variant="bodySmall" style={styles.metaText}>
                        {item.distance}
                      </Typography>
                    </View>
                    <View style={styles.metaItem}>
                      <Icon name="star" size={12} color="#F5A623" />
                      <Typography variant="bodySmall" style={styles.metaText}>
                        {item.rating}
                      </Typography>
                    </View>
                    <View style={[styles.statusBadge, item.isAvailable !== false ? styles.statusInStock : styles.statusOutOfStock]}>
                      <Typography style={[styles.statusText, item.isAvailable !== false ? styles.statusTextIn : styles.statusTextOut]}>
                        {item.isAvailable !== false ? 'In Stock' : 'Out of Stock'}
                      </Typography>
                    </View>
                  </View>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Price & Add to Cart Section */}
              <Typography variant="bodySmall" style={styles.unitLabel}>
                {item.unitLabel}
              </Typography>

              <View style={styles.priceRow}>
                <View>
                  <Typography
                    variant="h1"
                    style={[styles.priceText, { color: item.priceColor }]}
                  >
                    {item.unitPrice}
                  </Typography>
                  <Typography variant="bodySmall" style={styles.estTotalText}>
                    {item.estTotal}
                  </Typography>
                </View>

                <TouchableOpacity
                  activeOpacity={item.isAvailable ? 0.8 : 1}
                  disabled={!item.isAvailable}
                  style={[
                    styles.addToCartButton,
                    !item.isAvailable && styles.addToCartButtonDisabled,
                  ]}
                  onPress={() => {
                    if (item.isAvailable) {
                      addToCart(item._id, 1);
                    }
                  }}
                >
                  <Typography
                    variant="bodyMedium"
                    style={[
                      styles.addToCartText,
                      !item.isAvailable && styles.addToCartTextDisabled,
                    ]}
                  >
                    Add to Cart
                  </Typography>
                </TouchableOpacity>
              </View>

              {/* Action Buttons: More Details & Compare */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.actionButton}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('SupplierDetails', { product: item.product || product })}
                >
                  <Typography variant="bodyMedium" style={styles.actionButtonText}>
                    More Details
                  </Typography>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  activeOpacity={0.7}
                  onPress={() => {}}
                >
                  <Typography variant="bodyMedium" style={styles.actionButtonText}>
                    Compare
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8B0000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#8B0000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: 14,
    overflow: 'hidden',
  },
  shovelIconBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  headerInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  supplierTitle: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
    lineHeight: 22,
  },
  verifiedBadge: {
    marginLeft: 6,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 11,
    color: '#666666',
    marginLeft: 3,
  },
  statusBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusInStock: {
    backgroundColor: '#E8F5E9',
  },
  statusOutOfStock: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
  },
  statusTextIn: {
    color: '#00B14F',
  },
  statusTextOut: {
    color: '#D32F2F',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 14,
  },
  unitLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceText: {
    fontSize: 24,
    fontFamily: 'BalooBhai2-Bold',
    lineHeight: 30,
  },
  estTotalText: {
    fontSize: 11,
    color: '#888888',
    marginTop: 2,
  },
  addToCartButton: {
    backgroundColor: '#8B0000',
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 10,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Montserrat-Bold',
  },
  addToCartTextDisabled: {
    color: '#888888',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  actionButtonText: {
    fontSize: 13,
    color: '#333333',
    fontFamily: 'Montserrat-Medium',
  },
});

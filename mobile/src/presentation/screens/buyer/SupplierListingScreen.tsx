import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Logo } from '../../components/Logo';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCartStore } from '../../../application/store/cartStore';
import { fetchBuyerProductDetails } from '../../../infrastructure/api/buyerApi';

export const SupplierListingScreen = ({ route, navigation }: any) => {
  const { product } = route.params || {};
  const [suppliers, setSuppliers] = React.useState<any[]>([]);
  const { addToCart } = useCartStore();

  React.useEffect(() => {
    const prodId = product?.productid || product?._id || product?.id;
    if (prodId) {
      fetchBuyerProductDetails(prodId).catch((err) => {
        console.log('[SupplierListingScreen] Details API:', err?.message);
      });
    }
    // Reference-accurate supplier data matching Buyer New page 8
    const mockSuppliers = [
      {
        _id: '1',
        name: 'Titan Building Supplies,\nMaterial, Pvt. Ltd',
        distance: '3.5 km',
        rating: '4.8 (140)',
        unitPrice: '₹ 385.00',
        priceColor: '#00B14F',
        estTotal: 'Est. total: ₹ 3,850.00 (10 Bags)',
        unitLabel: 'Price per Bag (50kg)',
        isAvailable: true,
      },
      {
        _id: '2',
        name: 'APEX Cement,\nCo-orporation',
        distance: '2.5 km',
        rating: '4.5 (120)',
        unitPrice: '₹ 395.00',
        priceColor: '#8B0000',
        estTotal: 'Est. total: ₹ 3,950.00 (10 Bags)',
        unitLabel: 'Price per Bag (50kg)',
        isAvailable: true,
      },
      {
        _id: '3',
        name: 'Shabani Construction\nMaterial, Co.',
        distance: '2.5 km',
        rating: '4.5 (120)',
        unitPrice: '₹ 425.00',
        priceColor: '#C4A4A4',
        estTotal: 'Est. total: ₹ 3,950.00 (10 Bags)',
        unitLabel: 'Price per Bag (50kg)',
        isAvailable: false,
      },
    ];
    setSuppliers(mockSuppliers);
  }, [product]);

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
        {suppliers.map((item) => (
          <View key={item._id} style={styles.card}>
            {/* Card Header: Product/Cement bag container + Info */}
            <View style={styles.cardHeader}>
              <View style={styles.productIconContainer}>
                <MaterialCommunityIcon name="sack" size={32} color="#D29A5C" />
                <View style={styles.shovelIconBadge}>
                  <MaterialCommunityIcon name="shovel" size={14} color="#8E7092" />
                </View>
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
                onPress={() => navigation.navigate('SupplierDetails', { product: item })}
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
        ))}
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
    paddingTop: 12,
    paddingBottom: 10,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#800000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bellButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 14,
  },
  productIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: '#EDF3F7',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  shovelIconBadge: {
    position: 'absolute',
    left: 8,
    top: 10,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  supplierTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    lineHeight: 20,
  },
  verifiedBadge: {
    marginLeft: 6,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#8A8A8E',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F2F5',
    marginVertical: 14,
  },
  unitLabel: {
    fontSize: 12,
    color: '#8A8A8E',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceText: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  estTotalText: {
    fontSize: 11,
    color: '#8A8A8E',
    marginTop: 2,
  },
  addToCartButton: {
    backgroundColor: '#8B0000',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartButtonDisabled: {
    backgroundColor: '#E6CFD2',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  addToCartTextDisabled: {
    color: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  statusInStock: {
    backgroundColor: '#ECFDF5',
  },
  statusOutOfStock: {
    backgroundColor: '#FEF2F2',
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Montserrat-SemiBold',
  },
  statusTextIn: {
    color: '#059669',
  },
  statusTextOut: {
    color: '#DC2626',
  },
});

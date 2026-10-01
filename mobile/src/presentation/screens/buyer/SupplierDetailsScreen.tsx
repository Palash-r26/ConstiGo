import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Logo } from '../../components/Logo';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import RazorpayCheckout from 'react-native-razorpay';
import { apiClient } from '../../../infrastructure/api/client';
import { RAZORPAY_KEY_ID } from '@env';

export const SupplierDetailsScreen = ({ route, navigation }: any) => {
  const { product } = route.params || {};
  const supplierName =
    product?.name ||
    product?.supplier?.businessInfo?.companyName ||
    'Titan Building Supplies,\nMaterial, Pvt. Ltd';

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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Supplier Card */}
        <View style={styles.card}>
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
                  {supplierName}
                </Typography>
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcon name="check-circle" size={16} color="#00B14F" />
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Icon name="map-pin" size={12} color="#E05656" />
                  <Typography variant="bodySmall" style={styles.metaText}>
                    {product?.distance || '3.5 km'}
                  </Typography>
                </View>
                <View style={styles.metaItem}>
                  <Icon name="star" size={12} color="#F5A623" />
                  <Typography variant="bodySmall" style={styles.metaText}>
                    {product?.rating || '4.8 (140)'}
                  </Typography>
                </View>
                <View style={[styles.statusBadge, (product?.isAvailable !== false && product?.productStatus !== 'out_of_stock') ? styles.statusInStock : styles.statusOutOfStock]}>
                  <Typography style={[styles.statusText, (product?.isAvailable !== false && product?.productStatus !== 'out_of_stock') ? styles.statusTextIn : styles.statusTextOut]}>
                    {(product?.isAvailable !== false && product?.productStatus !== 'out_of_stock') ? 'In Stock' : 'Out of Stock'}
                  </Typography>
                </View>
              </View>
            </View>
          </View>

          <Typography variant="bodySmall" style={styles.supplierDescription}>
            Verified Premium Supplier, Specializing in high-grade steel and industrial cement.
          </Typography>

          {/* Action Buttons: Call, Message, Map */}
          <View style={styles.quickActionRow}>
            <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.7}>
              <MaterialCommunityIcon name="phone" size={18} color="#8B0000" />
              <Typography variant="bodyMedium" style={styles.quickActionText}>
                Call
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.7}>
              <MaterialCommunityIcon name="comment" size={18} color="#8B0000" />
              <Typography variant="bodyMedium" style={styles.quickActionText}>
                Message
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.7}>
              <MaterialCommunityIcon name="map-marker-radius" size={18} color="#8B0000" />
              <Typography variant="bodyMedium" style={styles.quickActionText}>
                Map
              </Typography>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Performance Card */}
        <View style={styles.card}>
          <Typography variant="h2" style={styles.sectionTitle}>
            Recent Performance
          </Typography>

          {[1, 2].map((i) => (
            <View key={i} style={styles.performanceItem}>
              <View style={styles.performanceHeader}>
                <Typography variant="bodyMedium" style={styles.performanceTitle}>
                  Skyline Tower Project
                </Typography>
                <View style={styles.starsRow}>
                  {[...Array(5)].map((_, idx) => (
                    <Icon key={idx} name="star" size={12} color="#F5A623" />
                  ))}
                </View>
              </View>
              <Typography variant="bodySmall" style={styles.performanceReview}>
                "Delivered 500 tons of rebar ahead of schedule. Quality was strictly to spec. Will use again for Phase 2."
              </Typography>
            </View>
          ))}
        </View>

        {/* Logistics Card */}
        <View style={styles.card}>
          <Typography variant="h2" style={styles.sectionTitle}>
            Logistics
          </Typography>

          <View style={styles.logisticsRow}>
            <Typography variant="bodyMedium" style={styles.logisticsLabel}>
              Estimated Delivery :
            </Typography>
            <Typography variant="bodyMedium" style={styles.logisticsValue}>
              3-5 Business Days
            </Typography>
          </View>

          <View style={styles.logisticsRow}>
            <Typography variant="bodyMedium" style={styles.logisticsLabel}>
              Delivery Method :
            </Typography>
            <Typography variant="bodyMedium" style={styles.logisticsValue}>
              Flatbed Truck (Site Access Req.)
            </Typography>
          </View>

          <View style={styles.logisticsRow}>
            <Typography variant="bodyMedium" style={styles.logisticsLabel}>
              Shipping Cost :
            </Typography>
            <Typography variant="bodyMedium" style={styles.logisticsValue}>
              Included in Unit Price
            </Typography>
          </View>
        </View>

        {/* Bottom Dual Action Buttons */}
        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity
            style={styles.confirmOrderButton}
            activeOpacity={0.8}
            onPress={async () => {
              try {
                if (!product) {
                  navigation.navigate('OrderSuccess');
                  return;
                }

                const response = await apiClient.post('/orders/razorpay/create', {
                  supplier: product.supplier?._id || '1',
                  orderItems: [
                    {
                      product: product._id,
                      name: product.name,
                      qty: 1,
                      price: product.price || 385,
                    },
                  ],
                  shippingAddress: {
                    address: '123 Buyer St',
                    city: 'Mumbai',
                    postalCode: '400001',
                    location: { type: 'Point', coordinates: [72.8777, 19.076] },
                  },
                  totalPrice: product.price || 385,
                });

                const { order, razorpayOrder } = response.data;

                var options = {
                  description: 'ConstiGo Order Payment',
                  currency: razorpayOrder.currency,
                  key: RAZORPAY_KEY_ID,
                  amount: razorpayOrder.amount,
                  name: 'ConstiGo',
                  order_id: razorpayOrder.id,
                  theme: { color: '#8B0000' },
                };

                RazorpayCheckout.open(options)
                  .then(async (data: any) => {
                    await apiClient.post('/orders/razorpay/verify', {
                      razorpay_order_id: data.razorpay_order_id,
                      razorpay_payment_id: data.razorpay_payment_id,
                      razorpay_signature: data.razorpay_signature,
                    });
                    navigation.navigate('OrderSuccess');
                  })
                  .catch(() => {
                    navigation.navigate('OrderSuccess');
                  });
              } catch (error) {
                navigation.navigate('OrderSuccess');
              }
            }}
          >
            <Typography variant="bodyMedium" style={styles.confirmOrderText}>
              Confirm Order
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.downloadPdfButton}
            activeOpacity={0.8}
            onPress={() => {}}
          >
            <Typography variant="bodyMedium" style={styles.downloadPdfText}>
              Download PDF
            </Typography>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 120,
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
  supplierDescription: {
    fontSize: 11,
    color: '#8A8A8E',
    marginTop: 12,
    marginBottom: 16,
    lineHeight: 16,
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#8B0000',
    backgroundColor: '#FFFFFF',
    gap: 4,
  },
  quickActionText: {
    color: '#8B0000',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  performanceItem: {
    marginBottom: 14,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  performanceTitle: {
    color: '#8B0000',
    fontSize: 13,
    fontWeight: '700',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  performanceReview: {
    fontSize: 11,
    color: '#8A8A8E',
    lineHeight: 16,
  },
  logisticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logisticsLabel: {
    color: '#8B0000',
    fontSize: 13,
    fontWeight: '600',
  },
  logisticsValue: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '600',
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  confirmOrderButton: {
    flex: 1,
    backgroundColor: '#8B0000',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmOrderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  downloadPdfButton: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#8B0000',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadPdfText: {
    color: '#8B0000',
    fontSize: 14,
    fontWeight: '700',
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

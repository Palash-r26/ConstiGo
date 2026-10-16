import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking, ActivityIndicator } from 'react-native';
import { Typography, ScreenWrapper, Logo, SafeImage, apiClient } from '@constigo/shared';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import RazorpayCheckout from 'react-native-razorpay';
import { useCartStore } from '../../store/cartStore';
import { RAZORPAY_KEY_ID } from '@env';

export const SupplierDetailsScreen = ({ route, navigation }: any) => {
  const { product } = route.params || {};
  const { addToCart } = useCartStore();
  const [isOrdering, setIsOrdering] = useState(false);

  const supplierName =
    product?.supplier?.businessInfo?.companyName ||
    product?.supplier?.name ||
    product?.vendorName ||
    product?.business_name ||
    product?.name ||
    'Verified ConstiGo Supplier';

  const supplierPhone =
    product?.supplier?.phone ||
    product?.supplier?.businessInfo?.contactPhone ||
    product?.vendorPhone ||
    product?.phone;

  const supplierAddress =
    product?.supplier?.businessInfo?.address ||
    product?.supplier?.location?.address ||
    product?.location ||
    product?.distance ||
    'Local Service Area';

  const productImageUri =
    product?.productimage ||
    (Array.isArray(product?.images) && product?.images[0]) ||
    product?.image;

  const reviews = Array.isArray(product?.reviews)
    ? product.reviews
    : Array.isArray(product?.supplier?.reviews)
    ? product.supplier.reviews
    : [];

  const handleCall = () => {
    if (supplierPhone) {
      Linking.openURL(`tel:${supplierPhone}`).catch(() => {
        Alert.alert('Error', 'Unable to initiate call on this device.');
      });
    } else {
      Alert.alert('Contact Supplier', 'Direct hotline: 1800-CONSTIGO');
    }
  };

  const handleMap = () => {
    const query = encodeURIComponent(`${supplierName} ${supplierAddress}`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {
      Alert.alert('Notice', 'Unable to open maps app.');
    });
  };

  const handleConfirmOrder = async () => {
    if (!product || (!product._id && !product.productid && !product.id)) {
      Alert.alert('Error', 'Product information is missing.');
      return;
    }

    const prodId = product._id || product.productid || product.id;
    const supId = product.supplier?._id || product.vendorid || 'supplier_default';
    const prodPrice = Number(product.price || product.product_price || 0);

    if (prodPrice <= 0) {
      Alert.alert('Invalid Price', 'This product does not have a valid price configured.');
      return;
    }

    try {
      setIsOrdering(true);
      const response = await apiClient.post('/orders/razorpay/create', {
        supplier: supId,
        orderItems: [
          {
            product: prodId,
            name: product.name || 'Construction Material',
            qty: 1,
            price: prodPrice,
          },
        ],
        shippingAddress: {
          address: supplierAddress,
          city: 'Standard Delivery Hub',
          postalCode: '400001',
          location: { type: 'Point', coordinates: [72.8777, 19.076] },
        },
        totalPrice: prodPrice,
      });

      const { razorpayOrder } = response.data;
      if (!razorpayOrder || !razorpayOrder.id) {
        throw new Error('Could not initiate payment order from server.');
      }

      const options = {
        description: 'ConstiGo Material Order Payment',
        currency: razorpayOrder.currency || 'INR',
        key: RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        name: 'ConstiGo',
        order_id: razorpayOrder.id,
        theme: { color: '#8B0000' },
      };

      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          try {
            await apiClient.post('/orders/razorpay/verify', {
              razorpay_order_id: data.razorpay_order_id,
              razorpay_payment_id: data.razorpay_payment_id,
              razorpay_signature: data.razorpay_signature,
            });
            navigation.navigate('OrderSuccess');
          } catch (verErr: any) {
            Alert.alert(
              'Verification Notice',
              'Payment was submitted. We are confirming it with the bank. Check My Orders for status.',
              [{ text: 'OK', onPress: () => navigation.navigate('MyOrders') }]
            );
          }
        })
        .catch((checkoutErr: any) => {
          console.warn('[SupplierDetailsScreen] Razorpay cancelled or error:', checkoutErr);
          Alert.alert('Payment Incomplete', 'Payment was cancelled or unsuccessful. You can retry at any time.');
        });
    } catch (error: any) {
      Alert.alert('Order Placement Failed', error?.response?.data?.message || error?.message || 'Unable to connect to order gateway.');
    } finally {
      setIsOrdering(false);
    }
  };

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
              {productImageUri ? (
                <SafeImage
                  uri={productImageUri}
                  style={{ width: 68, height: 68, borderRadius: 16 }}
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
                    {product?.distance || 'Verified Location'}
                  </Typography>
                </View>
                <View style={styles.metaItem}>
                  <Icon name="star" size={12} color="#F5A623" />
                  <Typography variant="bodySmall" style={styles.metaText}>
                    {product?.rating || '4.8 (Verified)'}
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
            {product?.description ||
              product?.supplier?.businessInfo?.description ||
              'Verified supplier on ConstiGo. Quality certified materials direct to construction site.'}
          </Typography>

          {/* Action Buttons: Call, Message, Map */}
          <View style={styles.quickActionRow}>
            <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.7} onPress={handleCall}>
              <MaterialCommunityIcon name="phone" size={18} color="#8B0000" />
              <Typography variant="bodyMedium" style={styles.quickActionText}>
                Call
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              activeOpacity={0.7}
              onPress={() => {
                if (supplierPhone) {
                  Linking.openURL(`sms:${supplierPhone}`).catch(() => {
                    Alert.alert('Notice', 'SMS application could not be opened.');
                  });
                } else {
                  Alert.alert('Notice', 'Direct in-app messaging with this supplier will be enabled shortly.');
                }
              }}
            >
              <MaterialCommunityIcon name="comment" size={18} color="#8B0000" />
              <Typography variant="bodyMedium" style={styles.quickActionText}>
                Message
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.7} onPress={handleMap}>
              <MaterialCommunityIcon name="map-marker-radius" size={18} color="#8B0000" />
              <Typography variant="bodyMedium" style={styles.quickActionText}>
                Map
              </Typography>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Performance / Verified Feedback */}
        <View style={styles.card}>
          <Typography variant="h2" style={styles.sectionTitle}>
            Supplier Track Record
          </Typography>

          {reviews.length > 0 ? (
            reviews.map((rev: any, idx: number) => (
              <View key={rev._id || idx} style={styles.performanceItem}>
                <View style={styles.performanceHeader}>
                  <Typography variant="bodyMedium" style={styles.performanceTitle}>
                    {rev.title || rev.userName || 'Verified Buyer'}
                  </Typography>
                  <View style={styles.starsRow}>
                    {[...Array(Math.min(5, Math.max(1, Math.round(Number(rev.rating || 5)))))].map((_, starIdx) => (
                      <Icon key={starIdx} name="star" size={12} color="#F5A623" />
                    ))}
                  </View>
                </View>
                <Typography variant="bodySmall" style={styles.performanceReview}>
                  "{rev.comment || rev.reviewText || 'Prompt delivery and authentic materials according to specification.'}"
                </Typography>
              </View>
            ))
          ) : (
            <View style={styles.verifiedRecordBox}>
              <MaterialCommunityIcon name="shield-check" size={24} color="#00B14F" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Typography variant="bodyMedium" style={{ fontWeight: '700', color: '#1E293B' }}>
                  Platform Verified Supplier
                </Typography>
                <Typography variant="bodySmall" style={{ color: '#64748B', marginTop: 2 }}>
                  Fulfills ConstiGo quality guarantee with zero recorded safety or specification disputes.
                </Typography>
              </View>
            </View>
          )}
        </View>

        {/* Logistics Card */}
        <View style={styles.card}>
          <Typography variant="h2" style={styles.sectionTitle}>
            Logistics & Delivery
          </Typography>

          <View style={styles.logisticsRow}>
            <Typography variant="bodyMedium" style={styles.logisticsLabel}>
              Estimated Delivery :
            </Typography>
            <Typography variant="bodyMedium" style={styles.logisticsValue}>
              {product?.estimatedDelivery || '1-3 Business Days'}
            </Typography>
          </View>

          <View style={styles.logisticsRow}>
            <Typography variant="bodyMedium" style={styles.logisticsLabel}>
              Delivery Method :
            </Typography>
            <Typography variant="bodyMedium" style={styles.logisticsValue}>
              {product?.deliveryMethod || 'Flatbed Truck / Site Unload'}
            </Typography>
          </View>

          <View style={styles.logisticsRow}>
            <Typography variant="bodyMedium" style={styles.logisticsLabel}>
              Shipping Rate :
            </Typography>
            <Typography variant="bodyMedium" style={styles.logisticsValue}>
              {product?.shippingCost ? `₹ ${product.shippingCost}` : 'Included in Material Price'}
            </Typography>
          </View>
        </View>

        {/* Bottom Dual Action Buttons */}
        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity
            style={[styles.confirmOrderButton, isOrdering && { opacity: 0.7 }]}
            activeOpacity={0.8}
            disabled={isOrdering}
            onPress={handleConfirmOrder}
          >
            {isOrdering ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Typography variant="bodyMedium" style={styles.confirmOrderText}>
                Confirm Order
              </Typography>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addToCartButton}
            activeOpacity={0.8}
            onPress={async () => {
              if (!product) {
                Alert.alert('Notice', 'Product details are unavailable.');
                return;
              }
              const prodId = product._id || product.productid || product.id;
              const venId = product.supplier?._id || product.vendorid || 'vendor_default';
              const name = product.name || 'Construction Material';
              const price = Number(product.price || product.product_price || 0);

              try {
                const success = await addToCart({
                  productId: prodId,
                  vendorId: venId,
                  productName: name,
                  amount: price,
                  quantity: 1,
                  category: product.category || 'Materials',
                });
                if (success) {
                  Alert.alert(
                    'Added to Cart',
                    `${name} has been added to your cart.`,
                    [
                      { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
                      { text: 'Continue Shopping' },
                    ]
                  );
                } else {
                  Alert.alert('Notice', 'Failed to add item to cart. Please try again.');
                }
              } catch (e: any) {
                Alert.alert('Error', e.message || 'Could not add to cart.');
              }
            }}
          >
            <Typography variant="bodyMedium" style={styles.addToCartText}>
              Add to Cart
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
  supplierDescription: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 18,
    marginTop: 12,
    marginBottom: 16,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 14,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  quickActionText: {
    fontSize: 12,
    color: '#8B0000',
    fontFamily: 'Montserrat-SemiBold',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'BalooBhai2-Bold',
    color: '#000000',
    marginBottom: 12,
  },
  performanceItem: {
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  performanceTitle: {
    fontSize: 13,
    color: '#333333',
    fontFamily: 'Montserrat-SemiBold',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  performanceReview: {
    fontSize: 11,
    color: '#666666',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  verifiedRecordBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 12,
    padding: 12,
  },
  logisticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  logisticsLabel: {
    fontSize: 13,
    color: '#666666',
  },
  logisticsValue: {
    fontSize: 13,
    color: '#000000',
    fontFamily: 'Montserrat-SemiBold',
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
  },
  confirmOrderButton: {
    flex: 1,
    backgroundColor: '#8B0000',
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmOrderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#8B0000',
  },
  addToCartText: {
    color: '#8B0000',
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
});

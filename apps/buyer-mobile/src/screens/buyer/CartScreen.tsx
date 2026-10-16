import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Typography, ScreenWrapper, Logo, SafeImage } from '@constigo/shared';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCartStore } from '../../store/cartStore';
import { useFocusEffect } from '@react-navigation/native';

export const CartScreen = ({ navigation }: any) => {
  const { items: cartItems, subTotal, fetchCart, removeItem } = useCartStore();

  useFocusEffect(
    React.useCallback(() => {
      fetchCart();
    }, [])
  );

  const renderIcon = (type: string) => {
    if (type?.toLowerCase().includes('brick')) {
      return <MaterialCommunityIcon name="wall" size={36} color="#C26D45" />;
    }
    if (type?.toLowerCase().includes('cement')) {
      return <MaterialCommunityIcon name="sack" size={36} color="#D29A5C" />;
    }
    return <MaterialCommunityIcon name="view-parallel" size={36} color="#8A9BA8" />;
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
        {/* Title and Subtitle */}
        <Typography variant="h1" style={styles.title}>
          Shopping Cart
        </Typography>
        <Typography variant="bodySmall" style={styles.subtitle}>
          {cartItems.length > 0
            ? `${cartItems.length} Item(s) In Your Cart`
            : 'Your cart is currently empty'}
        </Typography>

        {cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="shopping-bag" size={54} color="#CBD5E1" />
            <Typography variant="h2" style={{ marginTop: 14, color: '#1E293B' }}>
              Your Cart is Empty
            </Typography>
            <Typography variant="bodySmall" style={{ color: '#64748B', textAlign: 'center', marginTop: 4 }}>
              Browse construction materials and equipment to add them to your cart.
            </Typography>
            <TouchableOpacity
              onPress={() => navigation.navigate('Home')}
              style={styles.startShoppingButton}
            >
              <Typography variant="bodyMedium" style={{ color: '#FFFFFF', fontFamily: 'Montserrat-Bold' }}>
                Browse Catalog
              </Typography>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Cart Items List */}
            <View style={styles.listContainer}>
              {cartItems.map((item: any) => {
                const itemId = item._id || item.id || item.productid;
                const itemName = item.productname || item.name || 'Construction Item';
                const itemCategory = item.product_category || item.category || 'Materials';
                const priceNum = Number(item.amount || item.price || 0);
                const itemPrice = `₹ ${priceNum.toLocaleString('en-IN')}/-`;
                const itemSub = item.quantity ? `Qty: ${item.quantity}` : (item.subPrice || 'In Stock');
                const imgUri = item.productimage || item.image;

                return (
                  <View key={itemId} style={styles.cartCard}>
                    <View style={styles.cardMainRow}>
                      {/* Thumbnail */}
                      <View style={styles.thumbnailContainer}>
                        {imgUri ? (
                          <SafeImage uri={imgUri} style={{ width: 68, height: 68, borderRadius: 16 }} fallbackIconName="box" />
                        ) : (
                          renderIcon(item.type || itemCategory)
                        )}
                      </View>

                      {/* Details */}
                      <View style={styles.detailsContainer}>
                        <View style={styles.topDetailsRow}>
                          <View style={styles.textDetails}>
                            <Typography variant="bodySmall" style={styles.categoryText}>
                              {itemCategory}
                            </Typography>
                            <Typography variant="bodyBold" style={styles.productName}>
                              {itemName}
                            </Typography>
                          </View>

                          <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.heartButton}
                          >
                            <MaterialCommunityIcon
                              name={item.isFavorite ? 'cards-heart' : 'heart-outline'}
                              size={18}
                              color={item.isFavorite ? '#E05656' : '#8A8A8E'}
                            />
                          </TouchableOpacity>
                        </View>

                        {/* Price Row */}
                        <View style={styles.priceRow}>
                          <Typography variant="bodyBold" style={styles.priceText}>
                            {itemPrice}{' '}
                          </Typography>
                          <Typography variant="bodySmall" style={styles.subPriceText}>
                            {itemSub}
                          </Typography>
                        </View>

                        {/* Rating & Delete Button Row */}
                        <View style={styles.bottomRow}>
                          <View style={styles.starsRow}>
                            {[...Array(5)].map((_, idx) => (
                              <Icon key={idx} name="star" size={12} color="#F5A623" />
                            ))}
                          </View>

                          <TouchableOpacity
                            style={styles.deleteButton}
                            activeOpacity={0.8}
                            onPress={() => removeItem(itemId)}
                          >
                            <Typography variant="bodySmall" style={styles.deleteText}>
                              Delete
                            </Typography>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Proceed to Checkout Button */}
            <TouchableOpacity
              style={styles.checkoutButton}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Checkout')}
            >
              <Typography variant="bodyMedium" style={styles.checkoutButtonText}>
                Proceed to Checkout {subTotal > 0 ? `(₹ ${subTotal.toLocaleString('en-IN')})` : ''}
              </Typography>
            </TouchableOpacity>
          </>
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
  },
  title: {
    fontSize: 22,
    fontFamily: 'BalooBhai2-Bold',
    color: '#000000',
    textAlign: 'center',
    marginTop: 6,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  startShoppingButton: {
    marginTop: 20,
    backgroundColor: '#8B0000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  listContainer: {
    gap: 16,
  },
  cartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardMainRow: {
    flexDirection: 'row',
  },
  thumbnailContainer: {
    width: 72,
    height: 72,
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textDetails: {
    flex: 1,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 11,
    color: '#8A8A8E',
    marginBottom: 2,
  },
  productName: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 18,
  },
  heartButton: {
    padding: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  priceText: {
    fontSize: 14,
    color: '#000000',
  },
  subPriceText: {
    fontSize: 11,
    color: '#8A8A8E',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  deleteButton: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  deleteText: {
    fontSize: 12,
    color: '#E05656',
    fontFamily: 'Montserrat-SemiBold',
  },
  checkoutButton: {
    backgroundColor: '#8B0000',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
  },
});

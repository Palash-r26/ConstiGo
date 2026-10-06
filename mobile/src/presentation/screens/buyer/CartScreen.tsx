import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Logo } from '../../components/Logo';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCartStore } from '../../../application/store/cartStore';
import { useFocusEffect } from '@react-navigation/native';

export const CartScreen = ({ navigation }: any) => {
  const { items: cartItems, subTotal, fetchCart, removeItem } = useCartStore();

  useFocusEffect(
    React.useCallback(() => {
      fetchCart();
    }, [])
  );

  const mockCartItems = [
    {
      _id: '1',
      productid: 'CVP300926224904',
      category: 'Bricks',
      name: 'Jindal Red Bricks Type I',
      price: '₹ 20,000/-',
      subPrice: '₹10 Each',
      isFavorite: true,
      type: 'bricks',
    },
    {
      _id: '2',
      productid: 'CVP300926224905',
      category: 'Steel',
      name: 'JSW Steel & Iron Type II',
      price: '₹ 4,800/-',
      subPrice: '₹80 per kg',
      isFavorite: false,
      type: 'steel',
    },
  ];

  const displayItems = cartItems.length > 0 ? cartItems : mockCartItems;

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
            : 'Two Item Is In Your Cart'}
        </Typography>

        {/* Cart Items List */}
        <View style={styles.listContainer}>
          {displayItems.map((item: any) => {
            const itemId = item._id || item.id || item.productid;
            const itemName = item.productname || item.name;
            const itemCategory = item.product_category || item.category || 'Materials';
            const itemPrice = item.price
              ? (typeof item.price === 'number' ? `₹ ${item.price}/-` : item.price)
              : (item.amount ? `₹ ${item.amount}/-` : '₹ 400/-');
            const itemSub = item.quantity ? `Qty: ${item.quantity}` : (item.subPrice || 'In Stock');

            return (
              <View key={itemId} style={styles.cartCard}>
                <View style={styles.cardMainRow}>
                  {/* Thumbnail */}
                  <View style={styles.thumbnailContainer}>
                    {renderIcon(item.type || itemCategory)}
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
            Proceed to Checkout {subTotal > 0 ? `(₹ ${subTotal})` : ''}
          </Typography>
        </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 12,
    color: '#8A8A8E',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  listContainer: {
    gap: 16,
  },
  cartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardMainRow: {
    flexDirection: 'row',
    gap: 14,
  },
  thumbnailContainer: {
    width: 76,
    height: 76,
    borderRadius: 18,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  categoryText: {
    fontSize: 11,
    color: '#8A8A8E',
    marginBottom: 2,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  heartButton: {
    paddingLeft: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#28A745',
  },
  subPriceText: {
    fontSize: 11,
    color: '#E05656',
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  deleteButton: {
    backgroundColor: '#8B0000',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  checkoutButton: {
    backgroundColor: '#8B0000',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

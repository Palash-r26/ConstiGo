import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Logo } from '../../components/Logo';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUserStore } from '../../../application/store/userStore';
import { useFocusEffect } from '@react-navigation/native';

export const WishlistScreen = ({ navigation }: any) => {
  const { profile, fetchProfile, isLoading, toggleWishlist } = useUserStore();

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [])
  );

  const mockWishlist = [
    {
      _id: '1',
      name: 'Product Name',
      price: '₹ 350.00',
      unit: 'per gram',
      type: 'steel',
    },
    {
      _id: '2',
      name: 'Product Name',
      price: '₹ 350.00',
      unit: 'per gram',
      type: 'cement',
    },
    {
      _id: '3',
      name: 'Product Name',
      price: '₹ 350.00',
      unit: 'per gram',
      type: 'bricks',
    },
    {
      _id: '4',
      name: 'Product Name',
      price: '₹ 350.00',
      unit: 'per gram',
      type: 'steel',
    },
    {
      _id: '5',
      name: 'Product Name',
      price: '₹ 350.00',
      unit: 'per gram',
      type: 'cement',
    },
    {
      _id: '6',
      name: 'Product Name',
      price: '₹ 350.00',
      unit: 'per gram',
      type: 'bricks',
    },
  ];

  const renderIcon = (type: string) => {
    if (type === 'cement') {
      return <MaterialCommunityIcon name="sack" size={32} color="#D29A5C" />;
    }
    if (type === 'bricks') {
      return <MaterialCommunityIcon name="wall" size={32} color="#C26D45" />;
    }
    return <MaterialCommunityIcon name="view-parallel" size={32} color="#8A9BA8" />;
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
          Favourite
        </Typography>
        <Typography variant="bodySmall" style={styles.subtitle}>
          Your Favourite Item Is Here
        </Typography>

        {/* 3-Column Grid */}
        <View style={styles.gridContainer}>
          {mockWishlist.map((item) => (
            <View key={item._id} style={styles.gridCard}>
              <TouchableOpacity
                style={styles.heartButton}
                activeOpacity={0.8}
                onPress={() => toggleWishlist(item._id)}
              >
                <MaterialCommunityIcon name="cards-heart" size={14} color="#8B0000" />
              </TouchableOpacity>

              <View style={styles.thumbnailContainer}>
                {renderIcon(item.type)}
              </View>

              <Typography variant="bodyBold" style={styles.productName}>
                {item.name}
              </Typography>

              <View style={styles.priceRow}>
                <Typography variant="bodyBold" style={styles.priceBold}>
                  {item.price}{' '}
                </Typography>
                <Typography variant="bodySmall" style={styles.unitText}>
                  {item.unit}
                </Typography>
              </View>

              <TouchableOpacity
                style={styles.quotationButton}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate('SupplierListing', { product: item })
                }
              >
                <Typography variant="bodyMedium" style={styles.quotationText}>
                  Get Quatation
                </Typography>
              </TouchableOpacity>
            </View>
          ))}
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
    paddingHorizontal: 12,
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  gridCard: {
    width: '31.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 8,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 10,
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  thumbnailContainer: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#F7F8FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  productName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginVertical: 4,
  },
  priceBold: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8B0000',
  },
  unitText: {
    fontSize: 7,
    color: '#8A8A8E',
  },
  quotationButton: {
    backgroundColor: '#8B0000',
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 2,
  },
  quotationText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
  },
});

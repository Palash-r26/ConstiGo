import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Typography, ScreenWrapper, Logo, SafeImage } from '@constigo/shared';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUserStore } from '../../store/userStore';
import { useFocusEffect } from '@react-navigation/native';

export const WishlistScreen = ({ navigation }: any) => {
  const { profile, fetchProfile, isLoading, toggleWishlist } = useUserStore();

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [])
  );

  const wishlistItems: any[] = Array.isArray(profile?.wishlist) ? profile.wishlist : [];

  const renderIcon = (type: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('cement')) {
      return <MaterialCommunityIcon name="sack" size={32} color="#D29A5C" />;
    }
    if (t.includes('brick')) {
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
          Favourites
        </Typography>
        <Typography variant="bodySmall" style={styles.subtitle}>
          {wishlistItems.length > 0
            ? `${wishlistItems.length} saved item(s)`
            : 'Your saved items appear here'}
        </Typography>

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#8B0000" />
            <Typography variant="bodySmall" style={{ color: '#64748B', marginTop: 12 }}>
              Loading favourites...
            </Typography>
          </View>
        ) : wishlistItems.length === 0 ? (
          <View style={styles.centerContainer}>
            <Icon name="heart" size={54} color="#CBD5E1" />
            <Typography variant="h2" style={{ marginTop: 14, color: '#1E293B' }}>
              No Favourites Yet
            </Typography>
            <Typography variant="bodySmall" style={{ color: '#64748B', textAlign: 'center', marginTop: 4 }}>
              Items you mark as favourite while exploring materials and suppliers will appear here.
            </Typography>
            <TouchableOpacity
              onPress={() => navigation.navigate('Home')}
              style={styles.browseButton}
            >
              <Typography variant="bodyMedium" style={{ color: '#FFFFFF', fontFamily: 'Montserrat-Bold' }}>
                Browse Catalog
              </Typography>
            </TouchableOpacity>
          </View>
        ) : (
          /* 3-Column Grid */
          <View style={styles.gridContainer}>
            {wishlistItems.map((item) => {
              const itemId = item._id || item.id || item.productid;
              const imgUri = item.productimage || item.image || (Array.isArray(item.images) && item.images[0]);
              const priceNum = Number(item.price || item.product_price || 0);

              return (
                <View key={itemId} style={styles.gridCard}>
                  <TouchableOpacity
                    style={styles.heartButton}
                    activeOpacity={0.8}
                    onPress={() => toggleWishlist(itemId, item.vendorid || item.supplier?._id)}
                  >
                    <MaterialCommunityIcon name="cards-heart" size={14} color="#8B0000" />
                  </TouchableOpacity>

                  <View style={styles.thumbnailContainer}>
                    {imgUri ? (
                      <SafeImage uri={imgUri} style={{ width: 44, height: 44, borderRadius: 10 }} fallbackIconName="box" />
                    ) : (
                      renderIcon(item.category || item.name)
                    )}
                  </View>

                  <Typography variant="bodyBold" style={styles.productName} numberOfLines={1}>
                    {item.name || item.productname}
                  </Typography>

                  <View style={styles.priceRow}>
                    <Typography variant="bodyBold" style={styles.priceBold}>
                      ₹ {priceNum.toFixed(2)}{' '}
                    </Typography>
                    <Typography variant="bodySmall" style={styles.unitText}>
                      {item.unit ? `per ${item.unit}` : ''}
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
                      Get Quotation
                    </Typography>
                  </TouchableOpacity>
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
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  browseButton: {
    marginTop: 20,
    backgroundColor: '#8B0000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
    marginBottom: 4,
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  thumbnailContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 8,
    overflow: 'hidden',
  },
  productName: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  priceBold: {
    fontSize: 11,
    color: '#000000',
  },
  unitText: {
    fontSize: 9,
    color: '#8A8A8E',
  },
  quotationButton: {
    width: '100%',
    backgroundColor: '#8B0000',
    borderRadius: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  quotationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
  },
});

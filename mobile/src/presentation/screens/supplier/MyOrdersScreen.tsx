import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { SupplierTopHeader } from '../../components/SupplierTopHeader';
import Icon from 'react-native-vector-icons/Feather';

export const MyOrdersScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<'all' | 'accepted' | 'declined'>('all');

  const orders = [
    {
      id: '1',
      title: 'Jindal Red Bricks',
      subType: 'Type I/II',
      distance: '3.5 km far',
      badge: 'Geniune Customer',
      unitLabel: 'Number of Item',
      unitValue: '2000.',
      estTotal: 'Est. total: ₹ 20,000.00 (₹10 each)',
      status: 'pending',
      type: 'brick',
    },
    {
      id: '2',
      title: 'JSW Steel & Iron',
      subType: 'Type I/II',
      distance: '15 km far',
      badge: 'Geniune Customer',
      unitLabel: 'Item In Kg.',
      unitValue: '60kg',
      estTotal: 'Est. total: ₹ 4,800.00 (₹80 per kg)',
      status: 'pending',
      type: 'steel',
    },
  ];

  return (
    <ScreenWrapper className="bg-[#F5F6FA]">
      <SupplierTopHeader
        onProfilePress={() => navigation?.navigate('Profile')}
        onNotificationPress={() => {}}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleContainer}>
          <Typography variant="h1" style={styles.mainTitle}>
            My Orders
          </Typography>
          <Typography variant="bodySmall" style={styles.subtitle}>
            View your inventory pricing, and visibility
          </Typography>
        </View>

        {/* Filter Segmented Pill Container */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeTab === 'all' ? styles.filterTabActive : styles.filterTabInactive,
            ]}
            onPress={() => setActiveTab('all')}
            activeOpacity={0.8}
          >
            <Typography
              variant="bodySemiBold"
              style={[
                styles.filterTabText,
                activeTab === 'all'
                  ? styles.filterTabTextActive
                  : styles.filterTabTextInactive,
              ]}
            >
              All Orders
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeTab === 'accepted' ? styles.filterTabActive : styles.filterTabInactive,
            ]}
            onPress={() => setActiveTab('accepted')}
            activeOpacity={0.8}
          >
            <Typography
              variant="bodySemiBold"
              style={[
                styles.filterTabText,
                activeTab === 'accepted'
                  ? styles.filterTabTextActive
                  : styles.filterTabTextInactive,
              ]}
            >
              Accepted
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeTab === 'declined' ? styles.filterTabActive : styles.filterTabInactive,
            ]}
            onPress={() => setActiveTab('declined')}
            activeOpacity={0.8}
          >
            <Typography
              variant="bodySemiBold"
              style={[
                styles.filterTabText,
                activeTab === 'declined'
                  ? styles.filterTabTextActive
                  : styles.filterTabTextInactive,
              ]}
            >
              Declined
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Orders List */}
        <View style={styles.ordersList}>
          {orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              {/* Card Header Row */}
              <View style={styles.cardHeaderRow}>
                {/* 3D Icon Box */}
                <View style={styles.productIconContainer}>
                  {order.type === 'brick' ? (
                    <View style={styles.brickIconPlaceholder}>
                      <Icon name="layers" size={28} color="#C2410C" />
                    </View>
                  ) : (
                    <View style={styles.steelIconPlaceholder}>
                      <Icon name="grid" size={28} color="#475569" />
                    </View>
                  )}
                </View>

                {/* Info */}
                <View style={styles.productInfo}>
                  <Typography variant="bodyLarge" style={styles.productTitle}>
                    {order.title}
                  </Typography>
                  <Typography variant="bodyBold" style={styles.productType}>
                    {order.subType}
                  </Typography>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Icon name="map-pin" size={12} color="#DC2626" />
                      <Typography variant="bodySmall" style={styles.metaText}>
                        {order.distance}
                      </Typography>
                    </View>

                    <View style={styles.metaItem}>
                      <Icon name="star" size={12} color="#EAB308" />
                      <Typography variant="bodySmall" style={styles.metaText}>
                        {order.badge}
                      </Typography>
                    </View>
                  </View>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.cardDivider} />

              {/* Card Middle: Unit Details + Mini Map */}
              <View style={styles.cardMiddleRow}>
                <View style={styles.unitDetails}>
                  <Typography variant="bodySmall" style={styles.unitLabel}>
                    {order.unitLabel}
                  </Typography>
                  <Typography variant="h1" style={styles.unitValue}>
                    {order.unitValue}
                  </Typography>
                  <Typography variant="bodySmall" style={styles.estTotal}>
                    {order.estTotal}
                  </Typography>
                </View>

                {/* Mini Route Map Preview */}
                <View style={styles.miniMapContainer}>
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&auto=format&fit=crop&q=60',
                    }}
                    style={styles.miniMapImage}
                    resizeMode="cover"
                  />
                  <View style={styles.mapPinDot}>
                    <Icon name="map-pin" size={10} color="#DC2626" />
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  activeOpacity={0.85}
                  onPress={() => {}}
                >
                  <Typography variant="bodyBold" style={styles.acceptButtonText}>
                    Accept Order
                  </Typography>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.declineButton}
                  activeOpacity={0.85}
                  onPress={() => {}}
                >
                  <Typography variant="bodySemiBold" style={styles.declineButtonText}>
                    Decline Order
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 26,
    color: '#0F172A',
    fontFamily: 'BalooBhai2-Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Montserrat-Medium',
    marginTop: 4,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 6,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabActive: {
    backgroundColor: '#8B0000',
  },
  filterTabInactive: {
    backgroundColor: '#F1F5F9',
  },
  filterTabText: {
    fontSize: 13,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  filterTabTextInactive: {
    color: '#475569',
    fontFamily: 'Montserrat-Medium',
  },
  ordersList: {
    gap: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  productIconContainer: {
    width: 65,
    height: 65,
    borderRadius: 16,
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brickIconPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  steelIconPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 17,
    color: '#0F172A',
    fontFamily: 'Montserrat-Bold',
  },
  productType: {
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'Montserrat-SemiBold',
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Montserrat-Medium',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  cardMiddleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  unitDetails: {
    flex: 1,
  },
  unitLabel: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Montserrat-Medium',
  },
  unitValue: {
    fontSize: 22,
    color: '#00B67A',
    fontFamily: 'BalooBhai2-Bold',
    lineHeight: 28,
  },
  estTotal: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Montserrat-Medium',
    marginTop: 2,
  },
  miniMapContainer: {
    width: 110,
    height: 55,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  miniMapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  mapPinDot: {
    position: 'absolute',
    top: '30%',
    left: '45%',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#8B0000',
    borderRadius: 22,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Montserrat-Bold',
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 22,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButtonText: {
    color: '#64748B',
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
  },
});

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { SupplierTopHeader } from '../../components/SupplierTopHeader';
import { SafeImage } from '../../components/SafeImage';
import Icon from 'react-native-vector-icons/Feather';
import { useAuthStore } from '../../../application/store/authStore';
import {
  fetchVendorOrdersAll,
  fetchVendorOrdersAcceptedList,
  fetchVendorOrdersDeclinedList,
  acceptVendorOrder,
  declineVendorOrder,
} from '../../../infrastructure/api/vendorApi';

export interface SupplierOrder {
  id: string;
  _id?: string;
  orderid?: string;
  buyerid?: string;
  productid?: string;
  title: string;
  subType: string;
  distance: string;
  badge: string;
  unitLabel: string;
  unitValue: string;
  estTotal: string;
  total?: number;
  status: 'pending' | 'accepted' | 'declined';
  type: 'brick' | 'steel' | 'cement' | 'sand' | string;
  buyerName?: string;
  date?: string;
  productImage?: string;
}

export const MyOrdersScreen = ({ navigation }: any) => {
  const user = useAuthStore((state) => state.user);
  const vendorId = user?.vendorid || user?._id;

  const [activeTab, setActiveTab] = useState<'all' | 'accepted' | 'declined'>('all');
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async (tab = activeTab) => {
    if (!vendorId) {
      setIsLoading(false);
      setOrders([]);
      setLoadError('Please log in with your supplier account to view incoming orders.');
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);
      let response: any;
      if (tab === 'accepted') {
        response = await fetchVendorOrdersAcceptedList(vendorId);
      } else if (tab === 'declined') {
        response = await fetchVendorOrdersDeclinedList(vendorId);
      } else {
        response = await fetchVendorOrdersAll(vendorId);
      }

      let rawList: any[] = [];
      if (Array.isArray(response)) {
        rawList = response;
      } else if (response && Array.isArray(response.data)) {
        rawList = response.data;
      } else if (response && Array.isArray(response.orders)) {
        rawList = response.orders;
      }

      if (rawList && rawList.length > 0) {
        const mapped: SupplierOrder[] = rawList.map((item: any, idx: number) => {
          const rawStatus = String(item.status || item.order_status || (tab === 'all' ? 'pending' : tab)).toLowerCase();
          const normalizedStatus: 'pending' | 'accepted' | 'declined' =
            rawStatus.includes('accept')
              ? 'accepted'
              : rawStatus.includes('declin') || rawStatus.includes('reject')
              ? 'declined'
              : 'pending';

          const prodName = item.productname || item.name || item.product_name || `Order #${item.orderid || idx + 1}`;
          const pType = (item.productcategory || item.category || item.type || 'brick').toLowerCase();
          const inferredType = pType.includes('steel') ? 'steel' : pType.includes('cement') ? 'cement' : 'brick';
          const itemAmount = Number(item.amount || item.total || item.product_price || 0);

          return {
            id: String(item.orderid || item.id || idx + 1),
            _id: String(item.orderid || item._id || item.id || `ORD-${idx + 1000}`),
            orderid: String(item.orderid || item._id || item.id || ''),
            buyerid: String(item.buyerid || item.buyer_id || ''),
            productid: String(item.productid || item.product_id || ''),
            title: prodName,
            subType: item.product_description || item.subType || item.productcategory || 'Standard Material',
            distance: item.distance || 'Service Area',
            badge: item.badge || 'Verified Buyer',
            unitLabel: item.unitLabel || 'Quantity',
            unitValue: item.quantity ? `${item.quantity} Units` : item.unitValue || '1 Unit',
            estTotal: itemAmount > 0 ? `Est. total: ₹ ${itemAmount.toLocaleString('en-IN')}` : 'Price on request',
            total: itemAmount,
            status: normalizedStatus,
            type: inferredType,
            buyerName: item.buyer_name || item.buyerName || item.fullname || 'ConstiGo Buyer',
            date: item.created_at || item.date || 'Today',
            productImage: item.productimage || item.image,
          };
        });
        setOrders(mapped);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      console.warn('[MyOrdersScreen] Failed to load orders from API:', err);
      setLoadError(err?.message || 'Unable to retrieve orders from backend');
      setOrders([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, vendorId]);

  useEffect(() => {
    loadOrders(activeTab);
  }, [activeTab, loadOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders(activeTab);
  };

  const handleAcceptOrder = async (order: SupplierOrder) => {
    if (!vendorId) {
      Alert.alert('Notice', 'Please log in to accept orders.');
      return;
    }
    try {
      await acceptVendorOrder({
        vendorid: vendorId,
        buyerid: order.buyerid || '',
        orderid: order.orderid || order._id || order.id,
        productid: order.productid || '',
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: 'accepted' } : o))
      );
      Alert.alert(
        'Order Accepted! 🎉',
        `You accepted the order for ${order.title}. Buyer has been notified to proceed with delivery.`,
        [
          {
            text: 'View Details',
            onPress: () => navigation.navigate('OrderDetails', { order: { ...order, status: 'accepted', vendorid: vendorId } }),
          },
          { text: 'OK', style: 'default' },
        ]
      );
    } catch (err: any) {
      console.warn('[MyOrdersScreen] acceptVendorOrder API error:', err);
      Alert.alert('Notice', err?.message || 'Could not update order status on the server.');
    }
  };

  const handleDeclineOrder = (order: SupplierOrder) => {
    Alert.alert(
      'Decline Order',
      `Are you sure you want to decline this order for ${order.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            if (!vendorId) return;
            try {
              await declineVendorOrder({
                vendorid: vendorId,
                buyerid: order.buyerid || '',
                orderid: order.orderid || order._id || order.id,
                productid: order.productid || '',
              });
              setOrders((prev) =>
                prev.map((o) => (o.id === order.id ? { ...o, status: 'declined' } : o))
              );
              Alert.alert('Order Declined', `Order for ${order.title} has been declined.`);
            } catch (err: any) {
              console.warn('[MyOrdersScreen] declineVendorOrder API error:', err);
              Alert.alert('Notice', err?.message || 'Failed to decline order.');
            }
          },
        },
      ]
    );
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true;
    return o.status === activeTab;
  });

  return (
    <ScreenWrapper>
      {/* Top Header */}
      <SupplierTopHeader navigation={navigation} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8B0000']}
            tintColor="#8B0000"
          />
        }
      >
        {/* Filter Pills */}
        <View style={styles.filterTabsRow}>
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
              All Orders ({orders.length})
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
              Accepted ({orders.filter((o) => o.status === 'accepted').length})
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
              Declined ({orders.filter((o) => o.status === 'declined').length})
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Loading / Error / Empty States */}
        {isLoading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#8B0000" />
            <Typography variant="bodySmall" style={{ color: '#64748B', marginTop: 12 }}>
              Loading supplier orders...
            </Typography>
          </View>
        ) : loadError ? (
          <View style={styles.emptyContainer}>
            <Icon name="alert-circle" size={48} color="#EF4444" />
            <Typography variant="bodyBold" style={{ marginTop: 12, color: '#111827' }}>
              Unable to load orders
            </Typography>
            <Typography variant="bodySmall" style={{ color: '#64748B', textAlign: 'center', marginTop: 4 }}>
              {loadError}
            </Typography>
            <TouchableOpacity onPress={() => loadOrders(activeTab)} style={styles.retryButton}>
              <Typography variant="bodyMedium" style={{ color: '#FFFFFF', fontSize: 13 }}>
                Retry
              </Typography>
            </TouchableOpacity>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="package" size={48} color="#CBD5E1" />
            <Typography variant="bodyBold" style={styles.emptyTitle}>
              No {activeTab !== 'all' ? activeTab : ''} orders found
            </Typography>
            <Typography variant="bodySmall" style={styles.emptySubtitle}>
              Incoming orders from buyers will appear here automatically.
            </Typography>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {filteredOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                activeOpacity={0.92}
                onPress={() => navigation.navigate('OrderDetails', { order: { ...order, vendorid: vendorId } })}
              >
                {/* Card Header Row */}
                <View style={styles.cardHeaderRow}>
                  {/* Icon Box / Product Image */}
                  <View style={styles.productIconContainer}>
                    {order.productImage ? (
                      <SafeImage
                        uri={order.productImage}
                        style={{ width: 56, height: 56, borderRadius: 12 }}
                        fallbackIconName="box"
                      />
                    ) : order.type === 'brick' ? (
                      <View style={styles.brickIconPlaceholder}>
                        <Icon name="layers" size={26} color="#C2410C" />
                      </View>
                    ) : order.type === 'steel' ? (
                      <View style={styles.steelIconPlaceholder}>
                        <Icon name="grid" size={26} color="#475569" />
                      </View>
                    ) : (
                      <View style={styles.brickIconPlaceholder}>
                        <Icon name="box" size={26} color="#8B0000" />
                      </View>
                    )}
                  </View>

                  {/* Info */}
                  <View style={styles.productInfo}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="bodyLarge" style={styles.productTitle}>
                        {order.title}
                      </Typography>
                      {/* Status Tag */}
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 10,
                          backgroundColor:
                            order.status === 'accepted'
                              ? '#DCFCE7'
                              : order.status === 'declined'
                              ? '#FEE2E2'
                              : '#FEF3C7',
                        }}
                      >
                        <Typography
                          style={{
                            fontSize: 10,
                            fontFamily: 'Montserrat-Bold',
                            color:
                              order.status === 'accepted'
                                ? '#16A34A'
                                : order.status === 'declined'
                                ? '#DC2626'
                                : '#D97706',
                            textTransform: 'uppercase',
                          }}
                        >
                          {order.status}
                        </Typography>
                      </View>
                    </View>
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

                {/* Card Middle: Unit Details */}
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
                </View>

                {/* Action Buttons */}
                {order.status === 'pending' ? (
                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      activeOpacity={0.85}
                      onPress={() => handleAcceptOrder(order)}
                    >
                      <Icon name="check" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Typography variant="bodyBold" style={styles.acceptButtonText}>
                        Accept Order
                      </Typography>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.declineButton}
                      activeOpacity={0.85}
                      onPress={() => handleDeclineOrder(order)}
                    >
                      <Icon name="x" size={15} color="#64748B" style={{ marginRight: 6 }} />
                      <Typography variant="bodySemiBold" style={styles.declineButtonText}>
                        Decline Order
                      </Typography>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, marginTop: 4, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                    <Typography style={{ fontSize: 12, color: order.status === 'accepted' ? '#16A34A' : '#DC2626', fontFamily: 'Montserrat-SemiBold' }}>
                      {order.status === 'accepted' ? '✓ Order Confirmed & In Progress' : '✕ Order Declined'}
                    </Typography>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('OrderDetails', { order: { ...order, vendorid: vendorId } })}
                      style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14 }}
                    >
                      <Typography style={{ fontSize: 11, color: '#334155', fontFamily: 'Montserrat-SemiBold' }}>
                        View Details →
                      </Typography>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterTabActive: {
    backgroundColor: '#8B0000',
    borderColor: '#8B0000',
  },
  filterTabInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  filterTabText: {
    fontSize: 12,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  filterTabTextInactive: {
    color: '#64748B',
    fontFamily: 'Montserrat-Medium',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#1E293B',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#8B0000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  ordersList: {
    gap: 14,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
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
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
    color: '#1E293B',
  },
  productType: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  cardMiddleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  unitDetails: {
    flex: 1,
  },
  unitLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  unitValue: {
    fontSize: 20,
    fontFamily: 'BalooBhai2-Bold',
    color: '#00B14F',
    marginVertical: 2,
  },
  estTotal: {
    fontSize: 12,
    color: '#475569',
    fontFamily: 'Montserrat-Medium',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B0000',
    paddingVertical: 10,
    borderRadius: 14,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 14,
  },
  declineButtonText: {
    color: '#475569',
    fontSize: 13,
  },
});

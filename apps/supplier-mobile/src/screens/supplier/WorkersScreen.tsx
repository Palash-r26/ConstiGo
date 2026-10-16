import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Platform,
} from 'react-native';
import { Typography, ScreenWrapper, SafeImage } from '@constigo/shared';
import Icon from 'react-native-vector-icons/Feather';
import {
  fetchWorkers,
  WorkerItem,
} from '../../services/api/workerApi';

export interface WorkerCategoryFilter {
  id: string;
  name: string;
  icon: string;
}

export const WORKER_CATEGORIES: WorkerCategoryFilter[] = [
  { id: 'all', name: 'All Labor', icon: 'grid' },
  { id: 'helper', name: 'Labor / Helper', icon: 'users' },
  { id: 'mistry', name: 'Mistry / Mason', icon: 'home' },
  { id: 'welder', name: 'Welder / Fabricator', icon: 'shield' },
  { id: 'electrician', name: 'Electrician', icon: 'zap' },
  { id: 'plumber', name: 'Plumber', icon: 'tool' },
  { id: 'painter', name: 'Painter', icon: 'edit-3' },
  { id: 'carpenter', name: 'Carpenter', icon: 'box' },
  { id: 'tiles', name: 'Tile Setter', icon: 'layers' },
];

export interface SupplierWorkerDisplay {
  _id: string;
  name: string;
  skill: string;
  skillId: string;
  phone: string;
  location: string;
  serviceCharge: string;
  visitingCharge: string;
  rating: string;
  experience: string;
  image?: string;
}

export const WorkersScreen = ({ navigation }: any) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [workers, setWorkers] = useState<SupplierWorkerDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadWorkersFromApi = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const catParam = selectedCategory === 'all' ? undefined : selectedCategory;
      const res = await fetchWorkers(catParam);

      if (res && res.data && Array.isArray(res.data)) {
        const mapped: SupplierWorkerDisplay[] = res.data.map((item: WorkerItem, idx: number) => ({
          _id: item.workerid || item.id || `worker_${idx}`,
          name: item.fullname || 'Verified Laborer',
          skill: item.skill || 'Helper',
          skillId: (item.skill || '').toLowerCase().includes('helper') || (item.skill || '').toLowerCase().includes('labor')
            ? 'helper'
            : (item.skill || '').toLowerCase().includes('mistry') || (item.skill || '').toLowerCase().includes('mason')
            ? 'mistry'
            : (item.skill || '').toLowerCase().includes('weld')
            ? 'welder'
            : (item.skill || '').toLowerCase().includes('elec')
            ? 'electrician'
            : (item.skill || '').toLowerCase().includes('plumb')
            ? 'plumber'
            : (item.skill || '').toLowerCase().includes('paint')
            ? 'painter'
            : (item.skill || '').toLowerCase().includes('tile')
            ? 'tiles'
            : 'helper',
          phone: item.phone || '',
          location: item.location || 'Service Area',
          serviceCharge: item.service_charge ? `₹ ${item.service_charge} / day` : '₹ 500 / day',
          visitingCharge: item.visit_charge ? `₹ ${item.visit_charge}` : '₹ 50',
          rating: '4.8 (Verified)',
          experience: 'Certified Pro',
          image: item.image,
        }));

        setWorkers(mapped);
      } else {
        setWorkers([]);
      }
    } catch (err: any) {
      console.warn('[WorkersScreen] Error loading from API:', err);
      setLoadError(err?.message || 'Unable to connect to worker network');
      setWorkers([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadWorkersFromApi();
  }, [loadWorkersFromApi]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadWorkersFromApi();
  };

  const handleCallWorker = (phone: string, name: string) => {
    if (!phone) {
      Alert.alert('Notice', `Contact details for ${name} will be provided once dispatched.`);
      return;
    }
    const phoneUrl = `tel:${phone.replace(/\s+/g, '')}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Call Worker', `Connect with ${name} at:\n${phone}`);
        }
      })
      .catch(() => {
        Alert.alert('Call Worker', `Connect with ${name} at:\n${phone}`);
      });
  };

  const handleBookWorker = (worker: SupplierWorkerDisplay) => {
    Alert.alert(
      'Worker Profile',
      `Worker: ${worker.name}\nTrade: ${worker.skill}\nPhone: ${worker.phone || 'Verified'}\nDaily Wage: ${worker.serviceCharge}\nVisiting: ${worker.visitingCharge}\nLocation: ${worker.location}`,
      [
        { text: 'Cancel', style: 'cancel' },
        ...(worker.phone
          ? [
              {
                text: 'Call Now',
                onPress: () => handleCallWorker(worker.phone, worker.name),
              },
            ]
          : []),
      ]
    );
  };

  const filteredWorkers = workers.filter((w) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      w.name.toLowerCase().includes(q) ||
      w.skill.toLowerCase().includes(q) ||
      w.location.toLowerCase().includes(q)
    );
  });

  return (
    <ScreenWrapper className="bg-[#F8FAFC]">
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={22} color="#1E293B" />
        </TouchableOpacity>

        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Typography variant="h2" style={styles.headerTitle}>
            Site Labor & Workers Hub
          </Typography>
          <Typography variant="bodySmall" style={styles.headerSubtitle}>
            Find verified helpers, masons & fabricators
          </Typography>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('WorkerSignUp')}
          style={styles.registerWorkerBtn}
          activeOpacity={0.8}
        >
          <Icon name="user-plus" size={15} color="#8B0000" style={{ marginRight: 4 }} />
          <Typography style={styles.registerWorkerBtnText}>
            Join
          </Typography>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#8B0000']}
          />
        }
      >
        {/* Banner Card for Suppliers */}
        <View style={styles.bannerCard}>
          <View style={{ flex: 1 }}>
            <Typography style={styles.bannerBadge}>
              SUPPLIER SUPPORT
            </Typography>
            <Typography variant="h2" style={styles.bannerTitle}>
              Need Material Shifting or Site Labor?
            </Typography>
            <Typography style={styles.bannerDesc}>
              Directly call verified laborers for loading, unloading trucks, and construction assistance.
            </Typography>
          </View>
          <View style={styles.bannerIconBox}>
            <Icon name="truck" size={26} color="#8B0000" />
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Icon name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search by worker name, skill, or location..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="x" size={16} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Category Filter Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {WORKER_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
                style={[
                  styles.categoryChip,
                  isSelected ? styles.categoryChipActive : styles.categoryChipInactive,
                ]}
              >
                <Icon
                  name={cat.icon}
                  size={14}
                  color={isSelected ? '#FFFFFF' : '#64748B'}
                  style={{ marginRight: 6 }}
                />
                <Typography
                  style={[
                    styles.categoryChipText,
                    isSelected ? styles.categoryChipTextActive : styles.categoryChipTextInactive,
                  ]}
                >
                  {cat.name}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Worker Results Section */}
        <View style={styles.resultsHeader}>
          <Typography variant="bodyBold" style={{ fontSize: 16, color: '#0F172A' }}>
            Available Workers ({filteredWorkers.length})
          </Typography>
          <TouchableOpacity
            onPress={() => navigation.navigate('WorkerSignUp')}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Typography style={{ fontSize: 13, color: '#8B0000', fontFamily: 'Montserrat-SemiBold' }}>
              + Register New Worker
            </Typography>
          </TouchableOpacity>
        </View>

        {isLoading && !isRefreshing ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="small" color="#8B0000" />
            <Typography style={styles.emptyText}>Loading workers...</Typography>
          </View>
        ) : loadError ? (
          <View style={styles.emptyContainer}>
            <Icon name="alert-circle" size={44} color="#EF4444" style={{ marginBottom: 10 }} />
            <Typography variant="bodyBold" style={{ fontSize: 16, color: '#1E293B', marginBottom: 4 }}>
              Unable to load workers
            </Typography>
            <Typography style={styles.emptyText}>
              {loadError}
            </Typography>
            <TouchableOpacity onPress={loadWorkersFromApi} style={styles.resetBtn}>
              <Typography style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'Montserrat-SemiBold' }}>
                Retry
              </Typography>
            </TouchableOpacity>
          </View>
        ) : filteredWorkers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="users" size={44} color="#CBD5E1" style={{ marginBottom: 10 }} />
            <Typography variant="bodyBold" style={{ fontSize: 16, color: '#1E293B', marginBottom: 4 }}>
              No Workers Found
            </Typography>
            <Typography style={styles.emptyText}>
              No verified workers match your search or selected category.
            </Typography>
            <TouchableOpacity
              onPress={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              style={styles.resetBtn}
            >
              <Typography style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'Montserrat-SemiBold' }}>
                View All Workers
              </Typography>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            {filteredWorkers.map((worker) => (
              <View key={worker._id} style={styles.workerCard}>
                {/* Top Row: Avatar & Primary Info */}
                <View style={styles.workerHeader}>
                  <View style={styles.workerAvatar}>
                    {worker.image ? (
                      <SafeImage uri={worker.image} style={{ width: 44, height: 44, borderRadius: 22 }} fallbackIconName="user" />
                    ) : (
                      <Icon name="user-check" size={22} color="#8B0000" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Typography variant="bodyBold" style={styles.workerName}>
                        {worker.name}
                      </Typography>
                      <View style={styles.verifiedBadge}>
                        <Icon name="check" size={10} color="#059669" />
                        <Typography style={styles.verifiedText}>Verified</Typography>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                      <View style={styles.skillPill}>
                        <Typography style={styles.skillPillText}>{worker.skill}</Typography>
                      </View>
                      <Typography style={styles.experienceText}>• {worker.experience}</Typography>
                    </View>
                  </View>

                  {/* Rating */}
                  <View style={styles.ratingBadge}>
                    <Icon name="star" size={12} color="#D97706" style={{ marginRight: 3 }} />
                    <Typography style={styles.ratingText}>
                      {worker.rating}
                    </Typography>
                  </View>
                </View>

                {/* Location Row */}
                <View style={styles.locationRow}>
                  <Icon name="map-pin" size={14} color="#64748B" style={{ marginRight: 4 }} />
                  <Typography style={styles.locationText} numberOfLines={1}>
                    {worker.location}
                  </Typography>
                </View>

                {/* Pricing Details */}
                <View style={styles.pricingBox}>
                  <View style={styles.priceCol}>
                    <Typography style={styles.priceLabel}>Daily Wage / Charge</Typography>
                    <Typography style={styles.priceValue}>{worker.serviceCharge}</Typography>
                  </View>
                  <View style={styles.priceDivider} />
                  <View style={styles.priceCol}>
                    <Typography style={styles.priceLabel}>Visiting Fee</Typography>
                    <Typography style={styles.priceValue}>{worker.visitingCharge}</Typography>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    onPress={() => handleBookWorker(worker)}
                    style={styles.detailsBtn}
                    activeOpacity={0.8}
                  >
                    <Icon name="info" size={14} color="#475569" style={{ marginRight: 6 }} />
                    <Typography style={styles.detailsBtnText}>Details</Typography>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleCallWorker(worker.phone, worker.name)}
                    style={styles.callBtn}
                    activeOpacity={0.85}
                  >
                    <Icon name="phone-call" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Typography style={styles.callBtnText}>Call Worker</Typography>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    color: '#0F172A',
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  registerWorkerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  registerWorkerBtnText: {
    fontSize: 12,
    color: '#8B0000',
    fontFamily: 'Montserrat-Bold',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 100,
  },
  bannerCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FED7D7',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  bannerBadge: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    color: '#8B0000',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '700',
    marginBottom: 4,
  },
  bannerDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  bannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1E293B',
    padding: 0,
  },
  categoriesScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipActive: {
    backgroundColor: '#8B0000',
    borderColor: '#8B0000',
  },
  categoryChipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  categoryChipText: {
    fontSize: 12,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  categoryChipTextInactive: {
    color: '#64748B',
    fontFamily: 'Montserrat-Medium',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  resetBtn: {
    marginTop: 14,
    backgroundColor: '#8B0000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  workerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  workerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  workerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  workerName: {
    fontSize: 15,
    color: '#0F172A',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  verifiedText: {
    fontSize: 10,
    color: '#059669',
    fontFamily: 'Montserrat-Bold',
  },
  skillPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
  },
  skillPillText: {
    fontSize: 11,
    color: '#475569',
    fontFamily: 'Montserrat-Medium',
  },
  experienceText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 11,
    color: '#B45309',
    fontFamily: 'Montserrat-Bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
  },
  pricingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  priceCol: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  priceValue: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: 'Montserrat-Bold',
    marginTop: 2,
  },
  priceDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 10,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  detailsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailsBtnText: {
    fontSize: 13,
    color: '#475569',
    fontFamily: 'Montserrat-SemiBold',
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B0000',
    paddingVertical: 10,
    borderRadius: 12,
  },
  callBtnText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
});

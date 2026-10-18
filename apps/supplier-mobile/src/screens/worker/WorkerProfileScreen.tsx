import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Typography, ScreenWrapper, Logo, useAuthStore } from '@constigo/shared';
import Icon from 'react-native-vector-icons/Feather';
import { findWorkerByPhoneOrId, WorkerItem } from '../../services/api/workerApi';

export const WorkerProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuthStore();
  const [workerData, setWorkerData] = useState<WorkerItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const identifier = user?.workerid || user?.phone || user?._id;
      if (identifier) {
        const found = await findWorkerByPhoneOrId(String(identifier));
        if (found) {
          setWorkerData(found);
        } else {
          // Fallback to auth store user data
          setWorkerData({
            id: String(user?._id || '1'),
            workerid: user?.workerid || String(user?._id || 'CW_DEFAULT'),
            fullname: user?.fullname || user?.firstName || 'Worker Pro',
            phone: user?.phone || '',
            skill: user?.skill || 'General Labor',
            location: user?.location || 'Indore, MP',
            service_charge: user?.service_charge || '600',
            visit_charge: user?.visit_charge || '150',
          });
        }
      }
    } catch (err) {
      console.warn('[WorkerProfile] Failed to load worker profile:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Re-fetch when focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfile();
    });
    return unsubscribe;
  }, [navigation, loadProfile]);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of your Worker account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const skillsList = workerData?.skill
    ? workerData.skill
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <ScreenWrapper className="bg-white">
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Logo size="sm" style={{ marginRight: 8 }} />
          <View>
            <Typography variant="bodyBold" style={{ fontSize: 16, color: '#111827' }}>
              Worker Portal
            </Typography>
            <Typography style={{ fontSize: 11, color: '#059669', fontFamily: 'Montserrat-SemiBold' }}>
              Verified Partner
            </Typography>
          </View>
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.8}>
          <Icon name="log-out" size={16} color="#DC2626" style={{ marginRight: 4 }} />
          <Typography style={styles.logoutText}>Logout</Typography>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              loadProfile();
            }}
            colors={['#8B0000']}
          />
        }
      >
        {isLoading && !workerData ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#8B0000" />
            <Typography style={{ color: '#6B7280', fontSize: 13, marginTop: 10 }}>
              Loading your profile details...
            </Typography>
          </View>
        ) : (
          <>
            {/* Worker Identity Card */}
            <View style={styles.profileHeroCard}>
              <View style={styles.avatarCircle}>
                <Typography style={styles.avatarInitial}>
                  {(workerData?.fullname || user?.firstName || 'W')[0].toUpperCase()}
                </Typography>
                <View style={styles.verifiedTick}>
                  <Icon name="check" size={11} color="#FFFFFF" />
                </View>
              </View>

              <Typography variant="h1Black" style={styles.workerName}>
                {workerData?.fullname || user?.firstName || 'Registered Worker'}
              </Typography>

              <View style={styles.workerIdBadge}>
                <Icon name="hash" size={12} color="#8B0000" style={{ marginRight: 2 }} />
                <Typography style={styles.workerIdText}>
                  ID: {workerData?.workerid || user?.workerid || 'CW-PRO'}
                </Typography>
              </View>

              {/* Status Switcher */}
              <TouchableOpacity
                style={[styles.statusPill, isAvailable ? styles.statusPillActive : styles.statusPillBusy]}
                activeOpacity={0.85}
                onPress={() => setIsAvailable(!isAvailable)}
              >
                <View style={[styles.statusDot, isAvailable ? styles.statusDotActive : styles.statusDotBusy]} />
                <Typography style={[styles.statusPillText, isAvailable ? { color: '#065F46' } : { color: '#991B1B' }]}>
                  {isAvailable ? 'Available for Work' : 'Busy / Off-Duty'}
                </Typography>
              </TouchableOpacity>
            </View>

            {/* Quick Action: Edit Profile Button */}
            <TouchableOpacity
              style={styles.editActionBtn}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('WorkerEditProfile', {
                  worker: workerData,
                })
              }
            >
              <Icon name="edit-3" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Typography style={styles.editActionBtnText}>Edit Profile & Change Data</Typography>
            </TouchableOpacity>

            {/* Registered Trade Skills Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="tool" size={16} color="#8B0000" style={{ marginRight: 6 }} />
                  <Typography variant="bodyBold" style={styles.sectionTitle}>
                    My Registered Trades & Skills
                  </Typography>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('WorkerEditProfile', {
                      worker: workerData,
                    })
                  }
                >
                  <Typography style={styles.changeLink}>Change</Typography>
                </TouchableOpacity>
              </View>

              <View style={styles.chipsCloud}>
                {skillsList.length > 0 ? (
                  skillsList.map((skillItem, index) => (
                    <View key={`${skillItem}_${index}`} style={styles.skillChip}>
                      <Icon name="check-circle" size={13} color="#8B0000" style={{ marginRight: 5 }} />
                      <Typography style={styles.skillChipText}>{skillItem}</Typography>
                    </View>
                  ))
                ) : (
                  <Typography style={{ color: '#6B7280', fontSize: 13, fontStyle: 'italic' }}>
                    No specific skill tagged. Tap Edit to add your crafts.
                  </Typography>
                )}
              </View>
            </View>

            {/* Service Charges & Rates Card */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="dollar-sign" size={16} color="#059669" style={{ marginRight: 6 }} />
                  <Typography variant="bodyBold" style={styles.sectionTitle}>
                    Service Charges & Rates
                  </Typography>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('WorkerEditProfile', {
                      worker: workerData,
                    })
                  }
                >
                  <Typography style={styles.changeLink}>Update Rates</Typography>
                </TouchableOpacity>
              </View>

              <View style={styles.rateRow}>
                <View style={styles.rateBox}>
                  <Typography style={styles.rateLabel}>Daily Labor Rate</Typography>
                  <Typography style={styles.rateValue}>
                    {workerData?.service_charge ? `₹ ${workerData.service_charge} / day` : '₹ 600 / day'}
                  </Typography>
                  <Typography style={styles.rateSub}>Full Day On-Site Shift</Typography>
                </View>

                <View style={styles.rateBox}>
                  <Typography style={styles.rateLabel}>Inspection / Visiting</Typography>
                  <Typography style={styles.rateValue}>
                    {workerData?.visit_charge ? `₹ ${workerData.visit_charge}` : '₹ 150'}
                  </Typography>
                  <Typography style={styles.rateSub}>Site Survey & Checkup</Typography>
                </View>
              </View>
            </View>

            {/* Contact & Service Location Card */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="map-pin" size={16} color="#2563EB" style={{ marginRight: 6 }} />
                  <Typography variant="bodyBold" style={styles.sectionTitle}>
                    Contact & Work Location
                  </Typography>
                </View>
              </View>

              <View style={styles.infoLine}>
                <Icon name="phone" size={15} color="#64748B" style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Typography style={styles.infoLabel}>Primary Mobile</Typography>
                  <Typography style={styles.infoValue}>{workerData?.phone || 'Not configured'}</Typography>
                </View>
              </View>

              <View style={[styles.infoLine, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                <Icon name="map" size={15} color="#64748B" style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Typography style={styles.infoLabel}>Operating City / Base Area</Typography>
                  <Typography style={styles.infoValue}>
                    {workerData?.location || 'Indore, Madhya Pradesh'}
                  </Typography>
                </View>
              </View>
            </View>

            {/* Information Banner */}
            <View style={styles.infoBanner}>
              <Icon name="shield" size={18} color="#8B0000" style={{ marginRight: 8, marginTop: 2 }} />
              <Typography style={styles.infoBannerText}>
                Contractors and suppliers across ConstiGo can call you directly on your mobile for bookings based
                on your rates.
              </Typography>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 14,
  },
  profileHeroCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#8B0000',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 10,
    elevation: 3,
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'Montserrat-Bold',
  },
  verifiedTick: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10B981',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerName: {
    fontSize: 20,
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  workerIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0E0',
    marginBottom: 12,
  },
  workerIdText: {
    color: '#8B0000',
    fontSize: 11,
    fontFamily: 'Montserrat-Bold',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusPillActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusPillBusy: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusDotActive: {
    backgroundColor: '#10B981',
  },
  statusDotBusy: {
    backgroundColor: '#EF4444',
  },
  statusPillText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
  },
  editActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B0000',
    borderRadius: 20,
    paddingVertical: 14,
    elevation: 3,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  editActionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#0F172A',
  },
  changeLink: {
    color: '#8B0000',
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
  },
  chipsCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  skillChipText: {
    color: '#8B0000',
    fontSize: 12,
    fontFamily: 'Montserrat-SemiBold',
  },
  rateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rateBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  rateLabel: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Montserrat-Medium',
    marginBottom: 4,
  },
  rateValue: {
    fontSize: 16,
    color: '#0F172A',
    fontFamily: 'Montserrat-Bold',
    marginBottom: 2,
  },
  rateSub: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'Montserrat-Regular',
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'Montserrat-Regular',
  },
  infoValue: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: 'Montserrat-SemiBold',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  infoBannerText: {
    color: '#8B0000',
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    flex: 1,
    lineHeight: 16,
  },
});

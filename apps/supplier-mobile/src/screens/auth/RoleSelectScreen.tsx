import React from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Typography, ScreenWrapper, Logo } from '@constigo/shared';
import Icon from 'react-native-vector-icons/Feather';

export const RoleSelectScreen = ({ navigation }: any) => {
  return (
    <ScreenWrapper className="bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Logo - Shifted upwards without excessive empty space */}
        <View style={styles.logoContainer}>
          <Logo size="md" style={{ marginBottom: 8 }} />
          <Typography variant="h1Black" style={styles.title}>
            Partner Portal
          </Typography>
          <Typography variant="bodySmall" style={styles.subtitle}>
            Welcome to ConstiGo! Please select your profile to continue.
          </Typography>
        </View>

        {/* 1. ARE YOU A SUPPLIER? CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconCircle, styles.supplierIconCircle]}>
              <Icon name="package" size={24} color="#8B0000" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.badgeRow}>
                <View style={styles.supplierBadge}>
                  <Typography style={styles.badgeTextSupplier}>MATERIALS & MERCHANTS</Typography>
                </View>
              </View>
              <Typography variant="h2" style={styles.cardTitle}>
                Are you a Supplier?
              </Typography>
            </View>
          </View>

          <Typography variant="bodySmall" style={styles.cardDescription}>
            Manage product inventory, view customer orders, and respond to quote requests.
          </Typography>

          <TouchableOpacity
            style={styles.primaryActionBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SignIn')}
          >
            <Typography style={styles.primaryActionBtnText}>Sign In as Supplier</Typography>
            <Icon name="arrow-right" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <View style={styles.cardFooterLink}>
            <Typography style={styles.footerNoteText}>Don't have an account? </Typography>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')} activeOpacity={0.7}>
              <Typography style={styles.footerHighlightLink}>Sign Up</Typography>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. ARE YOU A WORKER? CARD */}
        <View style={[styles.card, styles.workerCard]}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconCircle, styles.workerIconCircle]}>
              <Icon name="tool" size={24} color="#047857" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.badgeRow}>
                <View style={styles.workerBadge}>
                  <Typography style={styles.badgeTextWorker}>CONSTRUCTION LABORS & SKILLS</Typography>
                </View>
              </View>
              <Typography variant="h2" style={styles.cardTitle}>
                Are you a Worker?
              </Typography>
            </View>
          </View>

          <Typography variant="bodySmall" style={styles.cardDescription}>
            Showcase your trade skills, update daily labor rates, and receive site job bookings.
          </Typography>

          <TouchableOpacity
            style={[styles.primaryActionBtn, styles.workerActionBtn]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('WorkerSignIn')}
          >
            <Typography style={styles.primaryActionBtnText}>Sign In as Worker</Typography>
            <Icon name="arrow-right" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <View style={styles.cardFooterLink}>
            <Typography style={styles.footerNoteText}>New worker looking for site work? </Typography>
            <TouchableOpacity onPress={() => navigation.navigate('WorkerSignUp')} activeOpacity={0.7}>
              <Typography style={[styles.footerHighlightLink, { color: '#047857' }]}>
                Register as Worker
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  title: {
    fontSize: 26,
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  workerCard: {
    borderColor: '#D1FAE5',
    shadowColor: '#047857',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supplierIconCircle: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  workerIconCircle: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  supplierBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeTextSupplier: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    color: '#8B0000',
    letterSpacing: 0.5,
  },
  workerBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeTextWorker: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    color: '#047857',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 19,
    fontFamily: 'Montserrat-Bold',
    color: '#111827',
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 16,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B0000',
    borderRadius: 9999,
    paddingVertical: 14,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  workerActionBtn: {
    backgroundColor: '#047857',
    shadowColor: '#047857',
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
  },
  cardFooterLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  footerNoteText: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Montserrat-Medium',
  },
  footerHighlightLink: {
    fontSize: 13,
    color: '#8B0000',
    fontFamily: 'Montserrat-Bold',
    textDecorationLine: 'underline',
  },
});

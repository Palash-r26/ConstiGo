import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Logo } from './Logo';
import Icon from 'react-native-vector-icons/Feather';

interface SupplierTopHeaderProps {
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
}

export const SupplierTopHeader = ({
  onProfilePress,
  onNotificationPress,
}: SupplierTopHeaderProps) => {
  return (
    <View style={styles.container}>
      {/* Left Avatar Icon */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onProfilePress}
        style={styles.avatarButton}
      >
        <Icon name="user" size={19} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Center Logo */}
      <View style={styles.logoWrapper}>
        <Logo size="sm" />
      </View>

      {/* Right Notification Bell Icon */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onNotificationPress}
        style={styles.bellButton}
      >
        <View style={styles.bellContainer}>
          <Icon name="bell" size={20} color="#8B0000" />
          <View style={styles.bellBadge} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 6 : 8,
    paddingBottom: 10,
    minHeight: 56,
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B0000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  bellContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});

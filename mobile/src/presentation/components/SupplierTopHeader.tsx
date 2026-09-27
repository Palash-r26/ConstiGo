import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
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
        <View style={styles.avatarInner}>
          <Icon name="user" size={20} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Center Logo */}
      <Logo size="sm" />

      {/* Right Notification Bell Icon */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onNotificationPress}
        style={styles.bellButton}
      >
        <View style={styles.bellContainer}>
          <Icon name="bell" size={24} color="#D97706" />
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
    paddingTop: 12,
    paddingBottom: 8,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8B0000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 0,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
});

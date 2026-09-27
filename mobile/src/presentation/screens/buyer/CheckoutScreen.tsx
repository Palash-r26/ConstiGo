import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Logo } from '../../components/Logo';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCartStore } from '../../../application/store/cartStore';

export const CheckoutScreen = ({ navigation }: any) => {
  const { clearCart } = useCartStore();
  const [selectedMethod, setSelectedMethod] = React.useState('card');
  const [cardName, setCardName] = React.useState('');
  const [cardNumber, setCardNumber] = React.useState('');
  const [cardType, setCardType] = React.useState('');
  const [validUpto, setValidUpto] = React.useState('');

  const handlePay = async () => {
    await clearCart();
    navigation.navigate('OrderSuccess');
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
        {/* Title */}
        <Typography variant="h1" style={styles.pageTitle}>
          Confirm Address
        </Typography>

        {/* Payment Methods */}
        <View style={styles.methodsContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedMethod('cash')}
            style={[
              styles.methodPill,
              selectedMethod === 'cash' && styles.methodPillSelected,
            ]}
          >
            <Typography
              variant="bodyMedium"
              style={[
                styles.methodText,
                selectedMethod === 'cash' && styles.methodTextSelected,
              ]}
            >
              Cash
            </Typography>
            {selectedMethod === 'cash' && (
              <MaterialCommunityIcon name="check" size={20} color="#48BB78" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedMethod('card')}
            style={[
              styles.methodPill,
              selectedMethod === 'card' && styles.methodPillSelected,
            ]}
          >
            <Typography
              variant="bodyMedium"
              style={[
                styles.methodText,
                selectedMethod === 'card' && styles.methodTextSelected,
              ]}
            >
              Credit / Debit / ATM Card
            </Typography>
            {selectedMethod === 'card' && (
              <MaterialCommunityIcon name="check" size={20} color="#48BB78" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedMethod('netbanking')}
            style={[
              styles.methodPill,
              selectedMethod === 'netbanking' && styles.methodPillSelected,
            ]}
          >
            <Typography
              variant="bodyMedium"
              style={[
                styles.methodText,
                selectedMethod === 'netbanking' && styles.methodTextSelected,
              ]}
            >
              Net Banking
            </Typography>
            {selectedMethod === 'netbanking' && (
              <MaterialCommunityIcon name="check" size={20} color="#48BB78" />
            )}
          </TouchableOpacity>
        </View>

        {/* Add Payment Method Button */}
        <TouchableOpacity style={styles.addPaymentButton} activeOpacity={0.8}>
          <Typography variant="bodyMedium" style={styles.addPaymentText}>
            Add Payment Method
          </Typography>
        </TouchableOpacity>

        {/* Debit Card Details Form Card */}
        <View style={styles.cardDetailsCard}>
          <Typography variant="h2" style={styles.cardDetailsTitle}>
            Debit Card
          </Typography>

          <TextInput
            placeholder="Add your Name"
            placeholderTextColor="#8A8A8E"
            style={styles.cardInput}
            value={cardName}
            onChangeText={setCardName}
          />

          <TextInput
            placeholder="Add your Card Number"
            placeholderTextColor="#8A8A8E"
            keyboardType="number-pad"
            style={styles.cardInput}
            value={cardNumber}
            onChangeText={setCardNumber}
          />

          <View style={styles.twoColRow}>
            <TextInput
              placeholder="Card Type"
              placeholderTextColor="#8A8A8E"
              style={[styles.cardInput, styles.halfInput]}
              value={cardType}
              onChangeText={setCardType}
            />
            <TextInput
              placeholder="Valid Upto"
              placeholderTextColor="#8A8A8E"
              style={[styles.cardInput, styles.halfInput]}
              value={validUpto}
              onChangeText={setValidUpto}
            />
          </View>
        </View>

        {/* Continue To Pay Button */}
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.8}
          onPress={handlePay}
        >
          <Typography variant="bodyMedium" style={styles.continueText}>
            Continue To Pay
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
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginVertical: 18,
  },
  methodsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  methodPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 24,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  methodPillSelected: {
    backgroundColor: '#FFFFFF',
  },
  methodText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  methodTextSelected: {
    color: '#8B0000',
    fontWeight: '700',
  },
  addPaymentButton: {
    backgroundColor: '#8B0000',
    borderRadius: 25,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  addPaymentText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cardDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 22,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  cardDetailsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardInput: {
    backgroundColor: '#F0F2F5',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 13,
    color: '#111827',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  continueButton: {
    backgroundColor: '#8B0000',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

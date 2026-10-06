import React, { useState } from 'react';
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
import { cardPaymentSchema } from '../../../application/utils/validators';

export const CheckoutScreen = ({ navigation, route }: any) => {
  const { placeOrder, clearCart } = useCartStore();
  const addressId = route?.params?.addressId || '3';
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardType, setCardType] = useState('Debit Card');
  const [validUpto, setValidUpto] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const handlePay = async () => {
    setFieldErrors({});

    if (selectedMethod === 'card') {
      const formData = {
        cardName: cardName.trim(),
        cardNumber: cardNumber.replace(/\s+/g, ''),
        cardType: cardType.trim(),
        validUpto: validUpto.trim(),
      };

      const validation = cardPaymentSchema.safeParse(formData);
      if (!validation.success) {
        const formatted = validation.error.format();
        const errors: Record<string, string> = {};
        if (formatted.cardName?._errors[0]) errors.cardName = formatted.cardName._errors[0];
        if (formatted.cardNumber?._errors[0]) errors.cardNumber = formatted.cardNumber._errors[0];
        if (formatted.cardType?._errors[0]) errors.cardType = formatted.cardType._errors[0];
        if (formatted.validUpto?._errors[0]) errors.validUpto = formatted.validUpto._errors[0];
        setFieldErrors(errors);
        return;
      }
    }

    try {
      await placeOrder(addressId);
    } catch (err) {
      console.warn('[Checkout] placeOrder error:', err);
    }
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
          <Icon name="user" size={19} color="#FFFFFF" />
        </TouchableOpacity>

        <Logo size="sm" />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Notifications')}
          style={styles.bellButton}
        >
          <Icon name="bell" size={20} color="#8B0000" />
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
            onPress={() => {
              setSelectedMethod('cash');
              setFieldErrors({});
            }}
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
            onPress={() => {
              setSelectedMethod('netbanking');
              setFieldErrors({});
            }}
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

        {/* Debit Card Details Form Card (when card is selected) */}
        {selectedMethod === 'card' ? (
          <View style={styles.cardDetailsCard}>
            <Typography variant="h2" style={styles.cardDetailsTitle}>
              Debit Card
            </Typography>

            <View>
              <TextInput
                placeholder="Add your Name"
                placeholderTextColor={fieldErrors.cardName ? '#EF4444' : '#8A8A8E'}
                style={[styles.cardInput, fieldErrors.cardName && styles.inputError]}
                value={cardName}
                onChangeText={(t) => {
                  setCardName(t);
                  if (fieldErrors.cardName) setFieldErrors({ ...fieldErrors, cardName: '' });
                }}
              />
              {fieldErrors.cardName ? (
                <Typography variant="bodySmall" style={styles.inlineErrorText}>
                  {fieldErrors.cardName}
                </Typography>
              ) : null}
            </View>

            <View>
              <TextInput
                placeholder="Add your Card Number"
                placeholderTextColor={fieldErrors.cardNumber ? '#EF4444' : '#8A8A8E'}
                keyboardType="number-pad"
                maxLength={16}
                style={[styles.cardInput, fieldErrors.cardNumber && styles.inputError]}
                value={cardNumber}
                onChangeText={(t) => {
                  setCardNumber(t);
                  if (fieldErrors.cardNumber) setFieldErrors({ ...fieldErrors, cardNumber: '' });
                }}
              />
              {fieldErrors.cardNumber ? (
                <Typography variant="bodySmall" style={styles.inlineErrorText}>
                  {fieldErrors.cardNumber}
                </Typography>
              ) : null}
            </View>

            <View style={styles.twoColRow}>
              <View style={styles.halfInput}>
                <TextInput
                  placeholder="Card Type"
                  placeholderTextColor={fieldErrors.cardType ? '#EF4444' : '#8A8A8E'}
                  style={[styles.cardInput, fieldErrors.cardType && styles.inputError]}
                  value={cardType}
                  onChangeText={(t) => {
                    setCardType(t);
                    if (fieldErrors.cardType) setFieldErrors({ ...fieldErrors, cardType: '' });
                  }}
                />
                {fieldErrors.cardType ? (
                  <Typography variant="bodySmall" style={styles.inlineErrorText}>
                    {fieldErrors.cardType}
                  </Typography>
                ) : null}
              </View>

              <View style={styles.halfInput}>
                <TextInput
                  placeholder="Valid Upto (MM/YY)"
                  placeholderTextColor={fieldErrors.validUpto ? '#EF4444' : '#8A8A8E'}
                  maxLength={5}
                  style={[styles.cardInput, fieldErrors.validUpto && styles.inputError]}
                  value={validUpto}
                  onChangeText={(t) => {
                    setValidUpto(t);
                    if (fieldErrors.validUpto) setFieldErrors({ ...fieldErrors, validUpto: '' });
                  }}
                />
                {fieldErrors.validUpto ? (
                  <Typography variant="bodySmall" style={styles.inlineErrorText}>
                    {fieldErrors.validUpto}
                  </Typography>
                ) : null}
              </View>
            </View>
          </View>
        ) : null}

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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inlineErrorText: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 12,
    fontFamily: 'Montserrat-Medium',
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

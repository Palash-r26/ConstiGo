import React from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Button } from '../../components/Button';
import Icon from 'react-native-vector-icons/Feather';
import { useCartStore } from '../../../application/store/cartStore';
import { useFocusEffect } from '@react-navigation/native';

export const CartScreen = ({ navigation }: any) => {
  const { items: cartItems, subTotal, isLoading, fetchCart, updateQuantity, removeItem } = useCartStore();

  useFocusEffect(
    React.useCallback(() => {
      fetchCart();
    }, [])
  );

  const taxes = subTotal * 0.18; // 18% GST
  const deliveryFee = subTotal > 0 ? 50 : 0; // Flat ₹50 delivery
  const total = subTotal + taxes + deliveryFee;

  return (
    <ScreenWrapper className="bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 mt-4 mb-4">
        <Typography variant="h1Black" className="text-3xl text-black">My Cart</Typography>
      </View>

      {isLoading && cartItems.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#9C101A" />
        </View>
      ) : cartItems.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Icon name="shopping-cart" size={64} color="#8A8A8E" className="mb-4" />
          <Typography variant="h2" className="text-xl text-text-secondary">Your cart is empty</Typography>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120, gap: 16 }} showsVerticalScrollIndicator={false}>
          {cartItems.map((item: any) => (
            <View key={item._id || item.product._id} className="bg-surface rounded-3xl p-4 shadow-sm shadow-gray-200 flex-row">
              <View className="w-24 h-24 bg-input-bg rounded-2xl justify-center items-center mr-4">
                 <Icon name="box" size={32} color="#8A8A8E" />
              </View>
              <View className="flex-1 justify-between">
                <View className="flex-row justify-between">
                  <View className="flex-1">
                    <Typography variant="bodyBold" className="text-lg leading-tight mb-1" numberOfLines={1}>{item.product.name}</Typography>
                    <Typography variant="bodySmall" className="text-text-secondary text-xs">by {item.product.supplier?.businessInfo?.companyName || 'ConstiGo Supplies'}</Typography>
                  </View>
                  <TouchableOpacity onPress={() => removeItem(item.product._id)} className="p-1">
                    <Icon name="trash-2" size={18} color="#FF4B3A" />
                  </TouchableOpacity>
                </View>
                <View className="flex-row justify-between items-end mt-2">
                  <Typography variant="bodyBold" className="text-primary text-lg">₹ {item.product.price}</Typography>
                  <View className="flex-row items-center bg-input-bg rounded-full px-3 py-1">
                    <TouchableOpacity onPress={() => updateQuantity(item.product._id, item.quantity - 1)}>
                      <Icon name="minus" size={16} color="#1C1C1C" />
                    </TouchableOpacity>
                    <Typography variant="bodyBold" className="mx-4">{item.quantity}</Typography>
                    <TouchableOpacity onPress={() => updateQuantity(item.product._id, item.quantity + 1)}>
                      <Icon name="plus" size={16} color="#1C1C1C" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}

          {/* Bill Details */}
          <View className="bg-surface rounded-3xl p-6 shadow-sm shadow-gray-200 mt-4">
            <Typography variant="h2" className="text-xl mb-4">Bill Details</Typography>
            <View className="flex-row justify-between mb-2">
              <Typography variant="bodyMedium" className="text-text-secondary">Subtotal</Typography>
              <Typography variant="bodySemiBold">₹ {subTotal.toFixed(2)}</Typography>
            </View>
            <View className="flex-row justify-between mb-2">
              <Typography variant="bodyMedium" className="text-text-secondary">Delivery Fee</Typography>
              <Typography variant="bodySemiBold">₹ {deliveryFee.toFixed(2)}</Typography>
            </View>
            <View className="flex-row justify-between mb-4">
              <Typography variant="bodyMedium" className="text-text-secondary">Taxes & Fees (18%)</Typography>
              <Typography variant="bodySemiBold">₹ {taxes.toFixed(2)}</Typography>
            </View>
            <View className="h-[1px] bg-input-bg w-full mb-4" />
            <View className="flex-row justify-between">
              <Typography variant="h2" className="text-xl">Total</Typography>
              <Typography variant="h2" className="text-xl text-primary">₹ {total.toFixed(2)}</Typography>
            </View>
          </View>

          <Button 
            title={`Checkout • ₹ ${total.toFixed(2)}`} 
            onPress={() => navigation.navigate('Checkout')} 
            className="mt-4"
          />
        </ScrollView>
      )}
    </ScreenWrapper>
  );
};

import React from 'react';
import { View } from 'react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/Feather';

export const OrderSuccessScreen = ({ navigation }: any) => {
  return (
    <ScreenWrapper className="px-6 justify-center">
      <View className="items-center mb-12">
        {/* Placeholder for confetti animation */}
        <View className="w-32 h-32 bg-primary rounded-full justify-center items-center mb-8 relative">
          <Icon name="check" size={60} color="#182F4B" />
        </View>

        <View className="bg-input-bg rounded-3xl p-8 w-full items-center">
          <Typography variant="h1" className="text-3xl mb-4 text-center">
            Order Successful !
          </Typography>
          <Typography variant="bodyDefault" className="text-center text-text-primary mb-4">
            Your order will be successfully placed.
          </Typography>
          <Typography variant="bodyBold" className="text-center text-primary">
            Thank you!
          </Typography>
        </View>
      </View>

      <Button 
        title="Continue Shopping" 
        onPress={() => navigation.navigate('BuyerTabs', { screen: 'Home' })} 
      />
    </ScreenWrapper>
  );
};

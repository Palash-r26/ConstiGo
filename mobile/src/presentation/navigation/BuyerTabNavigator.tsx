import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';

// Dummy screens for now
import { HomeDashboardScreen } from '../screens/buyer/HomeDashboardScreen';
import { SupplierListingScreen } from '../screens/buyer/SupplierListingScreen';
import { SupplierDetailsScreen } from '../screens/buyer/SupplierDetailsScreen';
import { OrderSuccessScreen } from '../screens/buyer/OrderSuccessScreen';

const DummyScreen = ({ navigation }: any) => (
  <View className="flex-1 bg-background justify-center items-center">
    <Icon name="info" size={40} color="#9C101A" />
  </View>
);

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export const BuyerTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'home';
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Wishlist') iconName = 'heart';
          else if (route.name === 'Cart') iconName = 'shopping-bag';
          else if (route.name === 'Profile') iconName = 'user';

          return <Icon name={iconName} size={24} color={focused ? '#FFFFFF' : 'rgba(255,255,255,0.6)'} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeDashboardScreen} />
      <Tab.Screen name="Wishlist" component={DummyScreen} />
      <Tab.Screen name="Cart" component={DummyScreen} />
      <Tab.Screen name="Profile" component={DummyScreen} />
    </Tab.Navigator>
  );
};

export const BuyerStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BuyerTabs" component={BuyerTabNavigator} />
      <Stack.Screen name="SupplierListing" component={SupplierListingScreen} />
      <Stack.Screen name="SupplierDetails" component={SupplierDetailsScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#9C101A',
    borderRadius: 30,
    height: 70,
    paddingBottom: 0, // override default padding
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
});

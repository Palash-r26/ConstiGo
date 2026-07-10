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
import { WishlistScreen } from '../screens/buyer/WishlistScreen';
import { ProfileScreen } from '../screens/buyer/ProfileScreen';
import { CartScreen } from '../screens/buyer/CartScreen';

const DummyScreen = ({ navigation }: any) => (
  <View className="flex-1 bg-background justify-center items-center">
    <Icon name="info" size={40} color="#9C101A" />
  </View>
);

// Additional screens
import { SearchScreen } from '../screens/buyer/SearchScreen';
import { NotificationsScreen } from '../screens/buyer/NotificationsScreen';
import { CheckoutScreen } from '../screens/buyer/CheckoutScreen';
import { MyOrdersScreen } from '../screens/buyer/MyOrdersScreen';
import { OrderDetailsScreen } from '../screens/buyer/OrderDetailsScreen';
import { AddressManagerScreen } from '../screens/buyer/AddressManagerScreen';
import { SettingsScreen } from '../screens/buyer/SettingsScreen';
import { EditProfileScreen } from '../screens/buyer/EditProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export const BuyerTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'home';
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Wishlist') iconName = 'heart';
          else if (route.name === 'CartTab') iconName = 'shopping-bag';
          else if (route.name === 'Profile') iconName = 'user';

          return <Icon name={iconName} size={24} color={focused ? '#FFFFFF' : 'rgba(255,255,255,0.6)'} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeDashboardScreen} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="CartTab" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const BuyerStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BuyerTabs" component={BuyerTabNavigator} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="SupplierListing" component={SupplierListingScreen} />
      <Stack.Screen name="SupplierDetails" component={SupplierDetailsScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="AddressManager" component={AddressManagerScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 24,
    // Short, centered pill (per buyer_07). Equal left/right insets keep it centered.
    left: 60,
    right: 60,
    backgroundColor: '#9C101A',
    borderRadius: 32,
    height: 60,
    paddingBottom: 0, // override default padding
    paddingHorizontal: 8,
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
});

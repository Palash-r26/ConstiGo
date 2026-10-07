import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';

// Screens
import { HomeDashboardScreen } from '../screens/buyer/HomeDashboardScreen';
import { SupplierListingScreen } from '../screens/buyer/SupplierListingScreen';
import { SupplierDetailsScreen } from '../screens/buyer/SupplierDetailsScreen';
import { OrderSuccessScreen } from '../screens/buyer/OrderSuccessScreen';
import { WishlistScreen } from '../screens/buyer/WishlistScreen';
import { ProfileScreen } from '../screens/buyer/ProfileScreen';
import { CartScreen } from '../screens/buyer/CartScreen';
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
        safeAreaInsets: { bottom: 0, top: 0, left: 0, right: 0 },
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarIconStyle: styles.tabBarIcon,
        tabBarIcon: ({ focused }) => {
          let iconName = 'home';
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Wishlist') iconName = 'heart';
          else if (route.name === 'CartTab') iconName = 'shopping-bag';
          else if (route.name === 'Profile') iconName = 'user';

          return (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperFocused]}>
              <Icon
                name={iconName}
                size={22}
                color={focused ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)'}
              />
            </View>
          );
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
    bottom: Platform.OS === 'android' ? 18 : 28,
    left: 28,
    right: 28,
    backgroundColor: '#8B0000',
    borderRadius: 36,
    height: 64,
    paddingHorizontal: 8,
    paddingTop: 0,
    paddingBottom: 0,
    borderTopWidth: 0,
    elevation: 12,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarItem: {
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    margin: 0,
  },
  tabBarIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    margin: 0,
    padding: 0,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

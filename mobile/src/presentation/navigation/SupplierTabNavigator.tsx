import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';

import { InventoryDashboardScreen } from '../screens/supplier/InventoryDashboardScreen';
import { MyOrdersScreen } from '../screens/supplier/MyOrdersScreen';
import { SupplierSupportScreen } from '../screens/supplier/SupplierSupportScreen';
import { SupplierProfileScreen } from '../screens/supplier/SupplierProfileScreen';
import { EnterCompanyDetailsScreen } from '../screens/supplier/EnterCompanyDetailsScreen';
import { AddProductScreen } from '../screens/supplier/AddProductScreen';
import { AddMaterialScreen } from '../screens/supplier/AddMaterialScreen';
import { OrderDetailsScreen } from '../screens/supplier/OrderDetailsScreen';
import { NotificationsScreen } from '../screens/buyer/NotificationsScreen';
import { useAuthStore } from '../../application/store/authStore';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export const SupplierTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        safeAreaInsets: { bottom: 0, top: 0, left: 0, right: 0 },
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarIconStyle: styles.tabBarIcon,
        tabBarIcon: ({ focused }) => {
          let iconName = 'home';
          if (route.name === 'Home' || route.name === 'Inventory') iconName = 'home';
          else if (route.name === 'Orders') iconName = 'package';
          else if (route.name === 'Support') iconName = 'headphones';
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
      <Tab.Screen name="Home" component={InventoryDashboardScreen} />
      <Tab.Screen name="Orders" component={MyOrdersScreen} />
      <Tab.Screen name="Support" component={SupplierSupportScreen} />
      <Tab.Screen name="Profile" component={SupplierProfileScreen} />
    </Tab.Navigator>
  );
};

export const SupplierStackNavigator = () => {
  const user = useAuthStore((state) => state.user);
  // Note: if company data is present redirect to inventory page else company form page will display
  const initialRoute = user?.hasCompany === false ? 'EnterCompanyDetails' : 'SupplierTabs';

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SupplierTabs" component={SupplierTabNavigator} />
      <Stack.Screen name="EnterCompanyDetails" component={EnterCompanyDetailsScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
      <Stack.Screen name="AddMaterial" component={AddMaterialScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
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

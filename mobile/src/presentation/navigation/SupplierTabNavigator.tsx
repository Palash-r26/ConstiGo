import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';

import { InventoryDashboardScreen } from '../screens/supplier/InventoryDashboardScreen';
import { MyOrdersScreen } from '../screens/supplier/MyOrdersScreen';
import { SupplierProfileScreen } from '../screens/supplier/SupplierProfileScreen';
import { OrderDetailsScreen } from '../screens/supplier/OrderDetailsScreen';
import { AddMaterialScreen } from '../screens/supplier/AddMaterialScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const DummyScreen = () => <View className="flex-1 bg-background" />;

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export const SupplierTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: { justifyContent: 'center', alignItems: 'center', paddingTop: 0, paddingBottom: 0, height: '100%' },
        tabBarIcon: ({ focused }) => {
          let iconName = 'home';
          if (route.name === 'Inventory') iconName = 'home';
          else if (route.name === 'Orders') iconName = 'package';
          else if (route.name === 'Shop') iconName = 'shopping-bag';
          else if (route.name === 'Profile') iconName = 'user';

          return <Icon name={iconName} size={24} color={focused ? '#182F4B' : 'rgba(24, 47, 75, 0.5)'} />;
        },
      })}
    >
      <Tab.Screen name="Inventory" component={InventoryDashboardScreen} />
      <Tab.Screen name="Orders" component={MyOrdersScreen} />
      <Tab.Screen name="Shop" component={DummyScreen} />
      <Tab.Screen name="Profile" component={SupplierProfileScreen} />
    </Tab.Navigator>
  );
};

export const SupplierStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SupplierTabs" component={SupplierTabNavigator} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="AddMaterial" component={AddMaterialScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 24,
    // Short, centered pill (per supplier_07). Equal left/right insets keep it centered.
    left: 60,
    right: 60,
    backgroundColor: '#C89338',
    borderRadius: 32,
    height: 60,
    paddingBottom: 0,
    paddingHorizontal: 8,
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
});

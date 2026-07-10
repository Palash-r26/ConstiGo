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
        tabBarIcon: ({ focused }) => {
          let iconName = 'home';
          if (route.name === 'Inventory') iconName = 'home';
          else if (route.name === 'Orders') iconName = 'package';
          else if (route.name === 'Shop') iconName = 'shopping-bag';
          else if (route.name === 'Profile') iconName = 'user';

          return <Icon name={iconName} size={24} color={focused ? '#FFFFFF' : 'rgba(255,255,255,0.6)'} />;
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
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#9C101A',
    borderRadius: 30,
    height: 70,
    paddingBottom: 0,
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
});

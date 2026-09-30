import React from 'react';
import { StyleSheet } from 'react-native';
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
import { useAuthStore } from '../../application/store/authStore';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export const SupplierTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 0,
          paddingBottom: 0,
          height: '100%',
        },
        tabBarIcon: ({ focused }) => {
          let iconName = 'home';
          if (route.name === 'Home' || route.name === 'Inventory') iconName = 'home';
          else if (route.name === 'Orders') iconName = 'package';
          else if (route.name === 'Support') iconName = 'headphones';
          else if (route.name === 'Profile') iconName = 'user';

          return (
            <Icon
              name={iconName}
              size={22}
              color={focused ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'}
            />
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
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 22,
    left: 45,
    right: 45,
    backgroundColor: '#8B0000',
    borderRadius: 32,
    height: 56,
    paddingBottom: 0,
    paddingHorizontal: 12,
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
});

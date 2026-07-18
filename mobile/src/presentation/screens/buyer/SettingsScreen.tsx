import React from 'react';
import { View, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/Feather';

export const SettingsScreen = ({ navigation }: any) => {
  const settingsOptions = [
    { id: '1', title: 'About ConstiGo', icon: 'info', onPress: () => Alert.alert('About', 'ConstiGo v1.0.0\nB2B Construction Marketplace') },
    { id: '2', title: 'Privacy Policy', icon: 'shield', onPress: () => Linking.openURL('https://example.com/privacy') },
    { id: '3', title: 'Terms of Service', icon: 'file-text', onPress: () => Linking.openURL('https://example.com/terms') },
    { id: '4', title: 'FAQs', icon: 'help-circle', onPress: () => Linking.openURL('https://example.com/faq') },
    { id: '5', title: 'Contact Support', icon: 'message-circle', onPress: () => Linking.openURL('mailto:support@constigo.com') },
  ];

  return (
    <ScreenWrapper className="bg-white">
      <View className="flex-row items-center px-6 py-4 mt-4 mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-left" size={24} color="#182F4B" />
        </TouchableOpacity>
        <Typography variant="h1Black" className="text-3xl text-[#182F4B]">Settings</Typography>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, gap: 16 }} showsVerticalScrollIndicator={false}>
        <View className="bg-surface rounded-3xl p-4 shadow-sm shadow-gray-200">
          {settingsOptions.map((item, index) => (
            <TouchableOpacity 
              key={item.id} 
              onPress={item.onPress}
              className={`flex-row items-center py-4 ${index !== settingsOptions.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <View className="w-10 h-10 bg-input-bg rounded-full justify-center items-center mr-4">
                <Icon name={item.icon} size={20} color="#182F4B" />
              </View>
              <Typography variant="bodyBold" className="flex-1 text-lg">{item.title}</Typography>
              <Icon name="chevron-right" size={20} color="#8A8A8E" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

import React from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/Feather';
import { useUserStore } from '../../../application/store/userStore';
import { apiClient } from '../../../infrastructure/api/client';

export const AddressManagerScreen = ({ navigation }: any) => {
  const { profile, fetchProfile } = useUserStore();
  const [isAdding, setIsAdding] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Form State
  const [label, setLabel] = React.useState('');
  const [street, setStreet] = React.useState('');
  const [city, setCity] = React.useState('');
  const [state, setState] = React.useState('');
  const [zipCode, setZipCode] = React.useState('');
  const [isDefault, setIsDefault] = React.useState(false);

  const handleSave = async () => {
    if (!street || !city || !state || !zipCode) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiClient.post('/users/me/address', {
        label, street, city, state, zipCode, isDefault
      });
      if (res.data.success) {
        await fetchProfile();
        setIsAdding(false);
        // Reset form
        setLabel(''); setStreet(''); setCity(''); setState(''); setZipCode(''); setIsDefault(false);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await apiClient.delete(`/users/me/address/${id}`);
      if (res.data.success) {
        fetchProfile();
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete address');
    }
  };

  return (
    <ScreenWrapper className="bg-white">
      <View className="flex-row items-center px-6 py-4 mt-4 mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-left" size={24} color="#182F4B" />
        </TouchableOpacity>
        <Typography variant="h1Black" className="text-2xl text-[#182F4B]">Manage Addresses</Typography>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120, gap: 16 }} showsVerticalScrollIndicator={false}>
        
        {isAdding ? (
          <View className="bg-surface rounded-3xl p-6 shadow-sm shadow-gray-200">
            <Typography variant="h2" className="text-xl mb-4">Add New Address</Typography>
            
            <TextInput placeholder="Label (e.g. Home, Site A)" className="bg-white rounded-xl p-4 mb-3 border border-gray-100 font-urbanist" value={label} onChangeText={setLabel} />
            <TextInput placeholder="Street Address *" className="bg-white rounded-xl p-4 mb-3 border border-gray-100 font-urbanist" value={street} onChangeText={setStreet} />
            <View className="flex-row gap-3 mb-3">
               <TextInput placeholder="City *" className="flex-1 bg-white rounded-xl p-4 border border-gray-100 font-urbanist" value={city} onChangeText={setCity} />
               <TextInput placeholder="State *" className="flex-1 bg-white rounded-xl p-4 border border-gray-100 font-urbanist" value={state} onChangeText={setState} />
            </View>
            <TextInput placeholder="Zip Code *" keyboardType="number-pad" className="bg-white rounded-xl p-4 mb-4 border border-gray-100 font-urbanist" value={zipCode} onChangeText={setZipCode} />
            
            <TouchableOpacity onPress={() => setIsDefault(!isDefault)} className="flex-row items-center mb-6">
               <View className={`w-6 h-6 rounded border items-center justify-center mr-3 ${isDefault ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                 {isDefault && <Icon name="check" size={16} color="#182F4B" />}
               </View>
               <Typography variant="bodyMedium">Set as default address</Typography>
            </TouchableOpacity>

            <View className="flex-row gap-4">
              <Button title="Cancel" variant="outline" onPress={() => setIsAdding(false)} className="flex-1" />
              <Button title={isLoading ? "Saving..." : "Save"} onPress={handleSave} className="flex-1" disabled={isLoading} />
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            onPress={() => setIsAdding(true)}
            className="bg-[#FFF5F5] rounded-3xl p-5 border border-primary border-dashed flex-row items-center justify-center mb-4"
          >
            <Icon name="plus" size={20} color="#C89338" className="mr-2" />
            <Typography variant="bodyBold" className="text-primary">Add New Address</Typography>
          </TouchableOpacity>
        )}

        {!isAdding && profile?.addresses?.map((addr: any) => (
          <View key={addr._id} className="bg-surface rounded-3xl p-5 shadow-sm shadow-gray-200">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-input-bg rounded-full justify-center items-center mr-3">
                  <Icon name="map-pin" size={18} color="#182F4B" />
                </View>
                <View>
                  <Typography variant="bodyBold" className="text-lg">{addr.label || 'Address'}</Typography>
                  {addr.isDefault && <Typography variant="bodySmall" className="text-primary mt-1 bg-primary/10 px-2 py-0.5 rounded text-center">Default</Typography>}
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDelete(addr._id)} className="p-2">
                 <Icon name="trash-2" size={18} color="#C89338" />
              </TouchableOpacity>
            </View>
            <Typography variant="bodyMedium" className="text-text-secondary mt-2 pl-[52px]">
              {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
            </Typography>
          </View>
        ))}

      </ScrollView>
    </ScreenWrapper>
  );
};

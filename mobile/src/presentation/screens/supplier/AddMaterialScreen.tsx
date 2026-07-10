import React from 'react';
import { View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { AuthInput } from '../../components/AuthInput';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Logo } from '../../components/Logo';
import Icon from 'react-native-vector-icons/Feather';
import { apiClient } from '../../../infrastructure/api/client';
import { launchImageLibrary } from 'react-native-image-picker';
import { CLOUDINARY_CLOUD_NAME } from '@env';

export const AddMaterialScreen = ({ navigation }: any) => {
  const [name, setName] = React.useState('');
  const [stockQty, setStockQty] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [imageUri, setImageUri] = React.useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);

  const handleSelectImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        setError(response.errorMessage || 'Image selection failed');
        return;
      }
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri || null);
      }
    });
  };

  const uploadToCloudinary = async (uri: string): Promise<string> => {
    const data = new FormData();
    data.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    } as any);
    data.append('upload_preset', 'constigo_preset'); // NOTE: Needs an unsigned preset named 'constigo_preset' in Cloudinary
    data.append('cloud_name', CLOUDINARY_CLOUD_NAME);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: data,
    });
    const json = await res.json();
    if (json.secure_url) {
      return json.secure_url;
    }
    throw new Error('Cloudinary upload failed');
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      let finalImageUrl = '';
      if (imageUri) {
        setIsUploadingImage(true);
        finalImageUrl = await uploadToCloudinary(imageUri);
        setIsUploadingImage(false);
      }

      const response = await apiClient.post('/products', {
        name,
        stockQty: parseInt(stockQty, 10),
        price: parseFloat(price),
        description,
        unit: 'Unit',
        images: finalImageUrl ? [finalImageUrl] : [],
      });
      if (response.data.success) {
        navigation.goBack();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add material');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <ScreenWrapper>
      {/* Top Header */}
      <View className="flex-row justify-between items-center px-6 py-4 mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-8 h-8 rounded-full bg-primary justify-center items-center">
          <Icon name="user" size={16} color="#FFF" />
        </TouchableOpacity>
        <Logo size="sm" />
        <TouchableOpacity>
          <Icon name="bell" size={24} color="#1C1C1C" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View className="items-center mb-8 mt-2">
          <Typography variant="h1" className="text-3xl text-center">Add New Material</Typography>
        </View>

        <View className="gap-y-4 mb-10">
          {error ? <Typography className="text-red-500 text-center">{error}</Typography> : null}
          <AuthInput placeholder="Product Name" value={name} onChangeText={setName} />
          <AuthInput placeholder="Product Quantity" value={stockQty} onChangeText={setStockQty} keyboardType="numeric" />
          <AuthInput placeholder="Product Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
          
          <TouchableOpacity onPress={handleSelectImage} className="flex-row justify-between items-center bg-input-bg rounded-2xl px-5 py-4 overflow-hidden border border-gray-100">
            {imageUri ? (
              <Image source={{ uri: imageUri }} className="w-full h-32 absolute top-0 left-0 opacity-50 rounded-2xl" resizeMode="cover" />
            ) : null}
            <Typography variant={imageUri ? "bodyBold" : "bodyDefault"} className={imageUri ? "text-primary z-10" : "text-text-secondary z-10"}>
              {imageUri ? 'Image Selected (Tap to change)' : 'Upload Image'}
            </Typography>
            <Icon name="upload" size={20} color="#9C101A" className="z-10" />
          </TouchableOpacity>

          <View className="bg-input-bg rounded-2xl px-5 py-4 h-32">
            <Typography variant="bodyDefault" className="text-text-secondary">Description</Typography>
          </View>
        </View>

        <Button 
          title={isUploadingImage ? "Uploading Image..." : "Submit"} 
          onPress={handleSubmit}
          isLoading={isLoading || isUploadingImage} 
        />
      </ScrollView>
    </ScreenWrapper>
  );
};

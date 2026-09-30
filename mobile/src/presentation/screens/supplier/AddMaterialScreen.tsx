import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { AuthInput } from '../../components/AuthInput';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Logo } from '../../components/Logo';
import Icon from 'react-native-vector-icons/Feather';
import { apiClient } from '../../../infrastructure/api/client';
import { launchImageLibrary } from 'react-native-image-picker';
import { CLOUDINARY_CLOUD_NAME } from '@env';
import { addMaterialSchema } from '../../../application/utils/validators';

export const AddMaterialScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleSelectImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        setServerError(response.errorMessage || 'Image selection failed');
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
    data.append('upload_preset', 'constigo_preset');
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
    setFieldErrors({});
    setServerError('');

    const formData = {
      name: name.trim(),
      stockQty: stockQty.trim(),
      price: price.trim(),
      description: description.trim(),
    };

    const validation = addMaterialSchema.safeParse(formData);
    if (!validation.success) {
      const formatted = validation.error.format();
      setFieldErrors({
        name: formatted.name?._errors[0] || '',
        stockQty: formatted.stockQty?._errors[0] || '',
        price: formatted.price?._errors[0] || '',
        description: formatted.description?._errors[0] || '',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      let finalImageUrl = '';
      if (imageUri) {
        setIsUploadingImage(true);
        try {
          finalImageUrl = await uploadToCloudinary(imageUri);
        } catch (e) {
          console.warn('Cloudinary upload notice, continuing with material submit:', e);
        }
        setIsUploadingImage(false);
      }

      const response = await apiClient.post('/products', {
        name: formData.name,
        stockQty: parseInt(formData.stockQty, 10),
        price: parseFloat(formData.price),
        description: formData.description,
        unit: 'Unit',
        images: finalImageUrl ? [finalImageUrl] : [],
      });
      if (response.data.success) {
        navigation.goBack();
      }
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Failed to add material');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      {/* Top Header */}
      <View className="flex-row justify-between items-center px-6 py-4 mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-8 h-8 rounded-full bg-primary justify-center items-center">
          <Icon name="user" size={16} color="#182F4B" />
        </TouchableOpacity>
        <Logo size="sm" />
        <TouchableOpacity>
          <Icon name="bell" size={24} color="#182F4B" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View className="items-center mb-8 mt-2">
          <Typography variant="h1" className="text-3xl text-center">Add New Material</Typography>
        </View>

        <View className="gap-y-4 mb-10">
          {serverError ? <Typography className="text-red-500 text-center">{serverError}</Typography> : null}
          
          <AuthInput
            placeholder="Product Name"
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
            }}
            error={fieldErrors.name}
          />

          <AuthInput
            placeholder="Product Quantity"
            value={stockQty}
            onChangeText={(t) => {
              setStockQty(t);
              if (fieldErrors.stockQty) setFieldErrors({ ...fieldErrors, stockQty: '' });
            }}
            keyboardType="numeric"
            error={fieldErrors.stockQty}
          />

          <AuthInput
            placeholder="Product Price"
            value={price}
            onChangeText={(t) => {
              setPrice(t);
              if (fieldErrors.price) setFieldErrors({ ...fieldErrors, price: '' });
            }}
            keyboardType="numeric"
            error={fieldErrors.price}
          />
          
          <TouchableOpacity onPress={handleSelectImage} className="flex-row justify-between items-center bg-input-bg rounded-2xl px-5 py-4 overflow-hidden border border-gray-100">
            {imageUri ? (
              <Image source={{ uri: imageUri }} className="w-full h-32 absolute top-0 left-0 opacity-50 rounded-2xl" resizeMode="cover" />
            ) : null}
            <Typography variant={imageUri ? "bodyBold" : "bodyDefault"} className={imageUri ? "text-primary z-10" : "text-text-secondary z-10"}>
              {imageUri ? 'Image Selected (Tap to change)' : 'Upload Image'}
            </Typography>
            <Icon name="upload" size={20} color="#C89338" className="z-10" />
          </TouchableOpacity>

          <View className={`rounded-2xl px-5 py-3 h-32 ${fieldErrors.description ? 'bg-red-50 border border-red-500' : 'bg-input-bg'}`}>
            <TextInput
              placeholder="Description"
              placeholderTextColor={fieldErrors.description ? '#EF4444' : '#8A8A8E'}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={(t) => {
                setDescription(t);
                if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: '' });
              }}
              className="text-base text-text-primary h-full"
              style={{ paddingVertical: 0 }}
            />
          </View>
          {fieldErrors.description ? (
            <Typography variant="bodySmall" className="text-red-500 ml-2 mt-1">
              {fieldErrors.description}
            </Typography>
          ) : null}
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

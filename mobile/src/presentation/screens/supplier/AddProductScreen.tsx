import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
} from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { SupplierTopHeader } from '../../components/SupplierTopHeader';
import Icon from 'react-native-vector-icons/Feather';
import { launchImageLibrary } from 'react-native-image-picker';

export const AddProductScreen = ({ navigation }: any) => {
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [warrantyDetails, setWarrantyDetails] = useState('');

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (res) => {
      if (res.assets && res.assets.length > 0) {
        setImageUri(res.assets[0].uri || null);
      }
    });
  };

  const handleContinue = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  return (
    <ScreenWrapper className="bg-[#F5F6FA]">
      <SupplierTopHeader
        onProfilePress={() => navigation?.navigate('Profile')}
        onNotificationPress={() => {}}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleContainer}>
          <Typography variant="h1" style={styles.mainTitle}>
            Add Product
          </Typography>
          <Typography variant="bodySmall" style={styles.subtitle}>
            Add your inventory pricing, and visibility
          </Typography>
        </View>

        {/* Input Fields */}
        <View style={styles.inputGroup}>
          {/* Product Name */}
          <View style={styles.pillInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Product Name"
              placeholderTextColor="#9CA3AF"
              value={productName}
              onChangeText={setProductName}
            />
          </View>

          {/* Category & Stock */}
          <View style={styles.row}>
            <View style={[styles.pillInputContainer, styles.halfWidth]}>
              <TextInput
                style={styles.textInput}
                placeholder="Product Category"
                placeholderTextColor="#9CA3AF"
                value={productCategory}
                onChangeText={setProductCategory}
              />
            </View>
            <View style={[styles.pillInputContainer, styles.halfWidth]}>
              <TextInput
                style={styles.textInput}
                placeholder="Stock Quantity"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={stockQuantity}
                onChangeText={setStockQuantity}
              />
            </View>
          </View>

          {/* Product Description */}
          <View style={styles.pillInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Product Description"
              placeholderTextColor="#9CA3AF"
              value={productDescription}
              onChangeText={setProductDescription}
            />
          </View>

          {/* Price & Discounted Price */}
          <View style={styles.row}>
            <View style={[styles.pillInputContainer, styles.halfWidth]}>
              <TextInput
                style={styles.textInput}
                placeholder="Price of the Product"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={productPrice}
                onChangeText={setProductPrice}
              />
            </View>
            <View style={[styles.pillInputContainer, styles.halfWidth]}>
              <TextInput
                style={styles.textInput}
                placeholder="Discounted Price"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={discountedPrice}
                onChangeText={setDiscountedPrice}
              />
            </View>
          </View>

          {/* Add Image of Product */}
          <TouchableOpacity
            style={[styles.pillInputContainer, styles.imageInputContainer]}
            activeOpacity={0.7}
            onPress={handlePickImage}
          >
            <Typography
              variant="bodyDefault"
              style={[
                styles.textInput,
                { color: imageUri ? '#1E293B' : '#9CA3AF' },
              ]}
            >
              {imageUri ? 'Image Selected' : 'Add Image of Product'}
            </Typography>
            <View style={styles.cameraIconBadge}>
              <Icon name="camera" size={16} color="#64748B" />
            </View>
          </TouchableOpacity>

          {/* Preview Image if picked */}
          {imageUri && (
            <View style={styles.imagePreviewWrapper}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={() => setImageUri(null)}
              >
                <Icon name="x" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Add Warranty Details */}
          <View style={styles.pillInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Add Warranty Details"
              placeholderTextColor="#9CA3AF"
              value={warrantyDetails}
              onChangeText={setWarrantyDetails}
            />
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.85}
          onPress={handleContinue}
        >
          <Typography variant="bodyBold" style={styles.continueButtonText}>
            Continue
          </Typography>
        </TouchableOpacity>

        {/* Bottom Home Indicator */}
        <View style={styles.bottomIndicator} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 26,
  },
  mainTitle: {
    fontSize: 26,
    color: '#0F172A',
    fontFamily: 'BalooBhai2-Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Montserrat-Medium',
    marginTop: 4,
    textAlign: 'center',
  },
  inputGroup: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  pillInputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  imageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cameraIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'Montserrat-Medium',
    padding: 0,
  },
  imagePreviewWrapper: {
    position: 'relative',
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButton: {
    backgroundColor: '#8B0000',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 36,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  bottomIndicator: {
    width: 140,
    height: 4,
    backgroundColor: '#8B0000',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 40,
  },
});

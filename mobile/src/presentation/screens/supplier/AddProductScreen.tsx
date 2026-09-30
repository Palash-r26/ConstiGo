import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { SupplierTopHeader } from '../../components/SupplierTopHeader';
import Icon from 'react-native-vector-icons/Feather';
import { launchImageLibrary } from 'react-native-image-picker';
import { addProductSchema } from '../../../application/utils/validators';

export const AddProductScreen = ({ navigation }: any) => {
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [warrantyDetails, setWarrantyDetails] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (res) => {
      if (res.assets && res.assets.length > 0) {
        setImageUri(res.assets[0].uri || null);
      }
    });
  };

  const handleContinue = () => {
    setFieldErrors({});

    const formData = {
      productName: productName.trim(),
      productCategory: productCategory.trim(),
      stockQuantity: stockQuantity.trim(),
      productDescription: productDescription.trim(),
      productPrice: productPrice.trim(),
      discountedPrice: discountedPrice.trim() || undefined,
      warrantyDetails: warrantyDetails.trim() || undefined,
    };

    const validation = addProductSchema.safeParse(formData);
    if (!validation.success) {
      const formatted = validation.error.format();
      const errors: Record<string, string> = {};
      if (formatted.productName?._errors[0]) errors.productName = formatted.productName._errors[0];
      if (formatted.productCategory?._errors[0]) errors.productCategory = formatted.productCategory._errors[0];
      if (formatted.stockQuantity?._errors[0]) errors.stockQuantity = formatted.stockQuantity._errors[0];
      if (formatted.productDescription?._errors[0]) errors.productDescription = formatted.productDescription._errors[0];
      if (formatted.productPrice?._errors[0]) errors.productPrice = formatted.productPrice._errors[0];
      if (formatted.discountedPrice?._errors[0]) errors.discountedPrice = formatted.discountedPrice._errors[0];
      setFieldErrors(errors);
      return;
    }

    Alert.alert('Success', 'Product details saved successfully!', [
      { text: 'OK', onPress: () => navigation?.goBack() },
    ]);
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
          <View>
            <View style={[styles.pillInputContainer, fieldErrors.productName && styles.inputError]}>
              <TextInput
                style={styles.textInput}
                placeholder="Product Name"
                placeholderTextColor={fieldErrors.productName ? '#EF4444' : '#9CA3AF'}
                value={productName}
                onChangeText={(t) => {
                  setProductName(t);
                  if (fieldErrors.productName) setFieldErrors({ ...fieldErrors, productName: '' });
                }}
              />
            </View>
            {fieldErrors.productName ? (
              <Typography variant="bodySmall" style={styles.inlineErrorText}>
                {fieldErrors.productName}
              </Typography>
            ) : null}
          </View>

          {/* Category & Stock */}
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <View style={[styles.pillInputContainer, fieldErrors.productCategory && styles.inputError]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Product Category"
                  placeholderTextColor={fieldErrors.productCategory ? '#EF4444' : '#9CA3AF'}
                  value={productCategory}
                  onChangeText={(t) => {
                    setProductCategory(t);
                    if (fieldErrors.productCategory) setFieldErrors({ ...fieldErrors, productCategory: '' });
                  }}
                />
              </View>
              {fieldErrors.productCategory ? (
                <Typography variant="bodySmall" style={styles.inlineErrorText}>
                  {fieldErrors.productCategory}
                </Typography>
              ) : null}
            </View>

            <View style={styles.halfWidth}>
              <View style={[styles.pillInputContainer, fieldErrors.stockQuantity && styles.inputError]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Stock Quantity"
                  placeholderTextColor={fieldErrors.stockQuantity ? '#EF4444' : '#9CA3AF'}
                  keyboardType="numeric"
                  value={stockQuantity}
                  onChangeText={(t) => {
                    setStockQuantity(t);
                    if (fieldErrors.stockQuantity) setFieldErrors({ ...fieldErrors, stockQuantity: '' });
                  }}
                />
              </View>
              {fieldErrors.stockQuantity ? (
                <Typography variant="bodySmall" style={styles.inlineErrorText}>
                  {fieldErrors.stockQuantity}
                </Typography>
              ) : null}
            </View>
          </View>

          {/* Product Description */}
          <View>
            <View style={[styles.pillInputContainer, fieldErrors.productDescription && styles.inputError]}>
              <TextInput
                style={styles.textInput}
                placeholder="Product Description"
                placeholderTextColor={fieldErrors.productDescription ? '#EF4444' : '#9CA3AF'}
                value={productDescription}
                onChangeText={(t) => {
                  setProductDescription(t);
                  if (fieldErrors.productDescription) setFieldErrors({ ...fieldErrors, productDescription: '' });
                }}
              />
            </View>
            {fieldErrors.productDescription ? (
              <Typography variant="bodySmall" style={styles.inlineErrorText}>
                {fieldErrors.productDescription}
              </Typography>
            ) : null}
          </View>

          {/* Price & Discounted Price */}
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <View style={[styles.pillInputContainer, fieldErrors.productPrice && styles.inputError]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Price of the Product"
                  placeholderTextColor={fieldErrors.productPrice ? '#EF4444' : '#9CA3AF'}
                  keyboardType="numeric"
                  value={productPrice}
                  onChangeText={(t) => {
                    setProductPrice(t);
                    if (fieldErrors.productPrice) setFieldErrors({ ...fieldErrors, productPrice: '' });
                  }}
                />
              </View>
              {fieldErrors.productPrice ? (
                <Typography variant="bodySmall" style={styles.inlineErrorText}>
                  {fieldErrors.productPrice}
                </Typography>
              ) : null}
            </View>

            <View style={styles.halfWidth}>
              <View style={[styles.pillInputContainer, fieldErrors.discountedPrice && styles.inputError]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Discounted Price"
                  placeholderTextColor={fieldErrors.discountedPrice ? '#EF4444' : '#9CA3AF'}
                  keyboardType="numeric"
                  value={discountedPrice}
                  onChangeText={(t) => {
                    setDiscountedPrice(t);
                    if (fieldErrors.discountedPrice) setFieldErrors({ ...fieldErrors, discountedPrice: '' });
                  }}
                />
              </View>
              {fieldErrors.discountedPrice ? (
                <Typography variant="bodySmall" style={styles.inlineErrorText}>
                  {fieldErrors.discountedPrice}
                </Typography>
              ) : null}
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
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inlineErrorText: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 12,
    fontFamily: 'Montserrat-Medium',
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

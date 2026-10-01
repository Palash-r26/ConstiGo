import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { SupplierTopHeader } from '../../components/SupplierTopHeader';
import Icon from 'react-native-vector-icons/Feather';
import { launchImageLibrary } from 'react-native-image-picker';
import { addProductSchema } from '../../../application/utils/validators';
import { useAuthStore } from '../../../application/store/authStore';
import { addVendorProduct, updateVendorProduct } from '../../../infrastructure/api/vendorApi';

export const AddProductScreen = ({ navigation, route }: any) => {
  const user = useAuthStore((state) => state.user);
  const vendorId = route?.params?.vendorid || user?.vendorid || user?._id || 'CV290926162458';
  const existingProduct = route?.params?.product || null;

  const [productName, setProductName] = useState(existingProduct?.productname || existingProduct?.name || '');
  const [productCategory, setProductCategory] = useState(existingProduct?.productcategory || existingProduct?.category || '');
  const [stockQuantity, setStockQuantity] = useState(existingProduct?.stock ? String(existingProduct.stock) : '');
  const [productDescription, setProductDescription] = useState(existingProduct?.product_description || existingProduct?.description || '');
  const [productPrice, setProductPrice] = useState(existingProduct?.product_price ? String(existingProduct.product_price) : '');
  const [discountedPrice, setDiscountedPrice] = useState(existingProduct?.discount_price ? String(existingProduct.discount_price) : '');
  const [imageUri, setImageUri] = useState<string | null>(existingProduct?.productimage || null);
  const [warrantyDetails, setWarrantyDetails] = useState(existingProduct?.warranty_details || '1 Year Product Warranty');
  const [productStatus, setProductStatus] = useState<'in_stock' | 'out_of_stock'>(
    existingProduct?.productStatus === 'out_of_stock' ||
    existingProduct?.product_status === 'unavailable' ||
    existingProduct?.product_status === 'out_of_stock' ||
    existingProduct?.isAvailable === false
      ? 'out_of_stock'
      : 'in_stock'
  );
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (res) => {
      if (res.assets && res.assets.length > 0) {
        setImageUri(res.assets[0].uri || null);
      }
    });
  };

  const handleContinue = async () => {
    setFieldErrors({});
    setServerError('');

    const formData = {
      productName: productName.trim(),
      productCategory: productCategory.trim(),
      stockQuantity: stockQuantity.trim(),
      productDescription: productDescription.trim(),
      productPrice: productPrice.trim(),
      discountedPrice: discountedPrice.trim() || undefined,
      warrantyDetails: warrantyDetails.trim() || undefined,
      productStatus: productStatus,
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
      if (formatted.productStatus?._errors[0]) errors.productStatus = formatted.productStatus._errors[0];
      setFieldErrors(errors);
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        vendorid: vendorId,
        productname: formData.productName,
        productcategory: formData.productCategory,
        stock: formData.stockQuantity,
        product_description: formData.productDescription,
        product_price: formData.productPrice,
        discount_price: formData.discountedPrice || '0',
        productimage: imageUri ? { uri: imageUri, type: 'image/jpeg', name: 'product.jpg' } : undefined,
        warranty_details: formData.warrantyDetails || '1 Year Product Warranty',
        delivery_available: 'yes',
        product_status: productStatus === 'in_stock' ? 'available' : 'unavailable',
        productStatus: productStatus,
      };

      let response;
      if (existingProduct?.productid || existingProduct?._id) {
        // Call REAL PHP production endpoint: https://constigo.in/app/vendor/product_update.php
        response = await updateVendorProduct({
          ...payload,
          productid: existingProduct.productid || existingProduct._id,
        });
        console.log('[AddProductScreen] Product Update Raw Response:', response);
      } else {
        // Call REAL PHP production endpoint: https://constigo.in/app/vendor/product_add.php
        response = await addVendorProduct(payload);
        console.log('[AddProductScreen] Product Add Raw Response:', response);
      }

      // TODO: Confirm exact success response format from backend
      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true || (response && !response?.error);
      if (isSuccess) {
        Alert.alert(
          'Success',
          existingProduct ? 'Product updated successfully!' : 'Product added successfully!',
          [{ text: 'OK', onPress: () => navigation?.goBack() }]
        );
      } else {
        setServerError(response?.message || response?.error || 'Failed to save product. Please try again.');
      }
    } catch (err: any) {
      console.error('[AddProductScreen] Submit Error:', err);
      setServerError(err.message || 'An error occurred while saving the product.');
    } finally {
      setIsLoading(false);
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
            {existingProduct ? 'Update Product' : 'Add Product'}
          </Typography>
          <Typography variant="bodySmall" style={styles.subtitle}>
            Add your inventory pricing, and visibility
          </Typography>
        </View>

        {serverError ? (
          <Typography className="text-red-500 text-center mb-4 text-sm">{serverError}</Typography>
        ) : null}

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

          {/* Product Status Field */}
          <View style={styles.statusSection}>
            <Typography variant="bodyBold" style={styles.fieldLabel}>
              Product Status
            </Typography>
            <View style={styles.statusOptionsRow}>
              {/* Option 1: In Stock */}
              <TouchableOpacity
                style={styles.checkboxItem}
                activeOpacity={0.7}
                onPress={() => {
                  setProductStatus('in_stock');
                  if (fieldErrors.productStatus) {
                    setFieldErrors({ ...fieldErrors, productStatus: '' });
                  }
                }}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    productStatus === 'in_stock' && styles.checkboxBoxSelected,
                  ]}
                >
                  {productStatus === 'in_stock' && (
                    <Icon name="check" size={14} color="#FFFFFF" />
                  )}
                </View>
                <Typography
                  variant="bodyMedium"
                  style={[
                    styles.checkboxLabel,
                    productStatus === 'in_stock' && styles.checkboxLabelSelected,
                  ]}
                >
                  In Stock
                </Typography>
              </TouchableOpacity>

              {/* Option 2: Out of Stock */}
              <TouchableOpacity
                style={styles.checkboxItem}
                activeOpacity={0.7}
                onPress={() => {
                  setProductStatus('out_of_stock');
                  if (fieldErrors.productStatus) {
                    setFieldErrors({ ...fieldErrors, productStatus: '' });
                  }
                }}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    productStatus === 'out_of_stock' && styles.checkboxBoxSelected,
                  ]}
                >
                  {productStatus === 'out_of_stock' && (
                    <Icon name="check" size={14} color="#FFFFFF" />
                  )}
                </View>
                <Typography
                  variant="bodyMedium"
                  style={[
                    styles.checkboxLabel,
                    productStatus === 'out_of_stock' && styles.checkboxLabelSelected,
                  ]}
                >
                  Out of Stock
                </Typography>
              </TouchableOpacity>
            </View>
            {fieldErrors.productStatus ? (
              <Typography variant="bodySmall" style={styles.inlineErrorText}>
                {fieldErrors.productStatus}
              </Typography>
            ) : null}
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, isLoading && { opacity: 0.7 }]}
          activeOpacity={0.85}
          disabled={isLoading}
          onPress={handleContinue}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Typography variant="bodyBold" style={styles.continueButtonText}>
              {existingProduct ? 'Update Product' : 'Continue'}
            </Typography>
          )}
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
  statusSection: {
    paddingHorizontal: 4,
    marginTop: 4,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 8,
  },
  statusOptionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxSelected: {
    backgroundColor: '#8B0000',
    borderColor: '#8B0000',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#475569',
    fontFamily: 'Montserrat-Medium',
  },
  checkboxLabelSelected: {
    color: '#0F172A',
    fontFamily: 'Montserrat-SemiBold',
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

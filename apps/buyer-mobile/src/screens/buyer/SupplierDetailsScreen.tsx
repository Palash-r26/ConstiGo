import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Typography, ScreenWrapper, Logo, SafeImage, apiClient } from '@constigo/shared';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import RazorpayCheckout from 'react-native-razorpay';
import { useCartStore } from '../../store/cartStore';
import { useUserStore } from '../../store/userStore';
import { getCurrentDeviceLocation } from '../../services/locationService';
import { RAZORPAY_KEY_ID } from '@env';

export const SupplierDetailsScreen = ({ route, navigation }: any) => {
  const { product } = route.params || {};
  const { addToCart } = useCartStore();
  const { profile } = useUserStore();
  const [isOrdering, setIsOrdering] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [roadDialVisible, setRoadDialVisible] = useState(false);
  const [selectedFleet, setSelectedFleet] = useState<'mini' | 'flatbed' | 'tipper'>('flatbed');
  const [chatInputText, setChatInputText] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'vendor' | 'user'; text: string; time: string }>>([
    {
      id: '1',
      sender: 'vendor',
      text: `Hello! Welcome to ConstiGo. How can we help you with ${product?.name || product?.productname || 'this material'}?`,
      time: 'Just now',
    },
  ]);

  const supplierName =
    product?.supplier?.businessInfo?.companyName ||
    product?.supplier?.name ||
    product?.vendorName ||
    product?.business_name ||
    product?.name ||
    'Verified ConstiGo Supplier';

  const supplierPhone =
    product?.supplier?.phone ||
    product?.supplier?.businessInfo?.contactPhone ||
    product?.vendorPhone ||
    product?.phone ||
    '9876543210';

  const supplierAddress =
    product?.supplier?.businessInfo?.address ||
    product?.supplier?.location?.address ||
    product?.location ||
    product?.distance ||
    'Sector 62, Industrial Logistics Hub, Noida';

  // Real Coordinates: Supplier & Buyer Delivery Site
  const supplierLat = Number(
    product?.supplier?.location?.coordinates?.[1] ||
    product?.supplier?.maplatitude ||
    product?.maplatitude ||
    product?.latitude ||
    28.6139
  );
  const supplierLng = Number(
    product?.supplier?.location?.coordinates?.[0] ||
    product?.supplier?.maplongitude ||
    product?.maplongitude ||
    product?.longitude ||
    77.2090
  );

  const buyerLat = Number(
    (profile as any)?.location?.coordinates?.[1] ||
    (profile as any)?.maplatitude ||
    (profile as any)?.latitude ||
    28.5355
  );
  const buyerLng = Number(
    (profile as any)?.location?.coordinates?.[0] ||
    (profile as any)?.maplongitude ||
    (profile as any)?.longitude ||
    77.3910
  );

  const buyerSiteAddress =
    (profile as any)?.address ||
    (profile as any)?.address1 ||
    (profile as any)?.addressLine1 ||
    'Sector 62, Site Delivery Zone, Noida';

  // Road-Dial Booking Location Preference: 'current' (Live GPS) vs 'profile' (Profile / Saved Address)
  const [serviceLocationMode, setServiceLocationMode] = useState<'current' | 'profile'>('profile');
  const [liveGpsCoords, setLiveGpsCoords] = useState<{ lat: number; lng: number }>({
    lat: 28.5355,
    lng: 77.3910,
  });
  const [liveGpsAddress, setLiveGpsAddress] = useState('Current Device Location (Live GPS)');
  const [isRefreshingGps, setIsRefreshingGps] = useState(false);

  const fetchLiveGpsLocation = async () => {
    setIsRefreshingGps(true);
    try {
      const loc = await getCurrentDeviceLocation();
      const lat = parseFloat(loc.latitude);
      const lng = parseFloat(loc.longitude);
      setLiveGpsCoords({ lat, lng });
      setLiveGpsAddress(loc.address || `${loc.city}, ${loc.state}`);
      setServiceLocationMode('current');
      Alert.alert('Live GPS Located', `Locking onto your current coordinates:\n${loc.address || loc.city || 'Live GPS'}`);
    } catch (e) {
      console.warn('GPS detection failed:', e);
    } finally {
      setIsRefreshingGps(false);
    }
  };

  const activeBuyerLat = serviceLocationMode === 'current' ? liveGpsCoords.lat : buyerLat;
  const activeBuyerLng = serviceLocationMode === 'current' ? liveGpsCoords.lng : buyerLng;
  const activeBuyerAddress = serviceLocationMode === 'current' ? liveGpsAddress : buyerSiteAddress;

  // Dynamic Haversine calculation for RoadDial
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d > 0.1 ? d.toFixed(1) : '2.5';
  };

  const routeDistanceKm = calculateDistanceKm(supplierLat, supplierLng, activeBuyerLat, activeBuyerLng);
  const estimatedTransitMins = Math.max(15, Math.round(Number(routeDistanceKm) * 2.5 + 10));

  const productImageUri =
    product?.productimage ||
    (Array.isArray(product?.images) && product?.images[0]) ||
    product?.image;

  const productName = product?.name || product?.productname || 'Construction Material';
  const productCategory = product?.category || product?.productcategory || 'Materials';
  const unitPrice = Number(product?.price || product?.product_price || 0);
  const discountPrice = Number(product?.discount_price || 0);
  const unitStr = product?.unit || 'Unit';
  const warrantyText = product?.warranty_details || '1 Year Product Warranty';
  const isInStock = product?.isAvailable !== false && product?.productStatus !== 'out_of_stock' && product?.product_status !== 'unavailable';

  const reviews = Array.isArray(product?.reviews)
    ? product.reviews
    : Array.isArray(product?.supplier?.reviews)
    ? product.supplier.reviews
    : [];

  const handleCall = () => {
    if (supplierPhone) {
      Linking.openURL(`tel:${supplierPhone}`).catch(() => {
        Alert.alert('Error', 'Unable to initiate call on this device.');
      });
    } else {
      Alert.alert('Contact Supplier', 'Direct hotline: 1800-CONSTIGO');
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || chatInputText).trim();
    if (!text) return;

    const userMsg = {
      id: String(Date.now()),
      sender: 'user' as const,
      text,
      time: 'Just now',
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInputText('');

    // Vendor automated reply simulation
    setTimeout(() => {
      const vendorReply = {
        id: String(Date.now() + 1),
        sender: 'vendor' as const,
        text: `Thank you for your message! Our dispatch team is online and reviewing your inquiry regarding ${productName}. We will confirm stock and delivery timeline immediately.`,
        time: 'Just now',
      };
      setChatMessages((prev) => [...prev, vendorReply]);
    }, 1000);
  };

  const handleAddToCart = async () => {
    if (!product) {
      Alert.alert('Notice', 'Product details are unavailable.');
      return;
    }
    const prodId = product._id || product.productid || product.id;
    const venId = product.supplier?._id || product.vendorid || 'vendor_default';

    try {
      const success = await addToCart({
        productId: prodId,
        vendorId: venId,
        productName: productName,
        amount: unitPrice,
        quantity: quantity,
        category: productCategory,
      });
      if (success) {
        navigation.navigate('Cart');
      } else {
        Alert.alert('Notice', 'Failed to add item to cart. Please try again.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not add to cart.');
    }
  };

  const executeRoadDialOrder = async () => {
    if (!product || (!product._id && !product.productid && !product.id)) {
      Alert.alert('Error', 'Product information is missing.');
      return;
    }

    const prodId = product._id || product.productid || product.id;
    const supId = product.supplier?._id || product.vendorid || 'supplier_default';
    const prodPrice = unitPrice;

    if (prodPrice <= 0) {
      Alert.alert('Invalid Price', 'This product does not have a valid price configured.');
      return;
    }

    try {
      setIsOrdering(true);
      // Real coordinates sent at booking time as requested - matching Road-Dial
      const response = await apiClient.post('/orders/razorpay/create', {
        supplier: supId,
        orderItems: [
          {
            product: prodId,
            name: productName,
            qty: quantity,
            price: prodPrice,
          },
        ],
        shippingAddress: {
          address: activeBuyerAddress,
          city: (profile as any)?.city || 'Noida Site Zone',
          postalCode: (profile as any)?.pincode || '201301',
          location: {
            type: 'Point',
            coordinates: [activeBuyerLng, activeBuyerLat],
          },
        },
        supplierLocation: {
          type: 'Point',
          coordinates: [supplierLng, supplierLat],
        },
        coordinates: [activeBuyerLng, activeBuyerLat],
        locationMode: serviceLocationMode,
        fleetType: selectedFleet,
        transitDistanceKm: Number(routeDistanceKm),
        totalPrice: prodPrice * quantity,
      });

      const { razorpayOrder } = response.data;
      if (!razorpayOrder || !razorpayOrder.id) {
        throw new Error('Could not initiate payment order from server.');
      }

      setRoadDialVisible(false);

      const options = {
        description: `RoadDial Material Booking: ${productName}`,
        currency: razorpayOrder.currency || 'INR',
        key: RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        name: 'ConstiGo RoadDial',
        order_id: razorpayOrder.id,
        theme: { color: '#8B0000' },
      };

      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          try {
            await apiClient.post('/orders/razorpay/verify', {
              razorpay_order_id: data.razorpay_order_id,
              razorpay_payment_id: data.razorpay_payment_id,
              razorpay_signature: data.razorpay_signature,
            });
            navigation.navigate('OrderSuccess');
          } catch (verErr: any) {
            Alert.alert(
              'Verification Notice',
              'Payment was submitted. We are confirming it with the bank. Check My Orders for status.',
              [{ text: 'OK', onPress: () => navigation.navigate('MyOrders') }]
            );
          }
        })
        .catch((checkoutErr: any) => {
          console.warn('[SupplierDetailsScreen] Razorpay cancelled or error:', checkoutErr);
          Alert.alert('Payment Incomplete', 'Payment was cancelled or unsuccessful. You can retry at any time.');
        });
    } catch (error: any) {
      Alert.alert('Booking Placement Failed', error?.response?.data?.message || error?.message || 'Unable to connect to order gateway.');
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <ScreenWrapper>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')}
          style={styles.backNavButton}
        >
          <Icon name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>

        <Logo size="sm" />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Notifications')}
          style={styles.bellButton}
        >
          <Icon name="bell" size={22} color="#8B0000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. PRODUCT DETAILS SECTION */}
        <View style={styles.card}>
          {/* Main Product Image Banner */}
          <View style={styles.productBannerContainer}>
            <SafeImage
              uri={productImageUri}
              style={styles.productBannerImage}
              resizeMode="cover"
              fallbackIconName="box"
            />
            <View style={styles.categoryBadgeOverlay}>
              <Typography style={styles.categoryBadgeText}>
                {productCategory}
              </Typography>
            </View>
          </View>

          {/* Product Name & Stock Row */}
          <View style={styles.productInfoRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Typography variant="h1" style={styles.productTitle}>
                {productName}
              </Typography>
              <Typography variant="bodySmall" style={styles.warrantySubtitle}>
                <Icon name="shield" size={12} color="#00B14F" /> {warrantyText}
              </Typography>
            </View>
            <View style={[styles.statusBadge, isInStock ? styles.statusInStock : styles.statusOutOfStock]}>
              <Typography style={[styles.statusText, isInStock ? styles.statusTextIn : styles.statusTextOut]}>
                {isInStock ? 'In Stock' : 'Out of Stock'}
              </Typography>
            </View>
          </View>

          {/* Pricing & Quantity Selector */}
          <View style={styles.pricingCardRow}>
            <View>
              <Typography variant="bodySmall" style={styles.unitLabel}>
                Price per {unitStr}
              </Typography>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Typography variant="h1" style={styles.mainPriceText}>
                  ₹ {unitPrice}
                </Typography>
                {discountPrice > 0 && discountPrice < unitPrice ? (
                  <Typography style={styles.discountPriceText}>
                    ₹ {discountPrice}
                  </Typography>
                ) : null}
              </View>
              <Typography variant="bodySmall" style={styles.totalCalcText}>
                Total: ₹ {(unitPrice * quantity).toFixed(2)} ({quantity} {unitStr})
              </Typography>
            </View>

            {/* Quantity Stepper */}
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={styles.stepperButton}
              >
                <Icon name="minus" size={16} color="#8B0000" />
              </TouchableOpacity>
              <Typography variant="bodyBold" style={styles.stepperValue}>
                {quantity}
              </Typography>
              <TouchableOpacity
                onPress={() => setQuantity((q) => q + 1)}
                style={styles.stepperButton}
              >
                <Icon name="plus" size={16} color="#8B0000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Product Description */}
          <View style={styles.descriptionContainer}>
            <Typography variant="bodyBold" style={styles.subSectionTitle}>
              Product Details & Specifications
            </Typography>
            <Typography variant="bodySmall" style={styles.productDescriptionText}>
              {product?.product_description ||
                product?.description ||
                'High-performance, certified construction material suitable for structural frameworks, residential builds, and industrial specifications.'}
            </Typography>
          </View>
        </View>

        {/* 2. VENDOR DETAILS SECTION */}
        <View style={styles.card}>
          <Typography variant="bodyBold" style={styles.subSectionTitle}>
            Vendor Details
          </Typography>

          <View style={styles.cardHeader}>
            <View style={styles.vendorAvatarBox}>
              <MaterialCommunityIcon name="storefront-outline" size={32} color="#8B0000" />
            </View>

            <View style={styles.headerInfo}>
              <View style={styles.titleRow}>
                <Typography variant="bodyBold" style={styles.supplierTitle}>
                  {supplierName}
                </Typography>
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcon name="check-circle" size={16} color="#00B14F" />
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Icon name="map-pin" size={12} color="#E05656" />
                  <Typography variant="bodySmall" style={styles.metaText} numberOfLines={1}>
                    {supplierAddress}
                  </Typography>
                </View>
                <View style={styles.metaItem}>
                  <Icon name="star" size={12} color="#F5A623" />
                  <Typography variant="bodySmall" style={styles.metaText}>
                    {product?.rating || '4.8 (Verified)'}
                  </Typography>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons: Call, Message (In-app chat), Map (In-app map) */}
          <View style={styles.quickActionRow}>
            <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.7} onPress={handleCall}>
              <MaterialCommunityIcon name="phone" size={18} color="#8B0000" />
              <Typography variant="bodyMedium" style={styles.quickActionText}>
                Call
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              activeOpacity={0.7}
              onPress={() => setChatModalVisible(true)}
            >
              <MaterialCommunityIcon name="comment-text-multiple-outline" size={18} color="#8B0000" />
              <Typography variant="bodyMedium" style={styles.quickActionText}>
                Message
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              activeOpacity={0.7}
              onPress={() => setMapModalVisible(true)}
            >
              <MaterialCommunityIcon name="map-marker-radius" size={18} color="#8B0000" />
              <Typography variant="bodyMedium" style={styles.quickActionText}>
                Map
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Supplier Track Record */}
          <View style={styles.verifiedRecordBox}>
            <MaterialCommunityIcon name="shield-check" size={24} color="#00B14F" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Typography variant="bodyMedium" style={{ fontWeight: '700', color: '#1E293B', fontSize: 13 }}>
                Platform Verified Supplier
              </Typography>
              <Typography variant="bodySmall" style={{ color: '#64748B', marginTop: 2, fontSize: 11 }}>
                Fulfills ConstiGo quality guarantee with zero recorded safety or specification disputes.
              </Typography>
            </View>
          </View>
        </View>

        {/* 3. LOGISTICS & DELIVERY SECTION */}
        <View style={styles.card}>
          <Typography variant="h2" style={styles.sectionTitle}>
            Logistics & Delivery Details
          </Typography>

          <View style={styles.logisticsRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="clock" size={15} color="#8B0000" style={{ marginRight: 8 }} />
              <Typography variant="bodyMedium" style={styles.logisticsLabel}>
                Estimated Delivery :
              </Typography>
            </View>
            <Typography variant="bodyMedium" style={styles.logisticsValue}>
              {product?.estimatedDelivery || '1-3 Business Days'}
            </Typography>
          </View>

          <View style={styles.logisticsRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="truck" size={15} color="#8B0000" style={{ marginRight: 8 }} />
              <Typography variant="bodyMedium" style={styles.logisticsLabel}>
                Delivery Method :
              </Typography>
            </View>
            <Typography variant="bodyMedium" style={styles.logisticsValue}>
              {product?.deliveryMethod || 'Flatbed Truck / Site Unload'}
            </Typography>
          </View>

          <View style={styles.logisticsRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="dollar-sign" size={15} color="#8B0000" style={{ marginRight: 8 }} />
              <Typography variant="bodyMedium" style={styles.logisticsLabel}>
                Shipping Rate :
              </Typography>
            </View>
            <Typography variant="bodyMedium" style={styles.logisticsValue}>
              {product?.shippingCost ? `₹ ${product.shippingCost}` : 'Included in Material Price'}
            </Typography>
          </View>
        </View>

        {/* 4. BOTTOM ACTION BUTTON - ADD TO CART ONLY */}
        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity
            style={styles.singleAddToCartButton}
            activeOpacity={0.8}
            onPress={handleAddToCart}
          >
            <Icon name="shopping-bag" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Typography variant="bodyMedium" style={styles.singleAddToCartText}>
              Add to Cart
            </Typography>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* IN-APP CHAT MODAL */}
      <Modal
        visible={chatModalVisible}
        animationType="slide"
        onRequestClose={() => setChatModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, backgroundColor: '#FFFFFF' }}
        >
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <TouchableOpacity
              onPress={() => setChatModalVisible(false)}
              style={styles.chatBackButton}
            >
              <Icon name="arrow-left" size={22} color="#111827" />
            </TouchableOpacity>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Typography variant="bodyBold" style={{ fontSize: 16, color: '#111827' }} numberOfLines={1}>
                {supplierName}
              </Typography>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <View style={styles.onlineDot} />
                <Typography style={{ fontSize: 11, color: '#059669', fontFamily: 'Montserrat-Medium', marginLeft: 4 }}>
                  Online | Fast Responder
                </Typography>
              </View>
            </View>

            <TouchableOpacity onPress={handleCall} style={styles.chatHeaderCallBtn}>
              <Icon name="phone" size={18} color="#8B0000" />
            </TouchableOpacity>
          </View>

          {/* Product context card inside chat */}
          <View style={styles.chatProductContext}>
            <SafeImage
              uri={productImageUri}
              style={{ width: 44, height: 44, borderRadius: 8 }}
              fallbackIconName="box"
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Typography variant="bodyBold" style={{ fontSize: 12, color: '#0F172A' }} numberOfLines={1}>
                {productName}
              </Typography>
              <Typography style={{ fontSize: 11, color: '#8B0000', fontFamily: 'Montserrat-Bold' }}>
                ₹ {unitPrice} / {unitStr}
              </Typography>
            </View>
          </View>

          {/* Chat Messages List */}
          <ScrollView
            style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {chatMessages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.chatBubble,
                  msg.sender === 'user' ? styles.userChatBubble : styles.vendorChatBubble,
                ]}
              >
                <Typography
                  style={[
                    styles.chatBubbleText,
                    msg.sender === 'user' ? styles.userChatText : styles.vendorChatText,
                  ]}
                >
                  {msg.text}
                </Typography>
                <Typography
                  style={[
                    styles.chatBubbleTime,
                    msg.sender === 'user' ? { color: '#FECACA' } : { color: '#94A3B8' },
                  ]}
                >
                  {msg.time}
                </Typography>
              </View>
            ))}
          </ScrollView>

          {/* Quick Inquiry Chips */}
          <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F8FAFC' }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {['Is bulk discount available?', 'When can you deliver?', 'Need site sample test'].map((q) => (
                <TouchableOpacity
                  key={q}
                  onPress={() => handleSendMessage(q)}
                  style={styles.chatChip}
                >
                  <Typography style={{ fontSize: 11, color: '#475569', fontFamily: 'Montserrat-Medium' }}>
                    {q}
                  </Typography>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Chat Input Bar */}
          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatTextInput}
              placeholder="Type your message..."
              placeholderTextColor="#94A3B8"
              value={chatInputText}
              onChangeText={setChatInputText}
            />
            <TouchableOpacity
              onPress={() => handleSendMessage()}
              style={styles.chatSendButton}
              activeOpacity={0.8}
            >
              <Icon name="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* IN-APP MAP MODAL WITH REAL COORDINATES */}
      <Modal
        visible={mapModalVisible}
        animationType="slide"
        onRequestClose={() => setMapModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          {/* Map Header */}
          <View style={styles.chatHeader}>
            <TouchableOpacity
              onPress={() => setMapModalVisible(false)}
              style={styles.chatBackButton}
            >
              <Icon name="arrow-left" size={22} color="#111827" />
            </TouchableOpacity>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Typography variant="bodyBold" style={{ fontSize: 16, color: '#111827' }}>
                Supplier Site Location
              </Typography>
              <Typography style={{ fontSize: 11, color: '#64748B' }}>
                Live GPS Coordinates & Radius View
              </Typography>
            </View>

            <TouchableOpacity onPress={() => setMapModalVisible(false)} style={styles.chatBackButton}>
              <Icon name="x" size={20} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Map Graphic Canvas / Real Coordinates Display */}
          <View style={styles.mapCanvas}>
            <View style={styles.mapGridPattern}>
              <View style={styles.mapRoadH} />
              <View style={styles.mapRoadV} />
              <View style={styles.mapRadiusRing} />
              <View style={styles.mapRadiusRing2} />
              
              {/* Warehouse Pin with Real Coordinates */}
              <View style={styles.mapMarkerPin}>
                <View style={styles.markerBubble}>
                  <Typography style={{ fontSize: 10, color: '#FFFFFF', fontFamily: 'Montserrat-Bold' }}>
                    {supplierName}
                  </Typography>
                  <Typography style={{ fontSize: 8, color: '#FECACA' }}>
                    {supplierLat.toFixed(4)}, {supplierLng.toFixed(4)}
                  </Typography>
                </View>
                <Icon name="map-pin" size={32} color="#8B0000" />
              </View>

              {/* Delivery Site Marker with Real Coordinates */}
              <View style={styles.buyerSiteMarker}>
                <Icon name="navigation" size={24} color="#059669" />
                <View style={styles.buyerSiteBubble}>
                  <Typography style={{ fontSize: 9, color: '#FFFFFF', fontFamily: 'Montserrat-Bold' }}>
                    Your Site ({routeDistanceKm} km)
                  </Typography>
                  <Typography style={{ fontSize: 7, color: '#D1FAE5' }}>
                    {buyerLat.toFixed(4)}, {buyerLng.toFixed(4)}
                  </Typography>
                </View>
              </View>
            </View>
          </View>

          {/* Location Info Card at Bottom */}
          <View style={styles.mapInfoCard}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
              <View style={styles.mapPinBadge}>
                <Icon name="map-pin" size={20} color="#8B0000" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Typography variant="bodyBold" style={{ fontSize: 15, color: '#0F172A' }}>
                  {supplierName} Depot
                </Typography>
                <Typography variant="bodySmall" style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                  {supplierAddress}
                </Typography>
                <Typography style={{ fontSize: 10, color: '#8B0000', fontFamily: 'Montserrat-SemiBold', marginTop: 3 }}>
                  GPS: {supplierLat.toFixed(5)}, {supplierLng.toFixed(5)}
                </Typography>
              </View>
            </View>

            <View style={styles.mapRouteStatsRow}>
              <View style={styles.mapRouteStatItem}>
                <Typography style={{ fontSize: 11, color: '#64748B' }}>Distance</Typography>
                <Typography variant="bodyBold" style={{ fontSize: 14, color: '#0F172A' }}>
                  {routeDistanceKm} km
                </Typography>
              </View>
              <View style={styles.mapRouteStatDivider} />
              <View style={styles.mapRouteStatItem}>
                <Typography style={{ fontSize: 11, color: '#64748B' }}>Transit Time</Typography>
                <Typography variant="bodyBold" style={{ fontSize: 14, color: '#0F172A' }}>
                  ~{estimatedTransitMins} Mins
                </Typography>
              </View>
              <View style={styles.mapRouteStatDivider} />
              <View style={styles.mapRouteStatItem}>
                <Typography style={{ fontSize: 11, color: '#64748B' }}>Site Unload</Typography>
                <Typography variant="bodyBold" style={{ fontSize: 14, color: '#059669' }}>Verified</Typography>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                setMapModalVisible(false);
                setRoadDialVisible(true);
              }}
              style={styles.mapDirectionButton}
            >
              <Icon name="navigation" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Typography style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'Montserrat-Bold' }}>
                Book RoadDial Dispatch
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ROADDIAL BOOKING MODAL */}
      <Modal
        visible={roadDialVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setRoadDialVisible(false)}
      >
        <View style={styles.roadDialOverlay}>
          <View style={styles.roadDialSheet}>
            {/* Sheet Handle & Header */}
            <View style={styles.roadDialHandle} />
            <View style={styles.roadDialHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.roadDialLogoBadge}>
                  <Icon name="truck" size={18} color="#FFFFFF" />
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Typography variant="h2" style={{ fontSize: 17, color: '#0F172A' }}>
                    RoadDial Material Dispatch
                  </Typography>
                  <Typography style={{ fontSize: 11, color: '#059669', fontFamily: 'Montserrat-SemiBold' }}>
                    Live GPS Routing & Vehicle Booking
                  </Typography>
                </View>
              </View>
              <TouchableOpacity onPress={() => setRoadDialVisible(false)} style={styles.chatBackButton}>
                <Icon name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }}>
              {/* Road-Dial Destination Location Preference */}
              <View style={styles.serviceLocationSection}>
                <View style={styles.locationSectionHeader}>
                  <Icon name="navigation" size={15} color="#8B0000" />
                  <Typography variant="bodyBold" style={styles.locationSectionTitle}>
                    Delivery Location Preference
                  </Typography>
                </View>
                <Typography style={styles.locationSectionSubtitle}>
                  Select where you want the RoadDial delivery truck to arrive:
                </Typography>

                <View style={styles.locationOptionsRow}>
                  {/* 1. Current Live Location Option */}
                  <TouchableOpacity
                    style={[
                      styles.locationOptionCard,
                      serviceLocationMode === 'current' && styles.locationOptionCardActive,
                    ]}
                    onPress={() => setServiceLocationMode('current')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.optionHeaderRow}>
                      <View style={[styles.radioCircle, serviceLocationMode === 'current' && styles.radioCircleActive]}>
                        {serviceLocationMode === 'current' && <View style={styles.radioDot} />}
                      </View>
                      <Typography style={[styles.optionTitle, serviceLocationMode === 'current' && styles.optionTitleActive]}>
                        📍 Current GPS
                      </Typography>
                    </View>
                    <Typography style={styles.optionDesc} numberOfLines={2}>
                      {liveGpsAddress}
                    </Typography>
                    <TouchableOpacity
                      style={styles.optionActionBtn}
                      onPress={fetchLiveGpsLocation}
                      disabled={isRefreshingGps}
                    >
                      <Typography style={styles.optionActionText}>
                        {isRefreshingGps ? 'Refreshing...' : '🔄 Refresh GPS'}
                      </Typography>
                    </TouchableOpacity>
                  </TouchableOpacity>

                  {/* 2. Profile Permanent Address Option */}
                  <TouchableOpacity
                    style={[
                      styles.locationOptionCard,
                      serviceLocationMode === 'profile' && styles.locationOptionCardActive,
                    ]}
                    onPress={() => setServiceLocationMode('profile')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.optionHeaderRow}>
                      <View style={[styles.radioCircle, serviceLocationMode === 'profile' && styles.radioCircleActive]}>
                        {serviceLocationMode === 'profile' && <View style={styles.radioDot} />}
                      </View>
                      <Typography style={[styles.optionTitle, serviceLocationMode === 'profile' && styles.optionTitleActive]}>
                        🏢 Profile Address
                      </Typography>
                    </View>
                    <Typography style={styles.optionDesc} numberOfLines={2}>
                      {buyerSiteAddress}
                    </Typography>
                    <TouchableOpacity
                      style={styles.optionActionBtn}
                      onPress={() => {
                        setRoadDialVisible(false);
                        navigation.navigate('AddressManager');
                      }}
                    >
                      <Typography style={styles.optionActionText}>
                        🗺️ Edit on Map
                      </Typography>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </View>

                {/* Road-Dial Active Routing Banner */}
                <View style={styles.locationSummaryBanner}>
                  <Icon name="check-circle" size={13} color="#059669" style={{ marginRight: 6 }} />
                  <Typography style={styles.locationSummaryBannerText}>
                    {serviceLocationMode === 'current'
                      ? `Truck dispatched to Live GPS Coordinates (${activeBuyerLat.toFixed(5)}, ${activeBuyerLng.toFixed(5)})`
                      : `Truck dispatched to Profile Address Coordinates (${activeBuyerLat.toFixed(5)}, ${activeBuyerLng.toFixed(5)})`}
                  </Typography>
                </View>
              </View>

              {/* Pickup & Drop Route Coordinates Card */}
              <View style={styles.routeTimelineCard}>
                {/* Pickup Node */}
                <View style={styles.routeNodeRow}>
                  <View style={styles.pickupDot} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Typography style={{ fontSize: 10, color: '#8B0000', fontFamily: 'Montserrat-Bold' }}>
                      PICKUP POINT (DEPOT)
                    </Typography>
                    <Typography variant="bodyBold" style={{ fontSize: 13, color: '#0F172A' }}>
                      {supplierName}
                    </Typography>
                    <Typography style={{ fontSize: 11, color: '#64748B' }}>
                      {supplierAddress}
                    </Typography>
                    <Typography style={{ fontSize: 10, color: '#059669', fontFamily: 'Montserrat-Medium', marginTop: 1 }}>
                      GPS: {supplierLat.toFixed(5)}, {supplierLng.toFixed(5)}
                    </Typography>
                  </View>
                </View>

                {/* Connecting Dotted Line */}
                <View style={styles.routeDottedLine} />

                {/* Drop Node */}
                <View style={styles.routeNodeRow}>
                  <View style={styles.dropPin} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Typography style={{ fontSize: 10, color: '#059669', fontFamily: 'Montserrat-Bold' }}>
                      DROP POINT (YOUR CONSTRUCTION SITE)
                    </Typography>
                    <Typography variant="bodyBold" style={{ fontSize: 13, color: '#0F172A' }}>
                      {serviceLocationMode === 'current' ? 'Current Live GPS Location' : 'Buyer Construction Site'}
                    </Typography>
                    <Typography style={{ fontSize: 11, color: '#64748B' }}>
                      {activeBuyerAddress}
                    </Typography>
                    <Typography style={{ fontSize: 10, color: '#059669', fontFamily: 'Montserrat-Medium', marginTop: 1 }}>
                      GPS: {activeBuyerLat.toFixed(5)}, {activeBuyerLng.toFixed(5)}
                    </Typography>
                  </View>
                </View>
              </View>

              {/* Transit & Distance Badges */}
              <View style={styles.routeMetricsRow}>
                <View style={styles.routeMetricItem}>
                  <Icon name="map-pin" size={14} color="#8B0000" />
                  <Typography style={{ fontSize: 12, color: '#0F172A', fontFamily: 'Montserrat-Bold', marginLeft: 4 }}>
                    {routeDistanceKm} km
                  </Typography>
                  <Typography style={{ fontSize: 10, color: '#64748B', marginLeft: 3 }}>Distance</Typography>
                </View>
                <View style={styles.routeMetricItem}>
                  <Icon name="clock" size={14} color="#059669" />
                  <Typography style={{ fontSize: 12, color: '#0F172A', fontFamily: 'Montserrat-Bold', marginLeft: 4 }}>
                    ~{estimatedTransitMins} mins
                  </Typography>
                  <Typography style={{ fontSize: 10, color: '#64748B', marginLeft: 3 }}>Transit</Typography>
                </View>
              </View>

              {/* Select Fleet Type (RoadDial) */}
              <Typography variant="bodyBold" style={{ fontSize: 13, color: '#0F172A', marginBottom: 8 }}>
                Select Transport Vehicle (RoadDial Fleet)
              </Typography>
              <View style={{ gap: 8, marginBottom: 14 }}>
                {[
                  { id: 'mini', title: 'Tata Ace (1 Ton)', desc: 'Fast small-batch transport', icon: 'truck' },
                  { id: 'flatbed', title: 'Eicher 14ft (4-7 Ton)', desc: 'Standard material flatbed', icon: 'truck' },
                  { id: 'tipper', title: 'Heavy Tipper (10+ Ton)', desc: 'Bulk sand & aggregate unload', icon: 'truck' },
                ].map((f) => {
                  const isSel = selectedFleet === f.id;
                  return (
                    <TouchableOpacity
                      key={f.id}
                      onPress={() => setSelectedFleet(f.id as any)}
                      style={[styles.fleetOptionCard, isSel && styles.fleetOptionCardActive]}
                    >
                      <View style={[styles.fleetIconBox, isSel && styles.fleetIconBoxActive]}>
                        <Icon name={f.icon} size={18} color={isSel ? '#FFFFFF' : '#8B0000'} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Typography variant="bodyBold" style={{ fontSize: 13, color: isSel ? '#8B0000' : '#0F172A' }}>
                          {f.title}
                        </Typography>
                        <Typography style={{ fontSize: 11, color: '#64748B' }}>
                          {f.desc}
                        </Typography>
                      </View>
                      {isSel ? (
                        <Icon name="check-circle" size={18} color="#8B0000" />
                      ) : (
                        <View style={styles.fleetUncheckCircle} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Order Fare Summary */}
              <View style={styles.roadDialFareCard}>
                <View style={styles.fareLineRow}>
                  <Typography style={{ fontSize: 12, color: '#64748B' }}>Material Cost ({quantity}x {unitStr})</Typography>
                  <Typography style={{ fontSize: 12, color: '#0F172A', fontFamily: 'Montserrat-Bold' }}>
                    ₹ {(unitPrice * quantity).toFixed(2)}
                  </Typography>
                </View>
                <View style={styles.fareLineRow}>
                  <Typography style={{ fontSize: 12, color: '#64748B' }}>RoadDial Freight & Unloading</Typography>
                  <Typography style={{ fontSize: 12, color: '#059669', fontFamily: 'Montserrat-Bold' }}>
                    FREE (Included)
                  </Typography>
                </View>
                <View style={styles.fareTotalRow}>
                  <Typography variant="bodyBold" style={{ fontSize: 14, color: '#0F172A' }}>
                    Total Payable Amount
                  </Typography>
                  <Typography variant="h1" style={{ fontSize: 18, color: '#8B0000' }}>
                    ₹ {(unitPrice * quantity).toFixed(2)}
                  </Typography>
                </View>
              </View>
            </ScrollView>

            {/* Confirm & Dial Dispatch Button */}
            <TouchableOpacity
              onPress={executeRoadDialOrder}
              disabled={isOrdering}
              style={[styles.roadDialConfirmBtn, isOrdering && { opacity: 0.7 }]}
            >
              {isOrdering ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="check-circle" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Typography style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'Montserrat-Bold' }}>
                    Confirm & Dial Dispatch
                  </Typography>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  backNavButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#800000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bellButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  productBannerContainer: {
    width: '100%',
    height: 190,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    position: 'relative',
    marginBottom: 14,
  },
  productBannerImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadgeOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#8B0000',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Montserrat-Bold',
  },
  productInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  productTitle: {
    fontSize: 20,
    fontFamily: 'BalooBhai2-Bold',
    color: '#0F172A',
    lineHeight: 26,
  },
  warrantySubtitle: {
    fontSize: 12,
    color: '#059669',
    fontFamily: 'Montserrat-SemiBold',
    marginTop: 4,
  },
  pricingCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unitLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  mainPriceText: {
    fontSize: 24,
    fontFamily: 'BalooBhai2-Bold',
    color: '#8B0000',
    lineHeight: 28,
  },
  discountPriceText: {
    fontSize: 14,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginLeft: 8,
    fontFamily: 'Montserrat-Medium',
  },
  totalCalcText: {
    fontSize: 11,
    color: '#059669',
    fontFamily: 'Montserrat-SemiBold',
    marginTop: 3,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: '#8B0000',
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: 15,
    color: '#0F172A',
    marginHorizontal: 12,
    fontFamily: 'Montserrat-Bold',
  },
  descriptionContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  subSectionTitle: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: 'Montserrat-Bold',
    marginBottom: 6,
  },
  productDescriptionText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  vendorAvatarBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  productIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: 14,
    overflow: 'hidden',
  },
  shovelIconBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  headerInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  supplierTitle: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
    lineHeight: 22,
  },
  verifiedBadge: {
    marginLeft: 6,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    flex: 1,
  },
  metaText: {
    fontSize: 11,
    color: '#666666',
    marginLeft: 3,
  },
  statusBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusInStock: {
    backgroundColor: '#E8F5E9',
  },
  statusOutOfStock: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
  },
  statusTextIn: {
    color: '#00B14F',
  },
  statusTextOut: {
    color: '#D32F2F',
  },
  supplierDescription: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 18,
    marginTop: 12,
    marginBottom: 16,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 14,
    marginTop: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  quickActionText: {
    fontSize: 12,
    color: '#8B0000',
    fontFamily: 'Montserrat-SemiBold',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'BalooBhai2-Bold',
    color: '#000000',
    marginBottom: 12,
  },
  verifiedRecordBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  logisticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  logisticsLabel: {
    fontSize: 13,
    color: '#666666',
  },
  logisticsValue: {
    fontSize: 13,
    color: '#000000',
    fontFamily: 'Montserrat-SemiBold',
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
  },
  singleAddToCartButton: {
    flex: 1,
    backgroundColor: '#8B0000',
    borderRadius: 24,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  singleAddToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  chatBackButton: {
    padding: 6,
    borderRadius: 20,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  chatHeaderCallBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  chatProductContext: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chatBubble: {
    maxWidth: '82%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  userChatBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#8B0000',
    borderBottomRightRadius: 4,
  },
  vendorChatBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 4,
  },
  chatBubbleText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Montserrat-Medium',
  },
  userChatText: {
    color: '#FFFFFF',
  },
  vendorChatText: {
    color: '#1E293B',
  },
  chatBubbleTime: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
    fontFamily: 'Montserrat-Regular',
  },
  chatChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chatSendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#8B0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    position: 'relative',
    overflow: 'hidden',
  },
  mapGridPattern: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  mapRoadH: {
    position: 'absolute',
    width: '100%',
    height: 18,
    backgroundColor: '#CBD5E1',
    top: '46%',
  },
  mapRoadV: {
    position: 'absolute',
    height: '100%',
    width: 18,
    backgroundColor: '#CBD5E1',
    left: '46%',
  },
  mapRadiusRing: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: 'rgba(139, 0, 0, 0.18)',
    backgroundColor: 'rgba(139, 0, 0, 0.05)',
  },
  mapRadiusRing2: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(139, 0, 0, 0.15)',
  },
  mapMarkerPin: {
    alignItems: 'center',
    position: 'absolute',
    top: '38%',
    left: '42%',
  },
  markerBubble: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  buyerSiteMarker: {
    alignItems: 'center',
    position: 'absolute',
    bottom: '24%',
    right: '28%',
  },
  buyerSiteBubble: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 2,
  },
  mapInfoCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  mapPinBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  mapRouteStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mapRouteStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  mapRouteStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
  },
  mapDirectionButton: {
    backgroundColor: '#8B0000',
    borderRadius: 22,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  roadDialOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  roadDialSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '90%',
  },
  roadDialHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  roadDialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  roadDialLogoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#8B0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeTimelineCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  routeNodeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pickupDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#8B0000',
    marginTop: 3,
    borderWidth: 2,
    borderColor: '#FECACA',
  },
  dropPin: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#059669',
    marginTop: 3,
    borderWidth: 2,
    borderColor: '#A7F3D0',
  },
  routeDottedLine: {
    width: 2,
    height: 22,
    backgroundColor: '#CBD5E1',
    marginLeft: 6,
    marginVertical: 4,
  },
  routeMetricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  routeMetricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  fleetOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  fleetOptionCardActive: {
    borderColor: '#8B0000',
    backgroundColor: '#FFF5F5',
  },
  fleetIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fleetIconBoxActive: {
    backgroundColor: '#8B0000',
  },
  fleetUncheckCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  roadDialFareCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  fareLineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fareTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 4,
  },
  roadDialConfirmBtn: {
    backgroundColor: '#8B0000',
    borderRadius: 24,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  serviceLocationSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  locationSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationSectionTitle: {
    fontSize: 13,
    color: '#0F172A',
    marginLeft: 6,
  },
  locationSectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 10,
  },
  locationOptionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  locationOptionCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  locationOptionCardActive: {
    backgroundColor: '#FFF5F5',
    borderColor: '#8B0000',
  },
  optionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  radioCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  radioCircleActive: {
    borderColor: '#8B0000',
  },
  radioDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B0000',
  },
  optionTitle: {
    fontSize: 12,
    color: '#334155',
    fontFamily: 'Montserrat-Bold',
  },
  optionTitleActive: {
    color: '#8B0000',
  },
  optionDesc: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
    marginBottom: 6,
    minHeight: 28,
  },
  optionActionBtn: {
    paddingVertical: 3,
  },
  optionActionText: {
    fontSize: 10,
    color: '#8B0000',
    fontFamily: 'Montserrat-Bold',
  },
  locationSummaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  locationSummaryBannerText: {
    fontSize: 10,
    color: '#065F46',
    fontFamily: 'Montserrat-Medium',
    flex: 1,
  },
});

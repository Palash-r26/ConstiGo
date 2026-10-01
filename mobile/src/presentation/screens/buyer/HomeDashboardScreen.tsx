import React from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Linking, ActivityIndicator } from 'react-native';
import { Typography } from '../../components/Typography';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Logo } from '../../components/Logo';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';

import { useHomeStore, Product } from '../../../application/store/homeStore';
import { useUserStore } from '../../../application/store/userStore';

export interface ServiceCategory {
  id: string;
  name: string;
  iconName: string;
  iconType: 'feather' | 'material';
  description: string;
  availableCount: number;
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'plumber',
    name: 'Plumber',
    iconName: 'wrench',
    iconType: 'feather',
    description: 'Pipe fittings, repairs & leakage solutions',
    availableCount: 2,
  },
  {
    id: 'mistry',
    name: 'Mistry / Mason',
    iconName: 'home',
    iconType: 'feather',
    description: 'Brickwork, plastering & foundation work',
    availableCount: 2,
  },
  {
    id: 'electrician',
    name: 'Electrician',
    iconName: 'zap',
    iconType: 'feather',
    description: 'Wiring, MCBs, lighting & appliance setup',
    availableCount: 2,
  },
  {
    id: 'carpenter',
    name: 'Carpenter',
    iconName: 'box',
    iconType: 'feather',
    description: 'Doors, windows, modular wood fittings',
    availableCount: 2,
  },
  {
    id: 'painter',
    name: 'Painter',
    iconName: 'edit-3',
    iconType: 'feather',
    description: 'Wall painting, whitewashing & polishing',
    availableCount: 2,
  },
  {
    id: 'tiles',
    name: 'Tile & Marble Setter',
    iconName: 'grid',
    iconType: 'feather',
    description: 'Flooring tiles, granite & marble laying',
    availableCount: 1,
  },
  {
    id: 'welder',
    name: 'Welder / Fabricator',
    iconName: 'shield',
    iconType: 'feather',
    description: 'Gates, grills, railings & metal structure',
    availableCount: 1,
  },
  {
    id: 'helper',
    name: 'Labor / Helper',
    iconName: 'users',
    iconType: 'feather',
    description: 'Material shifting, loading & site support',
    availableCount: 1,
  },
];

export interface ServiceWorker {
  _id: string;
  name: string;
  category: string;
  categoryId: string;
  email: string;
  phone: string;
  serviceCharge: string;
  visitingCharge: string;
  rating: string;
  distance: string;
  experience: string;
}

export const SERVICE_WORKERS: ServiceWorker[] = [
  {
    _id: 'w1',
    name: 'Ramesh Sharma',
    category: 'Plumber',
    categoryId: 'plumber',
    email: 'ramesh.sharma.plumb@gmail.com',
    phone: '+91 98765 43210',
    serviceCharge: '₹ 400 / service',
    visitingCharge: '₹ 150',
    rating: '4.8 (95)',
    distance: '1.8 km',
    experience: '8 yrs exp',
  },
  {
    _id: 'w2',
    name: 'Dinesh Gupta',
    category: 'Plumber',
    categoryId: 'plumber',
    email: 'dinesh.gupta.plumbing@gmail.com',
    phone: '+91 98234 56789',
    serviceCharge: '₹ 350 / service',
    visitingCharge: '₹ 100',
    rating: '4.7 (62)',
    distance: '2.5 km',
    experience: '5 yrs exp',
  },
  {
    _id: 'w3',
    name: 'Manoj Kumar (Raj Mistry)',
    category: 'Mistry / Mason',
    categoryId: 'mistry',
    email: 'manoj.kumar.mistry@gmail.com',
    phone: '+91 95899 08555',
    serviceCharge: '₹ 900 / day',
    visitingCharge: '₹ 200',
    rating: '4.9 (132)',
    distance: '2.4 km',
    experience: '12 yrs exp',
  },
  {
    _id: 'w4',
    name: 'Bhola Yadav',
    category: 'Mistry / Mason',
    categoryId: 'mistry',
    email: 'bhola.mason.work@gmail.com',
    phone: '+91 97123 45670',
    serviceCharge: '₹ 850 / day',
    visitingCharge: '₹ 150',
    rating: '4.6 (78)',
    distance: '3.0 km',
    experience: '10 yrs exp',
  },
  {
    _id: 'w5',
    name: 'Sunil Verma',
    category: 'Electrician',
    categoryId: 'electrician',
    email: 'sunil.verma.electric@gmail.com',
    phone: '+91 98112 34567',
    serviceCharge: '₹ 350 / service',
    visitingCharge: '₹ 100',
    rating: '4.7 (80)',
    distance: '3.1 km',
    experience: '6 yrs exp',
  },
  {
    _id: 'w6',
    name: 'Amit Patel',
    category: 'Electrician',
    categoryId: 'electrician',
    email: 'amit.power.services@gmail.com',
    phone: '+91 94250 88990',
    serviceCharge: '₹ 400 / service',
    visitingCharge: '₹ 120',
    rating: '4.8 (110)',
    distance: '2.1 km',
    experience: '9 yrs exp',
  },
  {
    _id: 'w7',
    name: 'Irfan Khan',
    category: 'Carpenter',
    categoryId: 'carpenter',
    email: 'irfan.woodcraft@gmail.com',
    phone: '+91 98930 11223',
    serviceCharge: '₹ 800 / day',
    visitingCharge: '₹ 200',
    rating: '4.8 (64)',
    distance: '2.9 km',
    experience: '10 yrs exp',
  },
  {
    _id: 'w8',
    name: 'Harish Sharma',
    category: 'Carpenter',
    categoryId: 'carpenter',
    email: 'harish.carpentry@gmail.com',
    phone: '+91 97550 44332',
    serviceCharge: '₹ 750 / day',
    visitingCharge: '₹ 150',
    rating: '4.5 (45)',
    distance: '4.2 km',
    experience: '7 yrs exp',
  },
  {
    _id: 'w9',
    name: 'Rajesh Painter',
    category: 'Painter',
    categoryId: 'painter',
    email: 'rajesh.paints.indore@gmail.com',
    phone: '+91 98260 77889',
    serviceCharge: '₹ 750 / day',
    visitingCharge: '₹ 150',
    rating: '4.6 (52)',
    distance: '3.5 km',
    experience: '7 yrs exp',
  },
  {
    _id: 'w10',
    name: 'Vikram Singh',
    category: 'Painter',
    categoryId: 'painter',
    email: 'vikram.colors.art@gmail.com',
    phone: '+91 99810 55443',
    serviceCharge: '₹ 700 / day',
    visitingCharge: '₹ 100',
    rating: '4.7 (38)',
    distance: '2.8 km',
    experience: '5 yrs exp',
  },
  {
    _id: 'w11',
    name: 'Kailash Yadav',
    category: 'Tile & Marble Setter',
    categoryId: 'tiles',
    email: 'kailash.marble.tiles@gmail.com',
    phone: '+91 98933 66778',
    serviceCharge: '₹ 850 / day',
    visitingCharge: '₹ 200',
    rating: '4.9 (88)',
    distance: '2.2 km',
    experience: '11 yrs exp',
  },
  {
    _id: 'w12',
    name: 'Salim Mansoori',
    category: 'Welder / Fabricator',
    categoryId: 'welder',
    email: 'salim.metal.fabrication@gmail.com',
    phone: '+91 97520 88112',
    serviceCharge: '₹ 800 / day',
    visitingCharge: '₹ 150',
    rating: '4.8 (70)',
    distance: '3.7 km',
    experience: '9 yrs exp',
  },
  {
    _id: 'w13',
    name: 'Raju Lodhi',
    category: 'Labor / Helper',
    categoryId: 'helper',
    email: 'raju.sitehelper@gmail.com',
    phone: '+91 98270 33221',
    serviceCharge: '₹ 500 / day',
    visitingCharge: '₹ 50',
    rating: '4.6 (40)',
    distance: '1.5 km',
    experience: '4 yrs exp',
  },
];

export const HomeDashboardScreen = ({ navigation }: any) => {
  const categories = ['All', 'Cement', 'Steel', 'Bricks', 'Services', 'Sand'];
  const [activeCategory, setActiveCategory] = React.useState('All');
  const [selectedServiceCategory, setSelectedServiceCategory] = React.useState<string | null>(null);
  
  const { products, trending, isLoading, fetchProducts } = useHomeStore();
  const { profile, toggleWishlist, fetchProfile } = useUserStore();

  useFocusEffect(
    React.useCallback(() => {
      fetchProducts();
      fetchProfile();
    }, [])
  );

  const isFavorited = (productId: string) => {
    if (!profile || !profile.wishlist) return false;
    return profile.wishlist.some((item: any) => item._id === productId || item === productId);
  };

  const filteredTrending = activeCategory === 'All' 
    ? trending 
    : trending.filter((item: Product) => item.category === activeCategory);

  const handleCallWorker = (phone: string) => {
    const phoneUrl = `tel:${phone.replace(/\s+/g, '')}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Phone Call', `Call worker at: ${phone}`);
        }
      })
      .catch(() => {
        Alert.alert('Phone Call', `Call worker at: ${phone}`);
      });
  };

  const handleBookService = (worker: ServiceWorker) => {
    Alert.alert(
      'Connect with Worker',
      `Would you like to connect with ${worker.name} (${worker.category})?\n\nPhone: ${worker.phone}\nVisiting Charge: ${worker.visitingCharge}\nService Charge: ${worker.serviceCharge}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          onPress: () => handleCallWorker(worker.phone),
        },
      ]
    );
  };

  // Filtered workers when a category is selected
  const workersForSelectedCategory = selectedServiceCategory
    ? SERVICE_WORKERS.filter(
        (w) => w.categoryId === selectedServiceCategory || w.category.toLowerCase().includes(selectedServiceCategory.toLowerCase())
      )
    : SERVICE_WORKERS;

  const currentCategoryObj = SERVICE_CATEGORIES.find(
    (c) => c.id === selectedServiceCategory || c.name === selectedServiceCategory
  );

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Top Header: avatar left, logo centered, notifications right */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 6, paddingBottom: 10 }}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Profile')}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#8B0000', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#8B0000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 }}
          >
            <Icon name="user" size={19} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Logo size="sm" />
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Notifications')}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 3, borderWidth: 1, borderColor: '#F1F5F9' }}
          >
            <Icon name="bell" size={20} color="#8B0000" />
          </TouchableOpacity>
        </View>

        {/* Hero Text */}
        <View className="px-6 mb-5 mt-3">
          <Typography
            variant="h1Black"
            className="text-[#111827]"
            style={{ fontSize: 28, lineHeight: 34, letterSpacing: -0.5 }}
          >
            Build your dream project with ease
          </Typography>
        </View>

        {/* Search Bar */}
        <View className="px-6 mb-6 flex-row gap-x-3">
          <TouchableOpacity 
            onPress={() => navigation.navigate('Search')}
            className="flex-1 flex-row items-center bg-surface rounded-full px-5 py-3 shadow-sm shadow-gray-200 border border-gray-100"
          >
            <Icon name="search" size={20} color="#6B7280" className="mr-2" />
            <Typography variant="bodyDefault" className="text-text-secondary flex-1">Search</Typography>
          </TouchableOpacity>
          <TouchableOpacity className="w-12 h-12 bg-primary rounded-full justify-center items-center shadow-sm">
            <Icon name="sliders" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Top Main Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }} className="mb-8">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity 
                key={cat}
                onPress={() => {
                  setActiveCategory(cat);
                  if (cat !== 'Services') {
                    setSelectedServiceCategory(null);
                  }
                }}
                className={`px-6 py-2 rounded-full ${isActive ? 'bg-primary' : 'bg-surface shadow-sm shadow-gray-100'}`}
              >
                <Typography variant="bodyMedium" className={isActive ? "text-white" : "text-text-secondary"}>
                  {cat}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {isLoading ? (
          <ActivityIndicator size="large" color="#8B0000" />
        ) : (
          <>
            {/* SERVICES TAB ACTIVE */}
            {activeCategory === 'Services' ? (
              <View className="px-6 mb-8">
                {/* LEVEL 1: Sub-category Grid when no specific category is selected */}
                {selectedServiceCategory === null ? (
                  <View>
                    <View className="mb-4">
                      <Typography variant="h2" style={{ fontSize: 18, color: '#111827' }}>
                        Service Categories
                      </Typography>
                      <Typography variant="bodySmall" className="text-text-secondary mt-0.5">
                        Select a category to view verified workers and charges
                      </Typography>
                    </View>

                    {/* 2-Column Grid of Service Categories */}
                    <View className="flex-row flex-wrap justify-between gap-y-4">
                      {SERVICE_CATEGORIES.map((cat) => (
                        <TouchableOpacity
                          key={cat.id}
                          activeOpacity={0.8}
                          onPress={() => setSelectedServiceCategory(cat.id)}
                          style={{ width: '48%' }}
                          className="bg-surface rounded-3xl p-4 shadow-sm shadow-gray-200 border border-gray-100 justify-between min-h-[140px]"
                        >
                          <View>
                            <View className="w-12 h-12 rounded-2xl bg-red-50 justify-center items-center mb-3">
                              <Icon name={cat.iconName} size={22} color="#8B0000" />
                            </View>
                            <Typography variant="bodyBold" className="text-sm text-[#111827] mb-1">
                              {cat.name}
                            </Typography>
                            <Typography variant="bodySmall" className="text-[11px] text-text-secondary" numberOfLines={2}>
                              {cat.description}
                            </Typography>
                          </View>

                          <View className="flex-row items-center justify-between pt-2 mt-2 border-t border-gray-100">
                            <Typography style={{ fontSize: 11, color: '#8B0000', fontFamily: 'Montserrat-SemiBold' }}>
                              {cat.availableCount} Workers
                            </Typography>
                            <Icon name="arrow-right" size={14} color="#8B0000" />
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ) : (
                  /* LEVEL 2: Specific Service Category Workers Listing */
                  <View>
                    {/* Header with Back Button */}
                    <View className="flex-row items-center justify-between mb-4">
                      <TouchableOpacity
                        onPress={() => setSelectedServiceCategory(null)}
                        className="flex-row items-center bg-gray-100 px-3 py-1.5 rounded-full"
                        activeOpacity={0.7}
                      >
                        <Icon name="chevron-left" size={18} color="#111827" />
                        <Typography variant="bodyMedium" className="text-xs text-[#111827] ml-1">
                          All Categories
                        </Typography>
                      </TouchableOpacity>

                      <Typography variant="bodyBold" className="text-xs text-primary">
                        {workersForSelectedCategory.length} Available
                      </Typography>
                    </View>

                    <View className="mb-4">
                      <Typography variant="h2" style={{ fontSize: 20, color: '#111827' }}>
                        {currentCategoryObj?.name || selectedServiceCategory} Workers
                      </Typography>
                      <Typography variant="bodySmall" className="text-text-secondary mt-0.5">
                        Verified professionals with contact and pricing
                      </Typography>
                    </View>

                    {/* Quick Category Filter Bar */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} className="mb-5">
                      {SERVICE_CATEGORIES.map((cat) => {
                        const isSubActive = selectedServiceCategory === cat.id;
                        return (
                          <TouchableOpacity
                            key={cat.id}
                            onPress={() => setSelectedServiceCategory(cat.id)}
                            className={`px-4 py-1.5 rounded-full ${isSubActive ? 'bg-primary' : 'bg-surface border border-gray-200'}`}
                          >
                            <Typography
                              style={{
                                fontSize: 12,
                                color: isSubActive ? '#FFFFFF' : '#334155',
                                fontFamily: isSubActive ? 'Montserrat-Bold' : 'Montserrat-Medium',
                              }}
                            >
                              {cat.name}
                            </Typography>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>

                    {/* Workers List */}
                    <View className="gap-y-4">
                      {workersForSelectedCategory.length === 0 ? (
                        <View className="bg-surface rounded-3xl p-8 items-center justify-center">
                          <Icon name="users" size={40} color="#CBD5E1" className="mb-3" />
                          <Typography variant="bodyBold" className="text-base text-[#182F4B] mb-1">
                            No Workers Found
                          </Typography>
                          <Typography variant="bodySmall" className="text-text-secondary text-center mb-4">
                            Currently no verified workers listed under this category.
                          </Typography>
                          <TouchableOpacity
                            onPress={() => setSelectedServiceCategory(null)}
                            className="bg-primary px-5 py-2 rounded-full"
                          >
                            <Typography variant="bodyMedium" className="text-white text-xs">
                              Browse Other Categories
                            </Typography>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        workersForSelectedCategory.map((worker) => (
                          <View key={worker._id} className="bg-surface rounded-3xl p-5 shadow-sm shadow-gray-200 border border-gray-100">
                            {/* Top row: Avatar/Icon + Name + Verified Badge */}
                            <View className="flex-row justify-between items-start mb-3">
                              <View className="flex-row items-center flex-1">
                                <View className="w-12 h-12 rounded-2xl bg-red-50 justify-center items-center mr-3 border border-red-100">
                                  <Icon name="user-check" size={22} color="#8B0000" />
                                </View>
                                <View className="flex-1">
                                  <View className="flex-row items-center gap-x-2">
                                    <Typography variant="bodyBold" className="text-base text-[#111827]">
                                      {worker.name}
                                    </Typography>
                                    <View className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                      <Typography style={{ fontSize: 9, color: '#059669', fontFamily: 'Montserrat-SemiBold' }}>
                                        Verified
                                      </Typography>
                                    </View>
                                  </View>
                                  <Typography variant="bodySmall" className="text-xs text-primary font-medium mt-0.5">
                                    {worker.category}
                                  </Typography>
                                </View>
                              </View>
                            </View>

                            {/* Contact Info (Phone) */}
                            <View className="bg-gray-50 rounded-2xl px-3.5 py-2.5 mb-3 flex-row items-center">
                              <Icon name="phone" size={14} color="#8B0000" style={{ marginRight: 8 }} />
                              <Typography variant="bodyMedium" className="text-xs text-[#111827]">
                                {worker.phone}
                              </Typography>
                            </View>

                            {/* Price details and Single Call Action */}
                            <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                              <View>
                                <Typography style={{ fontSize: 11, color: '#8A8A8E' }}>
                                  Visiting: {worker.visitingCharge}
                                </Typography>
                                <Typography variant="bodyBold" className="text-primary text-sm">
                                  {worker.serviceCharge}
                                </Typography>
                              </View>

                              <TouchableOpacity
                                onPress={() => handleCallWorker(worker.phone)}
                                className="bg-primary rounded-full px-5 py-2.5 flex-row items-center"
                                activeOpacity={0.85}
                              >
                                <Icon name="phone" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                                <Typography variant="bodyMedium" className="text-white text-xs">
                                  Call Now
                                </Typography>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))
                      )}
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <>
                {/* Trending Materials */}
                <View className="px-6 mb-3 flex-row justify-between items-center">
                  <Typography variant="h2" style={{ fontSize: 18 }}>Trending Materials</Typography>
                  <TouchableOpacity><Typography variant="bodySmall" className="text-primary text-xs">See All</Typography></TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }} className="mb-8">
                  {filteredTrending.map((item: Product) => (
                    <TouchableOpacity 
                      key={item._id} 
                      onPress={() => navigation.navigate('SupplierListing', { product: item })}
                      className="bg-surface rounded-3xl p-4 w-44 shadow-sm shadow-gray-200"
                    >
                      <TouchableOpacity className="absolute right-4 top-4 z-10" onPress={() => toggleWishlist(item._id)}>
                        <Icon name="heart" size={16} color={isFavorited(item._id) ? "#8B0000" : "#9CA3AF"} />
                      </TouchableOpacity>
                      <View className="h-32 bg-input-bg rounded-2xl mb-3 justify-center items-center">
                        <Icon name="box" size={40} color="#9CA3AF" />
                      </View>
                      <Typography variant="bodySemiBold" className="mb-1" numberOfLines={1}>{item.name}</Typography>
                      <View className="flex-row items-end mb-3">
                        <Typography variant="bodyBold" className="text-primary">₹ {item.price} </Typography>
                        <Typography variant="bodySmall" className="text-[10px]">per {item.unit}</Typography>
                      </View>
                      <View className="bg-primary rounded-full py-2 items-center">
                        <Typography variant="bodyMedium" className="text-white text-xs">Get Quotation</Typography>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Construction Services / Workers Section */}
                <View className="px-6 mb-3 flex-row justify-between items-center">
                  <Typography variant="h2" style={{ fontSize: 18 }}>Construction Services</Typography>
                  <TouchableOpacity onPress={() => setActiveCategory('Services')}>
                    <Typography variant="bodySmall" className="text-primary text-xs">See All</Typography>
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }} className="mb-8">
                  {SERVICE_WORKERS.map((worker) => (
                    <View 
                      key={`srv-${worker._id}`}
                      className="bg-surface rounded-3xl p-4 w-52 shadow-sm shadow-gray-200"
                    >
                      <View className="h-24 bg-input-bg rounded-2xl mb-3 justify-center items-center p-3">
                        <Icon name="tool" size={32} color="#8B0000" />
                        <Typography variant="bodyBold" className="text-xs text-[#111827] mt-1">
                          {worker.category}
                        </Typography>
                      </View>
                      <Typography variant="bodySemiBold" className="mb-0.5 text-sm" numberOfLines={1}>
                        {worker.name}
                      </Typography>
                      <Typography variant="bodyBold" className="text-primary text-xs mb-3 mt-1">
                        {worker.serviceCharge}
                      </Typography>
                      <TouchableOpacity 
                        onPress={() => handleCallWorker(worker.phone)}
                        className="bg-primary rounded-full py-2 flex-row items-center justify-center"
                      >
                        <Icon name="phone" size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                        <Typography variant="bodyMedium" className="text-white text-xs">Call Now</Typography>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>

                {/* Best In Deals */}
                <View className="px-6 mb-3 flex-row justify-between items-center">
                  <Typography variant="h2" style={{ fontSize: 18 }}>Best In Deals</Typography>
                  <TouchableOpacity><Typography variant="bodySmall" className="text-primary text-xs">See All</Typography></TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }} className="mb-8">
                  {products.slice(0, 5).map((item: Product) => (
                    <TouchableOpacity 
                      key={`best-${item._id}`} 
                      onPress={() => navigation.navigate('SupplierListing', { product: item })}
                      className="bg-surface rounded-3xl p-4 w-44 shadow-sm shadow-gray-200"
                    >
                      <TouchableOpacity className="absolute right-4 top-4 z-10" onPress={() => toggleWishlist(item._id)}>
                        <Icon name="heart" size={16} color={isFavorited(item._id) ? "#8B0000" : "#9CA3AF"} />
                      </TouchableOpacity>
                      <View className="h-32 bg-input-bg rounded-2xl mb-3 justify-center items-center">
                        <Icon name="box" size={40} color="#9CA3AF" />
                      </View>
                      <Typography variant="bodySemiBold" className="mb-1" numberOfLines={1}>{item.name}</Typography>
                      <View className="flex-row items-end mb-3">
                        <Typography variant="bodyBold" className="text-primary">₹ {item.price} </Typography>
                        <Typography variant="bodySmall" className="text-[10px]">per {item.unit}</Typography>
                      </View>
                      <View className="bg-primary rounded-full py-2 items-center">
                        <Typography variant="bodyMedium" className="text-white text-xs">Get Quotation</Typography>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

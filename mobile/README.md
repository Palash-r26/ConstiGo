# 📱 ConstiGo Mobile Application

[![React Native](https://img.shields.io/badge/React_Native-0.86.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NativeWind](https://img.shields.io/badge/Tailwind_CSS-NativeWind_v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://www.nativewind.dev/)
[![Zustand](https://img.shields.io/badge/State-Zustand-443E38?style=flat-square)](https://github.com/pmndrs/zustand)
[![MapLibre](https://img.shields.io/badge/Map-MapLibre_Native-000000?style=flat-square&logo=maplibre&logoColor=white)](https://maplibre.org/)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay-02042B?style=flat-square&logo=razorpay&logoColor=3395FF)](https://razorpay.com/)

The **ConstiGo Mobile Application** is built with **React Native** (Clean Architecture + NativeWind v4), offering a high-performance, polished mobile experience for contractors, construction material buyers, suppliers, and skilled workers.

---

## 🎨 Key Features & Screens

### 🛍️ **Buyer Portal**
- **Home Dashboard (`HomeDashboardScreen.tsx`)**: Material categories, popular products, nearby suppliers, and promotional banners.
- **Search & Filter (`SearchScreen.tsx`)**: Real-time search with category chips and price filters.
- **Supplier Discovery (`SupplierListingScreen.tsx` & `SupplierDetailsScreen.tsx`)**: Verified vendor profile, catalogue listing, ratings, and location pin.
- **Cart & Dynamic Pricing (`CartScreen.tsx`)**: Unit-based pricing (per bag, ton, truckload, piece) with tax/delivery estimates.
- **Interactive Checkout (`CheckoutScreen.tsx`)**: Address selector and Razorpay / Cash on Delivery payment integration.
- **Address Manager (`AddressManagerScreen.tsx`)**: MapLibre pin-drop coordinate geocoding for construction job sites.
- **Order Tracking (`MyOrdersScreen.tsx` & `OrderDetailsScreen.tsx`)**: Real-time milestone status (`PENDING` → `ACCEPTED` → `DISPATCHED` → `DELIVERED`).
- **Wishlist & Notifications (`WishlistScreen.tsx`, `NotificationsScreen.tsx`)**.

### 🏭 **Supplier Hub**
- **Inventory Dashboard (`InventoryDashboardScreen.tsx`)**: Stock levels, instant availability toggles, unit pricing.
- **Add Product & Materials (`AddProductScreen.tsx`, `AddMaterialScreen.tsx`)**: Material classification, image uploads, grade specs, and pricing.
- **Merchant Onboarding (`EnterCompanyDetailsScreen.tsx`)**: Business KYC, GSTIN, warehouse coordinates.
- **Supplier Orders (`MyOrdersScreen.tsx`, `OrderDetailsScreen.tsx`)**: Incoming orders, dispatch approvals, fulfillment tracking.

### 🔐 **Authentication & Onboarding**
- **Sign In & Sign Up (`SignInScreen.tsx`, `SignUpScreen.tsx`)**: Dual role registration for Buyers and Suppliers.
- **Worker Hub (`WorkerSignUpScreen.tsx`)**: Registration for skilled trade workers with wage rates and location.

---

## 📂 Mobile Architecture

The mobile app follows Clean Architecture principles:

```
mobile/src/
├── application/            # State Stores (Zustand) & Business Logic
│   ├── store/
│   │   ├── authStore.ts    # Authentication tokens & current user session
│   │   ├── cartStore.ts    # Shopping cart items, counts, calculations
│   │   ├── homeStore.ts    # Dashboard data & categories
│   │   └── userStore.ts    # Profile state & addresses
│   └── utils/
│       └── validators.ts   # Form validation helpers
├── domain/                 # Core entities and data contracts
├── infrastructure/         # Native storage, HTTP clients, platform APIs
└── presentation/           # User Interface Layer
    ├── assets/             # Branding and vector artwork
    ├── components/         # Design system (AuthInput, Button, Cards, Modals)
    ├── hooks/              # Custom presentation hooks
    ├── navigation/         # React Navigation stacks & bottom tab bars
    │   ├── RootNavigator.tsx
    │   ├── BuyerTabNavigator.tsx
    │   └── SupplierTabNavigator.tsx
    └── screens/            # Application screens
        ├── auth/
        ├── buyer/
        └── supplier/
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the `mobile/` root:

```env
# Backend Base API URL
API_URL=http://10.0.2.2:5000/api/v1

# Razorpay Key ID
RAZORPAY_KEY_ID=rzp_test_your_key_id

# Cloudinary & Maps
CLOUDINARY_CLOUD_NAME=your_cloud_name
OLA_MAPS_API_KEY=your_ola_maps_api_key
```

> **Note on Android Emulator**: `http://10.0.2.2:5000/api/v1` connects directly to your localhost machine.

---

## 🚀 Running the App

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Start the Metro Bundler
```bash
npm start
```

### 3. Run on Android
Ensure an Android emulator is booted or a physical device is plugged in via USB debugging:
```bash
npm run android
```

### 4. Run on iOS (macOS only)
```bash
cd ios
bundle exec pod install # or: pod install
cd ..
npm run ios
```

---

## 📦 Building for Release

### Android APK / Bundle
```bash
cd android
# Build release APK
./gradlew assembleRelease

# Build release App Bundle (AAB) for Play Store
./gradlew bundleRelease
```
The output APK is generated at:
`android/app/build/outputs/apk/release/app-release.apk`

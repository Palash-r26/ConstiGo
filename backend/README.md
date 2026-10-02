# ⚙️ ConstiGo Backend API Service

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-ioredis-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Node_SDK-02042B?style=flat-square&logo=razorpay&logoColor=3395FF)](https://razorpay.com/)

High-performance REST API backend powering the **ConstiGo** Construction Materials & Services marketplace platform.

---

## 🏗️ Architecture & Highlights

- **Modern ES Modules (`type: "module"`)**: Fully written in TypeScript with native ESM.
- **Geospatial Queries**: MongoDB `2dsphere` indexes enabling sub-second proximity searches for suppliers and delivery coordinates.
- **In-Memory Caching**: Redis caching with `ioredis` for fast session lookup and frequent queries.
- **Payment Verification**: Cryptographic HMAC SHA256 payment signature verification with the official Razorpay SDK.
- **Role-Based Access Control (RBAC)**: Fine-grained middleware ensuring distinct permissions for `BUYER`, `SUPPLIER`, and `ADMIN`.
- **Validation**: Schema-level request validation using **Zod**.

---

## 📂 Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.ts               # Mongoose MongoDB connection handler
│   │   ├── razorpay.ts         # Razorpay instance initializer
│   │   └── redis.ts            # Redis client connection
│   ├── controllers/
│   │   ├── authController.ts   # User registration & JWT login
│   │   ├── cartController.ts   # Cart CRUD operations
│   │   ├── categoryController.ts# Category retrieval
│   │   ├── notificationController.ts # Push notifications
│   │   ├── orderController.ts  # Razorpay order generation & verification
│   │   ├── productController.ts# Product catalogue & supplier inventory
│   │   ├── supplierController.ts # Proximity query ($nearSphere)
│   │   └── userController.ts   # Profiles, addresses, favourites
│   ├── middlewares/
│   │   ├── authMiddleware.ts   # JWT auth token verify & role guard
│   │   └── errorMiddleware.ts  # Centralized error & 404 handler
│   ├── models/
│   │   ├── Cart.ts             # Cart schema
│   │   ├── Category.ts         # Product category schema
│   │   ├── Notification.ts     # User notifications schema
│   │   ├── Order.ts            # Order schema & state enum
│   │   ├── Product.ts          # Material details & units
│   │   ├── Review.ts           # Product & supplier reviews
│   │   └── User.ts             # User profiles & geospatial index
│   ├── routes/                 # Express routers
│   ├── scripts/
│   │   └── seed.ts             # Database seeder script
│   ├── utils/                  # JWT signers & password hashers
│   ├── app.ts                  # Express application setup
│   └── server.ts               # Server bootstrap & port listener
├── .env.example
├── package.json
└── tsconfig.json
```

---

## ⚙️ Environment Configuration

Create a `.env` file in `backend/`:

```env
PORT=5000
NODE_ENV=development

# MongoDB URI (Atlas or Local)
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/?appName=ConstiGo

# JWT Auth Secret
JWT_SECRET=your_jwt_secret_key_here

# Redis Connection URL
REDIS_URL=rediss://default:<password>@<redis-url>:6379

# Razorpay Credentials
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Geocoding & Mapping
OLA_MAPS_API_KEY=your_ola_maps_api_key

# Cloud Media Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## 🚀 Running the Server

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Initial Categories & Data
```bash
npx tsx src/scripts/seed.ts
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build & Production Run
```bash
npm run build
npm start
```

---

## 📡 API Endpoints Reference

Base path: `/api/v1`

### **Authentication**
- `POST /api/v1/auth/register` — Register a new account (`BUYER` | `SUPPLIER` | `WORKER`)
- `POST /api/v1/auth/login` — Login and receive JWT access token

### **Users & Addresses**
- `GET /api/v1/users/me` — Get current profile
- `PATCH /api/v1/users/me` — Update current profile
- `POST /api/v1/users/me/address` — Save new delivery location
- `DELETE /api/v1/users/me/address/:addressId` — Delete address
- `GET /api/v1/users/me/favourites` — Get saved favorite products
- `POST /api/v1/users/me/wishlist/:productId` — Toggle product bookmark

### **Products & Inventory**
- `GET /api/v1/products` — Search products with filters (`category`, `search`)
- `GET /api/v1/products/:id` — Get single product details
- `POST /api/v1/products` — Create product (*Supplier role required*)
- `GET /api/v1/products/inventory` — View my inventory (*Supplier role required*)
- `PATCH /api/v1/products/:id/availability` — Toggle product stock status
- `POST /api/v1/products/:id/reviews` — Leave a review (*Buyer role required*)

### **Cart**
- `GET /api/v1/cart` — Get user's cart
- `POST /api/v1/cart` — Add item to cart
- `PATCH /api/v1/cart` — Update item quantity
- `DELETE /api/v1/cart/:productId` — Remove specific item
- `DELETE /api/v1/cart` — Clear cart

### **Orders & Razorpay Payments**
- `GET /api/v1/orders` — List user's orders
- `POST /api/v1/orders/razorpay/create` — Initialize Razorpay order object
- `POST /api/v1/orders/razorpay/verify` — Verify signature and confirm order placement

### **Suppliers & Categories**
- `GET /api/v1/suppliers` — Proximity query for suppliers near latitude/longitude
- `GET /api/v1/categories` — Get list of material categories
- `GET /api/v1/notifications` — Get user notifications
- `PATCH /api/v1/notifications/read-all` — Mark all as read

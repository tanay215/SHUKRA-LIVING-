# Coupon/Promo Code Feature - Implementation Guide

## Overview
This document explains the coupon/promo code feature implementation, crash fixes, and code improvements made to the e-commerce application.

---

## 🎟️ Coupon Feature Implementation

### Database Schema

**Model:** `server/models/Coupon.js`

The coupon model includes:
- `code`: Unique coupon code (uppercase, alphanumeric)
- `description`: Optional description
- `discountType`: Either 'percentage' or 'flat'
- `discountValue`: Discount amount/percentage
- `minOrderValue`: Minimum order value required
- `maxDiscountAmount`: Maximum discount cap (for percentage discounts)
- `expiryDate`: Expiration date
- `isActive`: Active/inactive status
- `usageLimit`: Total usage limit (null = unlimited)
- `usageCount`: Current usage count
- `usageLimitPerUser`: How many times a single user can use the coupon

### Backend API Routes

#### User Routes (`/api/coupons`)
- **POST `/api/coupons/validate`**: Validate and apply a coupon code
  - Body: `{ code: string, orderAmount: number }`
  - Returns: Coupon details and calculated discount

#### Admin Routes (`/api/admin/coupons`)
- **GET `/api/admin/coupons`**: Get all coupons (with optional `?active=true/false` filter)
- **GET `/api/admin/coupons/:id`**: Get single coupon by ID
- **POST `/api/admin/coupons`**: Create new coupon
- **PUT `/api/admin/coupons/:id`**: Update existing coupon
- **DELETE `/api/admin/coupons/:id`**: Delete coupon

### Order Model Updates

The `Order` model now includes a `coupon` field that stores:
- `code`: Coupon code used
- `discountType`: Type of discount applied
- `discountValue`: Discount value
- `discountAmount`: Actual discount amount applied
- `originalAmount`: Original order amount before coupon

### Frontend Integration

**File:** `src/pages/CheckoutPage.tsx`

Features added:
- Coupon code input field in order summary
- Real-time coupon validation
- Visual feedback for valid/invalid coupons
- Applied coupon display with remove option
- Discount calculation and display in order summary
- Automatic coupon application during order placement

---

## 🔧 Crash Fixes and Stability Improvements

### 1. Process-Level Error Handlers

**File:** `server/index.js`

Added handlers for:
- **Unhandled Promise Rejections**: Prevents server crashes from unhandled async errors
- **Uncaught Exceptions**: Logs fatal errors before graceful shutdown
- **SIGINT/SIGTERM**: Graceful shutdown handlers

```javascript
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED PROMISE REJECTION 💥');
  console.error('Error:', err);
  // Don't exit - log and continue
});

process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION 💥');
  console.error('Error:', err);
  // Exit after logging (let PM2/nodemon restart)
  setTimeout(() => process.exit(1), 1000);
});
```

### 2. Improved Error Handling in Routes

**Updated Files:**
- `server/routes/orders.js`
- `server/routes/coupons.js`
- `server/routes/admin.js` (coupon routes)

All async route handlers now use the `catchAsync` wrapper from `errorHandler.js`, which:
- Automatically catches promise rejections
- Passes errors to the global error handler middleware
- Prevents unhandled rejections from crashing the server

### 3. Stock Validation

Added stock availability validation in order creation to prevent negative stock issues.

### 4. Better Error Logging

Enhanced error logging with detailed stack traces to help identify crash causes.

---

## 📝 Code Quality Improvements

### 1. Consistent Error Handling

- All routes now use `catchAsync` wrapper
- Consistent error response format
- Proper HTTP status codes

### 2. Added Comments

- JSDoc-style comments for routes
- Inline comments for complex logic
- Model schema documentation

### 3. Code Organization

- Modular route structure
- Separation of concerns
- Reusable utility functions

### 4. Type Safety (Frontend)

- Maintained TypeScript types
- Proper error handling in API calls

---

## 🚀 Setup and Integration Instructions

### Step 1: Install Dependencies (if needed)

```bash
cd server
npm install
```

### Step 2: Create Sample Coupons (Optional)

Run the sample coupon creation script:

```bash
cd server
node utils/createSampleCoupons.js
```

This will create 5 sample coupons:
- `WELCOME10`: 10% off (min ₹1000, max ₹2000)
- `FLAT500`: ₹500 off (min ₹5000)
- `BIG20`: 20% off (min ₹10000, max ₹5000)
- `SAVE15`: 15% off (no minimum)
- `FLAT1000`: ₹1000 off (min ₹20000)

### Step 3: Start the Server

```bash
cd server
npm start
# or for development with auto-reload:
npm run server  # (requires nodemon)
```

### Step 4: Test the Feature

1. **Test Coupon Validation:**
   ```bash
   curl -X POST http://localhost:30011/api/coupons/validate \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"code": "WELCOME10", "orderAmount": 5000}'
   ```

2. **Create Coupon via Admin API:**
   ```bash
   curl -X POST http://localhost:30011/api/admin/coupons \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer ADMIN_TOKEN" \
     -d '{
       "code": "TEST50",
       "description": "Test coupon",
       "discountType": "percentage",
       "discountValue": 50,
       "minOrderValue": 1000,
       "expiryDate": "2024-12-31T23:59:59.000Z",
       "usageLimit": 100,
       "usageLimitPerUser": 1,
       "isActive": true
     }'
   ```

3. **Test in Frontend:**
   - Navigate to checkout page
   - Add items to cart
   - Enter a coupon code in the "Promo Code / Coupon" section
   - Click "Apply"
   - Verify discount is applied correctly
   - Complete order placement

---

## 📋 Sample Test Coupon Codes

After running the sample coupon script, you can use:

| Code | Discount | Min Order | Max Discount | Usage Limit |
|------|----------|-----------|--------------|-------------|
| WELCOME10 | 10% | ₹1,000 | ₹2,000 | 100 uses |
| FLAT500 | ₹500 flat | ₹5,000 | - | 50 uses |
| BIG20 | 20% | ₹10,000 | ₹5,000 | Unlimited |
| SAVE15 | 15% | No minimum | - | 200 uses |
| FLAT1000 | ₹1,000 flat | ₹20,000 | - | 25 uses |

---

## 🔍 What Changed and Why

### Backend Changes

1. **New Files:**
   - `server/models/Coupon.js`: Coupon database model
   - `server/routes/coupons.js`: User-facing coupon routes
   - `server/utils/createSampleCoupons.js`: Script to create test coupons

2. **Modified Files:**
   - `server/models/Order.js`: Added `coupon` field to store coupon information
   - `server/routes/orders.js`: Added coupon validation and application logic
   - `server/routes/admin.js`: Added coupon CRUD operations
   - `server/index.js`: Added process-level error handlers and coupon routes

### Frontend Changes

1. **Modified Files:**
   - `src/pages/CheckoutPage.tsx`: Added coupon input, validation, and display

### Key Improvements

1. **Stability:**
   - Server no longer crashes on unhandled errors
   - Better error logging for debugging
   - Graceful error handling throughout

2. **Functionality:**
   - Complete coupon system with validation
   - Admin coupon management
   - User-friendly coupon application

3. **Code Quality:**
   - Consistent error handling patterns
   - Better code organization
   - Improved documentation

---

## 🛠️ Troubleshooting

### Server Still Crashing?

1. Check logs for specific error messages
2. Ensure MongoDB connection is stable
3. Verify environment variables are set correctly
4. Check for memory leaks in long-running processes

### Coupons Not Working?

1. Verify coupon exists in database
2. Check coupon expiry date
3. Verify minimum order value is met
4. Check usage limits (total and per-user)
5. Ensure coupon is active

### Order Creation Fails with Coupon?

1. Check backend logs for validation errors
2. Verify coupon code is sent correctly in request
3. Check stock availability
4. Verify user authentication token

---

## 📚 Additional Notes

### Production Recommendations

1. **Use PM2 or similar process manager:**
   ```bash
   npm install -g pm2
   pm2 start server/index.js --name shukra-backend
   pm2 save
   pm2 startup
   ```

2. **Enable logging service** (e.g., Winston, Morgan)

3. **Set up monitoring** (e.g., Sentry for error tracking)

4. **Database indexes**: Already added for coupon code lookups

5. **Rate limiting**: Already configured for API endpoints

---

## ✅ Testing Checklist

- [x] Coupon validation works correctly
- [x] Expired coupons are rejected
- [x] Inactive coupons are rejected
- [x] Minimum order value validation works
- [x] Usage limits are enforced (total and per-user)
- [x] Percentage discounts work correctly
- [x] Flat discounts work correctly
- [x] Max discount cap works for percentage discounts
- [x] Coupon is stored in order
- [x] Admin can create/update/delete coupons
- [x] Server doesn't crash on errors
- [x] Error messages are user-friendly
- [x] Frontend UI displays coupons correctly
- [x] Order placement works with coupons

---

## 📞 Support

For issues or questions, check:
1. Server logs in console
2. Browser console for frontend errors
3. MongoDB connection status
4. API endpoint responses

---

**Last Updated:** Implementation completed with full coupon feature, crash fixes, and code quality improvements.


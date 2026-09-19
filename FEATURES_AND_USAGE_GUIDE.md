# 📖 Shukra Living - Complete Features & Usage Guide

## 📋 Table of Contents
1. [Getting Started](#getting-started)
2. [User Features](#user-features)
3. [Admin Features](#admin-features)
4. [Technical Requirements](#technical-requirements)
5. [Troubleshooting](#troubleshooting)

---

## Getting Started

### System Requirements
- **Internet Connection:** Required for MongoDB Atlas and email verification
- **Browser:** Chrome, Firefox, Safari, or Edge (latest version)
- **Screen Resolution:** 1024x768 minimum (responsive design supports all sizes)
- **RAM:** 2GB minimum
- **Storage:** 500MB free space

### First Time Setup
1. Open `http://localhost:5173` in browser
2. You'll see landing page with "GET STARTED" button
3. Click to create account or login if you have one

---

## User Features

### 1. User Authentication

#### Create Account
**Flow:** Landing Page → GET STARTED → Create Account

**Steps:**
1. Click "GET STARTED" button
2. Enter email address
3. Click "Send OTP"
4. Check email for 6-digit OTP
5. Enter OTP (valid for 5 minutes)
6. Create User ID (unique identifier)
7. Set 6-digit password
8. Account created successfully

**Example:**
- Email: `user@gmail.com`
- User ID: `user123`
- Password: `123456`

#### Login
**Flow:** Landing Page → LOGIN → Enter Credentials

**Steps:**
1. Click "LOGIN" button
2. Enter User ID: `user123`
3. Enter Password: `123456`
4. Click "Login"
5. Redirected to Dashboard

#### Forgot Password
**Flow:** Login Page → Forgot Password

**Steps:**
1. Click "Forgot Password" link
2. Enter email address
3. Receive password reset link via email
4. Click link and set new password
5. Login with new password

---

### 2. Product Browsing

#### View Products
**Location:** Dashboard (after login)

**Features:**
- Grid view of all products
- Product image with hover effect
- Product name and brand
- Price and discount (if any)
- Star rating and review count
- Stock status indicator

**Example Product:**
```
Premium Leather Sofa Set
Brand: Shukra-Livings
Price: ₹89,990
Rating: ⭐ 4.7 (15 reviews)
Stock: In Stock
```

#### Search Products
**Location:** Dashboard search bar

**How to Use:**
1. Click search bar at top
2. Type product name or category
3. Results update in real-time
4. Click product to view details

**Search Examples:**
- "Sofa" → Shows all sofas
- "Bedroom" → Shows bedroom furniture
- "Wooden" → Shows wooden items

#### Filter Products
**Location:** Dashboard

**Available Filters:**
- Category (Living, Dining, Bedroom, Office)
- Price range
- Material type
- Color
- In stock only

**Example:**
- Category: Bedroom
- Price: ₹40,000 - ₹60,000
- Material: Wood
- Shows matching products

---

### 3. Product Details

#### View Product Information
**Flow:** Dashboard → Click Product → Product Detail Page

**Information Displayed:**
- High-quality product images (gallery)
- Product name and brand
- Price and discount
- Star rating and reviews
- Detailed specifications:
  - Material (e.g., Sheesham Wood)
  - Color (e.g., Brown)
  - Dimensions
  - Warranty period
- Supplier information
- Delivery estimate
- Payment options available

**Example Specifications:**
```
Material: Sheesham Wood
Color: Brown
Dimensions: 180cm x 200cm
Warranty: 1 Year
Delivery: 7 days
Payment: COD, Card
```

#### Read Reviews
**Location:** Product Detail Page

**Features:**
- Customer ratings (1-5 stars)
- Review comments
- Helpful votes
- Reviewer name and date

---

### 4. Shopping Cart

#### Add to Cart
**Flow:** Product Page → Click "Add to Cart"

**Steps:**
1. View product details
2. Click "Add to Cart" button
3. Confirmation message appears
4. Item added to cart

**Cart Icon:**
- Shows number of items
- Updates in real-time
- Click to view cart

#### View Cart
**Flow:** Click Cart Icon → View Cart Sidebar

**Cart Shows:**
- Product image and name
- Price per item
- Quantity selector
- Total price per item
- Remove button

**Example Cart:**
```
1. Premium Leather Sofa Set
   Price: ₹89,990
   Quantity: 1
   Total: ₹89,990

2. Luxury King Bed
   Price: ₹58,990
   Quantity: 1
   Total: ₹58,990

Subtotal: ₹148,980
Delivery: FREE (above ₹50,000)
Total: ₹148,980
```

#### Update Quantity
**Location:** Cart Sidebar

**Steps:**
1. Click + or - buttons
2. Quantity updates
3. Total price recalculates
4. Delivery charge updates if needed

#### Remove from Cart
**Location:** Cart Sidebar

**Steps:**
1. Click X button on item
2. Item removed from cart
3. Total recalculates

#### Apply Discount
**Automatic:**
- Global discounts apply automatically
- Shows original price (strikethrough)
- Shows discounted price
- Shows savings amount

**Example:**
```
Original: ₹100,000
Discount: 10% OFF
Discounted: ₹90,000
You Save: ₹10,000
```

---

### 5. Checkout Process

#### Proceed to Checkout
**Flow:** Cart → Click "Proceed to Checkout"

**Steps:**
1. Review cart items
2. Click "Proceed to Checkout"
3. Redirected to checkout page

#### Select Delivery Address
**Location:** Checkout Page

**Options:**
- Use existing address
- Add new address
- Edit address

**Address Fields:**
- Street address
- City
- State
- PIN code

#### Select Payment Method
**Location:** Checkout Page

**Available Methods:**
1. **Cash on Delivery (COD)**
   - Pay when product arrives
   - No advance payment needed

2. **Card Payment**
   - Credit/Debit card
   - Secure payment gateway

#### Review Order
**Location:** Checkout Page

**Review:**
- Items and quantities
- Delivery address
- Payment method
- Subtotal
- Delivery charges
- Total amount

#### Place Order
**Steps:**
1. Review all details
2. Click "Place Order"
3. Order confirmation page
4. Confirmation email sent

**Order Confirmation Shows:**
- Order ID
- Tracking number
- Estimated delivery date
- Order details

---

### 6. Order Tracking

#### View Order History
**Flow:** Profile → Order History

**Shows:**
- All past orders
- Order date
- Order status
- Total amount
- Items ordered

#### Track Order
**Flow:** Profile → Track Order

**Steps:**
1. Enter Order ID or Tracking Number
2. Click "Track"
3. View order status

**Order Status:**
- Placed: Order received
- Confirmed: Payment confirmed
- Processing: Preparing for shipment
- Shipped: On the way
- Delivered: Received
- Cancelled: Order cancelled

**Example:**
```
Order ID: ORD-2024-001
Status: Shipped
Estimated Delivery: Jan 20, 2024
Tracking: TRACK-12345
```

---

### 7. User Profile

#### View Profile
**Flow:** Click Profile Icon → View Profile

**Profile Shows:**
- Name
- Email
- Phone number
- User ID
- Member since date
- Profile picture

#### Edit Profile
**Flow:** Profile → Edit Profile

**Can Edit:**
- First name
- Last name
- Phone number
- Profile picture

#### Manage Addresses
**Flow:** Profile → Addresses

**Features:**
- Add new address
- Edit existing address
- Delete address
- Set default address

#### Change Password
**Flow:** Profile → Change Password

**Steps:**
1. Enter current password
2. Enter new password
3. Confirm new password
4. Click "Update"

---

### 8. Wishlist

#### Add to Wishlist
**Flow:** Product Page → Click Heart Icon

**Steps:**
1. View product
2. Click heart icon
3. Added to wishlist
4. Heart icon turns red

#### View Wishlist
**Flow:** Profile → Wishlist

**Shows:**
- All saved products
- Product details
- Add to cart option
- Remove from wishlist

#### Remove from Wishlist
**Steps:**
1. Go to Wishlist
2. Click X or heart icon
3. Item removed

---

### 9. Reviews & Ratings

#### Write Review
**Flow:** Product Page → Write Review

**Steps:**
1. Click "Write Review"
2. Select rating (1-5 stars)
3. Write comment
4. Click "Submit"

**Example Review:**
```
Rating: ⭐⭐⭐⭐⭐ (5 stars)
Comment: "Excellent quality! Delivery was fast and product is exactly as described."
```

#### View Reviews
**Location:** Product Page

**Shows:**
- All customer reviews
- Ratings
- Comments
- Reviewer name
- Review date

---

## Admin Features

### Admin Login

**Access:** `http://localhost:5173/admin/login`

**Credentials:**
- Username: `admin123`
- Password: `admin@2024`

---

### 1. Admin Dashboard

#### Overview
**Shows:**
- Total products
- Total orders
- Pending orders count
- Revenue today
- Low stock items

#### Quick Actions
- Manage Products
- Manage Orders
- View Settings
- View Analytics

---

### 2. Product Management

#### Add Product
**Flow:** Admin Dashboard → Manage Products → Add New

**Fields:**
- Product name
- Description
- Price
- Category
- Images (upload multiple)
- Specifications (material, color, etc.)
- Stock quantity
- Supplier info
- Warranty period

**Example:**
```
Name: Premium Leather Sofa
Price: ₹89,990
Category: Living
Stock: 8
Material: Genuine Leather
Warranty: 2 Years
```

#### Edit Product
**Steps:**
1. Go to Products
2. Click Edit on product
3. Update details
4. Click Save

#### Delete Product
**Steps:**
1. Go to Products
2. Click Delete on product
3. Confirm deletion

#### View Product List
**Shows:**
- All products
- Stock levels
- Price
- Status (Active/Inactive)
- Edit/Delete options

---

### 3. Order Management

#### View Orders
**Flow:** Admin Dashboard → Manage Orders

**Shows:**
- Order ID
- Customer name
- Order date
- Total amount
- Order status
- Payment status

#### Update Order Status
**Steps:**
1. Click on order
2. Select new status
3. Click Update
4. Customer notified

**Status Options:**
- Placed
- Confirmed
- Processing
- Shipped
- Delivered
- Cancelled

#### View Order Details
**Shows:**
- Customer info
- Delivery address
- Items ordered
- Payment method
- Order timeline

---

### 4. Analytics Dashboard

#### Business Health Score
**Shows:** 0-100% indicator
- Based on revenue, orders, customers
- Color-coded (red/yellow/green)

#### Financial Overview
**Shows:**
- Total revenue (all-time)
- Total orders
- Average order value
- Total customers
- Active products

#### Sales Analysis
**Shows:**
- Best-selling products
- Worst-selling products
- Total quantity sold
- Revenue per product

#### Customer Insights
**Shows:**
- Total customers
- New customers (30 days)
- Returning customers
- Retention rate
- Customer lifetime value

#### Growth Metrics
**Shows:**
- Current month revenue
- Previous month revenue
- Growth rate (%)
- Order trends

#### Inventory Status
**Shows:**
- Total products
- Low stock items
- Optimal stock items
- Over stock items
- Total inventory value

#### Charts & Graphs
**Available:**
- Order status distribution (pie chart)
- Payment status (bar chart)
- Inventory status (pie chart)
- Top 5 selling products (bar chart)
- Revenue trends (line chart)
- Category performance (table)

#### Low Stock Alerts
**Shows:**
- Products with stock < 5
- Stock quantity
- Category
- Action to reorder

---

### 5. Settings Management

#### Global Discount
**Options:**
- Discount percentage (e.g., 10%)
- Discount amount (e.g., ₹1000)
- Apply to all products

**Example:**
```
Discount Type: Percentage
Discount Value: 10%
All products get 10% off
```

#### Delivery Configuration
**Options:**
- Free delivery threshold (e.g., ₹50,000)
- Delivery charge (e.g., ₹500)

**Example:**
```
Free Delivery Above: ₹50,000
Delivery Charge: ₹500
Orders below ₹50,000 pay ₹500
```

---

## Technical Requirements

### Network Requirements
- **Internet Speed:** 2 Mbps minimum
- **Connection Type:** WiFi or Ethernet
- **Latency:** < 100ms for optimal experience

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Device Support
- Desktop (1024x768+)
- Tablet (768x1024+)
- Mobile (320x568+)

### Performance
- Page load time: < 3 seconds
- API response time: < 1 second
- Smooth animations and transitions

---

## Troubleshooting

### Can't Login
**Problem:** Invalid credentials

**Solution:**
1. Check User ID and password
2. Verify caps lock is off
3. Try "Forgot Password"
4. Create new account if needed

### Products Not Loading
**Problem:** Blank product list

**Solution:**
1. Check internet connection
2. Refresh page (F5)
3. Clear browser cache
4. Restart backend server

### Cart Not Updating
**Problem:** Items not adding to cart

**Solution:**
1. Refresh page
2. Clear browser cache
3. Check if logged in
4. Try different browser

### Email Not Received
**Problem:** OTP or confirmation email missing

**Solution:**
1. Check spam folder
2. Verify email address
3. Wait 5 minutes
4. Request new OTP

### Payment Issues
**Problem:** Payment not processing

**Solution:**
1. Check internet connection
2. Verify card details
3. Try different payment method
4. Contact support

### Slow Performance
**Problem:** Website loading slowly

**Solution:**
1. Check internet speed
2. Close other applications
3. Clear browser cache
4. Restart browser

---

## Best Practices

### For Users
1. Keep password secure and unique
2. Verify address before checkout
3. Save order confirmation
4. Track orders regularly
5. Leave reviews for products

### For Admins
1. Update inventory regularly
2. Monitor low stock alerts
3. Process orders promptly
4. Review analytics weekly
5. Adjust discounts strategically

---

## Support & Help

### Common Questions

**Q: How long does delivery take?**
A: 7-14 days depending on product and location

**Q: Can I cancel an order?**
A: Yes, if order is not yet shipped

**Q: What's the return policy?**
A: 30 days return with original packaging

**Q: How do I track my order?**
A: Use Order ID in "Track Order" section

**Q: Is payment secure?**
A: Yes, encrypted and PCI compliant

---

## Feature Examples

### Example 1: Complete Purchase Flow
```
1. Browse products on dashboard
2. Search for "Sofa"
3. Click on "Premium Leather Sofa Set"
4. View details and reviews
5. Click "Add to Cart"
6. Click cart icon
7. Click "Proceed to Checkout"
8. Select delivery address
9. Choose "Cash on Delivery"
10. Review order
11. Click "Place Order"
12. Receive confirmation
13. Track order using tracking number
```

### Example 2: Admin Analytics Review
```
1. Login as admin
2. Go to Analytics
3. View Business Health Score
4. Check revenue trends
5. Review top-selling products
6. Check low stock alerts
7. Adjust discount if needed
8. Update delivery settings
```

### Example 3: Product Management
```
1. Login as admin
2. Go to Manage Products
3. Click "Add New Product"
4. Fill product details
5. Upload images
6. Set price and stock
7. Click "Save"
8. Product appears on dashboard
9. Users can now purchase
```

---

**Shukra Living - Complete Feature Guide** ✅

All features are ready to use. Enjoy shopping or managing your store!

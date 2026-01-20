# 🚀 Shukra Living - Complete Setup & Installation Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [MongoDB Setup](#mongodb-setup)
3. [Environment Configuration](#environment-configuration)
4. [Installation Steps](#installation-steps)
5. [Running the Application](#running-the-application)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:
- **Node.js** v16 or higher - Download from [nodejs.org](https://nodejs.org)
- **npm** (comes with Node.js)
- **Git** (optional) - Download from [git-scm.com](https://git-scm.com)
- **MongoDB** (either Atlas or Compass)
- **Gmail Account** (for email verification)

### Verify Installation
```bash
node --version    # Should show v16+
npm --version     # Should show v8+
```

---

## MongoDB Setup

### Option 1: MongoDB Atlas (Cloud - Recommended)

**Step 1: Create MongoDB Atlas Account**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Sign Up"
3. Create account with email and password
4. Verify email

**Step 2: Create a Cluster**
1. Click "Create" button
2. Select "M0 Free" tier (free forever)
3. Choose cloud provider (AWS recommended)
4. Choose region closest to you
5. Click "Create Cluster"
6. Wait 5-10 minutes for cluster to be ready

**Step 3: Create Database User**
1. Go to "Database Access" in left menu
2. Click "Add New Database User"
3. Enter username: `shukra_user`
4. Enter password: `ShukraLiving@2024` (or your choice)
5. Click "Add User"

**Step 4: Get Connection String**
1. Go to "Clusters" in left menu
2. Click "Connect" button
3. Select "Connect your application"
4. Copy the connection string
5. Replace `<username>` and `<password>` with your credentials
6. Replace `<database-name>` with `shukra_living`

**Example Connection String:**
```
mongodb+srv://shukra_user:ShukraLiving@2024@shukra-cluster.mongodb.net/shukra_living?retryWrites=true&w=majority
```

### Option 2: MongoDB Compass (Local)

**Step 1: Download MongoDB**
1. Go to [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Select your operating system
3. Download and install
4. Follow installation wizard

**Step 2: Download MongoDB Compass**
1. Go to [mongodb.com/products/compass](https://www.mongodb.com/products/compass)
2. Download for your OS
3. Install and open

**Step 3: Connect to Local MongoDB**
1. Open MongoDB Compass
2. Connection string: `mongodb://localhost:27017`
3. Click "Connect"

**Step 4: Create Database**
1. Click "Create Database"
2. Database name: `shukra_living`
3. Collection name: `products`
4. Click "Create Database"

---

## Environment Configuration

### Step 1: Locate .env File
```
d:\Shukra_livings_webApp\shukra-living\.env
```

### Step 2: Configure MongoDB URI

**For Atlas:**
```env
MONGODB_URI=mongodb+srv://shukra_user:ShukraLiving@2024@shukra-cluster.mongodb.net/shukra_living?retryWrites=true&w=majority
```

**For Local Compass:**
```env
MONGODB_URI=mongodb://localhost:27017/shukra_living
```

### Step 3: Configure Email (Gmail)

**Get Gmail App Password:**
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click "Security" in left menu
3. Enable "2-Step Verification" (if not enabled)
4. Go to "App passwords"
5. Select "Mail" and "Windows Computer"
6. Copy the generated 16-character password

**Update .env:**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=Shukra Living <your-email@gmail.com>
```

### Step 4: Configure JWT Secret

Generate a random string at [random.org/strings](https://www.random.org/strings/)

**Update .env:**
```env
JWT_SECRET=your_generated_random_string_minimum_32_characters
```

### Step 5: Other Configuration

```env
PORT=30011                          # Backend port
NODE_ENV=development                # Environment
FRONTEND_URL=http://localhost:5173  # Frontend URL
ADMIN_ID=admin123                   # Admin username
ADMIN_PASSWORD=admin@2024           # Admin password
```

### Complete .env Example
```env
MONGODB_URI=mongodb+srv://shukra_user:ShukraLiving@2024@shukra-cluster.mongodb.net/shukra_living?retryWrites=true&w=majority
JWT_SECRET=aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=Shukra Living <your-email@gmail.com>
PORT=30011
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ADMIN_ID=admin123
ADMIN_PASSWORD=admin@2024
```

---

## Installation Steps

### Step 1: Navigate to Project Directory
```bash
cd d:\Shukra_livings_webApp\shukra-living
```

### Step 2: Install Dependencies
```bash
npm install
```
This installs all required packages (React, Express, MongoDB, etc.)
**Time:** 2-5 minutes depending on internet speed

### Step 3: Install Backend Dependencies
```bash
cd server
npm install
cd ..
```

### Step 4: Verify Installation
```bash
npm list
```
Should show all installed packages without errors

---

## Running the Application

### Terminal 1: Start Backend Server

**Navigate to server directory:**
```bash
cd d:\Shukra_livings_webApp\shukra-living\server
```

**Start backend:**
```bash
npm start
```

**Expected output:**
```
✅ MongoDB Atlas Connected Successfully
✅ Database ping successful
✅ Data restoration complete
🚀 Server running on http://localhost:30011
```

**Backend is ready when you see:** `Server running on http://localhost:30011`

### Terminal 2: Start Frontend Server

**Open new terminal and navigate to project root:**
```bash
cd d:\Shukra_livings_webApp\shukra-living
```

**Start frontend:**
```bash
npm run dev
```

**Expected output:**
```
VITE v5.4.21 ready in 529 ms
➜ Local: http://localhost:5173/
```

**Frontend is ready when you see:** `Local: http://localhost:5173/`

### Step 3: Access Application

Open browser and go to:
```
http://localhost:5173
```

---

## Accessing the Application

### User Login
1. Click "GET STARTED" on landing page
2. Create account with email
3. Verify OTP sent to email
4. Set User ID and Password
5. Login with credentials

### Admin Login
1. Go to `http://localhost:5173/admin/login`
2. Username: `admin123`
3. Password: `admin@2024`
4. Click "Login"

---

## Troubleshooting

### MongoDB Connection Error
**Problem:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
- For Atlas: Check internet connection and MongoDB URI
- For Compass: Ensure MongoDB is running locally
- Verify credentials in .env file

### Port Already in Use
**Problem:** `Error: listen EADDRINUSE: address already in use :::30011`

**Solution:**
```bash
# Find process using port
netstat -ano | findstr :30011

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Email Not Sending
**Problem:** Email verification not working

**Solution:**
1. Verify Gmail app password is correct
2. Enable "Less secure app access" if needed
3. Check EMAIL_USER and EMAIL_PASS in .env

### Frontend Not Loading
**Problem:** Blank page or errors

**Solution:**
1. Check browser console (F12)
2. Verify backend is running
3. Clear browser cache (Ctrl+Shift+Delete)
4. Hard refresh (Ctrl+Shift+R)

### Dependencies Installation Failed
**Problem:** `npm ERR! code ERESOLVE`

**Solution:**
```bash
npm install --legacy-peer-deps
```

---

## Verification Checklist

- [ ] Node.js v16+ installed
- [ ] MongoDB configured (Atlas or Compass)
- [ ] .env file updated with correct values
- [ ] Dependencies installed (`npm install`)
- [ ] Backend running on port 30011
- [ ] Frontend running on port 5173
- [ ] Can access http://localhost:5173
- [ ] Can login with admin credentials
- [ ] Email verification working

---

## Next Steps

1. Read **FEATURES_AND_USAGE_GUIDE.md** for complete feature documentation
2. Create test account and explore features
3. Test admin panel and analytics
4. Review sample data and products

---

## Support

If you encounter issues:
1. Check this guide's Troubleshooting section
2. Verify all .env values are correct
3. Ensure both backend and frontend are running
4. Check browser console for errors (F12)
5. Check server console for error messages

---

**Setup Complete!** 🎉

Your Shukra Living application is now ready to use locally.

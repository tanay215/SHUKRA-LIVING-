# 🏠 Shukra Living - Premium Furniture E-commerce Platform

## ✅ Status: Production Ready

A complete, feature-rich MERN stack e-commerce platform for furniture and home décor.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install root/frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Start Backend
```bash
cd server
npm start
```

### 3. Start Frontend (New Terminal)
```bash
npm run dev
```

### 4. Access
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:30011
- **Analytics:** Admin Dashboard → "📊 Analytics"

---

## 📚 Documentation

**Start here:** [INDEX.md](./INDEX.md) - Complete documentation index

### Quick Links
- [START_HERE.md](./START_HERE.md) - 2-minute quick start
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues & solutions
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Deployment guide
- [ARCHITECTURE_IMPROVEMENTS.md](./ARCHITECTURE_IMPROVEMENTS.md) - System design

---

## ✨ Key Features

### User Features
✅ User authentication & registration
✅ Product browsing & search
✅ Shopping cart & checkout
✅ Order tracking
✅ User profiles
✅ Wishlist
✅ Product reviews

### Admin Features
✅ Advanced analytics dashboard
✅ Product management
✅ Order management
✅ Settings management
✅ Business health score
✅ Revenue analytics
✅ Customer insights

### Technical Features
✅ Automatic data recovery
✅ Products never disappear
✅ Error handling & retry
✅ Rate limiting
✅ Input validation
✅ JWT authentication
✅ CORS protection

---

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- Vite
- Recharts (Analytics)
- Lucide React (Icons)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Nodemailer

### Database
- MongoDB Atlas
- Collections: Users, Products, Orders, Reviews, Wishlist, Settings

---

## 📊 Permanent Products

Always available:
1. **Luxury King Size Wooden Bed** - ₹58,990
2. **Premium Leather Sofa Set** - ₹89,990
3. **Elegant Dining Table Set** - ₹45,990

---

## 🔗 API Endpoints

### Analytics (Admin Only)
```
GET /api/analytics/comprehensive
GET /api/analytics/financial
GET /api/analytics/sales
GET /api/analytics/category
GET /api/analytics/customers
GET /api/analytics/growth
GET /api/analytics/inventory
GET /api/analytics/orders
GET /api/analytics/health-score
```

### Products (Public)
```
GET /api/products
GET /api/products/:id
POST /api/emergency-restore
GET /api/health
```

---

## 🧪 Testing

### Test Analytics
1. Login as admin
2. Go to Admin Dashboard
3. Click "📊 Analytics" button
4. View comprehensive analytics

### Test Product Persistence
1. Go to Dashboard
2. Refresh page (F5)
3. Products should still be visible

### Manual Restore
```bash
curl -X POST http://localhost:30011/api/emergency-restore
```

---

## 🐛 Troubleshooting

### Products Not Showing?
```bash
curl -X POST http://localhost:30011/api/emergency-restore
```

### Analytics Blank?
- Check browser console (F12)
- Verify admin token is valid
- Restart backend server

### Port Already in Use?
```bash
# Windows
netstat -ano | findstr :30011
taskkill /PID <PID> /F
```

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more solutions.

---

## 📁 Project Structure

```
shukra-living/
├── public/                 [Static Assets]
├── server/                 [Backend]
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── index.js
├── src/                    [Frontend]
│   ├── components/
│   ├── pages/
│   ├── router/
│   ├── services/
│   ├── utils/
│   └── App.tsx
├── .env                    [Environment Variables]
├── package.json            [Dependencies]
└── [Config Files]
```

---

## 🚀 Deployment

### Prerequisites
- Node.js v16+
- MongoDB Atlas account
- Environment variables configured

### Steps
1. Install dependencies: `npm install`
2. Configure .env file
3. Start backend: `cd server && npm start`
4. Start frontend: `npm run dev`
5. Test all features
6. Deploy to production

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for detailed steps.

---

## 📈 Recent Improvements

✅ **Analytics Dashboard** - Advanced business analytics
✅ **Products Persistence** - Never disappear with auto-recovery
✅ **Error Handling** - Retry mechanisms for reliability
✅ **Security** - Enhanced with rate limiting & validation
✅ **Performance** - Optimized queries & caching
✅ **Documentation** - Comprehensive guides

---

## 🎯 Environment Variables

Create `.env` file in root:
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
PORT=30011
FRONTEND_URL=http://localhost:5173
ADMIN_ID=admin123
ADMIN_PASSWORD=admin@2024
```

---

## 📞 Support

### Quick Fixes
- Restart servers
- Clear browser cache
- Manual restore products
- Check server logs

### Detailed Help
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Check server console
- Check browser console (F12)
- Verify configuration

---

## 📝 Documentation Files

| File | Purpose |
|------|---------|
| [INDEX.md](./INDEX.md) | Documentation index |
| [START_HERE.md](./START_HERE.md) | Quick start |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Issues & fixes |
| [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) | Deploy guide |
| [ARCHITECTURE_IMPROVEMENTS.md](./ARCHITECTURE_IMPROVEMENTS.md) | System design |
| [FINAL_SUMMARY.md](./FINAL_SUMMARY.md) | Complete overview |

---

## ✅ Checklist

- [x] All features implemented
- [x] All tests passed
- [x] Documentation complete
- [x] Security verified
- [x] Performance optimized
- [x] Ready for production

---

## 🏆 Status

**Development:** ✅ Complete
**Testing:** ✅ Complete
**Documentation:** ✅ Complete
**Production:** ✅ Ready

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🎉 Ready to Go!

Everything is set up and ready for production. Start with [START_HERE.md](./START_HERE.md) or [INDEX.md](./INDEX.md) for documentation navigation.

**Questions?** Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
**Ready to deploy?** Follow [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

---

**Version:** 2.0 (With Analytics & Improvements)
**Last Updated:** 2024
**Status:** ✅ Production Ready

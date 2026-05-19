# 🎬 OTT Platform - Complete Setup Guide

A professional Netflix-style OTT platform with modern admin panel for managing drama series.

## ✨ Features

### User Features
- 🎬 Netflix-style UI with smooth animations
- 📺 Browse series by categories
- 🔐 User authentication & profiles
- 📝 Watchlist management
- 📊 Watch history tracking
- 🎥 HD video streaming

### Admin Features
- 📊 Modern dashboard with statistics
- 📺 Series management with grid view
- 🎬 Episode upload with Cloudinary
- 🔍 Search and filter functionality
- 📁 Category management
- 👥 User management
- 📈 Analytics (coming soon)

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- Cloudinary account (free tier)

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Setup Environment Variables

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ott-platform
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
CLIENT_URL=http://localhost:3000

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

NODE_ENV=development
```

### 3. Get Cloudinary Credentials

1. Sign up at https://cloudinary.com (FREE)
2. Go to Dashboard
3. Copy:
   - Cloud Name
   - API Key
   - API Secret
4. Paste into `backend/.env`

### 4. Setup MongoDB

**Option A: Local MongoDB**
- Install from https://www.mongodb.com/try/download/community
- MongoDB will run on `mongodb://localhost:27017`

**Option B: MongoDB Atlas (Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create free cluster (M0)
4. Get connection string
5. Update `MONGODB_URI` in `.env`

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server runs on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
App opens at http://localhost:3000

## 👤 Create Admin User

### Method 1: Register & Update in MongoDB

1. Register a user through the UI
2. Open MongoDB Compass or CLI
3. Find user in `users` collection
4. Change `role` from `"user"` to `"admin"`

### Method 2: MongoDB CLI
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## 📖 Usage Guide

### For Users:
1. **Register/Login** - Create account or sign in
2. **Browse** - Explore series by categories
3. **Watch** - Click series → Select episode → Watch
4. **Watchlist** - Add series to your watchlist

### For Admins:
1. **Login** with admin account
2. **Dashboard** - View statistics
3. **Add Series**:
   - Click "ADD SERIES"
   - Fill in details
   - Upload thumbnail & banner
   - Select categories
   - Click "Create Series"
4. **Add Episodes**:
   - Click "ADD EPISODE"
   - Select series
   - Upload thumbnail & video
   - Video uploads to Cloudinary (may take time)
5. **Manage Content**:
   - Search series
   - Filter by status
   - Publish/Unpublish
   - Delete content

## 🎨 UI Features

### Admin Panel
- **Modern Dark Theme** - Professional gradient backgrounds
- **Sidebar Navigation** - Easy access to all features
- **Grid View** - Visual series management
- **Search & Filter** - Quick content discovery
- **Upload Progress** - Real-time upload tracking
- **Status Badges** - Visual content status

### User Interface
- **Netflix-style Design** - Familiar and intuitive
- **Smooth Animations** - Professional transitions
- **Responsive** - Works on all devices
- **Video Player** - React Player with controls

## 🛠️ Tech Stack

**Frontend:**
- React 18
- React Router v6
- Axios
- React Player
- CSS3 with modern features

**Backend:**
- Node.js & Express
- MongoDB & Mongoose
- JWT Authentication
- Cloudinary SDK
- Multer for uploads

## 📁 Project Structure

```
ott-platform/
├── backend/
│   ├── config/          # Cloudinary config
│   ├── middleware/      # Auth middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── scripts/         # Utility scripts
│   └── server.js        # Entry point
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/  # Reusable components
│       ├── context/     # React context
│       ├── pages/       # Page components
│       │   └── admin/   # Admin pages
│       └── App.js
└── README.md
```

## 🔧 Troubleshooting

### MongoDB Connection Error
- **Local**: Ensure MongoDB service is running
- **Atlas**: Check connection string and network access

### Cloudinary Upload Fails
- Verify credentials in `.env`
- Check file size (free tier: 10MB limit per file)
- Ensure stable internet connection

### Frontend Won't Start
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Backend Won't Start
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📊 Database Management

### Clear All Content
```bash
cd backend
node scripts/clearDatabase.js
```

### Backup Database
```bash
mongodump --db ott-platform --out ./backup
```

### Restore Database
```bash
mongorestore --db ott-platform ./backup/ott-platform
```

## 🚀 Deployment

### Backend (Railway/Heroku)
1. Push code to GitHub
2. Connect to Railway/Heroku
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `build` folder
3. Set API URL environment variable

### Database (MongoDB Atlas)
- Already cloud-hosted
- Update connection string in production

## 📝 API Endpoints

### Public
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/series` - Get all series
- `GET /api/series/:id` - Get series details
- `GET /api/categories/:category` - Get by category

### Protected (User)
- `GET /api/auth/me` - Get current user
- `GET /api/users/watchlist` - Get watchlist
- `POST /api/users/watchlist/:id` - Add to watchlist
- `GET /api/users/history` - Get watch history

### Protected (Admin)
- `GET /api/admin/series` - Get all series
- `POST /api/admin/series` - Create series
- `PUT /api/admin/series/:id` - Update series
- `DELETE /api/admin/series/:id` - Delete series
- `POST /api/admin/episodes` - Create episode
- `PATCH /api/admin/series/:id/publish` - Toggle publish

## 🎯 Future Enhancements

- [ ] Payment gateway integration
- [ ] Multiple subscription tiers
- [ ] Advanced analytics
- [ ] Email notifications
- [ ] Social sharing
- [ ] Subtitle support
- [ ] Multiple video qualities
- [ ] Download for offline viewing
- [ ] Recommendations engine
- [ ] Live streaming support

## 📄 License

MIT License - Feel free to use for personal or commercial projects

## 🤝 Support

For issues or questions:
1. Check this guide
2. Review error messages
3. Check MongoDB/Cloudinary status
4. Verify environment variables

---

**Happy Streaming! 🎬**

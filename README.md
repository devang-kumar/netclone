# OTT Platform - MERN Stack

A Netflix-style OTT platform for short drama series built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and Cloudinary for video storage.

## Features

### User Features
- 🎬 Browse series by categories (Top Picks, Recommended, New Releases, Upcoming)
- 🔐 User authentication (Register/Login)
- 📺 Watch episodes with video player
- 📝 Add series to watchlist
- 📊 Track watch history
- 🎯 Series detail pages with episode listings
- 📱 Responsive Netflix-style UI

### Admin Features
- 📊 Admin dashboard with statistics
- ➕ Create and manage series
- 🎥 Upload and manage episodes
- 🖼️ Upload thumbnails and banners
- ✅ Publish/unpublish content
- 🗑️ Delete series and episodes
- ☁️ Cloudinary integration for video storage

## Tech Stack

**Frontend:**
- React.js
- React Router DOM
- Axios
- React Player (for video playback)
- CSS3

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt.js
- Cloudinary (video & image storage)
- Multer (file uploads)

## Project Structure

```
ott-platform/
├── backend/
│   ├── config/
│   │   └── cloudinary.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Series.js
│   │   └── Episode.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── series.js
│   │   ├── episodes.js
│   │   ├── categories.js
│   │   └── admin.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── SeriesCard.js
│   │   │   ├── SeriesRow.js
│   │   │   ├── PrivateRoute.js
│   │   │   └── AdminRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── SeriesDetail.js
│   │   │   ├── VideoPlayer.js
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.js
│   │   │       ├── AdminSeries.js
│   │   │       └── AdminEpisodes.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account

### 1. Clone the repository
```bash
git clone <repository-url>
cd ott-platform
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ott-platform
JWT_SECRET=your_jwt_secret_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Get Cloudinary Credentials

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy your Cloud Name, API Key, and API Secret
4. Add them to your `.env` file

### 5. Run the Application

**Start Backend (from backend directory):**
```bash
npm run dev
```
Backend will run on `http://localhost:5000`

**Start Frontend (from frontend directory):**
```bash
npm start
```
Frontend will run on `http://localhost:3000`

## Creating an Admin User

Since this is a prototype without a payment gateway, you'll need to manually create an admin user in MongoDB:

1. Register a normal user through the UI
2. Open MongoDB (Compass or CLI)
3. Find the user in the `users` collection
4. Change the `role` field from `"user"` to `"admin"`

Or use MongoDB CLI:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## Usage

### For Users:
1. Register/Login
2. Browse series by categories
3. Click on a series to view details
4. Click on an episode to watch
5. Add series to watchlist

### For Admins:
1. Login with admin account
2. Access Admin Dashboard from navbar
3. Create series with thumbnails and banners
4. Upload episodes with videos (via Cloudinary)
5. Publish/unpublish content
6. Manage all content

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Series
- `GET /api/series` - Get all published series
- `GET /api/series/:id` - Get single series with episodes

### Episodes
- `GET /api/episodes/:id` - Get single episode
- `GET /api/episodes/series/:seriesId` - Get all episodes for a series

### Categories
- `GET /api/categories/top-picks` - Get top picks
- `GET /api/categories/recommended` - Get recommended
- `GET /api/categories/new-releases` - Get new releases
- `GET /api/categories/upcoming` - Get upcoming

### Admin (Protected)
- `POST /api/admin/series` - Create series
- `PUT /api/admin/series/:id` - Update series
- `DELETE /api/admin/series/:id` - Delete series
- `POST /api/admin/episodes` - Create episode
- `PUT /api/admin/episodes/:id` - Update episode
- `DELETE /api/admin/episodes/:id` - Delete episode
- `PATCH /api/admin/series/:id/publish` - Toggle publish status
- `PATCH /api/admin/episodes/:id/publish` - Toggle publish status

## Deployment

### Backend Deployment (Heroku/Railway/DigitalOcean)
1. Set environment variables
2. Deploy backend code
3. Ensure MongoDB connection string is correct

### Frontend Deployment (Vercel/Netlify)
1. Build the React app: `npm run build`
2. Deploy the build folder
3. Set environment variable for API URL

### Database (MongoDB Atlas)
1. Create a cluster on MongoDB Atlas
2. Get connection string
3. Update `MONGODB_URI` in backend `.env`

## Future Enhancements

- Payment gateway integration (Stripe/Razorpay)
- Multiple subscription tiers
- User profiles with avatars
- Continue watching feature
- Search functionality
- Video quality selection
- Subtitles support
- Social sharing
- Email notifications
- Analytics dashboard

## License

MIT

## Support

For issues and questions, please open an issue in the repository.

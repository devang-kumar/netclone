import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Subscription from './pages/Subscription';
import SeriesDetail from './pages/SeriesDetail';
import VideoPlayer from './pages/VideoPlayer';
import MyList from './pages/MyList';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSeries from './pages/admin/AdminSeries';
import AdminEpisodes from './pages/admin/AdminEpisodes';
import AdminCategories from './pages/admin/AdminCategories';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import './App.css';

const AppLayout = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isPlayerPage = location.pathname.startsWith('/watch');
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className={`App ${isPlayerPage ? 'App--player' : ''}`}>
      {!isAuthPage && !isPlayerPage && !isAdminPage && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/series/:id" element={<SeriesDetail />} />
          <Route
            path="/my-list"
            element={
              <PrivateRoute>
                <MyList />
              </PrivateRoute>
            }
          />
          <Route
            path="/watch/:episodeId"
            element={
              <PrivateRoute>
                <VideoPlayer />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminRoute>
                <AdminCategories />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/series"
            element={
              <AdminRoute>
                <AdminSeries />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/episodes"
            element={
              <AdminRoute>
                <AdminEpisodes />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
      {!isAuthPage && !isPlayerPage && !isAdminPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;

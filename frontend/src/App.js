import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SeriesDetail from './pages/SeriesDetail';
import VideoPlayer from './pages/VideoPlayer';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSeries from './pages/admin/AdminSeries';
import AdminEpisodes from './pages/admin/AdminEpisodes';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/series/:id" element={<SeriesDetail />} />
            <Route 
              path="/watch/:episodeId" 
              element={
                <PrivateRoute>
                  <VideoPlayer />
                </PrivateRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
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
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

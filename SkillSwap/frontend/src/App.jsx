import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Landing from './pages/Landing.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Matches from './pages/Matches.jsx';
import ProfileView from './pages/ProfileView.jsx';
import ProfileEdit from './pages/ProfileEdit.jsx';
import SwapRequests from './pages/SwapRequests.jsx';
import Chat from './pages/Chat.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/matches"
        element={
          <ProtectedRoute>
            <Matches />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <ProtectedRoute>
            <ProfileView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile-edit"
        element={
          <ProtectedRoute>
            <ProfileEdit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/swap-requests"
        element={
          <ProtectedRoute>
            <SwapRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:swapId"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<div style={{ padding: 60, textAlign: 'center', color: 'var(--forest-soft)' }}>Page not found</div>} />
    </Routes>
  );
}

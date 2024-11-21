import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import PasswordReset from './pages/PasswordReset';
import AccountActivation from './components/AccountActivation';
import HomePage from './pages/HomePage';

const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/Profile" element={<Profile />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="/activate/:uidb64/:token/:userId" element={<AccountActivation />} />
      <Route path="/reset-password/:uidb64/:token" element={<ResetPasswordConfirm />} />

      {/* Redirect any other path to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </Router>
);

export default AppRouter;

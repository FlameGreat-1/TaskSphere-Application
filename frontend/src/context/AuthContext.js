import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchProfile, logoutUser, updateProfile, authenticateGoogle } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState(false);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const response = await fetchProfile();
        setUser(response.data);
        setIsAuthenticated(true);
        await checkGoogleAuthStatus();
      } catch (error) {
        console.error('Error fetching profile:', error);
        localStorage.removeItem('authToken');
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkGoogleAuthStatus = async () => {
    try {
      const response = await authenticateGoogle();
      setIsGoogleAuthenticated(response.data.is_authenticated);
    } catch (error) {
      console.error('Error checking Google authentication status:', error);
      setIsGoogleAuthenticated(false);
    }
  };

  const login = async (userData) => {
    setUser(userData.user);
    setIsAuthenticated(true);
    localStorage.setItem('authToken', userData.token);
    console.log('User authenticated:', userData.user);
    await checkGoogleAuthStatus();
  };
  
  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
      setIsAuthenticated(false);
      setIsGoogleAuthenticated(false);
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      const response = await updateProfile(profileData);
      setUser(response.data);
      return response;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const refreshUserProfile = async () => {
    try {
      const response = await fetchProfile();
      setUser(response.data);
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('authToken');
    }
  };

  const authenticateWithGoogle = async () => {
    try {
      const response = await authenticateGoogle();
      setIsGoogleAuthenticated(response.data.is_authenticated);
      if (response.data.is_authenticated) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        localStorage.setItem('authToken', response.data.token);
      }
    } catch (error) {
      console.error('Error authenticating with Google:', error);
      setIsGoogleAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        setIsAuthenticated, 
        user, 
        setUser, 
        login, 
        logout, 
        loading,
        updateUserProfile,
        refreshUserProfile,
        isGoogleAuthenticated,
        authenticateWithGoogle,
        checkAuthStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchUnreadNotificationsCount } from '../services/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleNotifications = () => setShowNotifications(!showNotifications);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await fetchUnreadNotificationsCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread notifications count:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  const updateUnreadCount = (count) => {
    setUnreadCount(count);
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        showNotifications, 
        toggleNotifications, 
        unreadCount, 
        updateUnreadCount 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

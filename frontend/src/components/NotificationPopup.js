import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNotification } from '../context/NotificationContext';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';

const PopupContainer = styled.div`
  position: fixed;
  top: 60px;
  right: 20px;
  width: 300px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const NotificationList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const NotificationItem = styled.div`
  padding: 10px;
  border-bottom: 1px solid #eee;
`;

const NotificationContent = styled.div`
  margin-bottom: 5px;
`;

const NotificationTitle = styled.h4`
  margin: 0;
  font-size: 1rem;
`;

const NotificationMessage = styled.p`
  margin: 5px 0 0;
  font-size: 0.9rem;
  color: #666;
`;

const MarkAsReadButton = styled.button`
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  font-size: 0.8rem;
`;

const MarkAllAsReadButton = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #3498db;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
`;

const NoNotifications = styled.p`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const NotificationPopup = () => {
  const { showNotifications, toggleNotifications, updateUnreadCount } = useNotification();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications()
        .then(data => {
          if (data && Array.isArray(data)) {
            setNotifications(data);
            updateUnreadCount(data.length);
          } else if (data && typeof data === 'object' && Array.isArray(data.results)) {
            setNotifications(data.results);
            updateUnreadCount(data.results.length);
          } else {
            console.error('Fetched notifications is not in the expected format:', data);
            setNotifications([]);
            updateUnreadCount(0);
          }
        })
        .catch(error => {
          console.error('Error fetching notifications:', error);
          setNotifications([]);
          updateUnreadCount(0);
        });
    }
  }, [showNotifications, updateUnreadCount]);
  

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prevNotifications => {
        const updatedNotifications = prevNotifications.filter(n => n.id !== id);
        updateUnreadCount(updatedNotifications.length);
        return updatedNotifications;
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications([]);
      updateUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  if (!showNotifications) return null;

  return (
    <PopupContainer>
      <PopupHeader>
        <h3>Notifications</h3>
        <CloseButton onClick={toggleNotifications}>&times;</CloseButton>
      </PopupHeader>
      <NotificationList>
        {notifications.length === 0 ? (
          <NoNotifications>No new notifications</NoNotifications>
        ) : (
          notifications.map(notification => (
            <NotificationItem key={notification.id}>
              <NotificationContent>
                <NotificationTitle>{notification.title}</NotificationTitle>
                <NotificationMessage>{notification.message}</NotificationMessage>
              </NotificationContent>
              <MarkAsReadButton onClick={() => handleMarkAsRead(notification.id)}>
                Mark as read
              </MarkAsReadButton>
            </NotificationItem>
          ))
        )}
      </NotificationList>
      {notifications.length > 0 && (
        <MarkAllAsReadButton onClick={handleMarkAllAsRead}>
          Mark all as read
        </MarkAllAsReadButton>
      )}
    </PopupContainer>
  );
};

export default NotificationPopup;

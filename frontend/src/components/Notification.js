import React, { useState, useEffect, useCallback } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';
import { formatDistanceToNow } from 'date-fns';
import { IoMdNotifications, IoMdSettings, IoMdCheckmark, IoMdTrash } from 'react-icons/io';
import { FaBellSlash } from 'react-icons/fa';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import NotificationPreferences from './NotificationPreferences';
import io from 'socket.io-client';

const theme = {
  primary: '#3498db',
  secondary: '#2ecc71',
  background: '#f8f9fa',
  text: '#34495e',
  error: '#e74c3c',
  success: '#27ae60',
  warning: '#f39c12',
  info: '#3498db',
};

const NotificationWrapper = styled.div`
  font-family: 'Roboto', sans-serif;
  max-width: 400px;
  background-color: ${({ theme }) => theme.background};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: absolute;
  top: 60px;
  right: 20px;
  z-index: 1000;
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: ${({ theme }) => theme.primary};
  color: white;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.2rem;
`;

const SettingsButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
`;

const NotificationList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  max-height: 400px;
  overflow-y: auto;
`;

const NotificationItem = styled(motion.li)`
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f0f0f0;
  }

  ${({ isRead }) => isRead && `
    opacity: 0.6;
  `}
`;

const NotificationIcon = styled.div`
  margin-right: 16px;
  font-size: 1.5rem;
  color: ${({ theme, priority }) => {
    switch (priority) {
      case 'high':
        return theme.error;
      case 'medium':
        return theme.warning;
      default:
        return theme.info;
    }
  }};
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
`;

const NotificationMessage = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
`;

const NotificationTime = styled.span`
  font-size: 0.8rem;
  color: #999;
`;

const NotificationActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.primary};
  cursor: pointer;
  margin-left: 8px;
  font-size: 1rem;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.secondary};
  }
`;

const LoadMoreButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.secondary};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
  color: ${({ theme }) => theme.text};
`;

const EmptyStateIcon = styled(FaBellSlash)`
  font-size: 3rem;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.primary};
`;

const fetchNotifications = async ({ pageParam = 1 }) => {
  try {
    console.log(`Attempting to fetch notifications for page ${pageParam}`);
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentication token is missing');
    }

    const response = await axios.get(`/api/notifications?page=${pageParam}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Notifications fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);

    if (error.response) {
      console.error('Server responded with error:', error.response.status);
      console.error('Error data:', error.response.data);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }

    console.error('Error config:', error.config);

    throw error;
  }
};

const Notification = ({ onClose }) => {
  const [showPreferences, setShowPreferences] = useState(false);
  const { notificationCount, setNotificationCount } = useNotification();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery('notifications', fetchNotifications, {
    getNextPageParam: (lastPage) => lastPage.next_page || undefined,
    enabled: isAuthenticated,
  });

  const markAsReadMutation = useMutation(
    (notificationId) => axios.post(`/api/notifications/${notificationId}/mark-read/`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
        setNotificationCount((prevCount) => Math.max(0, prevCount - 1));
      },
    }
  );

  const deleteNotificationMutation = useMutation(
    (notificationId) => axios.delete(`/api/notifications/${notificationId}/`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
        setNotificationCount((prevCount) => Math.max(0, prevCount - 1));
      },
    }
  );

  const handleNotificationClick = useCallback((notification) => {
    if (!notification.read_at) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  }, [markAsReadMutation]);

  const handleMarkAsRead = useCallback((e, notificationId) => {
    e.stopPropagation();
    markAsReadMutation.mutate(notificationId);
  }, [markAsReadMutation]);

  const handleDelete = useCallback((e, notificationId) => {
    e.stopPropagation();
    deleteNotificationMutation.mutate(notificationId);
  }, [deleteNotificationMutation]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = io('http://localhost:8000', {
      path: '/socket.io/',
      transports: ['websocket']
    });
  
    socket.on('new_notification', (newNotification) => {
      queryClient.setQueryData('notifications', (old) => {
        if (!old) return { pages: [{ results: [newNotification] }] };
        return {
          ...old,
          pages: [
            { results: [newNotification, ...old.pages[0].results] },
            ...old.pages.slice(1),
          ],
        };
      });
      setNotificationCount((prevCount) => prevCount + 1);
    });
  
    return () => socket.disconnect();
  }, [queryClient, setNotificationCount, isAuthenticated]);

  const renderNotificationIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <IoMdNotifications color={theme.error} />;
      case 'medium':
        return <IoMdNotifications color={theme.warning} />;
      default:
        return <IoMdNotifications color={theme.info} />;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'error') {
    return <div>Error: {error.message}</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <NotificationWrapper>
        <NotificationHeader>
          <Title>Notifications ({notificationCount})</Title>
          <SettingsButton onClick={() => setShowPreferences(true)}>
            <IoMdSettings />
          </SettingsButton>
        </NotificationHeader>
        <NotificationList>
          <AnimatePresence>
            {data.pages.map((page, i) => (
              <React.Fragment key={i}>
                {page.results.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    isRead={!!notification.read_at}
                    onClick={() => handleNotificationClick(notification)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <NotificationIcon priority={notification.priority}>
                      {renderNotificationIcon(notification.priority)}
                    </NotificationIcon>
                    <NotificationContent>
                      <NotificationTitle>{notification.title}</NotificationTitle>
                      <NotificationMessage>{notification.message}</NotificationMessage>
                      <NotificationTime>
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </NotificationTime>
                      <NotificationActions>
                        {!notification.read_at && (
                          <ActionButton onClick={(e) => handleMarkAsRead(e, notification.id)}>
                            <IoMdCheckmark /> Mark as read
                          </ActionButton>
                        )}
                        <ActionButton onClick={(e) => handleDelete(e, notification.id)}>
                          <IoMdTrash /> Delete
                        </ActionButton>
                      </NotificationActions>
                    </NotificationContent>
                  </NotificationItem>
                ))}
              </React.Fragment>
            ))}
          </AnimatePresence>
        </NotificationList>
        {hasNextPage && (
          <LoadMoreButton onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading more...' : 'Load More'}
          </LoadMoreButton>
        )}
        {data.pages[0].results.length === 0 && (
          <EmptyState>
            <EmptyStateIcon />
            <p>No notifications at the moment</p>
          </EmptyState>
        )}
      </NotificationWrapper>
      {showPreferences && (
        <NotificationPreferences onClose={() => setShowPreferences(false)} />
      )}
    </ThemeProvider>
  );
};

export default Notification;

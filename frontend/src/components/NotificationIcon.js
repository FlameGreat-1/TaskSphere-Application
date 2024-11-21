import React, { useState } from 'react';
import styled from 'styled-components';
import { IoMdNotifications } from 'react-icons/io';
import Notification from './Notification';
import { useNotification } from '../context/NotificationContext';

const IconWrapper = styled.div`
  position: relative;
  cursor: pointer;
`;

const NotificationCount = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 2px 5px;
  font-size: 0.7rem;
`;

const NotificationIcon = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { notificationCount } = useNotification();
  const isAuthenticated = !!localStorage.getItem('authToken'); // Or use your auth check method

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <IconWrapper>
      <IoMdNotifications onClick={toggleNotifications} />
      {notificationCount > 0 && <NotificationCount>{notificationCount}</NotificationCount>}
      {showNotifications && isAuthenticated && <Notification onClose={() => setShowNotifications(false)} />}
    </IconWrapper>
  );
};

export default NotificationIcon;

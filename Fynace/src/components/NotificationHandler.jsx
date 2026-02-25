import React from 'react';
import { useNotifications } from '../hooks/useNotifications';

const NotificationHandler = ({ children }) => {
  // This hook handles initialization and listening
  useNotifications();

  return <>{children}</>;
};

export default NotificationHandler;

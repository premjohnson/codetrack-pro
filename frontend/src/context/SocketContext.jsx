import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socketInstance = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('Websocket connected:', socketInstance.id);
      
      // Join rooms
      socketInstance.emit('join', {
        role: user.role,
        userId: user.id,
      });
    });

    // Handle generic notifications
    socketInstance.on('notification:new', (notif) => {
      console.log('Received notification:', notif);
      setNotifications((prev) => [
        { id: Date.now(), ...notif, read: false },
        ...prev,
      ]);

      // Trigger standard browser notification
      if (Notification.permission === 'granted') {
        new Notification(notif.title, { body: notif.message });
      }
    });

    setSocket(socketInstance);

    // Request notification permissions
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  const clearNotifications = () => setNotifications([]);

  return (
    <SocketContext.Provider value={{ socket, notifications, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

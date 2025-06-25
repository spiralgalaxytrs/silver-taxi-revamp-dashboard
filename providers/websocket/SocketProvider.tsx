"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket as ClientSocket } from 'socket.io-client';
import io from 'socket.io-client';

interface SocketContextType {
  socket: typeof ClientSocket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<typeof ClientSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let socketInstance: typeof ClientSocket | null = null;
    
    try {
      // Get token from localStorage or your auth state management
      const token = sessionStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const getBaseUrl = () => {
        return process.env.NEXT_PUBLIC_APP_MODE == 'development' 
          ? process.env.NEXT_PUBLIC_DEV_SOCKET_URL 
          : process.env.NEXT_PUBLIC_SOCKET_URL;
      }
      
      const baseUrl = getBaseUrl();
      if (!baseUrl) {
        console.error('Base URL is undefined');
        return;
      }

      // Create socket connection
      socketInstance = io(baseUrl, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        auth: { token }
      });

      // Set up event listeners
      socketInstance.on('connect', () => {
        setIsConnected(true);
        socketInstance?.emit('authenticate', { token });
      });

      socketInstance.on('auth_success', (data: { message: string; user: { id: string; username?: string; role?: string } }) => {
      });

      socketInstance.on('auth_error', (error: { message: string }) => {
        socketInstance?.disconnect();
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (error: Error) => {
        setIsConnected(false);
        
        // Attempt to reconnect after a delay
        setTimeout(() => {
          socketInstance?.connect();
        }, 3000);
      });

      setSocket(socketInstance);
    } catch (error) {
      setIsConnected(false);
    }

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
} 
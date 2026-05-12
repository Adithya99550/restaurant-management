'use client';

import { useEffect, useState, useCallback } from 'react';
import { socket, connectSocket, disconnectSocket } from '../lib/socket';

export const useSocket = (role, events = []) => {
  const [data, setData] = useState({});

  useEffect(() => {
    if (role) {
      connectSocket(role);

      const listeners = {};
      events.forEach((event) => {
        const handler = (payload) => {
          setData((prev) => ({ ...prev, [event]: payload }));
        };
        socket.on(event, handler);
        listeners[event] = handler;
      });

      return () => {
        Object.keys(listeners).forEach((event) => {
          socket.off(event, listeners[event]);
        });
      };
    }
  }, [role, events]);

  const emit = useCallback((event, payload) => {
    socket.emit(event, payload);
  }, []);

  return { socket, data, emit };
};

export default useSocket;
import { io } from 'socket.io-client';

let socket;

export const getSocket = () => {
  if (socket) return socket;

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
  socket = io(socketUrl, {
    transports: ['websocket', 'polling'],
  });

  return socket;
};

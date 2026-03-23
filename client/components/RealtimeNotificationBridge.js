'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { getSocket } from '../lib/socket';
import { useAuth } from '../context/AuthContext';

const RealtimeNotificationBridge = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;

    const socket = getSocket();
    const roomId = user._id.toString();

    socket.emit('joinUser', roomId);

    const onNotify = (payload) => {
      toast(payload.message || 'New activity');

      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }

        if (Notification.permission === 'granted') {
          const notification = new Notification('PD Updates', {
            body: payload.message || 'You have a new notification',
            icon: '/favicon.ico',
          });

          notification.onclick = () => {
            window.focus();
            if (payload.blogId) {
              router.push('/blog');
            }
          };
        }
      }
    };

    socket.on('notify', onNotify);

    return () => {
      socket.emit('leaveUser', roomId);
      socket.off('notify', onNotify);
    };
  }, [isAuthenticated, user?._id, router]);

  return null;
};

export default RealtimeNotificationBridge;

'use client';

import { Toaster } from 'react-hot-toast';

const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 2600,
        style: {
          borderRadius: '12px',
          border: '1px solid #f1d9c3',
          background: '#fff9f1',
          color: '#182338',
        },
      }}
    />
  );
};

export default ToastProvider;

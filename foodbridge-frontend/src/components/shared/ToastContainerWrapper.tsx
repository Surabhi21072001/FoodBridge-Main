import React, { useState, useCallback } from 'react';
import ToastContainer, { type ToastMessage } from './ToastContainer';

const ToastContainerWrapper: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const handleDismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return <ToastContainer toasts={toasts} onDismiss={handleDismiss} />;
};

export default ToastContainerWrapper;

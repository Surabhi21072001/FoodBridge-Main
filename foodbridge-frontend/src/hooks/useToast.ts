import { useState, useCallback } from 'react';
import type { ToastMessage, ToastVariant } from '../components/shared/ToastContainer';

interface UseToastReturn {
  toasts: ToastMessage[];
  showToast: (message: string, variant?: ToastVariant, duration?: number) => string;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

let toastId = 0;

const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info', duration?: number): string => {
      const id = `toast-${toastId++}`;

      // Set default duration based on variant
      const finalDuration = duration !== undefined ? duration : variant === 'success' ? 3000 : undefined;

      const newToast: ToastMessage = {
        id,
        message,
        variant,
        duration: finalDuration,
      };

      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    dismissToast,
    clearAll,
  };
};

export default useToast;

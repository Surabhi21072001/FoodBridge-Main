import React from 'react';
import Toast, { type ToastVariant } from './Toast';

export type { ToastVariant };
export interface ToastMessage {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          variant={toast.variant}
          duration={toast.duration}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};

export default ToastContainer;

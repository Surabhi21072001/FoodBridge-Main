import React, { useState } from 'react';
import Button from './Button';
import ToastContainer from './ToastContainer';
import useToast from '../../hooks/useToast';

const ToastDemo: React.FC = () => {
  const { toasts, showToast, dismissToast } = useToast();
  const [customDuration, setCustomDuration] = useState(3000);

  const handleShowSuccess = () => {
    showToast('Operation completed successfully!', 'success');
  };

  const handleShowError = () => {
    showToast('An error occurred. Please try again.', 'error');
  };

  const handleShowWarning = () => {
    showToast('Please review your input before proceeding.', 'warning');
  };

  const handleShowInfo = () => {
    showToast('Here is some helpful information.', 'info');
  };

  const handleShowCustomDuration = () => {
    showToast(`This will dismiss in ${customDuration}ms`, 'success', customDuration);
  };

  const handleShowPersistent = () => {
    showToast('This notification will not auto-dismiss. Click the X to close.', 'error');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Toast Notification Demo</h1>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Variants</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={handleShowSuccess}>
              Show Success
            </Button>
            <Button variant="danger" onClick={handleShowError}>
              Show Error
            </Button>
            <Button variant="secondary" onClick={handleShowWarning}>
              Show Warning
            </Button>
            <Button variant="ghost" onClick={handleShowInfo}>
              Show Info
            </Button>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Custom Duration</h2>
          <div className="flex gap-3 items-end">
            <div>
              <label className="block text-sm font-medium mb-2">
                Duration (ms):
              </label>
              <input
                type="number"
                value={customDuration}
                onChange={(e) => setCustomDuration(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg"
                min="0"
                step="500"
              />
            </div>
            <Button onClick={handleShowCustomDuration}>
              Show with Custom Duration
            </Button>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Persistent Notification</h2>
          <Button onClick={handleShowPersistent}>
            Show Persistent Error
          </Button>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Active Toasts</h2>
          <p className="text-gray-600 mb-3">
            {toasts.length === 0
              ? 'No active toasts'
              : `${toasts.length} active toast${toasts.length !== 1 ? 's' : ''}`}
          </p>
          {toasts.length > 0 && (
            <div className="space-y-2">
              {toasts.map((toast) => (
                <div
                  key={toast.id}
                  className="p-3 bg-gray-100 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{toast.message}</p>
                    <p className="text-sm text-gray-600">
                      Variant: {toast.variant} | Duration: {toast.duration ? `${toast.duration}ms` : 'None'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissToast(toast.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default ToastDemo;

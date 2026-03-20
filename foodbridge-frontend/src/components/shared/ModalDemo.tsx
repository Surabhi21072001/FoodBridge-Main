import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';

const ModalDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Modal Component Demo</h1>
        <p className="text-gray-600 mb-6">
          The Modal component provides an accessible dialog with backdrop, focus trap, and escape key handling.
        </p>
      </div>

      {/* Basic Modal */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Basic Modal</h2>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Welcome to FoodBridge"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              This is a basic modal dialog. You can close it by:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Clicking the close button (X)</li>
              <li>Clicking outside the modal (backdrop)</li>
              <li>Pressing the Escape key</li>
            </ul>
            <div className="flex gap-2 pt-4">
              <Button variant="primary" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      </div>

      {/* Confirmation Modal */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Confirmation Modal</h2>
        <Button onClick={() => setIsConfirmOpen(true)} variant="danger">
          Delete Item
        </Button>

        <Modal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          title="Confirm Deletion"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-4">
              <Button
                variant="danger"
                onClick={() => {
                  setIsConfirmOpen(false);
                  alert('Item deleted!');
                }}
              >
                Delete
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsConfirmOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>

      {/* Features */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Features</h3>
        <ul className="space-y-2 text-blue-800">
          <li>✓ Backdrop with click-to-close functionality</li>
          <li>✓ Escape key handling for accessibility</li>
          <li>✓ Focus trap - focus stays within modal</li>
          <li>✓ Focus restoration when modal closes</li>
          <li>✓ Body scroll prevention when modal is open</li>
          <li>✓ Full ARIA attributes for screen readers</li>
          <li>✓ Keyboard accessible close button</li>
          <li>✓ Responsive design with max-height and overflow</li>
        </ul>
      </div>
    </div>
  );
};

export default ModalDemo;

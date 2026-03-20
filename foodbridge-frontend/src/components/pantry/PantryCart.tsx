import React from 'react';
import type { CartItem } from '../../types/pantry';
import Card, { CardBody, CardFooter } from '../shared/Card';
import Button from '../shared/Button';

export interface PantryCartProps {
  items: CartItem[];
  onRemove: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onCheckout?: () => void;
}

const PantryCart: React.FC<PantryCartProps> = ({
  items,
  onRemove,
  onUpdateQuantity,
  onCheckout,
}) => {
  // Calculate total item count
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0) {
    return (
      <Card className="bg-gray-50 border-2 border-dashed border-gray-300">
        <CardBody className="text-center py-8">
          <p className="text-gray-500 text-lg">Your cart is empty</p>
          <p className="text-gray-400 text-sm mt-2">Add items from the inventory to get started</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full" data-testid="pantry-cart">
      {/* Header with total count */}
      <CardBody className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Your Cart</h2>
          <span
            className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
            data-testid="total-item-count"
          >
            {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
          </span>
        </div>
      </CardBody>

      {/* Cart items list */}
      <CardBody className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.item_id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              data-testid={`cart-item-${item.item_id}`}
            >
              {/* Item info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {item.item_name}
                </h3>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => onUpdateQuantity(item.item_id, Math.max(1, item.quantity - 1))}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                  aria-label={`Decrease quantity for ${item.item_name}`}
                  data-testid={`decrease-quantity-${item.item_id}`}
                >
                  <span className="text-lg">−</span>
                </button>

                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    onUpdateQuantity(item.item_id, Math.max(1, value));
                  }}
                  className="w-12 px-2 py-1 text-center border border-gray-300 rounded text-sm font-medium"
                  data-testid={`quantity-input-${item.item_id}`}
                />

                <button
                  onClick={() => onUpdateQuantity(item.item_id, item.quantity + 1)}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                  aria-label={`Increase quantity for ${item.item_name}`}
                  data-testid={`increase-quantity-${item.item_id}`}
                >
                  <span className="text-lg">+</span>
                </button>
              </div>

              {/* Remove button */}
              <button
                onClick={() => onRemove(item.item_id)}
                className="ml-3 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                aria-label={`Remove ${item.item_name} from cart`}
                data-testid={`remove-item-${item.item_id}`}
              >
                <span className="text-lg">×</span>
              </button>
            </div>
          ))}
        </div>
      </CardBody>

      {/* Footer with summary */}
      <CardFooter className="border-t border-gray-200 pt-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total items:</span>
            <span className="font-semibold text-gray-900">{totalItemCount}</span>
          </div>
          <p className="text-xs text-gray-500">
            Review your selections and proceed to book an appointment
          </p>
          {items.length > 0 && onCheckout && (
            <Button
              variant="primary"
              onClick={onCheckout}
              className="w-full mt-2"
              data-testid="checkout-button"
            >
              Proceed to Checkout
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PantryCart;

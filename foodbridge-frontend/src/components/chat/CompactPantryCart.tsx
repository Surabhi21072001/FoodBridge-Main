import React from 'react';
import type { CartItem } from '../../types/pantry';

export interface CompactPantryCartProps {
  items: CartItem[];
}

/**
 * Compact version of PantryCart for displaying in chat results.
 * Shows recommended pantry items in a condensed format suitable for chat display.
 * Requirement 10.6: Display tool results in a formatted manner
 */
const CompactPantryCart: React.FC<CompactPantryCartProps> = ({ items }) => {
  // Calculate total item count
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-center text-xs text-gray-500">
        No items recommended
      </div>
    );
  }

  return (
    <div
      className="p-3 bg-white border border-gray-200 rounded-lg"
      data-testid="compact-pantry-cart"
    >
      {/* Header with total count */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-900">Recommended Items</h4>
        <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
          {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Cart items list */}
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.item_id}
            className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200 text-xs"
            data-testid={`compact-cart-item-${item.item_id}`}
          >
            {/* Item info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{item.item_name}</p>
            </div>

            {/* Quantity */}
            <div className="flex-shrink-0 ml-2 px-2 py-1 bg-blue-50 text-blue-700 rounded font-medium">
              ×{item.quantity}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
        <p className="font-medium">💡 Smart recommendations based on your preferences</p>
      </div>
    </div>
  );
};

export default CompactPantryCart;

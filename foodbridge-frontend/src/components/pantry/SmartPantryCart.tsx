import React, { useState } from 'react';
import type { PantryItem, CartItem } from '../../types/pantry';
import pantryService from '../../services/pantryService';
import Button from '../shared/Button';
import Card, { CardBody, CardFooter } from '../shared/Card';

export interface SmartPantryCartProps {
  onAddToCart: (items: CartItem[]) => void;
  isLoading?: boolean;
}

const SmartPantryCart: React.FC<SmartPantryCartProps> = ({ onAddToCart, isLoading = false }) => {
  const [recommendedItems, setRecommendedItems] = useState<PantryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generatingRef = React.useRef(false);

  const handleGenerateSmartCart = async () => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    try {
      setIsGenerating(true);
      setError(null);
      const items = await pantryService.generateSmartCart();
      // Normalize: backend returns item_id, component expects id
      const normalized = items.map((item: any) => ({
        ...item,
        id: item.id ?? item.item_id,
      }));
      setRecommendedItems(normalized);
      setHasGenerated(true);
      // Initialize all items as selected with quantity 1
      const initialSelection = new Map<string, number>();
      normalized.forEach((item) => {
        initialSelection.set(item.id, 1);
      });
      setSelectedItems(initialSelection);
    } catch (err) {
      setError('Failed to generate smart cart. Please try again.');
      console.error('Error generating smart cart:', err);
      generatingRef.current = false;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleItem = (itemId: string) => {
    const newSelection = new Map(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.set(itemId, 1);
    }
    setSelectedItems(newSelection);
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    const newSelection = new Map(selectedItems);
    if (quantity > 0) {
      newSelection.set(itemId, quantity);
    } else {
      newSelection.delete(itemId);
    }
    setSelectedItems(newSelection);
  };

  const handleAddSelectedToCart = () => {
    const cartItems: CartItem[] = [];
    selectedItems.forEach((quantity, itemId) => {
      const item = recommendedItems.find((i) => i.id === itemId);
      if (item) {
        cartItems.push({
          item_id: item.id,
          item_name: item.item_name,
          quantity,
        });
      }
    });

    if (cartItems.length > 0) {
      onAddToCart(cartItems);
      // Reset state after adding to cart
      setRecommendedItems([]);
      setSelectedItems(new Map());
      setHasGenerated(false);
    }
  };

  const handleReset = () => {
    setRecommendedItems([]);
    setSelectedItems(new Map());
    setHasGenerated(false);
    setError(null);
    generatingRef.current = false;
  };

  // Show button to generate cart
  if (!hasGenerated) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
        <CardBody className="text-center py-8">
          <div className="mb-4">
            <div className="inline-block p-3 bg-blue-100 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Cart Generation</h3>
          <p className="text-gray-600 text-sm mb-6">
            Get personalized pantry recommendations based on your history and preferences
          </p>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          <Button
            onClick={handleGenerateSmartCart}
            isLoading={isGenerating}
            disabled={isGenerating || isLoading}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate Smart Cart'}
          </Button>
        </CardBody>
      </Card>
    );
  }

  // Show recommended items for editing
  return (
    <Card className="flex flex-col" data-testid="smart-pantry-cart">
      <CardBody className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recommended Items</h3>
          <span className="text-sm text-gray-600">
            {selectedItems.size} of {recommendedItems.length} selected
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Review and adjust the recommended items before adding to your cart
        </p>
      </CardBody>

      {/* Recommended items list */}
      <CardBody className="flex-1 overflow-y-auto">
        {recommendedItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No recommendations available at this time</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendedItems.map((item) => {
              const isSelected = selectedItems.has(item.id);
              const quantity = selectedItems.get(item.id) || 1;

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                  onClick={() => handleToggleItem(item.id)}
                  data-testid={`recommended-item-${item.id}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleItem(item.id)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded cursor-pointer"
                      aria-label={`Select ${item.item_name}`}
                      data-testid={`select-item-${item.id}`}
                      onClick={(e) => e.stopPropagation()}
                    />

                    {/* Item info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">{item.item_name}</h4>
                      <p className="text-sm text-gray-600">{item.category}</p>
                      {item.dietary_tags && item.dietary_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.dietary_tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quantity control - only show if selected */}
                    {isSelected && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateQuantity(item.id, Math.max(1, quantity - 1));
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                          aria-label={`Decrease quantity for ${item.item_name}`}
                          data-testid={`decrease-qty-${item.id}`}
                        >
                          <span className="text-lg">−</span>
                        </button>

                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => {
                            e.stopPropagation();
                            const value = parseInt(e.target.value) || 1;
                            handleUpdateQuantity(item.id, Math.max(1, value));
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-10 px-1 py-1 text-center border border-gray-300 rounded text-sm font-medium"
                          data-testid={`qty-input-${item.id}`}
                        />

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateQuantity(item.id, quantity + 1);
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                          aria-label={`Increase quantity for ${item.item_name}`}
                          data-testid={`increase-qty-${item.id}`}
                        >
                          <span className="text-lg">+</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>

      {/* Footer with action buttons */}
      <CardFooter className="border-t border-gray-200 pt-4 flex gap-3">
        <Button
          variant="secondary"
          onClick={handleReset}
          className="flex-1"
          data-testid="cancel-smart-cart"
        >
          Cancel
        </Button>
        <Button
          onClick={handleAddSelectedToCart}
          disabled={selectedItems.size === 0}
          className="flex-1"
          data-testid="add-to-cart-button"
        >
          Add {selectedItems.size > 0 ? `${selectedItems.size} Item${selectedItems.size !== 1 ? 's' : ''}` : 'Items'} to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SmartPantryCart;

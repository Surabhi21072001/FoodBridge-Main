import React, { useState } from 'react';
import type { PantryItem } from '../../types/pantry';
import Card, { CardBody, CardFooter } from '../shared/Card';
import Button from '../shared/Button';

export interface PantryInventoryProps {
  items: PantryItem[];
  onAddToCart: (item: PantryItem, quantity: number) => void;
  isLoading?: boolean;
}

const PantryInventory: React.FC<PantryInventoryProps> = ({
  items,
  onAddToCart,
  isLoading = false,
}) => {
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [addingToCart, setAddingToCart] = useState<Record<string, boolean>>({});

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(1, quantity),
    }));
  };

  const handleAddToCart = async (item: PantryItem) => {
    const quantity = selectedQuantities[item.id] || 1;
    setAddingToCart((prev) => ({
      ...prev,
      [item.id]: true,
    }));

    try {
      onAddToCart(item, quantity);
      // Reset quantity after adding
      setSelectedQuantities((prev) => ({
        ...prev,
        [item.id]: 1,
      }));
    } finally {
      setAddingToCart((prev) => ({
        ...prev,
        [item.id]: false,
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-200 rounded-lg h-64 animate-pulse"
            data-testid="pantry-item-skeleton"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No pantry items available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => {
        const inStock = item.quantity > 0;
        return (
          <Card
            key={item.id}
            className="flex flex-col h-full"
            data-testid={`pantry-item-${item.id}`}
          >
            <CardBody className="flex-1">
              {/* Item header */}
              <div className="mb-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {item.item_name}
                  </h3>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded whitespace-nowrap ${
                      inStock
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                    data-testid={`availability-badge-${item.id}`}
                  >
                    {inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Category */}
              <div className="mb-2">
                <span className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200">
                  {item.category}
                </span>
              </div>

              {/* Dietary tags */}
              {item.dietary_tags && item.dietary_tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {item.dietary_tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-2 py-1 text-xs bg-green-50 text-green-700 rounded border border-green-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Allergen info */}
              {item.allergen_info && item.allergen_info.length > 0 && (
                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs font-medium text-yellow-800 mb-1">Allergens:</p>
                  <p className="text-xs text-yellow-700">{item.allergen_info.join(', ')}</p>
                </div>
              )}

              {/* Item details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-gray-700">
                  <span className="font-medium">Quantity:</span>
                  <span>
                    {item.quantity} {item.unit}
                  </span>
                </div>

                {item.expiration_date && (
                  <div className="flex items-center justify-between text-gray-700">
                    <span className="font-medium">Expires:</span>
                    <span>{new Date(item.expiration_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardBody>

            {/* Action section */}
            <CardFooter className="flex flex-col gap-2">
              {inStock ? (
                <>
                  <div className="flex items-center gap-2">
                    <label htmlFor={`qty-${item.id}`} className="text-sm font-medium text-gray-700">
                      Qty:
                    </label>
                    <input
                      id={`qty-${item.id}`}
                      type="number"
                      min="1"
                      max={Math.floor(item.quantity)}
                      value={selectedQuantities[item.id] || 1}
                      onChange={(e) =>
                        handleQuantityChange(item.id, parseInt(e.target.value) || 1)
                      }
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                      data-testid={`quantity-input-${item.id}`}
                    />
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAddToCart(item)}
                    isLoading={addingToCart[item.id] || false}
                    className="w-full"
                    data-testid={`add-to-cart-button-${item.id}`}
                  >
                    Add to Cart
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  className="w-full"
                  data-testid={`out-of-stock-button-${item.id}`}
                >
                  Out of Stock
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default PantryInventory;

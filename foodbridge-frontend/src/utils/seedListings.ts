/**
 * Seed Listings Utility
 * Generates sample food listings with real food images for demo/testing
 */

import type { Listing } from '../types/listings';

// Image URLs for food listings - using direct image URLs
const FOOD_IMAGES = {
  pizza: 'https://images.unsplash.com/photo-1628840042765-356cda07f4ee?w=600&h=400&fit=crop',
  bagels: 'https://images.unsplash.com/photo-1585080872051-9bac9a5f0317?w=600&h=400&fit=crop',
  vegetables: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
  chicken: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&h=400&fit=crop',
  yogurt: 'https://images.unsplash.com/photo-1488477181946-6428a0291840?w=600&h=400&fit=crop',
  pastaSalad: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop',
  cookies: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&h=400&fit=crop',
  beverages: 'https://images.unsplash.com/photo-1554866585-acbb2f46b34c?w=600&h=400&fit=crop',
  vegBurger: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop',
};

export const SAMPLE_LISTINGS: Listing[] = [
  {
    listing_id: '1',
    provider_id: 'provider-1',
    food_name: 'Leftover Pizza',
    description: 'Fresh pepperoni pizza from last night\'s event. 8 slices available.',
    quantity: 8,
    available_quantity: 5,
    location: 'Student Center, Room 101',
    pickup_window_start: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    pickup_window_end: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    food_type: 'Prepared Meal',
    dietary_tags: ['Vegetarian'],
    listing_type: 'donation',
    status: 'active',
    image_url: FOOD_IMAGES.pizza,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    listing_id: '2',
    provider_id: 'provider-2',
    food_name: 'Fresh Bagels',
    description: 'Assorted bagels from this morning\'s bakery. Plain, everything, and sesame varieties.',
    quantity: 12,
    available_quantity: 8,
    location: 'Dining Hall A',
    pickup_window_start: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    pickup_window_end: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    food_type: 'Bakery',
    dietary_tags: ['Vegan'],
    listing_type: 'donation',
    status: 'active',
    image_url: FOOD_IMAGES.bagels,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    listing_id: '3',
    provider_id: 'provider-3',
    food_name: 'Organic Vegetables',
    description: 'Surplus organic vegetables from the farmer\'s market. Includes carrots, broccoli, and spinach.',
    quantity: 15,
    available_quantity: 12,
    location: 'Campus Farm',
    pickup_window_start: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    pickup_window_end: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    food_type: 'Produce',
    dietary_tags: ['Vegan', 'Gluten-Free'],
    listing_type: 'donation',
    status: 'active',
    image_url: FOOD_IMAGES.vegetables,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    listing_id: '4',
    provider_id: 'provider-1',
    food_name: 'Grilled Chicken Sandwiches',
    description: 'Delicious grilled chicken sandwiches with lettuce and tomato. Perfect for lunch!',
    quantity: 10,
    available_quantity: 3,
    location: 'Student Center, Room 101',
    pickup_window_start: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(),
    pickup_window_end: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
    food_type: 'Prepared Meal',
    dietary_tags: ['Gluten-Free'],
    listing_type: 'dining_deal',
    status: 'active',
    image_url: FOOD_IMAGES.chicken,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    listing_id: '5',
    provider_id: 'provider-4',
    food_name: 'Yogurt and Granola',
    description: 'Greek yogurt with homemade granola. Great for breakfast or snack.',
    quantity: 20,
    available_quantity: 15,
    location: 'Dining Hall B',
    pickup_window_start: new Date(Date.now() + 0.5 * 60 * 60 * 1000).toISOString(),
    pickup_window_end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    food_type: 'Dairy',
    dietary_tags: ['Vegetarian', 'Gluten-Free'],
    listing_type: 'donation',
    status: 'active',
    image_url: FOOD_IMAGES.yogurt,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    listing_id: '6',
    provider_id: 'provider-5',
    food_name: 'Pasta Salad',
    description: 'Chilled pasta salad with fresh vegetables and Italian dressing.',
    quantity: 6,
    available_quantity: 2,
    location: 'Cafe Central',
    pickup_window_start: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
    pickup_window_end: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    food_type: 'Prepared Meal',
    dietary_tags: ['Vegetarian'],
    listing_type: 'donation',
    status: 'active',
    image_url: FOOD_IMAGES.pastaSalad,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    listing_id: '7',
    provider_id: 'provider-2',
    food_name: 'Chocolate Chip Cookies',
    description: 'Homemade chocolate chip cookies. Baked fresh this morning!',
    quantity: 24,
    available_quantity: 18,
    location: 'Dining Hall A',
    pickup_window_start: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    pickup_window_end: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    food_type: 'Bakery',
    dietary_tags: ['Vegetarian'],
    listing_type: 'donation',
    status: 'active',
    image_url: FOOD_IMAGES.cookies,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    listing_id: '8',
    provider_id: 'provider-3',
    food_name: 'Assorted Beverages',
    description: 'Juice, water, and sports drinks. Perfect for hydration!',
    quantity: 30,
    available_quantity: 25,
    location: 'Campus Farm',
    pickup_window_start: new Date(Date.now() + 0.5 * 60 * 60 * 1000).toISOString(),
    pickup_window_end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    food_type: 'Beverages',
    dietary_tags: ['Vegan', 'Gluten-Free'],
    listing_type: 'donation',
    status: 'active',
    image_url: FOOD_IMAGES.beverages,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    listing_id: '9',
    provider_id: 'provider-1',
    food_name: 'Vegetarian Burger',
    description: 'Juicy plant-based burger with melted cheese, fresh lettuce, tomato, and house sauce on a toasted sesame bun. Served with golden fries.',
    quantity: 10,
    available_quantity: 10,
    location: 'Student Center Grill',
    pickup_window_start: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    pickup_window_end: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    food_type: 'Prepared Meal',
    dietary_tags: ['Vegetarian'],
    listing_type: 'dining_deal',
    status: 'active',
    image_url: FOOD_IMAGES.vegBurger,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/**
 * Get sample listings for demo/testing
 * Optionally filter by food type or dietary tags
 */
export const getSampleListings = (
  filters?: {
    foodType?: string;
    dietaryTag?: string;
    limit?: number;
  }
): Listing[] => {
  let results = [...SAMPLE_LISTINGS];

  if (filters?.foodType) {
    results = results.filter((l) => l.food_type === filters.foodType);
  }

  if (filters?.dietaryTag) {
    results = results.filter((l) => l.dietary_tags.includes(filters.dietaryTag!));
  }

  if (filters?.limit) {
    results = results.slice(0, filters.limit);
  }

  return results;
};

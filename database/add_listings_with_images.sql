-- Add 8 new listings with images
-- Image mapping:
-- 1. Leftover Pizza -> Pizza image
-- 2. Fresh Bagels -> Bagels image
-- 3. Organic Vegetables -> Vegetables image
-- 4. Grilled Chicken Sandwiches -> Chicken sandwich image
-- 5. Yogurt and Granola -> Yogurt parfait image
-- 6. Pasta Salad -> Pasta salad image
-- 7. Chocolate Chip Cookies -> Cookies image
-- 8. Assorted Beverages -> Beverages image

INSERT INTO food_listings (
  provider_id, title, description, category, cuisine_type, dietary_tags, 
  quantity_available, quantity_reserved, pickup_location, available_from, 
  available_until, image_urls, status
) VALUES
-- 1. Leftover Pizza
('44444444-4444-4444-4444-444444444444',
 'Leftover Pizza',
 'Fresh pepperoni pizza from last night''s event. 8 slices available.',
 'meal',
 'italian',
 ARRAY['Vegetarian'],
 5, 3,
 'Student Center, Room 101',
 NOW() - INTERVAL '1 hour',
 NOW() + INTERVAL '3 hours',
 ARRAY['https://images.unsplash.com/photo-1628840042765-356cda07f4ee?w=600&h=400&fit=crop'],
 'active'),

-- 2. Fresh Bagels
('44444444-4444-4444-4444-444444444444',
 'Fresh Bagels',
 'Assorted bagels from this morning''s bakery. Plain, everything, and sesame varieties.',
 'snack',
 'bakery',
 ARRAY['Vegan'],
 8, 4,
 'Dining Hall A',
 NOW(),
 NOW() + INTERVAL '2 hours',
 ARRAY['https://images.unsplash.com/photo-1585080872051-9bac9a5f0317?w=600&h=400&fit=crop'],
 'active'),

-- 3. Organic Vegetables
('44444444-4444-4444-4444-444444444444',
 'Organic Vegetables',
 'Surplus organic vegetables from the farmer''s market. Includes carrots, broccoli, and spinach.',
 'pantry_item',
 'produce',
 ARRAY['Vegan', 'Gluten-Free'],
 12, 3,
 'Campus Farm',
 NOW() + INTERVAL '30 minutes',
 NOW() + INTERVAL '4 hours',
 ARRAY['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop'],
 'active'),

-- 4. Grilled Chicken Sandwiches
('55555555-5555-5555-5555-555555555555',
 'Grilled Chicken Sandwiches',
 'Delicious grilled chicken sandwiches with lettuce and tomato. Perfect for lunch!',
 'meal',
 'american',
 ARRAY['Gluten-Free'],
 7, 3,
 'Student Center, Room 101',
 NOW() + INTERVAL '1 hour',
 NOW() + INTERVAL '2 hours',
 ARRAY['https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&h=400&fit=crop'],
 'active'),

-- 5. Yogurt and Granola
('55555555-5555-5555-5555-555555555555',
 'Yogurt and Granola',
 'Greek yogurt with homemade granola. Great for breakfast or snack.',
 'snack',
 'dairy',
 ARRAY['Vegetarian', 'Gluten-Free'],
 20, 5,
 'Dining Hall B',
 NOW() + INTERVAL '30 minutes',
 NOW() + INTERVAL '3 hours',
 ARRAY['https://images.unsplash.com/photo-1488477181946-6428a0291840?w=600&h=400&fit=crop'],
 'active'),

-- 6. Pasta Salad
('66666666-6666-6666-6666-666666666666',
 'Pasta Salad',
 'Chilled pasta salad with fresh vegetables and Italian dressing.',
 'meal',
 'italian',
 ARRAY['Vegetarian'],
 6, 2,
 'Cafe Central',
 NOW() + INTERVAL '1.5 hours',
 NOW() + INTERVAL '3.5 hours',
 ARRAY['https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop'],
 'active'),

-- 7. Chocolate Chip Cookies
('66666666-6666-6666-6666-666666666666',
 'Chocolate Chip Cookies',
 'Homemade chocolate chip cookies. Baked fresh this morning!',
 'snack',
 'bakery',
 ARRAY['Vegetarian'],
 18, 6,
 'Dining Hall A',
 NOW(),
 NOW() + INTERVAL '2 hours',
 ARRAY['https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&h=400&fit=crop'],
 'active'),

-- 8. Assorted Beverages
('44444444-4444-4444-4444-444444444444',
 'Assorted Beverages',
 'Juice, water, and sports drinks. Perfect for hydration!',
 'beverage',
 'beverages',
 ARRAY['Vegan', 'Gluten-Free'],
 25, 5,
 'Campus Farm',
 NOW() + INTERVAL '15 minutes',
 NOW() + INTERVAL '2.5 hours',
 ARRAY['https://images.unsplash.com/photo-1554866585-acbb2f46b34c?w=600&h=400&fit=crop'],
 'active');

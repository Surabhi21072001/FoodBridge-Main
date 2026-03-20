-- FoodBridge AI Platform - Sample Seed Data
-- This file provides test data for development and testing

-- Clear existing data to prevent duplicates
TRUNCATE TABLE user_activity_log CASCADE;
TRUNCATE TABLE ai_conversation_history CASCADE;
TRUNCATE TABLE volunteer_signups CASCADE;
TRUNCATE TABLE volunteer_shifts CASCADE;
TRUNCATE TABLE dining_deals CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE pantry_appointments CASCADE;
TRUNCATE TABLE reservations CASCADE;
TRUNCATE TABLE food_listings CASCADE;
TRUNCATE TABLE provider_profiles CASCADE;
TRUNCATE TABLE user_preferences CASCADE;
TRUNCATE TABLE users CASCADE;

-- ============================================================================
-- USERS
-- ============================================================================

-- Password for all test users: "password123" (hashed with bcrypt)
-- In production, use proper password hashing

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active) VALUES
-- Students
('11111111-1111-1111-1111-111111111111', 'alice.student@university.edu', '$2b$10$rKvVPZhQXZhQXZhQXZhQXe', 'student', 'Alice', 'Johnson', '555-0101', true),
('22222222-2222-2222-2222-222222222222', 'bob.student@university.edu', '$2b$10$rKvVPZhQXZhQXZhQXZhQXe', 'student', 'Bob', 'Smith', '555-0102', true),
('33333333-3333-3333-3333-333333333333', 'carol.student@university.edu', '$2b$10$rKvVPZhQXZhQXZhQXZhQXe', 'student', 'Carol', 'Davis', '555-0103', true),

-- Providers
('44444444-4444-4444-4444-444444444444', 'dining.hall@university.edu', '$2b$10$rKvVPZhQXZhQXZhQXZhQXe', 'provider', 'Campus', 'Dining', '555-0201', true),
('55555555-5555-5555-5555-555555555555', 'pizza.place@restaurant.com', '$2b$10$rKvVPZhQXZhQXZhQXZhQXe', 'provider', 'Pizza', 'Palace', '555-0202', true),
('66666666-6666-6666-6666-666666666666', 'student.club@university.edu', '$2b$10$rKvVPZhQXZhQXZhQXZhQXe', 'provider', 'Student', 'Club', '555-0203', true),

-- Admin
('77777777-7777-7777-7777-777777777777', 'admin@university.edu', '$2b$10$rKvVPZhQXZhQXZhQXZhQXe', 'admin', 'Admin', 'User', '555-0301', true);

-- ============================================================================
-- USER PREFERENCES
-- ============================================================================

INSERT INTO user_preferences (user_id, dietary_restrictions, allergens, favorite_cuisines, preferred_providers, notification_preferences) VALUES
('11111111-1111-1111-1111-111111111111', 
 ARRAY['vegetarian'], 
 ARRAY['peanuts'], 
 ARRAY['italian', 'mexican'], 
 ARRAY['44444444-4444-4444-4444-444444444444']::UUID[],
 '{"email": true, "push": true}'::JSONB),

('22222222-2222-2222-2222-222222222222', 
 ARRAY['vegan', 'gluten-free'], 
 ARRAY['dairy', 'gluten'], 
 ARRAY['asian', 'mediterranean'], 
 ARRAY['55555555-5555-5555-5555-555555555555']::UUID[],
 '{"email": true, "push": false}'::JSONB),

('33333333-3333-3333-3333-333333333333', 
 ARRAY[]::TEXT[], 
 ARRAY['shellfish'], 
 ARRAY['american', 'italian'], 
 ARRAY[]::UUID[],
 '{"email": false, "push": true}'::JSONB);

-- ============================================================================
-- PROVIDER PROFILES
-- ============================================================================

INSERT INTO provider_profiles (user_id, organization_name, organization_type, description, location, contact_email, contact_phone, operating_hours, is_verified) VALUES
('44444444-4444-4444-4444-444444444444',
 'Campus Dining Hall',
 'dining_hall',
 'Main campus dining facility serving breakfast, lunch, and dinner',
 'Student Center, Building A',
 'dining.hall@university.edu',
 '555-0201',
 '{"monday": "7:00-20:00", "tuesday": "7:00-20:00", "wednesday": "7:00-20:00", "thursday": "7:00-20:00", "friday": "7:00-20:00", "saturday": "9:00-18:00", "sunday": "9:00-18:00"}'::JSONB,
 true),

('55555555-5555-5555-5555-555555555555',
 'Pizza Palace',
 'restaurant',
 'Local pizzeria offering student discounts and surplus food donations',
 '123 College Ave',
 'pizza.place@restaurant.com',
 '555-0202',
 '{"monday": "11:00-22:00", "tuesday": "11:00-22:00", "wednesday": "11:00-22:00", "thursday": "11:00-23:00", "friday": "11:00-23:00", "saturday": "11:00-23:00", "sunday": "12:00-21:00"}'::JSONB,
 true),

('66666666-6666-6666-6666-666666666666',
 'International Student Club',
 'club',
 'Student organization hosting cultural events with food',
 'Student Activities Center',
 'student.club@university.edu',
 '555-0203',
 '{"monday": "18:00-21:00", "wednesday": "18:00-21:00", "friday": "18:00-21:00"}'::JSONB,
 true);

-- ============================================================================
-- FOOD LISTINGS
-- ============================================================================

INSERT INTO food_listings (id, provider_id, title, description, category, cuisine_type, dietary_tags, allergen_info, quantity_available, quantity_reserved, original_price, discounted_price, pickup_location, available_from, available_until, status) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 '44444444-4444-4444-4444-444444444444',
 'Vegetarian Pasta Bowl',
 'Fresh pasta with marinara sauce and vegetables',
 'meal',
 'italian',
 ARRAY['vegetarian'],
 ARRAY['gluten', 'dairy'],
 15,
 3,
 8.50,
 3.00,
 'Campus Dining Hall - Pickup Counter',
 NOW() - INTERVAL '1 hour',
 NOW() + INTERVAL '3 hours',
 'active'),

('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
 '55555555-5555-5555-5555-555555555555',
 'Cheese Pizza Slices',
 'End of day pizza slices, still fresh and hot',
 'meal',
 'italian',
 ARRAY['vegetarian'],
 ARRAY['gluten', 'dairy'],
 20,
 5,
 3.50,
 1.00,
 'Pizza Palace - Front Counter',
 NOW(),
 NOW() + INTERVAL '2 hours',
 'active'),

('cccccccc-cccc-cccc-cccc-cccccccccccc',
 '66666666-6666-6666-6666-666666666666',
 'Cultural Night Leftovers',
 'Assorted dishes from International Night event',
 'event_food',
 'asian',
 ARRAY['vegan'],
 ARRAY['soy'],
 10,
 0,
 0.00,
 0.00,
 'Student Activities Center - Room 201',
 NOW() + INTERVAL '30 minutes',
 NOW() + INTERVAL '4 hours',
 'active');

-- ============================================================================
-- RESERVATIONS
-- ============================================================================

INSERT INTO reservations (id, listing_id, user_id, quantity, status, pickup_time, confirmation_code) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd',
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 '11111111-1111-1111-1111-111111111111',
 2,
 'confirmed',
 NOW() + INTERVAL '1 hour',
 'ABC123'),

('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
 '22222222-2222-2222-2222-222222222222',
 3,
 'confirmed',
 NOW() + INTERVAL '30 minutes',
 'XYZ789');

-- ============================================================================
-- PANTRY INVENTORY
-- ============================================================================

INSERT INTO pantry_inventory (item_name, category, quantity, unit, expiration_date, dietary_tags, allergen_info, location, reorder_threshold) VALUES
('Canned Black Beans', 'canned_goods', 45, 'can', '2027-12-31', ARRAY['vegan', 'gluten-free'], ARRAY[]::TEXT[], 'Shelf A1', 15),
('Pasta - Penne', 'dry_goods', 30, 'box', '2026-06-30', ARRAY['vegan'], ARRAY['gluten'], 'Shelf B2', 10),
('Rice - White', 'dry_goods', 50, 'lb', '2027-01-31', ARRAY['vegan', 'gluten-free'], ARRAY[]::TEXT[], 'Shelf B1', 20),
('Peanut Butter', 'dry_goods', 25, 'jar', '2026-09-30', ARRAY['vegetarian'], ARRAY['peanuts'], 'Shelf C3', 10),
('Canned Tomatoes', 'canned_goods', 60, 'can', '2027-08-31', ARRAY['vegan', 'gluten-free'], ARRAY[]::TEXT[], 'Shelf A2', 20),
('Oatmeal', 'dry_goods', 40, 'box', '2026-12-31', ARRAY['vegan'], ARRAY['gluten'], 'Shelf B3', 15),
('Granola Bars', 'snacks', 100, 'bar', '2026-07-31', ARRAY['vegetarian'], ARRAY['nuts', 'gluten'], 'Shelf D1', 30),
('Apple Juice', 'beverages', 35, 'bottle', '2026-05-31', ARRAY['vegan', 'gluten-free'], ARRAY[]::TEXT[], 'Shelf E1', 15);

-- ============================================================================
-- PANTRY APPOINTMENTS
-- ============================================================================

INSERT INTO pantry_appointments (id, user_id, appointment_time, duration_minutes, status) VALUES
('ffffffff-ffff-ffff-ffff-ffffffffffff',
 '11111111-1111-1111-1111-111111111111',
 NOW() + INTERVAL '2 days',
 30,
 'scheduled'),

('gggggggg-gggg-gggg-gggg-gggggggggggg',
 '33333333-3333-3333-3333-333333333333',
 NOW() + INTERVAL '3 days',
 30,
 'scheduled');

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id, is_read) VALUES
('11111111-1111-1111-1111-111111111111',
 'reservation_confirmed',
 'Reservation Confirmed',
 'Your reservation for Vegetarian Pasta Bowl has been confirmed. Pickup code: ABC123',
 'reservation',
 'dddddddd-dddd-dddd-dddd-dddddddddddd',
 false),

('22222222-2222-2222-2222-222222222222',
 'new_listing',
 'New Food Available',
 'Pizza Palace has posted new surplus food: Cheese Pizza Slices',
 'listing',
 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
 false),

('11111111-1111-1111-1111-111111111111',
 'appointment_reminder',
 'Pantry Appointment Reminder',
 'Your pantry appointment is scheduled for tomorrow at 2:00 PM',
 'appointment',
 'ffffffff-ffff-ffff-ffff-ffffffffffff',
 false);

-- ============================================================================
-- DINING DEALS
-- ============================================================================

INSERT INTO dining_deals (provider_id, title, description, discount_percentage, valid_from, valid_until, max_redemptions, current_redemptions, is_active) VALUES
('55555555-5555-5555-5555-555555555555',
 'Student Tuesday Special',
 'Get 20% off any large pizza every Tuesday',
 20.00,
 NOW() - INTERVAL '7 days',
 NOW() + INTERVAL '30 days',
 100,
 15,
 true),

('44444444-4444-4444-4444-444444444444',
 'Late Night Discount',
 'All meals 50% off after 7 PM',
 50.00,
 NOW() - INTERVAL '1 day',
 NOW() + INTERVAL '60 days',
 NULL,
 45,
 true);

-- ============================================================================
-- VOLUNTEER SHIFTS
-- ============================================================================

INSERT INTO volunteer_shifts (title, description, shift_date, start_time, end_time, location, slots_available, slots_filled) VALUES
('Pantry Stocking',
 'Help organize and stock pantry shelves',
 CURRENT_DATE + INTERVAL '5 days',
 '14:00',
 '16:00',
 'Campus Food Pantry',
 5,
 2),

('Food Pickup Coordination',
 'Assist with coordinating food pickups from dining hall',
 CURRENT_DATE + INTERVAL '7 days',
 '18:00',
 '20:00',
 'Campus Dining Hall',
 3,
 1);

-- ============================================================================
-- VOLUNTEER SIGNUPS
-- ============================================================================

INSERT INTO volunteer_signups (shift_id, user_id, status) 
SELECT vs.id, '11111111-1111-1111-1111-111111111111', 'signed_up'
FROM volunteer_shifts vs
WHERE vs.title = 'Pantry Stocking';

INSERT INTO volunteer_signups (shift_id, user_id, status)
SELECT vs.id, '22222222-2222-2222-2222-222222222222', 'signed_up'
FROM volunteer_shifts vs
WHERE vs.title = 'Pantry Stocking';

-- ============================================================================
-- AI CONVERSATION HISTORY (Sample)
-- ============================================================================

INSERT INTO ai_conversation_history (user_id, message_role, message_content, tool_calls) VALUES
('11111111-1111-1111-1111-111111111111',
 'user',
 'Show me vegetarian food available today',
 NULL),

('11111111-1111-1111-1111-111111111111',
 'assistant',
 'I found 2 vegetarian options available today. Would you like to reserve any?',
 '{"tool": "search_food_listings", "parameters": {"dietary_tags": ["vegetarian"]}}'::JSONB),

('22222222-2222-2222-2222-222222222222',
 'user',
 'Book a pantry appointment for next week',
 NULL),

('22222222-2222-2222-2222-222222222222',
 'assistant',
 'I can help you book a pantry appointment. What day and time works best for you?',
 NULL);

-- ============================================================================
-- USER ACTIVITY LOG
-- ============================================================================

INSERT INTO user_activity_log (user_id, activity_type, entity_type, entity_id, metadata) VALUES
('11111111-1111-1111-1111-111111111111',
 'reservation_created',
 'reservation',
 'dddddddd-dddd-dddd-dddd-dddddddddddd',
 '{"listing_title": "Vegetarian Pasta Bowl", "quantity": 2}'::JSONB),

('22222222-2222-2222-2222-222222222222',
 'listing_viewed',
 'listing',
 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
 '{"listing_title": "Cheese Pizza Slices"}'::JSONB),

('11111111-1111-1111-1111-111111111111',
 'appointment_scheduled',
 'appointment',
 'ffffffff-ffff-ffff-ffff-ffffffffffff',
 '{"appointment_time": "2026-03-12 14:00:00"}'::JSONB);

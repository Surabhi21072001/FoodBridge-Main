-- FoodBridge AI Platform - PostgreSQL Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USER MANAGEMENT
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'provider', 'admin')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- USER PREFERENCES & AI CONTEXT
-- ============================================================================

CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dietary_restrictions TEXT[], -- ['vegetarian', 'gluten-free', 'halal', etc.]
    allergens TEXT[], -- ['peanuts', 'dairy', 'shellfish', etc.]
    favorite_cuisines TEXT[], -- ['italian', 'mexican', 'asian', etc.]
    preferred_providers UUID[], -- Array of provider user IDs
    notification_preferences JSONB DEFAULT '{"email": true, "push": true}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE TABLE ai_conversation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_role VARCHAR(20) NOT NULL CHECK (message_role IN ('user', 'assistant', 'system')),
    message_content TEXT NOT NULL,
    tool_calls JSONB, -- Stores function calls made by AI
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_history_user ON ai_conversation_history(user_id, created_at DESC);

-- ============================================================================
-- PROVIDER PROFILES
-- ============================================================================

CREATE TABLE provider_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_name VARCHAR(255) NOT NULL,
    organization_type VARCHAR(50) NOT NULL CHECK (organization_type IN ('dining_hall', 'restaurant', 'club', 'event_organizer', 'other')),
    description TEXT,
    location VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    operating_hours JSONB, -- {"monday": "9:00-17:00", ...}
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX idx_provider_type ON provider_profiles(organization_type);

-- ============================================================================
-- FOOD LISTINGS
-- ============================================================================

CREATE TABLE food_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('meal', 'snack', 'beverage', 'pantry_item', 'deal', 'event_food')),
    cuisine_type VARCHAR(50),
    dietary_tags TEXT[], -- ['vegetarian', 'vegan', 'gluten-free', etc.]
    allergen_info TEXT[],
    quantity_available INTEGER NOT NULL CHECK (quantity_available >= 0),
    quantity_reserved INTEGER DEFAULT 0 CHECK (quantity_reserved >= 0),
    unit VARCHAR(20) DEFAULT 'serving', -- 'serving', 'item', 'lb', 'kg'
    original_price DECIMAL(10, 2),
    discounted_price DECIMAL(10, 2),
    pickup_location VARCHAR(255) NOT NULL,
    available_from TIMESTAMP NOT NULL,
    available_until TIMESTAMP NOT NULL,
    image_urls TEXT[],
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'reserved', 'completed', 'cancelled', 'expired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_quantity CHECK (quantity_reserved <= quantity_available),
    CONSTRAINT check_dates CHECK (available_until > available_from),
    CONSTRAINT check_price CHECK (discounted_price IS NULL OR discounted_price <= original_price)
);

CREATE INDEX idx_listings_provider ON food_listings(provider_id);
CREATE INDEX idx_listings_status ON food_listings(status);
CREATE INDEX idx_listings_available ON food_listings(available_from, available_until);
CREATE INDEX idx_listings_category ON food_listings(category);

-- ============================================================================
-- RESERVATIONS
-- ============================================================================

CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES food_listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'picked_up', 'cancelled', 'no_show')),
    pickup_time TIMESTAMP,
    confirmation_code VARCHAR(10) UNIQUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP,
    picked_up_at TIMESTAMP
);

CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_listing ON reservations(listing_id);
CREATE INDEX idx_reservations_status ON reservations(status);

-- ============================================================================
-- PANTRY MANAGEMENT
-- ============================================================================

CREATE TABLE pantry_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('canned_goods', 'dry_goods', 'fresh_produce', 'frozen', 'dairy', 'snacks', 'beverages', 'other')),
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    unit VARCHAR(20) DEFAULT 'item',
    expiration_date DATE,
    dietary_tags TEXT[],
    allergen_info TEXT[],
    location VARCHAR(100), -- Shelf/bin location
    reorder_threshold INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pantry_category ON pantry_inventory(category);
CREATE INDEX idx_pantry_expiration ON pantry_inventory(expiration_date);

CREATE TABLE pantry_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_time TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_appointments_user ON pantry_appointments(user_id);
CREATE INDEX idx_appointments_time ON pantry_appointments(appointment_time);
CREATE INDEX idx_appointments_status ON pantry_appointments(status);

CREATE TABLE pantry_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES pantry_appointments(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'cart' CHECK (status IN ('cart', 'submitted', 'prepared', 'picked_up', 'cancelled')),
    total_items INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    picked_up_at TIMESTAMP
);

CREATE INDEX idx_pantry_orders_user ON pantry_orders(user_id);
CREATE INDEX idx_pantry_orders_appointment ON pantry_orders(appointment_id);

CREATE TABLE pantry_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES pantry_orders(id) ON DELETE CASCADE,
    inventory_id UUID NOT NULL REFERENCES pantry_inventory(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order ON pantry_order_items(order_id);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('reservation_confirmed', 'reservation_reminder', 'appointment_reminder', 'new_listing', 'listing_expiring', 'system_alert')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(50), -- 'reservation', 'appointment', 'listing'
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- ============================================================================
-- DINING DEALS
-- ============================================================================

CREATE TABLE dining_deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_percentage DECIMAL(5, 2) CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    discount_amount DECIMAL(10, 2),
    terms_conditions TEXT,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    max_redemptions INTEGER,
    current_redemptions INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_deal_dates CHECK (valid_until > valid_from)
);

CREATE INDEX idx_deals_provider ON dining_deals(provider_id);
CREATE INDEX idx_deals_active ON dining_deals(is_active, valid_from, valid_until);

-- ============================================================================
-- VOLUNTEER COORDINATION
-- ============================================================================

CREATE TABLE volunteer_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    slots_available INTEGER NOT NULL CHECK (slots_available > 0),
    slots_filled INTEGER DEFAULT 0 CHECK (slots_filled >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_slots CHECK (slots_filled <= slots_available)
);

CREATE INDEX idx_shifts_date ON volunteer_shifts(shift_date);

CREATE TABLE volunteer_signups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id UUID NOT NULL REFERENCES volunteer_shifts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'signed_up' CHECK (status IN ('signed_up', 'confirmed', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(shift_id, user_id)
);

CREATE INDEX idx_signups_user ON volunteer_signups(user_id);
CREATE INDEX idx_signups_shift ON volunteer_signups(shift_id);

-- ============================================================================
-- ANALYTICS & TRACKING
-- ============================================================================

CREATE TABLE user_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_user ON user_activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_type ON user_activity_log(activity_type);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_profiles_updated_at BEFORE UPDATE ON provider_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_listings_updated_at BEFORE UPDATE ON food_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pantry_inventory_updated_at BEFORE UPDATE ON pantry_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pantry_appointments_updated_at BEFORE UPDATE ON pantry_appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pantry_orders_updated_at BEFORE UPDATE ON pantry_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dining_deals_updated_at BEFORE UPDATE ON dining_deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteer_shifts_updated_at BEFORE UPDATE ON volunteer_shifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteer_signups_updated_at BEFORE UPDATE ON volunteer_signups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

# FoodBridge AI Database Schema Documentation

## Overview

This PostgreSQL database schema supports the FoodBridge AI platform, which connects students with surplus food on campus through food listings, pantry bookings, and an AI assistant.

## Entity Relationship Diagram (Conceptual)

```
users (1) ──── (1) user_preferences
  │
  ├── (1) ──── (0..1) provider_profiles
  │
  ├── (1) ──── (*) food_listings
  │
  ├── (1) ──── (*) reservations
  │
  ├── (1) ──── (*) pantry_appointments
  │
  ├── (1) ──── (*) pantry_orders
  │
  ├── (1) ──── (*) notifications
  │
  ├── (1) ──── (*) volunteer_signups
  │
  └── (1) ──── (*) ai_conversation_history

food_listings (1) ──── (*) reservations

pantry_appointments (1) ──── (0..1) pantry_orders

pantry_orders (1) ──── (*) pantry_order_items ──── (*) pantry_inventory

volunteer_shifts (1) ──── (*) volunteer_signups
```

## Core Tables

### 1. User Management

#### `users`
Central user table supporting three roles: student, provider, and admin.

**Key Fields:**
- `role`: Enum constraint ensures valid roles
- `email`: Unique identifier for authentication
- `password_hash`: Stores bcrypt/argon2 hashed passwords
- `is_active`: Soft delete flag

**Indexes:**
- Email lookup for authentication
- Role filtering for authorization

#### `user_preferences`
Stores user dietary restrictions, allergens, and notification settings for AI personalization.

**Key Fields:**
- `dietary_restrictions`: Array of dietary preferences (vegetarian, vegan, etc.)
- `allergens`: Array of allergens to avoid
- `favorite_cuisines`: Used by AI for recommendations
- `preferred_providers`: Array of provider UUIDs for personalized suggestions
- `notification_preferences`: JSONB for flexible notification settings

#### `ai_conversation_history`
Maintains conversation context for the AI assistant.

**Key Fields:**
- `message_role`: user, assistant, or system
- `tool_calls`: JSONB storing function calls and parameters
- Indexed by user_id and timestamp for efficient retrieval

### 2. Provider Management

#### `provider_profiles`
Extended profile information for food providers (dining halls, restaurants, clubs).

**Key Fields:**
- `organization_type`: Categorizes provider type
- `operating_hours`: JSONB for flexible schedule storage
- `is_verified`: Admin verification flag
- One-to-one relationship with users table

### 3. Food Listings & Reservations

#### `food_listings`
Core table for surplus food donations and deals.

**Key Fields:**
- `category`: meal, snack, pantry_item, deal, event_food
- `dietary_tags` & `allergen_info`: Arrays for filtering
- `quantity_available` & `quantity_reserved`: Inventory tracking
- `status`: Lifecycle management (active → reserved → completed)
- `available_from/until`: Time-based availability

**Constraints:**
- Reserved quantity cannot exceed available
- Discounted price must be ≤ original price
- Available_until must be after available_from

**Indexes:**
- Provider lookup
- Status filtering
- Time-based queries
- Category filtering

#### `reservations`
Tracks student reservations for food listings.

**Key Fields:**
- `confirmation_code`: Unique pickup verification code
- `status`: pending → confirmed → picked_up
- `pickup_time`: Scheduled pickup window
- Timestamps for lifecycle tracking

### 4. Pantry System

#### `pantry_inventory`
Tracks food pantry stock levels.

**Key Fields:**
- `category`: Organized by food type
- `quantity` & `unit`: Flexible quantity tracking
- `expiration_date`: For freshness management
- `reorder_threshold`: Automatic low-stock alerts
- `location`: Physical storage location

#### `pantry_appointments`
Scheduled pantry visit slots.

**Key Fields:**
- `appointment_time` & `duration_minutes`: Scheduling
- `status`: scheduled → confirmed → completed
- Prevents double-booking through time-based queries

#### `pantry_orders`
Shopping cart and order management for pantry visits.

**Key Fields:**
- `appointment_id`: Optional link to scheduled visit
- `status`: cart → submitted → prepared → picked_up
- Supports both pre-scheduled and walk-in orders

#### `pantry_order_items`
Line items for pantry orders.

**Relationships:**
- Links orders to inventory items
- Tracks quantity per item

### 5. Notifications

#### `notifications`
User notification system for reservations, appointments, and alerts.

**Key Fields:**
- `type`: Categorizes notification purpose
- `related_entity_type/id`: Links to source entity
- `is_read`: Read status tracking
- Indexed for efficient unread queries

### 6. Dining Deals

#### `dining_deals`
Special offers and promotions from providers.

**Key Fields:**
- `discount_percentage` or `discount_amount`: Flexible discount types
- `valid_from/until`: Time-limited offers
- `max_redemptions` & `current_redemptions`: Usage tracking
- `is_active`: Enable/disable flag

### 7. Volunteer Coordination

#### `volunteer_shifts`
Available volunteer opportunities.

**Key Fields:**
- `shift_date`, `start_time`, `end_time`: Scheduling
- `slots_available` & `slots_filled`: Capacity management

#### `volunteer_signups`
User registrations for volunteer shifts.

**Constraints:**
- Unique constraint prevents double signup
- Slots_filled cannot exceed slots_available

### 8. Analytics

#### `user_activity_log`
Tracks user interactions for analytics and AI learning.

**Key Fields:**
- `activity_type`: Categorizes action
- `entity_type/id`: Links to affected entity
- `metadata`: JSONB for flexible data storage

## Key Design Decisions

### 1. UUID Primary Keys
- Globally unique identifiers
- Better for distributed systems
- Prevents ID enumeration attacks

### 2. Array Types for Tags
- PostgreSQL native array support
- Efficient for dietary tags, allergens, cuisines
- Supports GIN indexes for fast searches

### 3. JSONB for Flexible Data
- Operating hours vary by provider
- Notification preferences evolve
- Tool calls have variable structure
- Metadata needs flexibility

### 4. Soft Deletes
- `is_active` flag on users
- Preserves historical data
- Maintains referential integrity

### 5. Timestamp Tracking
- `created_at` on all tables
- `updated_at` with automatic triggers
- Lifecycle timestamps (cancelled_at, picked_up_at)

### 6. Status Enums
- Enforces valid state transitions
- Self-documenting workflow
- Prevents invalid data

### 7. Check Constraints
- Quantity validation
- Date range validation
- Price validation
- Ensures data integrity at database level

## Indexes Strategy

### Performance Optimization
- Foreign key columns indexed
- Frequently filtered columns (status, role, category)
- Time-based queries (created_at, appointment_time)
- Composite indexes for common query patterns

### Query Patterns Supported
- User lookup by email (authentication)
- Active listings by category and time
- User reservations and appointments
- Unread notifications
- Available volunteer shifts

## Security Considerations

1. **Password Storage**: Only hashed passwords stored
2. **Role-Based Access**: Role column for authorization
3. **Soft Deletes**: Preserve audit trail
4. **Unique Constraints**: Prevent duplicate signups/reservations
5. **Foreign Key Cascades**: Maintain referential integrity

## Migration Strategy

### Initial Setup
```bash
psql -U postgres -c "CREATE DATABASE foodbridge;"
psql -U postgres -d foodbridge -f database/schema.sql
```

### Future Migrations
- Use migration tool (Flyway, Liquibase, or framework-specific)
- Version control all schema changes
- Test migrations on staging before production

## Sample Queries

### Find available food listings for vegetarian student
```sql
SELECT fl.* 
FROM food_listings fl
WHERE fl.status = 'active'
  AND fl.available_from <= NOW()
  AND fl.available_until >= NOW()
  AND 'vegetarian' = ANY(fl.dietary_tags)
  AND fl.quantity_available > fl.quantity_reserved;
```

### Get user's upcoming appointments
```sql
SELECT pa.* 
FROM pantry_appointments pa
WHERE pa.user_id = $1
  AND pa.appointment_time > NOW()
  AND pa.status IN ('scheduled', 'confirmed')
ORDER BY pa.appointment_time ASC;
```

### Check pantry items needing reorder
```sql
SELECT * 
FROM pantry_inventory
WHERE quantity <= reorder_threshold
ORDER BY quantity ASC;
```

### Get unread notifications for user
```sql
SELECT * 
FROM notifications
WHERE user_id = $1 
  AND is_read = false
ORDER BY created_at DESC;
```

## Future Enhancements

1. **Full-Text Search**: Add GIN indexes on text fields for better search
2. **Geospatial**: Add PostGIS for location-based queries
3. **Partitioning**: Partition activity_log by date for performance
4. **Materialized Views**: Cache complex aggregations
5. **Audit Tables**: Track all data changes for compliance

# Implementation Plan: FoodBridge AI Platform

## Overview

This implementation plan breaks down the FoodBridge AI platform into discrete coding tasks organized into five phases. The platform will be built using TypeScript for the backend API, PostgreSQL for the database, and a modern frontend framework. The AI agent will use OpenAI or Anthropic's API with function calling capabilities.

## Implementation Phases

The implementation follows a strict phased approach to ensure the AI agent and backend are fully functional before frontend development:

### Phase 1: Database Foundation
Set up the database schema, migrations, and core data layer.

### Phase 2: Backend APIs
Implement all backend services, API endpoints, and business logic.

### Phase 3: AI Agent Integration
Build the AI agent with LLM integration, tool execution, and conversational capabilities.

### Phase 4: Frontend Interface
Develop the web application UI after backend and AI agent are complete.

### Phase 5: Testing & Deployment
Comprehensive testing and production deployment preparation.

## Key Features

- Pagination for search and listing endpoints to handle large datasets efficiently
- Image storage strategy with support for AWS S3, Supabase Storage, or local file storage
- Smart pantry cart integration with inventory to recommend only in-stock items
- Rate limiting for AI chat endpoint to prevent abuse (20 requests per minute per user)
- System health check endpoint for monitoring database and AI service availability
- Structured project directory (controllers, services, repositories, routes, middleware, agents, prompts, websocket, utils)
- Environment variable validation on startup with comprehensive configuration
- Admin role added for pantry inventory management (separate from Student and Provider roles)

---

# PHASE 1: DATABASE FOUNDATION

## Tasks

- [x] 1. Project setup and infrastructure
  - [x] 1.1 Initialize TypeScript Node.js project
    - [x] Run `npm init -y` to create package.json
    - [x] Install core dependencies:
      - `npm install express cors helmet dotenv`
      - `npm install pg` (PostgreSQL client)
      - `npm install jsonwebtoken bcrypt`
    - [x] Install TypeScript and dev dependencies:
      - `npm install -D typescript @types/node @types/express @types/cors @types/jsonwebtoken @types/bcrypt`
      - `npm install -D ts-node nodemon`
    - [x] Create tsconfig.json with configuration:
      - target: ES2020
      - module: commonjs
      - outDir: ./dist
      - rootDir: ./src
      - strict: true
      - esModuleInterop: true
    - [x] Set up ESLint:
      - `npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin`
      - Create .eslintrc.json with TypeScript rules
    - [x] Set up Prettier:
      - `npm install -D prettier eslint-config-prettier`
      - Create .prettierrc with formatting rules
    - [x] Initialize testing frameworks:
      - `npm install -D jest @types/jest ts-jest`
      - Create jest.config.js
      - Add test scripts to package.json
    - [x] Create .gitignore (node_modules, dist, .env)
    - [x] Add npm scripts to package.json:
      - "dev": "nodemon src/index.ts"
      - "build": "tsc"
      - "start": "node dist/index.js"
      - "test": "jest"
      - "lint": "eslint src/**/*.ts"
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [x] 1.2 Define project directory structure
    - [x] Create src/ directory
    - [x] Create src/controllers/ for request handlers
      - Create src/controllers/auth.controller.ts
      - Create src/controllers/listing.controller.ts
      - Create src/controllers/reservation.controller.ts
      - Create src/controllers/pantry.controller.ts
      - Create src/controllers/chat.controller.ts
    - [x] Create src/services/ for business logic
      - Create src/services/auth.service.ts
      - Create src/services/listing.service.ts
      - Create src/services/reservation.service.ts
      - Create src/services/pantry.service.ts
      - Create src/services/preference.service.ts
      - Create src/services/notification.service.ts
    - [x] Create src/repositories/ for database access layer
      - Create src/repositories/user.repository.ts
      - Create src/repositories/listing.repository.ts
      - Create src/repositories/reservation.repository.ts
      - Create src/repositories/pantry.repository.ts
    - [x] Create src/routes/ for API route definitions
      - Create src/routes/index.ts (main router)
      - Create src/routes/auth.routes.ts
      - Create src/routes/listing.routes.ts
      - Create src/routes/reservation.routes.ts
      - Create src/routes/pantry.routes.ts
      - Create src/routes/chat.routes.ts
    - [x] Create src/middleware/ for cross-cutting concerns
      - Create src/middleware/auth.middleware.ts
      - Create src/middleware/validation.middleware.ts
      - Create src/middleware/error.middleware.ts
      - Create src/middleware/rateLimit.middleware.ts
    - [ ] Create src/agents/ for AI agent logic
      - Create src/agents/tools/ for tool definitions
      - Create src/agents/llm.service.ts
      - Create src/agents/session.service.ts
    - [ ] Create src/prompts/ for LLM prompt templates
    - [ ] Create src/websocket/ for real-time updates
      - Create src/websocket/server.ts
      - Create src/websocket/handlers.ts
    - [ ] Create src/utils/ for shared utilities
      - Create src/utils/logger.ts
      - Create src/utils/database.ts
      - Create src/utils/storage.ts
    - [ ] Create src/types/ for TypeScript type definitions
      - Create src/types/user.types.ts
      - Create src/types/listing.types.ts
      - Create src/types/agent.types.ts
    - [ ] Create src/config/ for configuration
      - Create src/config/database.config.ts
      - Create src/config/storage.config.ts
    - [ ] Create src/index.ts as application entry point
    - _Requirements: 11.1_
  
  - [x] 1.3 Configure database connection
    -[x] Install pg (PostgreSQL client): `npm install pg`
    - [x] Install types: `npm install -D @types/pg`
    - [x] Create src/config/database.config.ts:
      - Import Pool from 'pg'
      - Read DATABASE_URL from environment
      - Configure connection pool with max 20 connections
      - Set idle timeout to 30 seconds
      - Set connection timeout to 10 seconds
    - [x] Create src/utils/database.ts:
      - Export pool instance
      - Create query helper function with error handling
      - Create transaction helper function
      - Add connection health check function
    - [x] Test database connection on application startup
    - [x] Log connection success/failure
    - [x] Implement graceful shutdown (close pool on SIGTERM)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [x] 1.4 Set up environment configuration
    - [x] Install dotenv: `npm install dotenv`
    - [x] Create .env.example file with all required variables:
      ```
      DATABASE_URL=postgresql://user:password@localhost:5432/foodbridge
      JWT_SECRET=your-secret-key-here
      OPENAI_API_KEY=sk-...
      STORAGE_TYPE=local
      STORAGE_BUCKET=uploads
      WEBSOCKET_PORT=3001
      RATE_LIMIT_CHAT_REQUESTS=20
      RATE_LIMIT_CHAT_WINDOW_MS=60000
      PORT=3000
      NODE_ENV=development
      ```
    - [x] Create .env file (copy from .env.example)
    - [x] Create src/config/env.config.ts:
      - Import dotenv and call config()
      - Define interface for environment variables
      - Create validation function for required variables
      - Export typed environment object
    - [x] Implement environment variable validation:
      - Check DATABASE_URL is valid PostgreSQL connection string
      - Check JWT_SECRET is at least 32 characters
      - Check STORAGE_TYPE is one of: s3, supabase, local
      - Check API keys are present based on configuration
      - Validate numeric values (ports, rate limits)
    - [x] Call validation function in src/index.ts before starting server
    - [x] Fail fast with clear error message if validation fails
    - [x] Log loaded configuration (mask sensitive values)
    - _Requirements: 11.1_

- [x] 2. Database schema and migrations
  - [x] 2.1 Create database migration system
    - [x] Install migration tool: `npm install node-pg-migrate`
    - [x] Install types: `npm install -D @types/node-pg-migrate`
    - [x] Create migrations/ directory in project root
    - [x] Create database.json configuration file:
      - Set database URL from environment
      - Configure migrations directory
      - Set migration table name
    - [x] Add migration scripts to package.json:
      - "migrate:create": "node-pg-migrate create"
      - "migrate:up": "node-pg-migrate up"
      - "migrate:down": "node-pg-migrate down"
    - [x] Create initial migration: `npm run migrate:create initial-schema`
    - _Requirements: 11.1, 11.5_
  
  - [x] 2.2 Implement database schema
    -[x] Create users table migration:
      - user_id UUID PRIMARY KEY DEFAULT gen_random_uuid()
      - email VARCHAR(255) UNIQUE NOT NULL
      - password_hash VARCHAR(255) NOT NULL
      - role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'provider', 'admin'))
      - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - Add index on email
    - [x] Create user_profiles table migration:
      - profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid()
      - user_id UUID REFERENCES users(user_id) ON DELETE CASCADE
      - dietary_preferences TEXT[]
      - allergies TEXT[]
      - preferred_food_types TEXT[]
      - notification_preferences JSONB DEFAULT '{}'
      - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - Add unique index on user_id
    - [x] Create food_listings table migration:
      - listing_id UUID PRIMARY KEY DEFAULT gen_random_uuid()
      - provider_id UUID REFERENCES users(user_id) ON DELETE CASCADE
      - food_name VARCHAR(255) NOT NULL
      - description TEXT
      - quantity INTEGER NOT NULL CHECK (quantity >= 0)
      - available_quantity INTEGER NOT NULL CHECK (available_quantity >= 0)
      - location VARCHAR(255) NOT NULL
      - pickup_window_start TIMESTAMP NOT NULL
      - pickup_window_end TIMESTAMP NOT NULL
      - food_type VARCHAR(50)
      - dietary_tags TEXT[]
      - image_url TEXT
      - listing_type VARCHAR(20) DEFAULT 'donation' CHECK (listing_type IN ('donation', 'event', 'dining_deal'))
      - status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'completed', 'unavailable'))
      - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - CONSTRAINT valid_pickup_window CHECK (pickup_window_end > pickup_window_start)
      - Add index on status
      - Add index on pickup_window_start
      - Add composite index on (status, pickup_window_start)
      - Add index on provider_id
      - Add index on listing_type
      - Add index on created_at for pagination
    - [x] Create reservations table migration:
      - reservation_id UUID PRIMARY KEY DEFAULT gen_random_uuid()
      - listing_id UUID REFERENCES food_listings(listing_id) ON DELETE CASCADE
      - student_id UUID REFERENCES users(user_id) ON DELETE CASCADE
      - quantity INTEGER NOT NULL CHECK (quantity > 0)
      - status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed'))
      - pickup_confirmed BOOLEAN DEFAULT FALSE
      - pickup_confirmed_at TIMESTAMP
      - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - UNIQUE(listing_id, student_id)
      - Add index on student_id
      - Add index on listing_id
      - Add index on status
    - [x] Create pantry_slots table migration:
      - slot_id UUID PRIMARY KEY DEFAULT gen_random_uuid()
      - slot_time TIMESTAMP NOT NULL UNIQUE
      - is_booked BOOLEAN DEFAULT FALSE
      - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - Add index on slot_time
      - Add index on is_booked
    - [x] Create pantry_appointments table migration:
      - appointment_id UUID PRIMARY KEY DEFAULT gen_random_uuid()
      - student_id UUID REFERENCES users(user_id) ON DELETE CASCADE
      - slot_id UUID REFERENCES pantry_slots(slot_id) ON DELETE CASCADE
      - status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled'))
      - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - Add index on student_id
      - Add index on slot_id
      - Add index on status
    - [x] Create pantry_orders table migration:
      - order_id UUID PRIMARY KEY DEFAULT gen_random_uuid()
      - student_id UUID REFERENCES users(user_id) ON DELETE CASCADE
      - appointment_id UUID REFERENCES pantry_appointments(appointment_id) ON DELETE SET NULL
      - items JSONB NOT NULL
      - status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled'))
      - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - Add index on student_id
      - Add index on appointment_id
    - [x] Create pantry_inventory table migration:
      - item_id UUID PRIMARY KEY DEFAULT gen_random_uuid()
      - item_name VARCHAR(255) NOT NULL
      - category VARCHAR(100)
      - quantity INTEGER NOT NULL CHECK (quantity >= 0)
      - in_stock BOOLEAN GENERATED ALWAYS AS (quantity > 0) STORED
      - unit VARCHAR(50)
      - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - Add index on item_name
      - Add index on in_stock
      - Add index on category
    - [x] Create notifications table migration:
      - notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid()
      - user_id UUID REFERENCES users(user_id) ON DELETE CASCADE
      - type VARCHAR(50) NOT NULL
      - message TEXT NOT NULL
      - is_read BOOLEAN DEFAULT FALSE
      - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - Add index on user_id
      - Add index on created_at
      - Add composite index on (user_id, is_read)
    - [x] Create preference_history table migration:
      - history_id UUID PRIMARY KEY DEFAULT gen_random_uuid()
      - user_id UUID REFERENCES users(user_id) ON DELETE CASCADE
      - event_type VARCHAR(50) NOT NULL
      - event_data JSONB NOT NULL
      - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - Add index on user_id
      - Add index on event_type
      - Add composite index on (user_id, event_type)
    - [x] Create volunteer_opportunities table migration:
      - opportunity_id UUID PRIMARY KEY DEFAULT gen_random_uuid()
      - title VARCHAR(255) NOT NULL
      - description TEXT
      - max_volunteers INTEGER NOT NULL
      - current_volunteers INTEGER DEFAULT 0
      - event_date TIMESTAMP NOT NULL
      - status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'completed'))
      - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - Add index on status
      - Add index on event_date
    - [x] Create volunteer_participation table migration:
      - participation_id UUID PRIMARY KEY DEFAULT gen_random_uuid()
      - opportunity_id UUID REFERENCES volunteer_opportunities(opportunity_id) ON DELETE CASCADE
      - student_id UUID REFERENCES users(user_id) ON DELETE CASCADE
      - status VARCHAR(20) DEFAULT 'signed_up' CHECK (status IN ('signed_up', 'completed', 'cancelled'))
      - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - UNIQUE(opportunity_id, student_id)
      - Add index on student_id
      - Add index on opportunity_id
    - [x] Create conversation_sessions table migration:
      - session_id UUID PRIMARY KEY DEFAULT gen_random_uuid()
      - user_id UUID REFERENCES users(user_id) ON DELETE CASCADE
      - messages JSONB NOT NULL DEFAULT '[]'
      - last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - Add index on user_id
      - Add index on last_activity
    - [x] Create agent_logs table migration:
      - log_id UUID PRIMARY KEY DEFAULT gen_random_uuid()
      - user_id UUID REFERENCES users(user_id) ON DELETE SET NULL
      - session_id UUID REFERENCES conversation_sessions(session_id) ON DELETE SET NULL
      - query TEXT
      - tool_calls JSONB
      - response TEXT
      - execution_time_ms INTEGER
      - error TEXT
      - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - Add index on user_id
      - Add index on session_id
      - Add index on created_at
    - [x] Run migrations: `npm run migrate:up`
    - [x] Verify all tables created successfully
    - [x] Verify all indexes created
    - [x] Verify all foreign key constraints
    - _Requirements: 11.1, 11.5_


- [x] 3. Checkpoint - Database foundation complete
  - Verify all migrations run successfully
  - Verify database schema matches design
  - Test database connection and queries
  - Ask the user if questions arise

---

# PHASE 2: BACKEND APIs

- [x] 4. Authentication and authorization system
  - [x] 4.1 Implement authentication service
    - Create user registration endpoint with password hashing (bcrypt)
    - Create login endpoint with JWT token generation
    - Create logout endpoint
    - Create "get current user" endpoint
    - Implement password validation rules
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x]* 4.2 Write unit tests for authentication
    - Test user registration with different roles
    - Test login with valid and invalid credentials
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 4.3 Implement authorization middleware
    - Create JWT verification middleware
    - Create role-based access control middleware
    - Create resource ownership validation middleware
    - _Requirements: 1.4, 1.5, 14.1, 14.2, 14.4_

- [x] 5. Profile management service
  - [x] 5.1 Implement profile service and endpoints
    - Create GET /api/preferences/user/:userId endpoint
    - Create PUT /api/preferences/user/:userId endpoint
    - Implement profile validation logic
    - Handle dietary preferences, allergies, and food type preferences
    - Handle notification preferences
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x]* 5.2 Write unit tests for profile management
    - Test profile updates and retrieval
    - Test notification preference filtering
    - _Requirements: 2.1, 2.4_

- [x] 6. Food listing service with image upload
  - [x] 6.1 Implement image storage strategy
    - Choose and configure storage system (AWS S3, Supabase, or local)
    - Create image upload utility function
    - Create image deletion utility function
    - Create public URL generation
    - Validate file type (jpg, png only)
    - Validate file size (max 5MB)
    - Test image upload with sample files
    - Test image deletion
    - Verify public URLs are accessible
    - _Requirements: 3.1, 16.1_
  
  - [x] 6.2 Create listing model and types
    - Define ListingStatus enum
    - Define ListingType enum
    - Define Listing interface with all fields
    - Define CreateListingDTO interface
    - Define UpdateListingDTO interface
    - Define ListingFilters interface
    - Define PaginatedListings interface
    - _Requirements: 3.1_
  
  - [x] 6.3 Create listing repository (database layer)
    - Create createListing function
    - Create getListingById function
    - Create getListings function with pagination and filters
    - Create getListingsByProvider function
    - Create updateListing function
    - Create deleteListing function
    - Create updateListingStatus function
    - Create updateAvailableQuantity function (atomic)
    - Create markExpiredListings function
    - Add database transaction support
    - Add error handling for constraints
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 6.4 Create listing service (business logic)
    - Create createListing function with validation
    - Create uploadListingImage function
    - Create getListingById function
    - Create searchListings function with pagination
    - Create getProviderListings function
    - Create updateListing function with authorization
    - Create deleteListing function with image cleanup
    - Create updateListingStatus function
    - Create expireOldListings function
    - Add business logic validation
    - Add authorization checks
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 16.1, 16.2, 16.3, 16.4_
  
  - [x] 6.5 Create listing validation schemas
    - Create createListingSchema
    - Create updateListingSchema
    - Create listingFiltersSchema
    - Create listingIdSchema
    - Export validation functions
    - _Requirements: 3.1, 14.3, 14.5_
  
  - [x] 6.6 Create listing controller (HTTP handlers)
    - Create createListing handler
    - Create uploadImage handler with multer
    - Create getListings handler
    - Create getListingById handler
    - Create getProviderListings handler
    - Create updateListing handler
    - Create deleteListing handler
    - Create updateStatus handler
    - Add error handling and logging
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 16.1_
  
  - [x] 6.7 Create listing routes
    - Define POST /api/listings (auth, provider only)
    - Define POST /api/listings/:id/image (auth, provider only)
    - Define GET /api/listings (public)
    - Define GET /api/listings/:id (public)
    - Define GET /api/listings/provider/:providerId (auth)
    - Define PUT /api/listings/:id (auth, provider only)
    - Define DELETE /api/listings/:id (auth, provider only)
    - Define PATCH /api/listings/:id/status (auth, provider only)
    - Apply middleware (auth, validation, role-based)
    - Register routes in main router
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x]* 6.8 Write unit tests for listing management
    - Test listing service functions
    - Test listing repository queries
    - Test listing controller endpoints
    - Test storage utility functions
    - Run tests and verify coverage
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 7. Checkpoint - Ensure core services are working
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Reservation service with pickup confirmation
  - [x] 8.1 Implement reservation service and endpoints
    - Create POST /api/reservations endpoint (Student only)
    - Create GET /api/reservations/student/:studentId endpoint
    - Create GET /api/reservations/listing/:listingId endpoint (Provider only)
    - Create DELETE /api/reservations/:id endpoint
    - Create POST /api/reservations/:id/confirm-pickup endpoint (Provider only)
    - Implement quantity validation and availability checking
    - Implement duplicate reservation prevention
    - Implement atomic quantity updates (use database transactions)
    - Implement pickup confirmation with timestamp recording
    - Update listing status to 'completed' when all reservations are confirmed
    - Prevent double confirmation of pickups
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 17.1, 17.2, 16.3_
  
  - [x]* 8.2 Write unit tests for reservation system
    - Test reservation creation and quantity updates
    - Test duplicate reservation prevention
    - Test reservation cancellation
    - Test pickup confirmation
    - Test listing status update after all pickups confirmed
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6, 16.3_

- [x] 9. Pantry service
  - [x] 9.1 Implement pantry service and endpoints
    - Create GET /api/pantry/slots endpoint
    - Create POST /api/pantry/appointments endpoint (Student only)
    - Create GET /api/pantry/appointments/student/:studentId endpoint
    - Create DELETE /api/pantry/appointments/:id endpoint
    - Create POST /api/pantry/orders endpoint
    - Implement slot booking with atomic updates
    - Implement double-booking prevention
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x]* 9.2 Write unit tests for pantry system
    - Test booking appointments
    - Test double-booking prevention
    - Test appointment cancellation
    - _Requirements: 5.2, 5.3, 5.5_

- [x] 10. Pantry inventory system
  - [x] 10.1 Implement pantry inventory service
    - Create GET /api/pantry/inventory endpoint (public or Student)
    - Create POST /api/pantry/inventory endpoint (Admin only)
    - Create PATCH /api/pantry/inventory/:id endpoint (Admin only)
    - Implement pantry stock tracking with in_stock boolean field
    - Implement item quantity updates with validation (quantity >= 0)
    - Implement pantry item retrieval with filtering (include in_stock filter)
    - Update authorization middleware to support Admin role
    - Note: Admin role added to support pantry inventory management
    - _Requirements: 7.5, 13.2_
  
  - [x]* 10.2 Write unit tests for inventory management
    - Test inventory item creation
    - Test quantity updates
    - Test inventory retrieval
    - Test in_stock filtering
    - _Requirements: 7.5_


- [x] 11. Preference learning service
  - [x] 11.1 Implement preference tracking and analysis
    - Create POST /api/preferences/track endpoint (internal)
    - Create GET /api/preferences/frequent-items/:userId endpoint
    - Create GET /api/preferences/recommendations/:userId endpoint
    - Create GET /api/pantry/cart/generate endpoint
    - Implement behavior tracking (pantry selections, reservations, filters)
    - Implement frequency analysis for recommendations
    - Implement smart cart generation algorithm with inventory integration
    - Query pantry_inventory table before generating recommendations
    - Filter frequent items based on in_stock status
    - Exclude out-of-stock items from smart cart
    - Prioritize available items in recommendation ranking
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 13.2_
  
  - [x]* 11.2 Write unit tests for preference learning
    - Test preference tracking
    - Test frequency analysis
    - Test smart cart generation
    - Test inventory filtering in recommendations
    - Test out-of-stock item exclusion
    - _Requirements: 7.1, 7.5, 13.2_

- [x] 12. Notification service
  - [x] 12.1 Implement notification service and endpoints
    - Create GET /api/notifications/user/:userId endpoint
    - Create POST /api/notifications endpoint (internal)
    - Create PATCH /api/notifications/:id/read endpoint
    - Create DELETE /api/notifications/:id endpoint
    - Implement notification creation for reservations
    - Implement notification creation for pantry bookings
    - Implement notification creation for new listings (with preference matching)
    - Implement notification preference filtering
    - Implement reminder notifications for upcoming appointments
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [x]* 12.2 Write unit tests for notification system
    - Test notification creation
    - Test preference filtering
    - Test notification ordering
    - _Requirements: 8.1, 8.5, 8.6_

- [x] 13. Search and filtering service with pagination
  - [x] 13.1 Implement pagination for listing queries
    - Add pagination parameters to GET /api/listings endpoint (page, limit)
    - Set default values (page=1, limit=20)
    - Validate pagination parameters (page >= 1, limit between 1 and 100)
    - Update database queries to use OFFSET and LIMIT
    - Calculate total_count of matching listings
    - Return pagination metadata in response:
      - total_count: total number of matching listings
      - page: current page number
      - limit: items per page
      - total_pages: calculated total pages
    - Ensure pagination works with all filters (dietary, location, food type)
    - Apply pagination to GET /api/dining/deals endpoint
    - Apply pagination to event food queries
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [x] 13.2 Implement search and filtering functionality
    - Enhance GET /api/listings endpoint with comprehensive filtering
    - Implement dietary filter logic
    - Implement location filter logic
    - Implement food type filter logic
    - Implement result ordering by pickup window
    - Implement search for dining deals with pagination
    - Implement search for event food with pagination
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 18.3, 19.2_
  
  - [x]* 13.3 Write unit tests for search and filtering
    - Test filter application
    - Test result ordering
    - Test search with multiple filters
    - Test pagination with different page sizes
    - Test pagination metadata accuracy
    - Test pagination with filters combined
    - _Requirements: 10.2, 10.3, 10.4, 10.5_

- [x] 14. Dining and event services
  - [x] 14.1 Implement dining deal service
    - Create POST /api/dining/deals endpoint (Provider only)
    - Create GET /api/dining/deals endpoint
    - Create GET /api/dining/deals/:id endpoint
    - Create DELETE /api/dining/deals/:id endpoint
    - Implement deal expiration logic
    - _Requirements: 18.1, 18.2, 18.3_
  
  - [x] 14.2 Implement event food tagging
    - Add event food tagging to listing creation
    - Implement event food filtering in search
    - _Requirements: 19.1, 19.2_
  
  - [x]* 14.3 Write unit tests for dining and events
    - Test dining deal creation and expiration
    - Test event food tagging and filtering
    - _Requirements: 18.1, 18.2, 19.1, 19.2_

- [x] 15. Volunteer service
  - [x] 15.1 Implement volunteer service and endpoints
    - Create GET /api/volunteer/opportunities endpoint
    - Create POST /api/volunteer/signup endpoint (Student only)
    - Create GET /api/volunteer/participation/:studentId endpoint
    - Create DELETE /api/volunteer/signup/:id endpoint
    - Implement basic volunteer capacity tracking
    - _Requirements: 20.1, 20.2, 20.3_
  
  - [x]* 15.2 Write unit tests for volunteer system
    - Test volunteer signup
    - Test capacity tracking
    - _Requirements: 20.1, 20.2_

- [x] 16. API validation, rate limiting, and error handling
  - [x] 16.1 Implement request validation middleware
    - Set up validation library (Zod or Joi)
    - Create validation schemas for all endpoints
    - Implement validation middleware
    - Implement error response formatting
    - _Requirements: 14.3, 14.5_
  
  - [x] 16.2 Implement rate limiting for AI chat
    - Install rate limiting library (express-rate-limit or similar)
    - Create rate limiting middleware for POST /api/chat endpoint
    - Configure rate limits from environment variables:
      - RATE_LIMIT_CHAT_REQUESTS (default: 20 requests)
      - RATE_LIMIT_CHAT_WINDOW_MS (default: 60000 ms = 1 minute)
    - Apply rate limiting per user (use user_id from JWT)
    - Return 429 error with appropriate message when limit exceeded
    - Include rate limit headers in response (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
    - Log rate limit violations for monitoring
    - _Requirements: 12.4_
  
  - [x] 16.3 Implement comprehensive error handling
    - Create error handler middleware
    - Implement error response formatting for all error types (401, 403, 400, 404, 409, 429, 500)
    - Implement database error handling
    - Implement LLM API error handling
    - Implement rate limit error handling
    - _Requirements: 6.10, 12.3_
  
  - [x]* 16.4 Write unit tests for validation and error handling
    - Test authentication errors (401)
    - Test authorization errors (403)
    - Test validation errors (400)
    - Test rate limiting (429)
    - Test rate limit reset after window expires
    - _Requirements: 14.1, 14.2, 14.3_

- [x] 17. System health monitoring
  - [x] 17.1 Implement health check endpoint
    - Create GET /health endpoint (public, no authentication required)
    - Check database connectivity (execute simple query)
    - Check AI service availability (test API key validity or ping endpoint)
    - Return structured health response with status codes:
      - 200 if all systems operational
      - 503 if any critical system is down
    - Response format:
      ```json
      {
        "status": "ok" | "degraded" | "down",
        "timestamp": "2026-03-10T12:00:00Z",
        "services": {
          "database": "connected" | "disconnected",
          "ai_service": "available" | "unavailable"
        }
      }
      ```
    - Implement timeout for health checks (5 seconds max)
    - Log health check failures
    - _Requirements: 11.3_
  
  - [x]* 17.2 Write unit tests for health check
    - Test health check with all services operational
    - Test health check with database down
    - Test health check with AI service unavailable
    - Test health check timeout handling
    - _Requirements: 11.3_

- [x] 18. Checkpoint - Backend APIs complete
  - Verify all API endpoints are implemented
  - Verify all unit tests pass
  - Test API endpoints manually with Postman or similar
  - Ensure all tests pass, ask the user if questions arise

---

# PHASE 3: AI AGENT INTEGRATION

- [x] 19. AI agent prompt templates
  - [x] 19.1 Create prompt template files
    - Create prompts/food_discovery_prompt.txt
    - Create prompts/pantry_booking_prompt.txt
    - Create prompts/food_reservation_prompt.txt
    - Create prompts/smart_pantry_cart_prompt.txt
    - Create prompts/recommendation_prompt.txt
    - Create prompts/base_system_prompt.txt
    - _Requirements: 6.1, 12.1_
  
  - [x] 19.2 Implement prompt loading utility
    - Create prompt template loader function
    - Implement variable injection into prompts (user_name, preferences, etc.)
    - Integrate prompt templates into LLM request pipeline
    - _Requirements: 6.1_

- [x] 20. AI agent tool layer
  - [x] 20.1 Implement tool execution framework
    - Create tool definition interface (name, description, parameters, handler)
    - Create tool registry for managing available tools
    - Create tool execution wrapper with error handling
    - Implement tool result formatting
    - _Requirements: 6.1, 6.10_
  
  - [x] 20.2 Implement individual agent tools
    - Implement search_food tool (maps to GET /api/listings)
    - Implement reserve_food tool (maps to POST /api/reservations)
    - Implement get_pantry_slots tool (maps to GET /api/pantry/slots)
    - Implement book_pantry tool (maps to POST /api/pantry/appointments)
    - Implement get_notifications tool (maps to GET /api/notifications/user/:userId)
    - Implement get_dining_deals tool (maps to GET /api/dining/deals)
    - Implement get_event_food tool (maps to GET /api/listings?type=event)
    - Implement retrieve_user_preferences tool (maps to GET /api/preferences/user/:userId)
    - Implement get_frequent_pantry_items tool (maps to GET /api/preferences/frequent-items/:userId)
    - Implement generate_pantry_cart tool (maps to GET /api/pantry/cart/generate)
    - Implement suggest_recipes tool (LLM-based generation)
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_
  
  - [ ]* 20.3 Write unit tests for tool execution
    - Test tool execution with valid inputs
    - Test tool error handling
    - _Requirements: 6.2, 6.10_

- [x] 21. AI agent LLM integration
  - [x] 21.1 Implement LLM service
    - Set up OpenAI or Anthropic API client
    - Load and inject prompt templates
    - Implement function calling / tool use integration
    - Implement message formatting for LLM API
    - Implement response parsing and tool call extraction
    - Implement retry logic with exponential backoff (3 retries)
    - Implement timeout handling (30 seconds)
    - _Requirements: 6.1, 12.1, 12.2, 12.3, 12.5_
  
  - [x] 21.2 Implement conversation session management
    - Create session creation and retrieval
    - Implement short-term context storage (in-memory or Redis)
    - Implement session timeout (30 minutes)
    - Implement context initialization for new sessions
    - Implement context persistence during active sessions
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ]* 21.3 Write unit tests for LLM integration
    - Test tool selection for specific queries
    - Test context resolution
    - Test error handling
    - _Requirements: 6.1, 9.2_

- [x] 22. AI agent chat endpoint
  - [x] 22.1 Implement chat API endpoint
    - Create POST /api/chat endpoint
    - Implement request validation
    - Implement agent workflow (receive message → LLM reasoning → tool execution → response)
    - Integrate with session management
    - Integrate with logging system
    - _Requirements: 6.1, 12.1, 12.4_
  
  - [ ]* 22.2 Write integration tests for chat workflow
    - Test complete conversation flow
    - Test tool execution through chat
    - _Requirements: 6.1, 6.2_

- [x] 23. Smart pantry cart implementation with inventory integration
  - [x] 23.1 Implement smart cart workflow
    - Enhance generate_pantry_cart tool with confirmation flow
    - Integrate pantry inventory checking in cart generation
    - Filter cart recommendations to only include in-stock items
    - Implement cart modification handling
    - Implement order creation from confirmed cart
    - Validate cart items against current inventory before order creation
    - _Requirements: 13.1, 13.3, 13.4, 13.5_
  
  - [ ]* 23.2 Write unit tests for smart cart
    - Test cart generation with inventory filtering
    - Test cart modification
    - Test order creation
    - Test out-of-stock item exclusion
    - Test inventory validation before order creation
    - _Requirements: 13.4, 13.5_

- [x] 24. Logging and observability
  - [x] 24.1 Implement logging system
    - Set up logging library (Winston or Pino)
    - Create structured logging format
    - Implement query logging for AI assistant
    - Implement tool execution logging
    - Implement response logging
    - Implement error logging with stack traces
    - Create agent_logs table integration
    - _Requirements: 15.1, 15.2, 15.3, 15.4_
  
  - [ ]* 24.2 Write unit tests for logging
    - Test log creation for different event types
    - _Requirements: 15.1_

- [x] 25. Checkpoint - AI agent complete
  - Test AI agent with various queries
  - Verify all tools execute correctly
  - Test conversation context management
  - Test smart pantry cart generation
  - Ensure all tests pass, ask the user if questions arise

---

# PHASE 4: FRONTEND INTERFACE

- [ ] 26. Real-time updates system
  - [ ] 26.1 Implement WebSocket or Server-Sent Events
    - Set up WebSocket server or SSE endpoint
    - Implement client subscription system
    - Create event emission for new food listings
    - Create event emission for reservation updates
    - Create event emission for new notifications
    - Implement connection management and cleanup
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ]* 26.2 Write unit tests for real-time updates
    - Test event emission
    - Test client subscription
    - Test connection cleanup
    - _Requirements: 8.1_

- [ ] 27. Frontend setup and authentication
  - [ ] 27.1 Initialize frontend project
    - Set up React or Vue.js project
    - Configure routing (React Router or Vue Router)
    - Set up state management (Redux, Zustand, or Pinia)
    - Configure API client (Axios or Fetch)
    - Set up authentication token storage
    - Integrate WebSocket or SSE client for real-time updates
    - _Requirements: 1.1, 1.2, 8.1_
  
  - [ ] 27.2 Implement authentication UI
    - Create login page
    - Create registration page
    - Create role selection during registration
    - Implement JWT token management
    - Implement protected route guards
    - Create logout functionality
    - _Requirements: 1.1, 1.2_

- [ ] 28. Student dashboard and food discovery
  - [ ] 28.1 Implement student home page
    - Create home page layout with carousel
    - Implement food listing browser
    - Implement search and filter UI
    - Create listing detail view with image display
    - Integrate real-time updates for new listings
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 8.1_
  
  - [ ] 28.2 Implement reservation UI
    - Create reservation button and modal
    - Implement quantity selection
    - Create "My Reservations" page
    - Implement reservation cancellation
    - _Requirements: 4.1, 4.5_
  
  - [ ] 28.3 Implement pantry appointment UI
    - Create pantry page with slot selection
    - Implement appointment booking flow
    - Create "My Appointments" view
    - Implement appointment cancellation
    - _Requirements: 5.1, 5.2, 5.5_

- [ ] 29. Provider dashboard
  - [ ] 29.1 Implement provider food donation UI
    - Create food donation form with image upload
    - Implement pickup window selection
    - Create "My Listings" page
    - Implement listing editing and deletion
    - _Requirements: 16.1, 3.2, 3.3_
  
  - [ ] 29.2 Implement provider reservation view
    - Create reservation viewer for provider listings
    - Display reservation details and timestamps
    - Implement "confirm pickup" button
    - Display reservation summary after pickup window
    - _Requirements: 17.1, 17.2, 17.3, 16.3_

- [ ] 30. AI chat interface
  - [ ] 30.1 Implement chat UI component
    - Create chat interface with message history
    - Implement message input and send functionality
    - Create message bubbles for user and assistant
    - Implement typing indicators
    - Implement error message display
    - Make chat accessible from all pages (floating button or sidebar)
    - _Requirements: 6.1, 12.1, 12.2_
  
  - [ ] 30.2 Implement chat integration with backend
    - Connect to POST /api/chat endpoint
    - Implement session management
    - Display tool execution results
    - Implement error handling for chat failures
    - _Requirements: 6.1, 6.10, 12.3_
  
  - [ ] 30.3 Implement smart cart UI
    - Create smart cart preview modal
    - Implement cart item modification
    - Implement cart confirmation flow
    - Display generated pantry order
    - _Requirements: 13.3, 13.4, 13.5_

- [ ] 31. Profile and notification management
  - [ ] 31.1 Implement profile settings page
    - Create profile form with dietary preferences
    - Implement allergy input
    - Implement preferred food types selection
    - Implement notification preferences toggles
    - Create profile update functionality
    - _Requirements: 2.1, 2.2, 2.4_
  
  - [ ] 31.2 Implement notification center
    - Create notifications page
    - Display notifications with timestamps
    - Implement mark as read functionality
    - Implement notification deletion
    - Add notification badge to navigation
    - Integrate real-time notification updates
    - _Requirements: 8.6, 8.1_

- [ ] 32. Dining deals and event food pages
  - [ ] 32.1 Implement dining page
    - Create dining deals browser
    - Implement restaurant filtering
    - Display deal details and expiration
    - Integrate with reservation system
    - _Requirements: 18.1, 18.3_
  
  - [ ] 32.2 Implement events page
    - Create event food browser
    - Display event details
    - Implement event food reservation
    - _Requirements: 19.1, 19.2_

- [ ] 33. Volunteer coordination UI
  - [ ] 33.1 Implement volunteer opportunities page
    - Create volunteer opportunities list
    - Display opportunity details and capacity
    - Implement volunteer signup
    - Create "My Volunteer Activities" view
    - Implement signup cancellation
    - _Requirements: 20.1, 20.2_

- [ ] 34. Checkpoint - Frontend complete
  - Test all user flows manually
  - Verify real-time updates work
  - Test AI chat interface
  - Verify responsive design
  - Ask the user if questions arise

---

# PHASE 5: TESTING & DEPLOYMENT

- [ ] 35. Integration testing
  - [ ]* 35.1 Write integration tests for critical workflows
    - Test complete student reservation workflow
    - Test complete provider donation workflow with image upload
    - Test pantry appointment booking workflow
    - Test AI assistant conversation workflow
    - Test pickup confirmation workflow
    - _Requirements: 4.1, 16.1, 5.2, 6.1, 16.3_

- [ ] 36. Deployment preparation
  - [ ] 36.1 Configure production environment
    - Set up environment variables for production
    - Configure database connection pooling
    - Set up CORS configuration
    - Configure rate limiting
    - Set up SSL/TLS certificates
    - _Requirements: 14.1, 14.2_
  
  - [ ] 36.2 Create deployment scripts
    - Create database migration script for production
    - Create build script for frontend
    - Create Docker configuration (optional)
    - Create deployment documentation
    - _Requirements: 11.1_

- [ ] 37. Final checkpoint - Complete system validation
  - Run all tests (unit, integration)
  - Verify all requirements are implemented
  - Test complete user workflows manually
  - Load testing for API endpoints
  - Security audit
  - Performance optimization
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks are organized into 5 phases: Database → Backend APIs → AI Agent → Frontend → Testing & Deployment
- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints at the end of each phase ensure incremental validation
- Unit tests focus on core functionality and edge cases
- Integration tests validate complete workflows across components
- The AI agent layer is built after core backend services are complete
- Frontend integration happens after backend and AI agent are fully functional
- Real-time updates enhance user experience with live notifications and listing updates
- Prompt templates provide structured guidance for the AI assistant
- Image uploads allow providers to showcase food offerings visually
- Pickup confirmation enables providers to track food collection
- Pantry inventory system helps manage stock levels
- Pagination improves performance for large listing queries
- Rate limiting protects the AI chat endpoint from abuse
- Health check endpoint enables monitoring and uptime tracking
- Smart pantry cart integrates with inventory to recommend only available items
- Admin role added to support pantry inventory management (separate from Student and Provider roles)
- Environment variables are validated on startup to catch configuration issues early
- Project directory structure follows separation of concerns (controllers, services, repositories, routes, middleware, agents)

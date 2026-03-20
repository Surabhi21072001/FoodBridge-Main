# FoodBridge API Reference

## Overview

Base URL: `http://localhost:3000/api`

> **Deployment note:** The backend resolves its internal API base URL dynamically at startup. It reads `API_BASE_URL` from the environment first; if that is not set, it falls back to `http://localhost:<PORT>/api` where `PORT` defaults to `3000`. Set `API_BASE_URL` explicitly in production (e.g. on Heroku) to ensure the AI agent calls the correct host.

All endpoints use JSON for request/response bodies. Authentication is required for most endpoints using JWT tokens in the `Authorization: Bearer <token>` header.

## Authentication

### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-string",
    "user": {
      "user_id": "uuid",
      "email": "user@example.com",
      "role": "student|provider|admin",
      "created_at": "2024-01-15T10:00:00Z"
    }
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "role": "student|provider"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully"
}
```

## Chat & AI Assistant

### POST /chat
Send a message to the AI assistant and receive intelligent responses with tool execution. Rate limited to 20 requests/minute per user.

**Agent API Base URL Configuration:**
The agent resolves backend tool calls using an internal base URL determined at startup:
1. `API_BASE_URL` environment variable (recommended for production / Heroku)
2. Falls back to `http://localhost:<PORT>/api` where `PORT` defaults to `3000`

Set `API_BASE_URL` in your deployment environment to ensure the agent reaches the correct backend host.

**Authentication:** Required (Bearer token)

**Request Body:**
- `message` (string, required): The user's message to the AI assistant. Must be non-empty.
- `sessionId` (string, optional): Existing session ID to continue a conversation. If not provided, a new session is created.

**Request Example:**
```json
{
  "message": "Find me vegetarian food available today",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200) - Success:**
```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "response": "I found 3 vegetarian food listings available today. Here are the options: Pizza from the dining hall (12 slices available), Salad bar from the student center (5 portions), and Veggie wraps from the cafe (8 available).",
    "toolsUsed": [
      {
        "toolName": "searchFood",
        "status": "success",
        "result": {
          "listings": [...]
        }
      }
    ],
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

**Response Fields:**
- `sessionId` (string): The session ID for this conversation (new or existing)
- `response` (string): The AI assistant's response message
- `toolsUsed` (array): List of tools executed by the agent with their results
  - `toolName` (string): Name of the tool executed
  - `status` (string): success|error
  - `result` (object): Tool execution result
- `timestamp` (string): ISO 8601 timestamp of the response

**Error (400) - Invalid Request:**
```json
{
  "success": false,
  "message": "Message is required and must be a non-empty string"
}
```

**Error (401) - Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (500) - Server Error:**
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details (development only)"
}
```

**Available Tools:**
The AI agent can execute the following tools based on user requests:
- `searchFood`: Search for food listings with filters
- `reserveFood`: Create food reservations
- `bookPantry`: Book pantry appointments
- `getPantrySlots`: Get available pantry appointment slots
- `generatePantryCart`: Generate smart pantry cart recommendations
- `getNotifications`: Retrieve user notifications
- `markNotificationRead`: Mark notifications as read
- `getUserReservations`: Get user's reservations
- `cancelReservation`: Cancel a reservation
- `getEventFood`: Get event food listings
- `getDiningDeals`: Get dining deals
- `suggestRecipes`: Suggest recipes based on pantry items
- `getFrequentPantryItems`: Get user's frequently selected items
- `retrieveUserPreferences`: Get user preferences

**Notes:**
- Session IDs are used to maintain conversation context across multiple messages
- All timestamps are in ISO 8601 format (UTC)
- Tool execution is automatic based on user intent
- The agent learns from user preferences over time

### POST /chat/:sessionId/end
End a chat session and clean up session resources.

**Authentication:** Required (Bearer token)

**Path Parameters:**
- `sessionId` (string, required): The session ID to end

**Request Example:**
```
POST /api/chat/550e8400-e29b-41d4-a716-446655440000/end
Authorization: Bearer <jwt-token>
```

**Response (200) - Success:**
```json
{
  "success": true,
  "message": "Session ended successfully"
}
```

**Error (400) - Missing Session ID:**
```json
{
  "success": false,
  "message": "Session ID is required"
}
```

**Error (500) - Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

**Notes:**
- Ending a session clears all session-specific data and context
- After ending a session, a new session ID will be generated for subsequent messages
- This endpoint is optional; sessions can also expire automatically after inactivity

## Food Listings

### Image URL Handling

All listing endpoints return an `image_url` field. The behavior is as follows:

- **With Images**: If the listing has one or more images, the `image_url` field contains the URL of the first image
- **Without Images**: If the listing has no images, the `image_url` field defaults to a generic food placeholder image:
  ```
  https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop
  ```

This ensures that all listing responses always include a valid image URL, preventing broken image displays in the frontend.

### GET /listings
Get all food listings with optional filters.

**Authentication:** Optional (returns all public listings if not authenticated)

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search query to filter listings by food name or description
- `dietary_tags` (string): Comma-separated dietary filters (e.g., "vegetarian,vegan,gluten-free"). Can also be passed as array.
- `category` (string): Category filter (donation, event_food, deal)
- `status` (string): Status filter (active, inactive, expired)
- `location` (string): Location filter
- `available_now` (boolean): Only currently available listings (true/false)
- `min_price` (number): Minimum price filter
- `max_price` (number): Maximum price filter
- `provider_id` (string): Filter listings by a specific provider's ID

**Query Examples:**
```
GET /api/listings?page=1&limit=20
GET /api/listings?search=pizza&dietary_tags=vegetarian,vegan&location=Building%20A
GET /api/listings?search=salad&dietary_tags=gluten-free&available_now=true
GET /api/listings?search=pasta&page=2&limit=10
```

**Dietary Tags Parsing:**
- Comma-separated string: `"vegetarian,vegan"` → parsed to `["vegetarian", "vegan"]`
- Array format: `["vegetarian", "vegan"]` → passed as-is
- Whitespace is trimmed: `"vegetarian , vegan"` → `["vegetarian", "vegan"]`
- Empty tags are filtered out: `"vegetarian,,vegan"` → `["vegetarian", "vegan"]`

**Search Parameter:**
- Searches across food name and description fields
- Case-insensitive matching
- Partial matches are supported (e.g., "piz" matches "pizza")
- Can be combined with other filters for refined results
- Example: `search=vegetarian%20pasta` finds listings with "vegetarian pasta" in name or description

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "listing_id": "uuid",
        "provider_id": "uuid",
        "food_name": "Pizza",
        "description": "Leftover pizza",
        "quantity": 5,
        "available_quantity": 5,
        "location": "Building A",
        "pickup_window_start": "2024-01-15T12:00:00Z",
        "pickup_window_end": "2024-01-15T14:00:00Z",
        "food_type": "Italian",
        "dietary_tags": ["vegetarian"],
        "listing_type": "donation",
        "status": "active",
        "image_url": "https://storage.example.com/listings/pizza-123.jpg",
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "total_count": 42,
      "page": 1,
      "limit": 20,
      "total_pages": 3
    }
  }
}
```

**Response Fields:**
- `listing_id` (string): Unique identifier for the listing
- `provider_id` (string): ID of the provider who created the listing
- `food_name` (string): Name of the food item
- `description` (string): Detailed description of the food
- `quantity` (number): Total quantity (available + reserved)
- `available_quantity` (number): Quantity available for reservation
- `location` (string): Pickup location
- `pickup_window_start` (string): ISO 8601 timestamp when pickup starts
- `pickup_window_end` (string): ISO 8601 timestamp when pickup ends
- `food_type` (string): Type/cuisine of the food
- `dietary_tags` (array): Array of dietary tags (vegetarian, vegan, gluten-free, etc.)
- `listing_type` (string): Type of listing (donation, event, dining_deal)
- `status` (string): Current status (active, inactive, expired)
- `image_url` (string): URL to the first image of the listing. If no images are available, defaults to a generic food image placeholder: `https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop`
- `created_at` (string): ISO 8601 timestamp when listing was created
- `updated_at` (string): ISO 8601 timestamp when listing was last updated

**Error (400) - Invalid Parameters:**
```json
{
  "success": false,
  "message": "Invalid query parameters"
}
```

### GET /listings/:id
Get a specific listing by ID.

**Path Parameters:**
- `id` (string, required): Listing ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "listing_id": "uuid",
    "provider_id": "uuid",
    "food_name": "Pizza",
    "description": "Leftover pizza",
    "quantity": 5,
    "available_quantity": 5,
    "location": "Building A",
    "pickup_window_start": "2024-01-15T12:00:00Z",
    "pickup_window_end": "2024-01-15T14:00:00Z",
    "food_type": "Italian",
    "dietary_tags": ["vegetarian"],
    "listing_type": "donation",
    "status": "active",
    "image_url": "https://storage.example.com/listings/pizza-123.jpg",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Listing not found"
}
```

### POST /listings
Create a new food listing. Provider only.

**Authentication:** Required (provider role)

**Request:**
```json
{
  "food_name": "Pizza",
  "description": "Leftover pizza",
  "quantity": 5,
  "location": "Building A",
  "pickup_window_start": "2024-01-15T12:00:00Z",
  "pickup_window_end": "2024-01-15T14:00:00Z",
  "food_type": "Italian",
  "dietary_tags": ["vegetarian"],
  "listing_type": "donation"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "listing_id": "uuid",
    "provider_id": "uuid",
    "food_name": "Pizza",
    "description": "Leftover pizza",
    "quantity": 5,
    "available_quantity": 5,
    "location": "Building A",
    "pickup_window_start": "2024-01-15T12:00:00Z",
    "pickup_window_end": "2024-01-15T14:00:00Z",
    "food_type": "Italian",
    "dietary_tags": ["vegetarian"],
    "listing_type": "donation",
    "status": "active",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

### PUT /listings/:id
Update a listing. Provider only.

**Authentication:** Required (provider role)

**Request:** Same as POST /listings

**Response (200):** Updated listing object

### DELETE /listings/:id
Delete a listing. Provider only.

**Authentication:** Required (provider role)

**Response (200):**
```json
{
  "success": true,
  "message": "Listing deleted successfully"
}
```

### GET /listings/provider/my-listings
Get all listings created by the authenticated provider.

**Authentication:** Required (provider role)

**Note:** This route is registered before `/:id` to prevent route parameter collision.

**Query Parameters:**
- `status` (string): Filter by status (active, inactive, expired)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "listing_id": "uuid",
        "provider_id": "uuid",
        "food_name": "Pizza",
        "description": "Leftover pizza",
        "quantity": 5,
        "available_quantity": 5,
        "location": "Building A",
        "pickup_window_start": "2024-01-15T12:00:00Z",
        "pickup_window_end": "2024-01-15T14:00:00Z",
        "food_type": "Italian",
        "dietary_tags": ["vegetarian"],
        "listing_type": "donation",
        "status": "active",
        "image_url": "https://storage.example.com/listings/pizza-123.jpg",
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "total_count": 10,
      "page": 1,
      "limit": 20,
      "total_pages": 1
    }
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (403):**
```json
{
  "success": false,
  "message": "Access denied. Provider role required."
}
```

### GET /listings/provider/dashboard
Get provider listings with reservation statistics for the dashboard view.

**Authentication:** Required (provider role)

**Note:** This route is registered before `/:id` to prevent route parameter collision.

**Query Parameters:**
- `status` (string): Filter by status (active, inactive, expired)
- `category` (string): Filter by category (donation, event_food, deal)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)

**Request Example:**
```
GET /api/listings/provider/dashboard?status=active&page=1&limit=20
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "listing_id": "uuid",
      "provider_id": "uuid",
      "food_name": "Pizza",
      "description": "Leftover pizza",
      "quantity": 5,
      "available_quantity": 3,
      "quantity_reserved": 2,
      "location": "Building A",
      "pickup_window_start": "2024-01-15T12:00:00Z",
      "pickup_window_end": "2024-01-15T14:00:00Z",
      "food_type": "Italian",
      "category": "donation",
      "dietary_tags": ["vegetarian"],
      "allergen_info": [],
      "listing_type": "donation",
      "status": "active",
      "is_available_now": true,
      "image_url": "https://storage.example.com/listings/pizza-123.jpg",
      "image_urls": ["https://storage.example.com/listings/pizza-123.jpg"],
      "original_price": null,
      "discounted_price": null,
      "total_reservations": 3,
      "confirmed_reservations": 2,
      "completed_reservations": 1,
      "total_reserved_quantity": 4,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ],
  "summary": {
    "total_listings": 5,
    "active_listings": 3,
    "total_reservations": 12
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "total_pages": 1
  }
}
```

**Response Fields (additional to standard listing fields):**
- `quantity_reserved` (number): Quantity currently reserved by students
- `is_available_now` (boolean): Whether the listing is currently within its pickup window
- `image_urls` (array): All image URLs for the listing
- `original_price` (number|null): Original price (for deals)
- `discounted_price` (number|null): Discounted price (for deals)
- `total_reservations` (number): Total number of reservations made
- `confirmed_reservations` (number): Number of confirmed reservations
- `completed_reservations` (number): Number of completed reservations
- `total_reserved_quantity` (number): Total quantity reserved across all reservations
- `summary` (object): Aggregate stats across all provider listings

**Error (401):**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (403):**
```json
{
  "success": false,
  "message": "Access denied. Provider role required."
}
```

## Reservations

### POST /reservations
Create a food reservation. Student only.

**Authentication:** Required (student role)

**Request:**
```json
{
  "listing_id": "uuid",
  "quantity": 2
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "reservation_id": "uuid",
    "listing_id": "uuid",
    "student_id": "uuid",
    "quantity": 2,
    "status": "active",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

### GET /reservations
Get all reservations for the authenticated student.

**Authentication:** Required (student role)

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): active|completed|cancelled

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "reservation_id": "uuid",
      "listing_id": "uuid",
      "student_id": "uuid",
      "quantity": 2,
      "status": "active",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### GET /reservations/:id
Get a specific reservation.

**Authentication:** Required

**Response (200):** Reservation object

### DELETE /reservations/:id
Cancel a reservation. Student only.

**Authentication:** Required (student role)

**Response (200):**
```json
{
  "success": true,
  "message": "Reservation cancelled successfully"
}
```

### POST /reservations/:id/confirm-pickup
Confirm pickup of a reservation.

**Authentication:** Required

**Request:**
```json
{
  "quantity_received": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Pickup confirmed"
}
```

## Pantry Appointments

### POST /pantry/appointments
Book a pantry appointment. Student only.

**Authentication:** Required (student role)

**Request Body:**
```json
{
  "slot_id": "uuid",
  "notes": "Optional notes about the appointment"
}
```

**Request Example:**
```
POST /api/pantry/appointments
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "slot_id": "550e8400-e29b-41d4-a716-446655440000",
  "notes": "I have dietary restrictions"
}
```

**Response (201) - Success:**
```json
{
  "success": true,
  "data": {
    "appointment_id": "uuid",
    "student_id": "uuid",
    "slot_id": "uuid",
    "status": "confirmed",
    "notes": "I have dietary restrictions",
    "google_event_id": "google_calendar_event_id_or_null",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  },
  "message": "Appointment created successfully"
}
```

**Response Fields (additional):**
- `google_event_id` (string|null): Google Calendar event ID if the user has connected their Google Calendar and event creation succeeded. `null` if the user has not connected Google Calendar or if calendar sync failed (appointment is still created successfully regardless).

**Google Calendar Integration:**
If the authenticated user has connected their Google Calendar (via `GET /auth/google/calendar`), the server will automatically attempt to create a corresponding calendar event titled "FoodBridge Pantry Appointment" with the appointment's start time and duration. This is a non-blocking operation — if calendar event creation fails, the appointment is still booked and the error is logged server-side. The `google_event_id` field in the response will be populated if the calendar event was created successfully.

**Error (400) - Invalid Request:**
```json
{
  "success": false,
  "message": "Invalid appointment data"
}
```

**Error (401) - Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (403) - Forbidden:**
```json
{
  "success": false,
  "message": "Only students can book appointments"
}
```

**Error (409) - Conflict:**
```json
{
  "success": false,
  "message": "Slot is no longer available"
}
```

### GET /pantry/appointments
Get all appointments for the authenticated student.

**Authentication:** Required (student role)

**Query Parameters:**
- `status` (string): Filter by status (confirmed, cancelled, completed)
- `upcoming` (boolean): Only show upcoming appointments (true/false)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)

**Query Examples:**
```
GET /api/pantry/appointments?status=confirmed&upcoming=true
GET /api/pantry/appointments?page=1&limit=10
GET /api/pantry/appointments?upcoming=true
```

**Response (200) - Success:**
```json
{
  "success": true,
  "data": [
    {
      "appointment_id": "uuid",
      "student_id": "uuid",
      "slot_id": "uuid",
      "status": "confirmed",
      "notes": "Optional notes",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total_count": 5,
    "page": 1,
    "limit": 20,
    "total_pages": 1
  }
}
```

**Error (401) - Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (403) - Forbidden:**
```json
{
  "success": false,
  "message": "Only students can view their appointments"
}
```

### GET /pantry/appointments/slots
Get available pantry appointment slots. Public endpoint (no authentication required).

**Query Parameters:**
- `date` (string): Date to query slots for (optional, defaults to today). Accepts either `YYYY-MM-DD` (e.g., `2026-03-17`) or a full datetime string (e.g., `2026-03-17T16:30:00`) — only the date portion is used.
- `limit` (number): Number of slots to return (optional, default: 20)

**Query Examples:**
```
GET /api/pantry/appointments/slots
GET /api/pantry/appointments/slots?date=2024-01-20
GET /api/pantry/appointments/slots?date=2024-01-20&limit=10
GET /api/pantry/appointments/slots?date=2026-03-17T16:30:00
```

**Response (200) - Success:**
```json
{
  "success": true,
  "data": [
    {
      "slot_id": "uuid",
      "start_time": "2024-01-15T10:00:00Z",
      "end_time": "2024-01-15T10:30:00Z",
      "available_spots": 5,
      "total_spots": 10
    },
    {
      "slot_id": "uuid",
      "start_time": "2024-01-15T10:30:00Z",
      "end_time": "2024-01-15T11:00:00Z",
      "available_spots": 3,
      "total_spots": 10
    }
  ]
}
```

**Error (400) - Invalid Date:**
```json
{
  "success": false,
  "message": "Invalid date format. Use YYYY-MM-DD"
}
```

**Error (500) - Server Error:**
```json
{
  "success": false,
  "message": "Failed to retrieve available slots"
}
```

**Notes:**
- This endpoint is public and does not require authentication
- Slots are typically 30 minutes long
- `available_spots` indicates how many more students can book this slot
- Slots in the past are not returned
- When a datetime string is passed (e.g., from a calendar picker), only the `YYYY-MM-DD` portion is extracted — the time component is ignored
- The date is parsed as a local date to prevent UTC midnight shifting slots to the wrong day

### GET /pantry/appointments/student/:id
Get appointments for a specific student. Requires authentication (any role).

**Authentication:** Required (any authenticated user)

**Path Parameters:**
- `id` (string, required): Student ID

**Query Parameters:**
- `status` (string): Filter by status (confirmed, cancelled, completed)
- `upcoming` (boolean): Only show upcoming appointments (true/false)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)

**Query Examples:**
```
GET /api/pantry/appointments/student/550e8400-e29b-41d4-a716-446655440000
GET /api/pantry/appointments/student/550e8400-e29b-41d4-a716-446655440000?status=confirmed
GET /api/pantry/appointments/student/550e8400-e29b-41d4-a716-446655440000?page=1&limit=10
```

**Response (200) - Success:**
```json
{
  "success": true,
  "data": [
    {
      "appointment_id": "uuid",
      "student_id": "uuid",
      "slot_id": "uuid",
      "status": "confirmed",
      "notes": "Optional notes",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total_count": 3,
    "page": 1,
    "limit": 20,
    "total_pages": 1
  }
}
```

**Error (401) - Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (404) - Not Found:**
```json
{
  "success": false,
  "message": "Student not found"
}
```

### GET /pantry/appointments/:id
Get a specific appointment by ID.

**Authentication:** Required (student or admin)

**Path Parameters:**
- `id` (string, required): Appointment ID

**Request Example:**
```
GET /api/pantry/appointments/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <jwt-token>
```

**Response (200) - Success:**
```json
{
  "success": true,
  "data": {
    "appointment_id": "uuid",
    "student_id": "uuid",
    "slot_id": "uuid",
    "status": "confirmed",
    "notes": "Optional notes",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  },
  "message": "Appointment retrieved successfully"
}
```

**Error (401) - Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (403) - Forbidden:**
```json
{
  "success": false,
  "message": "You do not have permission to view this appointment"
}
```

**Error (404) - Not Found:**
```json
{
  "success": false,
  "message": "Appointment not found"
}
```

### PUT /pantry/appointments/:id
Update an appointment. Student only.

**Authentication:** Required (student role)

**Path Parameters:**
- `id` (string, required): Appointment ID

**Request Body:**
```json
{
  "slot_id": "uuid",
  "notes": "Updated notes about the appointment"
}
```

**Request Example:**
```
PUT /api/pantry/appointments/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "slot_id": "660e8400-e29b-41d4-a716-446655440001",
  "notes": "Updated dietary restrictions"
}
```

**Response (200) - Success:**
```json
{
  "success": true,
  "data": {
    "appointment_id": "uuid",
    "student_id": "uuid",
    "slot_id": "uuid",
    "status": "confirmed",
    "notes": "Updated dietary restrictions",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "message": "Appointment updated successfully"
}
```

**Error (400) - Invalid Request:**
```json
{
  "success": false,
  "message": "Invalid appointment data"
}
```

**Error (401) - Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (403) - Forbidden:**
```json
{
  "success": false,
  "message": "You can only update your own appointments"
}
```

**Error (404) - Not Found:**
```json
{
  "success": false,
  "message": "Appointment not found"
}
```

**Error (409) - Conflict:**
```json
{
  "success": false,
  "message": "New slot is no longer available"
}
```

### DELETE /pantry/appointments/:id
Cancel an appointment. Student only.

**Authentication:** Required (student role)

**Path Parameters:**
- `id` (string, required): Appointment ID

**Request Example:**
```
DELETE /api/pantry/appointments/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <jwt-token>
```

**Response (200) - Success:**
```json
{
  "success": true,
  "data": {
    "appointment_id": "uuid",
    "student_id": "uuid",
    "slot_id": "uuid",
    "status": "cancelled",
    "notes": "Optional notes",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:45:00Z"
  },
  "message": "Appointment cancelled successfully"
}
```

**Error (401) - Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (403) - Forbidden:**
```json
{
  "success": false,
  "message": "You can only cancel your own appointments"
}
```

**Error (404) - Not Found:**
```json
{
  "success": false,
  "message": "Appointment not found"
}
```

**Error (409) - Conflict:**
```json
{
  "success": false,
  "message": "Appointment is already cancelled"
}
```

### DELETE /pantry/appointments/cancel-by-datetime
Cancel an appointment by date and time. Student only.

**Authentication:** Required (student role)

**Query Parameters:**
- `date` (string, required): Date in YYYY-MM-DD format
- `time` (string, required): Time in HH:mm format (24-hour)

**Request Example:**
```
DELETE /api/pantry/appointments/cancel-by-datetime?date=2024-01-15&time=10:00
Authorization: Bearer <jwt-token>
```

**Response (200) - Success:**
```json
{
  "success": true,
  "data": {
    "appointment_id": "uuid",
    "student_id": "uuid",
    "slot_id": "uuid",
    "status": "cancelled",
    "notes": "Optional notes",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:45:00Z"
  },
  "message": "Appointment cancelled successfully"
}
```

**Error (400) - Missing Parameters:**
```json
{
  "success": false,
  "message": "date and time query parameters are required (format: date=YYYY-MM-DD, time=HH:MM)"
}
```

**Error (400) - Invalid Date Format:**
```json
{
  "success": false,
  "message": "Invalid date format. Use YYYY-MM-DD (e.g., 2026-03-20)"
}
```

**Error (400) - Invalid Time Format:**
```json
{
  "success": false,
  "message": "Invalid time format. Use HH:MM in 24-hour format (e.g., 14:30)"
}
```

**Error (401) - Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (403) - Forbidden:**
```json
{
  "success": false,
  "message": "You can only cancel your own appointments"
}
```

**Error (404) - Not Found:**
```json
{
  "success": false,
  "message": "Appointment not found"
}
```

**Error (409) - Conflict:**
```json
{
  "success": false,
  "message": "Appointment is already cancelled"
}
```

**Notes:**
- This endpoint allows cancelling an appointment by specifying the date and time instead of the appointment ID
- Date format must be YYYY-MM-DD (e.g., 2024-01-15)
- Time format must be HH:MM in 24-hour format (e.g., 10:00, 14:30)
- The endpoint will find the appointment for the authenticated user with the matching date and time
- If multiple appointments exist for the same date/time, the first one will be cancelled
- This is useful for cancelling appointments when the user doesn't have the appointment ID readily available
- **Route ordering note:** In the current router implementation (`pantryAppointmentRoutes.ts`), `DELETE /cancel-by-datetime` is registered **after** `DELETE /:id`. Express will match `/cancel-by-datetime` as an `:id` parameter value before reaching this route. To fix this, the `/cancel-by-datetime` route should be moved **before** the `/:id` routes in the router.

### GET /pantry/appointments/admin/all
Get all appointments in the system. Admin only.

**Authentication:** Required (admin role)

**Query Parameters:**
- `status` (string): Filter by status (confirmed, cancelled, completed)
- `date` (string): Filter by date in YYYY-MM-DD format
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)

**Query Examples:**
```
GET /api/pantry/appointments/admin/all
GET /api/pantry/appointments/admin/all?status=confirmed&date=2024-01-15
GET /api/pantry/appointments/admin/all?page=1&limit=50
```

**Response (200) - Success:**
```json
{
  "success": true,
  "data": [
    {
      "appointment_id": "uuid",
      "student_id": "uuid",
      "student_email": "student@example.com",
      "slot_id": "uuid",
      "status": "confirmed",
      "notes": "Optional notes",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total_count": 150,
    "page": 1,
    "limit": 20,
    "total_pages": 8
  }
}
```

**Error (401) - Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (403) - Forbidden:**
```json
{
  "success": false,
  "message": "Only admin can view all appointments"
}
```

**Notes:**
- Route ordering in `pantryAppointmentRoutes.ts`:
  1. `POST /` — create appointment (student/provider)
  2. `GET /` — get user appointments (student/provider)
  3. `GET /slots` — available slots (public, no auth)
  4. `GET /student/:id` — appointments by student (authenticated)
  5. `GET /:id` — get by ID (student)
  6. `PUT /:id` — update (student)
  7. `DELETE /:id` — cancel by ID (student)
  8. `DELETE /cancel-by-datetime` — cancel by date/time (student) ⚠️ registered after `/:id`; move before `/:id` to avoid route conflict
  9. `GET /admin/all` — all appointments (admin)
- `/slots` is public and does not require authentication
- `/student/:id` requires only authentication (any role)
- `/:id` GET/PUT/DELETE requires student role
- `/admin/all` requires admin role

## Pantry Orders & Cart

### GET /pantry/orders/cart
Get the current shopping cart for the authenticated student.

**Authentication:** Required (student role)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "cart_id": "uuid",
    "student_id": "uuid",
    "items": [
      {
        "inventory_id": "uuid",
        "item_name": "Rice",
        "quantity": 2,
        "unit": "kg"
      }
    ],
    "total_items": 2,
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

### POST /pantry/orders/cart/items
Add an item to the cart.

**Authentication:** Required (student role)

**Request:**
```json
{
  "inventory_id": "uuid",
  "quantity": 2
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "inventory_id": "uuid",
    "item_name": "Rice",
    "quantity": 2,
    "unit": "kg"
  }
}
```

### PUT /pantry/orders/cart/items/:inventory_id
Update cart item quantity.

**Authentication:** Required (student role)

**Request:**
```json
{
  "quantity": 3
}
```

**Response (200):** Updated cart item

### DELETE /pantry/orders/cart/items/:inventory_id
Remove item from cart.

**Authentication:** Required (student role)

**Response (200):**
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

### DELETE /pantry/orders/cart
Clear the entire cart.

**Authentication:** Required (student role)

**Response (200):**
```json
{
  "success": true,
  "message": "Cart cleared"
}
```

### POST /pantry/orders/cart/submit
Submit the cart as an order.

**Authentication:** Required (student role)

**Response (201):**
```json
{
  "success": true,
  "data": {
    "order_id": "uuid",
    "student_id": "uuid",
    "items": [...],
    "status": "pending",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

### GET /pantry/orders
Get all orders for the authenticated student.

**Authentication:** Required (student role)

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): pending|completed|cancelled

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "order_id": "uuid",
      "student_id": "uuid",
      "items": [...],
      "status": "pending",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### GET /pantry/orders/:id
Get a specific order.

**Authentication:** Required (student role)

**Response (200):** Order object

## Smart Pantry Cart

### GET /pantry/cart/generate
Generate a smart pantry cart based on user history and preferences.

**Authentication:** Required

**Query Parameters:**
- `include_frequent` (boolean): Include frequently selected items (default: true)
- `respect_preferences` (boolean): Respect dietary preferences (default: true)
- `max_items` (number): Maximum items to suggest (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "item_id": "uuid",
        "item_name": "Rice",
        "category": "Grains",
        "quantity": 2,
        "in_stock": true,
        "unit": "kg",
        "dietary_tags": [],
        "allergen_info": []
      },
      {
        "item_id": "uuid",
        "item_name": "Beans",
        "category": "Legumes",
        "quantity": 1,
        "in_stock": true,
        "unit": "can",
        "dietary_tags": ["vegan"],
        "allergen_info": []
      }
    ],
    "totalItems": 2,
    "generatedAt": "2024-01-15T10:00:00Z"
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (500):**
```json
{
  "success": false,
  "message": "Failed to generate smart cart"
}
```

### POST /pantry/cart/generate-and-add
Generate a smart cart and automatically add items to the user's cart.

**Authentication:** Required

**Request Body:**
```json
{
  "include_frequent": true,
  "respect_preferences": true,
  "max_items": 10
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "cart_id": "uuid",
    "items_added": [
      {
        "item_id": "uuid",
        "item_name": "Rice",
        "quantity": 2,
        "unit": "kg"
      }
    ],
    "total_items": 2,
    "timestamp": "2024-01-15T10:00:00Z"
  },
  "message": "Added 2 items to your cart"
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (500):**
```json
{
  "success": false,
  "message": "Failed to generate and add items to cart"
}
```

### GET /pantry/cart/usual-items
Get user's frequently selected pantry items.

**Authentication:** Required

**Query Parameters:**
- `limit` (number): Number of items to return (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "item_id": "uuid",
        "item_name": "Rice",
        "category": "Grains",
        "frequency": 15,
        "last_selected": "2024-01-14T10:00:00Z"
      },
      {
        "item_id": "uuid",
        "item_name": "Pasta",
        "category": "Grains",
        "frequency": 12,
        "last_selected": "2024-01-13T10:00:00Z"
      }
    ],
    "count": 2
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (500):**
```json
{
  "success": false,
  "message": "Failed to get usual items"
}
```

### GET /pantry/cart/preference-based
Get preference-based pantry recommendations.

**Authentication:** Required

**Query Parameters:**
- `limit` (number): Number of items to return (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "item_id": "uuid",
        "item_name": "Gluten-Free Pasta",
        "category": "Grains",
        "reason": "matches_dietary_preference",
        "in_stock": true
      }
    ],
    "count": 1
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (500):**
```json
{
  "success": false,
  "message": "Failed to get preference-based recommendations"
}
```

### GET /pantry/cart/popular
Get popular pantry items across all users.

**Query Parameters:**
- `limit` (number): Number of items to return (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "item_id": "uuid",
        "item_name": "Rice",
        "category": "Grains",
        "popularity_score": 95,
        "in_stock": true
      }
    ],
    "count": 1
  }
}
```

**Error (500):**
```json
{
  "success": false,
  "message": "Failed to get popular items"
}
```

### GET /pantry/cart/suggestion
Get a personalized cart generation suggestion.

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "suggestion": "Based on your history, you might want to add rice, beans, and pasta to your cart. You haven't selected these items in a while."
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (500):**
```json
{
  "success": false,
  "message": "Failed to get cart suggestion"
}
```

## Notifications

### GET /notifications
Get all notifications for the authenticated user.

**Authentication:** Required

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `unread_only` (boolean): Only unread notifications

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "notification_id": "uuid",
      "user_id": "uuid",
      "title": "Food Available",
      "message": "Pizza is now available",
      "type": "food_alert|reservation|appointment",
      "read": false,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### GET /notifications/unread-count
Get count of unread notifications.

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "unread_count": 5
  }
}
```

### PUT /notifications/:id/read
Mark a notification as read.

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### PUT /notifications/read-all
Mark all notifications as read.

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

### DELETE /notifications/:id
Delete a notification.

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

## User Profile

### GET /users/profile
Get the authenticated user's profile information.

**Authentication:** Required (Bearer token)

**Request Example:**
```
GET /api/users/profile
Authorization: Bearer <jwt-token>
```

**Response (200) - Success:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "role": "student|provider|admin",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "dietary_preferences": [],
    "allergies": [],
    "preferred_food_types": []
  },
  "message": "Profile retrieved successfully"
}
```

**Response Fields:**
- `user_id` (string): Unique identifier for the user
- `email` (string): User's email address
- `role` (string): User role (student, provider, or admin)
- `created_at` (string): ISO 8601 timestamp when account was created
- `updated_at` (string): ISO 8601 timestamp when profile was last updated
- `dietary_preferences` (array): Array of dietary preferences (e.g., ["vegetarian", "vegan"]). Returns empty array if not set.
- `allergies` (array): Array of allergies (e.g., ["peanuts", "shellfish"]). Returns empty array if not set.
- `preferred_food_types` (array): Array of preferred food types (e.g., ["Italian", "Asian"]). Returns empty array if not set.

**Error (401) - Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (500) - Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

**Notes:**
- Preference fields (dietary_preferences, allergies, preferred_food_types) are always returned as arrays
- If preferences have not been set, they default to empty arrays
- This endpoint returns the authenticated user's own profile

### PUT /users/profile
Update the authenticated user's profile information.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "dietary_preferences": ["vegetarian", "vegan"],
  "allergies": ["peanuts"],
  "preferred_food_types": ["Italian", "Asian"],
  "notification_preferences": {
    "email_alerts": true,
    "push_notifications": false
  }
}
```

**Request Fields:**
- `email` (string, optional): New email address for the user
- `dietary_preferences` (array, optional): Array of dietary preferences
- `allergies` (array, optional): Array of allergies
- `preferred_food_types` (array, optional): Array of preferred food types
- `notification_preferences` (object, optional): Notification preference settings
  - `email_alerts` (boolean): Whether to receive email alerts
  - `push_notifications` (boolean): Whether to receive push notifications

**Request Example:**
```
PUT /api/users/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "dietary_preferences": ["vegetarian"],
  "allergies": ["shellfish"],
  "preferred_food_types": ["Italian", "Mexican"],
  "notification_preferences": {
    "email_alerts": true,
    "push_notifications": false
  }
}
```

**Response (200) - Success:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "role": "student",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "dietary_preferences": ["vegetarian"],
    "allergies": ["shellfish"],
    "preferred_food_types": ["Italian", "Mexican"]
  },
  "message": "Profile updated successfully"
}
```

**Response Fields:**
- `user_id` (string): Unique identifier for the user
- `email` (string): User's email address
- `role` (string): User role (student, provider, or admin)
- `created_at` (string): ISO 8601 timestamp when account was created
- `updated_at` (string): ISO 8601 timestamp when profile was last updated (updated to current time)
- `dietary_preferences` (array): Updated array of dietary preferences
- `allergies` (array): Updated array of allergies
- `preferred_food_types` (array): Updated array of preferred food types

**Error (400) - Invalid Request:**
```json
{
  "success": false,
  "message": "Invalid profile data"
}
```

**Error (401) - Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (500) - Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

**Notes:**
- Only the authenticated user can update their own profile
- Preference fields are optional; only provided fields will be updated
- If a preference field is not provided in the request, it will default to an empty array in the response
- `notification_preferences` is persisted to the `user_preferences` table alongside dietary and food type preferences
- Email updates may require verification depending on system configuration
- The `role` field cannot be updated through this endpoint

### PUT /users/:id/password
Change user password.

**Authentication:** Required (Bearer token)

**Path Parameters:**
- `id` (string, required): User ID

**Request Body:**
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword123"
}
```

**Request Fields:**
- `current_password` (string, required): User's current password for verification
- `new_password` (string, required): New password (minimum 8 characters recommended)

**Request Example:**
```
PUT /api/users/550e8400-e29b-41d4-a716-446655440000/password
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "current_password": "oldpassword123",
  "new_password": "newpassword123"
}
```

**Response (200) - Success:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error (400) - Invalid Request:**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

**Error (401) - Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (403) - Forbidden:**
```json
{
  "success": false,
  "message": "You can only change your own password"
}
```

**Error (500) - Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

**Notes:**
- Users can only change their own password
- Current password must be verified before allowing the change
- New password should meet minimum security requirements

## User Preferences

### GET /preferences/user/:userId
Get user preferences and dietary restrictions.

**Authentication:** Required

**Path Parameters:**
- `userId` (string, required): User ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "preferences": {
      "user_id": "uuid",
      "dietary_restrictions": ["vegetarian", "gluten-free"],
      "preferred_locations": ["Building A", "Building B"],
      "preferred_food_types": ["Italian", "Asian"],
      "notification_preferences": {
        "email_alerts": true,
        "push_notifications": true
      },
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  }
}
```

**Error (403):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Error (500):**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

### PUT /preferences/user/:userId
Update user preferences and dietary restrictions.

**Authentication:** Required

**Path Parameters:**
- `userId` (string, required): User ID

**Request Body:**
```json
{
  "dietary_restrictions": ["vegetarian", "vegan"],
  "preferred_locations": ["Building A", "Dining Hall"],
  "preferred_food_types": ["Italian", "Asian", "Mexican"],
  "notification_preferences": {
    "email_alerts": true,
    "push_notifications": false
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "preferences": {
      "user_id": "uuid",
      "dietary_restrictions": ["vegetarian", "vegan"],
      "preferred_locations": ["Building A", "Dining Hall"],
      "preferred_food_types": ["Italian", "Asian", "Mexican"],
      "notification_preferences": {
        "email_alerts": true,
        "push_notifications": false
      },
      "updated_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

**Error (403):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Error (500):**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

### POST /preferences/track/pantry-selection
Track a pantry item selection for preference learning.

**Authentication:** Required

**Request Body:**
```json
{
  "inventory_id": "uuid",
  "quantity": 2
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Pantry selection tracked"
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Error (500):**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

### POST /preferences/track/reservation
Track a reservation for preference learning.

**Authentication:** Required

**Request Body:**
```json
{
  "provider_id": "uuid",
  "listing_title": "Pizza",
  "category": "donation"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Reservation tracked"
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Error (500):**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

### POST /preferences/track/filter-application
Track filter application for preference learning.

**Authentication:** Required

**Request Body:**
```json
{
  "dietary": ["vegetarian"],
  "location": "Building A",
  "food_type": "Italian"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Filter application tracked"
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Error (500):**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

### GET /preferences/user/:userId/frequent-items
Get user's frequently selected items.

**Authentication:** Required

**Path Parameters:**
- `userId` (string, required): User ID

**Query Parameters:**
- `limit` (number): Number of items to return (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "item_id": "uuid",
        "item_name": "Rice",
        "frequency": 15,
        "last_selected": "2024-01-14T10:00:00Z"
      }
    ]
  }
}
```

**Error (403):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Error (500):**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

### GET /preferences/user/:userId/frequent-providers
Get user's frequently used providers.

**Authentication:** Required

**Path Parameters:**
- `userId` (string, required): User ID

**Query Parameters:**
- `limit` (number): Number of providers to return (default: 5)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "providers": [
      {
        "provider_id": "uuid",
        "provider_name": "Dining Hall A",
        "frequency": 12,
        "last_used": "2024-01-14T10:00:00Z"
      }
    ]
  }
}
```

**Error (403):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Error (500):**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

### GET /preferences/user/:userId/recommendations
Get personalized recommendations based on user preferences.

**Authentication:** Required

**Path Parameters:**
- `userId` (string, required): User ID

**Query Parameters:**
- `max_items` (number): Maximum recommendations to return (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "item_id": "uuid",
        "item_name": "Vegetarian Pasta",
        "reason": "matches_dietary_preference",
        "confidence": 0.95
      }
    ]
  }
}
```

**Error (403):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Error (500):**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

### GET /preferences/user/:userId/history
Get user's preference history and tracking events.

**Authentication:** Required

**Path Parameters:**
- `userId` (string, required): User ID

**Query Parameters:**
- `event_type` (string): Filter by event type (pantry_selection, reservation, filter_application)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "event_id": "uuid",
        "event_type": "pantry_selection",
        "item_name": "Rice",
        "timestamp": "2024-01-14T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 50,
      "total_pages": 3
    }
  }
}
```

**Error (403):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Error (500):**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Event Food

### GET /event-food
Get event food listings with optional filters. Returns transformed frontend-compatible format.

**Authentication:** Required (Bearer token)

**HTTP Method:** GET

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `available_now` (boolean): Only currently available events
- `dietary_filters` (string, comma-separated): Dietary filters (vegetarian, vegan, gluten-free)

**Request Example:**
```
GET /api/event-food?page=1&limit=10&available_now=true
Authorization: Bearer <jwt-token>
```

**Response (200) - Success:**
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "listing_id": "uuid",
        "provider_id": "uuid",
        "food_name": "Hot Dogs",
        "description": "Grilled hot dogs with toppings",
        "quantity": 100,
        "available_quantity": 75,
        "location": "Main Quad",
        "pickup_window_start": "2024-01-15T12:00:00Z",
        "pickup_window_end": "2024-01-15T18:00:00Z",
        "food_type": "American",
        "dietary_tags": ["vegetarian_option"],
        "listing_type": "event",
        "status": "active",
        "image_url": "https://storage.example.com/listings/hotdogs-123.jpg",
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T10:00:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 10
  }
}
```

**Response Fields:**
- `listing_id` (string): Unique identifier for the event food listing (mapped from backend `id`)
- `provider_id` (string): ID of the provider/organizer
- `food_name` (string): Name of the food item (mapped from backend `title`)
- `description` (string): Detailed description
- `quantity` (number): Total quantity available (mapped from backend `quantity_available`)
- `available_quantity` (number): Quantity still available for reservation (mapped from backend `quantity_available`)
- `location` (string): Event location (mapped from backend `pickup_location`)
- `pickup_window_start` (string): ISO 8601 timestamp when pickup starts (mapped from backend `available_from`)
- `pickup_window_end` (string): ISO 8601 timestamp when pickup ends (mapped from backend `available_until`)
- `food_type` (string): Type/cuisine of the food (mapped from backend `cuisine_type` or `category`)
- `dietary_tags` (array): Dietary information tags (mapped from backend `dietary_tags`, defaults to empty array)
- `listing_type` (string): Always "event" for event food
- `status` (string): Current status (active, inactive, expired)
- `image_url` (string): URL to the first image of the event food (mapped from backend `image_urls[0]`)
- `created_at` (string): ISO 8601 timestamp when listing was created
- `updated_at` (string): ISO 8601 timestamp when listing was last updated

**Data Transformation:**
This endpoint transforms backend database format to frontend API format:
- Backend `id` → Frontend `listing_id`
- Backend `title` → Frontend `food_name`
- Backend `quantity_available` → Frontend `quantity` and `available_quantity`
- Backend `pickup_location` → Frontend `location`
- Backend `available_from` → Frontend `pickup_window_start`
- Backend `available_until` → Frontend `pickup_window_end`
- Backend `cuisine_type` or `category` → Frontend `food_type`
- Backend `dietary_tags` (or empty array) → Frontend `dietary_tags`
- Backend `image_urls[0]` → Frontend `image_url`

**Error (400) - Invalid Parameters:**
```json
{
  "success": false,
  "message": "Invalid query parameters"
}
```

**Error (401) - Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (500) - Server Error:**
```json
{
  "success": false,
  "message": "Failed to get event food"
}
```

### GET /event-food/today
Get event food available today. Returns transformed frontend-compatible format.

**Authentication:** Required (Bearer token)

**HTTP Method:** GET

**Request Example:**
```
GET /api/event-food/today
Authorization: Bearer <jwt-token>
```

**Response (200) - Success:**
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "listing_id": "uuid",
        "provider_id": "uuid",
        "food_name": "Pizza",
        "description": "Fresh pizza slices",
        "quantity": 20,
        "available_quantity": 20,
        "location": "Dining Hall A",
        "pickup_window_start": "2024-01-15T12:00:00Z",
        "pickup_window_end": "2024-01-15T14:00:00Z",
        "food_type": "Italian",
        "dietary_tags": ["vegetarian"],
        "listing_type": "event",
        "status": "active",
        "image_url": "https://storage.example.com/listings/pizza-456.jpg",
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T10:00:00Z"
      }
    ],
    "total": 3,
    "date": "2024-01-15"
  }
}
```

**Response Fields:**
- `listings` (array): Array of event food listings available today (transformed to frontend format)
- `total` (number): Total count of today's event food listings
- `date` (string): Date in YYYY-MM-DD format

**Data Transformation:**
This endpoint transforms backend database format to frontend API format (same as GET /event-food):
- Backend `id` → Frontend `listing_id`
- Backend `title` → Frontend `food_name`
- Backend `quantity_available` → Frontend `quantity` and `available_quantity`
- Backend `pickup_location` → Frontend `location`
- Backend `available_from` → Frontend `pickup_window_start`
- Backend `available_until` → Frontend `pickup_window_end`
- Backend `cuisine_type` or `category` → Frontend `food_type`
- Backend `dietary_tags` (or empty array) → Frontend `dietary_tags`
- Backend `image_urls[0]` → Frontend `image_url`

**Filtering Logic:**
- Only returns listings where `available_from` < tomorrow AND `available_until` > today
- Automatically filters for today's date range

**Error (401) - Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (500) - Server Error:**
```json
{
  "success": false,
  "message": "Failed to get today's event food"
}
```

### GET /event-food/upcoming
Get upcoming event food. Returns transformed frontend-compatible format.

**Authentication:** Required (Bearer token)

**HTTP Method:** GET

**Query Parameters:**
- `days` (number): Number of days to look ahead (default: 7)

**Request Example:**
```
GET /api/event-food/upcoming?days=7
Authorization: Bearer <jwt-token>
```

**Response (200) - Success:**
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "listing_id": "uuid",
        "provider_id": "uuid",
        "food_name": "Taco Bar",
        "description": "Mexican taco bar with various toppings",
        "quantity": 50,
        "available_quantity": 50,
        "location": "Student Center",
        "pickup_window_start": "2024-01-16T11:00:00Z",
        "pickup_window_end": "2024-01-16T13:00:00Z",
        "food_type": "Mexican",
        "dietary_tags": ["vegan_option"],
        "listing_type": "event",
        "status": "active",
        "image_url": "https://storage.example.com/listings/tacos-789.jpg",
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T10:00:00Z"
      }
    ],
    "total": 8,
    "days": 7
  }
}
```

**Response Fields:**
- `listings` (array): Array of upcoming event food listings (transformed to frontend format)
- `total` (number): Total count of upcoming event food listings
- `days` (number): Number of days ahead that were searched

**Data Transformation:**
This endpoint transforms backend database format to frontend API format (same as GET /event-food):
- Backend `id` → Frontend `listing_id`
- Backend `title` → Frontend `food_name`
- Backend `quantity_available` → Frontend `quantity` and `available_quantity`
- Backend `pickup_location` → Frontend `location`
- Backend `available_from` → Frontend `pickup_window_start`
- Backend `available_until` → Frontend `pickup_window_end`
- Backend `cuisine_type` or `category` → Frontend `food_type`
- Backend `dietary_tags` (or empty array) → Frontend `dietary_tags`
- Backend `image_urls[0]` → Frontend `image_url`

**Filtering Logic:**
- Only returns listings where `available_from` > now AND `available_from` < (now + days)
- Automatically filters for future events within the specified day range

**Error (401) - Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (500) - Server Error:**
```json
{
  "success": false,
  "message": "Failed to get upcoming event food"
}
```

### GET /event-food/provider/:providerId
Get event food listings from a specific provider. Returns transformed frontend-compatible format.

**Authentication:** Required (Bearer token)

**HTTP Method:** GET

**Path Parameters:**
- `providerId` (string, required): Provider ID

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

**Request Example:**
```
GET /api/event-food/provider/550e8400-e29b-41d4-a716-446655440000?page=1&limit=10
Authorization: Bearer <jwt-token>
```

**Response (200) - Success:**
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "listing_id": "uuid",
        "provider_id": "550e8400-e29b-41d4-a716-446655440000",
        "food_name": "BBQ Chicken",
        "description": "Grilled BBQ chicken with sides",
        "quantity": 50,
        "available_quantity": 30,
        "location": "Quad Area",
        "pickup_window_start": "2024-01-15T17:00:00Z",
        "pickup_window_end": "2024-01-15T19:00:00Z",
        "food_type": "American",
        "dietary_tags": ["gluten-free_option"],
        "listing_type": "event",
        "status": "active",
        "image_url": "https://storage.example.com/listings/bbq-101.jpg",
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T10:00:00Z"
      }
    ],
    "total": 12,
    "page": 1,
    "limit": 10,
    "providerId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Response Fields:**
- `listings` (array): Array of event food listings from the provider (transformed to frontend format)
- `total` (number): Total count of provider's event food listings
- `page` (number): Current page number
- `limit` (number): Items per page
- `providerId` (string): The provider ID that was queried

**Data Transformation:**
This endpoint transforms backend database format to frontend API format (same as GET /event-food):
- Backend `id` → Frontend `listing_id`
- Backend `title` → Frontend `food_name`
- Backend `quantity_available` → Frontend `quantity` and `available_quantity`
- Backend `pickup_location` → Frontend `location`
- Backend `available_from` → Frontend `pickup_window_start`
- Backend `available_until` → Frontend `pickup_window_end`
- Backend `cuisine_type` or `category` → Frontend `food_type`
- Backend `dietary_tags` (or empty array) → Frontend `dietary_tags`
- Backend `image_urls[0]` → Frontend `image_url`

**Error (401) - Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (404) - Provider Not Found:**
```json
{
  "success": false,
  "message": "Provider not found"
}
```

**Error (500) - Server Error:**
```json
{
  "success": false,
  "message": "Failed to get provider event food"
}
```

**Notes:**
- This endpoint must be called before `GET /event-food/:id` to avoid route conflicts
- Route ordering: `/provider/:providerId` comes before `/:id`

### GET /event-food/:id
Get event food details by ID. Returns transformed frontend-compatible format.

**Authentication:** Required (Bearer token)

**HTTP Method:** GET

**Path Parameters:**
- `id` (string, required): Event food listing ID

**Request Example:**
```
GET /api/event-food/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <jwt-token>
```

**Response (200) - Success:**
```json
{
  "success": true,
  "data": {
    "listing_id": "550e8400-e29b-41d4-a716-446655440000",
    "provider_id": "uuid",
    "food_name": "BBQ Chicken",
    "description": "Grilled BBQ chicken with sides",
    "quantity": 50,
    "available_quantity": 30,
    "location": "Quad Area",
    "pickup_window_start": "2024-01-15T17:00:00Z",
    "pickup_window_end": "2024-01-15T19:00:00Z",
    "food_type": "American",
    "dietary_tags": ["gluten-free_option"],
    "listing_type": "event",
    "status": "active",
    "image_url": "https://storage.example.com/listings/bbq-101.jpg",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

**Response Fields:**
- `listing_id` (string): Unique identifier for the event food listing (mapped from backend `id`)
- `provider_id` (string): ID of the provider/organizer
- `food_name` (string): Name of the food item (mapped from backend `title`)
- `description` (string): Detailed description of the food
- `quantity` (number): Total quantity available (mapped from backend `quantity_available`)
- `available_quantity` (number): Quantity still available for reservation (mapped from backend `quantity_available`)
- `location` (string): Event location/pickup location (mapped from backend `pickup_location`)
- `pickup_window_start` (string): ISO 8601 timestamp when pickup starts (mapped from backend `available_from`)
- `pickup_window_end` (string): ISO 8601 timestamp when pickup ends (mapped from backend `available_until`)
- `food_type` (string): Type/cuisine of the food (mapped from backend `cuisine_type` or `category`)
- `dietary_tags` (array): Dietary information tags (vegetarian, vegan, gluten-free, etc.) (mapped from backend `dietary_tags`)
- `listing_type` (string): Always "event" for event food listings
- `status` (string): Current status (active, inactive, expired)
- `image_url` (string): URL to the first image of the event food (mapped from backend `image_urls[0]`)
- `created_at` (string): ISO 8601 timestamp when listing was created
- `updated_at` (string): ISO 8601 timestamp when listing was last updated

**Data Transformation:**
This endpoint transforms backend database format to frontend API format:
- Backend `id` → Frontend `listing_id`
- Backend `title` → Frontend `food_name`
- Backend `quantity_available` → Frontend `quantity` and `available_quantity`
- Backend `pickup_location` → Frontend `location`
- Backend `available_from` → Frontend `pickup_window_start`
- Backend `available_until` → Frontend `pickup_window_end`
- Backend `cuisine_type` or `category` → Frontend `food_type`
- Backend `dietary_tags` (or empty array) → Frontend `dietary_tags`
- Backend `image_urls[0]` → Frontend `image_url`

**Error (401) - Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (404) - Not Found:**
```json
{
  "success": false,
  "message": "Event food not found"
}
```

**Error (500) - Server Error:**
```json
{
  "success": false,
  "message": "Failed to get event food details"
}
```

**Notes:**
- This endpoint is called after `/provider/:providerId` to avoid route conflicts
- Route ordering is critical: `/provider/:providerId` must come before `/:id`
- Only returns listings where `category` equals 'event_food'

## Google Calendar Integration

### GET /auth/google/calendar
Initiate the Google Calendar OAuth 2.0 authorization flow. Redirects the user to Google's consent screen.

**Authentication:** Required (Bearer token)

**Request Example:**
```
GET /api/auth/google/calendar
Authorization: Bearer <jwt-token>
```

**Response (302) - Redirect:**
Redirects to Google's OAuth consent page requesting the `https://www.googleapis.com/auth/calendar.events` scope.

**Error (500) - Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

**Notes:**
- The user's ID is encoded in the OAuth `state` parameter (base64 JSON) to associate the callback with the correct account
- `access_type: offline` and `prompt: consent` are set to ensure a refresh token is always returned
- After granting access, Google redirects to `GET /api/auth/google/calendar/callback`

---

### GET /auth/google/calendar/callback
Handle the OAuth 2.0 callback from Google after the user grants or denies calendar access.

**Authentication:** Not required (callback from Google)

**Query Parameters:**
- `code` (string): Authorization code from Google (present on success)
- `state` (string): Base64-encoded JSON containing `{ userId }` (set during initiation)
- `error` (string): Error string from Google (present on denial/failure)

**Request Example:**
```
GET /api/auth/google/calendar/callback?code=4/0AX4XfWh...&state=eyJ1c2VySWQiOiJ1dWlkIn0=
```

**Response (302) - Success Redirect:**
Redirects to `<FRONTEND_URL>/profile?calendar=connected`

**Response (400) - OAuth Denied:**
```json
{
  "error": "OAuth authorization failed",
  "details": "access_denied"
}
```

**Response (400) - Missing Parameters:**
```json
{
  "error": "Missing code or state parameter"
}
```

**Response (400) - Invalid State:**
```json
{
  "error": "Invalid state parameter"
}
```

**Error (500) - Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

**Notes:**
- On success, the access token, refresh token, and expiry are stored via `CalendarTokenRepository.upsert()`
- If `expiry_date` is not provided by Google, the token expiry defaults to 1 hour from now
- The `FRONTEND_URL` environment variable controls the redirect destination (default: `http://localhost:5173`)

---

### DELETE /auth/google/calendar
Disconnect the authenticated user's Google Calendar integration.

**Authentication:** Required (Bearer token)

**Request Example:**
```
DELETE /api/auth/google/calendar
Authorization: Bearer <jwt-token>
```

**Response (204) - Success:**
No content.

**Error (401) - Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (500) - Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

**Notes:**
- Calls `CalendarService.disconnectUser()` which revokes the stored tokens for the user
- Returns `204 No Content` on success with no response body

---

### GET /auth/google/calendar/status
Check whether the authenticated user has connected their Google Calendar.

**Authentication:** Required (Bearer token)

**Request Example:**
```
GET /api/auth/google/calendar/status
Authorization: Bearer <jwt-token>
```

**Response (200) - Success:**
```json
{
  "connected": true
}
```

**Response Fields:**
- `connected` (boolean): `true` if the user has an active Google Calendar connection, `false` otherwise

**Error (401) - Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Error (500) - Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

**Notes:**
- Calls `CalendarService.isConnected()` to check for a valid stored token
- Use this endpoint to conditionally show/hide the "Connect Google Calendar" UI

---

### POST /auth/google/calendar/events
Create a Google Calendar event directly for the authenticated user.

**Authentication:** Required (Bearer token)

**Request Body:**
- `title` (string, required): Title of the calendar event
- `start_time` (string, required): ISO 8601 datetime string for the event start
- `end_time` (string, required): ISO 8601 datetime string for the event end
- `description` (string, optional): Description or notes for the event

**Request Example:**
```
POST /api/auth/google/calendar/events
Authorization: Bearer <jwt-token>
Content-Type: application/json
```
```json
{
  "title": "FoodBridge Pantry Appointment",
  "start_time": "2026-03-20T10:00:00Z",
  "end_time": "2026-03-20T10:30:00Z",
  "description": "Pantry pickup appointment booked via FoodBridge"
}
```

**Response (201) - Success:**
```json
{
  "success": true,
  "data": {
    "google_event_id": "abc123xyz"
  }
}
```

**Error (400) - Missing Required Fields:**
```json
{
  "success": false,
  "message": "title, start_time, and end_time are required"
}
```

**Error (403) - Calendar Not Connected:**
```json
{
  "success": false,
  "message": "Google Calendar not connected",
  "not_connected": true
}
```

**Error (500) - Event Creation Failed:**
```json
{
  "success": false,
  "message": "Failed to create calendar event"
}
```

**Response Fields:**
- `data.google_event_id` (string): The ID of the newly created Google Calendar event

**Notes:**
- Requires the user to have previously connected their Google Calendar via `GET /auth/google/calendar`
- `start_time` and `end_time` are parsed as `Date` objects; any valid ISO 8601 string is accepted
- When `not_connected: true` is returned in the 403 response, the caller (e.g. the AI agent) should prompt the user to connect their calendar first
- This endpoint is non-blocking from the caller's perspective — errors from Google's API surface as a 500 rather than silently failing

---

## Health Check

### GET /health
Check API server health.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:00:00Z",
  "uptime": 3600.5
}
```

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

### Common Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Rate Limiting

- Chat endpoint: 20 requests per minute per user
- General API: 1000 requests per 15 minutes per IP (development: unlimited)

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

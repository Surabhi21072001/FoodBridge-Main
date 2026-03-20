# Implementation Plan: Google Calendar Integration

## Overview

Implement Google Calendar sync for pantry appointments. The work is split into: database migration, backend OAuth flow, CalendarService, pantry controller extensions, and the React profile UI component.

## Tasks

- [x] 1. Database migration
  - Add `google_calendar_tokens` table with columns: `id`, `user_id` (unique FK to users), `access_token`, `refresh_token`, `expires_at`, `is_connected`, `created_at`, `updated_at`
  - Add nullable `google_event_id TEXT` column to `pantry_appointments` table
  - _Requirements: 1.2, 2.1, 4.1_

- [ ] 2. CalendarTokenRepository
  - [x] 2.1 Implement `CalendarTokenRepository` in `backend/src/repositories/calendarTokenRepository.ts`
    - Implement `upsert`, `findByUserId`, `updateAccessToken`, `deleteByUserId` methods using the existing pg/knex pattern from other repositories
    - _Requirements: 1.2, 1.4, 3.2_

  - [x] 2.2 Write property test for CalendarTokenRepository round-trip
    - **Property 8: OAuth token storage round-trip**
    - **Validates: Requirements 1.2**
    - Use `fast-check` to generate arbitrary token records; verify upsert then findByUserId returns equivalent data

- [ ] 3. CalendarService — core token management
  - [x] 3.1 Implement `CalendarService` in `backend/src/services/calendarService.ts`
    - Implement `isConnected`, `disconnectUser`, and `getValidAccessToken` (with refresh logic using `googleapis` or `google-auth-library`)
    - On refresh failure, call `updateAccessToken` with `is_connected = false` and return null
    - _Requirements: 1.4, 3.1, 3.2, 3.3_

  - [x] 3.2 Write property test for token refresh behavior
    - **Property 4: Token refresh preserves access**
    - **Validates: Requirements 3.1, 3.2**
    - Use `fast-check` to generate expired token records with valid refresh tokens; mock Google token endpoint; verify non-null return and persisted new token

  - [x] 3.3 Write property test for revoked refresh token
    - **Property 5: Revoked refresh token disconnects user**
    - **Validates: Requirements 3.3**
    - Use `fast-check` to generate token records; mock Google token endpoint to return 400; verify null return and `is_connected = false`

- [ ] 4. CalendarService — event creation and deletion
  - [x] 4.1 Implement `createEvent` and `deleteEvent` on `CalendarService`
    - `createEvent`: call Google Calendar API `POST /calendars/primary/events`; store returned `googleEventId`; catch all errors and return `{ success: false, error }` without throwing
    - `deleteEvent`: call `DELETE /calendars/primary/events/{eventId}`; treat 404 as success; catch all other errors and return `{ success: false, error }` without throwing
    - _Requirements: 2.1, 2.2, 2.3, 4.1_

  - [x] 4.2 Write property test for booking with connected calendar
    - **Property 1: Booking with connected calendar always attempts event creation**
    - **Validates: Requirements 2.1, 2.2, 2.3**
    - Use `fast-check` to generate appointment inputs; mock Google API; verify createEvent called with matching title, start/end times, and notes

  - [x] 4.3 Write property test for calendar failure does not fail booking
    - **Property 2: Calendar failure does not fail the booking**
    - **Validates: Requirements 2.5**
    - Use `fast-check` to generate appointment inputs; mock createEvent to throw; verify booking result is still `success: true`

  - [x] 4.4 Write property test for booking without connected calendar
    - **Property 3: Booking without connected calendar skips event creation**
    - **Validates: Requirements 2.4**
    - Use `fast-check` to generate appointment inputs for users with no token; verify createEvent is never called

  - [x] 4.5 Write property test for cancellation with connected calendar
    - **Property 6: Cancellation with connected calendar deletes event**
    - **Validates: Requirements 4.1**
    - Use `fast-check` to generate appointments with `google_event_id`; verify deleteEvent called with correct ID

  - [x] 4.6 Write property test for calendar deletion failure does not fail cancellation
    - **Property 7: Calendar deletion failure does not fail cancellation**
    - **Validates: Requirements 4.3**
    - Use `fast-check` to generate appointments; mock deleteEvent to throw; verify cancellation result is still `success: true`

- [x] 5. Checkpoint — Ensure all CalendarService tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. OAuth routes
  - [x] 6.1 Add OAuth routes to `backend/src/routes/authRoutes.ts`
    - `GET /api/auth/google/calendar` — build Google OAuth URL with `calendar.events` scope and redirect
    - `GET /api/auth/google/calendar/callback` — exchange code for tokens, call `CalendarTokenRepository.upsert`, redirect to `/profile?calendar=connected`
    - `DELETE /api/auth/google/calendar` — call `CalendarService.disconnectUser`, return 204
    - `GET /api/auth/google/calendar/status` — call `CalendarService.isConnected`, return `{ connected: boolean }`
    - All routes require JWT auth middleware except the callback (which uses the `state` param to identify the user)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ] 6.2 Write unit tests for OAuth routes
    - Test callback stores tokens correctly
    - Test callback with `error` query param returns 400 and leaves status unchanged (**Property 10: OAuth failure leaves status unchanged**, Validates: Requirements 1.5)
    - Test disconnect calls `disconnectUser` and returns 204
    - Test status endpoint returns correct `connected` value

- [x] 7. Extend pantry appointment controller
  - [x] 7.1 Extend `POST /pantry/appointments` handler in `backend/src/controllers/pantryAppointmentController.ts`
    - After successful DB insert, call `CalendarService.createEvent(userId, { title: "FoodBridge Pantry Appointment", startTime, endTime, description: notes })`
    - If `createEvent` returns a `googleEventId`, update the appointment row with it
    - If `createEvent` fails, log the error and continue — do not change the HTTP response
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 7.2 Extend `DELETE /pantry/appointments/cancel-by-datetime` handler
    - Before deleting the appointment, fetch the `google_event_id` from the appointment row
    - If `google_event_id` is present, call `CalendarService.deleteEvent(userId, googleEventId)`
    - If `deleteEvent` fails, log the error and continue — do not change the HTTP response
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 7.3 Write property test for disconnect then create skips Google API
    - **Property 9: Disconnect removes token and blocks calendar operations**
    - **Validates: Requirements 1.4**
    - Use `fast-check` to generate users; disconnect them; verify `isConnected` returns false and `createEvent` never calls Google API

- [x] 8. Checkpoint — Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Frontend calendar service
  - [x] 9.1 Create `foodbridge-frontend/src/services/calendarService.ts`
    - Implement `getStatus(): Promise<{ connected: boolean }>` calling `GET /api/auth/google/calendar/status`
    - Implement `disconnect(): Promise<void>` calling `DELETE /api/auth/google/calendar`
    - _Requirements: 5.1, 5.3, 5.4_

- [x] 10. GoogleCalendarConnect component
  - [x] 10.1 Create `foodbridge-frontend/src/components/profile/GoogleCalendarConnect.tsx`
    - On mount, call `calendarService.getStatus()` and store result in local state
    - When disconnected: render "Connect Google Calendar" button as an `<a>` pointing to `/api/auth/google/calendar`
    - When connected: render connected status indicator and "Disconnect Google Calendar" button
    - On disconnect click: call `calendarService.disconnect()` and update local state to disconnected
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 10.2 Write unit tests for GoogleCalendarConnect
    - Test renders connect button when status is disconnected (Validates: Requirements 5.1)
    - Test renders disconnect button and indicator when status is connected (Validates: Requirements 5.3)
    - Test disconnect button calls service and updates UI state (Validates: Requirements 5.4)

- [x] 11. Wire GoogleCalendarConnect into ProfilePage
  - Import and render `<GoogleCalendarConnect />` inside `foodbridge-frontend/src/pages/ProfilePage.tsx`
  - Handle the `?calendar=connected` query param on mount to show a success toast
  - _Requirements: 5.1, 5.3_

- [ ] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- `fast-check` is already used in the project — no new testing library needed
- The `googleapis` npm package is the recommended Google API client for Node.js
- Calendar errors are always logged via `backend/src/utils/logger.ts` and never surfaced to the user as booking failures
- The `state` parameter in the OAuth flow should encode the user's JWT or user ID to identify them in the callback

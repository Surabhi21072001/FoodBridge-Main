# Implementation Plan: FoodBridge Frontend

## Overview

This implementation plan covers the development of the FoodBridge frontend React application. The implementation follows a layered approach, starting with core infrastructure, then building out authentication, shared components, and finally implementing feature-specific pages. Testing is integrated throughout to ensure correctness at each stage.

## Tasks

- [x] 1. Set up project infrastructure and core configuration
  - Initialize React project with Vite and TypeScript
  - Configure Tailwind CSS with custom theme (colors, spacing, typography)
  - Set up ESLint, Prettier, and TypeScript configuration
  - Configure React Router v6
  - Set up testing framework (Jest + React Testing Library + fast-check)
  - Create project directory structure (components, pages, services, utils)
  - _Requirements: 16.1, 16.2, 16.3_

- [x] 2. Implement API client and HTTP communication layer
  - [x] 2.1 Create Axios-based API client with interceptors
    - Configure base URL and timeout
    - Implement request interceptor for JWT token injection
    - Implement response interceptor for error handling and 401 redirects
    - Support all HTTP methods (GET, POST, PUT, PATCH, DELETE)
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_
  
  - [x] 2.2 Write property test for API client authentication
    - **Property 75: Authenticated requests include JWT token**
    - **Validates: Requirements 16.1**
  
  - [x] 2.3 Write property test for API client error handling
    - **Property 79: API errors are thrown with response details**
    - **Validates: Requirements 16.5**

- [x] 3. Implement authentication services and state management
  - [x] 3.1 Create authentication service
    - Implement login, register, logout functions
    - Implement getCurrentUser function
    - Store and retrieve JWT token from session storage
    - _Requirements: 1.2, 1.3, 1.5, 1.6_
  
  - [x] 3.2 Create authentication context and provider
    - Implement AuthContext with user state, token, isAuthenticated
    - Implement login, logout functions in context
    - Restore authentication state from session storage on app load
    - _Requirements: 17.1, 17.6, 17.7_
  
  - [x] 3.3 Write property test for login flow
    - **Property 1: Valid login credentials store JWT token**
    - **Validates: Requirements 1.2**
  
  - [x] 3.4 Write property test for logout flow
    - **Property 4: Logout clears authentication state (round-trip)**
    - **Validates: Requirements 1.6**
  
  - [x] 3.5 Write property test for session persistence
    - **Property 86: Authentication state persists to session storage (round-trip)**
    - **Validates: Requirements 17.6, 17.7**

- [ ] 4. Build shared UI components
  - [x] 4.1 Create Button component with variants and sizes
    - Implement primary, secondary, danger, ghost variants
    - Implement sm, md, lg sizes
    - Add loading state with spinner
    - Add disabled state
    - _Requirements: 12.7, 14.3_
  
  - [x] 4.2 Create Input component with validation states
    - Implement base input with error state styling
    - Add error message display
    - Add disabled state
    - _Requirements: 12.1, 12.2_
  
  - [x] 4.3 Create Card component with header, body, footer
    - Implement base card styling
    - Create CardHeader, CardBody, CardFooter subcomponents
    - Add hover effects
    - _Requirements: 3.1, 4.1_
  
  - [x] 4.4 Create Modal component
    - Implement modal with backdrop
    - Add focus trap and escape key handling
    - Add ARIA attributes for accessibility
    - _Requirements: 5.1, 18.2, 18.4_
  
  - [x] 4.5 Create LoadingSpinner component
    - Implement spinner with size variants
    - Add ARIA live region
    - _Requirements: 14.1, 14.2_
  
  - [x] 4.6 Create Toast notification system
    - Implement toast container and toast component
    - Support success, error, warning, info variants
    - Implement auto-dismiss and manual dismiss
    - _Requirements: 13.6, 13.7, 13.8_
  
  - [x] 4.7 Write unit tests for shared components
    - Test Button variants and states
    - Test Input error display
    - Test Modal open/close and accessibility
    - Test Toast auto-dismiss timing

- [ ] 5. Implement authentication pages and protected routes
  - [x] 5.1 Create LoginForm component
    - Implement email and password inputs with validation
    - Implement form submission with loading state
    - Display error messages
    - _Requirements: 1.2, 1.3, 12.3, 12.4_
  
  - [x] 5.2 Create RegisterForm component
    - Implement registration form with role selection
    - Implement password confirmation validation
    - Implement form submission
    - _Requirements: 1.5, 12.2, 12.4_
  
  - [x] 5.3 Create ProtectedRoute component
    - Check authentication state
    - Redirect to login if not authenticated
    - Support role-based access control
    - _Requirements: 2.1, 2.2_
  
  - [x] 5.4 Write property test for route protection
    - **Property 7: Unauthenticated users are redirected from protected routes**
    - **Validates: Requirements 2.2**
  
  - [x] 5.5 Write property test for form validation
    - **Property 61: Validation errors are displayed for invalid inputs**
    - **Validates: Requirements 12.2, 12.3, 12.4, 12.5, 12.6**

- [x] 6. Checkpoint - Ensure authentication and shared components work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement navigation and layout
  - [x] 7.1 Create Navigation component
    - Implement navigation menu with links
    - Add notification badge with unread count
    - Implement logout button
    - Add responsive mobile menu
    - _Requirements: 2.4, 8.4, 15.4_
  
  - [x] 7.2 Create Layout component
    - Implement page structure with navigation
    - Add responsive container
    - Integrate ChatWidget
    - _Requirements: 2.4, 10.1_
  
  - [x] 7.3 Write property test for navigation menu presence
    - **Property 9: Navigation menu present on all authenticated pages**
    - **Validates: Requirements 2.4**

- [ ] 8. Implement service layer for backend API communication
  - [x] 8.1 Create ListingsService
    - Implement getListings with pagination and filters
    - Implement getListingById, createListing, updateListing, deleteListing
    - Implement getProviderListings
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 11.3, 11.4, 11.6, 11.7_
  
  - [x] 8.2 Create ReservationsService
    - Implement createReservation, getStudentReservations, cancelReservation
    - Implement getListingReservations
    - _Requirements: 5.2, 5.5, 5.6, 11.8_
  
  - [x] 8.3 Create PantryService
    - Implement getInventory, getAvailableSlots, bookAppointment
    - Implement getStudentAppointments, cancelAppointment
    - Implement generateSmartCart
    - _Requirements: 6.1, 6.2, 6.5, 6.7, 6.8, 13.2_
  
  - [x] 8.4 Create NotificationsService
    - Implement getNotifications, markAsRead, deleteNotification
    - Implement getUnreadCount
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [x] 8.5 Create ProfileService
    - Implement getProfile, updateProfile
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [x] 8.6 Create EventsService
    - Implement getEventFood, getVolunteerOpportunities
    - Implement signUpForVolunteer, cancelVolunteerSignup
    - _Requirements: 7.1, 7.2, 7.5_
  
  - [x] 8.7 Create ChatService
    - Implement sendMessage, getSessionHistory, createSession
    - _Requirements: 10.3, 10.7_
  
  - [x] 8.8 Implement optimistic UI updates
    - Implement optimistic updates for reservations
    - Optimistically update pantry cart changes
    - Optimistically mark notifications as read
    - Roll back UI changes if API request fails
    - _Requirements: 5.4, 6.3, 8.2_

- [ ] 9. Implement food listings page and components
  - [x] 9.1 Create ListingCard component
    - Display listing summary (name, location, quantity, pickup window)
    - Show dietary tags
    - Add reserve button for students
    - Add edit/delete buttons for providers
    - _Requirements: 4.6, 11.1_
  
  - [x] 9.2 Create ListingFilters component
    - Implement filter controls for dietary, location, food type
    - Display active filters as removable tags
    - Display filter count
    - _Requirements: 4.2, 4.3, 4.4, 20.1, 20.4, 20.5_
  
  - [x] 9.3 Implement listings search bar
    - Add keyword search input above filters
    - Allow searching by food name, cuisine, provider
    - Trigger search queries through ListingsService
    - _Requirements: 4.1, 20.1_
  
  - [x] 9.4 Create ListingsPage with infinite scroll
    - Fetch and display listings
    - Implement infinite scroll with Intersection Observer
    - Integrate ListingFilters
    - Display empty state when no listings
    - _Requirements: 4.1, 4.5, 19.1, 19.2_
  
  - [x] 9.5 Create ListingDetail component
    - Display full listing information
    - Show reservation form for students
    - Show reservations list for providers
    - _Requirements: 4.6, 5.1, 11.8_
  
  - [x] 9.6 Implement real-time updates for listings
    - Implement polling (every 30 seconds) for new food listings
    - Refresh reservation availability automatically
    - Update listing quantities when reservations change
    - _Requirements: 4.1, 5.4_
  
  - [x] 9.7 Write property test for filter application
    - **Property 16: Filters are applied correctly to search results**
    - **Validates: Requirements 4.2, 4.3, 4.4, 20.2, 20.6**
  
  - [x] 9.8 Write property test for listings display
    - **Property 19: Listings are ordered by pickup time**
    - **Validates: Requirements 4.7**
  
  - [x] 9.9 Write property test for filter state persistence
    - **Property 20: Filter state persists across navigation**
    - **Validates: Requirements 20.7**

- [ ] 10. Implement reservation functionality
  - [x] 10.1 Create ReservationForm component
    - Implement quantity selection
    - Validate quantity against available_quantity
    - Handle form submission
    - _Requirements: 5.1, 5.2, 12.5_
  
  - [x] 10.2 Add reservation logic to ListingDetail
    - Display reservation form
    - Handle successful reservation (update quantity, show confirmation)
    - Handle reservation errors
    - _Requirements: 5.2, 5.3, 5.4_
  
  - [x] 10.3 Create ReservationsList component
    - Display user's active reservations
    - Implement cancel reservation functionality
    - _Requirements: 5.5, 5.6_
  
  - [x] 10.4 Write property test for reservation confirmation
    - **Property 22: Valid reservation displays confirmation**
    - **Validates: Requirements 5.2**
  
  - [x] 10.5 Write property test for quantity update
    - **Property 23: Successful reservation updates available quantity immediately**
    - **Validates: Requirements 5.4**

- [ ] 11. Implement provider listing management
  - [x] 11.1 Create CreateListingForm component
    - Implement all listing fields with validation
    - Validate pickup window is in future
    - Handle image upload with preview
    - _Requirements: 11.2, 11.3, 12.6_
  
  - [x] 11.2 Create EditListingForm component
    - Pre-fill form with existing listing data
    - Handle listing updates
    - _Requirements: 11.5, 11.6_
  
  - [x] 11.3 Add provider-specific UI to ListingsPage
    - Display create listing button for providers
    - Show provider's listings
    - Add edit/delete actions
    - _Requirements: 11.1, 11.4, 11.7_
  
  - [x] 11.4 Write property test for listing creation
    - **Property 54: Valid listing creation displays success**
    - **Validates: Requirements 11.3**
  
  - [x] 11.5 Write property test for edit form pre-fill
    - **Property 56: Edit form is pre-filled with existing data**
    - **Validates: Requirements 11.5**

- [x] 12. Checkpoint - Ensure listings and reservations work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement dashboard pages
  - [x] 13.1 Create StudentDashboard component
    - Display recent listings matching preferences
    - Display upcoming reservations and appointments
    - Display recent notifications
    - Add quick action buttons
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 13.2 Create ProviderDashboard component
    - Display provider's active listings
    - Display reservation statistics
    - Add create listing button
    - _Requirements: 3.5_
  
  - [x] 13.3 Implement dashboard data refresh on navigation
    - Fetch fresh data when navigating to dashboard
    - _Requirements: 3.6_
  
  - [x] 13.4 Write property test for dashboard personalization
    - **Property 10: Student dashboard displays personalized listings**
    - **Validates: Requirements 3.1**
  
  - [x] 13.5 Write property test for dashboard data display
    - **Property 11: Dashboard displays user's reservations and appointments**
    - **Validates: Requirements 3.2**

- [ ] 14. Implement pantry page and components
  - [x] 14.1 Create PantryInventory component
    - Display pantry items in grid
    - Show availability status
    - Add to cart functionality
    - _Requirements: 6.1_
  
  - [x] 14.2 Create PantryCart component
    - Display selected items with quantities
    - Allow quantity adjustment and item removal
    - Show total item count
    - _Requirements: 6.3_
  
  - [x] 14.3 Create AppointmentSlots component
    - Display available time slots
    - Highlight selected slot
    - Disable booked slots
    - _Requirements: 6.2, 6.4_
  
  - [x] 14.4 Implement smart pantry cart UI
    - Add "Generate Smart Cart" button
    - Call generateSmartCart() API
    - Display recommended pantry items
    - Allow user to edit items before confirming
    - Add selected items to PantryCart
    - _Requirements: 6.3_
  
  - [x] 14.5 Create PantryPage
    - Integrate inventory, cart, and appointment slots
    - Handle appointment booking
    - Display appointments list
    - _Requirements: 6.1, 6.2, 6.5, 6.6, 6.7, 6.8_
  
  - [x] 14.6 Write property test for cart functionality
    - **Property 27: Selected items are added to cart**
    - **Validates: Requirements 6.3**
  
  - [x] 14.7 Write property test for appointment booking
    - **Property 28: Appointment booking displays confirmation**
    - **Validates: Requirements 6.6**

- [ ] 15. Implement events page
  - [x] 15.1 Create EventFoodList component
    - Display event food listings
    - Show reservation options
    - _Requirements: 7.1, 7.3_
  
  - [x] 15.2 Create VolunteerOpportunities component
    - Display volunteer opportunities
    - Show sign-up button
    - Disable button when full
    - _Requirements: 7.2, 7.4, 7.6_
  
  - [x] 15.3 Create EventsPage
    - Integrate event food and volunteer components
    - Handle volunteer signup
    - _Requirements: 7.1, 7.2, 7.5_
  
  - [x] 15.4 Write property test for volunteer signup
    - **Property 34: Volunteer signup displays confirmation**
    - **Validates: Requirements 7.5**
  
  - [x] 15.5 Write property test for full opportunities
    - **Property 35: Full volunteer opportunities disable sign-up button**
    - **Validates: Requirements 7.6**

- [ ] 16. Implement notifications page
  - [x] 16.1 Create NotificationItem component
    - Display notification with type icon, message, timestamp
    - Handle mark as read
    - Handle delete
    - _Requirements: 8.2, 8.3_
  
  - [x] 16.2 Create NotificationsPage
    - Fetch and display notifications ordered by timestamp
    - Group notifications by type
    - Display empty state
    - _Requirements: 8.1, 8.6_
  
  - [ ] 16.3 Create NotificationBadge component
    - Display unread count in navigation
    - Update count when new notifications arrive
    - _Requirements: 8.4, 8.5_
  
  - [x] 16.4 Implement real-time notification updates
    - Implement polling (every 30 seconds) for new notifications
    - Update notifications in real time
    - Update notification badge count automatically
    - _Requirements: 8.4, 8.5_
  
  - [ ] 16.5 Write property test for notification ordering
    - **Property 36: Notifications are ordered by timestamp descending**
    - **Validates: Requirements 8.1**
  
  - [ ] 16.6 Write property test for notification badge
    - **Property 39: Notification badge displays unread count**
    - **Validates: Requirements 8.4**

- [ ] 17. Implement profile page
  - [x] 17.1 Create ProfileForm component
    - Display user email and role as read-only
    - Implement editable fields for preferences
    - Handle form submission
    - Display field-specific errors
    - _Requirements: 9.1, 9.6, 9.7_
  
  - [x] 17.2 Create PreferencesForm component
    - Implement dietary preferences, allergies, food types
    - Implement notification preferences
    - _Requirements: 9.2, 9.3, 9.4, 9.5_
  
  - [x] 17.3 Create ProfilePage
    - Integrate profile and preferences forms
    - Handle profile updates with success messages
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [x] 17.4 Write property test for profile updates
    - **Property 43: Profile updates display success messages**
    - **Validates: Requirements 9.2, 9.3, 9.4, 9.5**
  
  - [x] 17.5 Write property test for validation errors
    - **Property 44: Invalid profile updates display field-specific errors**
    - **Validates: Requirements 9.6**

- [x] 18. Checkpoint - Ensure all pages work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 19. Implement chat widget
  - [x] 19.1 Create ChatMessage component
    - Render message with markdown support
    - Display timestamp and avatar
    - Apply user/assistant styling
    - _Requirements: 10.10_
  
  - [x] 19.2 Create ChatInput component
    - Implement text input with send button
    - Handle Enter key to send
    - Disable during loading
    - _Requirements: 10.3_
  
  - [x] 19.3 Create ToolExecutionFeedback component
    - Display tool execution status
    - Show loading indicator during execution
    - Display formatted results
    - _Requirements: 10.5, 10.6_
  
  - [x] 19.4 Create tool result rendering components
    - Implement renderToolResult function
    - Create compact versions of ListingCard, NotificationItem, etc.
    - _Requirements: 10.6_
  
  - [x] 19.5 Implement AI chat result rendering
    - Create renderToolResult() utility function
    - Render AI search results using ListingCard component
    - Render reservation confirmations using confirmation card
    - Render pantry slot results using AppointmentSlots component
    - Render smart pantry cart results using PantryCart component
    - Render notification results using NotificationItem component
    - Display tool execution loading indicators
    - _Requirements: 10.6_
  
  - [x] 19.6 Create ChatWidget component
    - Implement collapsible widget
    - Maintain conversation history
    - Integrate ChatMessage, ChatInput, ToolExecutionFeedback
    - Persist history in session storage
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.7, 10.8, 10.9_
  
  - [x] 19.7 Implement chat quick actions
    - Display suggested prompts above chat input
    - Implement quick action buttons (Find discounted food, Book pantry appointment, Show dining deals, Show food events)
    - Send message to AI agent when quick action is clicked
    - _Requirements: 10.3_
  
  - [x] 19.8 Implement chat history retrieval
    - Fetch conversation history from backend using getSessionHistory()
    - Load messages when chat widget opens
    - Merge backend history with session storage cache
    - Maintain session continuity across page reloads
    - _Requirements: 10.7, 10.8_
  
  - [x] 19.9 Write property test for chat widget accessibility
    - **Property 45: Chat widget is accessible on all authenticated pages**
    - **Validates: Requirements 10.1**
  
  - [x] 19.10 Write property test for conversation history
    - **Property 50: Conversation history is maintained within session**
    - **Validates: Requirements 10.7**
  
  - [x] 19.11 Write property test for history persistence
    - **Property 51: Conversation history persists across widget toggles**
    - **Validates: Requirements 10.8**

- [ ] 20. Implement image handling
  - [x] 20.1 Create ImageUploadPreview component
    - Implement file input with validation
    - Generate and display preview
    - Handle file removal
    - _Requirements: 11.3_
  
  - [x] 20.2 Create LazyImage component
    - Implement lazy loading with Intersection Observer
    - Display placeholder while loading
    - _Requirements: 14.4_
  
  - [x] 20.3 Create ImageWithFallback component
    - Handle image load errors
    - Display fallback placeholder
    - _Requirements: 11.3_
  
  - [x] 20.4 Write unit tests for image components
    - Test image upload validation
    - Test lazy loading behavior
    - Test fallback on error

- [ ] 21. Implement error handling and loading states
  - [ ] 21.1 Create ErrorBoundary components
    - Implement root, page, and component level error boundaries
    - Display error fallback UI
    - Log errors to console
    - _Requirements: 13.1, 13.2, 13.3, 13.5_
  
  - [ ] 21.2 Create skeleton loader components
    - Implement ListingsPageSkeleton
    - Implement DashboardSkeleton
    - Implement PantryPageSkeleton
    - _Requirements: 14.2_
  
  - [ ] 21.3 Create empty state components
    - Implement EmptyState component with icon, message, CTA
    - Create empty states for all pages
    - _Requirements: 4.1, 5.5, 6.1, 7.1, 8.1_
  
  - [ ] 21.4 Write property test for error notifications
    - **Property 66: Error notifications persist until dismissed**
    - **Validates: Requirements 13.8**
  
  - [ ] 21.5 Write property test for success notifications
    - **Property 65: Success notifications auto-dismiss after 3 seconds**
    - **Validates: Requirements 13.7**

- [ ] 22. Implement responsive design and accessibility
  - [ ] 22.1 Add responsive breakpoints to all components
    - Ensure mobile, tablet, desktop layouts
    - Implement mobile navigation menu
    - Adapt chat widget for mobile
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_
  
  - [ ] 22.2 Add accessibility attributes
    - Add alt text to all images
    - Add ARIA labels to icon buttons
    - Ensure keyboard navigation
    - Add focus indicators
    - _Requirements: 18.1, 18.2, 18.4, 18.6_
  
  - [ ] 22.3 Verify heading hierarchy on all pages
    - Ensure proper h1, h2, h3 structure
    - _Requirements: 18.3_
  
  - [ ] 22.4 Implement chat accessibility improvements
    - Enable keyboard shortcuts for chat (Enter to send, Shift+Enter for newline, Esc to close)
    - Enable full keyboard navigation across chat elements
    - Add ARIA labels for chat controls
    - _Requirements: 18.2, 18.7_
  
  - [ ] 22.5 Write property test for responsive layout
    - **Property 71: Layout adapts to viewport size**
    - **Validates: Requirements 15.1, 15.2, 15.3**
  
  - [ ] 22.6 Write property test for keyboard accessibility
    - **Property 88: Interactive elements are keyboard accessible**
    - **Validates: Requirements 18.2**
  
  - [ ] 22.7 Write property test for image alt text
    - **Property 87: All images have alt text**
    - **Validates: Requirements 18.1**

- [ ] 23. Implement performance optimizations
  - [ ] 23.1 Add route-based code splitting
    - Lazy load ListingsPage, PantryPage, EventsPage, NotificationsPage, ProfilePage
    - Add Suspense boundaries with fallbacks
    - _Requirements: 14.2_
  
  - [ ] 23.2 Add React.memo to expensive components
    - Memoize ListingCard, NotificationItem, ChatMessage
    - _Requirements: 14.5_
  
  - [ ] 23.3 Implement virtualization for long lists (optional)
    - Add react-window to listings page if needed
    - _Requirements: 19.1_
  
  - [ ] 23.4 Write unit tests for performance optimizations
    - Test lazy loading behavior
    - Test memoization prevents unnecessary re-renders

- [ ] 24. Implement routing and navigation
  - [ ] 24.1 Configure React Router with all routes
    - Set up public routes (login, register)
    - Set up protected routes with ProtectedRoute wrapper
    - Configure 404 page
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ] 24.2 Implement navigation state management
    - Preserve scroll position for infinite scroll pages
    - Reset scroll for paginated pages
    - Store page state in URL query params
    - _Requirements: 19.3, 20.7_
  
  - [ ] 24.3 Write property test for SPA navigation
    - **Property 8: SPA navigation without full page reload**
    - **Validates: Requirements 2.3**

- [ ] 25. Final integration and testing
  - [ ] 25.1 Integrate all pages into Layout
    - Wire up all routes
    - Ensure navigation works between all pages
    - Test authentication flow end-to-end
    - _Requirements: 1.1, 2.1, 2.2_
  
  - [ ] 25.2 Test error handling across all pages
    - Test network errors
    - Test 401, 403, 400, 500 errors
    - Verify error messages display correctly
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [ ] 25.3 Test loading states across all pages
    - Verify skeleton loaders display
    - Verify loading indicators appear
    - Verify buttons disable during submission
    - _Requirements: 14.1, 14.2, 14.3_
  
  - [ ] 25.4 Write integration tests for critical user flows
    - Test login → dashboard → listings → reservation flow
    - Test provider listing creation flow
    - Test pantry appointment booking flow
    - Test chat widget interaction flow

- [ ] 26. Final checkpoint - Ensure all functionality works
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based and unit tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end user flows
- The implementation follows a bottom-up approach: infrastructure → services → components → pages → integration

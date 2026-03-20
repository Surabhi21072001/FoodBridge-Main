# Requirements Document

## Introduction

This feature introduces three dedicated category pages for the FoodBridge frontend: **Reserve Surplus Meals**, **Pantry Access**, and **Event Food**. Each page provides a focused, purpose-built experience for a specific food access category, replacing or augmenting the existing general-purpose pages. All three pages share a consistent layout, branding, and authentication model while surfacing category-specific functionality.

## Glossary

- **Reserve_Meals_Page**: The dedicated page at `/reserve-meals` for browsing and reserving surplus dining hall meals.
- **Pantry_Page**: The dedicated page at `/pantry` for scheduling pantry appointments and managing a pantry cart.
- **Event_Food_Page**: The dedicated page at `/event-food` for discovering and reserving leftover food from campus events.
- **Listing**: A food item posted by a provider with quantity, pickup window, and dietary metadata.
- **Reservation**: A confirmed claim by a student on a specific listing quantity.
- **Appointment**: A scheduled pantry visit with a selected time slot and cart items.
- **Cart**: A collection of pantry items a user intends to pick up during an appointment.
- **TimeSlot**: An available appointment window with a fixed capacity.
- **Student**: An authenticated user with the role `student`.
- **Provider**: An authenticated user with the role `provider`.
- **Auth_Context**: The existing React authentication context that exposes the current user and role.
- **Toast**: The existing in-app notification component used for success and error feedback.
- **Loading_Spinner**: The existing shared component displayed while async data is fetching.

---

## Requirements

### Requirement 1: Reserve Surplus Meals Page Layout and Content

**User Story:** As a student, I want a dedicated "Reserve Surplus Meals" page with a clear description and meal listings, so that I understand the purpose of the page and can quickly find available food.

#### Acceptance Criteria

1. THE Reserve_Meals_Page SHALL display the page title "Reserve Surplus Meals" as a prominent heading.
2. THE Reserve_Meals_Page SHALL display the introductory description: "At FoodBridge, we aim to minimize food waste and ensure surplus food from dining halls gets to those in need. This page allows students and community members to reserve meals that would otherwise go to waste, ensuring they are consumed by someone who can benefit from them. Simply browse the available surplus meals, select the ones you want, and choose your preferred pickup time."
3. WHEN the Reserve_Meals_Page loads, THE Reserve_Meals_Page SHALL fetch and display all listings with `listing_type` of `donation`.
4. WHEN listings are loading, THE Reserve_Meals_Page SHALL display a Loading_Spinner in place of the listing grid.
5. IF the listings API call fails, THEN THE Reserve_Meals_Page SHALL display an error Toast and render an empty state message.
6. WHEN no donation listings are available, THE Reserve_Meals_Page SHALL display an empty state message indicating no meals are currently available.

---

### Requirement 2: Reserve Surplus Meals — Filtering and Search

**User Story:** As a student, I want to filter and search surplus meal listings, so that I can find meals matching my dietary needs and preferences.

#### Acceptance Criteria

1. THE Reserve_Meals_Page SHALL render a search bar that filters listings by food name or description.
2. THE Reserve_Meals_Page SHALL render dietary filter controls allowing multi-select filtering by dietary tags.
3. WHEN a user submits a search query, THE Reserve_Meals_Page SHALL re-fetch listings with the updated search parameter and reset to page 1.
4. WHEN a user changes dietary filters, THE Reserve_Meals_Page SHALL re-fetch listings with the updated filter parameters and reset to page 1.
5. THE Reserve_Meals_Page SHALL support infinite scroll, loading additional listings when the user scrolls to the bottom of the list.

---

### Requirement 3: Reserve Surplus Meals — Reservation Flow

**User Story:** As a student, I want to reserve a surplus meal from the listings page, so that I can claim food before it runs out.

#### Acceptance Criteria

1. WHEN a student clicks "Reserve Now" on a listing card, THE Reserve_Meals_Page SHALL navigate to the listing detail view for that listing.
2. WHILE a user is not authenticated, THE Reserve_Meals_Page SHALL redirect the user to the login page when they attempt to reserve a meal.
3. WHEN a reservation is successfully created, THE Reserve_Meals_Page SHALL display a success Toast confirming the reservation.
4. IF a reservation fails due to insufficient quantity, THEN THE Reserve_Meals_Page SHALL display an error Toast with a descriptive message.
5. WHEN a listing's `available_quantity` reaches 0, THE Reserve_Meals_Page SHALL display the listing card in a "Sold Out" state with the reserve button disabled.

---

### Requirement 4: Reserve Surplus Meals — Pickup and Provider Details

**User Story:** As a student, I want to see pickup location and time details on each meal listing, so that I know where and when to collect my reservation.

#### Acceptance Criteria

1. THE Reserve_Meals_Page SHALL display the pickup location on each listing card.
2. THE Reserve_Meals_Page SHALL display the pickup window start and end times on each listing card.
3. WHEN a reservation is confirmed, THE Reserve_Meals_Page SHALL include the pickup location and time in the confirmation Toast message.

---

### Requirement 5: Pantry Access Page Layout and Content

**User Story:** As a student, I want a dedicated "Pantry Access" page with a clear description and inventory, so that I understand the service and can browse available pantry items.

#### Acceptance Criteria

1. THE Pantry_Page SHALL display the page title "Pantry Access" as a prominent heading.
2. THE Pantry_Page SHALL display the introductory description: "FoodBridge's pantry access page allows students and community members to schedule appointments and access essential groceries. Whether it's basic staples or fresh produce, users can view available pantry inventory, schedule pickup times, and select items they need. This service helps reduce food insecurity and provides easy access to the resources people need most."
3. WHEN the Pantry_Page loads, THE Pantry_Page SHALL fetch and display the current pantry inventory grouped by category.
4. WHEN inventory is loading, THE Pantry_Page SHALL display a Loading_Spinner.
5. IF the inventory API call fails, THEN THE Pantry_Page SHALL display an error Toast and render an empty inventory state.

---

### Requirement 6: Pantry Access — Cart and Checkout

**User Story:** As a student, I want to add pantry items to a cart and review my selections before booking an appointment, so that I can plan my pickup efficiently.

#### Acceptance Criteria

1. WHEN a student clicks "Add to Cart" on a pantry item, THE Pantry_Page SHALL add the item and selected quantity to the cart.
2. WHEN an item already exists in the cart and the student adds it again, THE Pantry_Page SHALL increment the existing cart item's quantity rather than creating a duplicate entry.
3. WHEN a student removes an item from the cart, THE Pantry_Page SHALL remove that item and update the cart total.
4. WHEN a student updates the quantity of a cart item to 0, THE Pantry_Page SHALL remove that item from the cart.
5. THE Pantry_Page SHALL display the current cart contents with item names and quantities at all times while the cart is non-empty.

---

### Requirement 7: Pantry Access — Appointment Scheduling

**User Story:** As a student, I want to book a pantry appointment for a specific time slot, so that I can pick up my selected items at a convenient time.

#### Acceptance Criteria

1. THE Pantry_Page SHALL display available appointment time slots fetched from the API.
2. WHEN a student selects a time slot and clicks "Book Appointment", THE Pantry_Page SHALL submit the appointment booking request to the API.
3. IF a student attempts to book an appointment without selecting a time slot, THEN THE Pantry_Page SHALL display an error Toast prompting slot selection.
4. IF a student attempts to book an appointment with an empty cart, THEN THE Pantry_Page SHALL display an error Toast prompting item selection.
5. WHEN an appointment is successfully booked, THE Pantry_Page SHALL display a success Toast with the appointment time and a summary of reserved items.
6. WHEN an appointment is successfully booked, THE Pantry_Page SHALL clear the cart and deselect the time slot.
7. WHEN a student cancels an existing appointment, THE Pantry_Page SHALL call the cancel API and remove the appointment from the displayed list on success.

---

### Requirement 8: Pantry Access — Notifications and Confirmation

**User Story:** As a student, I want to receive confirmation details after booking a pantry appointment, so that I know my appointment is confirmed and what to expect.

#### Acceptance Criteria

1. WHEN an appointment is booked, THE Pantry_Page SHALL display a confirmation Toast that includes the appointment time and the list of reserved items with quantities.
2. THE Pantry_Page SHALL display the student's existing upcoming appointments with their status.
3. WHEN an appointment has `status` of `scheduled`, THE Pantry_Page SHALL display a cancel button for that appointment.

---

### Requirement 9: Event Food Page Layout and Content

**User Story:** As a student, I want a dedicated "Event Food" page with a clear description and event food listings, so that I can discover and reserve leftover food from campus events.

#### Acceptance Criteria

1. THE Event_Food_Page SHALL display the page title "Event Food" as a prominent heading.
2. THE Event_Food_Page SHALL display the introductory description: "Discover and reserve leftover food from campus events, meetings, and clubs. FoodBridge helps ensure that no food goes to waste after events by connecting users with food available from such gatherings. Whether it's a meeting or a celebration, this page allows you to find and reserve leftover food to reduce waste and enjoy delicious meals."
3. WHEN the Event_Food_Page loads, THE Event_Food_Page SHALL fetch and display all listings with `listing_type` of `event`.
4. WHEN listings are loading, THE Event_Food_Page SHALL display a Loading_Spinner.
5. IF the event food API call fails, THEN THE Event_Food_Page SHALL display an error Toast and render an empty state message.
6. WHEN no event food listings are available, THE Event_Food_Page SHALL display an empty state message indicating no event food is currently available.

---

### Requirement 10: Event Food — Listing Details and Reservation

**User Story:** As a student, I want to see event details and reserve event food, so that I can claim leftover food from specific campus events.

#### Acceptance Criteria

1. THE Event_Food_Page SHALL display the event name, food category, available quantity, and time of availability for each listing.
2. THE Event_Food_Page SHALL display pickup location and time information for each event food listing.
3. WHEN a student clicks "Reserve Now" on an event food listing, THE Event_Food_Page SHALL navigate to the listing detail view for that listing.
4. WHILE a user is not authenticated, THE Event_Food_Page SHALL redirect the user to the login page when they attempt to reserve event food.
5. WHEN a reservation is successfully created from the Event_Food_Page, THE Event_Food_Page SHALL refresh the event food listings to reflect updated quantities.

---

### Requirement 11: General — Responsive Layout

**User Story:** As a user on any device, I want all three category pages to be fully responsive, so that I can access them comfortably on mobile, tablet, and desktop.

#### Acceptance Criteria

1. THE Reserve_Meals_Page SHALL render a single-column layout on viewports narrower than 640px, a two-column grid on viewports between 640px and 1024px, and a three-column grid on viewports 1024px and wider.
2. THE Pantry_Page SHALL render a stacked single-column layout on viewports narrower than 1024px and a two-column layout (inventory + cart) on viewports 1024px and wider.
3. THE Event_Food_Page SHALL render a single-column layout on viewports narrower than 640px and a multi-column grid on wider viewports.
4. THE Reserve_Meals_Page SHALL hide the filter sidebar on viewports narrower than 1024px.

---

### Requirement 12: General — Authentication and Access Control

**User Story:** As a platform administrator, I want all reservation and scheduling actions to require authentication, so that only registered users can claim food resources.

#### Acceptance Criteria

1. WHILE a user is not authenticated, THE Reserve_Meals_Page SHALL display listings in read-only mode without reserve buttons.
2. WHILE a user is not authenticated, THE Pantry_Page SHALL redirect the user to the login page.
3. WHILE a user is not authenticated, THE Event_Food_Page SHALL display listings in read-only mode without reserve buttons.
4. WHILE a user has the role `provider`, THE Reserve_Meals_Page SHALL not display reserve buttons on listing cards.
5. WHILE a user has the role `provider`, THE Event_Food_Page SHALL not display reserve buttons on listing cards.

---

### Requirement 13: General — Navigation Integration

**User Story:** As a user, I want the three category pages to be accessible from the main navigation, so that I can reach them from anywhere in the app.

#### Acceptance Criteria

1. THE Navigation SHALL include links to the Reserve_Meals_Page, Pantry_Page, and Event_Food_Page for authenticated student users.
2. WHEN a student navigates to `/reserve-meals`, THE Reserve_Meals_Page SHALL render correctly.
3. WHEN a student navigates to `/event-food`, THE Event_Food_Page SHALL render correctly.
4. THE Navigation SHALL highlight the active category page link using the existing active link style.

---

### Requirement 14: General — Loading and Error States

**User Story:** As a user, I want clear feedback during data loading and on API errors, so that I always know the current state of the page.

#### Acceptance Criteria

1. WHEN any category page is fetching initial data, THE page SHALL display a Loading_Spinner centered in the content area.
2. IF any API call on a category page fails, THEN THE page SHALL display an error Toast with a human-readable message.
3. WHEN a category page has no data to display after a successful fetch, THE page SHALL display a descriptive empty state message.
4. WHILE an action (reservation, appointment booking) is in progress, THE page SHALL disable the relevant action button and show a loading indicator on it.

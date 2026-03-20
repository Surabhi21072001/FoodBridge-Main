# Implementation Plan: Category Pages

## Overview

Add three dedicated category pages to the FoodBridge React/TypeScript frontend: `ReserveMealsPage`, `EventFoodPage`, and an updated `PantryPage`. Wire them into the router and navigation. Reuse existing components throughout — the bulk of the work is page scaffolding, hero sections, route registration, and property-based tests.

## Tasks

- [ ] 1. Register new routes and update Navigation
  - Add `/reserve-meals` and `/event-food` routes to the React Router config in `foodbridge-frontend/src/App.tsx` (or wherever routes are defined), pointing to the new page components (stubs are fine at this stage)
  - Update `foodbridge-frontend/src/components/shared/Navigation.tsx` to add links to `/reserve-meals` and `/event-food` for student users, following the existing `navLinkStyle`/`navLinkClass` pattern
  - Wrap both new routes in the existing `ProtectedRoute` component (student-only access)
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [ ]* 1.1 Write unit tests for Navigation link rendering
    - Verify `/reserve-meals` and `/event-food` links appear for student users
    - Verify links do not appear for provider users
    - _Requirements: 13.1_

- [ ] 2. Implement `ReserveMealsPage`
  - Create `foodbridge-frontend/src/pages/ReserveMealsPage.tsx`
  - Render hero section with title "Reserve Surplus Meals" and the full description paragraph
  - Fetch listings scoped to `food_type: 'donation'` using `listingsService.getListings()` on mount
  - Render `LoadingSpinner` while fetching, error Toast on failure, empty state when no results
  - Render `ListingSearchBar`, `ListingFilters` sidebar (hidden on mobile via `hidden lg:block`), and a responsive `ListingCard` grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`)
  - Wire search and filter changes to re-fetch with updated params and reset to page 1
  - Implement infinite scroll using `IntersectionObserver` on a sentinel `div`, matching the pattern in `ListingsPage`
  - On "Reserve" click, navigate to `/listings/:id` (reuses existing `ListingDetail`)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.3, 4.1, 4.2, 11.1, 11.4_

  - [ ]* 2.1 Write unit tests for `ReserveMealsPage`
    - Test: renders title and description
    - Test: shows `LoadingSpinner` while loading
    - Test: shows empty state when listings array is empty
    - Test: renders listing cards from mock data
    - _Requirements: 1.1, 1.2, 1.4, 1.6_

  - [ ]* 2.2 Write property test — donation filter invariant
    - **Property 1: Donation filter invariant**
    - *For any* set of listings returned by the service mock, every listing rendered in the grid must have `listing_type === 'donation'`
    - File: `foodbridge-frontend/src/pages/ReserveMealsPage.properties.test.tsx`
    - Tag: `Feature: category-pages, Property 1: donation filter invariant`
    - Minimum 100 runs
    - **Validates: Requirements 1.3**

- [ ] 3. Implement `EventFoodPage`
  - Create `foodbridge-frontend/src/pages/EventFoodPage.tsx`
  - Render hero section with title "Event Food" and the full description paragraph
  - Fetch event food using `eventsService.getEventFood({ available_now: true, page: 1, limit: 20 })` on mount
  - Render `LoadingSpinner` while fetching, error Toast on failure, empty state when no results
  - Render existing `EventFoodList` component with fetched data, passing `currentUser` from `AuthContext`
  - On successful reservation inside `EventFoodList`, refresh the event food list
  - Apply responsive grid layout matching `ReserveMealsPage` pattern
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 10.1, 10.2, 10.3, 10.4, 10.5, 11.3_

  - [ ]* 3.1 Write unit tests for `EventFoodPage`
    - Test: renders title and description
    - Test: shows `LoadingSpinner` while loading
    - Test: shows empty state when event food array is empty
    - Test: renders `EventFoodList` with mock data
    - _Requirements: 9.1, 9.2, 9.4, 9.6_

  - [ ]* 3.2 Write property test — event food filter invariant
    - **Property 2: Event food filter invariant**
    - *For any* set of listings returned by the service mock, every listing passed to `EventFoodList` must have `listing_type === 'event'`
    - File: `foodbridge-frontend/src/pages/EventFoodPage.properties.test.tsx`
    - Tag: `Feature: category-pages, Property 2: event food filter invariant`
    - Minimum 100 runs
    - **Validates: Requirements 9.3**

- [ ] 4. Update `PantryPage` title and description
  - In `foodbridge-frontend/src/pages/PantryPage.tsx`, update the `<h1>` text from "Pantry" to "Pantry Access"
  - Replace the existing short description paragraph with the full description: "FoodBridge's pantry access page allows students and community members to schedule appointments and access essential groceries. Whether it's basic staples or fresh produce, users can view available pantry inventory, schedule pickup times, and select items they need. This service helps reduce food insecurity and provides easy access to the resources people need most."
  - _Requirements: 5.1, 5.2_

  - [ ]* 4.1 Write unit test for updated PantryPage heading
    - Test: renders "Pantry Access" as the page title
    - Test: renders the full description text
    - _Requirements: 5.1, 5.2_

- [ ] 5. Implement cart logic utilities and property tests
  - Extract the cart mutation logic (add, remove, update quantity) from `PantryPage` into a pure utility function `updateCart(cart: CartItem[], action: CartAction): CartItem[]` in `foodbridge-frontend/src/utils/cartUtils.ts`
  - This makes the cart logic independently testable without rendering the full page
  - `CartAction` covers: `{ type: 'add', item: CartItem }`, `{ type: 'remove', itemId: string }`, `{ type: 'update', itemId: string, quantity: number }`
  - Update `PantryPage` to use `updateCart` for all cart state mutations
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 5.1 Write property tests for cart utilities
    - **Property 3: Cart add accumulation — no duplicates**
    - *For any* cart state and any item already present, adding it again with quantity `q` must increase the existing entry's quantity by `q` and must not create a second entry for the same `item_id`
    - **Property 4: Cart remove completeness**
    - *For any* cart state, removing an item by `item_id` must result in a cart containing no entry with that `item_id`
    - **Property 5: Zero-quantity removal**
    - *For any* cart item, updating its quantity to 0 must produce the same cart state as explicitly removing that item
    - File: `foodbridge-frontend/src/utils/cartUtils.properties.test.ts`
    - Tag: `Feature: category-pages, Property 3/4/5: cart invariants`
    - Minimum 100 runs each
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [ ] 6. Checkpoint — ensure all tests pass
  - Run `npx vitest --run` in `foodbridge-frontend/` and confirm all existing and new tests pass
  - Ask the user if any questions arise before continuing

- [ ] 7. Extend `ListingCard` property tests for auth/role invariants
  - In `foodbridge-frontend/src/components/listings/ListingCard.properties.test.tsx` (existing file), add three new property tests:
  - **Property 6: Sold-out button disabled invariant** — *For any* listing with `available_quantity === 0`, the rendered card must not contain an enabled reserve button
  - **Property 7: Unauthenticated read-only invariant** — *For any* listing rendered with `currentUser = null`, the card must not render a reserve button
  - **Property 8: Provider read-only invariant** — *For any* listing rendered with `currentUser.role === 'provider'`, the card must not render a reserve button
  - Tag each: `Feature: category-pages, Property 6/7/8`
  - Minimum 100 runs each
  - **Validates: Requirements 3.5, 12.1, 12.3, 12.4, 12.5**

- [ ] 8. Final checkpoint — ensure all tests pass
  - Run `npx vitest --run` in `foodbridge-frontend/` and confirm everything is green
  - Ensure all three pages render correctly in the browser by reviewing the component structure
  - Ask the user if any questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- `ReserveMealsPage` intentionally mirrors `ListingsPage` structure — copy the fetch/filter/scroll logic and scope it to `food_type: 'donation'`
- `EventFoodPage` is intentionally thin — it delegates all rendering to the existing `EventFoodList` component
- The cart utility extraction in task 5 is the only refactor; all other tasks are purely additive
- Property tests use `fast-check` (already a project dependency)

# Requirements: Provider Listing Chatbot

## Overview

Providers on FoodBridge AI should be able to create food listings through a conversational chatbot interface. Instead of filling out a form, the provider types a natural language message (e.g., "I want to post some leftover pizza") and the agent guides them through the process by asking follow-up questions, then posts the listing on their behalf.

## User Stories

### 1. Conversational Listing Creation

**As a provider**, I want to tell the chatbot I have food to post, so that the agent can guide me through creating a listing without navigating a form.

#### Acceptance Criteria

1.1 When a provider sends a message indicating they want to post food (e.g., "I want to list some sandwiches", "I have leftover pasta to donate"), the agent recognizes the intent and begins the listing creation flow.

1.2 The agent collects all required listing fields through follow-up questions:
- Food name / title
- Category (meal, snack, beverage, pantry_item, deal, event_food)
- Quantity available
- Pickup location
- Pickup window start (available_from)
- Pickup window end (available_until)

1.3 The agent collects optional fields if the provider volunteers them or if contextually relevant:
- Description
- Dietary tags (e.g., vegetarian, vegan, gluten-free)
- Allergen info
- Original price / discounted price
- Cuisine type

1.4 The agent asks one or two questions at a time rather than dumping all fields at once, keeping the conversation natural.

1.5 If the provider provides multiple pieces of information in a single message (e.g., "50 sandwiches available at the Student Union"), the agent extracts all provided values and only asks for what is still missing.

### 2. Confirmation Before Posting

**As a provider**, I want to review a summary of my listing before it goes live, so that I can catch mistakes before students see it.

#### Acceptance Criteria

2.1 Before calling the create listing API, the agent presents a human-readable summary of all collected fields and asks the provider to confirm.

2.2 If the provider confirms (e.g., "yes", "looks good", "post it"), the agent calls the `create_listing` tool and reports success with the new listing ID.

2.3 If the provider requests changes (e.g., "change the quantity to 30", "wrong location"), the agent updates the relevant field(s) and re-presents the summary for confirmation.

2.4 If the provider cancels (e.g., "cancel", "never mind"), the agent discards the draft and acknowledges the cancellation without creating a listing.

### 3. Successful Listing Feedback

**As a provider**, I want to receive confirmation that my listing was posted, so that I know students can now see it.

#### Acceptance Criteria

3.1 After a successful listing creation, the agent confirms with a friendly message including the listing title and ID.

3.2 The agent offers to help the provider view their listings or create another one.

3.3 If the API call fails, the agent reports the error clearly and offers to retry or let the provider correct the information.

### 4. Provider-Only Access

**As the system**, only authenticated users with the `provider` role should be able to create listings via the chatbot.

#### Acceptance Criteria

4.1 The `create_listing` tool is only available to users with the `provider` role.

4.2 If a student attempts to trigger listing creation, the agent politely explains that only providers can post listings.

4.3 The backend `POST /listings` endpoint enforces provider authorization independently of the agent (existing behavior preserved).

### 5. Input Validation

**As a provider**, I want the agent to catch invalid inputs during the conversation, so that the listing creation doesn't fail at the API level.

#### Acceptance Criteria

5.1 The agent validates that `available_from` is before `available_until` before submitting.

5.2 The agent validates that `quantity_available` is a positive integer.

5.3 The agent validates that `category` is one of the allowed enum values; if the provider gives an ambiguous category, the agent offers the valid options.

5.4 If `discounted_price` is provided, the agent ensures it is not greater than `original_price`.

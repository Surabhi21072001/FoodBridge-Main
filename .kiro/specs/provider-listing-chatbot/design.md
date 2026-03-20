# Design: Provider Listing Chatbot

## Overview

This feature adds a `create_listing` tool to the FoodBridge AI agent, enabling providers to create food listings through natural conversation. The agent collects required fields via follow-up questions, validates inputs, presents a confirmation summary, and calls `POST /listings` on the provider's behalf.

## Architecture

The change touches three layers:

```
Agent Layer
  ├── definitions.ts        → add create_listing tool schema
  ├── mcpExecutor.ts        → add create_listing API call
  └── prompts.ts            → update provider system prompt

No backend changes needed — POST /listings already exists and enforces provider auth.
```

## Tool Definition

A new `create_listing` tool is added to `AGENT_TOOLS` in `definitions.ts`:

```typescript
{
  name: "create_listing",
  description: "Create a new food listing on behalf of the authenticated provider. Only call this tool after collecting all required fields and receiving explicit confirmation from the provider.",
  parameters: {
    type: "object",
    properties: {
      title:               { type: "string",  description: "Food name/title" },
      category:            { type: "string",  description: "Food category", enum: ["meal","snack","beverage","pantry_item","deal","event_food"] },
      quantity_available:  { type: "number",  description: "Number of servings available (positive integer)" },
      pickup_location:     { type: "string",  description: "Where students pick up the food" },
      available_from:      { type: "string",  description: "Pickup window start (ISO 8601)" },
      available_until:     { type: "string",  description: "Pickup window end (ISO 8601)" },
      description:         { type: "string",  description: "Optional description" },
      dietary_tags:        { type: "array",   description: "e.g. vegetarian, vegan, gluten-free", items: { type: "string" } },
      allergen_info:       { type: "array",   description: "e.g. peanuts, dairy", items: { type: "string" } },
      cuisine_type:        { type: "string",  description: "Optional cuisine type" },
      original_price:      { type: "number",  description: "Original price in dollars" },
      discounted_price:    { type: "number",  description: "Discounted price in dollars" },
    },
    required: ["title", "category", "quantity_available", "pickup_location", "available_from", "available_until"],
  },
}
```

## Executor

`create_listing` is added to `MCPToolExecutor.executeAPITool()` as a mutation (API-only, never MCP):

```typescript
case "create_listing":
  return await this.apiCreateListing(args);
```

```typescript
private async apiCreateListing(args: Record<string, any>): Promise<ToolResult> {
  const response = await this.apiClient.post("/listings", {
    title:              args.title,
    category:           args.category,
    quantity_available: args.quantity_available,
    pickup_location:    args.pickup_location,
    available_from:     args.available_from,
    available_until:    args.available_until,
    description:        args.description,
    dietary_tags:       args.dietary_tags,
    allergen_info:      args.allergen_info,
    cuisine_type:       args.cuisine_type,
    original_price:     args.original_price,
    discounted_price:   args.discounted_price,
  });
  return { success: true, data: response.data.data };
}
```

The existing `Authorization: Bearer <token>` header on the axios client means the backend's `authorize('provider')` middleware handles role enforcement automatically.

## System Prompt Update

The provider section of `getSystemPrompt()` in `prompts.ts` is updated to:

1. Explicitly tell the agent it can create listings via `create_listing`
2. Describe the conversational flow: collect fields progressively, confirm before posting
3. Specify validation rules inline so the LLM enforces them before calling the tool

```
PROVIDER LISTING CREATION:
You can create food listings on behalf of providers using the create_listing tool.

Flow:
1. Detect intent (e.g. "I have pizza to post", "list some sandwiches")
2. Extract any fields already mentioned in the message
3. Ask for missing required fields one or two at a time
4. Once all required fields are collected, present a summary and ask for confirmation
5. On confirmation, call create_listing
6. Report success with the listing title and ID

Required fields: title, category, quantity_available, pickup_location, available_from, available_until
Optional fields: description, dietary_tags, allergen_info, cuisine_type, original_price, discounted_price

Validation before calling the tool:
- available_from must be before available_until
- quantity_available must be a positive integer
- category must be one of: meal, snack, beverage, pantry_item, deal, event_food
- If discounted_price is given, it must not exceed original_price

For dates/times, accept natural language (e.g. "today 3pm to 6pm") and convert to ISO 8601.
If the provider is not a provider role, explain that only providers can create listings.
```

## Tool Result Formatting

A `create_listing` case is added to `formatToolResult()` in `prompts.ts`:

```typescript
case "create_listing":
  return formatListingCreated(result.data);
```

```typescript
function formatListingCreated(listing: any): string {
  return `✅ Listing created successfully!
Title: ${listing.title}
ID: ${listing.id}
Status: ${listing.status}
Available: ${new Date(listing.available_from).toLocaleString()} – ${new Date(listing.available_until).toLocaleString()}

Students can now see your listing. Would you like to view all your listings or create another one?`;
}
```

## Conversation Flow

```
Provider: "I have 20 slices of pizza to give away"

Agent:  Extracts: title="pizza", quantity=20
        Asks: "What category best fits — meal, snack, or something else?"

Provider: "meal"

Agent:  Asks: "Where can students pick it up, and what's the pickup window?"

Provider: "Student Union, today 3pm to 6pm"

Agent:  Extracts: pickup_location, available_from, available_until
        Presents summary + asks for confirmation

Provider: "yes"

Agent:  Calls create_listing → reports success with listing ID
```

## Role Enforcement

- The `create_listing` tool is only described in the system prompt for `userRole === "provider"`
- The backend `POST /listings` route independently enforces `authorize('provider')`, so even if the tool were somehow called by a non-provider token, it would return 403
- If a student asks to post food, the agent explains only providers can create listings

## Correctness Properties

### P1 — Required fields completeness
Before `create_listing` is called, all six required fields (title, category, quantity_available, pickup_location, available_from, available_until) must be present and non-empty in the tool arguments.

**Validates: Requirements 1.2, 5.1–5.3**

### P2 — Date ordering
`available_from < available_until` must hold for every `create_listing` call.

**Validates: Requirements 5.1**

### P3 — Quantity positivity
`quantity_available` must be a positive integer (≥ 1) in every `create_listing` call.

**Validates: Requirements 5.2**

### P4 — Category validity
`category` must be one of `["meal","snack","beverage","pantry_item","deal","event_food"]` in every `create_listing` call.

**Validates: Requirements 5.3**

### P5 — Price ordering
If both `original_price` and `discounted_price` are present, `discounted_price ≤ original_price`.

**Validates: Requirements 5.4**

### P6 — No listing created without confirmation
The `create_listing` tool must never be called in a session where the provider has not sent an affirmative confirmation message after seeing the summary.

**Validates: Requirements 2.1, 2.2**

### P7 — Cancellation produces no listing
If the provider sends a cancellation message (e.g. "cancel", "never mind") before confirming, `create_listing` must not be called.

**Validates: Requirements 2.4**

## Testing Strategy

Property-based tests use [fast-check](https://github.com/dubzzz/fast-check) (already used in the frontend test suite).

- **P1–P5** are testable as unit properties against a validation helper function that mirrors the agent's pre-submission checks
- **P6–P7** are testable as conversation-level properties by simulating message sequences and asserting tool call presence/absence
- Unit tests cover the `apiCreateListing` executor method with mocked axios
- Integration test: authenticated provider token → `POST /listings` → 201; student token → 403

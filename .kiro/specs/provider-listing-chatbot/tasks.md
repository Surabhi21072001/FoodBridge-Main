# Tasks: Provider Listing Chatbot

## Implementation Tasks

- [x] 1. Add `create_listing` tool schema to agent definitions
  - Add the `create_listing` entry to `AGENT_TOOLS` array in `backend/src/agent/tools/definitions.ts`
  - Include all required and optional parameters matching the `createListingSchema` validator
  - **Files:** `backend/src/agent/tools/definitions.ts`

- [x] 2. Implement `create_listing` executor in MCPToolExecutor
  - Add `create_listing` case to `executeAPITool()` switch in `backend/src/agent/tools/mcpExecutor.ts`
  - Add `apiCreateListing()` private method that POSTs to `/listings`
  - Add `create_listing` to `API_ONLY_TOOLS` map (never MCP)
  - Also add the same case to `executor.ts` for consistency
  - **Files:** `backend/src/agent/tools/mcpExecutor.ts`, `backend/src/agent/tools/executor.ts`

- [x] 3. Update provider system prompt and add result formatter
  - Update the provider section in `getSystemPrompt()` in `backend/src/agent/llm/prompts.ts` to explicitly describe the `create_listing` tool, the conversational flow, and validation rules
  - Add `create_listing` case to `formatToolResult()` with a `formatListingCreated()` helper
  - **Files:** `backend/src/agent/llm/prompts.ts`

- [x] 4. Write unit tests for the executor and validation
  - Unit test for `apiCreateListing` with mocked axios (success and error cases)
  - Unit tests for input validation properties (P1–P5 from design): required fields, date ordering, quantity positivity, category validity, price ordering
  - **Files:** `backend/src/agent/tools/createListing.test.ts`

- [x] 5. Write property-based tests
  - Property P1: any call to `create_listing` with missing required fields should be rejected before reaching the API
  - Property P2: `available_from < available_until` holds for all valid inputs
  - Property P3: `quantity_available >= 1` holds for all valid inputs
  - Property P4: `category` is always one of the six valid enum values
  - Property P5: if both prices present, `discounted_price <= original_price`
  - Use fast-check
  - **Files:** `backend/src/agent/tools/createListing.properties.test.ts`

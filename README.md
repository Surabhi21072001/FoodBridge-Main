# FoodBridge AI

A campus food access platform that reduces food waste and improves student access to affordable meals. FoodBridge connects students with food providers — dining halls, clubs, restaurants, and event organizers — through a centralized web portal powered by a conversational AI assistant.

---

## Try the App

🌐 **[https://mellifluous-babka-707dea.netlify.app](https://mellifluous-babka-707dea.netlify.app)**

No setup required — just open the link and log in with one of the accounts below.

| Role | Email | Password |
|------|-------|----------|
| Student | `alice.student@university.edu` | `password123` |
| Provider | `dininghall@university.edu` | `DiningHall2024!` |

The student account lets you browse listings, make reservations, book pantry slots, and chat with the AI assistant. The provider account gives access to the dashboard for managing listings and tracking reservations.

---

## Live Demo

| | URL |
|---|---|
| Frontend (Netlify) | https://mellifluous-babka-707dea.netlify.app |
| Backend API (Heroku) | https://frozen-tor-38341-22d18d6cc6b1.herokuapp.com |

---

## Project Overview

### Problem Statement

Food insecurity on college campuses is a silent but widespread issue. Many students struggle to afford regular meals, often skipping food or choosing between basic needs. At the same time, campus dining halls, student events, and local vendors generate significant amounts of surplus food every day — most of which goes to waste.

The core problem is not scarcity — it's lack of visibility and coordination.

There is no unified system where:
- students can discover available food in real time
- providers can easily redistribute surplus
- communities can actively reduce waste

### Solution Vision

FoodBridge AI transforms fragmented food access into a centralized, intelligent marketplace. It acts as a real-time campus food exchange platform, where surplus food is no longer wasted but redistributed efficiently to students who need it most.

But FoodBridge goes beyond a traditional marketplace. It introduces an agentic AI layer that eliminates friction entirely. Instead of manually searching for food, comparing options, booking appointments, and tracking availability — students simply talk to an AI assistant, and the system handles everything.

### What Makes FoodBridge Different

FoodBridge is not just a listing platform or chatbot. It is an agent-driven system that takes action on behalf of the user.

The AI assistant can understand intent, retrieve real-time data, make reservations, book pantry slots, suggest meals based on available ingredients, and guide users toward community engagement.

This shifts the experience from:

> search → filter → decide → act

to:

> ask → agent executes → done

### Impact

FoodBridge creates impact at multiple levels:
- Students gain access to affordable or free food with minimal effort
- Providers reduce food waste and contribute to the community
- Universities demonstrate care for student well-being
- Communities become more sustainable and connected

This is not just a product — it is infrastructure for equitable food access on campus.

### Target Users

- Students facing food insecurity or looking for affordable meals
- Students who want quick, convenient access to food options
- Food providers (dining halls, clubs, restaurants, event organizers)
- University administrators managing food programs and resources

---

## Key Features

### 🧠 Agentic AI Assistant (Core Innovation)
- Conversational AI that executes real actions — not just responses
- Handles food discovery, reservations, pantry booking, and recommendations
- Uses tools + MCP integrations for real-time, structured decision-making

### 🍱 Real-Time Food Marketplace
- Centralized platform for all campus food sources
- Listings from dining halls, events, clubs, and local vendors
- Live availability and quantity tracking

### ⚡ One-Command Task Execution
- Users can complete workflows in a single message: "Find cheap meals near me", "Book a pantry slot tomorrow", "Reserve the second option"
- Agent handles the entire flow end-to-end

### 🥗 Smart Food Discovery
- Dietary filters (vegetarian, vegan, halal, gluten-free, etc.)
- Location-based discovery
- Category-based browsing (events, deals, pantry, surplus)

### 🧾 Reservation & Booking System
- Real-time reservation locking
- Pantry appointment scheduling with Google Calendar integration
- Confirmation and tracking via notifications

### 🧑‍🍳 AI-Powered Recipe Suggestions
- Suggests meals based on pantry inventory
- Reduces waste by helping students use available food
- Powered by MCP integrations

### 🔔 Intelligent Notifications
- Alerts for new food listings
- Reservation confirmations
- Time-sensitive reminders

### 🤝 Community & Volunteering Layer
- Encourages students to participate in redistribution efforts
- Connects volunteers to food distribution events
- Builds a culture of community contribution

### 📊 Provider Dashboard
- Track food distribution and reservations
- Monitor demand and usage
- Manage listings and inventory

---

## Design Decisions

### Technology Choices

| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend | React 19 + TypeScript + Vite | Fast builds, strong typing, component reuse |
| Styling | Tailwind CSS v4 | Utility-first, no runtime overhead |
| Backend | Node.js + Express + TypeScript | Consistent language across stack, rich ecosystem |
| AI Agent | OpenAI GPT-4 with function calling | Reliable tool selection at temperature 0.3–0.5 |
| Database | PostgreSQL | Relational integrity for reservations and appointments |
| Auth | JWT (jsonwebtoken) | Stateless, easy to validate across services |
| MCP | `@modelcontextprotocol/sdk` | Direct DB queries from the agent without REST overhead |
| Calendar | Google Calendar API (googleapis) | Native OAuth 2.0 flow, widely used by students |
| Rate Limiting | express-rate-limit | 20 req/min per user, Redis-ready |
| Logging | Winston | Structured logs with file rotation |
| Validation | Zod | Runtime schema validation matching TypeScript types |
| Testing | Jest (backend) + Vitest (frontend) + fast-check | Property-based tests for correctness guarantees |

### Alternatives Considered

**Python/FastAPI vs Node.js/Express**
FastAPI offers automatic OpenAPI docs and async-first design. We chose Express because the entire team was already writing TypeScript for the frontend, keeping the cognitive overhead low and enabling shared type definitions.

**Redux vs React Context API**
Redux provides more predictable state for complex apps. We chose Context API because the state surface (auth, notifications, chat) is small and well-scoped. Adding Redux would have been premature optimization.

**REST-only vs REST + MCP**
The AI agent initially called all backend endpoints via REST. For read-heavy queries (food search, pantry slots, dining deals), this added unnecessary HTTP overhead and auth token forwarding. The MCP server gives the agent direct, parameterized database access for read operations while mutations still go through the REST API with full auth enforcement.

**Redis session caching**
Redis is included as a dependency (`ioredis`) and is ready for session caching and rate limiting, but is optional — the app runs without it in development.

### Security Considerations

- All API routes require JWT authentication except `/api/auth/login` and `/api/auth/register`
- Role-based authorization middleware (`authorize('provider')`, `authorize('admin')`) enforced at the route level
- Helmet.js sets security headers on every response
- Input validation via Zod before any database operation
- Google OAuth tokens stored server-side only; refresh tokens never sent to the frontend
- Calendar failures are non-blocking and never expose token details to users
- Rate limiting: 1000 req/15 min in production, disabled in development

### Scalability Considerations

- Stateless JWT auth allows horizontal scaling without shared session state
- PostgreSQL connection pooling via `pg.Pool`
- MCP server runs as a separate process, independently scalable
- Pagination on all list endpoints (`page`, `limit` query params)
- Seed listing refresh job keeps demo data alive without manual intervention
- Docker-ready structure; Kubernetes orchestration is optional

---

## Kiro Usage

### Vibe Coding

Vibe coding with Kiro meant describing intent in plain language and letting Kiro generate the implementation, then iterating on the output conversationally.

**Best moments:**

The Google Calendar integration was the clearest example. Rather than writing the OAuth flow, token refresh logic, and non-blocking calendar event creation from scratch, we described the desired behavior: "When a pantry appointment is booked, silently create a Google Calendar event if the user has connected their calendar. Never fail the booking if the calendar call fails." Kiro generated the full `CalendarService` class, the `CalendarTokenRepository`, the OAuth routes, and the frontend `GoogleCalendarConnect` component in one pass — including the token refresh retry logic and the `is_connected = false` fallback for revoked tokens.

The provider listing chatbot was another strong example. We described the conversational flow ("collect fields progressively, confirm before posting, convert natural language dates to ISO 8601") and Kiro produced the tool definition, executor case, system prompt update, and `formatListingCreated` formatter together.

**Conversation structure that worked best:**
1. Describe the feature in one paragraph, including edge cases
2. Ask Kiro to generate the implementation
3. Review and ask targeted follow-up questions ("what happens if the refresh token is revoked?")
4. Ask Kiro to add property-based tests for the correctness properties

### Agent Hooks

Three hooks automated the most repetitive parts of the development workflow:

**`sync-api-tools` (fileEdited on routes/controllers)**
Whenever a backend route or controller was modified, this hook scanned for new or changed endpoints and either generated a new agent tool file or updated an existing one. This kept the AI agent's tool set in sync with the API without manual tracking. It eliminated an entire class of bugs where the agent would call an endpoint with the wrong parameter names.

**`auto-update-api-docs` (fileEdited on routes/controllers)**
Every time a route or controller changed, this hook updated `docs/api_reference.md` with the current endpoint paths, parameters, response formats, and example requests. Documentation stayed current without any manual effort — a significant improvement over the previous approach of updating docs as an afterthought.

**`agent-tool-tests` (fileCreated on agent/tools/\*.ts)**
When a new agent tool file was created, this hook automatically generated a corresponding test file covering correct API calls, response format validation, and error handling. This meant every new tool shipped with tests by default.

**Impact:** These three hooks together meant that adding a new backend endpoint automatically triggered tool generation, documentation updates, and test scaffolding — a workflow that previously required three separate manual steps.

### Spec-Driven Development

Specs were used for the four most complex features: the core platform, the frontend, the Google Calendar integration, and the provider listing chatbot.

Each spec followed the same three-file structure:
- `requirements.md` — user stories with formal acceptance criteria in WHEN/SHALL format
- `design.md` — architecture diagrams, component specs, data models, and correctness properties
- `tasks.md` — ordered implementation checklist

**Comparison to vibe coding:**

Vibe coding is faster for well-understood, self-contained features. Specs shine when a feature touches multiple layers (backend + frontend + agent + database) or when correctness guarantees matter. The Google Calendar integration spec, for example, defined 9 formal correctness properties before any code was written. This meant Kiro could generate property-based tests that validated the properties directly, rather than writing ad-hoc tests after the fact.

The spec also served as a shared reference during implementation — when Kiro's output drifted from the intended design, pointing back to the spec's architecture diagram or a specific property was enough to get it back on track.

**How Kiro maintained development flow with specs:**
Kiro could read the spec's tasks.md and work through implementation tasks sequentially, checking off completed items. This made long multi-session features tractable — each session started by reviewing the task list rather than reconstructing context from scratch.

### Steering Docs

Three steering files guided every Kiro interaction in this workspace:

**`product.md`** — Described the platform's purpose, user roles, and key features. This prevented Kiro from suggesting generic solutions that didn't fit the campus food access context (e.g., suggesting a generic e-commerce checkout flow instead of the pantry appointment model).

**`tech.md`** — Specified the exact stack, testing strategy, and API conventions. This meant Kiro consistently generated Express routes with Zod validation, Jest tests with fast-check for property tests, and JWT auth middleware — without needing to be reminded each time.

**`structure.md`** — Defined the planned directory structure and architectural layers. This kept generated code in the right place and prevented Kiro from creating ad-hoc file locations.

**Strategy that worked best:** Keeping steering docs concise and factual. Long steering docs with explanations and rationale were less effective than short, directive ones. "Use Zod for validation" outperformed "We chose Zod because it provides runtime validation that matches TypeScript types, which is important for our API security requirements."

### MCP Integration

The FoodBridge MCP server (`backend/src/mcp/server.ts`) exposes five database query tools directly to the AI agent:

- `query_available_food` — filtered food listing search with dietary tags, category, and availability
- `check_pantry_availability` — available appointment slots for a given date
- `get_dining_deals` — active discounted dining offers
- `get_food_listings` — detailed listings with provider information
- `get_pantry_slots` — time slot generation with conflict detection

**What MCP enabled that REST couldn't:**

Without MCP, every agent read operation required the agent to call a REST endpoint, which meant forwarding the user's JWT token, going through Express middleware, and serializing/deserializing HTTP requests. For conversational queries where the agent might call `query_available_food` 2–3 times in a single turn (refining filters based on user follow-ups), this added measurable latency.

The MCP server connects directly to PostgreSQL and returns structured JSON. It also enabled more flexible query composition — the agent can combine `dietary_filters`, `category`, and `available_now` in a single call rather than making multiple filtered requests.

The recipe suggestion tool (`suggestRecipes`) also uses MCP to query pantry inventory directly, enabling the agent to suggest recipes based on what's actually in stock without a dedicated REST endpoint.

---

## Learning Journey & Forward Thinking

### Challenges and How I Overcame Them

**Agent tool drift:** As the backend API evolved, agent tool files fell out of sync with endpoint signatures. The `sync-api-tools` hook solved this, but the real lesson was to define tool schemas and API contracts together from the start rather than retrofitting tools onto existing endpoints.

**Property-based test design:** Writing meaningful property-based tests with fast-check required thinking differently about correctness — moving from "does this specific input produce this specific output" to "does this invariant hold for all valid inputs." The spec's correctness properties section made this tractable by defining the properties in plain language first.

**Non-blocking integrations:** The Google Calendar integration required careful design to ensure calendar failures never surfaced as booking failures. The pattern of "attempt, log on failure, never throw" became a reusable pattern for all third-party integrations.

**Conversation context management:** The AI agent needed to resolve references like "the second one" across turns. This required careful session management and a conversation history format that the LLM could reliably use for reference resolution.

### What We'd Do Differently

- Define MCP tool schemas before REST endpoints, not after — the MCP interface is closer to what the agent actually needs
- Write steering docs on day one, not after noticing Kiro generating inconsistent code
- Use specs for every feature that touches more than two files — the upfront cost is low and the consistency payoff is high
- Add the `sync-api-tools` hook from the start rather than manually maintaining tool-endpoint alignment

### Skills Gained

- Spec-driven development with formal correctness properties
- Property-based testing with fast-check
- MCP server implementation with the `@modelcontextprotocol/sdk`
- Google OAuth 2.0 token management with refresh and revocation handling
- Designing non-blocking third-party integrations
- Structuring AI agent prompts for consistent tool selection

### Future Enhancements

- Push notifications via WebSockets or Server-Sent Events for real-time food alerts
- Mobile app (React Native) sharing the same backend
- Image upload for food listings (AWS S3 / Supabase Storage, max 5MB jpg/png)
- Redis-backed session caching and distributed rate limiting
- Admin dashboard for pantry inventory management and system analytics
- Expanded MCP tools for mutation operations (currently read-only)
- Multi-campus support with location-scoped listings

---

## Setup Instructions

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- A Google Cloud project with the Calendar API enabled (for calendar integration)
- OpenAI API key

### 1. Clone and install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../foodbridge-frontend
npm install
```

### 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`. Here's what each variable does and whether you actually need it:

```env
# --- Required (core app won't start without these) ---

DB_HOST=localhost
DB_PORT=5432
DB_NAME=foodbridge
DB_USER=postgres
DB_PASSWORD=your_password      # your local postgres password

JWT_SECRET=any_random_string   # used to sign auth tokens — any value works locally
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# --- Required for AI chat ---
# The AI assistant won't respond without this.
# Get one at https://platform.openai.com/api-keys

OPENAI_API_KEY=sk-...

# --- Optional: Google Calendar integration ---
# Skip these if you don't need calendar sync.
# The app runs fully without them — pantry booking still works,
# events just won't appear in Google Calendar.
# Setup guide: https://console.cloud.google.com/apis/credentials

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/calendar/callback
```

If you want to run the app without an OpenAI key (browse listings, make reservations, book pantry slots), everything works except the chat assistant. Just leave `OPENAI_API_KEY` blank and the chat widget will return an error on send — no other functionality is affected.

### 3. Set up the database

```bash
psql -U postgres -c "CREATE DATABASE foodbridge;"
psql -U postgres -d foodbridge -f backend/clear-and-seed.sql
```

### 4. Run database migrations

```bash
psql -U postgres -d foodbridge -f database/migrations/001_google_calendar_integration.sql
```

---

## How to Run

### Development

Run backend and frontend in separate terminals:

```bash
# Terminal 1 — Backend API (port 3001)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd foodbridge-frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

### Running Tests

```bash
# Backend tests (Jest + fast-check property tests)
cd backend
npm test

# Frontend tests (Vitest, single run)
cd foodbridge-frontend
npm run test:run

# Frontend tests with UI
npm run test:ui
```

### Production Build

```bash
# Build backend
cd backend
npm run build
npm start

# Build frontend
cd foodbridge-frontend
npm run build
# Serve the dist/ folder with any static file server
```

### MCP Server (optional, for direct DB agent queries)

```bash
cd backend
node dist/mcp/server.js
```

The MCP server communicates over stdio and is intended to be launched by the AI agent runtime, not accessed directly.

---

## Project Structure

```
├── backend/                    # Express API + AI agent
│   ├── src/
│   │   ├── agent/             # AI assistant (tools, LLM client, session)
│   │   ├── controllers/       # Route handlers
│   │   ├── services/          # Business logic
│   │   ├── repositories/      # Database access
│   │   ├── routes/            # Express routers
│   │   ├── middleware/        # Auth, error handling
│   │   ├── mcp/               # MCP server for direct DB queries
│   │   └── seeds/             # Demo data seeders
│   └── documentation/         # API and tool sync reports
│
├── foodbridge-frontend/        # React SPA
│   └── src/
│       ├── components/        # Feature and shared components
│       ├── pages/             # Page-level components
│       ├── services/          # API client services
│       ├── hooks/             # Custom React hooks
│       ├── contexts/          # Auth, notification, chat contexts
│       └── utils/             # Helpers and formatters
│
├── database/
│   └── migrations/            # SQL migration files
│
├── docs/                      # API reference and PRDs
│
└── .kiro/
    ├── specs/                 # Feature specs (requirements, design, tasks)
    ├── steering/              # Product, tech, and structure guidelines
    └── hooks/                 # Automated agent workflows
```

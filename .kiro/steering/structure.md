# Project Structure

## Current Organization

```
.kiro/
├── specs/
│   └── foodbridge-platform/    # Feature specification
│       ├── requirements.md      # User stories and acceptance criteria
│       ├── design.md           # Architecture and correctness properties
│       └── tasks.md            # Implementation task list
└── steering/                   # Project guidelines (this directory)

docs/
├── product_prd.md              # Product requirements document
└── agent_prd.md                # AI agent technical specification
```

## Planned Structure (Implementation Phase)

The following structure is recommended once implementation begins:

```
src/
├── frontend/                   # Web application
│   ├── components/            # React/Vue components
│   ├── pages/                 # Page-level components
│   ├── services/              # API client services
│   └── utils/                 # Frontend utilities
│
├── backend/                    # API services
│   ├── routes/                # API route handlers
│   ├── services/              # Business logic layer
│   ├── models/                # Database models
│   ├── middleware/            # Auth, validation, error handling
│   └── utils/                 # Backend utilities
│
├── agent/                      # AI assistant
│   ├── tools/                 # Tool definitions and implementations
│   ├── memory/                # Context and preference management
│   ├── prompts/               # System prompts and templates
│   └── utils/                 # Agent utilities
│
└── database/
    ├── migrations/            # Database schema migrations
    └── seeds/                 # Test data seeds

tests/
├── unit/                      # Unit tests
├── integration/               # Integration tests
├── properties/                # Property-based tests
└── e2e/                       # End-to-end tests

config/                        # Configuration files
docs/                          # Documentation
```

## Key Architectural Layers

1. **Frontend Layer**: User interfaces for students and providers
2. **Backend API Layer**: RESTful services handling business logic
3. **AI Agent Layer**: Conversational assistant with tool execution
4. **Data Layer**: PostgreSQL database with relational schema

## Separation of Concerns

- Frontend communicates with backend via REST API
- AI assistant executes tools that call backend API endpoints
- Backend services interact with database through models/repositories
- Each service has a single, well-defined responsibility

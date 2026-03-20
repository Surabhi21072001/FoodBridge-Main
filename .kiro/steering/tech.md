# Technology Stack

## Frontend
- React or Vue.js for web application
- WebSocket or Server-Sent Events for real-time notifications
- HTTP client for API communication

## Backend
- Node.js with Express OR Python with FastAPI
- JWT for authentication
- RESTful API design

## AI Agent
- OpenAI GPT-4 or Anthropic Claude with function calling
- Temperature: 0.3-0.5 for consistent tool selection
- Rate limiting: 20 requests per minute per user
- Tool execution layer mapping to backend API endpoints

## Database
- PostgreSQL for relational data storage
- Redis (optional) for session caching and rate limiting

## Storage
- Image storage: AWS S3, Supabase Storage, or local file storage
- Supports food listing images (max 5MB, jpg/png formats)
- Public URL generation for stored images

## Infrastructure
- Cloud hosting: AWS, GCP, or Azure
- Container orchestration: Docker + Kubernetes (optional)

## Common Commands

Since the project is in early specification phase, specific build/test commands will depend on the chosen tech stack. Typical commands would include:

**Node.js/Express:**
```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm test             # Run tests
npm run build        # Build for production
```

**Python/FastAPI:**
```bash
pip install -r requirements.txt  # Install dependencies
uvicorn main:app --reload        # Start development server
pytest                           # Run tests
```

**Database:**
```bash
# PostgreSQL setup
psql -U postgres -c "CREATE DATABASE foodbridge;"
# Run migrations (framework-specific)
```

## API Design Conventions

- RESTful endpoints following standard HTTP methods
- JWT authentication via Authorization header
- JSON request/response bodies
- Pagination for list endpoints (page, limit query params)
- Standard error responses with status codes (400, 401, 403, 404, 500)

## Testing Strategy

- Unit tests for individual functions and services
- Property-based tests for core business logic
- Integration tests for API endpoints
- End-to-end tests for critical user flows

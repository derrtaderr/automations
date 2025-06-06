# Technical Architecture

## System Overview

The n8n Workflow Generator is a Next.js application deployed on Vercel that integrates with Claude API for AI-powered workflow generation and n8n APIs for deployment.

## Architecture Diagram

```mermaid
graph TB
    subgraph "Client (Next.js)"
        A[Landing Page]
        B[Chat Interface]
        C[Workflow Preview]
        D[Export/Deploy]
    end
    
    subgraph "API Layer"
        E[/api/generate]
        F[/api/deploy]
        G[/api/export]
        H[/api/auth]
    end
    
    subgraph "External Services"
        I[Claude API]
        J[n8n Cloud API]
        K[n8n Self-hosted]
    end
    
    A --> B
    B --> E
    E --> I
    I --> C
    C --> F
    C --> G
    F --> J
    F --> K
    H --> J
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Components**: Shadcn/ui
- **Type Safety**: TypeScript
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js (Vercel Edge Functions)
- **API Routes**: Next.js API Routes
- **Validation**: Zod
- **HTTP Client**: Fetch API
- **Authentication**: Custom JWT + OAuth 2.0

### External Integrations
- **AI**: Claude API (Anthropic)
- **Deployment Target**: n8n Cloud + Self-hosted
- **Hosting**: Vercel

## Component Architecture

### Frontend Components

```
src/
├── app/
│   ├── (root)/
│   │   ├── page.tsx              # Landing page
│   │   └── chat/page.tsx         # Chat interface
│   ├── api/
│   │   ├── generate/route.ts     # Workflow generation
│   │   ├── deploy/route.ts       # n8n deployment
│   │   ├── export/route.ts       # JSON export
│   │   └── auth/route.ts         # OAuth handling
│   └── globals.css
├── components/
│   ├── ui/                       # Shadcn/ui components
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   └── InputForm.tsx
│   ├── workflow/
│   │   ├── WorkflowPreview.tsx
│   │   ├── NodeDiagram.tsx
│   │   └── ExportButton.tsx
│   └── layout/
│       ├── Header.tsx
│       └── Footer.tsx
├── lib/
│   ├── claude.ts                 # Claude API client
│   ├── n8n.ts                    # n8n API client
│   ├── auth.ts                   # Authentication utilities
│   └── types.ts                  # TypeScript definitions
└── hooks/
    ├── useWorkflowGenerator.ts
    ├── useN8nConnection.ts
    └── useAuth.ts
```

## API Design

### 1. Workflow Generation Endpoint

```typescript
// POST /api/generate
{
  "description": "Send welcome email when user signs up",
  "clarifications"?: string[]
}

// Response
{
  "workflow": {
    "nodes": [...],
    "connections": {...},
    "settings": {...},
    "credentials": [...]
  },
  "documentation": string,
  "summary": string
}
```

### 2. Deployment Endpoint

```typescript
// POST /api/deploy
{
  "workflow": WorkflowData,
  "connection": {
    "type": "cloud" | "self-hosted",
    "token": string,
    "instanceUrl"?: string
  }
}

// Response
{
  "success": boolean,
  "workflowId": string,
  "url": string,
  "credentialsCreated": string[]
}
```

### 3. Authentication Endpoint

```typescript
// POST /api/auth/n8n
{
  "type": "oauth" | "api-key",
  "code"?: string,           // OAuth code
  "apiKey"?: string,         // API key for self-hosted
  "instanceUrl"?: string     // Self-hosted URL
}

// Response
{
  "success": boolean,
  "token": string,
  "instanceInfo": {
    "version": string,
    "type": "cloud" | "self-hosted"
  }
}
```

## Data Flow

### Workflow Generation Flow

1. **User Input**: User describes workflow in natural language
2. **Validation**: Input is validated and sanitized
3. **AI Processing**: Claude API processes the description
4. **Workflow Generation**: AI returns n8n-compatible workflow JSON
5. **Preview**: User reviews generated workflow
6. **Export/Deploy**: User chooses to download JSON or deploy to n8n

### n8n Integration Flow

1. **Authentication**: User connects their n8n instance
2. **Validation**: Connection is tested and validated
3. **Deployment**: Workflow is deployed via n8n API
4. **Credential Setup**: Required credentials are created as placeholders
5. **Redirection**: User is redirected to n8n to complete setup

## Security Considerations

### Data Protection
- No user data stored permanently
- Session-based temporary storage only
- All API communications over HTTPS
- Credentials encrypted in transit

### Authentication Security
- OAuth 2.0 for n8n cloud integration
- API key encryption for self-hosted instances
- JWT tokens for session management
- CSRF protection on all endpoints

### Input Validation
- Zod schemas for all API inputs
- Rate limiting on generation endpoints
- Sanitization of user descriptions
- Validation of generated workflows

## Performance Optimization

### Frontend Optimization
- Next.js App Router for optimal loading
- Component lazy loading
- Image optimization
- CSS code splitting

### Backend Optimization
- Edge functions for low latency
- Efficient Claude API usage
- Connection pooling for n8n APIs
- Response caching where appropriate

### Monitoring
- Vercel Analytics integration
- Error tracking with built-in logging
- Performance monitoring
- API usage tracking

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Vercel automatic scaling
- CDN for static assets
- Database-free architecture

### Rate Limiting
- Claude API rate limiting
- n8n API rate limiting
- User session rate limiting
- Graceful degradation

## Development Workflow

### Local Development
```bash
# Setup
npm install
cp .env.example .env.local
npm run dev

# Testing
npm run test
npm run test:e2e

# Building
npm run build
npm run start
```

### Environment Variables
```bash
CLAUDE_API_KEY=your_claude_api_key
NEXTAUTH_SECRET=your_nextauth_secret
N8N_OAUTH_CLIENT_ID=your_n8n_oauth_id
N8N_OAUTH_CLIENT_SECRET=your_n8n_oauth_secret
```

### Deployment Pipeline
1. Code pushed to GitHub
2. Vercel automatic deployment
3. Environment variables configured
4. Preview deployments for PRs
5. Production deployment on merge

## Error Handling Strategy

### Client-Side Errors
- React Error Boundaries
- User-friendly error messages
- Retry mechanisms
- Fallback UI states

### Server-Side Errors
- Structured error responses
- Logging and monitoring
- Graceful error propagation
- Circuit breaker patterns

### External API Errors
- Claude API error handling
- n8n API error handling
- Timeout handling
- Retry logic with exponential backoff 
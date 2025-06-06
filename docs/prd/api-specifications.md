# API Specifications

## Overview

This document defines the API specifications for the n8n Workflow Generator, including endpoint definitions, request/response schemas, and integration requirements.

## Base Configuration

- **Base URL**: `https://your-app.vercel.app/api`
- **Authentication**: Session-based + OAuth 2.0
- **Content-Type**: `application/json`
- **Rate Limiting**: 10 requests per minute per session

## Endpoints

### 1. Workflow Generation

#### `POST /api/generate`

Generates an n8n workflow from natural language description.

**Request Body:**
```typescript
{
  description: string;           // Required: Natural language workflow description
  clarifications?: string[];     // Optional: Additional clarifications
  context?: {                   // Optional: Additional context
    industry?: string;
    tools?: string[];
    complexity?: 'simple' | 'medium' | 'complex';
  };
}
```

**Response:**
```typescript
{
  success: boolean;
  workflow: {
    nodes: Node[];              // n8n workflow nodes
    connections: Connection[];   // Node connections
    settings: WorkflowSettings; // Workflow configuration
    meta: {
      name: string;
      description: string;
      tags: string[];
    };
  };
  documentation: string;        // Human-readable explanation
  summary: string;             // Brief workflow summary
  requiredCredentials: {       // Credentials needed
    [key: string]: {
      type: string;
      description: string;
      required: boolean;
    };
  };
  estimatedRuntime: number;    // Estimated execution time (ms)
}
```

**Error Responses:**
- `400`: Invalid request format
- `422`: Unable to process description
- `429`: Rate limit exceeded
- `500`: Claude API error

### 2. n8n Authentication

#### `POST /api/auth/n8n`

Authenticates with n8n instance (Cloud or Self-hosted).

**Request Body:**
```typescript
{
  type: 'cloud' | 'self-hosted';
  code?: string;              // OAuth authorization code (for cloud)
  apiKey?: string;           // API key (for self-hosted)
  instanceUrl?: string;      // Self-hosted instance URL
}
```

**Response:**
```typescript
{
  success: boolean;
  connection: {
    id: string;              // Connection session ID
    type: 'cloud' | 'self-hosted';
    instanceUrl: string;
    user?: {                 // User info (if available)
      id: string;
      email: string;
      name: string;
    };
    capabilities: {          // Instance capabilities
      version: string;
      features: string[];
    };
  };
  expiresAt: string;        // ISO timestamp
}
```

#### `GET /api/auth/n8n/status`

Checks current n8n connection status.

**Response:**
```typescript
{
  connected: boolean;
  connection?: {
    type: 'cloud' | 'self-hosted';
    instanceUrl: string;
    expiresAt: string;
  };
}
```

#### `DELETE /api/auth/n8n`

Disconnects from n8n instance.

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

### 3. Workflow Deployment

#### `POST /api/deploy`

Deploys generated workflow to connected n8n instance.

**Request Body:**
```typescript
{
  workflow: WorkflowData;     // Generated workflow
  options?: {
    activate?: boolean;       // Auto-activate workflow (default: false)
    tags?: string[];         // Additional tags
    folder?: string;         // Workflow folder
  };
}
```

**Response:**
```typescript
{
  success: boolean;
  deployment: {
    workflowId: string;      // n8n workflow ID
    url: string;            // Direct link to workflow in n8n
    name: string;           // Workflow name
    status: 'created' | 'active' | 'inactive';
  };
  credentials: {            // Created credential placeholders
    created: Array<{
      id: string;
      name: string;
      type: string;
      configured: boolean;
    }>;
    setupUrl: string;       // URL to configure credentials
  };
  nextSteps: string[];      // Instructions for user
}
```

### 4. Workflow Export

#### `POST /api/export`

Prepares workflow for JSON download.

**Request Body:**
```typescript
{
  workflow: WorkflowData;
  format?: 'n8n' | 'minimal'; // Export format (default: 'n8n')
}
```

**Response:**
```typescript
{
  success: boolean;
  downloadUrl: string;      // Temporary download URL
  filename: string;         // Suggested filename
  expiresAt: string;       // URL expiration (ISO timestamp)
}
```

#### `GET /api/export/[downloadId]`

Downloads the exported workflow file.

**Response:** 
- Content-Type: `application/json`
- Content-Disposition: `attachment; filename="workflow.json"`

### 5. Health Check

#### `GET /api/health`

Returns API health status.

**Response:**
```typescript
{
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    claude: 'up' | 'down' | 'slow';
    n8n_cloud: 'up' | 'down' | 'slow';
  };
  timestamp: string;        // ISO timestamp
  version: string;          // API version
}
```

## External API Integrations

### Claude API Integration

**Endpoint**: `https://api.anthropic.com/v1/messages`

**Request Headers:**
```
Authorization: Bearer ${CLAUDE_API_KEY}
Content-Type: application/json
anthropic-version: 2023-06-01
```

**Prompt Structure:**
```typescript
{
  model: "claude-3-sonnet-20240229",
  max_tokens: 4000,
  messages: [
    {
      role: "system",
      content: "You are an expert n8n workflow creator..."
    },
    {
      role: "user", 
      content: `Create an n8n workflow for: ${userDescription}`
    }
  ]
}
```

### n8n Cloud API Integration

**Base URL**: `https://api.n8n.cloud/api/v1`

**Authentication**: 
- OAuth 2.0 (preferred)
- Personal Access Token

**Key Endpoints:**
- `POST /workflows` - Create workflow
- `GET /workflows/{id}` - Get workflow
- `PUT /workflows/{id}` - Update workflow  
- `POST /credentials` - Create credentials
- `GET /executions` - Get executions

### n8n Self-hosted API Integration

**Base URL**: `{instanceUrl}/api/v1`

**Authentication**:
- API Key in header: `X-N8N-API-KEY`

**Same endpoints as Cloud**, but with different base URL.

## Error Handling

### Standard Error Response

```typescript
{
  success: false;
  error: {
    code: string;           // Error code (e.g., 'INVALID_INPUT')
    message: string;        // Human-readable message
    details?: any;          // Additional error details
    timestamp: string;      // ISO timestamp
    requestId?: string;     // Request tracking ID
  };
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_INPUT` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `CLAUDE_ERROR` | 502 | Claude API error |
| `N8N_ERROR` | 502 | n8n API error |
| `INTERNAL_ERROR` | 500 | Server error |

## Rate Limiting

### Limits by Endpoint

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/generate` | 5 requests | 1 minute |
| `/api/deploy` | 10 requests | 1 minute |
| `/api/auth/*` | 20 requests | 1 minute |
| `/api/export` | 30 requests | 1 minute |

### Rate Limit Headers

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1640995200
```

## Data Models

### WorkflowData

```typescript
interface WorkflowData {
  name: string;
  nodes: Node[];
  connections: Connection[];
  settings: WorkflowSettings;
  meta: {
    description: string;
    tags: string[];
    version: string;
  };
}
```

### Node

```typescript
interface Node {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, string>;
  webhookId?: string;
  continueOnFail?: boolean;
  notes?: string;
  disabled?: boolean;
}
```

### Connection

```typescript
interface Connection {
  [outputNodeName: string]: {
    [outputIndex: string]: Array<{
      node: string;
      type: string;
      index: number;
    }>;
  };
}
```

### WorkflowSettings  

```typescript
interface WorkflowSettings {
  executionOrder: 'v0' | 'v1';
  saveManualExecutions: boolean;
  callerPolicy: string;
  errorWorkflow?: string;
  timezone: string;
}
```

## Security

### Authentication Flow

1. **OAuth 2.0 (n8n Cloud)**:
   - Redirect to n8n OAuth endpoint
   - Receive authorization code
   - Exchange code for access token
   - Store token securely (encrypted)

2. **API Key (Self-hosted)**:
   - Accept API key from user
   - Validate against n8n instance
   - Store encrypted during session

### Security Headers

All API responses include:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

### Input Sanitization

- All user inputs are sanitized using Zod schemas
- SQL injection prevention (though no SQL used)
- XSS prevention through output escaping
- CSRF protection on state-changing endpoints

## Testing

### Test Environment

- **Base URL**: `https://test-app.vercel.app/api`
- **Mock Data**: Available for all endpoints
- **Test API Keys**: Provided for integration testing

### Example Test Cases

```bash
# Generate workflow
curl -X POST https://test-app.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{"description": "Send email when form is submitted"}'

# Deploy workflow  
curl -X POST https://test-app.vercel.app/api/deploy \
  -H "Content-Type: application/json" \
  -d '{"workflow": {...}, "options": {"activate": true}}'
``` 
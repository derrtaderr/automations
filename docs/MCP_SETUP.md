# MCP (Model Context Protocol) Setup

This document explains the MCP server configuration for the n8n Workflow Generator project.

## Overview

The project uses Model Context Protocol (MCP) servers to extend AI capabilities with external tools and services. The configuration is defined in `mcp.json`.

## Configured MCP Servers

### 1. Supabase MCP Server

**Purpose**: Database operations, user management, and data storage
**Package**: `@supabase/mcp-server-supabase`

**Capabilities**:
- Database queries and operations
- User authentication management
- Real-time subscriptions
- Storage operations

**Configuration**:
```json
{
  "command": "npx",
  "args": ["-y", "@supabase/mcp-server-supabase@latest"],
  "env": {
    "SUPABASE_ACCESS_TOKEN": "your_token_here"
  }
}
```

### 2. TaskMaster-AI MCP Server

**Purpose**: Advanced AI capabilities and multi-provider API access
**Package**: `task-master-ai`

**Capabilities**:
- Multiple AI provider integration
- Advanced task automation
- Cross-platform API management
- Enhanced workflow generation

**Configuration**:
```json
{
  "command": "npx",
  "args": ["-y", "--package=task-master-ai", "task-master-ai"],
  "env": {
    "ANTHROPIC_API_KEY": "your_anthropic_key",
    "OPENAI_API_KEY": "your_openai_key",
    "PERPLEXITY_API_KEY": "your_perplexity_key",
    // ... other AI provider keys
  }
}
```

## Setup Instructions

### 1. Install MCP Client

Ensure you have the MCP client installed:

```bash
npm install -g @modelcontextprotocol/cli
```

### 2. Configure Environment Variables

Copy `env.example` to `.env.local` and fill in your API keys:

```bash
cp env.example .env.local
```

### 3. Update API Keys

Replace the placeholder values in both `mcp.json` and `.env.local`:

#### Required Keys:
- **SUPABASE_ACCESS_TOKEN**: From your Supabase project settings
- **ANTHROPIC_API_KEY**: From Anthropic Console (for Claude)

#### Optional Keys (for enhanced features):
- **OPENAI_API_KEY**: OpenAI API key
- **PERPLEXITY_API_KEY**: Perplexity AI key
- **GOOGLE_API_KEY**: Google AI/Gemini key
- **MISTRAL_API_KEY**: Mistral AI key
- **OPENROUTER_API_KEY**: OpenRouter key
- **XAI_API_KEY**: xAI (Grok) key
- **AZURE_OPENAI_API_KEY**: Azure OpenAI key
- **OLLAMA_API_KEY**: Ollama API key

### 4. Test MCP Servers

Test each server individually:

```bash
# Test Supabase MCP
npx @supabase/mcp-server-supabase@latest

# Test TaskMaster-AI MCP
npx -y --package=task-master-ai task-master-ai
```

## Integration with n8n Workflow Generator

### Use Cases

1. **Supabase Integration**:
   - Store generated workflows
   - User session management
   - Workflow analytics and metrics
   - Template library storage

2. **TaskMaster-AI Integration**:
   - Enhanced workflow generation with multiple AI models
   - Complex automation task handling
   - Cross-platform integrations
   - Advanced natural language processing

### Implementation Example

```typescript
// In your Next.js API routes
import { McpClient } from '@modelcontextprotocol/client';

// Initialize MCP clients
const supabaseClient = new McpClient('supabase');
const taskmasterClient = new McpClient('taskmaster-ai');

// Use in workflow generation
export async function generateWorkflow(description: string) {
  const workflow = await taskmasterClient.call('generateWorkflow', {
    description,
    provider: 'claude-3-sonnet'
  });
  
  // Store in Supabase
  await supabaseClient.call('insertWorkflow', {
    workflow,
    userId: session.user.id
  });
  
  return workflow;
}
```

## Security Considerations

### API Key Management
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate keys regularly
- Use different keys for development/production

### Access Control
- Supabase RLS (Row Level Security) for data protection
- Rate limiting on MCP server calls
- Input validation for all external API calls

## Troubleshooting

### Common Issues

1. **MCP Server Not Starting**
   ```bash
   # Check if npx can resolve the package
   npx @supabase/mcp-server-supabase@latest --help
   ```

2. **Environment Variables Not Loading**
   ```bash
   # Verify .env.local exists and has correct format
   cat .env.local | grep API_KEY
   ```

3. **API Key Errors**
   - Verify API keys are valid and not expired
   - Check API key permissions and scopes
   - Ensure correct environment (dev/prod) keys

### Debug Mode

Enable debug logging for MCP servers:

```bash
# Add to your environment
DEBUG=mcp:* npm run dev
```

## Development Workflow

### Local Development
1. Start MCP servers: `npm run mcp:start`
2. Start Next.js app: `npm run dev`
3. Test integrations: `npm run test:mcp`

### Production Deployment
1. Set environment variables in Vercel
2. MCP servers will auto-start with the application
3. Monitor server health via `/api/health` endpoint

## Additional Resources

- [MCP Documentation](https://modelcontextprotocol.io/docs)
- [Supabase MCP Server](https://github.com/supabase/mcp-server-supabase)
- [TaskMaster-AI Documentation](https://github.com/taskmaster-ai/mcp-server)
- [n8n API Documentation](https://docs.n8n.io/api/) 
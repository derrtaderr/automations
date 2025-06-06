import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Environment validation
const envSchema = z.object({
  CLAUDE_API_KEY: z.string().min(1, 'Claude API key is required'),
});

const env = envSchema.parse({
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
});

// Initialize Claude client
const claude = new Anthropic({
  apiKey: env.CLAUDE_API_KEY,
});

// Types for our workflow generation
export interface WorkflowGenerationRequest {
  description: string;
  clarifications?: string[];
  context?: {
    industry?: string;
    tools?: string[];
    complexity?: 'simple' | 'medium' | 'complex';
  };
}

export interface WorkflowGenerationResponse {
  success: boolean;
  workflow?: object; // n8n workflow JSON
  documentation?: string;
  summary?: string;
  requiredCredentials?: Record<string, {
    type: string;
    description: string;
    required: boolean;
  }>;
  estimatedRuntime?: number;
  error?: string;
}

// Function to load n8n documentation
function loadN8nDocumentation(): string {
  try {
    const docsPath = path.join(process.cwd(), 'docs', 'n8n_documentation.md');
    return fs.readFileSync(docsPath, 'utf-8');
  } catch (error) {
    console.warn('Could not load n8n documentation:', error);
    return '';
  }
}

// Function to extract relevant documentation sections based on request
function getRelevantDocumentation(description: string): string {
  const fullDocs = loadN8nDocumentation();
  if (!fullDocs) return '';

  const lowerDescription = description.toLowerCase();
  let relevantSections = '';

  // Always include key capabilities and node structure basics
  relevantSections += `
## n8n Platform Overview
n8n is a workflow automation platform with 400+ integrations, native AI capabilities, and flexible node-based architecture.

### Key Capabilities:
- Code When You Need It: Write JavaScript/Python, add npm packages, or use visual interface
- AI-Native Platform: Build AI agent workflows based on LangChain
- 400+ integrations available
- Self-host with fair-code license or use cloud offering

## Node Structure Fundamentals
`;

  // Extract node type information - always relevant
  const nodeTypeMatch = fullDocs.match(/Node Type[\s\S]*?(?=\n## |$)/);
  if (nodeTypeMatch) {
    relevantSections += nodeTypeMatch[0];
  }

  // Extract node properties section - always relevant  
  const nodePropsMatch = fullDocs.match(/Node Properties[\s\S]*?(?=\n## |Node Property Options)/);
  if (nodePropsMatch) {
    relevantSections += '\n## ' + nodePropsMatch[0];
  }

  // Add specific sections based on keywords in description
  if (lowerDescription.includes('email') || lowerDescription.includes('gmail') || lowerDescription.includes('smtp')) {
    relevantSections += `\n## Email Integration Notes
- Use Gmail node for Gmail-specific operations
- Use SMTP/IMAP nodes for general email providers
- Always include proper authentication setup
- Consider rate limits for bulk operations
`;
  }

  if (lowerDescription.includes('webhook') || lowerDescription.includes('trigger') || lowerDescription.includes('form')) {
    relevantSections += `\n## Webhook & Trigger Guidelines
- Webhook nodes respond to external HTTP requests
- Trigger nodes start workflow execution
- Always validate incoming data
- Use proper HTTP response codes
- Include error handling for invalid requests
`;
  }

  if (lowerDescription.includes('slack') || lowerDescription.includes('discord') || lowerDescription.includes('teams')) {
    relevantSections += `\n## Chat Platform Integration
- Use official platform nodes when available
- Authenticate with proper API tokens/OAuth
- Format messages according to platform requirements
- Handle rate limits and message size restrictions
`;
  }

  if (lowerDescription.includes('database') || lowerDescription.includes('sql') || lowerDescription.includes('postgres') || lowerDescription.includes('mysql')) {
    relevantSections += `\n## Database Integration
- Use specific database nodes (PostgreSQL, MySQL, etc.)
- Always use parameterized queries to prevent SQL injection
- Handle connection pooling and timeouts
- Validate data before database operations
`;
  }

  if (lowerDescription.includes('api') || lowerDescription.includes('http') || lowerDescription.includes('rest')) {
    relevantSections += `\n## API Integration Best Practices
- Use HTTP Request node for custom API calls
- Include proper authentication headers
- Handle rate limiting with appropriate delays
- Validate API responses and handle errors
- Use appropriate HTTP methods (GET, POST, PUT, DELETE)
`;
  }

  if (lowerDescription.includes('schedule') || lowerDescription.includes('cron') || lowerDescription.includes('daily') || lowerDescription.includes('weekly')) {
    relevantSections += `\n## Scheduling Guidelines
- Use Schedule Trigger node for time-based automation
- Support cron expressions for complex schedules
- Consider timezone settings
- Include proper error handling for scheduled tasks
`;
  }

  return relevantSections;
}

// The comprehensive n8n workflow generation prompt enhanced with documentation
function buildEnhancedPrompt(description: string): string {
  const relevantDocs = getRelevantDocumentation(description);
  
  return `# n8n Workflow Generator - Expert System with Documentation

## Overview
You are an AI agent responsible for generating fully importable n8n workflow JSON files from natural language task descriptions. Your goal is to translate user requirements into properly configured workflows using n8n nodes, while providing comprehensive setup instructions for users of all experience levels.

## n8n Documentation Context
${relevantDocs}

## Core Responsibilities
1. Generate valid n8n workflow JSON files
2. Include detailed setup instructions within the workflow
3. Provide step-by-step configuration guidance for each node
4. Ensure workflows are accessible to beginners while being powerful for experts

## Context
- Inputs will be natural language descriptions of triggers, applications, logic, and desired outputs
- Workflows may span all types of use cases (automation, integrations, data transformation, notifications)
- Output must be valid n8n JSON, ready for import
- All nodes must be properly connected, error-handled, and include setup instructions
- Assume users have no prior n8n experience unless stated otherwise

## Enhanced Instructions

### 1. Parse and Analyze
- Extract key workflow components: trigger, actions, logic, and output
- Identify any API services that require authentication
- Note any complex configurations that need explanation

### 2. Node Configuration Standards
For EACH node in the workflow, include:

#### A. Basic Configuration
- Use realistic placeholder values marked with \`YOUR_\` prefix (e.g., \`YOUR_API_KEY\`)
- Reference upstream nodes with proper expressions
- Include error handling nodes where appropriate

#### B. Setup Instructions via Sticky Notes
Add a Sticky Note above each complex node containing:
\`\`\`
📋 SETUP INSTRUCTIONS: [Node Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. [Step-by-step setup instructions]
2. [Where to find required values]
3. [Common configuration options]
4. [Troubleshooting tips]
\`\`\`

### 3. API Integration Standards
For nodes requiring API keys or authentication:

#### OpenAI Node Example:
\`\`\`
📋 OPENAI SETUP INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. GET YOUR API KEY:
   • Go to https://platform.openai.com/api-keys
   • Click "Create new secret key"
   • Copy the key (starts with 'sk-')

2. ADD TO N8N:
   • Click on this OpenAI node
   • Click "Create New" under Credential
   • Paste your API key
   • Click "Save"

3. CONFIGURE THE NODE:
   • Model: Select "gpt-4" or "gpt-3.5-turbo"
   • System Prompt: [We provide this below]
   • User Prompt: [We provide this below]
   • Temperature: 0.7 (adjustable 0-1)

4. SYSTEM PROMPT TO USE:
   "You are an expert sales copywriter..."

5. USER PROMPT TEMPLATE:
   "Create a personalized email for {{$json["FirstName"]}}..."
\`\`\`

### 4. Workflow Documentation Structure
Include these Sticky Notes at key positions:

#### At Workflow Start:
\`\`\`
🚀 WORKFLOW OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━
PURPOSE: [What this workflow does]
TRIGGER: [What starts this workflow]
OUTCOME: [What happens when complete]

SETUP CHECKLIST:
□ API Key 1: [Service Name]
□ API Key 2: [Service Name]
□ Configuration: [What to customize]
□ Testing: [How to test]
\`\`\`

### 5. Expression and Variable Standards
- Always use clear variable names
- Include comments explaining complex expressions
- Provide examples of data structure

### 6. Error Handling Standards
Include error handling with user-friendly explanations:
\`\`\`
⚠️ ERROR HANDLING
━━━━━━━━━━━━━━━━━━━━━━━━━━━
IF THIS FAILS:
1. Check: [Most common issue]
2. Verify: [Second most common]
3. Test: [How to debug]

COMMON ERRORS:
• "401 Unauthorized" = API key issue
• "Rate limit" = Too many requests
• "Timeout" = Try smaller batches
\`\`\`

## Output Format Requirements

### 1. Structure
Return ONLY valid n8n workflow JSON in this format:
\`\`\`json
{
  "name": "Workflow Name - With Clear Purpose",
  "nodes": [...],
  "connections": {...},
  "settings": {
    "saveExecutionProgress": true,
    "saveManualExecutions": true
  }
}
\`\`\`

### 2. Node Naming Convention
- Use descriptive names: "Filter High-Value Leads" not "IF Node"
- Include action in name: "Send Welcome Email" not "Email"
- Number sequential steps: "1. Receive Data", "2. Process", "3. Send"

### 3. JSON Formatting Requirements
- ENSURE proper JSON syntax with balanced braces
- NO trailing commas before closing braces/brackets
- ESCAPE all quotes in string values properly
- KEEP sticky note content concise (under 500 chars each)
- LIMIT workflow to 15 nodes maximum for complex automations
- USE simple string values, avoid complex nested structures where possible

### Quality Checklist:
- [ ] Valid JSON syntax (no syntax errors)
- [ ] Can a beginner follow the setup instructions?
- [ ] Are all API endpoints documented?
- [ ] Is every YOUR_ placeholder explained?
- [ ] Are common errors addressed?
- [ ] Can the workflow be tested without real data?

## Response Format
Return ONLY the valid n8n workflow JSON. Do not include explanatory text outside the JSON structure. All explanations should be within Sticky Notes in the workflow itself. ENSURE the JSON is syntactically valid and can be parsed without errors.`;
}

export async function generateWorkflow(
  request: WorkflowGenerationRequest
): Promise<WorkflowGenerationResponse> {
  try {
    const { description, clarifications = [], context } = request;
    
    // Build the user prompt
    let userPrompt = `Create an n8n workflow for: ${description}`;
    
    if (clarifications.length > 0) {
      userPrompt += `\n\nAdditional clarifications:\n${clarifications.join('\n')}`;
    }
    
    if (context) {
      userPrompt += `\n\nContext:`;
      if (context.industry) userPrompt += `\n- Industry: ${context.industry}`;
      if (context.tools?.length) userPrompt += `\n- Preferred tools: ${context.tools.join(', ')}`;
      if (context.complexity) userPrompt += `\n- Complexity level: ${context.complexity}`;
    }

    // Build enhanced prompt with relevant documentation
    const enhancedPrompt = buildEnhancedPrompt(description);

    // Call Claude API
    const message = await claude.messages.create({
      model: 'claude-opus-4-20250514', // Upgraded to Claude 4 Opus - most powerful model
      max_tokens: 8000, // Increased for more complex workflows
      system: enhancedPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ],
    });

    // Extract the workflow JSON from Claude's response
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    const responseText = content.text;
    
    // Try to extract JSON from the response
    let workflowJson;
    
    console.log('Claude response (first 500 chars):', responseText.substring(0, 500));
    console.log('Claude response length:', responseText.length);
    
    try {
      // First try: Look for JSON code blocks
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       responseText.match(/```\s*([\s\S]*?)\s*```/);
      
      if (jsonMatch && jsonMatch[1]) {
        let jsonStr = jsonMatch[1].trim();
        console.log('Extracted JSON from code block (first 200 chars):', jsonStr.substring(0, 200));
        console.log('JSON string length:', jsonStr.length);
        
        // Try to fix common JSON issues
        jsonStr = fixCommonJsonIssues(jsonStr);
        
        workflowJson = JSON.parse(jsonStr);
      } else {
        // Second try: Look for JSON object boundaries
        const startIndex = responseText.indexOf('{');
        const lastIndex = responseText.lastIndexOf('}');
        
        if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
          let jsonStr = responseText.substring(startIndex, lastIndex + 1);
          console.log('Extracted JSON from boundaries (first 200 chars):', jsonStr.substring(0, 200));
          console.log('JSON string length:', jsonStr.length);
          
          // Try to fix common JSON issues
          jsonStr = fixCommonJsonIssues(jsonStr);
          
          workflowJson = JSON.parse(jsonStr);
        } else {
          // Third try: Assume the entire response is JSON
          console.log('Trying to parse entire response as JSON');
          let jsonStr = responseText.trim();
          jsonStr = fixCommonJsonIssues(jsonStr);
          workflowJson = JSON.parse(jsonStr);
        }
      }
      
      console.log('Successfully parsed JSON, workflow name:', workflowJson?.name);
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.log('Parse error at position:', parseError instanceof SyntaxError ? parseError.message : 'Unknown');
      // Don't log the full response as it might be huge and cause issues
      console.log('Response sample around error (chars 23000-23200):', responseText.substring(23000, 23200));
      throw new Error(`Failed to parse workflow JSON from Claude response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
    }

    // Helper function to fix common JSON issues
    function fixCommonJsonIssues(jsonStr: string): string {
      // Remove any trailing commas before closing braces/brackets
      jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
      
      // Fix unescaped quotes in string values (basic attempt)
      // This is a simple fix - more complex cases might need better handling
      jsonStr = jsonStr.replace(/"([^"\\]*(\\.[^"\\]*)*)",(\s*")/g, '"$1",$3');
      
      // Ensure proper closing of the JSON structure
      const openBraces = (jsonStr.match(/{/g) || []).length;
      const closeBraces = (jsonStr.match(/}/g) || []).length;
      
      if (openBraces > closeBraces) {
        console.log('Adding missing closing braces:', openBraces - closeBraces);
        jsonStr += '}'.repeat(openBraces - closeBraces);
      }
      
      return jsonStr;
    }

    // Validate basic workflow structure
    if (!workflowJson.nodes || !Array.isArray(workflowJson.nodes)) {
      throw new Error('Generated workflow missing valid nodes array');
    }

    // Extract documentation and summary (basic extraction)
    const documentation = "Workflow generated with comprehensive setup instructions included in sticky notes";
    const summary = workflowJson.name || "AI-generated n8n workflow";
    
    // Extract required credentials from nodes
    const requiredCredentials: Record<string, {
      type: string;
      description: string;
      required: boolean;
    }> = {};
    
    if (Array.isArray(workflowJson.nodes)) {
      workflowJson.nodes.forEach((node: { credentials?: object; name?: string; type?: string }) => {
        if (node.credentials) {
          Object.keys(node.credentials).forEach(credType => {
            requiredCredentials[credType] = {
              type: credType,
              description: `Required for ${node.name || node.type}`,
              required: true
            };
          });
        }
      });
    }

    return {
      success: true,
      workflow: workflowJson,
      documentation,
      summary,
      requiredCredentials,
      estimatedRuntime: 1000, // 1 second estimated
    };

  } catch (error) {
    console.error('Error generating workflow:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export { claude }; 
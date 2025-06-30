# 🤖 n8n Workflow Generator

> **Transform natural language into powerful n8n automations in seconds**

A Next.js application that leverages Claude 4 Opus to convert plain English descriptions into production-ready n8n workflows with embedded documentation, error handling, and one-click deployment capabilities.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript)
![Claude AI](https://img.shields.io/badge/Claude_4_Opus-orange?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## Quick Start

### 1. Environment Setup
```bash
# Copy environment variables
cp env.example .env.local

# Add your Claude API key to .env.local
CLAUDE_API_KEY=your_claude_api_key_here
```

### 2. Install & Run
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Use the App
1. Open http://localhost:3000
2. Click "Start Building"
3. Describe your automation in plain English
4. Download the generated n8n workflow JSON

## ✨ Key Features

- 🧠 **Claude 4 Opus Integration**: Most advanced AI model for intelligent workflow generation
- 🎯 **One-Click n8n Deployment**: Direct deployment to your n8n instance via API
- 📚 **Embedded Documentation**: Auto-generated setup instructions and troubleshooting guides
- 🔄 **A/B Testing Ready**: Generate multiple workflow variations for optimization
- 🛡️ **Enterprise Security**: Environment-based API key management and validation
- 🎨 **ChatGPT-Style Interface**: Intuitive conversational UI with auto-growing text areas
- 📊 **Smart Lead Scoring**: Built-in algorithms for complex automation logic
- 🔧 **Error Handling**: Comprehensive error boundaries and retry mechanisms

## Example Prompts

Try these example descriptions:

- "Send an email when a form is submitted"
- "Post to Slack when a new customer signs up"
- "Create a lead scoring system that updates a spreadsheet"
- "Monitor a website for changes and send notifications"
- "Sync data between two databases daily"

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **AI**: Claude 3 Sonnet via Anthropic API
- **UI Components**: Shadcn/ui, Lucide React
- **Validation**: Zod
- **Deployment**: Vercel-ready

## Project Structure

```
src/
├── app/
│   ├── api/generate/     # Claude API integration
│   ├── page.tsx          # Main landing page
│   └── layout.tsx        # App layout
├── components/
│   ├── chat/             # Chat interface
│   └── ui/               # Reusable UI components
└── lib/
    ├── claude.ts         # Claude API client
    └── utils.ts          # Utility functions
```

## API Endpoints

### POST /api/generate
Generate n8n workflow from description.

**Request:**
```json
{
  "description": "Send an email when a form is submitted",
  "clarifications": ["Use Gmail", "Include form data"],
  "context": {
    "industry": "e-commerce",
    "complexity": "simple"
  }
}
```

**Response:**
```json
{
  "success": true,
  "workflow": { /* n8n workflow JSON */ },
  "summary": "Email notification workflow",
  "documentation": "Setup instructions...",
  "requiredCredentials": { /* credential info */ }
}
```

## Development

### Testing the API
```bash
# Test the generation endpoint
node test-api.js
```

### Environment Variables
See `env.example` for all required environment variables.

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Manual Deployment
```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for the automation community**

Need help? Check out our [documentation](./docs/) or open an issue.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Request validation schema
const deployRequestSchema = z.object({
  workflow: z.object({}).passthrough(), // Accept any workflow object
  summary: z.string(),
  n8nUrl: z.string().url(),
  apiKey: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflow, summary, n8nUrl, apiKey } = deployRequestSchema.parse(body);

    // Prepare the workflow for n8n API
    const n8nWorkflow = {
      name: summary || 'AI Generated Workflow',
      nodes: workflow.nodes || [],
      connections: workflow.connections || {},
      settings: workflow.settings || {},
      tags: ['AI-Generated', 'derrtaderr'],
      active: false, // Don't activate automatically
    };

    // Deploy to n8n instance
    const response = await fetch(`${n8nUrl}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': apiKey,
      },
      body: JSON.stringify(n8nWorkflow),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to deploy workflow';
      
      if (response.status === 401) {
        errorMessage = 'Invalid API key or unauthorized';
      } else if (response.status === 404) {
        errorMessage = 'n8n instance not found - check your URL';
      } else if (response.status === 400) {
        errorMessage = 'Invalid workflow data';
      }
      
      console.error('n8n API Error:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      workflowId: result.id,
      workflowUrl: `${n8nUrl}/workflow/${result.id}`,
      message: 'Workflow successfully deployed to n8n',
    });

  } catch (error) {
    console.error('Deploy to n8n error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
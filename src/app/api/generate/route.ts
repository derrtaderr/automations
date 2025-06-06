import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateWorkflow, WorkflowGenerationRequest } from '@/lib/claude';

// Request validation schema
const generateWorkflowSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters'),
  clarifications: z.array(z.string()).optional(),
  context: z.object({
    industry: z.string().optional(),
    tools: z.array(z.string()).optional(),
    complexity: z.enum(['simple', 'medium', 'complex']).optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = generateWorkflowSchema.parse(body);

    // Generate workflow using Claude
    const workflowRequest: WorkflowGenerationRequest = {
      description: validatedData.description,
      clarifications: validatedData.clarifications,
      context: validatedData.context,
    };

    const result = await generateWorkflow(workflowRequest);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 422 }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in /api/generate:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 
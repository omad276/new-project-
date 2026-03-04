import { NextRequest } from 'next/server';
import { AIAdvisorRequest } from '@/types';
import { streamAnalyzeRoutes, createAnthropicClient } from '@/lib/ai-advisor';

export async function POST(request: NextRequest) {
  try {
    const body: AIAdvisorRequest = await request.json();

    if (!body.routes || !body.input) {
      return new Response(JSON.stringify({ error: 'Missing routes or input' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if API key is configured
    const client = createAnthropicClient();
    if (!client) {
      return new Response(
        JSON.stringify({
          error: 'AI not configured',
          message: 'Please add your ANTHROPIC_API_KEY to .env.local',
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamAnalyzeRoutes(body.routes, body.input)) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(encoder.encode('\n\n[Error: AI analysis failed. Please try again.]'));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('AI Advisor error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate AI analysis' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

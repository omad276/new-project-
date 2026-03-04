import { NextRequest } from 'next/server';
import { AIAdvisorRequest } from '@/types';
import { streamAnalyzeRoutes, createAnthropicClient } from '@/lib/ai-advisor';
import { createClient } from '@/lib/supabase/server';
import { canUserAnalyze, recordAnalysis } from '@/lib/usage';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'Please sign in to use AI analysis',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check usage limits
    const canAnalyze = await canUserAnalyze(supabase, user.id);

    if (!canAnalyze) {
      return new Response(
        JSON.stringify({
          error: 'Limit exceeded',
          message: 'You have reached your monthly analysis limit. Upgrade to continue.',
          code: 'USAGE_LIMIT_EXCEEDED',
        }),
        {
          status: 402,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

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

    // Record the analysis (increment counter)
    await recordAnalysis(supabase, user.id);

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

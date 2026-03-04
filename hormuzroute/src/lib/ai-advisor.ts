import Anthropic from '@anthropic-ai/sdk';
import { CalculatedRoute, RouteInput, AIAnalysis } from '@/types';
import { formatCurrency } from './cost-calculator';
import { ORIGIN_PORTS, DESTINATION_PORTS } from './routes-data';

const SYSTEM_PROMPT = `You are an expert maritime logistics advisor specializing in Persian Gulf shipping routes and oil transport. You provide professional, actionable advice to shipping companies and logistics teams.

Your expertise includes:
- Persian Gulf shipping corridors (Strait of Hormuz, Petroline pipeline, Cape route)
- Geopolitical risk assessment (regional tensions, sanctions, piracy)
- Cost optimization for VLCC tanker operations
- Transit time vs cost trade-offs
- Insurance and risk management

When analyzing routes, consider:
1. Current geopolitical situation in the Persian Gulf
2. Strait of Hormuz chokepoint risks
3. Pipeline capacity and reliability
4. Weather patterns and seasonal factors
5. Insurance premium implications

Respond in a professional but accessible tone. Be specific with your recommendations.`;

function buildUserPrompt(routes: CalculatedRoute[], input: RouteInput): string {
  const originPort = ORIGIN_PORTS.find((p) => p.id === input.origin);
  const destPort = DESTINATION_PORTS.find((p) => p.id === input.destination);

  const routeDetails = routes
    .map(
      (r, i) => `
Route ${i + 1}: ${r.route.name}
- Total Cost: ${formatCurrency(r.costBreakdown.total)}
- Transit Time: ${r.totalDays} days
- Risk Level: ${r.route.riskLevel}
- Sea Days: ${r.route.seaDays}
- Land/Pipeline: ${r.route.landKm > 0 ? `${r.route.landKm} km` : 'None'}
- Requires Strait of Hormuz: ${r.route.requiresStrait ? 'Yes' : 'No'}
- Cost Breakdown: Sea ${formatCurrency(r.costBreakdown.seaCost)}, Land ${formatCurrency(r.costBreakdown.landCost)}, Insurance ${formatCurrency(r.costBreakdown.insurance)}`
    )
    .join('\n');

  return `Analyze these shipping route options for a client:

**Shipment Details:**
- Origin: ${originPort?.name}, ${originPort?.country}
- Destination: ${destPort?.name}, ${destPort?.country}
- Cargo: ${input.cargoType.toUpperCase()} (${input.tons.toLocaleString()} tons)
- Client Priority: ${input.priority.toUpperCase()}

**Available Routes:**
${routeDetails}

Please provide:
1. **Summary**: A brief 2-3 sentence overview of the best option given the client's priority
2. **Top Recommendation**: Which route and why (be specific)
3. **Route Analysis**: For each route, give pros/cons and a recommendation level (recommended/acceptable/not-recommended)
4. **Risk Assessment**: Current geopolitical and operational risks to consider
5. **Market Context**: Any relevant market conditions affecting this route
6. **Cost Optimization Tips**: 2-3 actionable suggestions to reduce costs

Format your response as clear sections with headers.`;
}

export function createAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    return null;
  }
  return new Anthropic({ apiKey });
}

export async function analyzeRoutes(
  routes: CalculatedRoute[],
  input: RouteInput
): Promise<AIAnalysis | null> {
  const client = createAnthropicClient();
  if (!client) {
    return null;
  }

  const userPrompt = buildUserPrompt(routes, input);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    return null;
  }

  return parseAIResponse(content.text, routes);
}

export async function* streamAnalyzeRoutes(
  routes: CalculatedRoute[],
  input: RouteInput
): AsyncGenerator<string, void, unknown> {
  const client = createAnthropicClient();
  if (!client) {
    yield 'AI analysis unavailable. Please configure your ANTHROPIC_API_KEY in .env.local';
    return;
  }

  const userPrompt = buildUserPrompt(routes, input);

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text;
    }
  }
}

function parseAIResponse(text: string, routes: CalculatedRoute[]): AIAnalysis {
  // Extract sections from the AI response
  const sections = {
    summary: '',
    topRecommendation: '',
    riskAssessment: '',
    marketContext: '',
    costOptimizationTips: [] as string[],
  };

  // Simple section extraction
  const summaryMatch = text.match(/\*\*Summary\*\*:?\s*([\s\S]*?)(?=\*\*|$)/i);
  if (summaryMatch) sections.summary = summaryMatch[1].trim();

  const recommendationMatch = text.match(/\*\*Top Recommendation\*\*:?\s*([\s\S]*?)(?=\*\*|$)/i);
  if (recommendationMatch) sections.topRecommendation = recommendationMatch[1].trim();

  const riskMatch = text.match(/\*\*Risk Assessment\*\*:?\s*([\s\S]*?)(?=\*\*|$)/i);
  if (riskMatch) sections.riskAssessment = riskMatch[1].trim();

  const marketMatch = text.match(/\*\*Market Context\*\*:?\s*([\s\S]*?)(?=\*\*|$)/i);
  if (marketMatch) sections.marketContext = marketMatch[1].trim();

  const tipsMatch = text.match(/\*\*Cost Optimization Tips\*\*:?\s*([\s\S]*?)(?=\*\*|$)/i);
  if (tipsMatch) {
    const tipsText = tipsMatch[1];
    const tips = tipsText.match(/[-•]\s*(.+)/g);
    if (tips) {
      sections.costOptimizationTips = tips.map((t) => t.replace(/^[-•]\s*/, '').trim());
    }
  }

  // Generate route insights based on ranking
  const routeInsights = routes.map((route, index) => ({
    routeId: route.route.id,
    recommendation:
      index === 0
        ? ('recommended' as const)
        : index === 1
          ? ('acceptable' as const)
          : ('not-recommended' as const),
    reasoning:
      index === 0
        ? 'Best match for your priority criteria'
        : `Ranked #${index + 1} based on overall score`,
    riskFactors:
      route.route.riskLevel === 'high'
        ? ['Geopolitical risk', 'Strait passage required']
        : route.route.riskLevel === 'medium'
          ? ['Moderate operational risks']
          : ['Low risk corridor'],
    advantages:
      route.route.landKm > 0
        ? ['Bypasses Strait of Hormuz', 'Lower insurance costs']
        : route.totalDays < 20
          ? ['Fast transit time', 'Direct route']
          : ['Avoids chokepoints', 'Reliable scheduling'],
  }));

  return {
    summary: sections.summary || 'Analysis complete.',
    topRecommendation: sections.topRecommendation || routes[0]?.route.name || 'See details',
    routeInsights,
    marketContext: sections.marketContext || 'Standard market conditions.',
    riskAssessment: sections.riskAssessment || 'Risk assessment based on route profiles.',
    costOptimizationTips:
      sections.costOptimizationTips.length > 0
        ? sections.costOptimizationTips
        : ['Consider flexible scheduling for better rates', 'Bundle shipments when possible'],
  };
}

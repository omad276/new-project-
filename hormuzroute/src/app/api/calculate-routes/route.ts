import { NextRequest, NextResponse } from 'next/server';
import { RouteInput, CalculateRoutesResponse } from '@/types';
import { calculateRoutes } from '@/lib/cost-calculator';

export async function POST(request: NextRequest) {
  try {
    const body: RouteInput = await request.json();

    // Validate required fields
    if (!body.origin || !body.destination || !body.cargoType || !body.tons || !body.priority) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate tons is a positive number
    if (body.tons <= 0) {
      return NextResponse.json({ error: 'Cargo volume must be positive' }, { status: 400 });
    }

    const routes = calculateRoutes(body);

    const response: CalculateRoutesResponse = {
      routes,
      input: body,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error calculating routes:', error);
    return NextResponse.json({ error: 'Failed to calculate routes' }, { status: 500 });
  }
}

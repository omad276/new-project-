import { RouteInput, CalculatedRoute, CostBreakdown, RouteBase, Priority } from '@/types';
import {
  ROUTE_BASE,
  SEA_DAYS_MATRIX,
  RISK_PREMIUMS,
  CARGO_VALUES_PER_TON,
  DAILY_VESSEL_COST,
  REFERENCE_VESSEL_CAPACITY,
  LAND_TRANSPORT_COST_PER_KM_TON,
  HORMUZ_BASE_COST,
} from './routes-data';

function calculateCostBreakdown(
  route: RouteBase,
  seaDays: number,
  tons: number,
  cargoType: string,
  cargoValueUSD?: number
): CostBreakdown {
  // Land cost: landKm * tons * cost per km per ton
  const landCost = route.landKm * tons * LAND_TRANSPORT_COST_PER_KM_TON;

  // Sea cost: seaDays * daily vessel cost * (tons / reference capacity)
  const capacityFactor = tons / REFERENCE_VESSEL_CAPACITY;
  const seaCost = seaDays * DAILY_VESSEL_COST * capacityFactor;

  // Insurance: cargo value * risk premium
  const cargoValue = cargoValueUSD ?? tons * (CARGO_VALUES_PER_TON[cargoType] || 600);
  const insurance = cargoValue * RISK_PREMIUMS[route.riskLevel];

  const total = landCost + seaCost + insurance;

  return {
    landCost: Math.round(landCost),
    seaCost: Math.round(seaCost),
    insurance: Math.round(insurance),
    total: Math.round(total),
  };
}

function calculateRiskScore(route: RouteBase): number {
  const riskScores = {
    low: 1,
    medium: 2,
    high: 3,
  };
  return riskScores[route.riskLevel];
}

function calculateOverallScore(
  costBreakdown: CostBreakdown,
  totalDays: number,
  riskScore: number,
  priority: Priority
): number {
  // Normalize values for scoring
  // Lower score is better
  const costNormalized = costBreakdown.total / 1_000_000; // Per million USD
  const daysNormalized = totalDays / 30; // Per 30 days
  const riskNormalized = riskScore / 3; // Scale 0-1

  // Weight based on priority
  const weights = {
    cost: { cost: 0.7, time: 0.2, risk: 0.1 },
    time: { cost: 0.2, time: 0.7, risk: 0.1 },
    safety: { cost: 0.2, time: 0.1, risk: 0.7 },
  };

  const w = weights[priority];

  return w.cost * costNormalized + w.time * daysNormalized + w.risk * riskNormalized;
}

export function calculateRoutes(input: RouteInput): CalculatedRoute[] {
  const results: CalculatedRoute[] = [];

  for (const [routeId, routeBase] of Object.entries(ROUTE_BASE)) {
    const seaDaysForRoute = SEA_DAYS_MATRIX[routeId]?.[input.origin]?.[input.destination];

    if (seaDaysForRoute === undefined) {
      continue; // Skip if no data for this route/origin/destination combo
    }

    const route: RouteBase = {
      ...routeBase,
      seaDays: seaDaysForRoute,
    };

    const costBreakdown = calculateCostBreakdown(
      route,
      seaDaysForRoute,
      input.tons,
      input.cargoType,
      input.cargoValueUSD
    );

    // Total days includes pipeline transit time estimate (1 day per 500km)
    const pipelineDays = Math.ceil(route.landKm / 500);
    const totalDays = seaDaysForRoute + pipelineDays;

    const riskScore = calculateRiskScore(route);

    const overallScore = calculateOverallScore(costBreakdown, totalDays, riskScore, input.priority);

    // Calculate percentage over Hormuz base cost (when strait is open)
    const baseCost = HORMUZ_BASE_COST[input.destination] || 1_000_000;
    const pctOverBase = Math.round(((costBreakdown.total - baseCost) / baseCost) * 100);

    results.push({
      route,
      costBreakdown,
      totalDays,
      riskScore,
      overallScore,
      pctOverBase,
    });
  }

  // Sort by overall score (lower is better)
  results.sort((a, b) => a.overallScore - b.overallScore);

  // Return top 3 routes
  return results.slice(0, 3);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount);
}
